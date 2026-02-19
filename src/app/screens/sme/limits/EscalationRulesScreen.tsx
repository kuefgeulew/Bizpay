import { ArrowLeft, TrendingUp, Users, AlertTriangle, Clock, Info } from "lucide-react";
import { motion } from "motion/react";
import { ESCALATION_RULES } from "@/app/mock/transactionLimits";

interface EscalationRulesScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function EscalationRulesScreen({ onBack }: EscalationRulesScreenProps) {
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
        <h1 className="text-xl font-black tracking-tight">Escalation Rules</h1>
        <div className="w-11" />
      </div>

      {/* System Note */}
      <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-200 leading-relaxed">
            <span className="font-bold">System Note:</span> Visual workflow matrix only. Real escalation requires integrated approval engine & notifications.
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-6 p-5 rounded-[24px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white mb-2">Auto-Escalation Matrix</h2>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Transactions are automatically routed to higher approval tiers based on amount thresholds 
              and role limits. All routing is configured within this interface.
            </p>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {ESCALATION_RULES.map((rule, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, ...SPRING }}
            className="p-5 rounded-[24px] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/8 transition-all"
          >
            {/* Rule Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === 0 ? "bg-emerald-500/20" :
                    index === 1 ? "bg-orange-500/20" :
                    index === 2 ? "bg-red-500/20" :
                    index === 3 ? "bg-purple-500/20" :
                    "bg-blue-500/20"
                  }`}>
                    {index === 0 && <Users className="w-4 h-4 text-emerald-400" />}
                    {index === 1 && <TrendingUp className="w-4 h-4 text-orange-400" />}
                    {index === 2 && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {index === 3 && <Clock className="w-4 h-4 text-purple-400" />}
                    {index === 4 && <AlertTriangle className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    Rule {index + 1}
                  </p>
                </div>
                <p className="text-sm font-bold text-white/90 mb-1">{rule.condition}</p>
              </div>
            </div>

            {/* Rule Details */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EDBA12] mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-1">
                    Action
                  </p>
                  <p className="text-[11px] text-white/80 font-medium">{rule.action}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EDBA12] mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-1">
                    Timeframe
                  </p>
                  <p className="text-[11px] text-white/80 font-medium">{rule.timeframe}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EDBA12] mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-1">
                    Override Authority
                  </p>
                  <p className="text-[11px] text-white/80 font-medium">{rule.bypass}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Workflow Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, ...SPRING }}
        className="mt-6 p-5 rounded-[24px] bg-blue-500/10 border border-blue-500/20"
      >
        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
          Typical Escalation Flow
        </h3>
        <div className="space-y-3">
          {[
            { step: "1", label: "Maker Initiates", desc: "Transaction created within role limit" },
            { step: "2", label: "Auto-Check Runs", desc: "System validates against limits & rules" },
            { step: "3", label: "Route Decision", desc: "Transaction approved OR escalated" },
            { step: "4", label: "Notification Sent", desc: "Relevant approvers notified via SMS/Email" },
            { step: "5", label: "Approval/Reject", desc: "Higher authority reviews & decides" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-blue-400">{item.step}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-white">{item.label}</p>
                <p className="text-[10px] text-white/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, ...SPRING }}
        className="mt-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20"
      >
        <p className="text-[10px] text-white/80 leading-relaxed">
          <span className="font-bold text-orange-400">System Note:</span> Real escalation systems 
          integrate with approval engines, notification services, audit logs, and compliance frameworks. 
          This is a visual representation for stakeholder review only.
        </p>
      </motion.div>
    </div>
  );
}