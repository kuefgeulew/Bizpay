/**
 * IDEMPOTENCY & CONCURRENCY ENGINE — PHASE D
 * Deterministic key generation, dedup registry, resolution locking,
 * terminal state enforcement, and audit schema validation.
 *
 * // GOVERNANCE_ENFORCEMENT — D1/D2: Race-safety primitives
 */

// ============================================
// D1-1: IDEMPOTENCY KEY GENERATION
// ============================================

const BUCKET_MS = 10_000; // 10-second dedup window

/**
 * Generates a deterministic idempotency key per intent.
 * Same entity + action within the same 10s bucket → same key.
 */
export function generateIdempotencyKey(params: {
  entityType: string;
  entityId: string;
  action: string;
}): string {
  const bucket = Math.floor(Date.now() / BUCKET_MS);
  return `idem_${params.entityType}_${params.entityId}_${params.action}_${bucket}`;
}

// ============================================
// D1-1: IDEMPOTENCY REGISTRY
// ============================================

const _seenKeys = new Set<string>();

/**
 * Atomically checks whether a key has been seen before,
 * and registers it if it hasn't.
 * Returns { isDuplicate: true } if the key was already registered.
 */
export function checkAndRegisterKey(key: string): { isDuplicate: boolean } {
  if (_seenKeys.has(key)) {
    return { isDuplicate: true };
  }
  _seenKeys.add(key);
  return { isDuplicate: false };
}

/**
 * Clears a specific key from the registry.
 * Used only in edge cases (e.g., retry after a genuine failure).
 */
export function clearIdempotencyKey(key: string): void {
  _seenKeys.delete(key);
}

// ============================================
// D1-2 / D2-3: APPROVAL RESOLUTION LOCK
// ============================================

const _inFlightResolutions = new Set<string>();

/**
 * Acquires an exclusive lock for resolving a specific approval.
 * Returns false if another resolution is already in flight.
 */
export function acquireResolutionLock(approvalId: string): boolean {
  if (_inFlightResolutions.has(approvalId)) {
    return false;
  }
  _inFlightResolutions.add(approvalId);
  return true;
}

/**
 * Releases the resolution lock after processing completes.
 */
export function releaseResolutionLock(approvalId: string): void {
  _inFlightResolutions.delete(approvalId);
}

// ============================================
// D1-2: TERMINAL STATE ENFORCEMENT
// ============================================

const TERMINAL_STATES = new Set(["approved", "rejected", "cancelled"]);

/**
 * Returns true if the given status is a terminal (irreversible) state.
 */
export function isTerminalState(status: string): boolean {
  return TERMINAL_STATES.has(status);
}

// ============================================
// D3-5: AUDIT SCHEMA VALIDATION
// ============================================

export interface AuditSchemaEntry {
  eventId: string;
  timestamp: string;
  actor: { userId: string; role: string };
  action: string;
  entityType: string;
  entityId: string;
  outcome: string;
  idempotencyKey: string;
  isImmutable: true;
}

/**
 * Validates an audit entry against the required schema.
 * Returns { valid: true } or { valid: false, reason: string }.
 * If invalid, the calling execution MUST fail — no silent success.
 */
export function validateAuditSchema(entry: Partial<AuditSchemaEntry>): {
  valid: boolean;
  reason?: string;
} {
  const requiredFields: (keyof AuditSchemaEntry)[] = [
    "eventId",
    "timestamp",
    "actor",
    "action",
    "entityType",
    "entityId",
    "outcome",
    "idempotencyKey",
    "isImmutable",
  ];

  for (const field of requiredFields) {
    if (entry[field] === undefined || entry[field] === null) {
      return {
        valid: false,
        reason: `Missing required audit field: ${field}`,
      };
    }
  }

  if (!entry.actor?.userId || !entry.actor?.role) {
    return {
      valid: false,
      reason: "Audit actor must include userId and role",
    };
  }

  if (entry.isImmutable !== true) {
    return {
      valid: false,
      reason: "Audit entry must be marked as immutable",
    };
  }

  if (!entry.timestamp || isNaN(Date.parse(entry.timestamp))) {
    return {
      valid: false,
      reason: "Audit timestamp must be a valid ISO string",
    };
  }

  return { valid: true };
}
