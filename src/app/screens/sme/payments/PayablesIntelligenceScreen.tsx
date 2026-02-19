import {
  PAYABLES,
  calculateTotalPayables,
  calculateDueToday,
  calculateSafelyDelayable,
  calculateOptimalPayDate,
  calculateAllOptimalPayDates,
  calculateBulkPaymentPlan,
  calculateEarlyPaymentHabit,
  formatCurrency,
  formatDate,
  daysBetween,
  type VendorPayable,
  type OptimalPaymentRecommendation,
} from "../../../data/payablesData";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface PayablesIntelligenceScreenProps {
  onBack: () => void;
}

export default function PayablesIntelligenceScreen({ onBack }: PayablesIntelligenceScreenProps) {
  const [selectedPayableIds, setSelectedPayableIds] = useState<Set<string>>(new Set());
  const [selectedForAnalysis, setSelectedForAnalysis] = useState<string | null>(null);

  // Calculate metrics
  const totalUpcoming = calculateTotalPayables(PAYABLES, 30);
  const dueToday = calculateDueToday(PAYABLES);
  const safelyDelayable = calculateSafelyDelayable(PAYABLES);
  const earlyPaymentHabit = calculateEarlyPaymentHabit(PAYABLES);

  // Get all recommendations
  const allRecommendations = calculateAllOptimalPayDates(PAYABLES);

  // Filter by recommendation type for display
  const delayRecommendations = allRecommendations.filter((r) => r.recommendation === "Delay");
  const payEarlyRecommendations = allRecommendations.filter((r) => r.recommendation === "Pay Early");
  const payNowRecommendations = allRecommendations.filter((r) => r.recommendation === "Pay Now");

  // Calculate bulk plan if any selected
  const bulkPlan = selectedPayableIds.size > 0
    ? calculateBulkPaymentPlan(Array.from(selectedPayableIds), PAYABLES)
    : null;

  // Log activity on mount
  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_ap_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_AP_DASHBOARD" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Viewed Payables Intelligence Dashboard",
      entityType: "ap_dashboard",
      metadata: {
        totalUpcoming,
        dueToday,
        safelyDelayable,
        optimizationOpportunities: delayRecommendations.length,
      },
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  const toggleSelection = (payableId: string) => {
    const newSelected = new Set(selectedPayableIds);
    if (newSelected.has(payableId)) {
      newSelected.delete(payableId);
    } else {
      newSelected.add(payableId);
    }
    setSelectedPayableIds(newSelected);

    // Log selection
    const logEntry: ActivityLogEntry = {
      id: `log_ap_select_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "AP_BULK_SELECT" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: `Selected ${newSelected.size} payables for bulk planning`,
      entityType: "bulk_payment_plan",
      metadata: {
        selectedCount: newSelected.size,
        payableIds: Array.from(newSelected),
      },
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case "Delay":
        return {
          bg: "bg-emerald-500/20",
          text: "text-emerald-400",
          border: "border-emerald-500/30",
          icon: TrendingDown,
        };
      case "Pay Early":
        return {
          bg: "bg-blue-500/20",
          text: "text-blue-400",
          border: "border-blue-500/30",
          icon: CheckCircle,
        };
      case "Pay Now":
        return {
          bg: "bg-amber-500/20",
          text: "text-amber-400",
          border: "border-amber-500/30",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-400",
          border: "border-gray-500/30",
          icon: MinusCircle,
        };
    }
  };

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
          <h1 className="text-3xl font-serif tracking-tight">Payables Intelligence</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            AP Optimization Engine
          </p>
        </div>
      </header>

      {/* System Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.6 }}
        className="mb-6 p-4 rounded-[24px] bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
      >
        <p className="text-xs text-white/80">
          <span className="font-bold text-cyan-400">Optimization Engine:</span> All optimal pay dates compute from illustrative data. Delay recommendations prioritize cash retention without vendor risk. This protects CASA by default.
        </p>
      </motion.div>

      {/* EARLY PAYMENT HABIT - REALITY CHECK */}
      {earlyPaymentHabit.vendorsAffectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.03 }}
          className="mb-6 p-6 rounded-[28px] bg-gradient-to-br from-red-500/15 to-orange-500/15 border-2 border-red-500/30 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-red-400" />
            <div>
              <h2 className="text-lg font-serif tracking-tight text-white">Early Payment Habit Detected</h2>
              <p className="text-[10px] uppercase tracking-[0.25em] text-red-400/80 font-bold mt-0.5">
                Cash Leakage Alert
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-2xl font-bold text-white mb-2">
              You are paying vendors <span className="text-red-400">{earlyPaymentHabit.avgEarlyPayDays} days earlier</span> than required.
            </p>
            <p className="text-sm text-white/70">
              This habit is costing you <span className="font-semibold text-red-400">{formatCurrency(earlyPaymentHabit.floatLost)}</span> in lost float opportunity.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-[16px] bg-white/10 border border-white/20">
              <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Avg Early Pay</p>
              <p className="text-xl font-bold text-red-400">{earlyPaymentHabit.avgEarlyPayDays} days</p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/10 border border-white/20">
              <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Float Lost</p>
              <p className="text-xl font-bold text-red-400">{formatCurrency(earlyPaymentHabit.floatLost)}</p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/10 border border-white/20">
              <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Vendors Affected</p>
              <p className="text-xl font-bold text-red-400">{earlyPaymentHabit.vendorsAffectedPct}%</p>
              <p className="text-[9px] text-white/50 mt-0.5">({earlyPaymentHabit.vendorsAffectedCount} of {earlyPaymentHabit.totalPayables})</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-[16px] bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-xs text-white/80">
              <span className="font-bold text-emerald-400">Solution:</span> Following optimal dates below retains {formatCurrency(earlyPaymentHabit.floatLost)} in working capital without vendor penalties.
            </p>
          </div>
        </motion.div>
      )}

      {/* Payables Overview - Top Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Payables Overview
        </p>

        <div className="grid grid-cols-3 gap-3">
          {/* Total Upcoming */}
          <div className="p-4 rounded-[24px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl">
            <p className="text-[10px] text-white/60 mb-1 uppercase tracking-wide">Upcoming (30d)</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalUpcoming)}</p>
          </div>

          {/* Due Today */}
          <div className="p-4 rounded-[24px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-xl">
            <p className="text-[10px] text-white/60 mb-1 uppercase tracking-wide">Due Today</p>
            <p className="text-xl font-bold text-amber-400">{formatCurrency(dueToday)}</p>
          </div>

          {/* Safely Delayable */}
          <div className="p-4 rounded-[24px] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-xl">
            <p className="text-[10px] text-white/60 mb-1 uppercase tracking-wide">Delayable</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(safelyDelayable)}</p>
          </div>
        </div>
      </motion.div>

      {/* Optimal Pay Date Engine - Delay Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={16} className="text-emerald-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Delay Opportunities ({delayRecommendations.length})
          </p>
        </div>

        {delayRecommendations.length === 0 ? (
          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-[45px] text-center">
            <p className="text-sm text-white/60">No safe delay opportunities at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {delayRecommendations.slice(0, 4).map((rec, i) => {
              const payable = PAYABLES.find((p) => p.payableId === rec.payableId);
              const isSelected = selectedPayableIds.has(rec.payableId);
              const badge = getRecommendationBadge(rec.recommendation);
              const Icon = badge.icon;

              return (
                <motion.div
                  key={rec.payableId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: 0.15 + i * 0.03 }}
                  className={`p-4 rounded-[24px] backdrop-blur-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500/40"
                      : "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/30"
                  }`}
                  onClick={() => toggleSelection(rec.payableId)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{rec.vendorName}</p>
                        {payable?.requiresApproval && (
                          <span className="px-2 py-0.5 text-[8px] font-bold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            APPROVAL REQ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60">
                        {formatCurrency(rec.invoiceAmount)} • Due {formatDate(rec.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-[9px] font-bold rounded-full ${badge.bg} ${badge.text} border ${badge.border}`}>
                        <Icon size={10} className="inline mr-1" />
                        {rec.recommendation}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Optimal Date</p>
                      <p className="text-xs font-semibold text-white">{formatDate(rec.optimalPayDate)}</p>
                      <p className="text-[10px] text-emerald-400">+{rec.daysDelayed}d</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Float Benefit</p>
                      <p className="text-xs font-semibold text-emerald-400">৳{rec.floatBenefit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Net Benefit</p>
                      <p className="text-xs font-semibold text-cyan-400">৳{rec.netBenefit.toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedForAnalysis === rec.payableId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={SPRING}
                      className="mt-3 pt-3 border-t border-white/10"
                    >
                      <p className="text-[10px] uppercase tracking-wide text-white/50 mb-2">Rationale</p>
                      <p className="text-xs text-white/70 leading-relaxed">{rec.rationale}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Early Payment Opportunities */}
      {payEarlyRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-blue-400" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
              Early Payment Discounts ({payEarlyRecommendations.length})
            </p>
          </div>

          <div className="space-y-3">
            {payEarlyRecommendations.map((rec, i) => {
              const payable = PAYABLES.find((p) => p.payableId === rec.payableId);
              const isSelected = selectedPayableIds.has(rec.payableId);
              const badge = getRecommendationBadge(rec.recommendation);
              const Icon = badge.icon;

              return (
                <motion.div
                  key={rec.payableId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: 0.2 + i * 0.03 }}
                  className={`p-4 rounded-[24px] backdrop-blur-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-500/20 border-blue-500/40"
                      : "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:border-blue-500/30"
                  }`}
                  onClick={() => toggleSelection(rec.payableId)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{rec.vendorName}</p>
                        <span className="px-2 py-0.5 text-[8px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {payable?.earlyPaymentDiscountPct}% OFF
                        </span>
                      </div>
                      <p className="text-xs text-white/60">
                        {formatCurrency(rec.invoiceAmount)} • Due {formatDate(rec.dueDate)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-bold rounded-full ${badge.bg} ${badge.text} border ${badge.border}`}>
                      <Icon size={10} className="inline mr-1" />
                      {rec.recommendation}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Pay By</p>
                      <p className="text-xs font-semibold text-white">{formatDate(rec.optimalPayDate)}</p>
                      <p className="text-[10px] text-blue-400">{Math.abs(rec.daysDelayed)}d early</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Discount Gain</p>
                      <p className="text-xs font-semibold text-blue-400">৳{rec.floatBenefit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Net Benefit</p>
                      <p className="text-xs font-semibold text-cyan-400">৳{rec.netBenefit.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Pay Now (Strict Deadlines) */}
      {payNowRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
              Pay on Due Date ({payNowRecommendations.length})
            </p>
          </div>

          <div className="space-y-3">
            {payNowRecommendations.slice(0, 3).map((rec, i) => {
              const payable = PAYABLES.find((p) => p.payableId === rec.payableId);
              const badge = getRecommendationBadge(rec.recommendation);
              const Icon = badge.icon;

              return (
                <motion.div
                  key={rec.payableId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: 0.25 + i * 0.03 }}
                  className="p-4 rounded-[24px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{rec.vendorName}</p>
                        {payable?.criticality === "High" && (
                          <span className="px-2 py-0.5 text-[8px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60">
                        {formatCurrency(rec.invoiceAmount)} • Due {formatDate(rec.dueDate)}
                      </p>
                      <p className="text-[10px] text-amber-400 mt-1">
                        High penalty: {payable?.latePaymentPenaltyPct}%/month
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-bold rounded-full ${badge.bg} ${badge.text} border ${badge.border}`}>
                      <Icon size={10} className="inline mr-1" />
                      {rec.recommendation}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Bulk Pay Planner */}
      {bulkPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.25 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-purple-400" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
              Bulk Payment Plan ({bulkPlan.payableCount} selected)
            </p>
          </div>

          <div className="p-5 rounded-[24px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(bulkPlan.totalAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Optimal Pay Date</p>
                <p className="text-2xl font-bold text-white">{formatDate(bulkPlan.consolidatedOptimalDate)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Float Benefit</p>
                <p className="text-sm font-semibold text-emerald-400">৳{bulkPlan.totalFloatBenefit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Penalty Risk</p>
                <p className="text-sm font-semibold text-amber-400">৳{bulkPlan.totalPenaltyRisk.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Net Retained</p>
                <p className="text-sm font-semibold text-cyan-400">৳{bulkPlan.netCashRetained.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-[16px] bg-white/5 border border-white/10">
              <p className="text-xs text-white/70 text-center">
                <DollarSign size={14} className="inline mr-1 text-emerald-400" />
                Consolidating {bulkPlan.payableCount} payments retains ৳{bulkPlan.netCashRetained.toLocaleString()} in working capital
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.3 }}
        className="mt-6 p-4 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl"
      >
        <p className="text-xs text-white/80 text-center">
          <span className="font-bold text-emerald-400">CASA Protection:</span> All recommendations optimize cash retention without breaking vendor trust. Delay is strategic, not risky.
        </p>
      </motion.div>
    </div>
  );
}