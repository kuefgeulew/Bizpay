/**
 * SUPPORT TICKETS MOCK DATA STORE
 * Non-money-moving service request records for in-app ticketing.
 * Tickets are immutable post-creation — no edits, no status changes from UI.
 * Each ticket links to approvalId (where applicable) and auditId.
 */

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type TicketCategory =
  | "Service"
  | "Technical"
  | "Transaction"
  | "Other";

export interface SupportTicket {
  ticketId: string;
  category: TicketCategory;
  subject: string;
  description: string;
  attachment: string | null;
  status: TicketStatus;
  raisedBy: string;
  raisedByName: string;
  assignedRmId: string;
  assignedRmName: string;
  createdAt: string;
  updatedAt: string;
  approvalId: string | null;
  auditId: string;
  timeline: TicketTimelineEntry[];
}

export interface TicketTimelineEntry {
  timestamp: string;
  status: TicketStatus;
  note: string;
  actor: string;
}

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    ticketId: "TKT-2026-001",
    category: "Service",
    subject: "Account statement generation failing",
    description:
      "Unable to generate account statements for the period Jan 2026. The system returns a timeout error after 30 seconds of processing.",
    attachment: "error_screenshot_jan2026.png",
    status: "OPEN",
    raisedBy: "usr_002",
    raisedByName: "Fatima Khan",
    assignedRmId: "rm_001",
    assignedRmName: "Nusrat Jahan Chowdhury",
    createdAt: "2026-02-17T10:30:00.000Z",
    updatedAt: "2026-02-17T10:30:00.000Z",
    approvalId: null,
    auditId: "audit_tkt_001",
    timeline: [
      {
        timestamp: "2026-02-17T10:30:00.000Z",
        status: "OPEN",
        note: "Ticket created — awaiting assignment",
        actor: "Fatima Khan",
      },
    ],
  },
  {
    ticketId: "TKT-2026-002",
    category: "Technical",
    subject: "Software token not syncing after device change",
    description:
      "After migrating to a new mobile device, the software token fails to synchronise. Re-registration was attempted but the OTP validation loop persists.",
    attachment: "device_migration_log.txt",
    status: "IN_PROGRESS",
    raisedBy: "usr_002",
    raisedByName: "Fatima Khan",
    assignedRmId: "rm_001",
    assignedRmName: "Nusrat Jahan Chowdhury",
    createdAt: "2026-02-15T14:00:00.000Z",
    updatedAt: "2026-02-16T09:15:00.000Z",
    approvalId: "apr_tkt_002",
    auditId: "audit_tkt_002",
    timeline: [
      {
        timestamp: "2026-02-15T14:00:00.000Z",
        status: "OPEN",
        note: "Ticket created — software token issue reported",
        actor: "Fatima Khan",
      },
      {
        timestamp: "2026-02-16T09:15:00.000Z",
        status: "IN_PROGRESS",
        note: "Assigned to IT Security team for investigation",
        actor: "Nusrat Jahan Chowdhury",
      },
    ],
  },
  {
    ticketId: "TKT-2026-003",
    category: "Transaction",
    subject: "RTGS transfer showing incorrect beneficiary name",
    description:
      "An RTGS transfer to account 1234567890 at Dutch-Bangla Bank displays an incorrect beneficiary name in the transaction history. The correct name is 'Hashem Traders Ltd'.",
    attachment: null,
    status: "WAITING_FOR_CUSTOMER",
    raisedBy: "usr_003",
    raisedByName: "Rahim Ahmed",
    assignedRmId: "rm_001",
    assignedRmName: "Nusrat Jahan Chowdhury",
    createdAt: "2026-02-13T11:45:00.000Z",
    updatedAt: "2026-02-15T16:30:00.000Z",
    approvalId: null,
    auditId: "audit_tkt_003",
    timeline: [
      {
        timestamp: "2026-02-13T11:45:00.000Z",
        status: "OPEN",
        note: "Ticket created — beneficiary name discrepancy reported",
        actor: "Rahim Ahmed",
      },
      {
        timestamp: "2026-02-14T10:00:00.000Z",
        status: "IN_PROGRESS",
        note: "Investigating beneficiary name mapping in BEFTN records",
        actor: "Nusrat Jahan Chowdhury",
      },
      {
        timestamp: "2026-02-15T16:30:00.000Z",
        status: "WAITING_FOR_CUSTOMER",
        note: "Requires confirmation of correct BEFTN beneficiary code from customer",
        actor: "Nusrat Jahan Chowdhury",
      },
    ],
  },
  {
    ticketId: "TKT-2026-004",
    category: "Service",
    subject: "Chequebook delivery not received",
    description:
      "Chequebook order placed on 2026-01-28 (reference CHQ-2026-019) has not been delivered. Branch confirmed dispatch on 2026-02-01 but courier tracking shows no movement since 2026-02-03.",
    attachment: "chequebook_order_ref.pdf",
    status: "IN_PROGRESS",
    raisedBy: "usr_002",
    raisedByName: "Fatima Khan",
    assignedRmId: "rm_001",
    assignedRmName: "Nusrat Jahan Chowdhury",
    createdAt: "2026-02-10T08:20:00.000Z",
    updatedAt: "2026-02-12T14:45:00.000Z",
    approvalId: "apr_tkt_004",
    auditId: "audit_tkt_004",
    timeline: [
      {
        timestamp: "2026-02-10T08:20:00.000Z",
        status: "OPEN",
        note: "Ticket created — chequebook delivery overdue",
        actor: "Fatima Khan",
      },
      {
        timestamp: "2026-02-12T14:45:00.000Z",
        status: "IN_PROGRESS",
        note: "Escalated to branch operations for courier re-dispatch",
        actor: "Nusrat Jahan Chowdhury",
      },
    ],
  },
  {
    ticketId: "TKT-2026-005",
    category: "Technical",
    subject: "PDF export rendering incorrectly on reports",
    description:
      "When exporting the Monthly Cash Flow report to PDF, the chart section renders with overlapping labels and the currency column is truncated. Issue occurs on all report types.",
    attachment: "broken_pdf_sample.pdf",
    status: "RESOLVED",
    raisedBy: "usr_003",
    raisedByName: "Rahim Ahmed",
    assignedRmId: "rm_001",
    assignedRmName: "Nusrat Jahan Chowdhury",
    createdAt: "2026-02-05T09:00:00.000Z",
    updatedAt: "2026-02-09T17:00:00.000Z",
    approvalId: null,
    auditId: "audit_tkt_005",
    timeline: [
      {
        timestamp: "2026-02-05T09:00:00.000Z",
        status: "OPEN",
        note: "Ticket created — PDF rendering issue reported",
        actor: "Rahim Ahmed",
      },
      {
        timestamp: "2026-02-06T11:30:00.000Z",
        status: "IN_PROGRESS",
        note: "Reproduced in staging — forwarded to engineering",
        actor: "Nusrat Jahan Chowdhury",
      },
      {
        timestamp: "2026-02-09T17:00:00.000Z",
        status: "RESOLVED",
        note: "Fix deployed — PDF export rendering corrected for all report types",
        actor: "Nusrat Jahan Chowdhury",
      },
    ],
  },
  {
    ticketId: "TKT-2026-006",
    category: "Transaction",
    subject: "Scheduled payment executed on wrong date",
    description:
      "A scheduled BEFTN payment to Sunrise Textiles was configured for 2026-02-10 but was executed on 2026-02-08. This caused a cash flow shortfall on the source account.",
    attachment: "scheduled_payment_evidence.xlsx",
    status: "RESOLVED",
    raisedBy: "usr_002",
    raisedByName: "Fatima Khan",
    assignedRmId: "rm_001",
    assignedRmName: "Nusrat Jahan Chowdhury",
    createdAt: "2026-02-08T16:00:00.000Z",
    updatedAt: "2026-02-12T11:00:00.000Z",
    approvalId: "apr_tkt_006",
    auditId: "audit_tkt_006",
    timeline: [
      {
        timestamp: "2026-02-08T16:00:00.000Z",
        status: "OPEN",
        note: "Ticket created — scheduled payment date mismatch",
        actor: "Fatima Khan",
      },
      {
        timestamp: "2026-02-09T10:00:00.000Z",
        status: "IN_PROGRESS",
        note: "Investigating scheduler logs for date offset issue",
        actor: "Nusrat Jahan Chowdhury",
      },
      {
        timestamp: "2026-02-12T11:00:00.000Z",
        status: "RESOLVED",
        note: "Root cause identified — timezone offset in scheduler. Patch applied. No further payments affected.",
        actor: "Nusrat Jahan Chowdhury",
      },
    ],
  },
  {
    ticketId: "TKT-2026-007",
    category: "Other",
    subject: "Request for updated bank certificate",
    description:
      "Need an updated solvency certificate and bank reference letter for tender submission. Required by 2026-02-20 for Bangladesh Railway procurement bid.",
    attachment: null,
    status: "CLOSED",
    raisedBy: "usr_003",
    raisedByName: "Rahim Ahmed",
    assignedRmId: "rm_001",
    assignedRmName: "Nusrat Jahan Chowdhury",
    createdAt: "2026-02-01T07:30:00.000Z",
    updatedAt: "2026-02-04T15:00:00.000Z",
    approvalId: null,
    auditId: "audit_tkt_007",
    timeline: [
      {
        timestamp: "2026-02-01T07:30:00.000Z",
        status: "OPEN",
        note: "Ticket created — bank certificate request",
        actor: "Rahim Ahmed",
      },
      {
        timestamp: "2026-02-02T10:00:00.000Z",
        status: "IN_PROGRESS",
        note: "Certificate generation initiated at branch",
        actor: "Nusrat Jahan Chowdhury",
      },
      {
        timestamp: "2026-02-03T14:00:00.000Z",
        status: "RESOLVED",
        note: "Solvency certificate and reference letter prepared — ready for collection",
        actor: "Nusrat Jahan Chowdhury",
      },
      {
        timestamp: "2026-02-04T15:00:00.000Z",
        status: "CLOSED",
        note: "Documents collected by authorised representative",
        actor: "Rahim Ahmed",
      },
    ],
  },
  {
    ticketId: "TKT-2026-008",
    category: "Service",
    subject: "User role permission discrepancy",
    description:
      "Maker user Rahim Ahmed is unable to initiate beneficiary additions despite the role matrix indicating INITIATE access. The system shows 'insufficient permissions' error.",
    attachment: "permission_error_log.png",
    status: "OPEN",
    raisedBy: "usr_002",
    raisedByName: "Fatima Khan",
    assignedRmId: "rm_001",
    assignedRmName: "Nusrat Jahan Chowdhury",
    createdAt: "2026-02-18T08:00:00.000Z",
    updatedAt: "2026-02-18T08:00:00.000Z",
    approvalId: "apr_tkt_008",
    auditId: "audit_tkt_008",
    timeline: [
      {
        timestamp: "2026-02-18T08:00:00.000Z",
        status: "OPEN",
        note: "Ticket created — role permission issue reported for maker user",
        actor: "Fatima Khan",
      },
    ],
  },
];

export function getSupportTickets(): SupportTicket[] {
  return [...SUPPORT_TICKETS];
}

export function getSupportTicketById(ticketId: string): SupportTicket | undefined {
  return SUPPORT_TICKETS.find((t) => t.ticketId === ticketId);
}

export function addSupportTicket(ticket: SupportTicket): void {
  SUPPORT_TICKETS.unshift(ticket);
}