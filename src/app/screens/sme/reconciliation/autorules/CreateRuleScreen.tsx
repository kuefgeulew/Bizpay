/**
 * CREATE RULE SCREEN — Phase B3
 * Governed rule authoring for auto-reconciliation
 * // GOVERNANCE_ENFORCEMENT — Creation gated by enforceServiceRequestGate
 */

import { useState } from "react";
import {
  ArrowLeft,
  Hash,
  CalendarClock,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";
import {
  AUTO_RECON_RULES,
  type AutoReconRule,
  type MatchType,
  type RuleConditions,
  getMatchTypeLabel,
  getMatchTypeBadge,
} from "../../../../data/autoReconRules";
import {
  enforceServiceRequestGate,
  type EnforcementResult,
} from "../../../../utils/governanceEngine";
import GovernanceBar from "../../../../components/GovernanceBar";
import { getCurrentUser } from "../../../../mock/users";

interface CreateRuleScreenProps {
  onBack: () => void;
  onCreated: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

const MATCH_TYPE_OPTIONS: { value: MatchType; label: string; desc: string }[] = [
  {
    value: "EXACT_AMOUNT",
    label: "Exact Amount",
    desc: "Amount must match exactly + reference",
  },
  {
    value: "REFERENCE_PATTERN",
    label: "Reference Pattern",
    desc: "Match by reference prefix pattern",
  },
  {
    value: "VIRTUAL_ACCOUNT",
    label: "Virtual Account",
    desc: "Match by VAM assignment",
  },
  {
    value: "CLIENT_ID",
    label: "Client ID",
    desc: "Match by known Client ID",
  },
  {
    value: "TOLERANCE_AMOUNT",
    label: "Tolerance",
    desc: "Amount within % tolerance + reference present",
  },
];

export default function CreateRuleScreen({
  onBack,
  onCreated,
}: CreateRuleScreenProps) {
  const [governanceResult, setGovernanceResult] =
    useState<EnforcementResult | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [matchType, setMatchType] = useState<MatchType>("EXACT_AMOUNT");
  const [amountMatch, setAmountMatch] = useState<"EXACT" | "TOLERANCE">("EXACT");
  const [tolerancePct, setTolerancePct] = useState("0");
  const [referencePattern, setReferencePattern] = useState("");
  const [virtualAccountId, setVirtualAccountId] = useState("");
  const [clientId, setClientId] = useState("");
  const [dateWindowDays, setDateWindowDays] = useState("7");

  // Priority = next available
  const nextPriority =
    Math.max(...AUTO_RECON_RULES.map((r) => r.priority), 0) + 1;

  const parsedTolerance = parseFloat(tolerancePct) || 0;
  const parsedDateWindow = parseInt(dateWindowDays) || 7;

  const isValid = name.trim() && description.trim() && parsedDateWindow > 0;

  // Sync amountMatch with matchType
  const handleMatchTypeChange = (mt: MatchType) => {
    setMatchType(mt);
    if (mt === "EXACT_AMOUNT") {
      setAmountMatch("EXACT");
      setTolerancePct("0");
    } else {
      setAmountMatch("TOLERANCE");
      if (parsedTolerance === 0) setTolerancePct("2");
    }
  };

  // // GOVERNANCE_ENFORCEMENT — Rule creation gate
  const handleCreate = () => {
    // // GOVERNANCE_ENFORCEMENT — enforceServiceRequestGate for rule creation
    const result = enforceServiceRequestGate({
      serviceType: "OTHER",
      actionLabel: `Create auto-recon rule "${name}"`,
    });
    setGovernanceResult(result);

    if (result.outcome === "BLOCKED") {
      // // GOVERNANCE_ENFORCEMENT — Hard stop, no rule created
      return;
    }

    const user = getCurrentUser();
    const conditions: RuleConditions = {
      amountMatch,
      amountTolerancePct: parsedTolerance,
      referencePattern,
      virtualAccountId,
      clientId,
      dateWindowDays: parsedDateWindow,
    };

    const newRule: AutoReconRule = {
      id: `ar_${Date.now()}`,
      name: name.trim(),
      matchType,
      description: description.trim(),
      conditions,
      priority: nextPriority,
      status: "ENABLED",
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
      matchStats: {
        appliedCount: 0,
        failedCount: 0,
      },
      auditIds: [result.auditId],
    };

    AUTO_RECON_RULES.push(newRule);

    setTimeout(() => onCreated(), 1200);
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
          <h1 className="text-3xl font-serif text-white">New Rule</h1>
          <p className="text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] font-bold mt-1">
            Author Matching Rule
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">
          Rule Definition
        </p>

        {/* Name */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Rule Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., VAM-010 Client Match"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors placeholder:text-white/20"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this rule matches and when"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors placeholder:text-white/20"
          />
        </div>

        {/* Match Type */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-2">
            Match Type
          </label>
          <div className="space-y-2">
            {MATCH_TYPE_OPTIONS.map((opt) => {
              const badge = getMatchTypeBadge(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => handleMatchTypeChange(opt.value)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    matchType === opt.value
                      ? `${badge.bg} ${badge.border}`
                      : "bg-white/[0.03] border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold ${
                        matchType === opt.value
                          ? badge.text
                          : "text-white/40"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50 uppercase tracking-wider">
              Priority
            </span>
            <span className="text-sm text-cyan-400 font-mono font-bold">
              P{nextPriority}
            </span>
          </div>
          <p className="text-[9px] text-white/20 mt-1">
            Auto-assigned as next in execution order
          </p>
        </div>
      </motion.div>

      {/* Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">
          Conditions
        </p>

        {/* Amount Tolerance (shown for non-EXACT types) */}
        {matchType !== "EXACT_AMOUNT" && (
          <div className="mb-4">
            <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
              Amount Tolerance (%)
            </label>
            <input
              type="number"
              value={tolerancePct}
              onChange={(e) => setTolerancePct(e.target.value)}
              min="0"
              max="50"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors"
            />
            <p className="text-[9px] text-white/20 mt-1">
              ±{parsedTolerance}% variance allowed
            </p>
          </div>
        )}

        {/* Reference Pattern */}
        {(matchType === "REFERENCE_PATTERN" ||
          matchType === "TOLERANCE_AMOUNT") && (
          <div className="mb-4">
            <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
              Reference Prefix
            </label>
            <input
              type="text"
              value={referencePattern}
              onChange={(e) => setReferencePattern(e.target.value)}
              placeholder="e.g., BP/ or INV-"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors placeholder:text-white/20"
            />
          </div>
        )}

        {/* Virtual Account ID */}
        {matchType === "VIRTUAL_ACCOUNT" && (
          <div className="mb-4">
            <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
              Virtual Account ID (optional — empty matches any)
            </label>
            <input
              type="text"
              value={virtualAccountId}
              onChange={(e) => setVirtualAccountId(e.target.value)}
              placeholder="e.g., VAM-001"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors placeholder:text-white/20"
            />
          </div>
        )}

        {/* Client ID */}
        {matchType === "CLIENT_ID" && (
          <div className="mb-4">
            <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
              Client ID (optional — empty matches any)
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g., CLT-001"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors placeholder:text-white/20"
            />
          </div>
        )}

        {/* Date Window */}
        <div className="mb-2">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Date Window (days)
          </label>
          <input
            type="number"
            value={dateWindowDays}
            onChange={(e) => setDateWindowDays(e.target.value)}
            min="1"
            max="60"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors"
          />
          <p className="text-[9px] text-white/20 mt-1">
            Max days between inflow and receivable due date
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

      {/* Submit */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        whileTap={{ scale: 0.97 }}
        disabled={!isValid || !!governanceResult}
        onClick={handleCreate}
        className="w-full p-4 rounded-[28px] bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 hover:bg-cyan-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <FileText size={16} className="text-cyan-400" />
        <span className="text-sm text-cyan-300 font-semibold">
          Create Rule
        </span>
      </motion.button>

      <p className="text-[9px] text-white/20 text-center mt-3 px-4">
        Rule will be created at priority P{nextPriority} in the execution chain.
        Only enabled rules participate in matching. No money is moved.
      </p>
    </div>
  );
}