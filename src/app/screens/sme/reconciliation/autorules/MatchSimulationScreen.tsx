/**
 * MATCH EXECUTION SCREEN — Phase B3
 * Deterministic first-match-wins rule execution against inflows
 * // GOVERNANCE_ENFORCEMENT — Rule execution is read-only, no governance gate needed
 * Audit events emitted per match for traceability
 */

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  INFLOWS,
  EXPECTED_RECEIVABLES,
  AUTO_RECON_RULES,
  executeRules,
  getEnabledRules,
  formatBDT,
  getMatchTypeLabel,
  getMatchTypeBadge,
  type MatchResult,
  type IncomingInflow,
  type ExpectedReceivable,
} from "../../../../data/autoReconRules";

interface MatchSimulationScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function MatchSimulationScreen({
  onBack,
}: MatchSimulationScreenProps) {
  const [hasRun, setHasRun] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  const enabledRules = getEnabledRules();

  // Run execution
  const executionResult = useMemo(() => {
    if (!hasRun) return null;
    return executeRules(
      [...INFLOWS],
      [...EXPECTED_RECEIVABLES],
      [...AUTO_RECON_RULES]
    );
  }, [hasRun]);

  const matchedResults = executionResult?.results.filter((r) => r.matched) || [];
  const unmatchedResults =
    executionResult?.results.filter((r) => !r.matched) || [];

  const handleRun = () => {
    setHasRun(true);
    setExpandedResult(null);
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
        <div>
          <h1 className="text-3xl font-serif text-white">Run Rules</h1>
          <p className="text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] font-bold mt-1">
            First-Match-Wins Execution
          </p>
        </div>
      </div>

      {/* Pre-Run: Show what will be matched */}
      {!hasRun && (
        <>
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-3">
              Execution Summary
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-lg text-white font-serif">
                  {INFLOWS.length}
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">
                  Inflows
                </p>
              </div>
              <div>
                <p className="text-lg text-white font-serif">
                  {EXPECTED_RECEIVABLES.length}
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">
                  Receivables
                </p>
              </div>
              <div>
                <p className="text-lg text-cyan-400 font-serif">
                  {enabledRules.length}
                </p>
                <p className="text-[9px] text-cyan-400/60 uppercase tracking-wider">
                  Rules
                </p>
              </div>
            </div>
          </motion.div>

          {/* Priority Order Preview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.05 }}
            className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-3">
              Rule Priority Order
            </p>
            <div className="space-y-2">
              {enabledRules.map((rule, i) => {
                const badge = getMatchTypeBadge(rule.matchType);
                return (
                  <div
                    key={rule.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <span className="text-[9px] text-white/30 font-mono font-bold w-5">
                      P{rule.priority}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${badge.bg} ${badge.text}`}
                    >
                      {getMatchTypeLabel(rule.matchType)}
                    </span>
                    <p className="text-[11px] text-white/70 flex-1 truncate">
                      {rule.name}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-white/20 mt-3">
              Rules are tried in priority order. First match wins — no
              double-matching.
            </p>
          </motion.div>

          {/* Run Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRun}
            className="w-full p-4 rounded-[28px] bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 hover:bg-cyan-500/20 transition-all"
          >
            <Zap size={16} className="text-cyan-400" />
            <span className="text-sm text-cyan-300 font-semibold">
              Execute Rule Engine
            </span>
          </motion.button>
        </>
      )}

      {/* Post-Run: Results */}
      {hasRun && executionResult && (
        <>
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="grid grid-cols-2 gap-3 mb-5"
          >
            <div className="p-4 rounded-[28px] bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
              <CheckCircle2
                size={16}
                className="text-emerald-400 mb-2"
              />
              <p className="text-2xl text-white font-serif">
                {matchedResults.length}
              </p>
              <p className="text-[9px] text-emerald-400/60 uppercase tracking-wider">
                Matched
              </p>
            </div>
            <div className="p-4 rounded-[28px] bg-amber-500/5 border border-amber-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
              <AlertTriangle
                size={16}
                className="text-amber-400 mb-2"
              />
              <p className="text-2xl text-white font-serif">
                {unmatchedResults.length}
              </p>
              <p className="text-[9px] text-amber-400/60 uppercase tracking-wider">
                Exceptions
              </p>
            </div>
          </motion.div>

          {/* Matched Results */}
          {matchedResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.05 }}
              className="mb-5"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 font-bold mb-3">
                Matched Items
              </p>
              <div className="space-y-3">
                {matchedResults.map((result, i) => {
                  const inflow = INFLOWS.find(
                    (inf) => inf.id === result.inflowId
                  );
                  const receivable = EXPECTED_RECEIVABLES.find(
                    (rec) => rec.id === result.receivableId
                  );
                  const rule = AUTO_RECON_RULES.find(
                    (r) => r.id === result.ruleId
                  );
                  const isExpanded = expandedResult === result.inflowId;
                  const typeBadge = rule
                    ? getMatchTypeBadge(rule.matchType)
                    : null;

                  return (
                    <motion.div
                      key={result.inflowId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...SPRING, delay: 0.03 * i }}
                      className="rounded-[28px] bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden"
                    >
                      {/* Match Header */}
                      <button
                        onClick={() =>
                          setExpandedResult(isExpanded ? null : result.inflowId)
                        }
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[11px] text-white/80 truncate">
                                {inflow?.senderName}
                              </p>
                              <ArrowRight
                                size={10}
                                className="text-emerald-400 shrink-0"
                              />
                              <p className="text-[11px] text-white/80 truncate">
                                {receivable?.clientName}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-white/50">
                                {formatBDT(inflow?.amount || 0)}
                              </span>
                              <span className="text-[10px] text-white/30">
                                ↔
                              </span>
                              <span className="text-[10px] text-white/50">
                                {formatBDT(receivable?.expectedAmount || 0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {typeBadge && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${typeBadge.bg} ${typeBadge.text}`}
                              >
                                {rule
                                  ? getMatchTypeLabel(rule.matchType)
                                  : ""}
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp
                                size={12}
                                className="text-white/40"
                              />
                            ) : (
                              <ChevronDown
                                size={12}
                                className="text-white/40"
                              />
                            )}
                          </div>
                        </div>

                        <p className="text-[9px] text-emerald-400/60">
                          Rule: {result.ruleName} (P
                          {rule?.priority})
                        </p>
                      </button>

                      {/* Why This Matched — Expanded */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4">
                              <p className="text-[9px] uppercase tracking-[0.2em] text-cyan-400/60 font-bold mb-2">
                                Why This Matched
                              </p>
                              <div className="space-y-1.5">
                                {result.explanations.map((exp, idx) => (
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

                              {/* Reference details */}
                              <div className="mt-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                                <div className="flex items-center justify-between text-[9px] text-white/30">
                                  <span>
                                    Inflow ref: {inflow?.reference || "none"}
                                  </span>
                                  <span>
                                    Invoice: {receivable?.invoiceRef}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Unmatched / Exceptions */}
          {unmatchedResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.1 }}
              className="mb-5"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/80 font-bold mb-3">
                Exceptions — Routed to Manual Queue
              </p>
              <div className="space-y-3">
                {unmatchedResults.map((result, i) => {
                  const inflow = INFLOWS.find(
                    (inf) => inf.id === result.inflowId
                  );

                  return (
                    <motion.div
                      key={result.inflowId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...SPRING, delay: 0.03 * i }}
                      className="p-4 rounded-[28px] bg-amber-500/5 border border-amber-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="min-w-0">
                          <p className="text-[11px] text-white/80 truncate">
                            {inflow?.senderName}
                          </p>
                          <p className="text-[10px] text-white/40 font-mono">
                            {inflow?.reference || "no reference"}
                          </p>
                        </div>
                        <span className="text-[11px] text-amber-400 font-semibold shrink-0">
                          {formatBDT(inflow?.amount || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <AlertTriangle
                          size={10}
                          className="text-amber-400 shrink-0"
                        />
                        <p className="text-[10px] text-amber-300/80">
                          {result.explanations[0]?.detail}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Re-run Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.15 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setHasRun(false);
              setExpandedResult(null);
            }}
            className="w-full p-3.5 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-[45px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
          >
            <span className="text-[11px] text-white/50">Reset and Re-run</span>
          </motion.button>
        </>
      )}
    </div>
  );
}