/**
 * RULE DETAIL SCREEN — Phase B3
 * View rule conditions, match statistics, governed disable/edit
 * // GOVERNANCE_ENFORCEMENT — Edit/disable actions hit enforceServiceRequestGate
 */

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Clock,
  Hash,
  FileText,
  ChevronDown,
  ChevronUp,
  Power,
  PowerOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AUTO_RECON_RULES,
  getRuleById,
  getMatchTypeLabel,
  getMatchTypeBadge,
  getStatusConfig,
  formatBDT,
  INFLOWS,
  EXPECTED_RECEIVABLES,
  executeRules,
  type AutoReconRule,
  type MatchResult,
} from "../../../../data/autoReconRules";
import {
  enforceServiceRequestGate,
  type EnforcementResult,
} from "../../../../utils/governanceEngine";
import GovernanceBar from "../../../../components/GovernanceBar";
import { getCurrentUser } from "../../../../mock/users";

interface RuleDetailScreenProps {
  ruleId: string;
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function RuleDetailScreen({
  ruleId,
  onBack,
}: RuleDetailScreenProps) {
  const [governanceResult, setGovernanceResult] =
    useState<EnforcementResult | null>(null);
  const [showExplainability, setShowExplainability] = useState(false);
  const [localRule, setLocalRule] = useState<AutoReconRule | undefined>(() =>
    getRuleById(ruleId)
  );

  // Run this rule in isolation against inflows for explainability
  const ruleMatches = useMemo(() => {
    if (!localRule || localRule.status === "DISABLED") return [];
    const { results } = executeRules(
      [...INFLOWS],
      [...EXPECTED_RECEIVABLES],
      [localRule]
    );
    return results.filter((r) => r.matched);
  }, [localRule]);

  if (!localRule) {
    return (
      <div className="px-6 pt-8 flex items-center justify-center text-white/40 text-sm">
        Rule not found
      </div>
    );
  }

  const typeBadge = getMatchTypeBadge(localRule.matchType);
  const statusCfg = getStatusConfig(localRule.status);

  // // GOVERNANCE_ENFORCEMENT — Toggle rule status
  const handleToggleStatus = () => {
    const newStatus = localRule.status === "ENABLED" ? "DISABLED" : "ENABLED";
    const actionLabel =
      newStatus === "DISABLED"
        ? `Disable auto-recon rule "${localRule.name}"`
        : `Re-enable auto-recon rule "${localRule.name}"`;

    // // GOVERNANCE_ENFORCEMENT — enforceServiceRequestGate for rule status change
    const result = enforceServiceRequestGate({
      serviceType: "OTHER",
      actionLabel,
    });
    setGovernanceResult(result);

    if (result.outcome === "BLOCKED") {
      // // GOVERNANCE_ENFORCEMENT — Hard stop
      return;
    }

    const user = getCurrentUser();
    // Update local state
    setLocalRule((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            modifiedBy: user.id,
            modifiedByName: user.name,
            modifiedAt: new Date().toISOString(),
            auditIds: [...prev.auditIds, result.auditId],
          }
        : prev
    );

    // Update global store
    const idx = AUTO_RECON_RULES.findIndex((r) => r.id === localRule.id);
    if (idx !== -1) {
      AUTO_RECON_RULES[idx] = {
        ...AUTO_RECON_RULES[idx],
        status: newStatus,
        modifiedBy: user.id,
        modifiedByName: user.name,
        modifiedAt: new Date().toISOString(),
        auditIds: [...AUTO_RECON_RULES[idx].auditIds, result.auditId],
      };
    }
  };

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
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-serif text-white truncate">
            {localRule.name}
          </h1>
          <p className="text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] font-bold mt-1">
            Rule Detail
          </p>
        </div>
      </div>

      {/* Status + Type Badges */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[9px] text-white/30 font-mono font-bold">
          P{localRule.priority}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold ${typeBadge.bg} ${typeBadge.text} border ${typeBadge.border}`}
        >
          {getMatchTypeLabel(localRule.matchType)}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-3">
          Description
        </p>
        <p className="text-[12px] text-white/80 leading-relaxed">
          {localRule.description}
        </p>
      </motion.div>

      {/* Conditions Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Match Conditions
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50">Amount Match</span>
            <span className="text-[11px] text-white font-semibold">
              {localRule.conditions.amountMatch === "EXACT"
                ? "Exact"
                : `±${localRule.conditions.amountTolerancePct}% tolerance`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50">Date Window</span>
            <span className="text-[11px] text-white font-semibold">
              {localRule.conditions.dateWindowDays} days
            </span>
          </div>
          {localRule.conditions.referencePattern && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/50">
                Reference Pattern
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">
                {localRule.conditions.referencePattern}*
              </span>
            </div>
          )}
          {localRule.conditions.virtualAccountId && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/50">
                Virtual Account
              </span>
              <span className="text-[11px] text-white font-mono">
                {localRule.conditions.virtualAccountId}
              </span>
            </div>
          )}
          {localRule.conditions.clientId && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/50">Client ID</span>
              <span className="text-[11px] text-white font-mono">
                {localRule.conditions.clientId}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Match Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        <div className="p-3 rounded-[20px] bg-emerald-500/5 border border-emerald-500/20 text-center">
          <CheckCircle2 size={14} className="text-emerald-400 mx-auto mb-1" />
          <p className="text-lg text-white">{localRule.matchStats.appliedCount}</p>
          <p className="text-[9px] text-emerald-400/60 uppercase tracking-wider">
            Matched
          </p>
        </div>
        <div className="p-3 rounded-[20px] bg-red-500/5 border border-red-500/20 text-center">
          <XCircle size={14} className="text-red-400 mx-auto mb-1" />
          <p className="text-lg text-white">{localRule.matchStats.failedCount}</p>
          <p className="text-[9px] text-red-400/60 uppercase tracking-wider">
            Failed
          </p>
        </div>
        <div className="p-3 rounded-[20px] bg-white/5 border border-white/10 text-center">
          <Clock size={14} className="text-white/40 mx-auto mb-1" />
          <p className="text-[11px] text-white/60 mt-1">
            {localRule.matchStats.lastRunAt
              ? new Date(localRule.matchStats.lastRunAt).toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "short" }
                )
              : "Never"}
          </p>
          <p className="text-[9px] text-white/30 uppercase tracking-wider">
            Last Run
          </p>
        </div>
      </motion.div>

      {/* Governance Bar */}
      {governanceResult && (
        <div className="mb-4">
          <GovernanceBar
            result={governanceResult}
            onDismiss={() => setGovernanceResult(null)}
          />
        </div>
      )}

      {/* Toggle Status Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleToggleStatus}
        disabled={!!governanceResult}
        className={`w-full mb-5 p-4 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
          localRule.status === "ENABLED"
            ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
            : "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
        }`}
      >
        {localRule.status === "ENABLED" ? (
          <>
            <PowerOff size={16} className="text-amber-400" />
            <span className="text-sm text-amber-300 font-semibold">
              Disable Rule
            </span>
          </>
        ) : (
          <>
            <Power size={16} className="text-emerald-400" />
            <span className="text-sm text-emerald-300 font-semibold">
              Re-enable Rule
            </span>
          </>
        )}
      </motion.button>

      {/* Explainability Panel: "Why This Matched" */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden mb-5"
      >
        <button
          onClick={() => setShowExplainability(!showExplainability)}
          className="w-full p-4 flex items-center justify-between"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Why This Matched ({ruleMatches.length} inflows)
          </p>
          {showExplainability ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </button>

        <AnimatePresence>
          {showExplainability && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {localRule.status === "DISABLED" && (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <p className="text-[10px] text-amber-300/80">
                      Rule is disabled — matching suspended
                    </p>
                  </div>
                )}

                {ruleMatches.length === 0 && localRule.status === "ENABLED" && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-[10px] text-white/40">
                      No current inflows match this rule
                    </p>
                  </div>
                )}

                {ruleMatches.map((match) => {
                  const inflow = INFLOWS.find((inf) => inf.id === match.inflowId);
                  const receivable = EXPECTED_RECEIVABLES.find(
                    (rec) => rec.id === match.receivableId
                  );

                  return (
                    <div
                      key={match.inflowId}
                      className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                    >
                      {/* Match Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white/80 truncate">
                            {inflow?.senderName} → {receivable?.clientName}
                          </p>
                          <p className="text-[9px] text-white/30 font-mono">
                            {formatBDT(inflow?.amount || 0)} ↔{" "}
                            {formatBDT(receivable?.expectedAmount || 0)}
                          </p>
                        </div>
                        <CheckCircle2
                          size={14}
                          className="text-emerald-400 shrink-0"
                        />
                      </div>

                      {/* Condition Breakdown */}
                      <div className="space-y-1.5">
                        {match.explanations.map((exp, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2"
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                                exp.passed
                                  ? "bg-emerald-400"
                                  : "bg-red-400"
                              }`}
                            />
                            <div>
                              <p className="text-[9px] text-white/40 uppercase tracking-wider">
                                {exp.condition}
                              </p>
                              <p className="text-[10px] text-white/60">
                                {exp.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Audit Trail */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.25 }}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-3">
          Lifecycle
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50">Created by</span>
            <span className="text-[11px] text-white/80">
              {localRule.createdByName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50">Created at</span>
            <span className="text-[11px] text-white/80">
              {new Date(localRule.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {localRule.modifiedByName && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">Modified by</span>
                <span className="text-[11px] text-white/80">
                  {localRule.modifiedByName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">Modified at</span>
                <span className="text-[11px] text-white/80">
                  {localRule.modifiedAt
                    ? new Date(localRule.modifiedAt).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )
                    : "—"}
                </span>
              </div>
            </>
          )}
          <div className="pt-2 border-t border-white/5">
            <p className="text-[9px] text-white/20 font-mono">
              Audit IDs: {localRule.auditIds.join(", ")}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}