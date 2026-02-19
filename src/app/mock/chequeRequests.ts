/**
 * STOP CHEQUE REQUEST MOCK DATA STORE
 * Non-money-moving service request records for cheque stop instructions.
 * Each entry links to approvalId (where applicable) and auditId.
 */

export type StopChequeStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTED";

export interface StopChequeRequest {
  id: string;
  accountNumber: string;
  accountLabel: string;
  chequeNumberFrom: string;
  chequeNumberTo: string;
  reason: string;
  reasonDetail: string;
  effectiveDate: string;
  declaration: boolean;
  status: StopChequeStatus;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  approvalId: string | null;
  auditId: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export const STOP_CHEQUE_REQUESTS: StopChequeRequest[] = [
  {
    id: "sc_001",
    accountNumber: "2052836410001",
    accountLabel: "TEST-1 [2052836410001]",
    chequeNumberFrom: "000451",
    chequeNumberTo: "000451",
    reason: "Lost",
    reasonDetail: "Cheque lost during courier delivery to vendor",
    effectiveDate: "2026-02-10",
    declaration: true,
    status: "PENDING_APPROVAL",
    submittedBy: "usr_002",
    submittedByName: "Fatima Khan",
    submittedAt: "2026-02-10T09:15:00.000Z",
    approvalId: "apr_sc_001",
    auditId: "audit_sc_001",
  },
  {
    id: "sc_002",
    accountNumber: "2052836410001",
    accountLabel: "TEST-1 [2052836410001]",
    chequeNumberFrom: "000320",
    chequeNumberTo: "000322",
    reason: "Stolen",
    reasonDetail: "Chequebook reported stolen from office premises",
    effectiveDate: "2026-02-08",
    declaration: true,
    status: "APPROVED",
    submittedBy: "usr_002",
    submittedByName: "Fatima Khan",
    submittedAt: "2026-02-08T14:20:00.000Z",
    approvalId: "apr_sc_002",
    auditId: "audit_sc_002",
    resolvedBy: "Sarah Rahman",
    resolvedAt: "2026-02-08T15:45:00.000Z",
  },
  {
    id: "sc_003",
    accountNumber: "2052836410001",
    accountLabel: "TEST-1 [2052836410001]",
    chequeNumberFrom: "000189",
    chequeNumberTo: "000189",
    reason: "Payment Cancelled",
    reasonDetail: "Vendor contract terminated — payment no longer due",
    effectiveDate: "2026-02-05",
    declaration: true,
    status: "REJECTED",
    submittedBy: "usr_003",
    submittedByName: "Rahim Ahmed",
    submittedAt: "2026-02-05T11:00:00.000Z",
    approvalId: "apr_sc_003",
    auditId: "audit_sc_003",
    resolvedBy: "Sarah Rahman",
    resolvedAt: "2026-02-05T16:30:00.000Z",
  },
  {
    id: "sc_004",
    accountNumber: "2052836410001",
    accountLabel: "TEST-1 [2052836410001]",
    chequeNumberFrom: "000275",
    chequeNumberTo: "000275",
    reason: "Issued in Error",
    reasonDetail: "Duplicate cheque issued — original already cleared",
    effectiveDate: "2026-01-28",
    declaration: true,
    status: "EXECUTED",
    submittedBy: "usr_001",
    submittedByName: "Admin User",
    submittedAt: "2026-01-28T10:05:00.000Z",
    approvalId: null,
    auditId: "audit_sc_004",
    resolvedBy: "Admin User",
    resolvedAt: "2026-01-28T10:05:00.000Z",
  },
  {
    id: "sc_005",
    accountNumber: "2052836410001",
    accountLabel: "TEST-1 [2052836410001]",
    chequeNumberFrom: "000500",
    chequeNumberTo: "000504",
    reason: "Lost",
    reasonDetail: "Blank cheque leaves lost from chequebook",
    effectiveDate: "2026-01-20",
    declaration: true,
    status: "PENDING_APPROVAL",
    submittedBy: "usr_002",
    submittedByName: "Fatima Khan",
    submittedAt: "2026-01-20T08:30:00.000Z",
    approvalId: "apr_sc_005",
    auditId: "audit_sc_005",
  },
];

export function addStopChequeRequest(req: StopChequeRequest): void {
  STOP_CHEQUE_REQUESTS.unshift(req);
}

export function getStopChequeRequests(): StopChequeRequest[] {
  return [...STOP_CHEQUE_REQUESTS];
}