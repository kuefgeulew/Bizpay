/**
 * TAX & COMPLIANCE REPORT SCREEN
 * Read-only GST/VAT summary with period selector.
 * Sections: GST Summary (Outward/Inward), Tax Collected vs Payable, Period Detail.
 * No filing. No payment. No nudges.
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import {
  getTaxSummary,
  getAllTaxPeriods,
  type TaxPeriod,
  type TaxSummary,
  type GSTSummaryRow,
} from "../../../mock/taxComplianceData";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45 };

const fmtBDT = (n: number) =>
  new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(Math.abs(n));

interface TaxComplianceScreenProps {
  onBack: () => void;
}

export default function TaxComplianceScreen({ onBack }: TaxComplianceScreenProps) {
  const periods = getAllTaxPeriods();
  const [selectedPeriodId, setSelectedPeriodId] = useState(periods[0].id);
  const [periodType, setPeriodType] = useState<"monthly" | "quarterly">("monthly");

  const filteredPeriods = periods.filter((p) => p.type === periodType);
  const taxData = getTaxSummary(selectedPeriodId);

  // When switching period type, pick first available period of that type
  function handlePeriodTypeChange(type: "monthly" | "quarterly") {
    setPeriodType(type);
    const firstOfType = periods.find((p) => p.type === type);
    if (firstOfType) setSelectedPeriodId(firstOfType.id);
  }

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Tax & Compliance</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            GST / VAT Summary
          </p>
        </div>
      </header>

      {/* Period Type Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.05 }}
        className="flex gap-2 mb-4"
      >
        {(["monthly", "quarterly"] as const).map((type) => (
          <button
            key={type}
            onClick={() => handlePeriodTypeChange(type)}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-[0.15em] border transition-all ${
              periodType === type
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            }`}
          >
            {type === "monthly" ? "Monthly" : "Quarterly"}
          </button>
        ))}
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.08 }}
        className="mb-6 relative"
      >
        <select
          value={selectedPeriodId}
          onChange={(e) => setSelectedPeriodId(e.target.value)}
          className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all pr-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
          }}
        >
          {filteredPeriods.map((p) => (
            <option key={p.id} value={p.id} className="bg-slate-900">
              {p.label}
            </option>
          ))}
        </select>
      </motion.div>

      {taxData ? (
        <>
          {/* ═══ HEADLINE KPIs ═══ */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <TaxKPI
              label="Tax Collected"
              value={taxData.totalOutwardTax}
              color="emerald"
              delay={0.1}
            />
            <TaxKPI
              label="Input Tax"
              value={taxData.totalInwardTax}
              color="amber"
              delay={0.14}
            />
            <TaxKPI
              label={taxData.netPayable >= 0 ? "Net Payable" : "Net Credit"}
              value={Math.abs(taxData.netPayable)}
              color={taxData.netPayable >= 0 ? "red" : "cyan"}
              delay={0.18}
            />
          </div>

          {/* ═══ OUTWARD SUPPLY — Tax Collected ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...STIFF_SPRING, delay: 0.2 }}
            className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 mb-5"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ArrowUpRight size={16} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-serif text-white text-sm">Outward Supply</h3>
                <p className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Tax Collected on Sales</p>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 mb-2 px-1">
              <span className="text-[8px] uppercase tracking-wider text-white/25">Category</span>
              <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">CGST</span>
              <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">SGST</span>
              <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">Total</span>
            </div>

            {/* Rows */}
            {taxData.outwardSupply.map((row, idx) => (
              <GSTRow key={row.category} row={row} idx={idx} />
            ))}

            {/* Total */}
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-[1fr_60px_60px_60px] gap-2 px-1">
              <span className="text-[10px] text-white/50 font-semibold">
                Total ({fmtBDT(taxData.totalTaxableOutward)} taxable)
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80 text-right">
                {fmtBDT(taxData.outwardSupply.reduce((s, r) => s + r.cgst, 0))}
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80 text-right">
                {fmtBDT(taxData.outwardSupply.reduce((s, r) => s + r.sgst, 0))}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 text-right font-semibold">
                {fmtBDT(taxData.totalOutwardTax)}
              </span>
            </div>
          </motion.div>

          {/* ═══ INWARD SUPPLY — Input Tax Credit ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...STIFF_SPRING, delay: 0.26 }}
            className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 mb-5"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ArrowDownRight size={16} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif text-white text-sm">Inward Supply</h3>
                <p className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Input Tax Credit on Purchases</p>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 mb-2 px-1">
              <span className="text-[8px] uppercase tracking-wider text-white/25">Category</span>
              <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">CGST</span>
              <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">SGST</span>
              <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">Total</span>
            </div>

            {/* Rows */}
            {taxData.inwardSupply.map((row, idx) => (
              <GSTRow key={row.category} row={row} idx={idx} />
            ))}

            {/* Total */}
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-[1fr_60px_60px_60px] gap-2 px-1">
              <span className="text-[10px] text-white/50 font-semibold">
                Total ({fmtBDT(taxData.totalTaxableInward)} taxable)
              </span>
              <span className="text-[10px] font-mono text-amber-400/80 text-right">
                {fmtBDT(taxData.inwardSupply.reduce((s, r) => s + r.cgst, 0))}
              </span>
              <span className="text-[10px] font-mono text-amber-400/80 text-right">
                {fmtBDT(taxData.inwardSupply.reduce((s, r) => s + r.sgst, 0))}
              </span>
              <span className="text-[10px] font-mono text-amber-400 text-right font-semibold">
                {fmtBDT(taxData.totalInwardTax)}
              </span>
            </div>
          </motion.div>

          {/* ═══ NET TAX POSITION ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...STIFF_SPRING, delay: 0.32 }}
            className={`rounded-[28px] border backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 ${
              taxData.netPayable >= 0
                ? "bg-gradient-to-br from-red-500/5 to-red-500/[0.02] border-red-500/20"
                : "bg-gradient-to-br from-cyan-500/5 to-cyan-500/[0.02] border-cyan-500/20"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  taxData.netPayable >= 0
                    ? "bg-red-500/10 border border-red-500/20"
                    : "bg-cyan-500/10 border border-cyan-500/20"
                }`}
              >
                <Scale
                  size={16}
                  className={taxData.netPayable >= 0 ? "text-red-400" : "text-cyan-400"}
                />
              </div>
              <h3 className="font-serif text-white text-sm">Net Tax Position</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-bold">
                  Output Tax (Collected)
                </span>
                <span className="text-sm font-mono text-emerald-400">
                  BDT {fmtBDT(taxData.totalOutwardTax)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-bold">
                  Input Tax (Credit)
                </span>
                <span className="text-sm font-mono text-amber-400">
                  BDT {fmtBDT(taxData.totalInwardTax)}
                </span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-bold">
                  {taxData.netPayable >= 0 ? "Net Tax Payable" : "Net Tax Credit (Refundable)"}
                </span>
                <span
                  className={`text-lg font-mono font-semibold ${
                    taxData.netPayable >= 0 ? "text-red-400" : "text-cyan-400"
                  }`}
                >
                  BDT {fmtBDT(taxData.netPayable)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Period Metadata */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-5 px-2"
          >
            <p className="text-[9px] text-white/20 text-center">
              Period: {taxData.period.startDate} to {taxData.period.endDate} &middot;{" "}
              {taxData.period.type === "monthly" ? "Monthly" : "Quarterly"} Summary &middot;{" "}
              Generated {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </motion.div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <FileSpreadsheet size={40} className="text-white/15 mb-4" />
          <p className="text-sm text-white/30">No data for selected period</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// GST ROW
// ═══════════════════════════════════════════

function GSTRow({ row, idx }: { row: GSTSummaryRow; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 600, damping: 45, delay: 0.22 + idx * 0.04 }}
      className="grid grid-cols-[1fr_60px_60px_60px] gap-2 py-2.5 px-1 border-b border-white/[0.04] last:border-0"
    >
      <div className="min-w-0">
        <p className="text-[11px] text-white/70 truncate">{row.category}</p>
        <p className="text-[9px] text-white/25 truncate">{row.description}</p>
      </div>
      <span className="text-[10px] font-mono text-white/50 text-right self-center">
        {fmtBDT(row.cgst)}
      </span>
      <span className="text-[10px] font-mono text-white/50 text-right self-center">
        {fmtBDT(row.sgst)}
      </span>
      <span className="text-[10px] font-mono text-white/70 text-right self-center">
        {fmtBDT(row.totalTax)}
      </span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// TAX KPI CARD
// ═══════════════════════════════════════════

function TaxKPI({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber" | "red" | "cyan";
  delay: number;
}) {
  const colorMap = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
    red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
  };
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 600, damping: 45, delay }}
      className={`rounded-[20px] ${c.bg} ${c.border} border p-3 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]`}
    >
      <p className="text-[8px] uppercase tracking-[0.15em] text-white/30 font-bold mb-1.5">
        {label}
      </p>
      <p className={`text-[12px] font-mono ${c.text}`}>
        {fmtBDT(value)}
      </p>
    </motion.div>
  );
}
