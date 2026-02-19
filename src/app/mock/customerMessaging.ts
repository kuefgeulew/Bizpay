/**
 * CUSTOMER MESSAGING — MOCK DATA
 * Predefined message templates and message log for receivables communication.
 * No free-text campaigns. No bulk marketing. No automation engine.
 */

export type MessageChannel = "SMS" | "WhatsApp" | "Email";
export type MessageStatus = "Sent" | "Delivered" | "Read";

export interface MessageTemplate {
  id: string;
  label: string;
  body: string;
  channels: MessageChannel[];
  category: "invoice" | "reminder";
}

export interface SentMessage {
  id: string;
  customerId: string;
  customerName: string;
  templateId: string;
  templateLabel: string;
  channel: MessageChannel;
  status: MessageStatus;
  sentAt: string;
  invoiceRef?: string;
}

// ── PREDEFINED TEMPLATES ──
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "tpl_invoice_issued",
    label: "Invoice Issued",
    body: "Dear {customerName}, Invoice {invoiceRef} for BDT {amount} has been issued on {date}. Payment is due by {dueDate}. Thank you for your business.",
    channels: ["SMS", "WhatsApp", "Email"],
    category: "invoice",
  },
  {
    id: "tpl_payment_reminder",
    label: "Payment Reminder",
    body: "Dear {customerName}, this is a reminder that Invoice {invoiceRef} for BDT {amount} is due on {dueDate}. Kindly arrange payment at your earliest convenience.",
    channels: ["SMS", "WhatsApp", "Email"],
    category: "reminder",
  },
];

// ── SENT MESSAGE LOG (seeded) ──
export const SENT_MESSAGES: SentMessage[] = [
  {
    id: "msg_001",
    customerId: "CUST-001",
    customerName: "Rahman Textiles Ltd",
    templateId: "tpl_invoice_issued",
    templateLabel: "Invoice Issued",
    channel: "WhatsApp",
    status: "Read",
    sentAt: "2026-01-06T09:15:00Z",
    invoiceRef: "INV-2026-001",
  },
  {
    id: "msg_002",
    customerId: "CUST-001",
    customerName: "Rahman Textiles Ltd",
    templateId: "tpl_payment_reminder",
    templateLabel: "Payment Reminder",
    channel: "SMS",
    status: "Delivered",
    sentAt: "2026-02-06T10:30:00Z",
    invoiceRef: "INV-2026-001",
  },
  {
    id: "msg_003",
    customerId: "CUST-002",
    customerName: "City Steel Industries",
    templateId: "tpl_invoice_issued",
    templateLabel: "Invoice Issued",
    channel: "Email",
    status: "Read",
    sentAt: "2025-12-21T08:00:00Z",
    invoiceRef: "INV-2026-002",
  },
  {
    id: "msg_004",
    customerId: "CUST-002",
    customerName: "City Steel Industries",
    templateId: "tpl_payment_reminder",
    templateLabel: "Payment Reminder",
    channel: "WhatsApp",
    status: "Delivered",
    sentAt: "2026-01-22T11:00:00Z",
    invoiceRef: "INV-2026-002",
  },
  {
    id: "msg_005",
    customerId: "CUST-002",
    customerName: "City Steel Industries",
    templateId: "tpl_payment_reminder",
    templateLabel: "Payment Reminder",
    channel: "SMS",
    status: "Sent",
    sentAt: "2026-02-10T14:45:00Z",
    invoiceRef: "INV-2026-002",
  },
  {
    id: "msg_006",
    customerId: "CUST-003",
    customerName: "Green Valley Suppliers",
    templateId: "tpl_invoice_issued",
    templateLabel: "Invoice Issued",
    channel: "Email",
    status: "Read",
    sentAt: "2025-12-02T09:00:00Z",
    invoiceRef: "INV-2026-003",
  },
  {
    id: "msg_007",
    customerId: "CUST-003",
    customerName: "Green Valley Suppliers",
    templateId: "tpl_payment_reminder",
    templateLabel: "Payment Reminder",
    channel: "WhatsApp",
    status: "Sent",
    sentAt: "2026-01-05T10:00:00Z",
    invoiceRef: "INV-2026-003",
  },
  {
    id: "msg_008",
    customerId: "CUST-003",
    customerName: "Green Valley Suppliers",
    templateId: "tpl_payment_reminder",
    templateLabel: "Payment Reminder",
    channel: "SMS",
    status: "Delivered",
    sentAt: "2026-01-28T15:30:00Z",
    invoiceRef: "INV-2026-003",
  },
  {
    id: "msg_009",
    customerId: "CUST-004",
    customerName: "Dhaka Electronics Hub",
    templateId: "tpl_invoice_issued",
    templateLabel: "Invoice Issued",
    channel: "WhatsApp",
    status: "Read",
    sentAt: "2026-01-11T08:30:00Z",
    invoiceRef: "INV-2026-004",
  },
  {
    id: "msg_010",
    customerId: "CUST-005",
    customerName: "Apex Trading Co",
    templateId: "tpl_payment_reminder",
    templateLabel: "Payment Reminder",
    channel: "Email",
    status: "Delivered",
    sentAt: "2026-02-12T09:00:00Z",
    invoiceRef: "INV-2026-005",
  },
];

// ── HELPERS ──
export function getMessagesForCustomer(customerId: string): SentMessage[] {
  return SENT_MESSAGES.filter((m) => m.customerId === customerId).sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
}

export function addSentMessage(msg: Omit<SentMessage, "id" | "sentAt" | "status">): SentMessage {
  const newMsg: SentMessage = {
    ...msg,
    id: `msg_${Date.now()}`,
    sentAt: new Date().toISOString(),
    status: "Sent",
  };
  SENT_MESSAGES.push(newMsg);
  return newMsg;
}