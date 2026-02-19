/**
 * AUTO-RECONCILIATION RULES DATA MODEL
 * Phase B3: Deterministic, explainable matching rules
 * // GOVERNANCE_ENFORCEMENT — Rule lifecycle actions hit governance engine
 *
 * NOT ML. NOT scoring. Bank-grade deterministic first-match-wins.
 * Unmatched items route to existing Exception queue.
 * Rule execution is read-only — no money mutation.
 */

// ============================================
// 1. TYPES
// ============================================

export type MatchType =
  | "EXACT_AMOUNT"
  | "TOLERANCE_AMOUNT"
  | "REFERENCE_PATTERN"
  | "VIRTUAL_ACCOUNT"
  | "CLIENT_ID";

export type RuleStatus = "ENABLED" | "DISABLED";

export interface RuleConditions {
  /** Amount matching mode */
  amountMatch: "EXACT" | "TOLERANCE";
  /** Tolerance in %, only used when amountMatch = "TOLERANCE" */
  amountTolerancePct: number;
  /** Reference pattern — prefix match (e.g., "BP/" or "INV-") */
  referencePattern: string;
  /** Virtual Account ID filter (empty = any) */
  virtualAccountId: string;
  /** Client ID filter (empty = any) */
  clientId: string;
  /** Max days between bank transaction and expected receivable */
  dateWindowDays: number;
}

export interface AutoReconRule {
  id: string;
  name: string;
  matchType: MatchType;
  description: string;
  conditions: RuleConditions;
  /** Lower number = higher priority. First match wins. */
  priority: number;
  status: RuleStatus;
  /** Lifecycle actors */
  createdBy: string;
  createdByName: string;
  createdAt: string;
  modifiedBy?: string;
  modifiedByName?: string;
  modifiedAt?: string;
  /** Match statistics */
  matchStats: {
    appliedCount: number;
    failedCount: number;
    lastRunAt?: string;
  };
  /** Linked audit IDs */
  auditIds: string[];
}

// ============================================
// 2. INFLOWS (bank-side transactions to match)
// ============================================

export interface IncomingInflow {
  id: string;
  date: string;
  amount: number;
  reference: string;
  senderName: string;
  virtualAccountId?: string;
  clientId?: string;
  narration: string;
  matched: boolean;
  matchedByRuleId?: string;
}

export const INFLOWS: IncomingInflow[] = [
  {
    id: "inf_001",
    date: "2026-02-17",
    amount: 85000,
    reference: "BP/2026/044",
    senderName: "Rahman Textiles Ltd",
    virtualAccountId: "VAM-001",
    clientId: "CLT-001",
    narration: "Payment for Invoice BP/2026/044",
    matched: false,
  },
  {
    id: "inf_002",
    date: "2026-02-16",
    amount: 125000,
    reference: "INV-2026-002",
    senderName: "City Steel Industries",
    virtualAccountId: "VAM-002",
    clientId: "CLT-002",
    narration: "INV-2026-002 settlement",
    matched: false,
  },
  {
    id: "inf_003",
    date: "2026-02-15",
    amount: 44800,
    reference: "BP/2026/019",
    senderName: "Apex Trading Co",
    clientId: "CLT-005",
    narration: "Partial — BP/2026/019",
    matched: false,
  },
  {
    id: "inf_004",
    date: "2026-02-17",
    amount: 38000,
    reference: "BP/2026/031",
    senderName: "Tech Solutions BD",
    virtualAccountId: "VAM-003",
    clientId: "CLT-008",
    narration: "Weekly instalment BP/2026/031",
    matched: false,
  },
  {
    id: "inf_005",
    date: "2026-02-14",
    amount: 63500,
    reference: "",
    senderName: "Unknown Sender",
    narration: "Credit transfer — no reference",
    matched: false,
  },
  {
    id: "inf_006",
    date: "2026-02-13",
    amount: 55000,
    reference: "INV-2026-007",
    senderName: "Metro Pharma Distribution",
    virtualAccountId: "VAM-004",
    clientId: "CLT-007",
    narration: "INV-2026-007 — full settlement",
    matched: false,
  },
  {
    id: "inf_007",
    date: "2026-02-12",
    amount: 12500,
    reference: "BP/2026/008",
    senderName: "Karim General Store",
    clientId: "CLT-010",
    narration: "BP/2026/008 rice order",
    matched: false,
  },
  {
    id: "inf_008",
    date: "2026-02-11",
    amount: 320000,
    reference: "BP/2026/050",
    senderName: "Acme Corporation",
    virtualAccountId: "VAM-005",
    clientId: "CLT-001",
    narration: "Q1 raw materials — BP/2026/050",
    matched: false,
  },
];

// ============================================
// 3. EXPECTED RECEIVABLES (ledger-side)
// ============================================

export interface ExpectedReceivable {
  id: string;
  invoiceRef: string;
  clientId: string;
  clientName: string;
  virtualAccountId?: string;
  expectedAmount: number;
  dueDate: string;
  matched: boolean;
  matchedInflowId?: string;
}

export const EXPECTED_RECEIVABLES: ExpectedReceivable[] = [
  {
    id: "exp_001",
    invoiceRef: "BP/2026/044",
    clientId: "CLT-001",
    clientName: "Rahman Textiles Ltd",
    virtualAccountId: "VAM-001",
    expectedAmount: 85000,
    dueDate: "2026-02-18",
    matched: false,
  },
  {
    id: "exp_002",
    invoiceRef: "INV-2026-002",
    clientId: "CLT-002",
    clientName: "City Steel Industries",
    virtualAccountId: "VAM-002",
    expectedAmount: 125000,
    dueDate: "2026-02-20",
    matched: false,
  },
  {
    id: "exp_003",
    invoiceRef: "BP/2026/019",
    clientId: "CLT-005",
    clientName: "Apex Trading Co",
    expectedAmount: 45000,
    dueDate: "2026-02-16",
    matched: false,
  },
  {
    id: "exp_004",
    invoiceRef: "BP/2026/031",
    clientId: "CLT-008",
    clientName: "Tech Solutions BD",
    virtualAccountId: "VAM-003",
    expectedAmount: 38000,
    dueDate: "2026-02-18",
    matched: false,
  },
  {
    id: "exp_005",
    invoiceRef: "INV-2026-007",
    clientId: "CLT-007",
    clientName: "Metro Pharma Distribution",
    virtualAccountId: "VAM-004",
    expectedAmount: 55000,
    dueDate: "2026-02-15",
    matched: false,
  },
  {
    id: "exp_006",
    invoiceRef: "BP/2026/008",
    clientId: "CLT-010",
    clientName: "Karim General Store",
    expectedAmount: 12500,
    dueDate: "2026-02-14",
    matched: false,
  },
  {
    id: "exp_007",
    invoiceRef: "BP/2026/050",
    clientId: "CLT-001",
    clientName: "Acme Corporation",
    virtualAccountId: "VAM-005",
    expectedAmount: 320000,
    dueDate: "2026-02-25",
    matched: false,
  },
  {
    id: "exp_008",
    invoiceRef: "INV-2026-099",
    clientId: "CLT-012",
    clientName: "Delta Enterprises",
    expectedAmount: 75000,
    dueDate: "2026-02-20",
    matched: false,
  },
];

// ============================================
// 4. RULES — 6 deterministic rules
// ============================================

export const AUTO_RECON_RULES: AutoReconRule[] = [
  {
    id: "ar_001",
    name: "Exact Amount + Reference",
    matchType: "EXACT_AMOUNT",
    description:
      "Match when bank amount equals expected amount exactly AND reference matches invoice reference",
    conditions: {
      amountMatch: "EXACT",
      amountTolerancePct: 0,
      referencePattern: "",
      virtualAccountId: "",
      clientId: "",
      dateWindowDays: 7,
    },
    priority: 1,
    status: "ENABLED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-01-10T09:00:00Z",
    matchStats: {
      appliedCount: 147,
      failedCount: 3,
      lastRunAt: "2026-02-17T06:00:00Z",
    },
    auditIds: ["audit_ar_001a"],
  },
  {
    id: "ar_002",
    name: "Reference Pattern — BP/ Prefix",
    matchType: "REFERENCE_PATTERN",
    description:
      "Match inflows whose reference starts with 'BP/' to receivables with matching BP/ invoice reference",
    conditions: {
      amountMatch: "TOLERANCE",
      amountTolerancePct: 2,
      referencePattern: "BP/",
      virtualAccountId: "",
      clientId: "",
      dateWindowDays: 10,
    },
    priority: 2,
    status: "ENABLED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-01-10T09:15:00Z",
    matchStats: {
      appliedCount: 89,
      failedCount: 7,
      lastRunAt: "2026-02-17T06:00:00Z",
    },
    auditIds: ["audit_ar_002a"],
  },
  {
    id: "ar_003",
    name: "Virtual Account Auto-Tag",
    matchType: "VIRTUAL_ACCOUNT",
    description:
      "Match inflows to receivables by Virtual Account ID when both share the same VAM assignment",
    conditions: {
      amountMatch: "TOLERANCE",
      amountTolerancePct: 5,
      referencePattern: "",
      virtualAccountId: "",
      clientId: "",
      dateWindowDays: 14,
    },
    priority: 3,
    status: "ENABLED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-01-12T10:00:00Z",
    matchStats: {
      appliedCount: 63,
      failedCount: 4,
      lastRunAt: "2026-02-17T06:00:00Z",
    },
    auditIds: ["audit_ar_003a"],
  },
  {
    id: "ar_004",
    name: "Client ID Match",
    matchType: "CLIENT_ID",
    description:
      "Match inflows to receivables by Client ID with ±2% amount tolerance within 10-day window",
    conditions: {
      amountMatch: "TOLERANCE",
      amountTolerancePct: 2,
      referencePattern: "",
      virtualAccountId: "",
      clientId: "",
      dateWindowDays: 10,
    },
    priority: 4,
    status: "ENABLED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-01-15T14:00:00Z",
    matchStats: {
      appliedCount: 41,
      failedCount: 9,
      lastRunAt: "2026-02-17T06:00:00Z",
    },
    auditIds: ["audit_ar_004a"],
  },
  {
    id: "ar_005",
    name: "Reference Pattern — INV- Prefix",
    matchType: "REFERENCE_PATTERN",
    description:
      "Match inflows whose reference starts with 'INV-' to receivables with matching INV- invoice reference",
    conditions: {
      amountMatch: "TOLERANCE",
      amountTolerancePct: 1,
      referencePattern: "INV-",
      virtualAccountId: "",
      clientId: "",
      dateWindowDays: 7,
    },
    priority: 5,
    status: "ENABLED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-01-20T11:00:00Z",
    matchStats: {
      appliedCount: 34,
      failedCount: 2,
      lastRunAt: "2026-02-17T06:00:00Z",
    },
    auditIds: ["audit_ar_005a"],
  },
  {
    id: "ar_006",
    name: "Wide Tolerance Match",
    matchType: "TOLERANCE_AMOUNT",
    description:
      "Catch-all for remaining inflows: ±10% amount tolerance, 14-day window, requires reference",
    conditions: {
      amountMatch: "TOLERANCE",
      amountTolerancePct: 10,
      referencePattern: "",
      virtualAccountId: "",
      clientId: "",
      dateWindowDays: 14,
    },
    priority: 6,
    status: "DISABLED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-02-01T08:00:00Z",
    modifiedBy: "usr_002",
    modifiedByName: "Fatima Khan",
    modifiedAt: "2026-02-10T15:00:00Z",
    matchStats: {
      appliedCount: 0,
      failedCount: 0,
    },
    auditIds: ["audit_ar_006a", "audit_ar_006b"],
  },
];

// ============================================
// 5. MATCH RESULT TYPE
// ============================================

export interface MatchExplanation {
  /** Which condition was checked */
  condition: string;
  /** Whether it passed */
  passed: boolean;
  /** Human-readable detail */
  detail: string;
}

export interface MatchResult {
  inflowId: string;
  receivableId: string | null;
  ruleId: string | null;
  ruleName: string | null;
  matched: boolean;
  explanations: MatchExplanation[];
  auditId?: string;
}

// ============================================
// 6. DETERMINISTIC RULE EXECUTION ENGINE
// ============================================

function checkAmountMatch(
  inflowAmount: number,
  expectedAmount: number,
  mode: "EXACT" | "TOLERANCE",
  tolerancePct: number
): { passed: boolean; detail: string } {
  if (mode === "EXACT") {
    const passed = inflowAmount === expectedAmount;
    return {
      passed,
      detail: passed
        ? `Amount ৳${inflowAmount.toLocaleString("en-IN")} = ৳${expectedAmount.toLocaleString("en-IN")} (exact)`
        : `Amount ৳${inflowAmount.toLocaleString("en-IN")} ≠ ৳${expectedAmount.toLocaleString("en-IN")} (exact required)`,
    };
  }

  const diff = Math.abs(inflowAmount - expectedAmount);
  const pctDiff = (diff / expectedAmount) * 100;
  const passed = pctDiff <= tolerancePct;
  return {
    passed,
    detail: passed
      ? `Amount variance ${pctDiff.toFixed(1)}% within ±${tolerancePct}% tolerance (৳${inflowAmount.toLocaleString("en-IN")} vs ৳${expectedAmount.toLocaleString("en-IN")})`
      : `Amount variance ${pctDiff.toFixed(1)}% exceeds ±${tolerancePct}% tolerance (৳${inflowAmount.toLocaleString("en-IN")} vs ৳${expectedAmount.toLocaleString("en-IN")})`,
  };
}

function checkReferenceMatch(
  inflowRef: string,
  receivableRef: string,
  pattern: string
): { passed: boolean; detail: string } {
  // If pattern specified, check prefix first
  if (pattern && !inflowRef.startsWith(pattern)) {
    return {
      passed: false,
      detail: `Reference "${inflowRef}" does not start with pattern "${pattern}"`,
    };
  }

  // Direct reference comparison
  const passed = inflowRef === receivableRef;
  return {
    passed,
    detail: passed
      ? `Reference "${inflowRef}" matches receivable ref "${receivableRef}"`
      : `Reference "${inflowRef}" does not match receivable ref "${receivableRef}"`,
  };
}

function checkDateWindow(
  inflowDate: string,
  dueDate: string,
  windowDays: number
): { passed: boolean; detail: string } {
  const inflowMs = new Date(inflowDate).getTime();
  const dueMs = new Date(dueDate).getTime();
  const daysDiff = Math.abs(inflowMs - dueMs) / (1000 * 60 * 60 * 24);
  const passed = daysDiff <= windowDays;
  return {
    passed,
    detail: passed
      ? `Date gap ${Math.round(daysDiff)} days within ${windowDays}-day window`
      : `Date gap ${Math.round(daysDiff)} days exceeds ${windowDays}-day window`,
  };
}

function checkVirtualAccount(
  inflowVam: string | undefined,
  receivableVam: string | undefined
): { passed: boolean; detail: string } {
  if (!inflowVam || !receivableVam) {
    return {
      passed: false,
      detail: inflowVam
        ? "Receivable has no Virtual Account assigned"
        : "Inflow has no Virtual Account tag",
    };
  }
  const passed = inflowVam === receivableVam;
  return {
    passed,
    detail: passed
      ? `Virtual Account ${inflowVam} matches`
      : `Virtual Account ${inflowVam} ≠ ${receivableVam}`,
  };
}

function checkClientId(
  inflowClientId: string | undefined,
  receivableClientId: string
): { passed: boolean; detail: string } {
  if (!inflowClientId) {
    return {
      passed: false,
      detail: "Inflow has no Client ID",
    };
  }
  const passed = inflowClientId === receivableClientId;
  return {
    passed,
    detail: passed
      ? `Client ID ${inflowClientId} matches`
      : `Client ID ${inflowClientId} ≠ ${receivableClientId}`,
  };
}

/**
 * Try to match a single inflow against a single receivable using a specific rule.
 * Returns null if no match, or MatchResult with full explanation.
 */
function tryRuleMatch(
  inflow: IncomingInflow,
  receivable: ExpectedReceivable,
  rule: AutoReconRule
): MatchResult | null {
  const explanations: MatchExplanation[] = [];
  let allPassed = true;

  // 1. Amount check (always required)
  const amountResult = checkAmountMatch(
    inflow.amount,
    receivable.expectedAmount,
    rule.conditions.amountMatch,
    rule.conditions.amountTolerancePct
  );
  explanations.push({
    condition: "Amount",
    passed: amountResult.passed,
    detail: amountResult.detail,
  });
  if (!amountResult.passed) allPassed = false;

  // 2. Date window check (always required)
  const dateResult = checkDateWindow(
    inflow.date,
    receivable.dueDate,
    rule.conditions.dateWindowDays
  );
  explanations.push({
    condition: "Date Window",
    passed: dateResult.passed,
    detail: dateResult.detail,
  });
  if (!dateResult.passed) allPassed = false;

  // 3. Match-type-specific conditions
  switch (rule.matchType) {
    case "EXACT_AMOUNT": {
      // Requires reference match
      const refResult = checkReferenceMatch(
        inflow.reference,
        receivable.invoiceRef,
        ""
      );
      explanations.push({
        condition: "Reference",
        passed: refResult.passed,
        detail: refResult.detail,
      });
      if (!refResult.passed) allPassed = false;
      break;
    }

    case "REFERENCE_PATTERN": {
      const refResult = checkReferenceMatch(
        inflow.reference,
        receivable.invoiceRef,
        rule.conditions.referencePattern
      );
      explanations.push({
        condition: "Reference Pattern",
        passed: refResult.passed,
        detail: refResult.detail,
      });
      if (!refResult.passed) allPassed = false;
      break;
    }

    case "VIRTUAL_ACCOUNT": {
      const vamResult = checkVirtualAccount(
        inflow.virtualAccountId,
        receivable.virtualAccountId
      );
      explanations.push({
        condition: "Virtual Account",
        passed: vamResult.passed,
        detail: vamResult.detail,
      });
      if (!vamResult.passed) allPassed = false;
      break;
    }

    case "CLIENT_ID": {
      const clientResult = checkClientId(
        inflow.clientId,
        receivable.clientId
      );
      explanations.push({
        condition: "Client ID",
        passed: clientResult.passed,
        detail: clientResult.detail,
      });
      if (!clientResult.passed) allPassed = false;
      break;
    }

    case "TOLERANCE_AMOUNT": {
      // Requires non-empty reference
      if (!inflow.reference) {
        explanations.push({
          condition: "Reference Present",
          passed: false,
          detail: "Inflow has no reference — rule requires reference",
        });
        allPassed = false;
      } else {
        explanations.push({
          condition: "Reference Present",
          passed: true,
          detail: `Reference "${inflow.reference}" is present`,
        });
      }
      break;
    }
  }

  if (!allPassed) return null;

  return {
    inflowId: inflow.id,
    receivableId: receivable.id,
    ruleId: rule.id,
    ruleName: rule.name,
    matched: true,
    explanations,
  };
}

/**
 * DETERMINISTIC FIRST-MATCH-WINS RULE EXECUTION
 *
 * For each unmatched inflow:
 *   Iterate enabled rules in priority order (ascending).
 *   For each rule, try all unmatched receivables.
 *   First successful match wins — inflow and receivable are consumed.
 *   No transaction is matched twice.
 */
export function executeRules(
  inflows: IncomingInflow[],
  receivables: ExpectedReceivable[],
  rules: AutoReconRule[]
): {
  results: MatchResult[];
  unmatchedInflows: IncomingInflow[];
  unmatchedReceivables: ExpectedReceivable[];
} {
  const enabledRules = rules
    .filter((r) => r.status === "ENABLED")
    .sort((a, b) => a.priority - b.priority);

  const matchedInflowIds = new Set<string>();
  const matchedReceivableIds = new Set<string>();
  const results: MatchResult[] = [];

  for (const inflow of inflows) {
    if (inflow.matched || matchedInflowIds.has(inflow.id)) continue;

    let foundMatch = false;

    for (const rule of enabledRules) {
      if (foundMatch) break;

      for (const receivable of receivables) {
        if (receivable.matched || matchedReceivableIds.has(receivable.id)) continue;

        const result = tryRuleMatch(inflow, receivable, rule);
        if (result) {
          matchedInflowIds.add(inflow.id);
          matchedReceivableIds.add(receivable.id);
          results.push(result);
          foundMatch = true;
          break;
        }
      }
    }

    // If no rule matched, add as unmatched result
    if (!foundMatch) {
      results.push({
        inflowId: inflow.id,
        receivableId: null,
        ruleId: null,
        ruleName: null,
        matched: false,
        explanations: [
          {
            condition: "All Rules",
            passed: false,
            detail: "No enabled rule matched this inflow — routed to Exception queue",
          },
        ],
      });
    }
  }

  const unmatchedInflows = inflows.filter(
    (inf) => !matchedInflowIds.has(inf.id) && !inf.matched
  );
  const unmatchedReceivables = receivables.filter(
    (rec) => !matchedReceivableIds.has(rec.id) && !rec.matched
  );

  return { results, unmatchedInflows, unmatchedReceivables };
}

// ============================================
// 7. UTILITY FUNCTIONS
// ============================================

export function getEnabledRules(): AutoReconRule[] {
  return AUTO_RECON_RULES.filter((r) => r.status === "ENABLED").sort(
    (a, b) => a.priority - b.priority
  );
}

export function getDisabledRules(): AutoReconRule[] {
  return AUTO_RECON_RULES.filter((r) => r.status === "DISABLED");
}

export function getRuleById(id: string): AutoReconRule | undefined {
  return AUTO_RECON_RULES.find((r) => r.id === id);
}

export function getTotalApplied(): number {
  return AUTO_RECON_RULES.reduce(
    (sum, r) => sum + r.matchStats.appliedCount,
    0
  );
}

export function getTotalFailed(): number {
  return AUTO_RECON_RULES.reduce(
    (sum, r) => sum + r.matchStats.failedCount,
    0
  );
}

export function getMatchTypeLabel(matchType: MatchType): string {
  const map: Record<MatchType, string> = {
    EXACT_AMOUNT: "Exact Amount",
    TOLERANCE_AMOUNT: "Tolerance",
    REFERENCE_PATTERN: "Reference",
    VIRTUAL_ACCOUNT: "Virtual Account",
    CLIENT_ID: "Client ID",
  };
  return map[matchType];
}

export function getMatchTypeBadge(matchType: MatchType): {
  bg: string;
  text: string;
  border: string;
} {
  const map: Record<
    MatchType,
    { bg: string; text: string; border: string }
  > = {
    EXACT_AMOUNT: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    },
    TOLERANCE_AMOUNT: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
    },
    REFERENCE_PATTERN: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
    },
    VIRTUAL_ACCOUNT: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/30",
    },
    CLIENT_ID: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/30",
    },
  };
  return map[matchType];
}

export function getStatusConfig(status: RuleStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  return status === "ENABLED"
    ? {
        label: "Enabled",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
      }
    : {
        label: "Disabled",
        bg: "bg-white/5",
        text: "text-white/40",
        border: "border-white/10",
      };
}

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}