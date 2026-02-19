/**
 * GOVERNANCE ENFORCEMENT ENGINE
 * Phase A: Binds Admin rules into execution flows
 * Phase D: Idempotency, concurrency safety, audit integrity
 * // GOVERNANCE_ENFORCEMENT — Central authority for all enforcement decisions
 *
 * A1: Transaction Execution Gate
 * A2: Approval Workflow Binding
 * A3: Beneficiary Governance Enforcement
 * A4: Service Request Risk Binding
 * A5: Audit Log Finalization
 * D1: Idempotency Keys & Terminal State Guards
 * D2: Concurrency & Race Safety
 * D3: Audit Schema Validation & Cross-Surface Correlation
 */

import { getCurrentUser, type AppUser } from "../mock/users";
import { createActivityLog, type ActivityAction } from "../mock/activityLogs";
import {
  createApproval,
  getApprovalById,
  type MockApproval,
  type BeneficiaryMutationType,
  type ServiceRequestType,
  SERVICE_REQUEST_CLASSIFICATIONS,
} from "../mock/approvals";
import {
  FEATURE_PERMISSIONS,
  ADMIN_TRANSACTION_LIMITS,
  APPROVAL_RULES,
  AUDIT_EVENTS,
  type FeatureArea,
  type AccessLevel,
  type TransactionCategory,
  type AuditEvent,
  type AuditEventType,
} from "../data/adminGovernance";
import type { RoleType } from "../data/userManagement";
// GOVERNANCE_ENFORCEMENT — A5: Import Enhanced Activity Log store for dual-write
import {
  ACTIVITY_LOG,
  type ActivityLogEntry,
  type ActivityAction as EnhancedActivityAction,
  type ActivitySeverity as EnhancedActivitySeverity,
  type ActivityCategory as EnhancedActivityCategory,
} from "../data/activityLog";
// GOVERNANCE_ENFORCEMENT — D1/D2/D3: Import idempotency primitives
import {
  generateIdempotencyKey,
  checkAndRegisterKey,
  acquireResolutionLock,
  releaseResolutionLock,
  isTerminalState,
  validateAuditSchema,
  type AuditSchemaEntry,
} from "./idempotency";

// ============================================
// 1. ENFORCEMENT RESULT TYPES
// ============================================

export type EnforcementOutcome = "ALLOWED" | "BLOCKED" | "APPROVAL_REQUIRED";

export interface EnforcementResult {
  outcome: EnforcementOutcome;
  reason: string;
  ruleTriggered?: string;
  auditId: string;
  details: {
    actor: string;
    actorRole: RoleType;
    action: string;
    timestamp: string;
  };
}

// ============================================
// 2. SESSION-SCOPED DAILY USAGE TRACKER
// ============================================

interface DailyUsage {
  date: string;
  byCategory: Record<string, number>;
}

let _dailyUsage: DailyUsage = {
  date: new Date().toISOString().slice(0, 10),
  byCategory: {},
};

function getDailyUsage(category: TransactionCategory): number {
  const today = new Date().toISOString().slice(0, 10);
  if (_dailyUsage.date !== today) {
    _dailyUsage = { date: today, byCategory: {} };
  }
  return _dailyUsage.byCategory[category] || 0;
}

function recordDailyUsage(category: TransactionCategory, amount: number): void {
  const today = new Date().toISOString().slice(0, 10);
  if (_dailyUsage.date !== today) {
    _dailyUsage = { date: today, byCategory: {} };
  }
  _dailyUsage.byCategory[category] =
    (_dailyUsage.byCategory[category] || 0) + amount;
}

// ============================================
// 3. AUDIT EMITTER (A5)
// ============================================
// // GOVERNANCE_ENFORCEMENT — Immutable, append-only

function emitGovernanceAudit(params: {
  eventType: AuditEventType;
  severity: AuditEvent["severity"];
  actor: AppUser;
  description: string;
  details: Record<string, any>;
}): string {
  const auditId = `audit_enf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  // Emit to Admin → Audit (AUDIT_EVENTS)
  const auditEvent: AuditEvent = {
    id: auditId,
    timestamp: new Date().toISOString(),
    eventType: params.eventType,
    severity: params.severity,
    actorId: params.actor.id,
    actorName: params.actor.name,
    actorRole: params.actor.role as RoleType,
    description: params.description,
    details: { ...params.details, enforcementTag: "GOVERNANCE_ENFORCEMENT" },
    isImmutable: true,
  };
  AUDIT_EVENTS.push(auditEvent);

  // Emit to Activity Log
  const actionMap: Record<AuditEventType, ActivityAction> = {
    APPROVAL_LOG: "APPROVAL_SUBMITTED",
    OVERRIDE_LOG: "RECONCILIATION_OVERRIDE",
    LOCK_BREACH: "TRANSACTION_REJECTED",
    ROLE_VIOLATION: "TRANSACTION_REJECTED",
    LIMIT_BREACH: "TRANSACTION_REJECTED",
    SESSION_ANOMALY: "LOGIN",
    BENEFICIARY_CHANGE: "BENEFICIARY_ADDED",
    SYSTEM_CONFIG_CHANGE: "SETTINGS_UPDATED",
  };

  createActivityLog(
    params.actor.id,
    params.actor.name,
    params.actor.role,
    actionMap[params.eventType] || "TRANSACTION_REJECTED",
    params.description,
    { ...params.details, auditId, enforcementTag: "GOVERNANCE_ENFORCEMENT" },
    params.severity === "CRITICAL" || params.severity === "HIGH"
      ? "CRITICAL"
      : params.severity === "WARNING"
      ? "WARNING"
      : "INFO"
  );

  // GOVERNANCE_ENFORCEMENT — A5: Dual-write to Enhanced Activity Log
  const enhancedActionMap: Record<AuditEventType, EnhancedActivityAction> = {
    APPROVAL_LOG: "TRANSACTION_SUBMIT",
    OVERRIDE_LOG: "RECONCILIATION_OVERRIDE",
    LOCK_BREACH: "ROLE_VIOLATION_BLOCKED",
    ROLE_VIOLATION: "ROLE_VIOLATION_BLOCKED",
    LIMIT_BREACH: "LIMIT_BREACH_ATTEMPT",
    SESSION_ANOMALY: "SESSION_TIMEOUT",
    BENEFICIARY_CHANGE: "BENEFICIARY_ADD",
    SYSTEM_CONFIG_CHANGE: "USER_EDIT",
  };

  const enhancedSeverityMap: Record<AuditEvent["severity"], EnhancedActivitySeverity> =
    {
      CRITICAL: "CRITICAL",
      HIGH: "HIGH",
      WARNING: "WARNING",
      INFO: "INFO",
    };

  const enhancedCategoryMap: Record<AuditEventType, EnhancedActivityCategory> = {
    APPROVAL_LOG: "APPROVAL",
    OVERRIDE_LOG: "RECONCILIATION",
    LOCK_BREACH: "SECURITY",
    ROLE_VIOLATION: "SECURITY",
    LIMIT_BREACH: "SECURITY",
    SESSION_ANOMALY: "AUTHENTICATION",
    BENEFICIARY_CHANGE: "TRANSACTION",
    SYSTEM_CONFIG_CHANGE: "USER_MANAGEMENT",
  };

  const enhancedLogEntry: ActivityLogEntry = {
    id: auditId,
    timestamp: new Date().toISOString(),
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action: enhancedActionMap[params.eventType] || "ROLE_VIOLATION_BLOCKED",
    category: enhancedCategoryMap[params.eventType] || "SECURITY",
    severity: enhancedSeverityMap[params.severity],
    description: params.description,
    // D3-6: Cross-surface correlation — idempotencyKey propagated as correlationId
    correlationId: params.details.idempotencyKey || params.details.correlationKey || auditId,
    metadata: { ...params.details, auditId, enforcementTag: "GOVERNANCE_ENFORCEMENT" },
    ipAddress: "192.168.1.105",
    reasonCode: "GOVERNANCE_ENFORCEMENT",
    isImmutable: true,
  };
  ACTIVITY_LOG.push(enhancedLogEntry);

  return auditId;
}

// ============================================
// 4. ROLE PERMISSION CHECK
// ============================================
// // GOVERNANCE_ENFORCEMENT — Checks FEATURE_PERMISSIONS matrix

function checkRolePermission(
  role: RoleType,
  featureArea: FeatureArea,
  requiredLevel: AccessLevel
): { allowed: boolean; reason: string } {
  const featurePerm = FEATURE_PERMISSIONS.find(
    (fp) => fp.featureArea === featureArea
  );
  if (!featurePerm) {
    return { allowed: false, reason: `Feature area ${featureArea} not configured` };
  }

  const roleAccess = featurePerm.accessByRole[role];
  if (!roleAccess || roleAccess.includes("NONE")) {
    return {
      allowed: false,
      reason: `${role} role has no access to ${featurePerm.label}`,
    };
  }

  if (!roleAccess.includes(requiredLevel)) {
    return {
      allowed: false,
      reason: `${role} role cannot ${requiredLevel.toLowerCase()} in ${featurePerm.label}`,
    };
  }

  return { allowed: true, reason: "" };
}

// ============================================
// 5. TRANSACTION LIMIT CHECK
// ============================================
// // GOVERNANCE_ENFORCEMENT — Checks ADMIN_TRANSACTION_LIMITS

function checkTransactionLimit(
  role: RoleType,
  category: TransactionCategory,
  amount: number
): {
  allowed: boolean;
  reason: string;
  perTransactionLimit: number;
  dailyLimit: number;
  dailyUsed: number;
} {
  const limit = ADMIN_TRANSACTION_LIMITS.find(
    (l) => l.role === role && l.category === category
  );

  if (!limit) {
    // No limit configured = no cap (approver/admin for some categories)
    return {
      allowed: true,
      reason: "",
      perTransactionLimit: Infinity,
      dailyLimit: Infinity,
      dailyUsed: 0,
    };
  }

  // Per-transaction limit
  if (limit.perTransaction > 0 && amount > limit.perTransaction) {
    return {
      allowed: false,
      reason: `Amount BDT ${amount.toLocaleString()} exceeds per-transaction limit of BDT ${limit.perTransaction.toLocaleString()}`,
      perTransactionLimit: limit.perTransaction,
      dailyLimit: limit.daily,
      dailyUsed: getDailyUsage(category),
    };
  }

  // Daily cap
  const dailyUsed = getDailyUsage(category);
  if (limit.daily > 0 && dailyUsed + amount > limit.daily) {
    return {
      allowed: false,
      reason: `Daily cap breach: BDT ${(dailyUsed + amount).toLocaleString()} would exceed daily limit of BDT ${limit.daily.toLocaleString()}`,
      perTransactionLimit: limit.perTransaction,
      dailyLimit: limit.daily,
      dailyUsed,
    };
  }

  return {
    allowed: true,
    reason: "",
    perTransactionLimit: limit.perTransaction,
    dailyLimit: limit.daily,
    dailyUsed,
  };
}

// ============================================
// 6. APPROVAL REQUIREMENT CHECK
// ============================================
// // GOVERNANCE_ENFORCEMENT — Checks APPROVAL_RULES

function checkApprovalRequired(
  category: TransactionCategory,
  amount: number,
  isBeneficiaryNew: boolean = false
): { required: boolean; ruleName: string; slaHours: number } {
  // Check amount threshold rules
  const amountRules = APPROVAL_RULES.filter(
    (r) => r.trigger === "AMOUNT_THRESHOLD" && r.isActive
  ).sort((a, b) => a.priority - b.priority);

  for (const rule of amountRules) {
    // Parse threshold from condition string
    const match = rule.condition.match(/[\d,]+/);
    if (match) {
      const threshold = parseInt(match[0].replace(/,/g, ""), 10);
      if (amount > threshold) {
        return { required: true, ruleName: rule.name, slaHours: rule.slaHours };
      }
    }
  }

  // Check transaction type rules
  const typeMap: Partial<Record<TransactionCategory, string>> = {
    DIRECT_DEBIT: "Direct debit",
    BULK_PAYMENT: "Bulk payment",
  };
  if (typeMap[category]) {
    const typeRule = APPROVAL_RULES.find(
      (r) =>
        r.trigger === "TRANSACTION_TYPE" &&
        r.isActive &&
        r.condition.toLowerCase().includes(typeMap[category]!.toLowerCase())
    );
    if (typeRule) {
      return {
        required: true,
        ruleName: typeRule.name,
        slaHours: typeRule.slaHours,
      };
    }
  }

  // Check new beneficiary rule
  if (isBeneficiaryNew) {
    const benRule = APPROVAL_RULES.find(
      (r) => r.trigger === "BENEFICIARY_NEW" && r.isActive
    );
    if (benRule) {
      return {
        required: true,
        ruleName: benRule.name,
        slaHours: benRule.slaHours,
      };
    }
  }

  return { required: false, ruleName: "", slaHours: 0 };
}

// ============================================
// A1: TRANSACTION EXECUTION GATE
// ============================================
// // GOVERNANCE_ENFORCEMENT — Master gate for all money-moving flows

export function enforceTransactionGate(params: {
  amount: number;
  category: TransactionCategory;
  description?: string;
}): EnforcementResult {
  const user = getCurrentUser();
  const now = new Date().toISOString();

  const baseDetails = {
    actor: user.name,
    actorRole: user.role as RoleType,
    action: `TRANSACTION_${params.category}`,
    timestamp: now,
  };

  // Step 1: Role permission check
  const roleCheck = checkRolePermission(
    user.role as RoleType,
    "PAYMENTS",
    "INITIATE"
  );
  if (!roleCheck.allowed) {
    // // GOVERNANCE_ENFORCEMENT — Role violation hard stop
    const auditId = emitGovernanceAudit({
      eventType: "ROLE_VIOLATION",
      severity: "CRITICAL",
      actor: user,
      description: `${user.role} attempted to initiate ${params.category} transaction — blocked by role guard`,
      details: {
        category: params.category,
        amount: params.amount,
        violation: "ROLE_PERMISSION",
      },
    });
    return {
      outcome: "BLOCKED",
      reason: roleCheck.reason,
      ruleTriggered: "Role Permission Matrix",
      auditId,
      details: baseDetails,
    };
  }

  // Step 2: Transaction limit check
  const limitCheck = checkTransactionLimit(
    user.role as RoleType,
    params.category,
    params.amount
  );
  if (!limitCheck.allowed) {
    // // GOVERNANCE_ENFORCEMENT — Limit breach hard stop
    const auditId = emitGovernanceAudit({
      eventType: "LIMIT_BREACH",
      severity: "HIGH",
      actor: user,
      description: `Limit breach: ${limitCheck.reason} — auto-blocked`,
      details: {
        category: params.category,
        amount: params.amount,
        perTransactionLimit: limitCheck.perTransactionLimit,
        dailyLimit: limitCheck.dailyLimit,
        dailyUsed: limitCheck.dailyUsed,
      },
    });
    return {
      outcome: "BLOCKED",
      reason: limitCheck.reason,
      ruleTriggered: "Transaction Limit Engine",
      auditId,
      details: baseDetails,
    };
  }

  // Step 3: Approval requirement check
  const approvalCheck = checkApprovalRequired(params.category, params.amount);
  if (approvalCheck.required) {
    // // GOVERNANCE_ENFORCEMENT — Route to Approval Queue
    const auditId = emitGovernanceAudit({
      eventType: "APPROVAL_LOG",
      severity: "INFO",
      actor: user,
      description: `Transaction routed to Approval Queue — rule "${approvalCheck.ruleName}" triggered (SLA: ${approvalCheck.slaHours}h)`,
      details: {
        category: params.category,
        amount: params.amount,
        rule: approvalCheck.ruleName,
        slaHours: approvalCheck.slaHours,
      },
    });

    // Record usage (pending)
    recordDailyUsage(params.category, params.amount);

    return {
      outcome: "APPROVAL_REQUIRED",
      reason: `Rule "${approvalCheck.ruleName}" requires approval (SLA: ${approvalCheck.slaHours}h)`,
      ruleTriggered: approvalCheck.ruleName,
      auditId,
      details: baseDetails,
    };
  }

  // Step 4: Allowed — record usage
  recordDailyUsage(params.category, params.amount);

  const auditId = emitGovernanceAudit({
    eventType: "APPROVAL_LOG",
    severity: "INFO",
    actor: user,
    description: `Transaction ${params.category} for BDT ${params.amount.toLocaleString()} executed — all governance checks passed`,
    details: {
      category: params.category,
      amount: params.amount,
      outcome: "ALLOWED",
    },
  });

  return {
    outcome: "ALLOWED",
    reason: "All governance checks passed",
    auditId,
    details: baseDetails,
  };
}

// ============================================
// A3: BENEFICIARY GOVERNANCE GATE
// ============================================
// // GOVERNANCE_ENFORCEMENT — Beneficiary lifecycle enforcement

export type BeneficiaryAction = "ADD" | "EDIT" | "DELETE" | "ACTIVATE" | "DEACTIVATE";

export function enforceBeneficiaryGate(params: {
  action: BeneficiaryAction;
  beneficiaryType: "BRAC" | "OTHER_BANK" | "POSITIVE_PAY";
  beneficiaryName?: string;
  beneficiaryId?: string;
}): EnforcementResult {
  const user = getCurrentUser();
  const now = new Date().toISOString();

  const baseDetails = {
    actor: user.name,
    actorRole: user.role as RoleType,
    action: `BENEFICIARY_${params.action}`,
    timestamp: now,
  };

  const role = user.role as RoleType;

  // ── STEP 1: Hard BLOCK for view-only roles ──
  // Viewer, Checker, Approver have no INITIATE or MODIFY — blocked on ALL mutations
  const featurePerm = FEATURE_PERMISSIONS.find(
    (fp) => fp.featureArea === "BENEFICIARIES"
  );
  const roleAccess = featurePerm?.accessByRole[role] || [];
  const hasInitiate = roleAccess.includes("INITIATE");
  const hasModify = roleAccess.includes("MODIFY");

  if (!hasInitiate && !hasModify) {
    // // GOVERNANCE_ENFORCEMENT — Role violation: no mutation access
    const auditId = emitGovernanceAudit({
      eventType: "ROLE_VIOLATION",
      severity: "HIGH",
      actor: user,
      description: `${role} attempted to ${params.action.toLowerCase()} beneficiary "${params.beneficiaryName || "unknown"}" — blocked by role guard (no INITIATE or MODIFY)`,
      details: {
        action: params.action,
        beneficiaryType: params.beneficiaryType,
        beneficiaryName: params.beneficiaryName,
        beneficiaryId: params.beneficiaryId,
      },
    });
    return {
      outcome: "BLOCKED",
      reason: `${role} role has no mutation access to Beneficiary Management`,
      ruleTriggered: "Beneficiary Permission Matrix",
      auditId,
      details: baseDetails,
    };
  }

  // ── STEP 2: ADD action ──
  if (params.action === "ADD") {
    // ADD requires INITIATE
    if (!hasInitiate) {
      const auditId = emitGovernanceAudit({
        eventType: "ROLE_VIOLATION",
        severity: "HIGH",
        actor: user,
        description: `${role} attempted to add beneficiary "${params.beneficiaryName || "unknown"}" — blocked (no INITIATE)`,
        details: {
          action: "ADD",
          beneficiaryType: params.beneficiaryType,
          beneficiaryName: params.beneficiaryName,
        },
      });
      return {
        outcome: "BLOCKED",
        reason: `${role} role cannot initiate beneficiary additions`,
        ruleTriggered: "Beneficiary Permission Matrix",
        auditId,
        details: baseDetails,
      };
    }
    // Has INITIATE — route to approval with cooling
    const approvalCheck = checkApprovalRequired("OWN_ACCOUNT", 0, true);
    const coolingHours = approvalCheck.slaHours || 24;
    const auditId = emitGovernanceAudit({
      eventType: "BENEFICIARY_CHANGE",
      severity: "WARNING",
      actor: user,
      description: `New beneficiary "${params.beneficiaryName || "unknown"}" (${params.beneficiaryType}) submitted for approval — ${coolingHours}h cooling period enforced`,
      details: {
        action: "ADD",
        beneficiaryType: params.beneficiaryType,
        beneficiaryName: params.beneficiaryName,
        rule: approvalCheck.ruleName || "Beneficiary Addition Policy",
        coolingPeriodHours: coolingHours,
      },
    });
    return {
      outcome: "APPROVAL_REQUIRED",
      reason: `New beneficiary requires approval — ${coolingHours}h cooling period enforced`,
      ruleTriggered: approvalCheck.ruleName || "Beneficiary Addition Policy",
      auditId,
      details: baseDetails,
    };
  }

  // ── STEP 3: EDIT action ──
  if (params.action === "EDIT") {
    // EDIT always requires approval + cooling, even for admin
    const coolingHours = 24;
    const auditId = emitGovernanceAudit({
      eventType: "BENEFICIARY_CHANGE",
      severity: "WARNING",
      actor: user,
      description: `Beneficiary edit for "${params.beneficiaryName || "unknown"}" — routed to Approval Queue with ${coolingHours}h cooling period`,
      details: {
        action: "EDIT",
        beneficiaryType: params.beneficiaryType,
        beneficiaryName: params.beneficiaryName,
        beneficiaryId: params.beneficiaryId,
        coolingPeriodHours: coolingHours,
        initiatedBy: role,
      },
    });
    return {
      outcome: "APPROVAL_REQUIRED",
      reason: `Beneficiary detail changes require re-approval — ${coolingHours}h cooling period enforced`,
      ruleTriggered: "Beneficiary Edit Governance Policy",
      auditId,
      details: baseDetails,
    };
  }

  // ── STEP 4: DELETE / ACTIVATE / DEACTIVATE ──
  // Admin with MODIFY → ALLOWED
  // Maker with INITIATE but no MODIFY → APPROVAL_REQUIRED
  if (hasModify) {
    // Admin path — allowed for DELETE / ACTIVATE / DEACTIVATE
    const auditId = emitGovernanceAudit({
      eventType: "BENEFICIARY_CHANGE",
      severity: "INFO",
      actor: user,
      description: `Beneficiary ${params.action.toLowerCase()} for "${params.beneficiaryName || "unknown"}" — governance checks passed (${role} with MODIFY access)`,
      details: {
        action: params.action,
        beneficiaryType: params.beneficiaryType,
        beneficiaryName: params.beneficiaryName,
        beneficiaryId: params.beneficiaryId,
        outcome: "ALLOWED",
      },
    });
    return {
      outcome: "ALLOWED",
      reason: `Beneficiary ${params.action.toLowerCase()} authorized`,
      auditId,
      details: baseDetails,
    };
  }

  // Has INITIATE but not MODIFY — route to approval (no cooling for status changes)
  const auditId = emitGovernanceAudit({
    eventType: "BENEFICIARY_CHANGE",
    severity: "WARNING",
    actor: user,
    description: `Beneficiary ${params.action.toLowerCase()} for "${params.beneficiaryName || "unknown"}" — routed to Approval Queue by ${role}`,
    details: {
      action: params.action,
      beneficiaryType: params.beneficiaryType,
      beneficiaryName: params.beneficiaryName,
      beneficiaryId: params.beneficiaryId,
      initiatedBy: role,
    },
  });
  return {
    outcome: "APPROVAL_REQUIRED",
    reason: `Beneficiary ${params.action.toLowerCase()} requires approver authorization`,
    ruleTriggered: "Beneficiary Governance Policy",
    auditId,
    details: baseDetails,
  };
}

// ============================================
// A3b: BENEFICIARY MUTATION → APPROVAL QUEUE BINDING
// ============================================
// // GOVERNANCE_ENFORCEMENT — Creates approval item for beneficiary mutations

export interface BeneficiaryMutationPayload {
  beneficiaryId: string;
  mutationType: BeneficiaryMutationType;
  beneficiaryName: string;
  beneficiaryType: "BRAC" | "OTHER_BANK" | "POSITIVE_PAY";
  proposedChanges?: Record<string, { from: string; to: string }>;
  coolingPeriodHours?: number;
}

export function createBeneficiaryMutationApproval(
  payload: BeneficiaryMutationPayload
): string {
  const user = getCurrentUser();

  // D1-1: Idempotency guard — prevent duplicate approval creation
  const idemKey = generateIdempotencyKey({
    entityType: "beneficiary_mutation",
    entityId: payload.beneficiaryId,
    action: payload.mutationType,
  });
  const idemCheck = checkAndRegisterKey(idemKey);
  if (idemCheck.isDuplicate) {
    emitGovernanceAudit({
      eventType: "APPROVAL_LOG",
      severity: "WARNING",
      actor: user,
      description: `Duplicate beneficiary mutation approval blocked — ${payload.mutationType} for "${payload.beneficiaryName}" — idempotencyKey: ${idemKey}`,
      details: {
        beneficiaryId: payload.beneficiaryId,
        mutationType: payload.mutationType,
        idempotencyKey: idemKey,
        outcome: "DUPLICATE_BLOCKED",
      },
    });
    return "";
  }

  const mutationLabels: Record<BeneficiaryMutationType, string> = {
    ADD: "Add Beneficiary",
    EDIT: "Edit Beneficiary Details",
    DELETE: "Delete Beneficiary",
    ACTIVATE: "Reactivate Beneficiary",
    DEACTIVATE: "Deactivate Beneficiary",
  };

  const priorityMap: Record<BeneficiaryMutationType, "low" | "medium" | "high" | "urgent"> = {
    ADD: "medium",
    EDIT: "high",
    DELETE: "high",
    ACTIVATE: "medium",
    DEACTIVATE: "medium",
  };

  const subTypeMap: Record<string, string> = {
    BRAC: "BRAC Bank Beneficiary",
    OTHER_BANK: "Other Bank Beneficiary",
    POSITIVE_PAY: "Positive Pay Beneficiary",
  };

  const approval = createApproval({
    type: "beneficiary_mutation",
    subType: `${mutationLabels[payload.mutationType]} — ${subTypeMap[payload.beneficiaryType] || payload.beneficiaryType}`,
    title: `${mutationLabels[payload.mutationType]}: ${payload.beneficiaryName}`,
    description: `Beneficiary ${payload.mutationType.toLowerCase()} initiated by ${user.name} (${user.role})`,
    status: "pending",
    priority: priorityMap[payload.mutationType],
    submittedBy: user.id,
    submittedByName: user.name,
    metadata: {
      beneficiaryId: payload.beneficiaryId,
      mutationType: payload.mutationType,
      beneficiaryName: payload.beneficiaryName,
      beneficiaryType: payload.beneficiaryType,
      proposedChanges: payload.proposedChanges || null,
      coolingPeriodHours: payload.coolingPeriodHours || null,
      initiatedByUserId: user.id,
      initiatedByName: user.name,
      initiatedByRole: user.role,
      idempotencyKey: idemKey,
    },
    requiresReAuth: payload.mutationType === "DELETE",
    idempotencyKey: idemKey,
  });

  // // GOVERNANCE_ENFORCEMENT — Audit trail for approval creation
  emitGovernanceAudit({
    eventType: "APPROVAL_LOG",
    severity: "INFO",
    actor: user,
    description: `Beneficiary mutation approval created: ${mutationLabels[payload.mutationType]} for "${payload.beneficiaryName}" — queued as ${approval.id}`,
    details: {
      approvalId: approval.id,
      mutationType: payload.mutationType,
      beneficiaryId: payload.beneficiaryId,
      beneficiaryName: payload.beneficiaryName,
    },
  });

  return approval.id;
}

// ============================================
// A4: SERVICE REQUEST RISK GATE
// ============================================
// // GOVERNANCE_ENFORCEMENT — Service request risk enforcement

export function enforceServiceRequestGate(params: {
  serviceType: "SOFTWARE_TOKEN" | "CHEQUEBOOK" | "POSITIVE_PAY" | "STOP_CHEQUE" | "DISPUTE_REQUEST" | "SUPPORT_TICKET" | "OTHER";
  actionLabel: string;
}): EnforcementResult {
  const user = getCurrentUser();
  const now = new Date().toISOString();

  const baseDetails = {
    actor: user.name,
    actorRole: user.role as RoleType,
    action: `SERVICE_REQUEST_${params.serviceType}`,
    timestamp: now,
  };

  // Role permission check
  const roleCheck = checkRolePermission(
    user.role as RoleType,
    "SERVICE_REQUESTS",
    "INITIATE"
  );

  // Roles with APPROVE access can execute service requests directly (admin, approver)
  const hasApproveAccess = checkRolePermission(
    user.role as RoleType,
    "SERVICE_REQUESTS",
    "APPROVE"
  );

  if (!roleCheck.allowed && !hasApproveAccess.allowed) {
    // // GOVERNANCE_ENFORCEMENT — Service request role violation
    const auditId = emitGovernanceAudit({
      eventType: "ROLE_VIOLATION",
      severity: "HIGH",
      actor: user,
      description: `${user.role} attempted service request "${params.actionLabel}" — blocked by role guard`,
      details: {
        serviceType: params.serviceType,
        actionLabel: params.actionLabel,
      },
    });
    return {
      outcome: "BLOCKED",
      reason: roleCheck.reason,
      ruleTriggered: "Service Request Permission Matrix",
      auditId,
      details: baseDetails,
    };
  }

  // Roles with APPROVE bypass approval routing — direct execution
  if (hasApproveAccess.allowed) {
    const auditId = emitGovernanceAudit({
      eventType: "APPROVAL_LOG",
      severity: "INFO",
      actor: user,
      description: `Service request "${params.actionLabel}" executed directly by ${user.role} — APPROVE access bypass`,
      details: {
        serviceType: params.serviceType,
        actionLabel: params.actionLabel,
        outcome: "ALLOWED",
        bypassReason: "APPROVE_ACCESS",
      },
    });
    return {
      outcome: "ALLOWED",
      reason: "Service request authorized — direct execution",
      auditId,
      details: baseDetails,
    };
  }

  // High-risk services require approval — check classification model
  const classification = SERVICE_REQUEST_CLASSIFICATIONS[params.serviceType];
  if (classification && classification.requiresApproval) {
    const serviceRule = APPROVAL_RULES.find(
      (r) => r.trigger === "SERVICE_REQUEST" && r.isActive
    );
    if (serviceRule) {
      const auditId = emitGovernanceAudit({
        eventType: "APPROVAL_LOG",
        severity: "WARNING",
        actor: user,
        description: `Service request "${params.actionLabel}" (${params.serviceType}) routed to Approval Queue — rule "${serviceRule.name}" triggered`,
        details: {
          serviceType: params.serviceType,
          actionLabel: params.actionLabel,
          rule: serviceRule.name,
          slaHours: serviceRule.slaHours,
          riskLevel: classification.riskLevel,
        },
      });
      return {
        outcome: "APPROVAL_REQUIRED",
        reason: `High-risk service request requires approver authorization (SLA: ${serviceRule.slaHours}h)`,
        ruleTriggered: serviceRule.name,
        auditId,
        details: baseDetails,
      };
    }
  }

  // Allowed — log submission
  const auditId = emitGovernanceAudit({
    eventType: "APPROVAL_LOG",
    severity: "INFO",
    actor: user,
    description: `Service request "${params.actionLabel}" submitted — governance checks passed`,
    details: {
      serviceType: params.serviceType,
      actionLabel: params.actionLabel,
      outcome: "ALLOWED",
    },
  });

  return {
    outcome: "ALLOWED",
    reason: "Service request governance checks passed",
    auditId,
    details: baseDetails,
  };
}

// ============================================
// A4b: SERVICE REQUEST → APPROVAL QUEUE BINDING
// ============================================
// // GOVERNANCE_ENFORCEMENT — Creates approval item for service request mutations

export interface ServiceRequestApprovalPayload {
  serviceType: ServiceRequestType;
  actionLabel: string;
  requestParams?: Record<string, any>;
}

export function createServiceRequestApproval(
  payload: ServiceRequestApprovalPayload
): string {
  const user = getCurrentUser();
  const classification = SERVICE_REQUEST_CLASSIFICATIONS[payload.serviceType];

  // D1-1: Idempotency guard — prevent duplicate service request approval creation
  const idemKey = generateIdempotencyKey({
    entityType: "service_request",
    entityId: `${payload.serviceType}_${payload.actionLabel}`,
    action: "CREATE",
  });
  const idemCheck = checkAndRegisterKey(idemKey);
  if (idemCheck.isDuplicate) {
    emitGovernanceAudit({
      eventType: "APPROVAL_LOG",
      severity: "WARNING",
      actor: user,
      description: `Duplicate service request approval blocked — "${payload.actionLabel}" (${payload.serviceType}) — idempotencyKey: ${idemKey}`,
      details: {
        serviceType: payload.serviceType,
        actionLabel: payload.actionLabel,
        idempotencyKey: idemKey,
        outcome: "DUPLICATE_BLOCKED",
      },
    });
    return "";
  }

  const serviceLabels: Record<ServiceRequestType, string> = {
    SOFTWARE_TOKEN: "Software Token",
    CHEQUEBOOK: "Chequebook",
    POSITIVE_PAY: "Positive Pay",
    STOP_CHEQUE: "Stop Cheque",
    DISPUTE_REQUEST: "Dispute Request",
    SUPPORT_TICKET: "Support Ticket",
    OTHER: "Service Request",
  };

  const priorityMap: Record<string, "low" | "medium" | "high" | "urgent"> = {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
  };

  const approval = createApproval({
    type: "service_request",
    subType: `${serviceLabels[payload.serviceType]} — ${payload.actionLabel}`,
    title: `${payload.actionLabel}: ${serviceLabels[payload.serviceType]}`,
    description: `Service request initiated by ${user.name} (${user.role})`,
    status: "pending",
    priority: priorityMap[classification.riskLevel] || "medium",
    submittedBy: user.id,
    submittedByName: user.name,
    metadata: {
      serviceType: payload.serviceType,
      actionLabel: payload.actionLabel,
      riskLevel: classification.riskLevel,
      requestParams: payload.requestParams || null,
      initiatedByUserId: user.id,
      initiatedByName: user.name,
      initiatedByRole: user.role,
      executionStatus: "PENDING_APPROVAL",
      idempotencyKey: idemKey,
    },
    requiresReAuth: payload.serviceType === "SOFTWARE_TOKEN",
    idempotencyKey: idemKey,
  });

  // // GOVERNANCE_ENFORCEMENT — Audit trail for service request approval creation
  emitGovernanceAudit({
    eventType: "APPROVAL_LOG",
    severity: "INFO",
    actor: user,
    description: `Service request approval created: "${payload.actionLabel}" (${payload.serviceType}) — queued as ${approval.id}`,
    details: {
      approvalId: approval.id,
      serviceType: payload.serviceType,
      actionLabel: payload.actionLabel,
      riskLevel: classification.riskLevel,
    },
  });

  return approval.id;
}

// ============================================
// A2: APPROVAL WORKFLOW ENFORCEMENT
// ============================================
// // GOVERNANCE_ENFORCEMENT — Approval queue binding

export function enforceApprovalAction(params: {
  action: "APPROVE" | "REJECT" | "SEND_BACK";
  itemAmount?: number;
}): EnforcementResult {
  const user = getCurrentUser();
  const now = new Date().toISOString();

  const baseDetails = {
    actor: user.name,
    actorRole: user.role as RoleType,
    action: `APPROVAL_${params.action}`,
    timestamp: now,
  };

  // Only checkers and approvers can perform approval actions
  const requiredLevel: AccessLevel = "APPROVE";
  const roleCheck = checkRolePermission(
    user.role as RoleType,
    "APPROVALS",
    requiredLevel
  );

  if (!roleCheck.allowed) {
    const auditId = emitGovernanceAudit({
      eventType: "ROLE_VIOLATION",
      severity: "CRITICAL",
      actor: user,
      description: `${user.role} attempted to ${params.action.toLowerCase()} approval item — blocked by role guard`,
      details: {
        action: params.action,
        itemAmount: params.itemAmount,
      },
    });
    return {
      outcome: "BLOCKED",
      reason: `${user.role} role cannot ${params.action.toLowerCase()} approval items`,
      ruleTriggered: "Approval Permission Matrix",
      auditId,
      details: baseDetails,
    };
  }

  // If approver tries to approve above their limit
  if (
    params.action === "APPROVE" &&
    params.itemAmount &&
    user.limits?.singleTransaction
  ) {
    if (params.itemAmount > user.limits.singleTransaction) {
      const auditId = emitGovernanceAudit({
        eventType: "LIMIT_BREACH",
        severity: "HIGH",
        actor: user,
        description: `Approver limit breach: item BDT ${params.itemAmount.toLocaleString()} exceeds authorization limit — blocked`,
        details: {
          action: params.action,
          itemAmount: params.itemAmount,
          approverLimit: user.limits.singleTransaction,
        },
      });
      return {
        outcome: "BLOCKED",
        reason: `Item amount exceeds your authorization limit of BDT ${user.limits.singleTransaction.toLocaleString()}`,
        ruleTriggered: "Approver Authorization Limit",
        auditId,
        details: baseDetails,
      };
    }
  }

  const auditId = emitGovernanceAudit({
    eventType: "APPROVAL_LOG",
    severity: "INFO",
    actor: user,
    description: `Approval ${params.action.toLowerCase()} executed — governance checks passed`,
    details: {
      action: params.action,
      itemAmount: params.itemAmount,
      outcome: "ALLOWED",
    },
  });

  return {
    outcome: "ALLOWED",
    reason: "Approval action authorized",
    auditId,
    details: baseDetails,
  };
}

// ============================================
// D1: IDEMPOTENT APPROVAL CREATION GUARD
// ============================================
// // GOVERNANCE_ENFORCEMENT — Prevents duplicate approval creation

export function idempotentCreateApproval(
  entityType: string,
  entityId: string,
  action: string,
  createFn: () => string
): { approvalId: string; isDuplicate: boolean } {
  const key = generateIdempotencyKey({ entityType, entityId, action });
  const check = checkAndRegisterKey(key);

  if (check.isDuplicate) {
    const user = getCurrentUser();
    emitGovernanceAudit({
      eventType: "APPROVAL_LOG",
      severity: "WARNING",
      actor: user,
      description: `Duplicate approval creation attempt blocked — idempotencyKey: ${key}`,
      details: {
        entityType,
        entityId,
        action,
        idempotencyKey: key,
        outcome: "DUPLICATE_BLOCKED",
      },
    });
    return { approvalId: "", isDuplicate: true };
  }

  const approvalId = createFn();

  // Stamp the approval with the idempotency key
  const approval = getApprovalById(approvalId);
  if (approval) {
    approval.idempotencyKey = key;
    approval.metadata.idempotencyKey = key;
  }

  return { approvalId, isDuplicate: false };
}

// ============================================
// D2-3: ATOMIC APPROVAL RESOLUTION
// ============================================
// // GOVERNANCE_ENFORCEMENT — Single-execution guarantee for approval resolution

export type ResolutionAction = "APPROVE" | "REJECT" | "SEND_BACK";

export interface AtomicResolutionResult {
  success: boolean;
  blocked: boolean;
  reason: string;
  idempotencyKey: string;
}

export function resolveApprovalOnce(
  approvalId: string,
  action: ResolutionAction,
  executeFn: () => { success: boolean; message: string }
): AtomicResolutionResult {
  const user = getCurrentUser();
  const approval = getApprovalById(approvalId);
  const key = generateIdempotencyKey({
    entityType: "approval_resolution",
    entityId: approvalId,
    action,
  });

  // D1-2: Terminal state guard
  if (approval && isTerminalState(approval.status)) {
    emitGovernanceAudit({
      eventType: "APPROVAL_LOG",
      severity: "WARNING",
      actor: user,
      description: `Duplicate resolution attempt on ${approvalId} (already ${approval.status}) — blocked`,
      details: {
        approvalId,
        action,
        currentStatus: approval.status,
        idempotencyKey: key,
        outcome: "DUPLICATE_RESOLUTION_ATTEMPT",
      },
    });
    return {
      success: false,
      blocked: true,
      reason: `Approval already in terminal state: ${approval.status}`,
      idempotencyKey: key,
    };
  }

  // D1-1: Idempotency key check
  const idempCheck = checkAndRegisterKey(key);
  if (idempCheck.isDuplicate) {
    emitGovernanceAudit({
      eventType: "APPROVAL_LOG",
      severity: "WARNING",
      actor: user,
      description: `Duplicate resolution key detected for ${approvalId} — action: ${action} — NO-OP`,
      details: {
        approvalId,
        action,
        idempotencyKey: key,
        outcome: "IDEMPOTENCY_BLOCKED",
      },
    });
    return {
      success: false,
      blocked: true,
      reason: "Duplicate resolution attempt blocked by idempotency key",
      idempotencyKey: key,
    };
  }

  // D2-3: Acquire exclusive resolution lock
  const lockAcquired = acquireResolutionLock(approvalId);
  if (!lockAcquired) {
    emitGovernanceAudit({
      eventType: "APPROVAL_LOG",
      severity: "HIGH",
      actor: user,
      description: `Concurrent resolution attempt on ${approvalId} — lock contention blocked`,
      details: {
        approvalId,
        action,
        idempotencyKey: key,
        outcome: "LOCK_CONTENTION",
      },
    });
    return {
      success: false,
      blocked: true,
      reason: "Another resolution is already in progress for this approval",
      idempotencyKey: key,
    };
  }

  // D2-4: Execution re-check at commit time
  if (approval) {
    const reCheckResult = reCheckGovernanceAtCommit(approval, user);
    if (!reCheckResult.allowed) {
      releaseResolutionLock(approvalId);
      emitGovernanceAudit({
        eventType: "ROLE_VIOLATION",
        severity: "HIGH",
        actor: user,
        description: `Execution re-check failed for ${approvalId}: ${reCheckResult.reason}`,
        details: {
          approvalId,
          action,
          idempotencyKey: key,
          reCheckFailure: reCheckResult.reason,
          outcome: "RECHECK_BLOCKED",
        },
      });
      return {
        success: false,
        blocked: true,
        reason: reCheckResult.reason,
        idempotencyKey: key,
      };
    }
  }

  try {
    // Execute the resolution
    const result = executeFn();

    // Stamp idempotency key on resolved approval
    if (approval) {
      approval.metadata.resolutionIdempotencyKey = key;
      approval.metadata.resolvedAction = action;
      approval.metadata.resolvedBy = user.name;
      approval.metadata.resolvedByRole = user.role;
    }

    // D3-5: Validated audit write
    const auditEntry: AuditSchemaEntry = {
      eventId: `audit_res_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: { userId: user.id, role: user.role },
      action: `APPROVAL_${action}`,
      entityType: approval?.type || "approval",
      entityId: approvalId,
      outcome: result.success ? action : "FAILED",
      idempotencyKey: key,
      isImmutable: true,
    };

    const validation = validateAuditSchema(auditEntry);
    if (!validation.valid) {
      releaseResolutionLock(approvalId);
      return {
        success: false,
        blocked: true,
        reason: `Audit schema validation failed: ${validation.reason}`,
        idempotencyKey: key,
      };
    }

    // D3-6: Cross-surface correlated audit emission
    emitGovernanceAudit({
      eventType: "APPROVAL_LOG",
      severity: "INFO",
      actor: user,
      description: `Approval ${approvalId} resolved: ${action} — idempotencyKey: ${key}`,
      details: {
        approvalId,
        action,
        idempotencyKey: key,
        resolutionResult: result.success ? "SUCCESS" : "FAILED",
        correlationKey: key,
      },
    });

    return {
      success: result.success,
      blocked: false,
      reason: result.message,
      idempotencyKey: key,
    };
  } finally {
    // Always release the lock
    releaseResolutionLock(approvalId);
  }
}

// ============================================
// D2-4: EXECUTION RE-CHECK AT COMMIT TIME
// ============================================
// // GOVERNANCE_ENFORCEMENT — Re-validates governance state before applying effects

function reCheckGovernanceAtCommit(
  approval: MockApproval,
  currentUser: AppUser
): { allowed: boolean; reason: string } {
  // Verify the current user still has APPROVE access
  const roleCheck = checkRolePermission(
    currentUser.role as RoleType,
    "APPROVALS",
    "APPROVE"
  );

  if (!roleCheck.allowed) {
    return {
      allowed: false,
      reason: `Role change detected: ${currentUser.role} no longer has APPROVE access — execution blocked at commit time`,
    };
  }

  // Self-approval check (re-verify at commit)
  if (approval.submittedBy === currentUser.id) {
    return {
      allowed: false,
      reason: "Self-approval detected at commit time — separation of duties enforced",
    };
  }

  // Amount re-check for monetary approvals
  if (
    approval.amount &&
    currentUser.limits?.singleTransaction &&
    approval.amount > currentUser.limits.singleTransaction
  ) {
    return {
      allowed: false,
      reason: `Approver limit changed: item BDT ${approval.amount.toLocaleString()} now exceeds authorization limit — execution blocked at commit time`,
    };
  }

  return { allowed: true, reason: "" };
}