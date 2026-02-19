/**
 * GOVERNANCE ENFORCEMENT BAR
 * // GOVERNANCE_ENFORCEMENT — Inline system message for enforcement outcomes
 * No modals. No redesign. System messages only.
 */

import { ShieldAlert, Clock, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { EnforcementResult, EnforcementOutcome } from "../utils/governanceEngine";

interface GovernanceBarProps {
  result: EnforcementResult | null;
  onDismiss?: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 500, damping: 35 };

export default function GovernanceBar({ result, onDismiss }: GovernanceBarProps) {
  if (!result) return null;

  const config: Record<
    EnforcementOutcome,
    {
      icon: typeof ShieldAlert;
      bg: string;
      border: string;
      text: string;
      iconColor: string;
      prefix: string;
    }
  > = {
    BLOCKED: {
      icon: ShieldAlert,
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-300",
      iconColor: "text-red-400",
      prefix: "Blocked",
    },
    APPROVAL_REQUIRED: {
      icon: Clock,
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-300",
      iconColor: "text-amber-400",
      prefix: "Routed to Approval Queue",
    },
    ALLOWED: {
      icon: ShieldCheck,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-300",
      iconColor: "text-emerald-400",
      prefix: "Authorized",
    },
  };

  const c = config[result.outcome];
  const Icon = c.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={SPRING}
        className={`${c.bg} ${c.border} border rounded-2xl p-4 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]`}
      >
        <div className="flex items-start gap-3">
          <Icon size={16} className={`${c.iconColor} shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${c.iconColor} mb-1`}>
              {c.prefix}
            </p>
            <p className={`text-[11px] ${c.text} leading-relaxed`}>{result.reason}</p>
            {result.ruleTriggered && (
              <p className="text-[9px] text-white/30 mt-1.5 font-mono tracking-wider">
                Rule: {result.ruleTriggered} | {result.details.actorRole.toUpperCase()} | {result.auditId.slice(-8)}
              </p>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white/10 rounded-lg transition-all shrink-0"
            >
              <X size={12} className="text-white/30" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
