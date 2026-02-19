/**
 * RECEIVABLES INTELLIGENCE DATA MODEL
 * Mock-backed AR data for decision intelligence
 */

export type InvoiceStatus = "Paid" | "PartiallyPaid" | "Overdue" | "Due";

export interface Invoice {
  invoiceId: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  daysOverdue: number;
  paymentHistory: {
    onTimePayments: number;
    latePayments: number;
    averageDelayDays: number;
  };
}

export interface CustomerARSummary {
  customerId: string;
  customerName: string;
  totalOutstanding: number;
  invoiceCount: number;
  oldestOverdueDays: number;
  percentOfTotalAR: number;
  riskLevel: "Low" | "Medium" | "High";
}

export interface NudgeSuggestion {
  id: string;
  invoiceId: string;
  customerName: string;
  message: string;
  reason: string;
  priority: "Low" | "Medium" | "High";
  recommendedAction: string;
}

export interface DiscountSuggestion {
  id: string;
  invoiceId: string;
  customerName: string;
  outstandingAmount: number;
  daysOverdue: number;
  suggestedDiscount: number;
  cashInBenefit: number;
  discountCost: number;
  netBenefit: number;
  rationale: string;
}

// ============================================
// MOCK INVOICE DATA
// ============================================

export const INVOICES: Invoice[] = [
  // OVERDUE - Large amounts
  {
    invoiceId: "INV-2026-001",
    customerId: "CUST-001",
    customerName: "Rahman Textiles Ltd",
    invoiceDate: "2026-01-05",
    dueDate: "2026-02-04",
    invoiceAmount: 850000,
    outstandingAmount: 850000,
    status: "Overdue",
    daysOverdue: 13,
    paymentHistory: {
      onTimePayments: 8,
      latePayments: 4,
      averageDelayDays: 7,
    },
  },
  {
    invoiceId: "INV-2026-002",
    customerId: "CUST-002",
    customerName: "City Steel Industries",
    invoiceDate: "2025-12-20",
    dueDate: "2026-01-19",
    invoiceAmount: 1250000,
    outstandingAmount: 1250000,
    status: "Overdue",
    daysOverdue: 29,
    paymentHistory: {
      onTimePayments: 3,
      latePayments: 9,
      averageDelayDays: 18,
    },
  },
  {
    invoiceId: "INV-2026-003",
    customerId: "CUST-003",
    customerName: "Green Valley Suppliers",
    invoiceDate: "2025-12-01",
    dueDate: "2025-12-31",
    invoiceAmount: 640000,
    outstandingAmount: 640000,
    status: "Overdue",
    daysOverdue: 48,
    paymentHistory: {
      onTimePayments: 2,
      latePayments: 10,
      averageDelayDays: 32,
    },
  },
  {
    invoiceId: "INV-2026-004",
    customerId: "CUST-004",
    customerName: "Dhaka Electronics Hub",
    invoiceDate: "2026-01-10",
    dueDate: "2026-02-09",
    invoiceAmount: 420000,
    outstandingAmount: 420000,
    status: "Overdue",
    daysOverdue: 8,
    paymentHistory: {
      onTimePayments: 10,
      latePayments: 2,
      averageDelayDays: 4,
    },
  },

  // OVERDUE - Medium amounts
  {
    invoiceId: "INV-2026-005",
    customerId: "CUST-005",
    customerName: "Apex Trading Co",
    invoiceDate: "2026-01-08",
    dueDate: "2026-02-07",
    invoiceAmount: 180000,
    outstandingAmount: 180000,
    status: "Overdue",
    daysOverdue: 10,
    paymentHistory: {
      onTimePayments: 6,
      latePayments: 3,
      averageDelayDays: 8,
    },
  },
  {
    invoiceId: "INV-2026-006",
    customerId: "CUST-006",
    customerName: "Sunrise Garments",
    invoiceDate: "2025-12-28",
    dueDate: "2026-01-27",
    invoiceAmount: 320000,
    outstandingAmount: 320000,
    status: "Overdue",
    daysOverdue: 21,
    paymentHistory: {
      onTimePayments: 4,
      latePayments: 6,
      averageDelayDays: 14,
    },
  },

  // PARTIALLY PAID
  {
    invoiceId: "INV-2026-007",
    customerId: "CUST-007",
    customerName: "Metro Pharma Distribution",
    invoiceDate: "2026-01-15",
    dueDate: "2026-02-14",
    invoiceAmount: 550000,
    outstandingAmount: 220000,
    status: "PartiallyPaid",
    daysOverdue: 3,
    paymentHistory: {
      onTimePayments: 7,
      latePayments: 2,
      averageDelayDays: 5,
    },
  },

  // DUE SOON (Not overdue yet)
  {
    invoiceId: "INV-2026-008",
    customerId: "CUST-008",
    customerName: "Tech Solutions BD",
    invoiceDate: "2026-01-20",
    dueDate: "2026-02-19",
    invoiceAmount: 380000,
    outstandingAmount: 380000,
    status: "Due",
    daysOverdue: 0,
    paymentHistory: {
      onTimePayments: 11,
      latePayments: 1,
      averageDelayDays: 2,
    },
  },
  {
    invoiceId: "INV-2026-009",
    customerId: "CUST-009",
    customerName: "Golden Builders Ltd",
    invoiceDate: "2026-01-25",
    dueDate: "2026-02-24",
    invoiceAmount: 720000,
    outstandingAmount: 720000,
    status: "Due",
    daysOverdue: 0,
    paymentHistory: {
      onTimePayments: 9,
      latePayments: 1,
      averageDelayDays: 3,
    },
  },

  // PAID (Recent - for DSO calculation)
  {
    invoiceId: "INV-2026-010",
    customerId: "CUST-010",
    customerName: "Reliable Imports",
    invoiceDate: "2026-01-05",
    dueDate: "2026-02-04",
    invoiceAmount: 290000,
    outstandingAmount: 0,
    status: "Paid",
    daysOverdue: 0,
    paymentHistory: {
      onTimePayments: 12,
      latePayments: 0,
      averageDelayDays: 0,
    },
  },
  {
    invoiceId: "INV-2026-011",
    customerId: "CUST-011",
    customerName: "Fast Food Supplies",
    invoiceDate: "2026-01-12",
    dueDate: "2026-02-11",
    invoiceAmount: 125000,
    outstandingAmount: 0,
    status: "Paid",
    daysOverdue: 0,
    paymentHistory: {
      onTimePayments: 15,
      latePayments: 0,
      averageDelayDays: 0,
    },
  },

  // MORE OVERDUE - Small amounts (long tail)
  {
    invoiceId: "INV-2026-012",
    customerId: "CUST-012",
    customerName: "Karim Brothers",
    invoiceDate: "2026-01-03",
    dueDate: "2026-02-02",
    invoiceAmount: 85000,
    outstandingAmount: 85000,
    status: "Overdue",
    daysOverdue: 15,
    paymentHistory: {
      onTimePayments: 5,
      latePayments: 4,
      averageDelayDays: 10,
    },
  },
  {
    invoiceId: "INV-2026-013",
    customerId: "CUST-013",
    customerName: "Noor Trading",
    invoiceDate: "2025-12-25",
    dueDate: "2026-01-24",
    invoiceAmount: 95000,
    outstandingAmount: 95000,
    status: "Overdue",
    daysOverdue: 24,
    paymentHistory: {
      onTimePayments: 3,
      latePayments: 5,
      averageDelayDays: 15,
    },
  },
  {
    invoiceId: "INV-2026-014",
    customerId: "CUST-014",
    customerName: "Star Packaging",
    invoiceDate: "2026-01-18",
    dueDate: "2026-02-17",
    invoiceAmount: 62000,
    outstandingAmount: 62000,
    status: "Due",
    daysOverdue: 0,
    paymentHistory: {
      onTimePayments: 8,
      latePayments: 1,
      averageDelayDays: 2,
    },
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate total outstanding AR
 */
export function calculateTotalOutstanding(invoices: Invoice[]): number {
  return invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
}

/**
 * Calculate Days Sales Outstanding (DSO)
 * Formula: (Total AR / Total Credit Sales) * Number of Days
 */
export function calculateDSO(invoices: Invoice[]): number {
  const totalOutstanding = calculateTotalOutstanding(invoices);
  const totalSales = invoices.reduce((sum, inv) => sum + inv.invoiceAmount, 0);
  
  if (totalSales === 0) return 0;
  
  // Using 30-day period for calculation
  const dso = (totalOutstanding / totalSales) * 30;
  return Math.round(dso);
}

/**
 * Get overdue invoices grouped by aging bucket
 */
export function getOverdueBuckets(invoices: Invoice[]): {
  bucket0to30: number;
  bucket31to60: number;
  bucket60plus: number;
} {
  const overdue = invoices.filter((inv) => inv.status === "Overdue");
  
  return {
    bucket0to30: overdue.filter((inv) => inv.daysOverdue <= 30).reduce((sum, inv) => sum + inv.outstandingAmount, 0),
    bucket31to60: overdue.filter((inv) => inv.daysOverdue > 30 && inv.daysOverdue <= 60).reduce((sum, inv) => sum + inv.outstandingAmount, 0),
    bucket60plus: overdue.filter((inv) => inv.daysOverdue > 60).reduce((sum, inv) => sum + inv.outstandingAmount, 0),
  };
}

/**
 * Get top overdue customers ranked by outstanding amount
 */
export function getTopOverdueCustomers(invoices: Invoice[], limit: number = 10): CustomerARSummary[] {
  // Group by customer
  const customerMap = new Map<string, {
    customerId: string;
    customerName: string;
    totalOutstanding: number;
    invoiceCount: number;
    oldestOverdueDays: number;
    latePayments: number;
    totalInvoices: number;
  }>();

  invoices.forEach((inv) => {
    if (inv.outstandingAmount > 0) {
      const existing = customerMap.get(inv.customerId);
      if (existing) {
        existing.totalOutstanding += inv.outstandingAmount;
        existing.invoiceCount += 1;
        existing.oldestOverdueDays = Math.max(existing.oldestOverdueDays, inv.daysOverdue);
        existing.latePayments += inv.paymentHistory.latePayments;
        existing.totalInvoices += inv.paymentHistory.onTimePayments + inv.paymentHistory.latePayments;
      } else {
        customerMap.set(inv.customerId, {
          customerId: inv.customerId,
          customerName: inv.customerName,
          totalOutstanding: inv.outstandingAmount,
          invoiceCount: 1,
          oldestOverdueDays: inv.daysOverdue,
          latePayments: inv.paymentHistory.latePayments,
          totalInvoices: inv.paymentHistory.onTimePayments + inv.paymentHistory.latePayments,
        });
      }
    }
  });

  const totalAR = calculateTotalOutstanding(invoices);

  // Convert to array and calculate metrics
  const customers: CustomerARSummary[] = Array.from(customerMap.values()).map((customer) => {
    const latePaymentRate = customer.totalInvoices > 0 
      ? customer.latePayments / customer.totalInvoices 
      : 0;
    
    let riskLevel: "Low" | "Medium" | "High" = "Low";
    if (latePaymentRate > 0.6 || customer.oldestOverdueDays > 45) {
      riskLevel = "High";
    } else if (latePaymentRate > 0.3 || customer.oldestOverdueDays > 20) {
      riskLevel = "Medium";
    }

    return {
      customerId: customer.customerId,
      customerName: customer.customerName,
      totalOutstanding: customer.totalOutstanding,
      invoiceCount: customer.invoiceCount,
      oldestOverdueDays: customer.oldestOverdueDays,
      percentOfTotalAR: totalAR > 0 ? (customer.totalOutstanding / totalAR) * 100 : 0,
      riskLevel,
    };
  });

  // Sort by total outstanding (descending)
  return customers
    .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
    .slice(0, limit);
}

/**
 * Generate auto-nudge suggestions based on rules
 */
export function generateNudgeSuggestions(invoices: Invoice[]): NudgeSuggestion[] {
  const suggestions: NudgeSuggestion[] = [];

  invoices.forEach((inv) => {
    // Rule 1: Overdue 7+ days, first reminder
    if (inv.daysOverdue >= 7 && inv.daysOverdue < 15 && inv.status === "Overdue") {
      suggestions.push({
        id: `nudge-${inv.invoiceId}-1`,
        invoiceId: inv.invoiceId,
        customerName: inv.customerName,
        message: `Invoice ${inv.invoiceId} is ${inv.daysOverdue} days overdue. Suggest friendly reminder today.`,
        reason: "First overdue reminder (7-14 days)",
        priority: "Medium",
        recommendedAction: "Send SMS/WhatsApp: 'Hi, just a friendly reminder that Invoice XXX is overdue by X days. Please arrange payment at your earliest convenience.'",
      });
    }

    // Rule 2: Overdue 15-30 days, escalation
    if (inv.daysOverdue >= 15 && inv.daysOverdue < 30 && inv.status === "Overdue") {
      suggestions.push({
        id: `nudge-${inv.invoiceId}-2`,
        invoiceId: inv.invoiceId,
        customerName: inv.customerName,
        message: `Invoice ${inv.invoiceId} is ${inv.daysOverdue} days overdue. Recommend escalation to collections team.`,
        reason: "Escalation required (15-30 days)",
        priority: "High",
        recommendedAction: "Send escalation email + phone call: 'We notice payment is significantly delayed. Please contact us immediately to resolve.'",
      });
    }

    // Rule 3: Overdue 30+ days, serious concern
    if (inv.daysOverdue >= 30 && inv.status === "Overdue") {
      suggestions.push({
        id: `nudge-${inv.invoiceId}-3`,
        invoiceId: inv.invoiceId,
        customerName: inv.customerName,
        message: `Invoice ${inv.invoiceId} is ${inv.daysOverdue} days overdue (৳${inv.outstandingAmount.toLocaleString()}). Critical collection required.`,
        reason: "Critical overdue (30+ days)",
        priority: "High",
        recommendedAction: "Immediate action: Account review + payment plan discussion + consider legal notice.",
      });
    }

    // Rule 4: Repeat late payer pattern
    if (inv.paymentHistory.latePayments >= 3 && inv.status === "Overdue") {
      suggestions.push({
        id: `nudge-${inv.invoiceId}-4`,
        invoiceId: inv.invoiceId,
        customerName: inv.customerName,
        message: `${inv.customerName} has ${inv.paymentHistory.latePayments} late payments. Consider stricter payment terms.`,
        reason: "Repeat late payer",
        priority: "Medium",
        recommendedAction: "Review customer terms: Consider requiring advance payment or shorter payment window for future invoices.",
      });
    }

    // Rule 5: Large amount overdue (>500K)
    if (inv.outstandingAmount > 500000 && inv.daysOverdue > 0) {
      suggestions.push({
        id: `nudge-${inv.invoiceId}-5`,
        invoiceId: inv.invoiceId,
        customerName: inv.customerName,
        message: `Large outstanding: ৳${inv.outstandingAmount.toLocaleString()} overdue by ${inv.daysOverdue} days. Priority follow-up required.`,
        reason: "High-value overdue",
        priority: "High",
        recommendedAction: "Senior management follow-up: Direct call to customer's finance head to discuss payment schedule.",
      });
    }
  });

  // Sort by priority (High first)
  return suggestions.sort((a, b) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Generate early-pay discount suggestions
 */
export function generateDiscountSuggestions(invoices: Invoice[]): DiscountSuggestion[] {
  const suggestions: DiscountSuggestion[] = [];

  invoices.forEach((inv) => {
    // Rule: Overdue 15+ days AND amount > 200K
    if (inv.daysOverdue >= 15 && inv.outstandingAmount > 200000 && inv.status === "Overdue") {
      // Calculate discount (1% for 15-30 days, 2% for 30-60 days, 3% for 60+ days)
      let discountPercent = 1;
      if (inv.daysOverdue > 60) discountPercent = 3;
      else if (inv.daysOverdue > 30) discountPercent = 2;

      const discountCost = (inv.outstandingAmount * discountPercent) / 100;
      
      // Cash-in benefit: Assume 8% annual cost of capital
      // Benefit = (Amount * 8% / 365) * DaysOverdue
      const cashInBenefit = (inv.outstandingAmount * 0.08 / 365) * inv.daysOverdue;
      
      const netBenefit = cashInBenefit - discountCost;

      // Only suggest if net benefit is positive
      if (netBenefit > 0) {
        suggestions.push({
          id: `disc-${inv.invoiceId}`,
          invoiceId: inv.invoiceId,
          customerName: inv.customerName,
          outstandingAmount: inv.outstandingAmount,
          daysOverdue: inv.daysOverdue,
          suggestedDiscount: discountPercent,
          cashInBenefit: Math.round(cashInBenefit),
          discountCost: Math.round(discountCost),
          netBenefit: Math.round(netBenefit),
          rationale: `Offering ${discountPercent}% discount (৳${Math.round(discountCost).toLocaleString()}) to collect ${inv.daysOverdue} days early saves ৳${Math.round(netBenefit).toLocaleString()} in working capital cost.`,
        });
      }
    }
  });

  // Sort by net benefit (descending)
  return suggestions.sort((a, b) => b.netBenefit - a.netBenefit);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `৳${(amount / 100000).toFixed(1)}L`;
}