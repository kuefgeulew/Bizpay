import { useState } from "react";
import { ArrowLeft, ShieldAlert, ChevronDown, ChevronUp, AlertOctagon, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ROLES, type RoleType } from "../../../data/userManagement";
import {
  ADMIN_TRANSACTION_LIMITS,
  formatBDTCompact,
  formatBDTFull,
  type TransactionLimit,
  type TransactionCategory,
} from "../../../data/adminGovernance";

interface AdminTransactionLimitsScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function AdminTransactionLimitsScreen({ onBack }: AdminTransactionLimitsScreenProps) {
  const [expandedRole, setExpandedRole] = useState<RoleType | null>(null);

  const rolesWithLimits = ROLES.filter(r => {
    const limits = ADMIN_TRANSACTION_LIMITS.filter(l => l.role === r.id);
    return limits.length > 0;
  });

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Transaction Limits</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Per-Role Caps & Escalation Flags
          </p>
        </div>
      </header>

      {/* Purpose Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        <p className="text-sm text-white/80 leading-relaxed">
          Cross-role transaction limits govern per-transaction, daily, and monthly caps. Breaches trigger auto-block or escalation.
        </p>
      </motion.div>

      {/* Global Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Roles</p>
          <p className="text-xl text-white">{rolesWithLimits.length}</p>
        </div>
        <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Limit Rules</p>
          <p className="text-xl text-white">{ADMIN_TRANSACTION_LIMITS.length}</p>
        </div>
        <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Auto-Block</p>
          <p className="text-xl text-red-400">{ADMIN_TRANSACTION_LIMITS.filter(l => l.autoBlock).length}</p>
        </div>
      </motion.div>

      {/* Per-Role Sections */}
      <div className="space-y-3">
        {rolesWithLimits.map((role, i) => {
          const limits = ADMIN_TRANSACTION_LIMITS.filter(l => l.role === role.id);
          const isExpanded = expandedRole === role.id;

          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.1 + i * 0.04 }}
            >
              <button
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                className="w-full p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] text-left transition-all hover:border-white/20 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{role.icon}</span>
                    <div>
                      <h3 className="text-sm text-white/90 font-medium">{role.name}</h3>
                      <p className="text-[10px] text-white/40">{limits.length} transaction categories</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {limits.some(l => l.autoBlock) && (
                      <AlertOctagon size={14} className="text-red-400" />
                    )}
                    {limits.some(l => l.escalateOnBreach) && (
                      <Zap size={14} className="text-amber-400" />
                    )}
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-white/40" />
                    ) : (
                      <ChevronDown size={16} className="text-white/40" />
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-2">
                      {limits.map(limit => (
                        <LimitCard key={limit.id} limit={limit} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.3 }}
        className="mt-6 p-4 rounded-[24px] bg-white/[0.03] border border-white/[0.06]"
      >
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Legend</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <AlertOctagon size={12} className="text-red-400" />
            <span className="text-[10px] text-white/50">Auto-Block on Breach</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-amber-400" />
            <span className="text-[10px] text-white/50">Escalation on Breach</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* -------- Sub-Components -------- */

function LimitCard({ limit }: { limit: TransactionLimit }) {
  return (
    <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.06] space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs text-white/80 font-medium">{limit.categoryLabel}</h4>
        <div className="flex items-center gap-1.5">
          {limit.autoBlock && (
            <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-red-500/15 text-red-400">
              BLOCK
            </span>
          )}
          {limit.escalateOnBreach && (
            <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-amber-500/15 text-amber-400">
              ESCALATE
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <LimitCell
          label="Per Txn"
          value={limit.perTransaction > 0 ? formatBDTCompact(limit.perTransaction) : "N/A"}
          fullValue={limit.perTransaction > 0 ? formatBDTFull(limit.perTransaction) : "No initiation rights"}
        />
        <LimitCell
          label="Daily"
          value={limit.daily > 0 ? formatBDTCompact(limit.daily) : "N/A"}
          fullValue={limit.daily > 0 ? formatBDTFull(limit.daily) : "No initiation rights"}
        />
        <LimitCell
          label="Monthly"
          value={limit.monthly > 0 ? formatBDTCompact(limit.monthly) : "N/A"}
          fullValue={limit.monthly > 0 ? formatBDTFull(limit.monthly) : "No initiation rights"}
        />
      </div>
    </div>
  );
}

function LimitCell({ label, value, fullValue }: { label: string; value: string; fullValue: string }) {
  return (
    <div className="text-center" title={fullValue}>
      <p className="text-[9px] text-white/30 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm ${value === "N/A" ? "text-white/20" : "text-white"}`}>{value}</p>
    </div>
  );
}