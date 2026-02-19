// Cash Locks — Hard preventive controls for outflow discipline
// No intelligence, no automation, no suggestions. Pure friction.

export type LockType = "no-debit-window" | "daily-outflow-cap" | "emergency-override";
export type LockStatus = "active" | "inactive";

export interface NoDebitWindowConfig {
  dailyStart: string; // "20:00"
  dailyEnd: string; // "08:00"
  weekendBlocked: boolean;
}

export interface DailyOutflowCapConfig {
  capAmount: number;
  usedToday: number;
}

export interface CashLock {
  id: string;
  type: LockType;
  label: string;
  description: string;
  status: LockStatus;
  lastModifiedBy: string;
  lastModifiedAt: string;
  noDebitConfig?: NoDebitWindowConfig;
  outflowCapConfig?: DailyOutflowCapConfig;
}

export type TraceEventType =
  | "lock_enabled"
  | "lock_disabled"
  | "lock_breached"
  | "override_used"
  | "cap_enforced";

export interface CashLockTraceEvent {
  id: string;
  timestamp: string;
  type: TraceEventType;
  lockType: LockType;
  description: string;
  actor: string;
}

// ── Data ──

export const CASH_LOCKS: CashLock[] = [
  {
    id: "lock_ndw",
    type: "no-debit-window",
    label: "No-Debit Windows",
    description: "Block all outflows during specified hours and weekends",
    status: "active",
    lastModifiedBy: "Karim Hossain",
    lastModifiedAt: "Feb 17, 2026 · 09:14 AM",
    noDebitConfig: {
      dailyStart: "20:00",
      dailyEnd: "08:00",
      weekendBlocked: true,
    },
  },
  {
    id: "lock_doc",
    type: "daily-outflow-cap",
    label: "Daily Outflow Cap",
    description: "Maximum total outflow allowed per calendar day",
    status: "active",
    lastModifiedBy: "Karim Hossain",
    lastModifiedAt: "Feb 16, 2026 · 03:42 PM",
    outflowCapConfig: {
      capAmount: 2500000, // ৳25L
      usedToday: 870000, // ৳8.7L
    },
  },
  {
    id: "lock_eo",
    type: "emergency-override",
    label: "Emergency Override",
    description: "Manual unlock requiring explicit reason and confirmation",
    status: "inactive",
    lastModifiedBy: "Nasreen Akter",
    lastModifiedAt: "Feb 12, 2026 · 06:18 PM",
  },
];

export const LOCK_TRACE: CashLockTraceEvent[] = [
  {
    id: "trace_001",
    timestamp: "Feb 17, 2026 · 08:00 AM",
    type: "lock_enabled",
    lockType: "no-debit-window",
    description: "No-Debit Window activated (daily schedule)",
    actor: "System",
  },
  {
    id: "trace_002",
    timestamp: "Feb 16, 2026 · 09:22 PM",
    type: "lock_breached",
    lockType: "no-debit-window",
    description: "Outflow attempt blocked — outside permitted hours",
    actor: "Rafiq Uddin",
  },
  {
    id: "trace_003",
    timestamp: "Feb 16, 2026 · 04:15 PM",
    type: "cap_enforced",
    lockType: "daily-outflow-cap",
    description: "Daily cap reached — further outflows blocked for today",
    actor: "System",
  },
  {
    id: "trace_004",
    timestamp: "Feb 12, 2026 · 06:18 PM",
    type: "override_used",
    lockType: "emergency-override",
    description: "Emergency override used — reason: Urgent supplier payment",
    actor: "Nasreen Akter",
  },
  {
    id: "trace_005",
    timestamp: "Feb 12, 2026 · 06:45 PM",
    type: "lock_enabled",
    lockType: "no-debit-window",
    description: "Locks restored after emergency override expiry",
    actor: "System",
  },
];

// Utilities
export const formatLockCurrency = (amount: number): string => {
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `৳${lakh.toFixed(1)}L`;
  }
  return `৳${amount.toLocaleString("en-IN")}`;
};

export const formatTime24to12 = (time24: string): string => {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
};