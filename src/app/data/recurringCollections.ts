/**
 * RECURRING COLLECTIONS DATA MODEL
 * Phase B1: Governed time-based collection schedules
 * // GOVERNANCE_ENFORCEMENT — Every schedule action and run hits governance engine
 */

// ============================================
// 1. TYPES
// ============================================

export type RecurringFrequency = "WEEKLY" | "MONTHLY";

export type RecurringStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export type RunOutcome =
  | "COLLECTED"
  | "MISSED"
  | "OVERDUE"
  | "BLOCKED"
  | "APPROVAL_PENDING";

export interface RecurringRunRecord {
  id: string;
  scheduledDate: string;
  executedDate?: string;
  outcome: RunOutcome;
  amount: number;
  governanceAuditId?: string;
  note?: string;
}

export interface RecurringCollection {
  id: string;
  customerId: string;
  customerName: string;
  invoiceRef?: string;
  amount: number;
  frequency: RecurringFrequency;
  startDate: string;
  nextRunDate: string;
  endDate?: string;
  status: RecurringStatus;
  totalCollected: number;
  totalMissed: number;
  runCount: number;
  runHistory: RecurringRunRecord[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedByName?: string;
  lastModifiedAt?: string;
  pauseReason?: string;
  cancelReason?: string;
}

// ============================================
// 2. MOCK DATA — 6 schedules with varied states
// ============================================

export const RECURRING_COLLECTIONS: RecurringCollection[] = [
  {
    id: "rc_001",
    customerId: "CUST-001",
    customerName: "Rahman Textiles Ltd",
    invoiceRef: "INV-2026-001",
    amount: 85000,
    frequency: "MONTHLY",
    startDate: "2025-11-01",
    nextRunDate: "2026-03-01",
    status: "ACTIVE",
    totalCollected: 255000,
    totalMissed: 85000,
    runCount: 4,
    runHistory: [
      {
        id: "run_001_01",
        scheduledDate: "2025-11-01",
        executedDate: "2025-11-01",
        outcome: "COLLECTED",
        amount: 85000,
        governanceAuditId: "audit_rc_001a",
      },
      {
        id: "run_001_02",
        scheduledDate: "2025-12-01",
        executedDate: "2025-12-01",
        outcome: "COLLECTED",
        amount: 85000,
        governanceAuditId: "audit_rc_001b",
      },
      {
        id: "run_001_03",
        scheduledDate: "2026-01-01",
        outcome: "MISSED",
        amount: 85000,
        note: "Customer did not respond to collection request",
      },
      {
        id: "run_001_04",
        scheduledDate: "2026-02-01",
        executedDate: "2026-02-03",
        outcome: "COLLECTED",
        amount: 85000,
        governanceAuditId: "audit_rc_001d",
        note: "Collected 2 days late",
      },
    ],
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2025-10-25T10:30:00Z",
  },
  {
    id: "rc_002",
    customerId: "CUST-002",
    customerName: "City Steel Industries",
    invoiceRef: "INV-2026-002",
    amount: 125000,
    frequency: "MONTHLY",
    startDate: "2025-12-15",
    nextRunDate: "2026-03-15",
    status: "ACTIVE",
    totalCollected: 250000,
    totalMissed: 0,
    runCount: 3,
    runHistory: [
      {
        id: "run_002_01",
        scheduledDate: "2025-12-15",
        executedDate: "2025-12-15",
        outcome: "COLLECTED",
        amount: 125000,
        governanceAuditId: "audit_rc_002a",
      },
      {
        id: "run_002_02",
        scheduledDate: "2026-01-15",
        executedDate: "2026-01-15",
        outcome: "COLLECTED",
        amount: 125000,
        governanceAuditId: "audit_rc_002b",
      },
      {
        id: "run_002_03",
        scheduledDate: "2026-02-15",
        outcome: "OVERDUE",
        amount: 125000,
        note: "3 days overdue — awaiting customer response",
      },
    ],
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2025-12-10T09:00:00Z",
  },
  {
    id: "rc_003",
    customerId: "CUST-005",
    customerName: "Apex Trading Co",
    amount: 45000,
    frequency: "WEEKLY",
    startDate: "2026-01-06",
    nextRunDate: "2026-02-24",
    status: "ACTIVE",
    totalCollected: 315000,
    totalMissed: 0,
    runCount: 7,
    runHistory: [
      {
        id: "run_003_01",
        scheduledDate: "2026-01-06",
        executedDate: "2026-01-06",
        outcome: "COLLECTED",
        amount: 45000,
        governanceAuditId: "audit_rc_003a",
      },
      {
        id: "run_003_02",
        scheduledDate: "2026-01-13",
        executedDate: "2026-01-13",
        outcome: "COLLECTED",
        amount: 45000,
        governanceAuditId: "audit_rc_003b",
      },
      {
        id: "run_003_03",
        scheduledDate: "2026-01-20",
        executedDate: "2026-01-20",
        outcome: "COLLECTED",
        amount: 45000,
        governanceAuditId: "audit_rc_003c",
      },
      {
        id: "run_003_04",
        scheduledDate: "2026-01-27",
        executedDate: "2026-01-27",
        outcome: "COLLECTED",
        amount: 45000,
        governanceAuditId: "audit_rc_003d",
      },
      {
        id: "run_003_05",
        scheduledDate: "2026-02-03",
        executedDate: "2026-02-03",
        outcome: "COLLECTED",
        amount: 45000,
        governanceAuditId: "audit_rc_003e",
      },
      {
        id: "run_003_06",
        scheduledDate: "2026-02-10",
        executedDate: "2026-02-10",
        outcome: "COLLECTED",
        amount: 45000,
        governanceAuditId: "audit_rc_003f",
      },
      {
        id: "run_003_07",
        scheduledDate: "2026-02-17",
        executedDate: "2026-02-17",
        outcome: "COLLECTED",
        amount: 45000,
        governanceAuditId: "audit_rc_003g",
      },
    ],
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-01-03T14:00:00Z",
  },
  {
    id: "rc_004",
    customerId: "CUST-007",
    customerName: "Metro Pharma Distribution",
    invoiceRef: "INV-2026-007",
    amount: 55000,
    frequency: "MONTHLY",
    startDate: "2026-01-01",
    nextRunDate: "2026-02-01",
    status: "PAUSED",
    totalCollected: 55000,
    totalMissed: 0,
    runCount: 1,
    runHistory: [
      {
        id: "run_004_01",
        scheduledDate: "2026-01-01",
        executedDate: "2026-01-01",
        outcome: "COLLECTED",
        amount: 55000,
        governanceAuditId: "audit_rc_004a",
      },
    ],
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2025-12-28T11:00:00Z",
    lastModifiedBy: "usr_002",
    lastModifiedByName: "Fatima Khan",
    lastModifiedAt: "2026-01-15T09:30:00Z",
    pauseReason: "Customer requested temporary hold pending contract renegotiation",
  },
  {
    id: "rc_005",
    customerId: "CUST-003",
    customerName: "Green Valley Suppliers",
    invoiceRef: "INV-2026-003",
    amount: 64000,
    frequency: "MONTHLY",
    startDate: "2025-10-01",
    nextRunDate: "2026-01-01",
    status: "CANCELLED",
    totalCollected: 128000,
    totalMissed: 64000,
    runCount: 3,
    runHistory: [
      {
        id: "run_005_01",
        scheduledDate: "2025-10-01",
        executedDate: "2025-10-01",
        outcome: "COLLECTED",
        amount: 64000,
        governanceAuditId: "audit_rc_005a",
      },
      {
        id: "run_005_02",
        scheduledDate: "2025-11-01",
        executedDate: "2025-11-01",
        outcome: "COLLECTED",
        amount: 64000,
        governanceAuditId: "audit_rc_005b",
      },
      {
        id: "run_005_03",
        scheduledDate: "2025-12-01",
        outcome: "MISSED",
        amount: 64000,
        note: "Customer account frozen — collection failed",
      },
    ],
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2025-09-25T08:00:00Z",
    lastModifiedBy: "usr_004",
    lastModifiedByName: "Sarah Rahman",
    lastModifiedAt: "2025-12-10T16:00:00Z",
    cancelReason: "Customer defaulted — escalated to legal",
  },
  {
    id: "rc_006",
    customerId: "CUST-008",
    customerName: "Tech Solutions BD",
    amount: 38000,
    frequency: "WEEKLY",
    startDate: "2026-02-03",
    nextRunDate: "2026-02-24",
    status: "ACTIVE",
    totalCollected: 76000,
    totalMissed: 38000,
    runCount: 3,
    runHistory: [
      {
        id: "run_006_01",
        scheduledDate: "2026-02-03",
        executedDate: "2026-02-03",
        outcome: "COLLECTED",
        amount: 38000,
        governanceAuditId: "audit_rc_006a",
      },
      {
        id: "run_006_02",
        scheduledDate: "2026-02-10",
        outcome: "BLOCKED",
        amount: 38000,
        governanceAuditId: "audit_rc_006b",
        note: "Governance blocked — daily limit exceeded at time of run",
      },
      {
        id: "run_006_03",
        scheduledDate: "2026-02-17",
        executedDate: "2026-02-17",
        outcome: "COLLECTED",
        amount: 38000,
        governanceAuditId: "audit_rc_006c",
      },
    ],
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-01-30T10:00:00Z",
  },
];

// ============================================
// 3. UTILITY FUNCTIONS
// ============================================

export function getActiveSchedules(): RecurringCollection[] {
  return RECURRING_COLLECTIONS.filter((s) => s.status === "ACTIVE");
}

export function getPausedSchedules(): RecurringCollection[] {
  return RECURRING_COLLECTIONS.filter((s) => s.status === "PAUSED");
}

export function getTotalScheduledMonthly(): number {
  return RECURRING_COLLECTIONS.filter(
    (s) => s.status === "ACTIVE" && s.frequency === "MONTHLY"
  ).reduce((sum, s) => sum + s.amount, 0);
}

export function getTotalScheduledWeekly(): number {
  return RECURRING_COLLECTIONS.filter(
    (s) => s.status === "ACTIVE" && s.frequency === "WEEKLY"
  ).reduce((sum, s) => sum + s.amount, 0);
}

export function getCollectionRate(): number {
  const allRuns = RECURRING_COLLECTIONS.flatMap((s) => s.runHistory);
  if (allRuns.length === 0) return 0;
  const collected = allRuns.filter((r) => r.outcome === "COLLECTED").length;
  return Math.round((collected / allRuns.length) * 100);
}

export function getOverdueRuns(): RecurringRunRecord[] {
  return RECURRING_COLLECTIONS.flatMap((s) =>
    s.runHistory.filter((r) => r.outcome === "OVERDUE" || r.outcome === "MISSED")
  );
}

export function getRunOutcomeConfig(outcome: RunOutcome): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  const config: Record<RunOutcome, { label: string; bg: string; text: string; border: string }> = {
    COLLECTED: {
      label: "Collected",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    },
    MISSED: {
      label: "Missed",
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/30",
    },
    OVERDUE: {
      label: "Overdue",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
    },
    BLOCKED: {
      label: "Blocked",
      bg: "bg-red-500/10",
      text: "text-red-300",
      border: "border-red-500/20",
    },
    APPROVAL_PENDING: {
      label: "Approval Pending",
      bg: "bg-amber-500/10",
      text: "text-amber-300",
      border: "border-amber-500/20",
    },
  };
  return config[outcome];
}

export function getStatusConfig(status: RecurringStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  const config: Record<RecurringStatus, { label: string; bg: string; text: string; border: string }> = {
    ACTIVE: {
      label: "Active",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    },
    PAUSED: {
      label: "Paused",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
    },
    CANCELLED: {
      label: "Cancelled",
      bg: "bg-white/5",
      text: "text-white/40",
      border: "border-white/10",
    },
  };
  return config[status];
}

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}