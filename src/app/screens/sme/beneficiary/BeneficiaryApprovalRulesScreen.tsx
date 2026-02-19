import { ArrowLeft, ShieldCheck, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import SystemDisclaimer from "../../../components/SystemDisclaimer";
import { BENEFICIARY_GOVERNANCE_RULES, getRiskColor } from "../../../mock/beneficiaryGovernance";

interface BeneficiaryApprovalRulesScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function BeneficiaryApprovalRulesScreen({ onBack }: BeneficiaryApprovalRulesScreenProps) {
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
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Beneficiary Approval Rules</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Governance & Cooling Period Matrix
          </p>
        </div>
      </header>

      {/* System Disclaimer */}
      <SystemDisclaimer
        message="Governance rules and cooling period matrix configuration interface."
        className="mb-6"
      />

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        <SummaryCard
          icon={ShieldCheck}
          label="Total Rules"
          value={BENEFICIARY_GOVERNANCE_RULES.length.toString()}
          color="text-cyan-400"
        />
        <SummaryCard
          icon={CheckCircle}
          label="Require Approval"
          value={BENEFICIARY_GOVERNANCE_RULES.filter(r => r.requiresApproval).length.toString()}
          color="text-emerald-400"
        />
        <SummaryCard
          icon={Clock}
          label="Max Cooling"
          value="48 hrs"
          color="text-orange-400"
        />
      </motion.div>

      {/* Visual Workflow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-8 p-6 rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10"
      >
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-4">Standard Approval Flow</h3>
        <div className="flex items-center justify-between">
          <WorkflowStep label="Maker Creates" status="start" />
          <Arrow />
          <WorkflowStep label="Auto-Check" status="processing" />
          <Arrow />
          <WorkflowStep label="Approver Reviews" status="processing" />
          <Arrow />
          <WorkflowStep label="Cooling Period" status="waiting" />
          <Arrow />
          <WorkflowStep label="Active" status="complete" />
        </div>
      </motion.div>

      {/* Rules Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Governance Rules Matrix</h3>
        {BENEFICIARY_GOVERNANCE_RULES.map((rule, idx) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.3 + idx * 0.05 }}
            className="p-5 rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            {/* Rule Header */}
            <div className="flex items-start justify-between mb-3 pb-3 border-b border-white/10">
              <div className="flex-1">
                <h4 className="text-[14px] font-bold text-white mb-1">{rule.title}</h4>
                <p className="text-[10px] text-white/60">{rule.condition}</p>
              </div>
              <div
                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border bg-gradient-to-br ${getRiskColor(
                  rule.riskLevel
                )}`}
              >
                {rule.riskLevel}
              </div>
            </div>

            {/* Rule Details Grid */}
            <div className="grid grid-cols-3 gap-4">
              <RuleDetail
                icon={<ShieldCheck size={12} />}
                label="Action"
                value={rule.action}
              />
              <RuleDetail
                icon={<CheckCircle size={12} />}
                label="Requires Approval"
                value={rule.requiresApproval ? "Yes" : "No"}
              />
              <RuleDetail
                icon={<Clock size={12} />}
                label="Cooling Period"
                value={rule.coolingPeriod > 0 ? `${rule.coolingPeriod}hrs` : "None"}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Explainer Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.8 }}
        className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/30 backdrop-blur-xl"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-purple-400 mt-0.5" />
          <div>
            <div className="text-[11px] font-bold text-white mb-1">About Cooling Periods</div>
            <div className="text-[10px] text-white/70 leading-relaxed">
              Cooling periods prevent immediate fund transfers to newly added beneficiaries, reducing fraud risk.
              During cooling, the beneficiary appears "Active" but transfers are visually restricted.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  value: string;
  color: string;
}

function SummaryCard({ icon: Icon, label, value, color }: SummaryCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

// Workflow Step Component
interface WorkflowStepProps {
  label: string;
  status: "start" | "processing" | "waiting" | "complete";
}

function WorkflowStep({ label, status }: WorkflowStepProps) {
  const colorClass =
    status === "complete"
      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
      : status === "waiting"
      ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
      : status === "processing"
      ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
      : "bg-white/10 border-white/20 text-white/40";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full border-2 ${colorClass} flex items-center justify-center backdrop-blur-xl`}>
        {status === "complete" && <CheckCircle size={18} />}
        {status === "waiting" && <Clock size={18} />}
        {status === "processing" && <ShieldCheck size={18} />}
        {status === "start" && <ShieldCheck size={18} />}
      </div>
      <span className="text-[9px] font-bold text-white/70 text-center w-16">{label}</span>
    </div>
  );
}

// Arrow Component
function Arrow() {
  return (
    <div className="flex-1 h-0.5 bg-gradient-to-r from-white/20 to-white/10 relative">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-white/20 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent" />
    </div>
  );
}

// Rule Detail Component
interface RuleDetailProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function RuleDetail({ icon, label, value }: RuleDetailProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1 text-white/30">
        <span className="opacity-50">{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-[11px] font-medium text-white tracking-tight">{value}</div>
    </div>
  );
}