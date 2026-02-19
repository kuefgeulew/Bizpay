// CASA FEATURE 3: CASH INTELLIGENCE
// Runway, Safety, Forecasting — CFO Brain of BizPay

// ==================== TYPE DEFINITIONS ====================

export interface FixedObligation {
  obligationId: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date
  category: "Rent" | "Salary" | "EMI" | "Tax" | "Insurance" | "Subscription";
  criticality: "Critical" | "High" | "Medium";
}

export interface VariableOutflow {
  outflowId: string;
  name: string;
  estimatedAmount: number;
  frequency: "Daily" | "Weekly" | "Monthly";
  category: "Vendor" | "Operations" | "Marketing" | "Supplies" | "Utilities";
}

export interface CashSnapshot {
  currentBalance: number;
  avgDailyInflow: number;
  avgDailyOutflow: number;
  fixedObligations: FixedObligation[];
  variableOutflows: VariableOutflow[];
  lastUpdated: string; // ISO date
}

export interface ForecastWindow {
  date: string; // ISO date
  projectedBalance: number;
  riskLevel: "safe" | "warning" | "critical";
  netChange: number; // daily net change
  cumulativeInflow: number;
  cumulativeOutflow: number;
}

export interface SeasonalityPattern {
  month: string;
  avgInflowChange: number; // percentage vs baseline
  avgOutflowChange: number; // percentage vs baseline
  insight: string;
}

// ==================== MOCK DATA ====================

// Fixed obligations for next 30 days
export const FIXED_OBLIGATIONS: FixedObligation[] = [
  {
    obligationId: "obl_001",
    name: "Office Rent",
    amount: 185000,
    dueDate: "2026-02-25",
    category: "Rent",
    criticality: "Critical",
  },
  {
    obligationId: "obl_002",
    name: "Salary Payroll",
    amount: 1450000,
    dueDate: "2026-03-01",
    category: "Salary",
    criticality: "Critical",
  },
  {
    obligationId: "obl_003",
    name: "GST Payment Q4",
    amount: 425000,
    dueDate: "2026-02-28",
    category: "Tax",
    criticality: "Critical",
  },
  {
    obligationId: "obl_004",
    name: "Business Loan EMI",
    amount: 95000,
    dueDate: "2026-03-05",
    category: "EMI",
    criticality: "High",
  },
  {
    obligationId: "obl_005",
    name: "Insurance Premium",
    amount: 32000,
    dueDate: "2026-03-10",
    category: "Insurance",
    criticality: "Medium",
  },
  {
    obligationId: "obl_006",
    name: "Software Subscriptions",
    amount: 28000,
    dueDate: "2026-02-28",
    category: "Subscription",
    criticality: "Medium",
  },
];

// Variable outflows (daily/weekly estimates)
export const VARIABLE_OUTFLOWS: VariableOutflow[] = [
  {
    outflowId: "var_001",
    name: "Vendor Payments",
    estimatedAmount: 185000,
    frequency: "Weekly",
    category: "Vendor",
  },
  {
    outflowId: "var_002",
    name: "Operational Expenses",
    estimatedAmount: 42000,
    frequency: "Weekly",
    category: "Operations",
  },
  {
    outflowId: "var_003",
    name: "Marketing Spend",
    estimatedAmount: 35000,
    frequency: "Weekly",
    category: "Marketing",
  },
  {
    outflowId: "var_004",
    name: "Office Supplies",
    estimatedAmount: 18000,
    frequency: "Weekly",
    category: "Supplies",
  },
  {
    outflowId: "var_005",
    name: "Utilities",
    estimatedAmount: 8500,
    frequency: "Daily",
    category: "Utilities",
  },
];

// Current cash snapshot
export const CASH_SNAPSHOT: CashSnapshot = {
  currentBalance: 4850000, // ৳48.5L
  avgDailyInflow: 185000, // ৳1.85L/day (from receivables, sales)
  avgDailyOutflow: 142000, // ৳1.42L/day (vendors, ops, fixed costs)
  fixedObligations: FIXED_OBLIGATIONS,
  variableOutflows: VARIABLE_OUTFLOWS,
  lastUpdated: "2026-02-17T09:30:00Z",
};

// Seasonality patterns (last 6 months)
export const SEASONALITY: SeasonalityPattern[] = [
  {
    month: "January",
    avgInflowChange: -12,
    avgOutflowChange: +8,
    insight: "Post-holiday slowdown: inflow drops 12%, outflow rises 8% (restocking).",
  },
  {
    month: "February",
    avgInflowChange: +5,
    avgOutflowChange: +3,
    insight: "Moderate recovery: inflow improves 5%, outflow stable at +3%.",
  },
  {
    month: "March",
    avgInflowChange: +18,
    avgOutflowChange: +12,
    insight: "Fiscal year-end spike: inflow surges 18%, outflow increases 12% (inventory).",
  },
  {
    month: "April",
    avgInflowChange: -8,
    avgOutflowChange: -5,
    insight: "Post year-end normalization: inflow dips 8%, outflow eases 5%.",
  },
];

// ==================== CALCULATION FUNCTIONS ====================

/**
 * Calculate Cash Runway (days until balance hits zero)
 * Formula: currentBalance / (avgDailyOutflow - avgDailyInflow)
 */
export function calculateCashRunway(snapshot: CashSnapshot): number {
  const netDailyBurn = snapshot.avgDailyOutflow - snapshot.avgDailyInflow;
  
  if (netDailyBurn <= 0) {
    return 999; // Infinite runway (positive cash flow)
  }
  
  return Math.floor(snapshot.currentBalance / netDailyBurn);
}

/**
 * Get risk level for cash runway
 */
export function getRunwayRiskLevel(runwayDays: number): "safe" | "warning" | "critical" {
  if (runwayDays > 45) return "safe";
  if (runwayDays >= 20) return "warning";
  return "critical";
}

/**
 * Calculate Minimum Safe Balance
 * Based on: Next 30-day fixed obligations + worst 7-day outflow spike
 */
export function calculateMinimumSafeBalance(snapshot: CashSnapshot): number {
  // Sum all fixed obligations
  const totalFixedObligations = snapshot.fixedObligations.reduce(
    (sum, obl) => sum + obl.amount,
    0
  );
  
  // Calculate worst 7-day spike (variable outflows × safety multiplier)
  const weeklyVariableOutflow = snapshot.variableOutflows.reduce((sum, v) => {
    if (v.frequency === "Daily") return sum + v.estimatedAmount * 7;
    if (v.frequency === "Weekly") return sum + v.estimatedAmount;
    if (v.frequency === "Monthly") return sum + v.estimatedAmount / 4;
    return sum;
  }, 0);
  
  const worst7DaySpike = weeklyVariableOutflow * 1.3; // 30% safety buffer
  
  return Math.round(totalFixedObligations + worst7DaySpike);
}

/**
 * Generate 30-day forecast
 */
export function generate30DayForecast(snapshot: CashSnapshot): ForecastWindow[] {
  const forecast: ForecastWindow[] = [];
  const today = new Date("2026-02-17"); // Current date
  
  let runningBalance = snapshot.currentBalance;
  
  for (let i = 0; i < 30; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    const dateStr = forecastDate.toISOString().split("T")[0];
    
    // Calculate daily inflow (with slight randomness)
    const dailyInflow = snapshot.avgDailyInflow * (0.9 + Math.random() * 0.2);
    
    // Calculate daily outflow (with slight randomness + check for fixed obligations)
    let dailyOutflow = snapshot.avgDailyOutflow * (0.9 + Math.random() * 0.2);
    
    // Add fixed obligations if due on this date
    const obligationsDueToday = snapshot.fixedObligations.filter(
      (obl) => obl.dueDate === dateStr
    );
    const obligationAmount = obligationsDueToday.reduce((sum, obl) => sum + obl.amount, 0);
    dailyOutflow += obligationAmount;
    
    // Calculate net change
    const netChange = dailyInflow - dailyOutflow;
    runningBalance += netChange;
    
    // Determine risk level
    let riskLevel: "safe" | "warning" | "critical" = "safe";
    const minSafeBalance = calculateMinimumSafeBalance(snapshot);
    
    if (runningBalance < minSafeBalance * 0.5) {
      riskLevel = "critical";
    } else if (runningBalance < minSafeBalance) {
      riskLevel = "warning";
    }
    
    forecast.push({
      date: dateStr,
      projectedBalance: Math.round(runningBalance),
      riskLevel,
      netChange: Math.round(netChange),
      cumulativeInflow: Math.round(dailyInflow),
      cumulativeOutflow: Math.round(dailyOutflow),
    });
  }
  
  return forecast;
}

/**
 * Find first breach date (when balance drops below safe zone)
 */
export function findFirstBreachDate(
  forecast: ForecastWindow[],
  minSafeBalance: number
): string | null {
  const breachDay = forecast.find((day) => day.projectedBalance < minSafeBalance);
  return breachDay ? breachDay.date : null;
}

/**
 * Calculate days until breach
 */
export function calculateDaysUntilBreach(
  forecast: ForecastWindow[],
  minSafeBalance: number
): number | null {
  const breachDay = forecast.findIndex((day) => day.projectedBalance < minSafeBalance);
  return breachDay >= 0 ? breachDay + 1 : null;
}

/**
 * Format currency (Bangladeshi Taka)
 */
export function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 10000000) {
    return `৳${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (absAmount >= 100000) {
    return `৳${(amount / 100000).toFixed(1)}L`;
  }
  if (absAmount >= 1000) {
    return `৳${(amount / 1000).toFixed(0)}K`;
  }
  return `৳${amount.toLocaleString()}`;
}

/**
 * Format date (readable format)
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Get current month seasonality
 */
export function getCurrentSeasonality(): SeasonalityPattern {
  // Current month is February (index 1)
  return SEASONALITY[1];
}

/**
 * Get next month seasonality
 */
export function getNextSeasonality(): SeasonalityPattern {
  // Next month is March (index 2)
  return SEASONALITY[2];
}