/**
 * QUICK PAY — RECENT PAYMENT SHORTCUTS
 * Payments-tab-only. Prefill + navigate. Never auto-executes.
 *
 * ⚠️ This store provides read-only recent payment data.
 * Tapping a Quick Pay entry opens the corresponding flow with fields pre-filled.
 * All governance enforcement still applies after navigation.
 */

export type QuickPayMethod = "OWN_ACCOUNT" | "THIRD_PARTY" | "MFS";

export interface QuickPayEntry {
  id: string;
  payeeName: string;
  method: QuickPayMethod;
  lastAmount: number;
  referenceId: string;
  /** For THIRD_PARTY: beneficiary ID from BENEFICIARIES */
  beneficiaryId?: string;
  /** For MFS: provider name */
  mfsProvider?: string;
  /** For MFS: wallet number */
  mfsWalletNumber?: string;
  lastPaidDate: string;
}

export const QUICK_PAY_ENTRIES: QuickPayEntry[] = [
  {
    id: "qp_001",
    payeeName: "Rahman Textiles Ltd",
    method: "THIRD_PARTY",
    lastAmount: 250000,
    referenceId: "TXN-TP-20260217-001",
    beneficiaryId: "BEN-001",
    lastPaidDate: "2026-02-17T09:15:00Z",
  },
  {
    id: "qp_002",
    payeeName: "Own Account (Savings → Current)",
    method: "OWN_ACCOUNT",
    lastAmount: 500000,
    referenceId: "TXN-OA-20260216-003",
    lastPaidDate: "2026-02-16T14:20:00Z",
  },
  {
    id: "qp_003",
    payeeName: "Rafsan Jany",
    method: "MFS",
    lastAmount: 25000,
    referenceId: "TXN-MFS-20260215-007",
    mfsProvider: "bKash",
    mfsWalletNumber: "01755998811",
    lastPaidDate: "2026-02-15T11:45:00Z",
  },
  {
    id: "qp_004",
    payeeName: "Ocean Logistics Pvt Ltd",
    method: "THIRD_PARTY",
    lastAmount: 180000,
    referenceId: "TXN-TP-20260214-005",
    beneficiaryId: "BEN-004",
    lastPaidDate: "2026-02-14T16:30:00Z",
  },
  {
    id: "qp_005",
    payeeName: "Karim Hossain",
    method: "MFS",
    lastAmount: 15000,
    referenceId: "TXN-MFS-20260213-002",
    mfsProvider: "Nagad",
    mfsWalletNumber: "01822334455",
    lastPaidDate: "2026-02-13T08:50:00Z",
  },
];

/** Label for method badge */
export function getMethodLabel(method: QuickPayMethod): string {
  const labels: Record<QuickPayMethod, string> = {
    OWN_ACCOUNT: "Own Account",
    THIRD_PARTY: "Third Party",
    MFS: "MFS",
  };
  return labels[method];
}

/** Colour config for method badge */
export function getMethodStyle(method: QuickPayMethod) {
  const styles: Record<QuickPayMethod, { bg: string; text: string; border: string }> = {
    OWN_ACCOUNT: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" },
    THIRD_PARTY: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
    MFS: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  };
  return styles[method];
}