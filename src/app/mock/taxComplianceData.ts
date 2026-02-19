/**
 * TAX & COMPLIANCE — MOCK DATA
 * GST / VAT summary data derived from invoice and bill payment records.
 * Display only — no filing, no payment, no nudges.
 */

export type TaxPeriodType = "monthly" | "quarterly";

export interface GSTSummaryRow {
  category: string;
  description: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

export interface TaxPeriod {
  id: string;
  label: string;
  type: TaxPeriodType;
  startDate: string;
  endDate: string;
}

export interface TaxSummary {
  period: TaxPeriod;
  outwardSupply: GSTSummaryRow[];
  inwardSupply: GSTSummaryRow[];
  totalOutwardTax: number;
  totalInwardTax: number;
  netPayable: number;
  totalTaxableOutward: number;
  totalTaxableInward: number;
}

// ── AVAILABLE PERIODS ──
export const TAX_PERIODS: TaxPeriod[] = [
  { id: "m_2026_02", label: "February 2026", type: "monthly", startDate: "2026-02-01", endDate: "2026-02-28" },
  { id: "m_2026_01", label: "January 2026", type: "monthly", startDate: "2026-01-01", endDate: "2026-01-31" },
  { id: "m_2025_12", label: "December 2025", type: "monthly", startDate: "2025-12-01", endDate: "2025-12-31" },
  { id: "q_2025_q4", label: "Q4 2025 (Oct–Dec)", type: "quarterly", startDate: "2025-10-01", endDate: "2025-12-31" },
  { id: "q_2025_q3", label: "Q3 2025 (Jul–Sep)", type: "quarterly", startDate: "2025-07-01", endDate: "2025-09-30" },
  { id: "q_2026_q1", label: "Q1 2026 (Jan–Mar)", type: "quarterly", startDate: "2026-01-01", endDate: "2026-03-31" },
];

// ── MOCK TAX DATA BY PERIOD ──
const TAX_DATA_MAP: Record<string, Omit<TaxSummary, "period">> = {
  m_2026_02: {
    outwardSupply: [
      { category: "Goods — Standard Rate", description: "Sales of commodities & FMCG", taxableValue: 1_245_000, cgst: 31_125, sgst: 31_125, igst: 0, totalTax: 62_250 },
      { category: "Goods — Reduced Rate", description: "Essential food items (rice, lentils)", taxableValue: 385_000, cgst: 4_812, sgst: 4_813, igst: 0, totalTax: 9_625 },
      { category: "Services", description: "Logistics & delivery charges", taxableValue: 48_000, cgst: 4_320, sgst: 4_320, igst: 0, totalTax: 8_640 },
    ],
    inwardSupply: [
      { category: "Raw Materials", description: "Purchase of commodities from suppliers", taxableValue: 892_000, cgst: 22_300, sgst: 22_300, igst: 0, totalTax: 44_600 },
      { category: "Services — Freight", description: "Inbound logistics & handling", taxableValue: 125_000, cgst: 11_250, sgst: 11_250, igst: 0, totalTax: 22_500 },
      { category: "Utilities", description: "Electricity, gas, water", taxableValue: 32_500, cgst: 2_925, sgst: 2_925, igst: 0, totalTax: 5_850 },
      { category: "Services — Professional", description: "Audit, legal, consulting fees", taxableValue: 65_000, cgst: 5_850, sgst: 5_850, igst: 0, totalTax: 11_700 },
    ],
    totalOutwardTax: 80_515,
    totalInwardTax: 84_650,
    netPayable: -4_135,
    totalTaxableOutward: 1_678_000,
    totalTaxableInward: 1_114_500,
  },
  m_2026_01: {
    outwardSupply: [
      { category: "Goods — Standard Rate", description: "Sales of commodities & FMCG", taxableValue: 1_128_000, cgst: 28_200, sgst: 28_200, igst: 0, totalTax: 56_400 },
      { category: "Goods — Reduced Rate", description: "Essential food items", taxableValue: 342_000, cgst: 4_275, sgst: 4_275, igst: 0, totalTax: 8_550 },
      { category: "Services", description: "Logistics & delivery charges", taxableValue: 42_000, cgst: 3_780, sgst: 3_780, igst: 0, totalTax: 7_560 },
    ],
    inwardSupply: [
      { category: "Raw Materials", description: "Purchase of commodities", taxableValue: 815_000, cgst: 20_375, sgst: 20_375, igst: 0, totalTax: 40_750 },
      { category: "Services — Freight", description: "Inbound logistics", taxableValue: 108_000, cgst: 9_720, sgst: 9_720, igst: 0, totalTax: 19_440 },
      { category: "Utilities", description: "Electricity, gas, water", taxableValue: 28_900, cgst: 2_601, sgst: 2_601, igst: 0, totalTax: 5_202 },
    ],
    totalOutwardTax: 72_510,
    totalInwardTax: 65_392,
    netPayable: 7_118,
    totalTaxableOutward: 1_512_000,
    totalTaxableInward: 951_900,
  },
  m_2025_12: {
    outwardSupply: [
      { category: "Goods — Standard Rate", description: "Year-end sales push", taxableValue: 1_520_000, cgst: 38_000, sgst: 38_000, igst: 0, totalTax: 76_000 },
      { category: "Goods — Reduced Rate", description: "Essential food items", taxableValue: 410_000, cgst: 5_125, sgst: 5_125, igst: 0, totalTax: 10_250 },
      { category: "Services", description: "Logistics & delivery", taxableValue: 55_000, cgst: 4_950, sgst: 4_950, igst: 0, totalTax: 9_900 },
    ],
    inwardSupply: [
      { category: "Raw Materials", description: "Year-end inventory build", taxableValue: 1_080_000, cgst: 27_000, sgst: 27_000, igst: 0, totalTax: 54_000 },
      { category: "Services — Freight", description: "Increased logistics", taxableValue: 142_000, cgst: 12_780, sgst: 12_780, igst: 0, totalTax: 25_560 },
      { category: "Capital Goods", description: "Warehouse equipment", taxableValue: 285_000, cgst: 25_650, sgst: 25_650, igst: 0, totalTax: 51_300 },
    ],
    totalOutwardTax: 96_150,
    totalInwardTax: 130_860,
    netPayable: -34_710,
    totalTaxableOutward: 1_985_000,
    totalTaxableInward: 1_507_000,
  },
  q_2025_q4: {
    outwardSupply: [
      { category: "Goods — Standard Rate", description: "Q4 commodity sales", taxableValue: 3_895_000, cgst: 97_375, sgst: 97_375, igst: 0, totalTax: 194_750 },
      { category: "Goods — Reduced Rate", description: "Essential items", taxableValue: 1_140_000, cgst: 14_250, sgst: 14_250, igst: 0, totalTax: 28_500 },
      { category: "Services", description: "Logistics & delivery", taxableValue: 148_000, cgst: 13_320, sgst: 13_320, igst: 0, totalTax: 26_640 },
    ],
    inwardSupply: [
      { category: "Raw Materials", description: "Q4 procurement", taxableValue: 2_785_000, cgst: 69_625, sgst: 69_625, igst: 0, totalTax: 139_250 },
      { category: "Services — Freight", description: "Q4 logistics", taxableValue: 385_000, cgst: 34_650, sgst: 34_650, igst: 0, totalTax: 69_300 },
      { category: "Capital Goods", description: "Equipment & fixtures", taxableValue: 285_000, cgst: 25_650, sgst: 25_650, igst: 0, totalTax: 51_300 },
      { category: "Utilities", description: "3-month utilities", taxableValue: 88_500, cgst: 7_965, sgst: 7_965, igst: 0, totalTax: 15_930 },
    ],
    totalOutwardTax: 249_890,
    totalInwardTax: 275_780,
    netPayable: -25_890,
    totalTaxableOutward: 5_183_000,
    totalTaxableInward: 3_543_500,
  },
  q_2025_q3: {
    outwardSupply: [
      { category: "Goods — Standard Rate", description: "Q3 commodity sales", taxableValue: 3_420_000, cgst: 85_500, sgst: 85_500, igst: 0, totalTax: 171_000 },
      { category: "Goods — Reduced Rate", description: "Essential items", taxableValue: 980_000, cgst: 12_250, sgst: 12_250, igst: 0, totalTax: 24_500 },
      { category: "Services", description: "Logistics & delivery", taxableValue: 132_000, cgst: 11_880, sgst: 11_880, igst: 0, totalTax: 23_760 },
    ],
    inwardSupply: [
      { category: "Raw Materials", description: "Q3 procurement", taxableValue: 2_450_000, cgst: 61_250, sgst: 61_250, igst: 0, totalTax: 122_500 },
      { category: "Services — Freight", description: "Q3 logistics", taxableValue: 320_000, cgst: 28_800, sgst: 28_800, igst: 0, totalTax: 57_600 },
      { category: "Utilities", description: "3-month utilities", taxableValue: 82_000, cgst: 7_380, sgst: 7_380, igst: 0, totalTax: 14_760 },
    ],
    totalOutwardTax: 219_260,
    totalInwardTax: 194_860,
    netPayable: 24_400,
    totalTaxableOutward: 4_532_000,
    totalTaxableInward: 2_852_000,
  },
  q_2026_q1: {
    outwardSupply: [
      { category: "Goods — Standard Rate", description: "Q1 commodity sales (partial)", taxableValue: 2_373_000, cgst: 59_325, sgst: 59_325, igst: 0, totalTax: 118_650 },
      { category: "Goods — Reduced Rate", description: "Essential items", taxableValue: 727_000, cgst: 9_087, sgst: 9_088, igst: 0, totalTax: 18_175 },
      { category: "Services", description: "Logistics & delivery", taxableValue: 90_000, cgst: 8_100, sgst: 8_100, igst: 0, totalTax: 16_200 },
    ],
    inwardSupply: [
      { category: "Raw Materials", description: "Q1 procurement", taxableValue: 1_707_000, cgst: 42_675, sgst: 42_675, igst: 0, totalTax: 85_350 },
      { category: "Services — Freight", description: "Q1 logistics", taxableValue: 233_000, cgst: 20_970, sgst: 20_970, igst: 0, totalTax: 41_940 },
      { category: "Utilities", description: "2-month utilities", taxableValue: 61_400, cgst: 5_526, sgst: 5_526, igst: 0, totalTax: 11_052 },
      { category: "Services — Professional", description: "Consulting fees", taxableValue: 65_000, cgst: 5_850, sgst: 5_850, igst: 0, totalTax: 11_700 },
    ],
    totalOutwardTax: 153_025,
    totalInwardTax: 150_042,
    netPayable: 2_983,
    totalTaxableOutward: 3_190_000,
    totalTaxableInward: 2_066_400,
  },
};

export function getTaxSummary(periodId: string): TaxSummary | null {
  const period = TAX_PERIODS.find((p) => p.id === periodId);
  const data = TAX_DATA_MAP[periodId];
  if (!period || !data) return null;
  return { period, ...data };
}

export function getAllTaxPeriods(): TaxPeriod[] {
  return [...TAX_PERIODS];
}

export function getMonthlyPeriods(): TaxPeriod[] {
  return TAX_PERIODS.filter((p) => p.type === "monthly");
}

export function getQuarterlyPeriods(): TaxPeriod[] {
  return TAX_PERIODS.filter((p) => p.type === "quarterly");
}
