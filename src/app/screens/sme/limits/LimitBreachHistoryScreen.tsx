import { ArrowLeft, AlertTriangle, CheckCircle, Clock, XCircle, Info } from "lucide-react";
import { motion } from "motion/react";
import { LIMIT_BREACHES } from "@/app/mock/transactionLimits";

interface LimitBreachHistoryScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function LimitBreachHistoryScreen({ onBack }: LimitBreachHistoryScreenProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    return `${(amount / 1000).toFixed(0)}K`;
  };

  const getActionBadge = (action: string) => {
    if (action.includes("Escalated")) {
      return { bg: "bg-orange-500/20", text: "text-orange-400", icon: <AlertTriangle className="w-3 h-3" /> };
    }
    if (action.includes("Blocked")) {
      return { bg: "bg-red-500/20", text: "text-red-400", icon: <XCircle className="w-3 h-3" /> };
    }
    if (action.includes("Dual")) {
      return { bg: "bg-purple-500/20", text: "text-purple-400", icon: <Clock className="w-3 h-3" /> };
    }
    return { bg: "bg-blue-500/20", text: "text-blue-400", icon: <CheckCircle className="w-3 h-3" /> };
  };

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black tracking-tight">Limit Breach History</h1>
        <div className="w-11" />
      </div>

      {/* System Note */}
      <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-200 leading-relaxed">
            <span className="font-bold">System Note:</span> Sample breach events shown. Real tracking requires audit logs & compliance monitoring.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...SPRING }}
          className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 text-center"
        >
          <p className="text-2xl font-black text-white">4</p>
          <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold mt-1">
            Total Events
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ...SPRING }}
          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center"
        >
          <p className="text-2xl font-black text-white">3</p>
          <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold mt-1">
            Resolved
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...SPRING }}
          className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center"
        >
          <p className="text-2xl font-black text-white">1</p>
          <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold mt-1">
            Pending
          </p>
        </motion.div>
      </div>

      {/* Breach Events */}
      <div className="space-y-4">
        {LIMIT_BREACHES.map((breach, index) => {
          const actionStyle = getActionBadge(breach.action);
          return (
            <motion.div
              key={breach.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1, ...SPRING }}
              className="p-5 rounded-[24px] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/8 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-1">
                    {breach.date}
                  </p>
                  <p className="text-sm font-black text-white">{breach.user}</p>
                  <p className="text-[10px] text-[#EDBA12] uppercase tracking-wider font-bold mt-1">
                    {breach.role}
                  </p>
                </div>
                {breach.resolved ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-red-400" />
                  </div>
                )}
              </div>

              {/* Breach Details */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold mb-1">
                    Transaction Amount
                  </p>
                  <p className="text-lg font-black text-white">
                    BDT {formatAmount(breach.transactionAmount)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold mb-1">
                    Limit Value
                  </p>
                  <p className="text-lg font-black text-red-400">
                    BDT {formatAmount(breach.limitValue)}
                  </p>
                </div>
              </div>

              {/* Limit Type */}
              <div className="mb-3">
                <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold mb-2">
                  Limit Type Breached
                </p>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                  {breach.limitType}
                </span>
              </div>

              {/* Action Taken */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold mb-2">
                  Action Taken
                </p>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${actionStyle.bg} flex items-center justify-center`}>
                    {actionStyle.icon}
                  </div>
                  <p className={`text-[11px] font-bold ${actionStyle.text}`}>{breach.action}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold">
                  Event ID: {breach.id}
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    breach.resolved
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {breach.resolved ? "✓ Resolved" : "⏳ Pending"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.8 }}
        className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20"
      >
        <p className="text-[10px] text-white/80 leading-relaxed">
          <span className="font-bold text-blue-400">Informational:</span> These are sample breach events 
          for illustrative purposes. Real systems maintain immutable audit trails with timestamp 
          verification, user authentication logs, and compliance reporting.
        </p>
      </motion.div>
    </div>
  );
}