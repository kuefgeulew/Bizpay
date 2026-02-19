/**
 * CASH FLOW ANALYSIS — MOCK DATA
 * Read-only historical cash flow data for reporting.
 * Derived from realistic SME transaction patterns.
 * No advice, no intelligence, no optimization copy.
 */

export interface CashFlowDay {
  date: string;          // YYYY-MM-DD
  inflow: number;        // total credits
  outflow: number;       // total debits
  net: number;           // inflow - outflow
  runningBalance: number;
}

export interface CashFlowCategory {
  category: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface ScheduledItem {
  id: string;
  date: string;
  type: "inflow" | "outflow";
  label: string;
  amount: number;
  category: string;
}

// ── SEED: 90-day daily cash flow ──
function generateDailyData(): CashFlowDay[] {
  const days: CashFlowDay[] = [];
  const baseDate = new Date("2025-11-21");
  let runningBalance = 1_450_000;

  // Realistic SME daily patterns
  const inflowPatterns = [
    18000, 22000, 5000, 31000, 12000, 0, 0,   // week pattern
    45000, 8000, 15000, 28000, 6000, 0, 0,
    12000, 52000, 9000, 14000, 35000, 0, 0,
    38000, 7000, 25000, 18000, 42000, 0, 0,
    15000, 28000, 11000, 55000, 9000, 0, 0,
    22000, 36000, 8000, 19000, 48000, 0, 0,
    12000, 42000, 6000, 32000, 15000, 0, 0,
    65000, 14000, 28000, 9000, 38000, 0, 0,
    18000, 52000, 7000, 24000, 45000, 0, 0,
    35000, 11000, 42000, 16000, 58000, 0, 0,
    22000, 38000, 9000, 28000, 15000, 0, 0,
    48000, 6000, 32000, 19000, 42000, 0, 0,
    14000, 55000, 8000, 36000, 12000, 0, 0,
  ];

  const outflowPatterns = [
    15000, 8000, 32000, 5000, 18000, 0, 0,
    28000, 12000, 6000, 42000, 8500, 0, 0,
    9000, 35000, 14000, 7000, 22000, 0, 0,
    6000, 48000, 11000, 28000, 9000, 0, 0,
    32000, 5000, 18000, 12000, 38000, 0, 0,
    14000, 8000, 42000, 6000, 25000, 0, 0,
    35000, 9000, 15000, 28000, 7000, 0, 0,
    11000, 52000, 8000, 32000, 14000, 0, 0,
    6000, 38000, 12000, 18000, 45000, 0, 0,
    28000, 9000, 35000, 7000, 22000, 0, 0,
    15000, 42000, 6000, 32000, 11000, 0, 0,
    8000, 28000, 14000, 48000, 9000, 0, 0,
    38000, 5000, 22000, 12000, 35000, 0, 0,
  ];

  for (let i = 0; i < 90; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const inflow = inflowPatterns[i % inflowPatterns.length];
    const outflow = outflowPatterns[i % outflowPatterns.length];
    const net = inflow - outflow;
    runningBalance += net;

    days.push({
      date: dateStr,
      inflow,
      outflow,
      net,
      runningBalance,
    });
  }

  return days;
}

export const CASH_FLOW_DAILY: CashFlowDay[] = generateDailyData();

// ── CATEGORIZED TOTALS (last 90 days) ──
export const CASH_FLOW_CATEGORIES: CashFlowCategory[] = [
  { category: "Collections", inflow: 1_245_000, outflow: 0, net: 1_245_000 },
  { category: "Payments", inflow: 0, outflow: 892_000, net: -892_000 },
  { category: "Salary & Wages", inflow: 0, outflow: 425_000, net: -425_000 },
  { category: "Bank Charges", inflow: 0, outflow: 18_500, net: -18_500 },
  { category: "Bill Payments", inflow: 0, outflow: 67_200, net: -67_200 },
  { category: "MFS Disbursements", inflow: 0, outflow: 185_000, net: -185_000 },
  { category: "Loan Repayment", inflow: 0, outflow: 125_000, net: -125_000 },
  { category: "Interest Income", inflow: 12_350, outflow: 0, net: 12_350 },
  { category: "Refunds", inflow: 28_400, outflow: 0, net: 28_400 },
];

// ── SCHEDULED / RECURRING (upcoming 30 days) ──
export const SCHEDULED_ITEMS: ScheduledItem[] = [
  { id: "sch_001", date: "2026-02-20", type: "outflow", label: "Supplier Payment — Acme Corp", amount: 250_000, category: "Payments" },
  { id: "sch_002", date: "2026-02-22", type: "inflow", label: "Collection — Karim General Store", amount: 85_000, category: "Collections" },
  { id: "sch_003", date: "2026-02-25", type: "outflow", label: "Monthly Salary Run", amount: 425_000, category: "Salary & Wages" },
  { id: "sch_004", date: "2026-02-28", type: "outflow", label: "Utility Bills (Electric + Gas)", amount: 32_500, category: "Bill Payments" },
  { id: "sch_005", date: "2026-03-01", type: "inflow", label: "Collection — Rahman Trading", amount: 65_000, category: "Collections" },
  { id: "sch_006", date: "2026-03-05", type: "outflow", label: "BRAC Loan EMI", amount: 125_000, category: "Loan Repayment" },
  { id: "sch_007", date: "2026-03-07", type: "inflow", label: "Collection — Hasan Dept Store", amount: 28_000, category: "Collections" },
  { id: "sch_008", date: "2026-03-10", type: "outflow", label: "MFS Vendor Disbursements", amount: 92_000, category: "MFS Disbursements" },
  { id: "sch_009", date: "2026-03-12", type: "inflow", label: "Collection — Mina Grocery", amount: 48_000, category: "Collections" },
  { id: "sch_010", date: "2026-03-15", type: "outflow", label: "Supplier Payment — Tech Solutions", amount: 180_000, category: "Payments" },
];

// ── HELPER: Filter daily data by period ──
export function getCashFlowByPeriod(days: 30 | 60 | 90): CashFlowDay[] {
  const data = CASH_FLOW_DAILY;
  return data.slice(data.length - days);
}

// ── HELPER: Period summary ──
export function getCashFlowSummary(days: 30 | 60 | 90) {
  const data = getCashFlowByPeriod(days);
  const totalInflow = data.reduce((s, d) => s + d.inflow, 0);
  const totalOutflow = data.reduce((s, d) => s + d.outflow, 0);
  const netCash = totalInflow - totalOutflow;
  const avgDailyInflow = totalInflow / days;
  const avgDailyOutflow = totalOutflow / days;
  const peakInflow = Math.max(...data.map((d) => d.inflow));
  const peakOutflow = Math.max(...data.map((d) => d.outflow));
  const currentBalance = data[data.length - 1]?.runningBalance ?? 0;

  return {
    totalInflow,
    totalOutflow,
    netCash,
    avgDailyInflow,
    avgDailyOutflow,
    peakInflow,
    peakOutflow,
    currentBalance,
  };
}

// ── HELPER: Scheduled projection ──
export function getScheduledProjection() {
  const items = SCHEDULED_ITEMS;
  const totalScheduledInflow = items.filter((i) => i.type === "inflow").reduce((s, i) => s + i.amount, 0);
  const totalScheduledOutflow = items.filter((i) => i.type === "outflow").reduce((s, i) => s + i.amount, 0);
  const netScheduled = totalScheduledInflow - totalScheduledOutflow;
  return { totalScheduledInflow, totalScheduledOutflow, netScheduled, items };
}