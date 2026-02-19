/**
 * DISPUTE MANAGEMENT DATA STORE
 * Non-money-moving service request records for transaction disputes.
 * Each entry links to approvalId (where applicable) and auditId.
 * Disputes are claims — they do not alter transaction state.
 * All amounts are BDT.
 */

export type DisputeStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "REJECTED";

export type DisputeCategory =
  | "Wrong Debit"
  | "Duplicate"
  | "Failed"
  | "Other";

export interface Dispute {
  disputeId: string;
  transactionId: string;
  transactionRef: string;
  transactionType: "Transfer" | "Bill" | "MFS" | "Other";
  amount: number;
  recipientName: string;
  category: DisputeCategory;
  description: string;
  attachment: string | null;
  status: DisputeStatus;
  raisedBy: string;
  raisedByName: string;
  createdAt: string;
  approvalId: string | null;
  auditId: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNote: string | null;
}

export const DISPUTES: Dispute[] = [
  {
    disputeId: "dsp_001",
    transactionId: "txn_001",
    transactionRef: "TXN2025021501",
    transactionType: "Transfer",
    amount: 250000,
    recipientName: "Acme Corporation",
    category: "Wrong Debit",
    description:
      "Incorrect amount debited for supplier payment — invoice amount was BDT 200,000 but BDT 250,000 was charged.",
    attachment: "invoice_acme_feb2026.pdf",
    status: "SUBMITTED",
    raisedBy: "usr_002",
    raisedByName: "Rahim Ahmed",
    createdAt: "2026-02-16T09:30:00.000Z",
    approvalId: "apr_dsp_001",
    auditId: "audit_dsp_001",
    resolvedAt: null,
    resolvedBy: null,
    resolutionNote: null,
  },
  {
    disputeId: "dsp_002",
    transactionId: "txn_002",
    transactionRef: "TXN2025021601",
    transactionType: "MFS",
    amount: 85000,
    recipientName: "Ali Hasan",
    category: "Duplicate",
    description:
      "Salary payment was processed twice for Ali Hasan — duplicate MFS transfer detected on same date.",
    attachment: "payroll_report_feb2026.xlsx",
    status: "UNDER_REVIEW",
    raisedBy: "usr_002",
    raisedByName: "Rahim Ahmed",
    createdAt: "2026-02-14T11:15:00.000Z",
    approvalId: "apr_dsp_002",
    auditId: "audit_dsp_002",
    resolvedAt: null,
    resolvedBy: null,
    resolutionNote: null,
  },
  {
    disputeId: "dsp_003",
    transactionId: "txn_003",
    transactionRef: "TXN2025021701",
    transactionType: "Transfer",
    amount: 480000,
    recipientName: "Tech Solutions Ltd",
    category: "Failed",
    description:
      "Service fee transfer marked as completed but recipient confirms funds were never received — BRAC Bank intermediary issue suspected.",
    attachment: null,
    status: "RESOLVED",
    raisedBy: "usr_003",
    raisedByName: "Nusrat Khan",
    createdAt: "2026-02-10T14:45:00.000Z",
    approvalId: "apr_dsp_003",
    auditId: "audit_dsp_003",
    resolvedAt: "2026-02-13T10:20:00.000Z",
    resolvedBy: "Tariq Hasan",
    resolutionNote:
      "Investigation confirmed intermediary routing delay. Funds credited to recipient on 2026-02-12.",
  },
  {
    disputeId: "dsp_004",
    transactionId: "txn_004",
    transactionRef: "TXN2025021702",
    transactionType: "Transfer",
    amount: 1500000,
    recipientName: "Bengal Imports Ltd",
    category: "Wrong Debit",
    description:
      "Procurement payment was debited at an incorrect amount — purchase order agreed amount was BDT 1,450,000 but BDT 1,500,000 was charged.",
    attachment: "purchase_order_bengal_2026.pdf",
    status: "REJECTED",
    raisedBy: "usr_002",
    raisedByName: "Rahim Ahmed",
    createdAt: "2026-02-08T08:00:00.000Z",
    approvalId: "apr_dsp_004",
    auditId: "audit_dsp_004",
    resolvedAt: "2026-02-11T16:50:00.000Z",
    resolvedBy: "Tariq Hasan",
    resolutionNote:
      "Amount debited includes bank processing charges and applicable VAT. All charges were disclosed at initiation. Dispute rejected.",
  },
  {
    disputeId: "dsp_005",
    transactionId: "txn_001",
    transactionRef: "TXN2025021501",
    transactionType: "Bill",
    amount: 32500,
    recipientName: "Dhaka Electric Supply Co.",
    category: "Other",
    description:
      "Utility bill payment processed for a premises no longer under our lease agreement — payment should not have been initiated.",
    attachment: "lease_termination_notice.pdf",
    status: "UNDER_REVIEW",
    raisedBy: "usr_003",
    raisedByName: "Nusrat Khan",
    createdAt: "2026-02-12T10:00:00.000Z",
    approvalId: "apr_dsp_005",
    auditId: "audit_dsp_005",
    resolvedAt: null,
    resolvedBy: null,
    resolutionNote: null,
  },
  {
    disputeId: "dsp_006",
    transactionId: "txn_002",
    transactionRef: "TXN2025021601",
    transactionType: "MFS",
    amount: 15000,
    recipientName: "Nadia Begum",
    category: "Failed",
    description:
      "MFS disbursement to vendor Nadia Begum failed with timeout but amount was still debited from account.",
    attachment: null,
    status: "SUBMITTED",
    raisedBy: "usr_002",
    raisedByName: "Rahim Ahmed",
    createdAt: "2026-02-17T15:30:00.000Z",
    approvalId: "apr_dsp_006",
    auditId: "audit_dsp_006",
    resolvedAt: null,
    resolvedBy: null,
    resolutionNote: null,
  },
];

export function getDisputes(): Dispute[] {
  return [...DISPUTES];
}

export function getDisputeById(id: string): Dispute | undefined {
  return DISPUTES.find((d) => d.disputeId === id);
}

export function addDispute(dispute: Dispute): void {
  DISPUTES.unshift(dispute);
}
