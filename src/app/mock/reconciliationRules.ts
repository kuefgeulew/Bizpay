// Auto-Reconciliation Rules Engine — Data
// Rules engine for automated transaction matching and reconciliation

export type RuleCategory = "exact" | "reference" | "split" | "tolerance" | "manual";
export type MatchOutcome = "auto-match" | "needs-approval" | "exception";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface ReconciliationRule {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  enabled: boolean;
  priority: number;
  matchCriteria: {
    amountTolerance?: number; // in percentage
    dateWindow?: number; // in days
    requireReference: boolean;
    requireClient: boolean;
  };
  confidenceThresholds: {
    autoMatch: number; // ≥ this % auto-matches
    needsApproval: number; // between this and autoMatch
    exception: number; // < this goes to exception
  };
  outcome: MatchOutcome;
  stats: {
    appliedCount: number;
    successRate: number;
  };
}

export interface MockBankTransaction {
  id: string;
  date: string;
  amount: number;
  reference: string;
  clientName?: string;
  narration: string;
  status: "matched" | "unmatched" | "pending";
}

export interface MockLedgerEntry {
  id: string;
  date: string;
  amount: number;
  reference: string;
  clientName?: string;
  invoiceNo?: string;
  status: "matched" | "unmatched" | "pending";
}

export interface MatchSimulation {
  bankTxn: MockBankTransaction;
  ledgerEntry: MockLedgerEntry;
  matchedRule?: ReconciliationRule;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  outcome: MatchOutcome;
  reason: string;
  explainability: {
    amountMatch: boolean;
    referenceMatch: boolean;
    dateMatch: boolean;
    clientMatch: boolean;
  };
}

// Mock Rules
export const RECON_RULES: ReconciliationRule[] = [
  {
    id: "RULE-001",
    name: "Exact Amount & Reference Match",
    category: "exact",
    description: "Auto-match when amount and reference are identical within 1 day",
    enabled: true,
    priority: 1,
    matchCriteria: {
      amountTolerance: 0,
      dateWindow: 1,
      requireReference: true,
      requireClient: false,
    },
    confidenceThresholds: {
      autoMatch: 95,
      needsApproval: 80,
      exception: 80,
    },
    outcome: "auto-match",
    stats: {
      appliedCount: 147,
      successRate: 98.5,
    },
  },
  {
    id: "RULE-002",
    name: "Invoice Reference Match",
    category: "reference",
    description: "Match based on invoice number in reference, with ±2% amount tolerance",
    enabled: true,
    priority: 2,
    matchCriteria: {
      amountTolerance: 2,
      dateWindow: 3,
      requireReference: true,
      requireClient: false,
    },
    confidenceThresholds: {
      autoMatch: 90,
      needsApproval: 75,
      exception: 75,
    },
    outcome: "auto-match",
    stats: {
      appliedCount: 89,
      successRate: 94.2,
    },
  },
  {
    id: "RULE-003",
    name: "Client Name + Date Match",
    category: "reference",
    description: "Match by client name and date within 5 days, tolerance ±5%",
    enabled: true,
    priority: 3,
    matchCriteria: {
      amountTolerance: 5,
      dateWindow: 5,
      requireReference: false,
      requireClient: true,
    },
    confidenceThresholds: {
      autoMatch: 85,
      needsApproval: 70,
      exception: 70,
    },
    outcome: "needs-approval",
    stats: {
      appliedCount: 63,
      successRate: 87.3,
    },
  },
  {
    id: "RULE-004",
    name: "Partial Payment Matching",
    category: "split",
    description: "Detect partial payments where bank amount < ledger entry by ≤50%",
    enabled: true,
    priority: 4,
    matchCriteria: {
      amountTolerance: 50,
      dateWindow: 7,
      requireReference: true,
      requireClient: false,
    },
    confidenceThresholds: {
      autoMatch: 0, // Never auto-match partials
      needsApproval: 80,
      exception: 80,
    },
    outcome: "needs-approval",
    stats: {
      appliedCount: 34,
      successRate: 91.2,
    },
  },
  {
    id: "RULE-005",
    name: "Tolerance-Based Match",
    category: "tolerance",
    description: "Allow ±10% amount variance if reference and date align within 2 days",
    enabled: true,
    priority: 5,
    matchCriteria: {
      amountTolerance: 10,
      dateWindow: 2,
      requireReference: true,
      requireClient: false,
    },
    confidenceThresholds: {
      autoMatch: 80,
      needsApproval: 65,
      exception: 65,
    },
    outcome: "needs-approval",
    stats: {
      appliedCount: 28,
      successRate: 78.6,
    },
  },
  {
    id: "RULE-006",
    name: "Large Amount Manual Override",
    category: "manual",
    description: "Transactions > ৳50,000 always require manual review",
    enabled: true,
    priority: 6,
    matchCriteria: {
      amountTolerance: 0,
      dateWindow: 1,
      requireReference: true,
      requireClient: false,
    },
    confidenceThresholds: {
      autoMatch: 0, // Never auto
      needsApproval: 100,
      exception: 0,
    },
    outcome: "needs-approval",
    stats: {
      appliedCount: 19,
      successRate: 100,
    },
  },
  {
    id: "RULE-007",
    name: "No Reference Exception",
    category: "manual",
    description: "Bank transactions with no reference always go to exception queue",
    enabled: true,
    priority: 7,
    matchCriteria: {
      amountTolerance: 0,
      dateWindow: 0,
      requireReference: true,
      requireClient: false,
    },
    confidenceThresholds: {
      autoMatch: 0,
      needsApproval: 0,
      exception: 100,
    },
    outcome: "exception",
    stats: {
      appliedCount: 12,
      successRate: 0, // All go to exception
    },
  },
  {
    id: "RULE-008",
    name: "Large Value Tolerance Match",
    category: "tolerance",
    description: "Match high-value transactions with ±15% variance for bank charges and processing fees",
    enabled: false, // Disabled for now
    priority: 8,
    matchCriteria: {
      amountTolerance: 15,
      dateWindow: 3,
      requireReference: true,
      requireClient: false,
    },
    confidenceThresholds: {
      autoMatch: 85,
      needsApproval: 70,
      exception: 70,
    },
    outcome: "needs-approval",
    stats: {
      appliedCount: 0,
      successRate: 0,
    },
  },
];

// Mock Bank Transactions
export const RECON_BANK_TXNS: MockBankTransaction[] = [
  {
    id: "BNK-001",
    date: "2025-02-16",
    amount: 12500,
    reference: "BP/2025/001",
    clientName: "Karim General Store",
    narration: "Payment for Rice - BP/2025/001",
    status: "matched",
  },
  {
    id: "BNK-002",
    date: "2025-02-15",
    amount: 28000,
    reference: "INV-HSN-002",
    clientName: "Hasan Departmental Store",
    narration: "Cooking Oil Payment",
    status: "unmatched",
  },
  {
    id: "BNK-003",
    date: "2025-02-14",
    amount: 20000,
    reference: "BP/2025/003",
    clientName: "Rahman Trading",
    narration: "Partial Payment - Sugar",
    status: "pending",
  },
  {
    id: "BNK-004",
    date: "2025-02-17",
    amount: 15000,
    reference: "BP/2025/005",
    clientName: "Mina Grocery",
    narration: "Milk Powder - Full Payment",
    status: "matched",
  },
  {
    id: "BNK-005",
    date: "2025-02-13",
    amount: 8500,
    reference: "BP/2025/004",
    clientName: "Karim General Store",
    narration: "Lentils Order",
    status: "unmatched",
  },
  {
    id: "BNK-006",
    date: "2025-02-12",
    amount: 65000,
    reference: "",
    narration: "Large Deposit - No Reference",
    status: "unmatched",
  },
  {
    id: "BNK-007",
    date: "2025-02-11",
    amount: 9600,
    reference: "BP/2025/012",
    clientName: "Hasan Departmental Store",
    narration: "Biscuits Payment",
    status: "matched",
  },
  {
    id: "BNK-008",
    date: "2025-02-10",
    amount: 3000,
    reference: "BP/2025/007",
    clientName: "Hasan Departmental Store",
    narration: "Tea - Partial Payment",
    status: "pending",
  },
  {
    id: "BNK-009",
    date: "2025-02-09",
    amount: 22500,
    reference: "BP/2025/010",
    clientName: "Alam Wholesale",
    narration: "Salt Order - Slight Variance",
    status: "pending",
  },
  {
    id: "BNK-010",
    date: "2025-02-08",
    amount: 8000,
    reference: "BP/2025/011",
    clientName: "Karim General Store",
    narration: "Potatoes - Partial",
    status: "pending",
  },
];

// Mock Ledger Entries
export const RECON_LEDGER_ENTRIES: MockLedgerEntry[] = [
  {
    id: "LDG-001",
    date: "2025-02-10",
    amount: 12500,
    reference: "BP/2025/001",
    clientName: "Karim General Store",
    invoiceNo: "BP/2025/001",
    status: "matched",
  },
  {
    id: "LDG-002",
    date: "2025-01-28",
    amount: 28000,
    reference: "BP/2025/002",
    clientName: "Hasan Departmental Store",
    invoiceNo: "BP/2025/002",
    status: "unmatched",
  },
  {
    id: "LDG-003",
    date: "2024-12-20",
    amount: 65000,
    reference: "BP/2025/003",
    clientName: "Rahman Trading",
    invoiceNo: "BP/2025/003",
    status: "pending",
  },
  {
    id: "LDG-004",
    date: "2025-02-12",
    amount: 8500,
    reference: "BP/2025/004",
    clientName: "Karim General Store",
    invoiceNo: "BP/2025/004",
    status: "unmatched",
  },
  {
    id: "LDG-005",
    date: "2025-02-08",
    amount: 15000,
    reference: "BP/2025/005",
    clientName: "Mina Grocery",
    invoiceNo: "BP/2025/005",
    status: "matched",
  },
  {
    id: "LDG-006",
    date: "2024-12-01",
    amount: 92000,
    reference: "BP/2025/006",
    clientName: "Alam Wholesale",
    invoiceNo: "BP/2025/006",
    status: "unmatched",
  },
  {
    id: "LDG-007",
    date: "2025-02-05",
    amount: 6400,
    reference: "BP/2025/007",
    clientName: "Hasan Departmental Store",
    invoiceNo: "BP/2025/007",
    status: "pending",
  },
  {
    id: "LDG-008",
    date: "2025-02-14",
    amount: 35000,
    reference: "BP/2025/008",
    clientName: "Rahman Trading",
    invoiceNo: "BP/2025/008",
    status: "unmatched",
  },
  {
    id: "LDG-009",
    date: "2024-12-15",
    amount: 48000,
    reference: "BP/2025/009",
    clientName: "Mina Grocery",
    invoiceNo: "BP/2025/009",
    status: "unmatched",
  },
  {
    id: "LDG-010",
    date: "2025-02-16",
    amount: 22000,
    reference: "BP/2025/010",
    clientName: "Alam Wholesale",
    invoiceNo: "BP/2025/010",
    status: "pending",
  },
];

// Generate Match Simulation
export function simulateMatch(
  bankTxnId: string,
  ledgerEntryId: string
): MatchSimulation | null {
  const bankTxn = RECON_BANK_TXNS.find((t) => t.id === bankTxnId);
  const ledgerEntry = RECON_LEDGER_ENTRIES.find((e) => e.id === ledgerEntryId);

  if (!bankTxn || !ledgerEntry) return null;

  // Explainability factors
  const amountMatch = Math.abs(bankTxn.amount - ledgerEntry.amount) / ledgerEntry.amount <= 0.05;
  const referenceMatch = bankTxn.reference === ledgerEntry.reference || 
                         bankTxn.reference === ledgerEntry.invoiceNo;
  const dateDiff = Math.abs(
    new Date(bankTxn.date).getTime() - new Date(ledgerEntry.date).getTime()
  ) / (1000 * 60 * 60 * 24);
  const dateMatch = dateDiff <= 3;
  const clientMatch = bankTxn.clientName === ledgerEntry.clientName;

  // Calculate confidence
  let confidence = 0;
  if (amountMatch) confidence += 40;
  if (referenceMatch) confidence += 35;
  if (dateMatch) confidence += 15;
  if (clientMatch) confidence += 10;

  // Determine matched rule
  let matchedRule: ReconciliationRule | undefined;
  let outcome: MatchOutcome = "exception";
  let reason = "";

  if (confidence >= 95) {
    matchedRule = RECON_RULES[0]; // Exact match
    outcome = "auto-match";
    reason = "Exact amount and reference match within 1 day window";
  } else if (confidence >= 85 && referenceMatch) {
    matchedRule = RECON_RULES[1]; // Invoice reference
    outcome = "auto-match";
    reason = "Invoice reference matches with acceptable amount variance";
  } else if (confidence >= 70 && clientMatch) {
    matchedRule = RECON_RULES[2]; // Client name
    outcome = "needs-approval";
    reason = "Client name and date match, but amount variance requires approval";
  } else if (bankTxn.amount < ledgerEntry.amount * 0.6 && referenceMatch) {
    matchedRule = RECON_RULES[3]; // Partial payment
    outcome = "needs-approval";
    reason = "Partial payment detected - requires manual verification";
  } else if (bankTxn.amount > 50000) {
    matchedRule = RECON_RULES[5]; // Large amount
    outcome = "needs-approval";
    reason = "Large transaction amount (>৳50K) requires manual approval";
  } else if (!bankTxn.reference || bankTxn.reference === "") {
    matchedRule = RECON_RULES[6]; // No reference
    outcome = "exception";
    reason = "Bank transaction has no reference - cannot auto-match";
  } else {
    outcome = "exception";
    reason = "Confidence too low - insufficient matching criteria";
  }

  const confidenceLevel: ConfidenceLevel =
    confidence >= 85 ? "high" : confidence >= 70 ? "medium" : "low";

  return {
    bankTxn,
    ledgerEntry,
    matchedRule,
    confidenceScore: Math.round(confidence),
    confidenceLevel,
    outcome,
    reason,
    explainability: {
      amountMatch,
      referenceMatch,
      dateMatch,
      clientMatch,
    },
  };
}

// Get rule statistics
export function getRuleStats() {
  const totalRules = RECON_RULES.length;
  const enabledRules = RECON_RULES.filter((r) => r.enabled).length;
  const totalApplied = RECON_RULES.reduce((sum, r) => sum + r.stats.appliedCount, 0);
  
  const avgSuccessRate =
    RECON_RULES.reduce((sum, r) => sum + r.stats.successRate, 0) / totalRules;

  // Mock coverage calculation
  const autoMatchCoverage = 73; // % of transactions that could auto-match
  const exceptionRate = 12; // % that go to exceptions

  return {
    totalRules,
    enabledRules,
    disabledRules: totalRules - enabledRules,
    totalApplied,
    avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
    autoMatchCoverage,
    exceptionRate,
  };
}

// Get confidence distribution
export function getConfidenceDistribution() {
  return {
    high: 68, // % with confidence ≥85%
    medium: 20, // % with confidence 70-84%
    low: 12, // % with confidence <70%
  };
}

// Get rule by ID
export function getRuleById(id: string): ReconciliationRule | undefined {
  return RECON_RULES.find((r) => r.id === id);
}

// Get all rules
export function getAllRules(): ReconciliationRule[] {
  return RECON_RULES;
}

// Get rules by category
export function getRulesByCategory(category: RuleCategory): ReconciliationRule[] {
  return RECON_RULES.filter((r) => r.category === category);
}