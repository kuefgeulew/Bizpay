import { ArrowLeft, Shield, TrendingDown, ArrowDownRight, ArrowUpRight, RefreshCw, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { CREDIT_BACKSTOP, formatCurrency } from "../../../data/creditBackstop.mock";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";
import CreditBackstopAdvisory from "../../../components/CreditBackstopAdvisory";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface CreditBackstopScreenProps {
  onBack: () => void;
}

export default function CreditBackstopScreen({ onBack }: CreditBackstopScreenProps) {
  const [data] = useState(CREDIT_BACKSTOP);
  const [advisoryDismissed, setAdvisoryDismissed] = useState(false);

  // Pending payment scenario that breaches the floor
  const pendingPayment = 6200000; // ৳62L — would breach the ৳32L floor
  const projectedBalance = data.currentCASABalance - pendingPayment; // ৳87.5L - ৳62L = ৳25.5L
  const breachAmount = data.safeBalanceFloor - projectedBalance; // ৳32L - ৳25.5L = ৳6.5L
  const bufferUsedAfter = data.odBufferUsed + breachAmount;
  const bufferRemainingAfter = data.odBufferTotal - bufferUsedAfter;

  // Buffer usage percentage (current)
  const usagePercent = Math.round((data.odBufferUsed / data.odBufferTotal) * 100);
  const projectedUsagePercent = Math.round((bufferUsedAfter / data.odBufferTotal) * 100);

  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_credit_backstop_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_CREDIT_BACKSTOP" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Viewed Credit Backstop — Liquidity Buffer Protection",
      entityType: "credit_backstop",
      metadata: {
        casaBalance: data.currentCASABalance,
        protectedFloor: data.safeBalanceFloor,
        odAvailable: data.odBufferAvailable,
      },
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Credit Backstop</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Liquidity Buffer Protection
          </p>
        </div>
      </header>

      {/* ── Section 1: Account Position ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Account Position
        </p>

        <div className="p-6 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          {/* Current Balance */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/50 mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(data.currentCASABalance)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingDown size={18} className="text-emerald-400 rotate-180" />
            </div>
          </div>

          {/* Visual Balance Bar */}
          <div className="mb-5">
            <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
              {/* Safe floor marker */}
              <div
                className="absolute top-0 bottom-0 w-px bg-amber-400/60 z-10"
                style={{ left: `${Math.min((data.safeBalanceFloor / data.currentCASABalance) * 100, 100)}%` }}
              />
              {/* Balance fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ ...SPRING, delay: 0.1 }}
                className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/40 rounded-full"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-white/40">৳0</span>
              <span className="text-[9px] text-amber-400/70 font-semibold">▲ Safe Floor</span>
              <span className="text-[9px] text-white/40">{formatCurrency(data.currentCASABalance)}</span>
            </div>
          </div>

          {/* Minimum Safe Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-[20px] bg-amber-500/[0.06] border border-amber-500/15">
              <p className="text-[10px] uppercase tracking-wide text-white/50 mb-1">Minimum Safe Balance</p>
              <p className="text-xl font-bold text-amber-400">{formatCurrency(data.safeBalanceFloor)}</p>
              <p className="text-[9px] text-white/35 mt-1">Threshold per account policy</p>
            </div>
            <div className="p-4 rounded-[20px] bg-cyan-500/[0.06] border border-cyan-500/15">
              <p className="text-[10px] uppercase tracking-wide text-white/50 mb-1">Available Buffer</p>
              <p className="text-xl font-bold text-cyan-400">{formatCurrency(data.odBufferAvailable)}</p>
              <p className="text-[9px] text-white/35 mt-1">OD limit remaining</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Contextual Advisory Panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.08 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Contextual Advisory
        </p>

        {!advisoryDismissed ? (
          <CreditBackstopAdvisory
            visible={true}
            paymentAmount={pendingPayment}
            balanceAfterPayment={projectedBalance}
            safeFloor={data.safeBalanceFloor}
            odBufferAvailable={data.odBufferAvailable}
            onContinueWithBuffer={() => setAdvisoryDismissed(true)}
            onAdjustTiming={onBack}
          />
        ) : (
          <div className="p-5 rounded-[28px] bg-emerald-500/[0.06] border border-emerald-500/20 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-white">Buffer engaged</p>
                <p className="text-xs text-white/50 mt-0.5">OD buffer absorbs {formatCurrency(breachAmount)} — balance stays at floor</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Section 3: OD Usage Preview ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.14 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          OD Usage Preview
        </p>

        <div className="p-6 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          {/* Current Usage */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/60">Current Usage</p>
              <p className="text-xs text-white/40">{usagePercent}% of {formatCurrency(data.odBufferTotal)}</p>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ ...SPRING, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-cyan-500/70 to-cyan-400/50 rounded-full"
              />
            </div>
          </div>

          {/* Usage Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <ArrowDownRight size={14} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Amount Absorbed</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Currently held in buffer</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-cyan-400">{formatCurrency(data.odBufferUsed)}</p>
            </div>

            <div className="border-t border-white/5" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Shield size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Remaining Buffer</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Available for future protection</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-emerald-400">{formatCurrency(data.odBufferAvailable)}</p>
            </div>

            <div className="border-t border-white/5" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <TrendingDown size={14} className="text-white/40" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Total Buffer Limit</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Maximum OD capacity</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-white/60">{formatCurrency(data.odBufferTotal)}</p>
            </div>
          </div>

          {/* Projected Usage (if advisory accepted) */}
          {advisoryDismissed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={SPRING}
              className="mt-5 pt-5 border-t border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-amber-400/80 font-semibold">Projected Usage (After Payment)</p>
                <p className="text-xs text-white/40">{projectedUsagePercent}%</p>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: `${usagePercent}%` }}
                  animate={{ width: `${projectedUsagePercent}%` }}
                  transition={{ ...SPRING, delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-amber-500/70 to-amber-400/50 rounded-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] text-white/40 uppercase tracking-wide">New Absorbed</p>
                  <p className="text-sm font-semibold text-amber-400">{formatCurrency(bufferUsedAfter)}</p>
                </div>
                <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] text-white/40 uppercase tracking-wide">New Remaining</p>
                  <p className="text-sm font-semibold text-emerald-400">{formatCurrency(bufferRemainingAfter)}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ─ Section 4: Auto-Repay Indicator ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="mb-6"
      >
        <div className="p-5 rounded-[28px] bg-gradient-to-br from-emerald-500/[0.06] to-cyan-500/[0.04] border border-emerald-500/15 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-serif text-white tracking-tight mb-1">Auto-Repay</p>
              <p className="text-sm text-white/70 leading-relaxed">
                OD usage is automatically cleared on incoming funds.
              </p>
              <p className="text-[10px] text-white/40 mt-2">
                No manual action required — buffer restores as receivables settle.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 5: Recent Buffer Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.26 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Recent Buffer Activity
        </p>

        <div className="space-y-3">
          {data.lastTwoEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.3 + i * 0.04 }}
              className="p-4 rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  event.type === "buffer_restored"
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-amber-500/10 border border-amber-500/20"
                }`}>
                  {event.type === "buffer_restored" ? (
                    <ArrowUpRight size={15} className="text-emerald-400" />
                  ) : (
                    <ArrowDownRight size={15} className="text-amber-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/80">{event.description}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={10} className="text-white/30" />
                    <p className="text-[10px] text-white/40">{event.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-[8px] font-bold rounded-full uppercase tracking-wider ${
                  event.type === "buffer_restored"
                    ? "bg-emerald-500/15 text-emerald-400/80 border border-emerald-500/20"
                    : "bg-amber-500/15 text-amber-400/80 border border-amber-500/20"
                }`}>
                  {event.type === "buffer_restored" ? "Restored" : "Absorbed"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── CASA Impact Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.34 }}
        className="p-4 rounded-[24px] bg-emerald-500/[0.06] border border-emerald-500/15 backdrop-blur-xl"
      >
        <p className="text-xs text-white/70 text-center">
          <span className="font-semibold text-emerald-400">CASA Impact:</span>{" "}
          Credit Backstop protects operating cash by absorbing payment spikes through OD buffer, preserving your working capital baseline.
        </p>
      </motion.div>
    </div>
  );
}