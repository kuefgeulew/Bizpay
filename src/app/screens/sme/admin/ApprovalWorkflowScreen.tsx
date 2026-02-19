import { useState } from "react";
import { ArrowLeft, GitBranch, Clock, Zap, ChevronRight, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  APPROVAL_RULES,
  getTriggerLabel,
  type ApprovalRule,
} from "../../../data/adminGovernance";

interface ApprovalWorkflowScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function ApprovalWorkflowScreen({ onBack }: ApprovalWorkflowScreenProps) {
  const [selectedRule, setSelectedRule] = useState<ApprovalRule | null>(null);
  const [filterTrigger, setFilterTrigger] = useState<string>("all");

  const filteredRules = APPROVAL_RULES
    .filter(r => filterTrigger === "all" || r.trigger === filterTrigger)
    .sort((a, b) => a.priority - b.priority);

  const activeRules = APPROVAL_RULES.filter(r => r.isActive).length;
  const totalTriggers30d = APPROVAL_RULES.reduce((sum, r) => sum + r.triggerCount30d, 0);
  const avgSLA = Math.round(
    APPROVAL_RULES.reduce((sum, r) => sum + r.slaHours, 0) / APPROVAL_RULES.length
  );

  if (selectedRule) {
    return (
      <RuleDetailView rule={selectedRule} onBack={() => setSelectedRule(null)} />
    );
  }

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
          <h1 className="text-3xl font-serif tracking-tight">Approval Rules</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Multi-Level Workflow Engine
          </p>
        </div>
      </header>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <StatCard label="Rules" value={activeRules.toString()} sub="Active" icon={<GitBranch size={14} className="text-cyan-400" />} />
        <StatCard label="Triggers" value={totalTriggers30d.toString()} sub="Last 30d" icon={<Zap size={14} className="text-amber-400" />} />
        <StatCard label="Avg SLA" value={`${avgSLA}h`} sub="Target" icon={<Clock size={14} className="text-emerald-400" />} />
      </motion.div>

      {/* Filter Chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="flex gap-2 overflow-x-auto pb-2 mb-6"
      >
        {["all", "AMOUNT_THRESHOLD", "TRANSACTION_TYPE", "BENEFICIARY_NEW", "SERVICE_REQUEST", "USER_CHANGE"].map(t => (
          <button
            key={t}
            onClick={() => setFilterTrigger(t)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
              filterTrigger === t
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
            }`}
          >
            {t === "all" ? "All Rules" : getTriggerLabel(t as any)}
          </button>
        ))}
      </motion.div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule, i) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onSelect={() => setSelectedRule(rule)}
            delay={0.1 + i * 0.03}
          />
        ))}
      </div>
    </div>
  );
}

/* -------- Sub-Components -------- */

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-[24px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[9px] text-white/40 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xl text-white">{value}</p>
      <p className="text-[10px] text-white/30">{sub}</p>
    </div>
  );
}

function RuleCard({ rule, onSelect, delay }: { rule: ApprovalRule; onSelect: () => void; delay: number }) {
  const priorityColors = ["text-red-400", "text-orange-400", "text-amber-400", "text-cyan-400", "text-blue-400"];
  const priorityLabels = ["P0 — Critical", "P1 — High", "P2 — Standard", "P3 — Normal", "P4 — Low"];

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      onClick={onSelect}
      className="w-full p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] text-left transition-all hover:border-white/20 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm text-white/90 font-medium">{rule.name}</h3>
            {rule.isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
            )}
          </div>
          <p className={`text-[10px] font-bold ${priorityColors[rule.priority] || "text-white/40"}`}>
            {priorityLabels[rule.priority] || "Standard"}
          </p>
        </div>
        <ChevronRight size={16} className="text-white/20 shrink-0 mt-1" />
      </div>

      <p className="text-xs text-white/50 mb-3">{rule.condition}</p>

      {/* Workflow stages */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Flow:</span>
        {rule.stages.map((stage, i) => (
          <span key={stage} className="flex items-center gap-1">
            {i > 0 && <span className="text-white/20 text-[10px]">&rarr;</span>}
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
              stage === "CHECKER" ? "bg-blue-500/15 text-blue-400" : "bg-emerald-500/15 text-emerald-400"
            }`}>
              {stage}
            </span>
          </span>
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] text-white/30">
          <Clock size={10} />
          <span>SLA: {rule.slaHours}h</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/30">
          <TrendingUp size={10} />
          <span>{rule.triggerCount30d} triggers / 30d</span>
        </div>
      </div>
    </motion.button>
  );
}

/* -------- Rule Detail View -------- */

function RuleDetailView({ rule, onBack }: { rule: ApprovalRule; onBack: () => void }) {
  const formattedDate = new Date(rule.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const lastTriggeredDate = rule.lastTriggered
    ? new Date(rule.lastTriggered).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

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
          <h1 className="text-3xl font-serif tracking-tight">{rule.name}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            {getTriggerLabel(rule.trigger)}
          </p>
        </div>
      </header>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-5 rounded-[28px] bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(52,211,153,0.15)]"
      >
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-400" />
          <div>
            <p className="text-sm text-white font-medium">Rule Active</p>
            <p className="text-xs text-white/50">Created {formattedDate}</p>
          </div>
        </div>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] mb-4"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Rule Configuration
        </p>
        <div className="space-y-3">
          <DetailRow label="Trigger" value={getTriggerLabel(rule.trigger)} />
          <DetailRow label="Condition" value={rule.condition} />
          <DetailRow label="SLA Target" value={`${rule.slaHours} hours`} />
          <DetailRow label="Last Triggered" value={lastTriggeredDate} />
          <DetailRow label="30-Day Triggers" value={rule.triggerCount30d.toString()} />
        </div>
      </motion.div>

      {/* Workflow Chain */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] mb-4"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Approval Chain
        </p>
        <div className="space-y-3">
          {rule.stages.map((stage, i) => (
            <div key={stage} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                stage === "CHECKER" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {i + 1}
              </div>
              <div>
                <p className="text-sm text-white">{stage}</p>
                <p className="text-[10px] text-white/40">
                  {stage === "CHECKER" ? "Verify & validate submission" : "Final authorization"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Escalation */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
        className="p-5 rounded-[28px] bg-amber-500/5 border border-amber-500/20 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(245,158,11,0.1)]"
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={16} className="text-amber-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/80 font-bold">
            Escalation Path
          </p>
        </div>
        <p className="text-sm text-white/70">{rule.escalationPath}</p>
      </motion.div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs text-white/90 font-medium text-right max-w-[55%]">{value}</span>
    </div>
  );
}