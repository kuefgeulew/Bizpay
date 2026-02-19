/**
 * EXCEPTION ROUTING PREVIEW — Phase B3
 * Shows how unmatched inflows are routed to the Exception queue
 * Read-only view — no governance gate needed
 */

import { useMemo } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  Users,
  FileSearch,
} from "lucide-react";
import { motion } from "motion/react";
import {
  INFLOWS,
  EXPECTED_RECEIVABLES,
  AUTO_RECON_RULES,
  executeRules,
  formatBDT,
  type IncomingInflow,
} from "../../../../data/autoReconRules";

interface ExceptionRoutingPreviewProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

// Exception routing policy
const EXCEPTION_ROUTING: {
  condition: string;
  team: string;
  slaHours: number;
  impact: string;
}[] = [
  {
    condition: "No reference on inflow",
    team: "Reconciliation Team",
    slaHours: 24,
    impact: "Cannot auto-match — requires manual reference lookup",
  },
  {
    condition: "Amount variance exceeds all rule tolerances",
    team: "Senior Accountant",
    slaHours: 48,
    impact: "Possible partial payment or pricing discrepancy",
  },
  {
    condition: "No matching receivable found",
    team: "Collections Team",
    slaHours: 72,
    impact: "Unidentified credit — may require client confirmation",
  },
];

export default function ExceptionRoutingPreview({
  onBack,
}: ExceptionRoutingPreviewProps) {
  // Run rules to find actual unmatched inflows
  const { unmatchedInflows } = useMemo(
    () =>
      executeRules(
        [...INFLOWS],
        [...EXPECTED_RECEIVABLES],
        [...AUTO_RECON_RULES]
      ),
    []
  );

  // Also show inflows with no reference as high-risk
  const noRefInflows = INFLOWS.filter((inf) => !inf.reference);

  return (
    <div className="px-6 pt-8 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={16} className="text-white/70" />
        </button>
        <div>
          <h1 className="text-3xl font-serif text-white">Exception Routing</h1>
          <p className="text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] font-bold mt-1">
            Unmatched Item Handling
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="p-5 rounded-[28px] bg-amber-500/5 border border-amber-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              When no enabled rule matches an inflow, it is routed to the
              Exception queue with full context. Exceptions are assigned to the
              appropriate team based on the failure reason, with SLA timers for
              resolution.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current Unmatched Items */}
      {unmatchedInflows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          className="mb-5"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/80 font-bold mb-3">
            Current Exceptions ({unmatchedInflows.length})
          </p>
          <div className="space-y-3">
            {unmatchedInflows.map((inflow, i) => (
              <motion.div
                key={inflow.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.03 * i }}
                className="p-4 rounded-[28px] bg-white/[0.03] border border-amber-500/15 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-white/80">
                    {inflow.senderName}
                  </p>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    {formatBDT(inflow.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/40">
                  <span>{inflow.date}</span>
                  <span>Ref: {inflow.reference || "none"}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <p className="text-[10px] text-amber-300/80">
                    {!inflow.reference
                      ? "No reference — cannot auto-match"
                      : "No rule matched — requires manual review"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {unmatchedInflows.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          className="p-5 rounded-[28px] bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5 text-center"
        >
          <p className="text-[11px] text-emerald-400/80">
            All inflows matched — no exceptions at this time
          </p>
        </motion.div>
      )}

      {/* Routing Policy */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-3">
          Exception Routing Policy
        </p>
        <div className="space-y-3">
          {EXCEPTION_ROUTING.map((policy, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.12 + 0.04 * i }}
              className="p-4 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
            >
              <p className="text-[11px] text-white/80 font-semibold mb-2">
                {policy.condition}
              </p>
              <p className="text-[10px] text-white/50 mb-3">{policy.impact}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Users size={11} className="text-cyan-400" />
                  <span className="text-[10px] text-white/60">
                    {policy.team}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-amber-400" />
                  <span className="text-[10px] text-amber-400/80">
                    SLA: {policy.slaHours}h
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Control Principles */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.25 }}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-3">
          Control Principles
        </p>
        <div className="space-y-2.5">
          {[
            "Every exception is logged, assigned, and tracked",
            "SLA timers escalate unresolved items",
            "Disabled rules immediately stop matching — unmatched items route here",
            "No silent failures — full audit trail on every routing decision",
          ].map((principle, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="text-[11px] text-white/60">{principle}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}