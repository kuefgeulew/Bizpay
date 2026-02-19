import { useState } from "react";
import { ArrowLeft, Shield, TrendingUp, AlertCircle, Info } from "lucide-react";
import { motion } from "motion/react";
import { ROLE_LIMITS } from "@/app/mock/transactionLimits";
import { getCurrentUser } from "@/app/mock";

interface LimitConfigurationScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function LimitConfigurationScreen({ onBack }: LimitConfigurationScreenProps) {
  const currentUser = getCurrentUser();
  const [selectedRole, setSelectedRole] = useState(currentUser.role);

  const selectedLimit = ROLE_LIMITS.find(l => l.roleId === selectedRole);

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
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
        <h1 className="text-xl font-black tracking-tight">Role-Based Limits</h1>
        <div className="w-11" />
      </div>

      {/* System Note */}
      <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-200 leading-relaxed">
            <span className="font-bold">System Note:</span> Role limits configuration interface. Actual enforcement requires backend integration & compliance approval.
          </p>
        </div>
      </div>

      {/* Role Selector */}
      <div className="mb-6">
        <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-3">Select Role</p>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_LIMITS.filter(l => l.roleId !== "viewer").map((limit) => (
            <motion.button
              key={limit.roleId}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedRole(limit.roleId)}
              className={`p-3 rounded-2xl border transition-all ${
                selectedRole === limit.roleId
                  ? "bg-[#EDBA12]/20 border-[#EDBA12]"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <p className="text-xs font-black text-white">{limit.roleName}</p>
              {selectedRole === limit.roleId && (
                <p className="text-[8px] text-[#EDBA12] uppercase tracking-wider font-bold mt-1">
                  Your Role
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Limit Details */}
      {selectedLimit && (
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="space-y-4"
        >
          {/* Single Transaction Limit */}
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">
                    Single Transaction
                  </p>
                  <p className="text-2xl font-black text-white">
                    BDT {formatAmount(selectedLimit.singleTransactionLimit)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-[11px] text-white/70">
              <div className="flex justify-between">
                <span>Requires Approval Above</span>
                <span className="font-bold text-orange-400">
                  BDT {formatAmount(selectedLimit.requiresApprovalAbove)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Auto-Escalate Above</span>
                <span className="font-bold text-red-400">
                  BDT {formatAmount(selectedLimit.autoEscalateAbove)}
                </span>
              </div>
            </div>
          </div>

          {/* Daily & Monthly Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold mb-2">
                Daily Total
              </p>
              <p className="text-xl font-black text-white">
                BDT {formatAmount(selectedLimit.dailyTotalLimit)}
              </p>
              <p className="text-[9px] text-emerald-400 mt-2">Resets at 00:00</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold mb-2">
                Monthly Total
              </p>
              <p className="text-xl font-black text-white">
                BDT {formatAmount(selectedLimit.monthlyTotalLimit)}
              </p>
              <p className="text-[9px] text-purple-400 mt-2">Feb 2024</p>
            </div>
          </div>

          {/* Allowed Channels */}
          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-white/60" />
              <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">
                Allowed Channels
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedLimit.allowedChannels.map((channel, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-[#EDBA12]/20 text-[10px] font-bold text-[#EDBA12] uppercase tracking-wider"
                >
                  {channel}
                </span>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div className="p-5 rounded-[24px] bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">
                Restrictions
              </p>
            </div>
            <ul className="space-y-2">
              {selectedLimit.restrictions.map((restriction, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-400 text-[10px] mt-0.5">•</span>
                  <span className="text-[11px] text-white/80 leading-relaxed">
                    {restriction}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...SPRING }}
        className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20"
      >
        <p className="text-[10px] text-white/80 leading-relaxed">
          <span className="font-bold text-blue-400">Note:</span> These limits are visual representations only. 
          Real limit enforcement requires integration with core banking systems, regulatory approval, 
          and maker-checker workflows.
        </p>
      </motion.div>
    </div>
  );
}