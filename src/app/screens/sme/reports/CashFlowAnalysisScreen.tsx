/**
 * CASH FLOW ANALYSIS — ENHANCED REPORTING SCREEN
 * Read-only historical cash flow data.
 * Period selector: 30 / 60 / 90 days.
 * Sections: Inflow vs Outflow chart, Net Cash Trend, Categorized Totals, Scheduled Projections.
 * No advice. No alerts. No optimization copy.
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  getCashFlowByPeriod,
  getCashFlowSummary,
  getScheduledProjection,
  CASH_FLOW_CATEGORIES,
  type CashFlowDay,
} from "../../../mock/cashFlowData";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45 };
type Period = 30 | 60 | 90;

const fmtBDT = (n: number) =>
  new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(Math.abs(n));

interface CashFlowAnalysisScreenProps {
  onBack: () => void;
}

export default function CashFlowAnalysisScreen({ onBack }: CashFlowAnalysisScreenProps) {
  const [period, setPeriod] = useState<Period>(30);

  const data = getCashFlowByPeriod(period);
  const summary = getCashFlowSummary(period);
  const scheduled = getScheduledProjection();

  // Chart data: sample every N days to keep chart readable
  const step = period <= 30 ? 1 : period <= 60 ? 2 : 3;
  const chartData = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      Inflow: d.inflow,
      Outflow: d.outflow,
    }));

  // Net cash trend chart
  const netTrendData = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      Balance: d.runningBalance,
    }));

  // Categorized bar data
  const categoryBarData = CASH_FLOW_CATEGORIES.map((c) => ({
    name: c.category,
    value: c.inflow > 0 ? c.inflow : -c.outflow,
    isPositive: c.inflow > 0,
  })).sort((a, b) => b.value - a.value);

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
          <h1 className="text-3xl font-serif tracking-tight">Cash Flow Analysis</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Historical Report
          </p>
        </div>
      </header>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.05 }}
        className="flex gap-2 mb-6"
      >
        {([30, 60, 90] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-[0.15em] border transition-all ${
              period === p
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            }`}
          >
            {p} Days
          </button>
        ))}
      </motion.div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KPICard
          label="Total Inflow"
          value={`BDT ${fmtBDT(summary.totalInflow)}`}
          icon={<ArrowUpRight size={16} />}
          color="emerald"
          delay={0.08}
        />
        <KPICard
          label="Total Outflow"
          value={`BDT ${fmtBDT(summary.totalOutflow)}`}
          icon={<ArrowDownRight size={16} />}
          color="red"
          delay={0.12}
        />
        <KPICard
          label="Net Cash"
          value={`${summary.netCash >= 0 ? "+" : "-"} BDT ${fmtBDT(summary.netCash)}`}
          icon={summary.netCash >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          color={summary.netCash >= 0 ? "cyan" : "amber"}
          delay={0.16}
        />
        <KPICard
          label="Current Balance"
          value={`BDT ${fmtBDT(summary.currentBalance)}`}
          icon={<BarChart3 size={16} />}
          color="cyan"
          delay={0.2}
        />
      </div>

      {/* ═══ INFLOW VS OUTFLOW CHART ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.22 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 mb-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-cyan-400" />
          </div>
          <h3 className="font-serif text-white text-sm">Inflow vs Outflow</h3>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-white/40">Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-[10px] text-white/40">Outflow</span>
          </div>
        </div>

        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
                interval={Math.max(0, Math.floor(chartData.length / 5) - 1)}
              />
              <YAxis
                tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,45,82,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "10px",
                  color: "white",
                }}
                formatter={(value: number) => [`BDT ${fmtBDT(value)}`, undefined]}
              />
              <Area
                type="monotone"
                dataKey="Inflow"
                stroke="#34d399"
                strokeWidth={1.5}
                fill="url(#inflowGrad)"
              />
              <Area
                type="monotone"
                dataKey="Outflow"
                stroke="#f87171"
                strokeWidth={1.5}
                fill="url(#outflowGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ═══ NET CASH POSITION TREND ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.28 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 mb-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <BarChart3 size={16} className="text-cyan-400" />
          </div>
          <h3 className="font-serif text-white text-sm">Net Cash Position</h3>
        </div>

        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
                interval={Math.max(0, Math.floor(netTrendData.length / 5) - 1)}
              />
              <YAxis
                tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,45,82,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "10px",
                  color: "white",
                }}
                formatter={(value: number) => [`BDT ${fmtBDT(value)}`, undefined]}
              />
              <Area
                type="monotone"
                dataKey="Balance"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#balGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ═══ CATEGORIZED TOTALS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.32 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 mb-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Layers size={16} className="text-white/40" />
          </div>
          <h3 className="font-serif text-white text-sm">Categorized Totals</h3>
          <span className="text-[9px] text-white/25 ml-auto">90-Day Aggregate</span>
        </div>

        <div className="space-y-2.5">
          {CASH_FLOW_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isInflow = cat.inflow > 0;
            const amount = isInflow ? cat.inflow : cat.outflow;
            const maxAmount = Math.max(...CASH_FLOW_CATEGORIES.map((c) => Math.max(c.inflow, c.outflow)));
            const pct = (amount / maxAmount) * 100;

            return (
              <div key={cat.category} className="flex items-center gap-3">
                <span className="text-[10px] text-white/50 w-28 shrink-0 truncate">
                  {cat.category}
                </span>
                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ ...STIFF_SPRING, delay: 0.35 + idx * 0.04 }}
                    className={`h-full rounded-full ${
                      isInflow ? "bg-emerald-400/60" : "bg-red-400/40"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-mono w-20 text-right shrink-0 ${
                    isInflow ? "text-emerald-400/80" : "text-red-400/60"
                  }`}
                >
                  {isInflow ? "+" : "-"} {fmtBDT(amount)}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ SCHEDULED PROJECTIONS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.38 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Calendar size={16} className="text-white/40" />
          </div>
          <h3 className="font-serif text-white text-sm">Scheduled & Recurring</h3>
          <span className="text-[9px] text-white/25 ml-auto">Next 30 Days</span>
        </div>

        {/* Scheduled Summary */}
        <div className="flex gap-3 mb-4 mt-3">
          <div className="flex-1 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
            <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-400/60 mb-1">Expected In</p>
            <p className="text-sm font-mono text-emerald-400">BDT {fmtBDT(scheduled.totalScheduledInflow)}</p>
          </div>
          <div className="flex-1 p-3 rounded-2xl bg-red-500/5 border border-red-500/15">
            <p className="text-[9px] uppercase tracking-[0.2em] text-red-400/60 mb-1">Expected Out</p>
            <p className="text-sm font-mono text-red-400">BDT {fmtBDT(scheduled.totalScheduledOutflow)}</p>
          </div>
        </div>

        {/* Scheduled Items */}
        <div className="space-y-2">
          {scheduled.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === "inflow"
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                {item.type === "inflow" ? (
                  <ArrowUpRight size={12} className="text-emerald-400" />
                ) : (
                  <ArrowDownRight size={12} className="text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/70 truncate">{item.label}</p>
                <p className="text-[9px] text-white/30">
                  {new Date(item.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`text-[11px] font-mono shrink-0 ${
                  item.type === "inflow" ? "text-emerald-400/80" : "text-red-400/60"
                }`}
              >
                {item.type === "inflow" ? "+" : "-"} {fmtBDT(item.amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Net Scheduled */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-bold">
            Net Scheduled
          </span>
          <span
            className={`text-sm font-mono ${
              scheduled.netScheduled >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {scheduled.netScheduled >= 0 ? "+" : "-"} BDT {fmtBDT(scheduled.netScheduled)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════════

function KPICard({
  label,
  value,
  icon,
  color,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "emerald" | "red" | "cyan" | "amber";
  delay: number;
}) {
  const colorMap = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
    red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  };
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 600, damping: 45, delay }}
      className={`rounded-[20px] ${c.bg} ${c.border} border p-4 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={c.text}>{icon}</div>
        <span className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-bold">
          {label}
        </span>
      </div>
      <p className={`text-[13px] font-mono ${c.text}`}>{value}</p>
    </motion.div>
  );
}