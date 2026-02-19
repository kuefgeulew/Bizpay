/**
 * RECONCILIATION ENGINE — SPRINT 3 MODULE 1
 * Auto-matching, exception tracking, aging analysis
 * Rule-based deterministic matching (no ML)
 */

// ============================================
// 1. TYPE DEFINITIONS
// ============================================

export type ReconciliationStatus =
  | "MATCHED"
  | "UNMATCHED"
  | "PARTIAL"
  | "EXCEPTION"
  | "MANUAL_MATCH";

export type TransactionSource = "BANK" | "SYSTEM";

export interface BankTransaction {
  id: string;
  date: string;
  amount: number;
  reference: string;
  description: string;
  accountNumber: string;
  transactionType: "CREDIT" | "DEBIT";
  source: "BANK";
  status: ReconciliationStatus;
  matchedWith?: string[]; // IDs of matched ledger entries
  confidence?: number; // 0-100
  createdAt: string;
}

export interface SystemLedgerEntry {
  id: string;
  date: string;
  amount: number;
  reference: string;
  description: string;
  invoiceNumber?: string;
  clientName?: string;
  transactionType: "CREDIT" | "DEBIT";
  source: "SYSTEM";
  status: ReconciliationStatus;
  matchedWith?: string[]; // IDs of matched bank transactions
  confidence?: number;
  createdAt: string;
}

export interface ReconciliationMatch {
  id: string;
  bankTransactionIds: string[];
  ledgerEntryIds: string[];
  matchType: "EXACT" | "PARTIAL" | "MULTI_SPLIT" | "MANUAL";
  confidence: number; // 0-100
  amountDifference: number; // 0 for exact matches
  matchedBy?: string; // User ID for manual matches
  matchReason?: string; // Required for manual matches
  matchedAt: string;
  requiresApproval: boolean;
  approvalId?: string;
}

export interface ReconciliationException {
  id: string;
  transactionId: string;
  transactionSource: TransactionSource;
  exceptionType:
    | "NO_MATCH"
    | "AMOUNT_MISMATCH"
    | "DATE_MISMATCH"
    | "DUPLICATE"
    | "ORPHAN";
  amount: number;
  date: string;
  ageDays: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  notes?: string;
  createdAt: string;
}

export interface AgingBucket {
  label: string;
  range: string;
  count: number;
  totalAmount: number;
  items: ReconciliationException[];
}

// ============================================
// 2. MOCK DATA
// ============================================

export const BANK_TRANSACTIONS: BankTransaction[] = [
  // Matched transactions
  {
    id: "bnk_001",
    date: "2026-02-17",
    amount: 250000,
    reference: "TXN12345",
    description: "Customer Payment - Invoice #12345",
    accountNumber: "1020304050",
    transactionType: "CREDIT",
    source: "BANK",
    status: "MATCHED",
    matchedWith: ["led_001"],
    confidence: 100,
    createdAt: "2026-02-17T10:30:00Z",
  },
  {
    id: "bnk_002",
    date: "2026-02-16",
    amount: 150000,
    reference: "TXN12346",
    description: "Payment received from Acme Ltd",
    accountNumber: "1020304050",
    transactionType: "CREDIT",
    source: "BANK",
    status: "MATCHED",
    matchedWith: ["led_002"],
    confidence: 95,
    createdAt: "2026-02-16T14:20:00Z",
  },

  // Unmatched - Recent (0-1 days)
  {
    id: "bnk_003",
    date: "2026-02-17",
    amount: 75000,
    reference: "TXN12347",
    description: "Unidentified credit",
    accountNumber: "1020304050",
    transactionType: "CREDIT",
    source: "BANK",
    status: "UNMATCHED",
    confidence: 0,
    createdAt: "2026-02-17T09:15:00Z",
  },

  // Unmatched - 2-7 days
  {
    id: "bnk_004",
    date: "2026-02-13",
    amount: 320000,
    reference: "TXN12340",
    description: "Customer deposit",
    accountNumber: "1020304050",
    transactionType: "CREDIT",
    source: "BANK",
    status: "UNMATCHED",
    confidence: 0,
    createdAt: "2026-02-13T11:00:00Z",
  },

  // Unmatched - 8-30 days
  {
    id: "bnk_005",
    date: "2026-02-05",
    amount: 185000,
    reference: "TXN12330",
    description: "Payment received",
    accountNumber: "1020304050",
    transactionType: "CREDIT",
    source: "BANK",
    status: "UNMATCHED",
    confidence: 0,
    createdAt: "2026-02-05T16:45:00Z",
  },

  // Unmatched - 30+ days (CRITICAL)
  {
    id: "bnk_006",
    date: "2026-01-10",
    amount: 500000,
    reference: "TXN12200",
    description: "Large unidentified deposit",
    accountNumber: "1020304050",
    transactionType: "CREDIT",
    source: "BANK",
    status: "EXCEPTION",
    confidence: 0,
    createdAt: "2026-01-10T10:00:00Z",
  },

  // Partial match
  {
    id: "bnk_007",
    date: "2026-02-15",
    amount: 99500,
    reference: "TXN12344",
    description: "Partial payment received",
    accountNumber: "1020304050",
    transactionType: "CREDIT",
    source: "BANK",
    status: "PARTIAL",
    matchedWith: ["led_005"],
    confidence: 70,
    createdAt: "2026-02-15T13:30:00Z",
  },
];

export const LEDGER_ENTRIES: SystemLedgerEntry[] = [
  // Matched entries
  {
    id: "led_001",
    date: "2026-02-17",
    amount: 250000,
    reference: "INV12345",
    description: "Invoice #12345 - Acme Corp",
    invoiceNumber: "INV12345",
    clientName: "Acme Corp",
    transactionType: "CREDIT",
    source: "SYSTEM",
    status: "MATCHED",
    matchedWith: ["bnk_001"],
    confidence: 100,
    createdAt: "2026-02-16T10:00:00Z",
  },
  {
    id: "led_002",
    date: "2026-02-16",
    amount: 150000,
    reference: "INV12346",
    description: "Invoice #12346 - Acme Ltd",
    invoiceNumber: "INV12346",
    clientName: "Acme Ltd",
    transactionType: "CREDIT",
    source: "SYSTEM",
    status: "MATCHED",
    matchedWith: ["bnk_002"],
    confidence: 95,
    createdAt: "2026-02-15T09:00:00Z",
  },

  // Unmatched ledger entries
  {
    id: "led_003",
    date: "2026-02-17",
    amount: 125000,
    reference: "INV12348",
    description: "Invoice #12348 - Beta Inc",
    invoiceNumber: "INV12348",
    clientName: "Beta Inc",
    transactionType: "CREDIT",
    source: "SYSTEM",
    status: "UNMATCHED",
    confidence: 0,
    createdAt: "2026-02-17T08:00:00Z",
  },
  {
    id: "led_004",
    date: "2026-02-10",
    amount: 200000,
    reference: "INV12340",
    description: "Invoice #12340 - Gamma LLC",
    invoiceNumber: "INV12340",
    clientName: "Gamma LLC",
    transactionType: "CREDIT",
    source: "SYSTEM",
    status: "UNMATCHED",
    confidence: 0,
    createdAt: "2026-02-10T10:00:00Z",
  },

  // Partial match
  {
    id: "led_005",
    date: "2026-02-15",
    amount: 100000,
    reference: "INV12344",
    description: "Invoice #12344 - Delta Co (Partial)",
    invoiceNumber: "INV12344",
    clientName: "Delta Co",
    transactionType: "CREDIT",
    source: "SYSTEM",
    status: "PARTIAL",
    matchedWith: ["bnk_007"],
    confidence: 70,
    createdAt: "2026-02-14T10:00:00Z",
  },
];

// ============================================
// 3. AUTO-MATCHING RULES
// ============================================

/**
 * Rule 1: Exact Match
 * Amount matches exactly + date within 2 days + reference similarity
 */
export function findExactMatches(
  bankTxns: BankTransaction[],
  ledgerEntries: SystemLedgerEntry[]
): ReconciliationMatch[] {
  const matches: ReconciliationMatch[] = [];

  bankTxns
    .filter((b) => b.status === "UNMATCHED")
    .forEach((bank) => {
      ledgerEntries
        .filter((l) => l.status === "UNMATCHED")
        .forEach((ledger) => {
          // Amount must match exactly
          if (bank.amount !== ledger.amount) return;

          // Date within 2 days
          const daysDiff = Math.abs(
            (new Date(bank.date).getTime() - new Date(ledger.date).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (daysDiff > 2) return;

          // Reference similarity (basic check)
          const refSimilar =
            bank.reference.includes(ledger.reference) ||
            ledger.reference.includes(bank.reference) ||
            bank.description.toLowerCase().includes(ledger.invoiceNumber?.toLowerCase() || "");

          if (refSimilar) {
            matches.push({
              id: `match_${bank.id}_${ledger.id}`,
              bankTransactionIds: [bank.id],
              ledgerEntryIds: [ledger.id],
              matchType: "EXACT",
              confidence: 100,
              amountDifference: 0,
              matchedAt: new Date().toISOString(),
              requiresApproval: false,
            });
          }
        });
    });

  return matches;
}

/**
 * Rule 2: Partial Match
 * Amount within tolerance (±2%)
 */
export function findPartialMatches(
  bankTxns: BankTransaction[],
  ledgerEntries: SystemLedgerEntry[],
  tolerance: number = 0.02 // 2%
): ReconciliationMatch[] {
  const matches: ReconciliationMatch[] = [];

  bankTxns
    .filter((b) => b.status === "UNMATCHED")
    .forEach((bank) => {
      ledgerEntries
        .filter((l) => l.status === "UNMATCHED")
        .forEach((ledger) => {
          const diff = Math.abs(bank.amount - ledger.amount);
          const percentDiff = diff / ledger.amount;

          if (percentDiff <= tolerance && percentDiff > 0) {
            // Date within 3 days for partial matches
            const daysDiff = Math.abs(
              (new Date(bank.date).getTime() - new Date(ledger.date).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysDiff <= 3) {
              matches.push({
                id: `match_${bank.id}_${ledger.id}`,
                bankTransactionIds: [bank.id],
                ledgerEntryIds: [ledger.id],
                matchType: "PARTIAL",
                confidence: Math.round((1 - percentDiff) * 100),
                amountDifference: diff,
                matchedAt: new Date().toISOString(),
                requiresApproval: true, // Partial matches need approval
              });
            }
          }
        });
    });

  return matches;
}

/**
 * Rule 3: Multi-Split Match
 * One bank transaction matches multiple ledger entries
 */
export function findMultiSplitMatches(
  bankTxns: BankTransaction[],
  ledgerEntries: SystemLedgerEntry[]
): ReconciliationMatch[] {
  const matches: ReconciliationMatch[] = [];

  bankTxns
    .filter((b) => b.status === "UNMATCHED")
    .forEach((bank) => {
      // Find all unmatched ledger entries on same date
      const candidates = ledgerEntries.filter(
        (l) => l.status === "UNMATCHED" && l.date === bank.date
      );

      // Try to find combinations that sum to bank amount
      for (let i = 0; i < candidates.length; i++) {
        for (let j = i + 1; j < candidates.length; j++) {
          const sum = candidates[i].amount + candidates[j].amount;
          if (Math.abs(sum - bank.amount) < 100) {
            // Within ৳100 tolerance
            matches.push({
              id: `match_${bank.id}_${candidates[i].id}_${candidates[j].id}`,
              bankTransactionIds: [bank.id],
              ledgerEntryIds: [candidates[i].id, candidates[j].id],
              matchType: "MULTI_SPLIT",
              confidence: 85,
              amountDifference: Math.abs(sum - bank.amount),
              matchedAt: new Date().toISOString(),
              requiresApproval: true, // Multi-split always needs approval
            });
          }
        }
      }
    });

  return matches;
}

/**
 * Create manual match (requires approval)
 */
export function createManualMatch(
  bankTransactionIds: string[],
  ledgerEntryIds: string[],
  matchedBy: string,
  reason: string
): ReconciliationMatch {
  if (!reason || reason.trim().length < 10) {
    throw new Error("Manual match reason must be at least 10 characters");
  }

  return {
    id: `manual_${Date.now()}`,
    bankTransactionIds,
    ledgerEntryIds,
    matchType: "MANUAL",
    confidence: 100,
    amountDifference: 0,
    matchedBy,
    matchReason: reason,
    matchedAt: new Date().toISOString(),
    requiresApproval: true, // Always requires approval
  };
}

// ============================================
// 4. EXCEPTION DETECTION
// ============================================

export function generateExceptions(
  bankTxns: BankTransaction[],
  ledgerEntries: SystemLedgerEntry[]
): ReconciliationException[] {
  const exceptions: ReconciliationException[] = [];
  const now = new Date();

  // Bank transactions without matches
  bankTxns
    .filter((b) => b.status === "UNMATCHED" || b.status === "EXCEPTION")
    .forEach((bank) => {
      const txnDate = new Date(bank.date);
      const ageDays = Math.floor(
        (now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
      if (ageDays > 30) severity = "CRITICAL";
      else if (ageDays > 7) severity = "HIGH";
      else if (ageDays > 1) severity = "MEDIUM";

      exceptions.push({
        id: `exc_${bank.id}`,
        transactionId: bank.id,
        transactionSource: "BANK",
        exceptionType: "NO_MATCH",
        amount: bank.amount,
        date: bank.date,
        ageDays,
        severity,
        createdAt: bank.createdAt,
      });
    });

  // Ledger entries without matches
  ledgerEntries
    .filter((l) => l.status === "UNMATCHED")
    .forEach((ledger) => {
      const txnDate = new Date(ledger.date);
      const ageDays = Math.floor(
        (now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
      if (ageDays > 30) severity = "CRITICAL";
      else if (ageDays > 7) severity = "HIGH";
      else if (ageDays > 1) severity = "MEDIUM";

      exceptions.push({
        id: `exc_${ledger.id}`,
        transactionId: ledger.id,
        transactionSource: "SYSTEM",
        exceptionType: "NO_MATCH",
        amount: ledger.amount,
        date: ledger.date,
        ageDays,
        severity,
        createdAt: ledger.createdAt,
      });
    });

  return exceptions;
}

// ============================================
// 5. AGING ANALYSIS
// ============================================

export function generateAgingBuckets(
  exceptions: ReconciliationException[]
): AgingBucket[] {
  const buckets: AgingBucket[] = [
    { label: "0-1 Days", range: "0-1", count: 0, totalAmount: 0, items: [] },
    { label: "2-7 Days", range: "2-7", count: 0, totalAmount: 0, items: [] },
    { label: "8-30 Days", range: "8-30", count: 0, totalAmount: 0, items: [] },
    {
      label: "30+ Days",
      range: "30+",
      count: 0,
      totalAmount: 0,
      items: [],
    },
  ];

  exceptions.forEach((exc) => {
    let bucketIndex = 0;
    if (exc.ageDays >= 30) bucketIndex = 3;
    else if (exc.ageDays >= 8) bucketIndex = 2;
    else if (exc.ageDays >= 2) bucketIndex = 1;

    buckets[bucketIndex].items.push(exc);
    buckets[bucketIndex].count++;
    buckets[bucketIndex].totalAmount += exc.amount;
  });

  return buckets;
}

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

export function getReconciliationStats(
  bankTxns: BankTransaction[],
  ledgerEntries: SystemLedgerEntry[]
) {
  const totalBank = bankTxns.length;
  const totalLedger = ledgerEntries.length;

  const matchedBank = bankTxns.filter((b) => b.status === "MATCHED").length;
  const matchedLedger = ledgerEntries.filter((l) => l.status === "MATCHED")
    .length;

  const unmatchedBank = bankTxns.filter(
    (b) => b.status === "UNMATCHED" || b.status === "EXCEPTION"
  ).length;
  const unmatchedLedger = ledgerEntries.filter((l) => l.status === "UNMATCHED")
    .length;

  const matchRate = totalBank > 0 ? (matchedBank / totalBank) * 100 : 0;

  return {
    totalBank,
    totalLedger,
    matchedBank,
    matchedLedger,
    unmatchedBank,
    unmatchedLedger,
    matchRate: Math.round(matchRate),
  };
}

export function formatAmount(amount: number): string {
  return `৳${amount.toLocaleString()}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}