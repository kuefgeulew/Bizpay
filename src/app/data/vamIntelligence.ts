/**
 * VAM INTELLIGENCE LAYER — SPRINT 3 MODULE 2
 * Client-wise receivable tracking, auto-tagging, overdue analysis, risk signals
 */

// ============================================
// 1. TYPE DEFINITIONS
// ============================================

export type ClientStatus = "HEALTHY" | "WARNING" | "CRITICAL";
export type PaymentPattern = "REGULAR" | "IRREGULAR" | "PARTIAL" | "DELAYED";

export interface VirtualAccount {
  id: string;
  accountNumber: string;
  clientId: string;
  clientName: string;
  clientType: "CORPORATE" | "SME" | "INDIVIDUAL";
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  createdAt: string;
}

export interface ReceivableLedger {
  clientId: string;
  clientName: string;
  virtualAccountId: string;
  expectedAmount: number; // Total invoices/receivables
  receivedAmount: number; // Total payments received
  outstandingBalance: number; // Expected - Received
  overdueAmount: number; // Amount past due date
  overdueDays: number; // Days since oldest overdue
  lastPaymentDate: string | null;
  lastPaymentAmount: number;
  status: ClientStatus;
  paymentPattern: PaymentPattern;
  riskFlags: string[]; // Active risk indicators
}

export interface ClientInflow {
  id: string;
  virtualAccountId: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  reference: string;
  description: string;
  matched: boolean; // Auto-tagged or not
  confidence: number; // 0-100
  invoiceNumber?: string; // Matched invoice
  createdAt: string;
}

export interface ClientReceivable {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  receivedAmount: number;
  outstandingAmount: number;
  overdueDays: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
  paymentHistory: ClientPayment[];
}

export interface ClientPayment {
  id: string;
  date: string;
  amount: number;
  reference: string;
  confidence: number;
}

export interface OverdueBucket {
  label: string;
  range: string;
  count: number;
  totalAmount: number;
  clients: string[]; // Client IDs
}

export interface RiskSignal {
  id: string;
  clientId: string;
  clientName: string;
  signalType:
    | "REPEATED_PARTIAL"
    | "FREQUENT_MISMATCH"
    | "LONG_OVERDUE"
    | "PAYMENT_STOPPED"
    | "AMOUNT_DECLINING";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  detectedAt: string;
  amount?: number;
}

// ============================================
// 2. MOCK DATA
// ============================================

export const VIRTUAL_ACCOUNTS: VirtualAccount[] = [
  {
    id: "va_001",
    accountNumber: "VA10001234567",
    clientId: "client_001",
    clientName: "Acme Corporation",
    clientType: "CORPORATE",
    status: "ACTIVE",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "va_002",
    accountNumber: "VA10001234568",
    clientId: "client_002",
    clientName: "Beta Industries Ltd",
    clientType: "SME",
    status: "ACTIVE",
    createdAt: "2025-02-01T10:00:00Z",
  },
  {
    id: "va_003",
    accountNumber: "VA10001234569",
    clientId: "client_003",
    clientName: "Gamma Trading Co",
    clientType: "SME",
    status: "ACTIVE",
    createdAt: "2025-01-20T10:00:00Z",
  },
  {
    id: "va_004",
    accountNumber: "VA10001234570",
    clientId: "client_004",
    clientName: "Delta Enterprises",
    clientType: "CORPORATE",
    status: "ACTIVE",
    createdAt: "2024-12-10T10:00:00Z",
  },
  {
    id: "va_005",
    accountNumber: "VA10001234571",
    clientId: "client_005",
    clientName: "Epsilon Solutions",
    clientType: "SME",
    status: "ACTIVE",
    createdAt: "2025-01-05T10:00:00Z",
  },
];

export const CLIENT_RECEIVABLES: ClientReceivable[] = [
  // Acme Corporation - Healthy
  {
    id: "recv_001",
    clientId: "client_001",
    clientName: "Acme Corporation",
    invoiceNumber: "INV-2026-001",
    invoiceDate: "2026-02-10",
    dueDate: "2026-02-25",
    amount: 500000,
    receivedAmount: 500000,
    outstandingAmount: 0,
    overdueDays: 0,
    status: "PAID",
    paymentHistory: [
      {
        id: "pay_001",
        date: "2026-02-20",
        amount: 500000,
        reference: "TXN456789",
        confidence: 100,
      },
    ],
  },
  {
    id: "recv_002",
    clientId: "client_001",
    clientName: "Acme Corporation",
    invoiceNumber: "INV-2026-010",
    invoiceDate: "2026-02-15",
    dueDate: "2026-03-01",
    amount: 750000,
    receivedAmount: 0,
    outstandingAmount: 750000,
    overdueDays: 0,
    status: "PENDING",
    paymentHistory: [],
  },

  // Beta Industries - Warning (Partial payments)
  {
    id: "recv_003",
    clientId: "client_002",
    clientName: "Beta Industries Ltd",
    invoiceNumber: "INV-2026-002",
    invoiceDate: "2026-01-20",
    dueDate: "2026-02-05",
    amount: 300000,
    receivedAmount: 150000,
    outstandingAmount: 150000,
    overdueDays: 12,
    status: "OVERDUE",
    paymentHistory: [
      {
        id: "pay_002",
        date: "2026-02-01",
        amount: 150000,
        reference: "TXN456790",
        confidence: 95,
      },
    ],
  },
  {
    id: "recv_004",
    clientId: "client_002",
    clientName: "Beta Industries Ltd",
    invoiceNumber: "INV-2026-011",
    invoiceDate: "2026-02-10",
    dueDate: "2026-02-25",
    amount: 200000,
    receivedAmount: 0,
    outstandingAmount: 200000,
    overdueDays: 0,
    status: "PENDING",
    paymentHistory: [],
  },

  // Gamma Trading - Critical (Long overdue)
  {
    id: "recv_005",
    clientId: "client_003",
    clientName: "Gamma Trading Co",
    invoiceNumber: "INV-2026-003",
    invoiceDate: "2025-12-15",
    dueDate: "2026-01-05",
    amount: 450000,
    receivedAmount: 0,
    outstandingAmount: 450000,
    overdueDays: 43,
    status: "OVERDUE",
    paymentHistory: [],
  },
  {
    id: "recv_006",
    clientId: "client_003",
    clientName: "Gamma Trading Co",
    invoiceNumber: "INV-2026-004",
    invoiceDate: "2026-01-20",
    dueDate: "2026-02-10",
    amount: 320000,
    receivedAmount: 0,
    outstandingAmount: 320000,
    overdueDays: 7,
    status: "OVERDUE",
    paymentHistory: [],
  },

  // Delta Enterprises - Healthy with recent payment
  {
    id: "recv_007",
    clientId: "client_004",
    clientName: "Delta Enterprises",
    invoiceNumber: "INV-2026-005",
    invoiceDate: "2026-02-05",
    dueDate: "2026-02-20",
    amount: 850000,
    receivedAmount: 850000,
    outstandingAmount: 0,
    overdueDays: 0,
    status: "PAID",
    paymentHistory: [
      {
        id: "pay_003",
        date: "2026-02-18",
        amount: 850000,
        reference: "TXN456791",
        confidence: 100,
      },
    ],
  },

  // Epsilon Solutions - Warning (Irregular payments)
  {
    id: "recv_008",
    clientId: "client_005",
    clientName: "Epsilon Solutions",
    invoiceNumber: "INV-2026-006",
    invoiceDate: "2026-01-25",
    dueDate: "2026-02-10",
    amount: 280000,
    receivedAmount: 100000,
    outstandingAmount: 180000,
    overdueDays: 7,
    status: "OVERDUE",
    paymentHistory: [
      {
        id: "pay_004",
        date: "2026-02-08",
        amount: 50000,
        reference: "TXN456792",
        confidence: 85,
      },
      {
        id: "pay_005",
        date: "2026-02-12",
        amount: 50000,
        reference: "TXN456793",
        confidence: 85,
      },
    ],
  },
];

export const CLIENT_INFLOWS: ClientInflow[] = [
  // Matched inflows
  {
    id: "inf_001",
    virtualAccountId: "va_001",
    clientId: "client_001",
    clientName: "Acme Corporation",
    amount: 500000,
    date: "2026-02-20",
    reference: "TXN456789",
    description: "Payment for INV-2026-001",
    matched: true,
    confidence: 100,
    invoiceNumber: "INV-2026-001",
    createdAt: "2026-02-20T10:30:00Z",
  },
  {
    id: "inf_002",
    virtualAccountId: "va_002",
    clientId: "client_002",
    clientName: "Beta Industries Ltd",
    amount: 150000,
    date: "2026-02-01",
    reference: "TXN456790",
    description: "Partial payment INV-2026-002",
    matched: true,
    confidence: 95,
    invoiceNumber: "INV-2026-002",
    createdAt: "2026-02-01T14:20:00Z",
  },
  {
    id: "inf_003",
    virtualAccountId: "va_004",
    clientId: "client_004",
    clientName: "Delta Enterprises",
    amount: 850000,
    date: "2026-02-18",
    reference: "TXN456791",
    description: "Payment received",
    matched: true,
    confidence: 100,
    invoiceNumber: "INV-2026-005",
    createdAt: "2026-02-18T11:00:00Z",
  },

  // Unmatched inflows (need attention)
  {
    id: "inf_004",
    virtualAccountId: "va_005",
    clientId: "client_005",
    clientName: "Epsilon Solutions",
    amount: 50000,
    date: "2026-02-08",
    reference: "TXN456792",
    description: "Partial payment",
    matched: false,
    confidence: 60,
    createdAt: "2026-02-08T09:15:00Z",
  },
  {
    id: "inf_005",
    virtualAccountId: "va_005",
    clientId: "client_005",
    clientName: "Epsilon Solutions",
    amount: 50000,
    date: "2026-02-12",
    reference: "TXN456793",
    description: "Another partial payment",
    matched: false,
    confidence: 60,
    createdAt: "2026-02-12T10:45:00Z",
  },
  {
    id: "inf_006",
    virtualAccountId: "va_001",
    clientId: "client_001",
    clientName: "Acme Corporation",
    amount: 25000,
    date: "2026-02-16",
    reference: "TXN456794",
    description: "Unknown credit",
    matched: false,
    confidence: 40,
    createdAt: "2026-02-16T13:30:00Z",
  },
];

// ============================================
// 3. INTELLIGENCE FUNCTIONS
// ============================================

/**
 * Calculate client-wise receivable ledger
 */
export function calculateReceivableLedger(): ReceivableLedger[] {
  const ledgers: Map<string, ReceivableLedger> = new Map();

  // Group receivables by client
  CLIENT_RECEIVABLES.forEach((receivable) => {
    if (!ledgers.has(receivable.clientId)) {
      ledgers.set(receivable.clientId, {
        clientId: receivable.clientId,
        clientName: receivable.clientName,
        virtualAccountId:
          VIRTUAL_ACCOUNTS.find((va) => va.clientId === receivable.clientId)
            ?.id || "",
        expectedAmount: 0,
        receivedAmount: 0,
        outstandingBalance: 0,
        overdueAmount: 0,
        overdueDays: 0,
        lastPaymentDate: null,
        lastPaymentAmount: 0,
        status: "HEALTHY",
        paymentPattern: "REGULAR",
        riskFlags: [],
      });
    }

    const ledger = ledgers.get(receivable.clientId)!;
    ledger.expectedAmount += receivable.amount;
    ledger.receivedAmount += receivable.receivedAmount;
    ledger.outstandingBalance += receivable.outstandingAmount;

    if (receivable.status === "OVERDUE") {
      ledger.overdueAmount += receivable.outstandingAmount;
      ledger.overdueDays = Math.max(ledger.overdueDays, receivable.overdueDays);
    }

    // Track last payment
    if (receivable.paymentHistory.length > 0) {
      const lastPayment =
        receivable.paymentHistory[receivable.paymentHistory.length - 1];
      if (
        !ledger.lastPaymentDate ||
        new Date(lastPayment.date) > new Date(ledger.lastPaymentDate)
      ) {
        ledger.lastPaymentDate = lastPayment.date;
        ledger.lastPaymentAmount = lastPayment.amount;
      }
    }
  });

  // Calculate status and payment pattern
  ledgers.forEach((ledger) => {
    // Status based on overdue days
    if (ledger.overdueDays === 0) {
      ledger.status = "HEALTHY";
    } else if (ledger.overdueDays <= 7) {
      ledger.status = "WARNING";
    } else {
      ledger.status = "CRITICAL";
    }

    // Payment pattern analysis
    const clientReceivables = CLIENT_RECEIVABLES.filter(
      (r) => r.clientId === ledger.clientId
    );
    const partialCount = clientReceivables.filter(
      (r) => r.status === "PARTIAL"
    ).length;
    const overdueCount = clientReceivables.filter(
      (r) => r.status === "OVERDUE"
    ).length;

    if (partialCount >= 2) {
      ledger.paymentPattern = "PARTIAL";
    } else if (overdueCount >= 2) {
      ledger.paymentPattern = "DELAYED";
    } else if (ledger.lastPaymentDate) {
      const daysSincePayment = Math.floor(
        (new Date().getTime() - new Date(ledger.lastPaymentDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSincePayment > 30) {
        ledger.paymentPattern = "IRREGULAR";
      }
    }

    // Generate risk flags
    ledger.riskFlags = generateRiskFlags(ledger.clientId, ledger).map(
      (r) => r.signalType
    );
  });

  return Array.from(ledgers.values());
}

/**
 * Auto-tagging engine: Match inflows to receivables
 */
export function autoTagInflows(): ClientInflow[] {
  return CLIENT_INFLOWS.map((inflow) => {
    // Already matched
    if (inflow.matched) return inflow;

    // Find matching receivable
    const matchingReceivable = CLIENT_RECEIVABLES.find((receivable) => {
      // Same client
      if (receivable.clientId !== inflow.clientId) return false;

      // Amount matches (exact or close)
      const amountDiff = Math.abs(receivable.outstandingAmount - inflow.amount);
      if (amountDiff === 0) return true;
      if (amountDiff / receivable.amount <= 0.02) return true; // 2% tolerance

      return false;
    });

    if (matchingReceivable) {
      return {
        ...inflow,
        matched: true,
        confidence: 90,
        invoiceNumber: matchingReceivable.invoiceNumber,
      };
    }

    return inflow;
  });
}

/**
 * Generate overdue buckets
 */
export function generateOverdueBuckets(): OverdueBucket[] {
  const buckets: OverdueBucket[] = [
    { label: "1-7 Days", range: "1-7", count: 0, totalAmount: 0, clients: [] },
    {
      label: "8-30 Days",
      range: "8-30",
      count: 0,
      totalAmount: 0,
      clients: [],
    },
    { label: "30+ Days", range: "30+", count: 0, totalAmount: 0, clients: [] },
  ];

  const ledgers = calculateReceivableLedger();

  ledgers.forEach((ledger) => {
    if (ledger.overdueDays === 0) return;

    let bucketIndex = 0;
    if (ledger.overdueDays >= 30) bucketIndex = 2;
    else if (ledger.overdueDays >= 8) bucketIndex = 1;

    buckets[bucketIndex].count++;
    buckets[bucketIndex].totalAmount += ledger.overdueAmount;
    if (!buckets[bucketIndex].clients.includes(ledger.clientId)) {
      buckets[bucketIndex].clients.push(ledger.clientId);
    }
  });

  return buckets;
}

/**
 * Generate risk signals for a client
 */
export function generateRiskFlags(
  clientId: string,
  ledger: ReceivableLedger
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const clientReceivables = CLIENT_RECEIVABLES.filter(
    (r) => r.clientId === clientId
  );

  // Risk 1: Repeated partial payments
  const partialCount = clientReceivables.filter((r) => r.status === "PARTIAL").length;
  if (partialCount >= 2) {
    signals.push({
      id: `risk_${clientId}_partial`,
      clientId,
      clientName: ledger.clientName,
      signalType: "REPEATED_PARTIAL",
      severity: "MEDIUM",
      description: `${partialCount} invoices with partial payments`,
      detectedAt: new Date().toISOString(),
    });
  }

  // Risk 2: Long overdue
  if (ledger.overdueDays >= 30) {
    signals.push({
      id: `risk_${clientId}_overdue`,
      clientId,
      clientName: ledger.clientName,
      signalType: "LONG_OVERDUE",
      severity: "CRITICAL",
      description: `${ledger.overdueDays} days overdue`,
      detectedAt: new Date().toISOString(),
      amount: ledger.overdueAmount,
    });
  } else if (ledger.overdueDays >= 8) {
    signals.push({
      id: `risk_${clientId}_overdue`,
      clientId,
      clientName: ledger.clientName,
      signalType: "LONG_OVERDUE",
      severity: "HIGH",
      description: `${ledger.overdueDays} days overdue`,
      detectedAt: new Date().toISOString(),
      amount: ledger.overdueAmount,
    });
  }

  // Risk 3: Payment stopped
  if (
    ledger.lastPaymentDate &&
    ledger.outstandingBalance > 0 &&
    ledger.overdueDays > 0
  ) {
    const daysSincePayment = Math.floor(
      (new Date().getTime() - new Date(ledger.lastPaymentDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSincePayment > 30) {
      signals.push({
        id: `risk_${clientId}_stopped`,
        clientId,
        clientName: ledger.clientName,
        signalType: "PAYMENT_STOPPED",
        severity: "HIGH",
        description: `No payment for ${daysSincePayment} days`,
        detectedAt: new Date().toISOString(),
      });
    }
  }

  // Risk 4: Frequent mismatches
  const unmatchedInflows = CLIENT_INFLOWS.filter(
    (inf) => inf.clientId === clientId && !inf.matched
  );
  if (unmatchedInflows.length >= 3) {
    signals.push({
      id: `risk_${clientId}_mismatch`,
      clientId,
      clientName: ledger.clientName,
      signalType: "FREQUENT_MISMATCH",
      severity: "MEDIUM",
      description: `${unmatchedInflows.length} unmatched inflows`,
      detectedAt: new Date().toISOString(),
    });
  }

  return signals;
}

/**
 * Get all risk signals across all clients
 */
export function getAllRiskSignals(): RiskSignal[] {
  const ledgers = calculateReceivableLedger();
  const allSignals: RiskSignal[] = [];

  ledgers.forEach((ledger) => {
    const signals = generateRiskFlags(ledger.clientId, ledger);
    allSignals.push(...signals);
  });

  return allSignals.sort((a, b) => {
    const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return (
      severityOrder[b.severity] - severityOrder[a.severity]
    );
  });
}

// ============================================
// 4. HELPER FUNCTIONS
// ============================================

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

export function getStatusColor(status: ClientStatus): string {
  switch (status) {
    case "HEALTHY":
      return "emerald";
    case "WARNING":
      return "amber";
    case "CRITICAL":
      return "red";
  }
}

export function getStatusBadge(status: ClientStatus): string {
  switch (status) {
    case "HEALTHY":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "WARNING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "CRITICAL":
      return "bg-red-100 text-red-700 border-red-200";
  }
}