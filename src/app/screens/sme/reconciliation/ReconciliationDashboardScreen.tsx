import { useState, useMemo } from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, TrendingUp, ArrowRight, Vault } from "lucide-react";
import { motion } from "motion/react";
import {
  BANK_TRANSACTIONS,
  LEDGER_ENTRIES,
  generateExceptions,
  generateAgingBuckets,
  getReconciliationStats,
  formatAmount,
  type AgingBucket,
} from "../../../data/reconciliationEngine";

interface ReconciliationDashboardScreenProps {
  onBack: () => void;
  onViewDetails: (view: "matches" | "exceptions" | "manual" | "auto-rules" | "tax-vault") => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function ReconciliationDashboardScreen({
  onBack,
  onViewDetails,
}: ReconciliationDashboardScreenProps) {
  const [bankTransactions] = useState(BANK_TRANSACTIONS);
  const [ledgerEntries] = useState(LEDGER_ENTRIES);

  // Calculate stats
  const stats = useMemo(
    () => getReconciliationStats(bankTransactions, ledgerEntries),
    [bankTransactions, ledgerEntries]
  );

  // Generate exceptions and aging
  const exceptions = useMemo(
    () => generateExceptions(bankTransactions, ledgerEntries),
    [bankTransactions, ledgerEntries]
  );

  const agingBuckets = useMemo(
    () => generateAgingBuckets(exceptions),
    [exceptions]
  );

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Header */}
      <header className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Reconciliation</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Auto-Matching Engine
          </p>
        </div>
      </header>

      {/* Match Rate Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">Match Rate</p>
          <TrendingUp size={18} className="text-[#EDBA12]" />
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-serif font-bold text-white">
            {stats.matchRate}%
          </span>
          <span className="text-sm text-white/60">
            {stats.matchedBank} of {stats.totalBank} matched
          </span>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-400/60 font-bold mb-3">Bank Txns</p>
          <p className="text-2xl font-bold text-white mb-1">{stats.totalBank}</p>
          <p className="text-xs text-white/50">{stats.unmatchedBank} unmatched</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-400/60 font-bold mb-3">Ledger Entries</p>
          <p className="text-2xl font-bold text-white mb-1">{stats.totalLedger}</p>
          <p className="text-xs text-white/50">{stats.unmatchedLedger} unmatched</p>
        </motion.div>
      </div>

      {/* Action Cards */}
      <div className="space-y-3 mb-6">
        <ActionCard
          icon={<CheckCircle size={20} className="text-emerald-400" />}
          label="View Matched Items"
          description={`${stats.matchedBank} items reconciled`}
          color="emerald"
          onClick={() => onViewDetails("matches")}
          delay={0.15}
        />

        <ActionCard
          icon={<AlertTriangle size={20} className="text-amber-400" />}
          label="Exception Management"
          description={`${exceptions.length} items need attention`}
          color="amber"
          onClick={() => onViewDetails("exceptions")}
          delay={0.2}
        />

        <ActionCard
          icon={<XCircle size={20} className="text-red-400" />}
          label="Manual Matching"
          description="Match transactions manually"
          color="red"
          onClick={() => onViewDetails("manual")}
          delay={0.25}
        />

        <ActionCard
          icon={<TrendingUp size={20} className="text-cyan-400" />}
          label="Auto-Reconciliation Rules"
          description="Intelligent matching logic"
          color="cyan"
          onClick={() => onViewDetails("auto-rules")}
          delay={0.3}
        />

        <ActionCard
          icon={<Vault size={20} className="text-blue-400" />}
          label="Tax Vault"
          description="Statutory cash parking"
          color="cyan"
          onClick={() => onViewDetails("tax-vault")}
          delay={0.35}
        />
      </div>

      {/* Aging Buckets */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.35 }}
        className="p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">Aging Analysis</p>

        <div className="space-y-3">
          {agingBuckets.map((bucket, index) => (
            <AgingBucketCard key={index} bucket={bucket} delay={0.4 + index * 0.05} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ActionCard({
  icon,
  label,
  description,
  color,
  onClick,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: "emerald" | "amber" | "red" | "cyan";
  onClick: () => void;
  delay: number;
}) {
  const colors = {
    emerald: "border-emerald-500/20 hover:bg-emerald-500/10",
    amber: "border-amber-500/20 hover:bg-amber-500/10",
    red: "border-red-500/20 hover:bg-red-500/10",
    cyan: "border-cyan-500/20 hover:bg-cyan-500/10",
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full p-4 rounded-[28px] bg-white/5 border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all text-left ${colors[color]}`}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 p-2 rounded-full bg-white/5">{icon}</div>
        <div className="flex-1">
          <p className="font-semibold text-white mb-1">{label}</p>
          <p className="text-xs text-white/60">{description}</p>
        </div>
        <ArrowRight size={18} className="text-white/40" />
      </div>
    </motion.button>
  );
}

function AgingBucketCard({ bucket, delay }: { bucket: AgingBucket; delay: number }) {
  const severityColors = {
    "0-1": { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400" },
    "2-7": { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400" },
    "8-30": { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400" },
    "30+": { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-400" },
  };

  const color = severityColors[bucket.range as keyof typeof severityColors];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING, delay }}
      className={`p-4 rounded-[20px] border ${color.border} ${color.bg} backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${color.text}`}>{bucket.label}</span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
          {bucket.count}
        </span>
      </div>
      <p className="text-xl font-bold text-white">{formatAmount(bucket.totalAmount)}</p>
    </motion.div>
  );
}