import { ArrowLeft, TrendingDown, Calendar, Clock, Shield, Activity } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  CASH_SNAPSHOT,
  calculateCashRunway,
  getRunwayRiskLevel,
  calculateMinimumSafeBalance,
  generate30DayForecast,
  formatCurrency,
  formatDate,
  getCurrentSeasonality,
  getNextSeasonality,
  type CashSnapshot,
  type ForecastWindow,
} from "../../../data/cashIntelligenceData";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface CashIntelligenceScreenProps {
  onBack: () => void;
}

export default function CashIntelligenceScreen({ onBack }: CashIntelligenceScreenProps) {
  const [snapshot] = useState<CashSnapshot>(CASH_SNAPSHOT);
  const [forecast, setForecast] = useState<ForecastWindow[]>([]);
  const [runway, setRunway] = useState<number>(0);
  const [minSafeBalance, setMinSafeBalance] = useState<number>(0);

  // Calculate metrics on mount
  useEffect(() => {
    const calculatedRunway = calculateCashRunway(snapshot);
    const calculatedMinSafe = calculateMinimumSafeBalance(snapshot);
    const calculatedForecast = generate30DayForecast(snapshot);

    setRunway(calculatedRunway);
    setMinSafeBalance(calculatedMinSafe);
    setForecast(calculatedForecast);

    // Log activity
    const logEntry: ActivityLogEntry = {
      id: `log_cash_intel_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_CASH_INTELLIGENCE" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Viewed Cash Intelligence Dashboard",
      entityType: "cash_intelligence",
      metadata: {
        currentBalance: snapshot.currentBalance,
        cashRunwayDays: calculatedRunway,
        minSafeBalance: calculatedMinSafe,
      },
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, [snapshot]);

  const runwayRiskLevel = getRunwayRiskLevel(runway);
  const currentSeasonality = getCurrentSeasonality();
  const nextSeasonality = getNextSeasonality();

  // Risk colors
  const getRunwayColor = () => {
    if (runwayRiskLevel === "safe") return { bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/20", text: "text-emerald-400" };
    if (runwayRiskLevel === "warning") return { bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/20", text: "text-amber-400" };
    return { bg: "from-red-500/10 to-pink-500/10", border: "border-red-500/20", text: "text-red-400" };
  };

  const runwayColor = getRunwayColor();

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
          <h1 className="text-3xl font-serif tracking-tight">Cash Intelligence</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Know how long your cash will last
          </p>
        </div>
      </header>

      {/* PRIMARY METRIC: Cash Runway */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-6"
      >
        <div className={`p-6 rounded-[28px] bg-gradient-to-br ${runwayColor.bg} border ${runwayColor.border} backdrop-blur-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock size={24} className={runwayColor.text} />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/60 mb-1">Cash Runway</p>
                <p className={`text-6xl font-bold ${runwayColor.text}`}>{runway} days</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/70 mb-4">Based on recent inflows and outflows</p>

          <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Current Balance</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(snapshot.currentBalance)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Avg Daily Inflow</p>
              <p className="text-sm font-semibold text-emerald-400">{formatCurrency(snapshot.avgDailyInflow)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Avg Daily Outflow</p>
              <p className="text-sm font-semibold text-red-400">{formatCurrency(snapshot.avgDailyOutflow)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Minimum Safe Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-purple-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Minimum Safe Balance
          </p>
        </div>

        <div className="p-5 rounded-[28px] bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wide text-white/60 mb-2">Minimum Safe Balance</p>
            <p className="text-3xl font-bold text-purple-400">{formatCurrency(minSafeBalance)}</p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-wide text-white/50 mb-3">Current Balance Comparison</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    snapshot.currentBalance > minSafeBalance * 1.5
                      ? 'bg-emerald-400'
                      : snapshot.currentBalance > minSafeBalance
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(100, (snapshot.currentBalance / (minSafeBalance * 2)) * 100)}%` }}
                ></div>
              </div>
              <p className={`text-xs font-semibold ${
                snapshot.currentBalance > minSafeBalance * 1.5
                  ? 'text-emerald-400'
                  : snapshot.currentBalance > minSafeBalance
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}>
                {snapshot.currentBalance > minSafeBalance * 1.5
                  ? 'Above safe zone'
                  : snapshot.currentBalance > minSafeBalance
                  ? 'Near risk zone'
                  : 'Below safe zone'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 30-Day Net Cash View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-cyan-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Next 30-Day Net Cash View
          </p>
        </div>

        <div className="p-5 rounded-[28px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-xl">
          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3 rounded-[16px] bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Expected Inflows</p>
              <p className="text-lg font-bold text-emerald-400">
                {formatCurrency(forecast.reduce((sum, day) => sum + day.cumulativeInflow, 0))}
              </p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Expected Outflows</p>
              <p className="text-lg font-bold text-red-400">
                {formatCurrency(forecast.reduce((sum, day) => sum + day.cumulativeOutflow, 0))}
              </p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Net Position</p>
              <p className={`text-lg font-bold ${forecast[29]?.projectedBalance > snapshot.currentBalance ? "text-emerald-400" : "text-red-400"}`}>
                {forecast[29] && formatCurrency(forecast[29].projectedBalance - snapshot.currentBalance)}
              </p>
            </div>
          </div>

          {/* Weekly Snapshots */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-white/50 mb-3">Net Position Per Week</p>
            {[0, 7, 14, 21, 28].map((dayIndex) => {
              const day = forecast[dayIndex];
              if (!day) return null;

              const progressPercent = Math.min(100, (day.projectedBalance / snapshot.currentBalance) * 100);

              return (
                <div
                  key={day.date}
                  className="p-3 rounded-[16px] border backdrop-blur-xl bg-white/5 border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-white">{formatDate(day.date)}</p>
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(day.projectedBalance)}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all bg-cyan-400"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Seasonality Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-indigo-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Seasonality Insight
          </p>
        </div>

        <div className="space-y-3">
          {/* Current Month */}
          <div className="p-4 rounded-[24px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-xl">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2">
              {currentSeasonality.month}
            </p>
            <p className="text-xs text-white/70 leading-relaxed">{currentSeasonality.insight}</p>
          </div>

          {/* Next Month */}
          <div className="p-4 rounded-[24px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2">
              {nextSeasonality.month}
            </p>
            <p className="text-xs text-white/70 leading-relaxed">{nextSeasonality.insight}</p>
          </div>
        </div>
      </motion.div>

      {/* Interpretation Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.25 }}
        className="mt-6 p-4 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl"
      >
        <p className="text-xs text-white/70 text-center leading-relaxed">
          These insights help plan spending so balances remain stable. No transactions are initiated from this screen.
        </p>
      </motion.div>
    </div>
  );
}