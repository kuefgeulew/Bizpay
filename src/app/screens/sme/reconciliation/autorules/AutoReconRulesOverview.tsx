/**
 * AUTO-RECONCILIATION RULES OVERVIEW — Phase B3
 * Governed rule list with KPIs and governance-gated actions
 * // GOVERNANCE_ENFORCEMENT — Rule lifecycle actions hit enforceServiceRequestGate
 */

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Zap,
  FileSearch,
} from "lucide-react";
import { motion } from "motion/react";
import {
  AUTO_RECON_RULES,
  getEnabledRules,
  getDisabledRules,
  getTotalApplied,
  getTotalFailed,
  getMatchTypeLabel,
  getMatchTypeBadge,
  getStatusConfig,
  type AutoReconRule,
} from "../../../../data/autoReconRules";
import {
  enforceServiceRequestGate,
  type EnforcementResult,
} from "../../../../utils/governanceEngine";
import GovernanceBar from "../../../../components/GovernanceBar";
import type { AutoReconView } from "./AutoReconRulesHub";

interface AutoReconRulesOverviewProps {
  onBack: () => void;
  onNavigate: (view: AutoReconView, ruleId?: string) => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function AutoReconRulesOverview({
  onBack,
  onNavigate,
}: AutoReconRulesOverviewProps) {
  const [governanceResult, setGovernanceResult] =
    useState<EnforcementResult | null>(null);
  const [filter, setFilter] = useState<"all" | "ENABLED" | "DISABLED">("all");

  const rules = useMemo(() => {
    if (filter === "all") return [...AUTO_RECON_RULES].sort((a, b) => a.priority - b.priority);
    return AUTO_RECON_RULES.filter((r) => r.status === filter).sort(
      (a, b) => a.priority - b.priority
    );
  }, [filter]);

  const enabledCount = getEnabledRules().length;
  const disabledCount = getDisabledRules().length;
  const totalApplied = getTotalApplied();
  const totalFailed = getTotalFailed();
  const matchRate =
    totalApplied + totalFailed > 0
      ? Math.round((totalApplied / (totalApplied + totalFailed)) * 100)
      : 0;

  // // GOVERNANCE_ENFORCEMENT — Gate for creating new rule
  const handleNewRule = () => {
    const result = enforceServiceRequestGate({
      serviceType: "OTHER",
      actionLabel: "Create auto-reconciliation rule",
    });
    setGovernanceResult(result);

    if (result.outcome === "ALLOWED") {
      setTimeout(() => onNavigate("create"), 600);
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
        <div>
          <h1 className="text-3xl font-serif text-white">Auto-Reconciliation</h1>
          <p className="text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] font-bold mt-1">
            Deterministic Rule Engine
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-2">
            Rules Active
          </p>
          <p className="text-2xl text-white font-serif">{enabledCount}</p>
          <p className="text-[10px] text-white/30 mt-1">
            {disabledCount} disabled
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-emerald-400/80 font-bold mb-2">
            Match Rate
          </p>
          <p className="text-2xl text-white font-serif">{matchRate}%</p>
          <p className="text-[10px] text-white/30 mt-1">
            {totalApplied} matched / {totalFailed} failed
          </p>
        </motion.div>
      </div>

      {/* Governance Bar */}
      {governanceResult && (
        <div className="mb-4">
          <GovernanceBar
            result={governanceResult}
            onDismiss={() => setGovernanceResult(null)}
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {(["all", "ENABLED", "DISABLED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold border transition-all ${
              filter === f
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {f === "all"
              ? "All"
              : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* New Rule Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleNewRule}
        className="w-full mb-5 p-4 rounded-[28px] border border-dashed border-cyan-500/30 bg-cyan-500/5 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center gap-3 hover:bg-cyan-500/10 transition-all"
      >
        <div className="p-2 rounded-full bg-cyan-500/10">
          <Plus size={18} className="text-cyan-400" />
        </div>
        <div className="text-left">
          <p className="text-sm text-white font-semibold">New Matching Rule</p>
          <p className="text-[10px] text-white/50">
            Author a deterministic reconciliation rule
          </p>
        </div>
      </motion.button>

      {/* Rule Cards */}
      <div className="space-y-3 mb-6">
        {rules.map((rule, i) => {
          const typeBadge = getMatchTypeBadge(rule.matchType);
          const statusCfg = getStatusConfig(rule.status);

          return (
            <motion.button
              key={rule.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.05 * i }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("rule-detail", rule.id)}
              className={`w-full p-4 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-left transition-all hover:bg-white/5 ${
                rule.status === "ENABLED"
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-white/5 bg-white/[0.01] opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[9px] text-white/30 font-mono font-bold shrink-0">
                    P{rule.priority}
                  </span>
                  <p className="text-sm text-white font-semibold truncate">
                    {rule.name}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold shrink-0 ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
                >
                  {statusCfg.label}
                </span>
              </div>

              <p className="text-[10px] text-white/50 mb-3 line-clamp-2">
                {rule.description}
              </p>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-[0.15em] font-bold ${typeBadge.bg} ${typeBadge.text} border ${typeBadge.border}`}
                >
                  {getMatchTypeLabel(rule.matchType)}
                </span>
                <span className="text-[10px] text-white/40">
                  Applied:{" "}
                  <span className="text-white/70">{rule.matchStats.appliedCount}</span>
                </span>
                {rule.matchStats.failedCount > 0 && (
                  <span className="text-[10px] text-red-400/60">
                    Failed: {rule.matchStats.failedCount}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}

        {rules.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">
            No rules match this filter
          </div>
        )}
      </div>

      {/* Action Buttons — Run Rules / Exception Preview */}
      <div className="space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate("simulation")}
          className="w-full p-4 rounded-[28px] bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center gap-3 hover:bg-cyan-500/10 transition-all"
        >
          <div className="p-2 rounded-full bg-cyan-500/10">
            <Zap size={16} className="text-cyan-400" />
          </div>
          <div className="text-left">
            <p className="text-sm text-white font-semibold">
              Run Rules Against Inflows
            </p>
            <p className="text-[10px] text-white/50">
              Deterministic first-match-wins execution
            </p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate("exceptions")}
          className="w-full p-4 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center gap-3 hover:bg-white/5 transition-all"
        >
          <div className="p-2 rounded-full bg-amber-500/10">
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div className="text-left">
            <p className="text-sm text-white font-semibold">Exception Routing</p>
            <p className="text-[10px] text-white/50">
              Unmatched items and routing preview
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}