/**
 * SCHEDULED PAYMENTS DATA MODEL
 * Phase B2: Single-run governed outflow delay
 * // GOVERNANCE_ENFORCEMENT — Every schedule action and execution hits governance engine
 *
 * NOT recurring. NOT autopay. Time-shifted execution under governance.
 * Governance re-evaluates on execution day — prior approval never assumed.
 */

import type { TransactionCategory } from "./adminGovernance";

// ============================================
// 1. TYPES
// ============================================

export type PaymentMethod = "OWN_ACCOUNT" | "THIRD_PARTY" | "MFS";

export type ScheduleOutcome =
  | "SCHEDULED"
  | "EXECUTED"
  | "BLOCKED"
  | "APPROVAL_REQUIRED"
  | "CANCELLED";

export interface ScheduledPayment {
  id: string;
  /** Original intent */
  amount: number;
  beneficiaryName: string;
  beneficiaryAccount: string;
  paymentMethod: PaymentMethod;
  sourceAccount: string;
  memo: string;
  /** Timing */
  scheduledDate: string; // ISO date (YYYY-MM-DD), always future at creation
  /** Lifecycle */
  outcome: ScheduleOutcome;
  /** Actors */
  createdBy: string;
  createdByName: string;
  createdAt: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  executedAt?: string;
  /** Audit linkage */
  creationAuditId: string;
  executionAuditId?: string;
  cancellationAuditId?: string;
  /** Cancellation */
  cancelReason?: string;
  cancelledBy?: string;
  cancelledByName?: string;
  cancelledAt?: string;
  /** Governance metadata */
  creationOutcome: "ALLOWED" | "BLOCKED" | "APPROVAL_REQUIRED";
  executionOutcome?: "ALLOWED" | "BLOCKED" | "APPROVAL_REQUIRED";
  executionBlockReason?: string;
}

// ============================================
// 2. HELPER: PaymentMethod → TransactionCategory
// ============================================

export function methodToCategory(method: PaymentMethod): TransactionCategory {
  const map: Record<PaymentMethod, TransactionCategory> = {
    OWN_ACCOUNT: "OWN_ACCOUNT",
    THIRD_PARTY: "THIRD_PARTY",
    MFS: "MFS",
  };
  return map[method];
}

export function methodLabel(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    OWN_ACCOUNT: "Own Account Transfer",
    THIRD_PARTY: "Third-Party Transfer",
    MFS: "Mobile Financial Services",
  };
  return map[method];
}

// ============================================
// 3. MOCK DATA — 6 schedules with varied states
// ============================================

export const SCHEDULED_PAYMENTS: ScheduledPayment[] = [
  {
    id: "sp_001",
    amount: 320000,
    beneficiaryName: "Acme Corporation",
    beneficiaryAccount: "0112-3456789-001",
    paymentMethod: "THIRD_PARTY",
    sourceAccount: "2001-0012345-01 (Operating)",
    memo: "Invoice INV-2026-044 — raw materials Q1",
    scheduledDate: "2026-02-25",
    outcome: "SCHEDULED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-02-16T09:30:00Z",
    creationAuditId: "audit_sp_001a",
    creationOutcome: "ALLOWED",
  },
  {
    id: "sp_002",
    amount: 85000,
    beneficiaryName: "Hazi Traders — Savings",
    beneficiaryAccount: "2001-0012345-02 (Savings)",
    paymentMethod: "OWN_ACCOUNT",
    sourceAccount: "2001-0012345-01 (Operating)",
    memo: "Monthly reserve sweep — Feb 2026",
    scheduledDate: "2026-02-20",
    outcome: "EXECUTED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-02-10T11:00:00Z",
    executedAt: "2026-02-20T06:00:00Z",
    creationAuditId: "audit_sp_002a",
    executionAuditId: "audit_sp_002b",
    creationOutcome: "ALLOWED",
    executionOutcome: "ALLOWED",
  },
  {
    id: "sp_003",
    amount: 750000,
    beneficiaryName: "Delta Enterprises",
    beneficiaryAccount: "0145-9876543-002",
    paymentMethod: "THIRD_PARTY",
    sourceAccount: "2001-0012345-01 (Operating)",
    memo: "Equipment lease — March instalment",
    scheduledDate: "2026-03-01",
    outcome: "APPROVAL_REQUIRED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-02-14T15:45:00Z",
    creationAuditId: "audit_sp_003a",
    creationOutcome: "APPROVAL_REQUIRED",
  },
  {
    id: "sp_004",
    amount: 18000,
    beneficiaryName: "01711-234567 (Karim Uddin)",
    beneficiaryAccount: "bKash: 01711-234567",
    paymentMethod: "MFS",
    sourceAccount: "2001-0012345-01 (Operating)",
    memo: "Delivery advance — Chittagong route",
    scheduledDate: "2026-02-22",
    outcome: "SCHEDULED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-02-17T08:20:00Z",
    creationAuditId: "audit_sp_004a",
    creationOutcome: "ALLOWED",
  },
  {
    id: "sp_005",
    amount: 450000,
    beneficiaryName: "Beta Industries Ltd",
    beneficiaryAccount: "0178-5432109-003",
    paymentMethod: "THIRD_PARTY",
    sourceAccount: "2001-0012345-01 (Operating)",
    memo: "Vendor settlement — cancelled due to dispute",
    scheduledDate: "2026-02-19",
    outcome: "CANCELLED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-02-12T10:00:00Z",
    creationAuditId: "audit_sp_005a",
    cancellationAuditId: "audit_sp_005c",
    cancelReason: "Payment disputed — vendor invoice under review",
    cancelledBy: "usr_002",
    cancelledByName: "Fatima Khan",
    cancelledAt: "2026-02-18T14:30:00Z",
    creationOutcome: "ALLOWED",
  },
  {
    id: "sp_006",
    amount: 62000,
    beneficiaryName: "Hazi Traders — Tax Reserve",
    beneficiaryAccount: "2001-0012345-03 (Tax Vault)",
    paymentMethod: "OWN_ACCOUNT",
    sourceAccount: "2001-0012345-01 (Operating)",
    memo: "VAT provision — Feb 2026",
    scheduledDate: "2026-02-18",
    outcome: "BLOCKED",
    createdBy: "usr_002",
    createdByName: "Fatima Khan",
    createdAt: "2026-02-11T13:00:00Z",
    creationAuditId: "audit_sp_006a",
    executionAuditId: "audit_sp_006b",
    creationOutcome: "ALLOWED",
    executionOutcome: "BLOCKED",
    executionBlockReason:
      "Role changed to viewer before execution date — governance blocked disbursement",
  },
];

// ============================================
// 4. UTILITY FUNCTIONS
// ============================================

export function getScheduledPayments(): ScheduledPayment[] {
  return SCHEDULED_PAYMENTS.filter((s) => s.outcome === "SCHEDULED");
}

export function getExecutedPayments(): ScheduledPayment[] {
  return SCHEDULED_PAYMENTS.filter((s) => s.outcome === "EXECUTED");
}

export function getBlockedPayments(): ScheduledPayment[] {
  return SCHEDULED_PAYMENTS.filter((s) => s.outcome === "BLOCKED");
}

export function getTotalScheduledOutflow(): number {
  return SCHEDULED_PAYMENTS.filter(
    (s) => s.outcome === "SCHEDULED"
  ).reduce((sum, s) => sum + s.amount, 0);
}

export function getTotalExecutedOutflow(): number {
  return SCHEDULED_PAYMENTS.filter(
    (s) => s.outcome === "EXECUTED"
  ).reduce((sum, s) => sum + s.amount, 0);
}

export function getOutcomeConfig(outcome: ScheduleOutcome): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  const config: Record<
    ScheduleOutcome,
    { label: string; bg: string; text: string; border: string }
  > = {
    SCHEDULED: {
      label: "Scheduled",
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
    },
    EXECUTED: {
      label: "Executed",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    },
    BLOCKED: {
      label: "Blocked",
      bg: "bg-red-500/10",
      text: "text-red-300",
      border: "border-red-500/20",
    },
    APPROVAL_REQUIRED: {
      label: "Approval Required",
      bg: "bg-amber-500/10",
      text: "text-amber-300",
      border: "border-amber-500/20",
    },
    CANCELLED: {
      label: "Cancelled",
      bg: "bg-white/5",
      text: "text-white/40",
      border: "border-white/10",
    },
  };
  return config[outcome];
}

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}

/**
 * Returns minimum schedule date (tomorrow).
 * Default is always future — never today.
 */
export function getMinScheduleDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

export function getDefaultScheduleDate(): string {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toISOString().split("T")[0];
}