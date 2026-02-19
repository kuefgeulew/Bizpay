// GST Invoice & Outstanding Tracker — Data Engine
// Invoice management and outstanding tracking module

export type InvoiceStatus = "paid" | "partial" | "due" | "overdue";
export type AgingBucket = "0-7" | "8-30" | "30+";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  clientGSTIN: string;
  sellerGSTIN: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  agingBucket: AgingBucket;
  daysOverdue: number;
  lineItems: InvoiceLineItem[];
  cgst: number;
  sgst: number;
  igst: number;
  paymentHistory: PaymentEntry[];
  vamClientId?: string; // Link to VAM
  timelineEventId?: string; // Link to Timeline
}

export interface PaymentEntry {
  date: string;
  amount: number;
  method: string;
  reference: string;
}

export interface ClientOutstanding {
  clientId: string;
  clientName: string;
  totalDue: number;
  oldestDueDate: string;
  invoiceCount: number;
  agingBucket: AgingBucket;
  riskLevel: "low" | "medium" | "high";
}

// Mock Seller TIN
const SELLER_GSTIN = "TIN-123456789";

// Mock Invoices
export const INVOICE_RECORDS: Invoice[] = [
  {
    id: "INV-001",
    invoiceNo: "BP/2025/001",
    clientId: "CLI-001",
    clientName: "Karim General Store",
    clientGSTIN: "TIN-987654321",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2025-02-10",
    dueDate: "2025-03-10",
    totalAmount: 12500,
    paidAmount: 12500,
    outstandingAmount: 0,
    status: "paid",
    agingBucket: "0-7",
    daysOverdue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-001-1",
        description: "Rice - Premium Miniket (50kg bags)",
        quantity: 10,
        rate: 1250,
        taxRate: 0,
        amount: 12500,
      },
    ],
    paymentHistory: [
      {
        date: "2025-02-15",
        amount: 12500,
        method: "bKash",
        reference: "BKH20250215KRM001",
      },
    ],
    vamClientId: "VAM-CLI-001",
    timelineEventId: "TL-EVT-001",
  },
  {
    id: "INV-002",
    invoiceNo: "BP/2025/002",
    clientId: "CLI-002",
    clientName: "Hasan Departmental Store",
    clientGSTIN: "TIN-456789123",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2025-01-28",
    dueDate: "2025-02-28",
    totalAmount: 28000,
    paidAmount: 0,
    outstandingAmount: 28000,
    status: "overdue",
    agingBucket: "8-30",
    daysOverdue: 17,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-002-1",
        description: "Cooking Oil - Teer Soybean (5L bottles)",
        quantity: 40,
        rate: 700,
        taxRate: 0,
        amount: 28000,
      },
    ],
    paymentHistory: [],
    vamClientId: "VAM-CLI-002",
    timelineEventId: "TL-EVT-002",
  },
  {
    id: "INV-003",
    invoiceNo: "BP/2025/003",
    clientId: "CLI-003",
    clientName: "Rahman Trading",
    clientGSTIN: "TIN-789123456",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2024-12-20",
    dueDate: "2025-01-20",
    totalAmount: 65000,
    paidAmount: 20000,
    outstandingAmount: 45000,
    status: "overdue",
    agingBucket: "30+",
    daysOverdue: 28,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-003-1",
        description: "Sugar - White Refined (50kg bags)",
        quantity: 50,
        rate: 1300,
        taxRate: 0,
        amount: 65000,
      },
    ],
    paymentHistory: [
      {
        date: "2025-01-05",
        amount: 20000,
        method: "Nagad",
        reference: "NGD20250105RHM001",
      },
    ],
    vamClientId: "VAM-CLI-003",
    timelineEventId: "TL-EVT-003",
  },
  {
    id: "INV-004",
    invoiceNo: "BP/2025/004",
    clientId: "CLI-001",
    clientName: "Karim General Store",
    clientGSTIN: "TIN-987654321",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2025-02-12",
    dueDate: "2025-03-12",
    totalAmount: 8500,
    paidAmount: 0,
    outstandingAmount: 8500,
    status: "due",
    agingBucket: "0-7",
    daysOverdue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-004-1",
        description: "Lentils - Masoor Dal (25kg bags)",
        quantity: 10,
        rate: 850,
        taxRate: 0,
        amount: 8500,
      },
    ],
    paymentHistory: [],
    vamClientId: "VAM-CLI-001",
    timelineEventId: "TL-EVT-004",
  },
  {
    id: "INV-005",
    invoiceNo: "BP/2025/005",
    clientId: "CLI-004",
    clientName: "Mina Grocery",
    clientGSTIN: "TIN-321654987",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2025-02-08",
    dueDate: "2025-03-08",
    totalAmount: 15000,
    paidAmount: 15000,
    outstandingAmount: 0,
    status: "paid",
    agingBucket: "0-7",
    daysOverdue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-005-1",
        description: "Milk Powder - Dano Full Cream (500g)",
        quantity: 50,
        rate: 300,
        taxRate: 0,
        amount: 15000,
      },
    ],
    paymentHistory: [
      {
        date: "2025-02-14",
        amount: 15000,
        method: "Rocket",
        reference: "RKT20250214MIN001",
      },
    ],
    vamClientId: "VAM-CLI-004",
    timelineEventId: "TL-EVT-005",
  },
  {
    id: "INV-006",
    invoiceNo: "BP/2025/006",
    clientId: "CLI-005",
    clientName: "Alam Wholesale",
    clientGSTIN: "TIN-654987321",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2024-12-01",
    dueDate: "2025-01-01",
    totalAmount: 92000,
    paidAmount: 0,
    outstandingAmount: 92000,
    status: "overdue",
    agingBucket: "30+",
    daysOverdue: 47,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-006-1",
        description: "Wheat Flour - Atta Premium (50kg bags)",
        quantity: 40,
        rate: 2300,
        taxRate: 0,
        amount: 92000,
      },
    ],
    paymentHistory: [],
    vamClientId: "VAM-CLI-005",
    timelineEventId: "TL-EVT-006",
  },
  {
    id: "INV-007",
    invoiceNo: "BP/2025/007",
    clientId: "CLI-002",
    clientName: "Hasan Departmental Store",
    clientGSTIN: "TIN-456789123",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2025-02-05",
    dueDate: "2025-03-05",
    totalAmount: 6400,
    paidAmount: 3000,
    outstandingAmount: 3400,
    status: "partial",
    agingBucket: "8-30",
    daysOverdue: 12,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-007-1",
        description: "Tea - Ispahani Mirzapore (200g packets)",
        quantity: 80,
        rate: 80,
        taxRate: 0,
        amount: 6400,
      },
    ],
    paymentHistory: [
      {
        date: "2025-02-10",
        amount: 3000,
        method: "Cash",
        reference: "CSH20250210HSN002",
      },
    ],
    vamClientId: "VAM-CLI-002",
    timelineEventId: "TL-EVT-007",
  },
  {
    id: "INV-008",
    invoiceNo: "BP/2025/008",
    clientId: "CLI-003",
    clientName: "Rahman Trading",
    clientGSTIN: "TIN-789123456",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2025-02-14",
    dueDate: "2025-03-14",
    totalAmount: 35000,
    paidAmount: 0,
    outstandingAmount: 35000,
    status: "due",
    agingBucket: "0-7",
    daysOverdue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-008-1",
        description: "Onions - Fresh Local (100kg)",
        quantity: 5,
        rate: 7000,
        taxRate: 0,
        amount: 35000,
      },
    ],
    paymentHistory: [],
    vamClientId: "VAM-CLI-003",
    timelineEventId: "TL-EVT-008",
  },
  {
    id: "INV-009",
    invoiceNo: "BP/2025/009",
    clientId: "CLI-004",
    clientName: "Mina Grocery",
    clientGSTIN: "TIN-321654987",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2024-12-15",
    dueDate: "2025-01-15",
    totalAmount: 48000,
    paidAmount: 15000,
    outstandingAmount: 33000,
    status: "overdue",
    agingBucket: "30+",
    daysOverdue: 33,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-009-1",
        description: "Chicken - Frozen Broiler (1kg packs)",
        quantity: 200,
        rate: 240,
        taxRate: 0,
        amount: 48000,
      },
    ],
    paymentHistory: [
      {
        date: "2025-01-10",
        amount: 15000,
        method: "bKash",
        reference: "BKH20250110MIN002",
      },
    ],
    vamClientId: "VAM-CLI-004",
    timelineEventId: "TL-EVT-009",
  },
  {
    id: "INV-010",
    invoiceNo: "BP/2025/010",
    clientId: "CLI-005",
    clientName: "Alam Wholesale",
    clientGSTIN: "TIN-654987321",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2025-02-16",
    dueDate: "2025-03-16",
    totalAmount: 22000,
    paidAmount: 0,
    outstandingAmount: 22000,
    status: "due",
    agingBucket: "0-7",
    daysOverdue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-010-1",
        description: "Salt - Refined Iodized (1kg packets)",
        quantity: 1000,
        rate: 22,
        taxRate: 0,
        amount: 22000,
      },
    ],
    paymentHistory: [],
    vamClientId: "VAM-CLI-005",
    timelineEventId: "TL-EVT-010",
  },
  {
    id: "INV-011",
    invoiceNo: "BP/2025/011",
    clientId: "CLI-001",
    clientName: "Karim General Store",
    clientGSTIN: "TIN-987654321",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2025-01-15",
    dueDate: "2025-02-15",
    totalAmount: 18500,
    paidAmount: 8000,
    outstandingAmount: 10500,
    status: "overdue",
    agingBucket: "0-7",
    daysOverdue: 2,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-011-1",
        description: "Potatoes - Local Fresh (100kg bags)",
        quantity: 5,
        rate: 3700,
        taxRate: 0,
        amount: 18500,
      },
    ],
    paymentHistory: [
      {
        date: "2025-02-10",
        amount: 8000,
        method: "Nagad",
        reference: "NGD20250210KRM002",
      },
    ],
    vamClientId: "VAM-CLI-001",
    timelineEventId: "TL-EVT-011",
  },
  {
    id: "INV-012",
    invoiceNo: "BP/2025/012",
    clientId: "CLI-002",
    clientName: "Hasan Departmental Store",
    clientGSTIN: "TIN-456789123",
    sellerGSTIN: SELLER_GSTIN,
    invoiceDate: "2025-02-17",
    dueDate: "2025-03-17",
    totalAmount: 9600,
    paidAmount: 9600,
    outstandingAmount: 0,
    status: "paid",
    agingBucket: "0-7",
    daysOverdue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineItems: [
      {
        id: "LI-012-1",
        description: "Biscuits - Olympic Marie (60 packets)",
        quantity: 60,
        rate: 160,
        taxRate: 0,
        amount: 9600,
      },
    ],
    paymentHistory: [
      {
        date: "2025-02-17",
        amount: 9600,
        method: "Cash",
        reference: "CSH20250217HSN003",
      },
    ],
    vamClientId: "VAM-CLI-002",
    timelineEventId: "TL-EVT-012",
  },
];

// Calculate Client Outstanding Summary
export function getClientOutstandingSummary(): ClientOutstanding[] {
  const clientMap = new Map<string, ClientOutstanding>();

  INVOICE_RECORDS.forEach((invoice) => {
    if (invoice.outstandingAmount > 0) {
      const existing = clientMap.get(invoice.clientId);
      
      if (existing) {
        existing.totalDue += invoice.outstandingAmount;
        existing.invoiceCount += 1;
        
        // Update oldest due date
        if (new Date(invoice.dueDate) < new Date(existing.oldestDueDate)) {
          existing.oldestDueDate = invoice.dueDate;
        }
        
        // Update aging bucket to worst case
        if (invoice.agingBucket === "30+") {
          existing.agingBucket = "30+";
          existing.riskLevel = "high";
        } else if (invoice.agingBucket === "8-30" && existing.agingBucket !== "30+") {
          existing.agingBucket = "8-30";
          existing.riskLevel = "medium";
        }
      } else {
        clientMap.set(invoice.clientId, {
          clientId: invoice.clientId,
          clientName: invoice.clientName,
          totalDue: invoice.outstandingAmount,
          oldestDueDate: invoice.dueDate,
          invoiceCount: 1,
          agingBucket: invoice.agingBucket,
          riskLevel: 
            invoice.agingBucket === "30+" ? "high" :
            invoice.agingBucket === "8-30" ? "medium" : "low",
        });
      }
    }
  });

  return Array.from(clientMap.values()).sort((a, b) => b.totalDue - a.totalDue);
}

// Get Invoice by ID
export function getInvoiceById(id: string): Invoice | undefined {
  return INVOICE_RECORDS.find((inv) => inv.id === id);
}

// Get Invoices by Client
export function getInvoicesByClient(clientId: string): Invoice[] {
  return INVOICE_RECORDS.filter((inv) => inv.clientId === clientId);
}

// Calculate KPI Summary
export function getInvoiceKPIs() {
  const thisMonth = INVOICE_RECORDS.filter((inv) => 
    inv.invoiceDate >= "2025-02-01" && inv.invoiceDate <= "2025-02-28"
  );

  const totalInvoiced = thisMonth.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = INVOICE_RECORDS.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = INVOICE_RECORDS.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
  const totalOverdue = INVOICE_RECORDS
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.outstandingAmount, 0);

  const aging = {
    "0-7": INVOICE_RECORDS.filter((inv) => inv.agingBucket === "0-7" && inv.outstandingAmount > 0).length,
    "8-30": INVOICE_RECORDS.filter((inv) => inv.agingBucket === "8-30" && inv.outstandingAmount > 0).length,
    "30+": INVOICE_RECORDS.filter((inv) => inv.agingBucket === "30+" && inv.outstandingAmount > 0).length,
  };

  const atRiskClients = getClientOutstandingSummary()
    .filter((client) => client.riskLevel === "high")
    .slice(0, 3);

  return {
    totalInvoiced,
    totalPaid,
    totalOutstanding,
    totalOverdue,
    aging,
    atRiskClients,
  };
}

// Export all invoices
export function getAllInvoices(): Invoice[] {
  return INVOICE_RECORDS;
}

// Filter invoices
export function filterInvoices(
  status?: InvoiceStatus,
  clientId?: string,
  agingBucket?: AgingBucket
): Invoice[] {
  return INVOICE_RECORDS.filter((inv) => {
    if (status && inv.status !== status) return false;
    if (clientId && inv.clientId !== clientId) return false;
    if (agingBucket && inv.agingBucket !== agingBucket) return false;
    return true;
  });
}