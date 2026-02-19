/**
 * PAYABLES INTELLIGENCE DATA MODEL
 * Mock-backed AP data for optimal payment timing
 */

export type PayableStatus = "Due Today" | "Upcoming" | "Overdue" | "Paid";

export interface VendorPayable {
  payableId: string;
  vendorId: string;
  vendorName: string;
  invoiceId: string;
  invoiceAmount: number;
  invoiceDate: string;
  dueDate: string;
  earlyPaymentDiscountPct: number; // % discount if paid early
  earlyPaymentDiscountDays: number; // days before due date to get discount
  latePaymentPenaltyPct: number; // % penalty per month if late
  historicalDelayTolerance: number; // days vendor usually accepts without issue
  status: PayableStatus;
  category: string; // e.g., "Raw Materials", "Utilities", "Services"
  criticality: "Low" | "Medium" | "High"; // business criticality of vendor
  requiresApproval: boolean; // if amount requires approval flow
}

export interface OptimalPaymentRecommendation {
  payableId: string;
  vendorName: string;
  invoiceAmount: number;
  dueDate: string;
  optimalPayDate: string;
  daysDelayed: number;
  floatBenefit: number; // cash retained × days × daily cost of capital
  penaltyRisk: number; // potential penalty if delayed
  netBenefit: number; // floatBenefit - penaltyRisk
  recommendation: "Pay Now" | "Delay" | "Pay Early" | "Neutral";
  rationale: string;
}

export interface BulkPaymentPlan {
  selectedPayableIds: string[];
  totalAmount: number;
  consolidatedOptimalDate: string;
  totalFloatBenefit: number;
  totalPenaltyRisk: number;
  netCashRetained: number;
  payableCount: number;
}

// ============================================
// MOCK PAYABLES DATA
// ============================================

const today = new Date("2026-02-17");

function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}

export const PAYABLES: VendorPayable[] = [
  // DUE TODAY - Critical utility
  {
    payableId: "PAY-001",
    vendorId: "VEN-001",
    vendorName: "City Power & Gas",
    invoiceId: "INV-UTL-2401",
    invoiceAmount: 180000,
    invoiceDate: addDays(today, -30),
    dueDate: addDays(today, 0), // TODAY
    earlyPaymentDiscountPct: 0,
    earlyPaymentDiscountDays: 0,
    latePaymentPenaltyPct: 2.5, // 2.5% per month = high penalty
    historicalDelayTolerance: 3, // Utilities allow 3 days grace
    status: "Due Today",
    category: "Utilities",
    criticality: "High",
    requiresApproval: false,
  },

  // DUE SOON - Raw materials with early discount
  {
    payableId: "PAY-002",
    vendorId: "VEN-002",
    vendorName: "Steel Traders International",
    invoiceId: "INV-RM-3456",
    invoiceAmount: 950000,
    invoiceDate: addDays(today, -20),
    dueDate: addDays(today, 10),
    earlyPaymentDiscountPct: 2, // 2% discount if paid 10 days early
    earlyPaymentDiscountDays: 10,
    latePaymentPenaltyPct: 1.5,
    historicalDelayTolerance: 15, // Flexible vendor
    status: "Upcoming",
    category: "Raw Materials",
    criticality: "High",
    requiresApproval: true, // Large amount
  },

  // UPCOMING - Service provider (flexible)
  {
    payableId: "PAY-003",
    vendorId: "VEN-003",
    vendorName: "Tech Solutions BD",
    invoiceId: "INV-SRV-8821",
    invoiceAmount: 125000,
    invoiceDate: addDays(today, -15),
    dueDate: addDays(today, 15),
    earlyPaymentDiscountPct: 0,
    earlyPaymentDiscountDays: 0,
    latePaymentPenaltyPct: 1.0,
    historicalDelayTolerance: 20, // Very flexible
    status: "Upcoming",
    category: "Services",
    criticality: "Low",
    requiresApproval: false,
  },

  // UPCOMING - Packaging supplier
  {
    payableId: "PAY-004",
    vendorId: "VEN-004",
    vendorName: "Universal Packaging Ltd",
    invoiceId: "INV-PKG-5512",
    invoiceAmount: 340000,
    invoiceDate: addDays(today, -10),
    dueDate: addDays(today, 20),
    earlyPaymentDiscountPct: 1.5,
    earlyPaymentDiscountDays: 15,
    latePaymentPenaltyPct: 1.2,
    historicalDelayTolerance: 10,
    status: "Upcoming",
    category: "Packaging",
    criticality: "Medium",
    requiresApproval: false,
  },

  // DUE SOON - Logistics partner (strict)
  {
    payableId: "PAY-005",
    vendorId: "VEN-005",
    vendorName: "Express Freight Services",
    invoiceId: "INV-LOG-9987",
    invoiceAmount: 220000,
    invoiceDate: addDays(today, -25),
    dueDate: addDays(today, 5),
    earlyPaymentDiscountPct: 0,
    earlyPaymentDiscountDays: 0,
    latePaymentPenaltyPct: 3.0, // Strict penalties
    historicalDelayTolerance: 5, // Some flexibility
    status: "Upcoming",
    category: "Logistics",
    criticality: "High",
    requiresApproval: false,
  },

  // UPCOMING - Marketing agency (very flexible)
  {
    payableId: "PAY-006",
    vendorId: "VEN-006",
    vendorName: "Creative Marketing Hub",
    invoiceId: "INV-MKT-7723",
    invoiceAmount: 85000,
    invoiceDate: addDays(today, -5),
    dueDate: addDays(today, 25),
    earlyPaymentDiscountPct: 0,
    earlyPaymentDiscountDays: 0,
    latePaymentPenaltyPct: 0.5, // Minimal penalty
    historicalDelayTolerance: 30, // Very tolerant
    status: "Upcoming",
    category: "Marketing",
    criticality: "Low",
    requiresApproval: false,
  },

  // DUE SOON - Equipment rental (moderate)
  {
    payableId: "PAY-007",
    vendorId: "VEN-007",
    vendorName: "Industrial Equipment Rentals",
    invoiceId: "INV-EQP-4421",
    invoiceAmount: 450000,
    invoiceDate: addDays(today, -20),
    dueDate: addDays(today, 10),
    earlyPaymentDiscountPct: 1.0,
    earlyPaymentDiscountDays: 7,
    latePaymentPenaltyPct: 2.0,
    historicalDelayTolerance: 7,
    status: "Upcoming",
    category: "Equipment",
    criticality: "Medium",
    requiresApproval: false,
  },

  // OVERDUE - Small supplier (already late)
  {
    payableId: "PAY-008",
    vendorId: "VEN-008",
    vendorName: "Office Supplies Co",
    invoiceId: "INV-SUP-1190",
    invoiceAmount: 42000,
    invoiceDate: addDays(today, -40),
    dueDate: addDays(today, -5), // 5 days overdue
    earlyPaymentDiscountPct: 0,
    earlyPaymentDiscountDays: 0,
    latePaymentPenaltyPct: 1.5,
    historicalDelayTolerance: 10,
    status: "Overdue",
    category: "Office Supplies",
    criticality: "Low",
    requiresApproval: false,
  },

  // UPCOMING - Insurance premium (strict deadline)
  {
    payableId: "PAY-009",
    vendorId: "VEN-009",
    vendorName: "National Insurance Corp",
    invoiceId: "INV-INS-6634",
    invoiceAmount: 320000,
    invoiceDate: addDays(today, -15),
    dueDate: addDays(today, 15),
    earlyPaymentDiscountPct: 0,
    earlyPaymentDiscountDays: 0,
    latePaymentPenaltyPct: 5.0, // Very strict - policy cancellation risk
    historicalDelayTolerance: 0, // No tolerance
    status: "Upcoming",
    category: "Insurance",
    criticality: "High",
    requiresApproval: false,
  },

  // UPCOMING - Maintenance contract
  {
    payableId: "PAY-010",
    vendorId: "VEN-010",
    vendorName: "Facility Maintenance Services",
    invoiceId: "INV-MNT-8845",
    invoiceAmount: 95000,
    invoiceDate: addDays(today, -12),
    dueDate: addDays(today, 18),
    earlyPaymentDiscountPct: 0,
    earlyPaymentDiscountDays: 0,
    latePaymentPenaltyPct: 1.0,
    historicalDelayTolerance: 15,
    status: "Upcoming",
    category: "Maintenance",
    criticality: "Medium",
    requiresApproval: false,
  },

  // UPCOMING - Raw materials (negotiable terms)
  {
    payableId: "PAY-011",
    vendorId: "VEN-011",
    vendorName: "Chemical Supplies Ltd",
    invoiceId: "INV-CHM-3312",
    invoiceAmount: 580000,
    invoiceDate: addDays(today, -8),
    dueDate: addDays(today, 22),
    earlyPaymentDiscountPct: 1.0,
    earlyPaymentDiscountDays: 10,
    latePaymentPenaltyPct: 1.2,
    historicalDelayTolerance: 12,
    status: "Upcoming",
    category: "Raw Materials",
    criticality: "High",
    requiresApproval: true,
  },

  // DUE TODAY - Rent (non-negotiable)
  {
    payableId: "PAY-012",
    vendorId: "VEN-012",
    vendorName: "Commercial Property Management",
    invoiceId: "INV-RNT-2026-02",
    invoiceAmount: 280000,
    invoiceDate: addDays(today, -30),
    dueDate: addDays(today, 0), // TODAY
    earlyPaymentDiscountPct: 0,
    earlyPaymentDiscountDays: 0,
    latePaymentPenaltyPct: 3.0,
    historicalDelayTolerance: 2, // Very strict
    status: "Due Today",
    category: "Rent",
    criticality: "High",
    requiresApproval: false,
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate total payables for a given period
 */
export function calculateTotalPayables(
  payables: VendorPayable[],
  daysAhead: number = 30
): number {
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

  return payables
    .filter((p) => {
      const dueDate = new Date(p.dueDate);
      return dueDate <= cutoffDate && p.status !== "Paid";
    })
    .reduce((sum, p) => sum + p.invoiceAmount, 0);
}

/**
 * Calculate payables due today
 */
export function calculateDueToday(payables: VendorPayable[]): number {
  return payables
    .filter((p) => p.status === "Due Today")
    .reduce((sum, p) => sum + p.invoiceAmount, 0);
}

/**
 * Calculate safely delayable amount
 * (payables where historicalDelayTolerance > 7 days and penalty < 2%)
 */
export function calculateSafelyDelayable(payables: VendorPayable[]): number {
  return payables
    .filter(
      (p) =>
        p.status !== "Paid" &&
        p.historicalDelayTolerance > 7 &&
        p.latePaymentPenaltyPct < 2.0
    )
    .reduce((sum, p) => sum + p.invoiceAmount, 0);
}

/**
 * Calculate optimal payment date for a single payable
 * 
 * Logic:
 * 1. If early discount available and beneficial → Pay early
 * 2. If penalty is high (>2%) or tolerance is low (<5 days) → Pay on due date
 * 3. Otherwise → Delay by historicalDelayTolerance days
 * 
 * Float Benefit = (Amount × Annual Cost of Capital × Days) / 365
 * Penalty Risk = (Amount × Penalty% × Days Late) / 30
 */
export function calculateOptimalPayDate(
  payable: VendorPayable,
  annualCostOfCapital: number = 0.12 // 12% annual cost
): OptimalPaymentRecommendation {
  const dueDate = new Date(payable.dueDate);
  const todayDate = new Date(today);
  
  // Calculate days until due
  const daysUntilDue = Math.ceil((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  // SCENARIO 1: Early payment discount available
  if (
    payable.earlyPaymentDiscountPct > 0 &&
    daysUntilDue >= payable.earlyPaymentDiscountDays
  ) {
    const discountAmount = (payable.invoiceAmount * payable.earlyPaymentDiscountPct) / 100;
    const earlyPayDate = new Date(dueDate);
    earlyPayDate.setDate(earlyPayDate.getDate() - payable.earlyPaymentDiscountDays);
    
    const daysEarly = payable.earlyPaymentDiscountDays;
    const floatCost = (payable.invoiceAmount * annualCostOfCapital * daysEarly) / 365;
    const netBenefit = discountAmount - floatCost;

    if (netBenefit > 0) {
      return {
        payableId: payable.payableId,
        vendorName: payable.vendorName,
        invoiceAmount: payable.invoiceAmount,
        dueDate: payable.dueDate,
        optimalPayDate: earlyPayDate.toISOString().split("T")[0],
        daysDelayed: -daysEarly,
        floatBenefit: Math.round(discountAmount),
        penaltyRisk: Math.round(floatCost),
        netBenefit: Math.round(netBenefit),
        recommendation: "Pay Early",
        rationale: `Early payment discount of ${payable.earlyPaymentDiscountPct}% (৳${Math.round(discountAmount).toLocaleString()}) exceeds float cost of ৳${Math.round(floatCost).toLocaleString()}. Net gain: ৳${Math.round(netBenefit).toLocaleString()}.`,
      };
    }
  }

  // SCENARIO 2: High penalty or strict vendor → Pay on due date
  if (
    payable.latePaymentPenaltyPct > 2.0 ||
    payable.historicalDelayTolerance < 5 ||
    payable.criticality === "High"
  ) {
    return {
      payableId: payable.payableId,
      vendorName: payable.vendorName,
      invoiceAmount: payable.invoiceAmount,
      dueDate: payable.dueDate,
      optimalPayDate: payable.dueDate,
      daysDelayed: 0,
      floatBenefit: 0,
      penaltyRisk: 0,
      netBenefit: 0,
      recommendation: "Pay Now",
      rationale: `High penalty risk (${payable.latePaymentPenaltyPct}%/month) or strict vendor. Pay on due date to avoid penalties and maintain relationship.`,
    };
  }

  // SCENARIO 3: Safe to delay → Calculate optimal delay
  const maxDelayDays = Math.min(payable.historicalDelayTolerance, 15); // Cap at 15 days
  const optimalDate = new Date(dueDate);
  optimalDate.setDate(optimalDate.getDate() + maxDelayDays);

  const floatBenefit = (payable.invoiceAmount * annualCostOfCapital * maxDelayDays) / 365;
  const penaltyRisk = (payable.invoiceAmount * payable.latePaymentPenaltyPct * maxDelayDays) / 30 / 100;
  const netBenefit = floatBenefit - penaltyRisk;

  if (netBenefit > 500) { // Only recommend delay if net benefit > ৳500
    return {
      payableId: payable.payableId,
      vendorName: payable.vendorName,
      invoiceAmount: payable.invoiceAmount,
      dueDate: payable.dueDate,
      optimalPayDate: optimalDate.toISOString().split("T")[0],
      daysDelayed: maxDelayDays,
      floatBenefit: Math.round(floatBenefit),
      penaltyRisk: Math.round(penaltyRisk),
      netBenefit: Math.round(netBenefit),
      recommendation: "Delay",
      rationale: `Vendor accepts ${payable.historicalDelayTolerance}-day delay. Delaying ${maxDelayDays} days retains ৳${Math.round(floatBenefit).toLocaleString()} in float with minimal penalty risk (৳${Math.round(penaltyRisk).toLocaleString()}). Net benefit: ৳${Math.round(netBenefit).toLocaleString()}.`,
    };
  }

  // SCENARIO 4: Neutral - no clear benefit either way
  return {
    payableId: payable.payableId,
    vendorName: payable.vendorName,
    invoiceAmount: payable.invoiceAmount,
    dueDate: payable.dueDate,
    optimalPayDate: payable.dueDate,
    daysDelayed: 0,
    floatBenefit: 0,
    penaltyRisk: 0,
    netBenefit: 0,
    recommendation: "Neutral",
    rationale: `No significant benefit from early payment or delay. Pay on due date as scheduled.`,
  };
}

/**
 * Calculate optimal pay dates for all payables
 */
export function calculateAllOptimalPayDates(
  payables: VendorPayable[]
): OptimalPaymentRecommendation[] {
  return payables
    .filter((p) => p.status !== "Paid")
    .map((p) => calculateOptimalPayDate(p))
    .sort((a, b) => {
      // Sort by net benefit (descending)
      return b.netBenefit - a.netBenefit;
    });
}

/**
 * Calculate bulk payment plan for selected payables
 */
export function calculateBulkPaymentPlan(
  payableIds: string[],
  payables: VendorPayable[]
): BulkPaymentPlan {
  const selectedPayables = payables.filter((p) => payableIds.includes(p.payableId));
  const recommendations = selectedPayables.map((p) => calculateOptimalPayDate(p));

  const totalAmount = selectedPayables.reduce((sum, p) => sum + p.invoiceAmount, 0);
  const totalFloatBenefit = recommendations.reduce((sum, r) => sum + r.floatBenefit, 0);
  const totalPenaltyRisk = recommendations.reduce((sum, r) => sum + r.penaltyRisk, 0);
  const netCashRetained = totalFloatBenefit - totalPenaltyRisk;

  // Consolidated optimal date = latest optimal date among selected
  const optimalDates = recommendations.map((r) => new Date(r.optimalPayDate));
  const latestDate = new Date(Math.max(...optimalDates.map((d) => d.getTime())));

  return {
    selectedPayableIds: payableIds,
    totalAmount,
    consolidatedOptimalDate: latestDate.toISOString().split("T")[0],
    totalFloatBenefit: Math.round(totalFloatBenefit),
    totalPenaltyRisk: Math.round(totalPenaltyRisk),
    netCashRetained: Math.round(netCashRetained),
    payableCount: selectedPayables.length,
  };
}

/**
 * Calculate early payment habit metrics (REALITY CHECK)
 * Shows how many days earlier SME is paying compared to optimal dates
 */
export interface EarlyPaymentHabit {
  avgEarlyPayDays: number; // Average days paying before optimal date
  floatLost: number; // Total cash opportunity cost from early payments
  vendorsAffectedCount: number; // Number of vendors paid early
  vendorsAffectedPct: number; // % of total vendors
  totalPayables: number; // Total number of payables analyzed
}

export function calculateEarlyPaymentHabit(
  payables: VendorPayable[]
): EarlyPaymentHabit {
  const recommendations = payables.map((p) => calculateOptimalPayDate(p));
  
  // Filter for vendors where early payment is NOT recommended
  // (i.e., we're paying earlier than optimal without discount benefit)
  const earlyPayments = recommendations.filter((rec) => {
    // If recommendation is "Delay", it means we should pay later
    // So current behavior is early
    return rec.recommendation === "Delay" && rec.daysDelayed > 0;
  });

  const avgEarlyPayDays = earlyPayments.length > 0
    ? Math.round(earlyPayments.reduce((sum, rec) => sum + rec.daysDelayed, 0) / earlyPayments.length)
    : 0;

  // Float lost = sum of all float benefits we're missing by paying early
  const floatLost = Math.round(
    earlyPayments.reduce((sum, rec) => sum + rec.floatBenefit, 0)
  );

  const vendorsAffectedCount = earlyPayments.length;
  const vendorsAffectedPct = payables.length > 0
    ? Math.round((vendorsAffectedCount / payables.length) * 100)
    : 0;

  return {
    avgEarlyPayDays,
    floatLost,
    vendorsAffectedCount,
    vendorsAffectedPct,
    totalPayables: payables.length,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `৳${(amount / 100000).toFixed(1)}L`;
  }
  return `৳${(amount / 1000).toFixed(0)}K`;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}