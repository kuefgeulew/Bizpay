import { useState, useMemo } from "react";
import { ArrowLeft, AlertTriangle, Calendar, Banknote, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import {
  BANK_TRANSACTIONS,
  LEDGER_ENTRIES,
  generateExceptions,
  formatAmount,
  formatDate,
  type ReconciliationException,
} from "../../../data/reconciliationEngine";

interface ExceptionManagementScreenProps {
  onBack: () => void;
  onResolveException: (exceptionId: string) => void;
}

type FilterType = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function ExceptionManagementScreen({
  onBack,
  onResolveException,
}: ExceptionManagementScreenProps) {
  const [filter, setFilter] = useState<FilterType>("ALL");

  // Generate exceptions
  const allExceptions = useMemo(
    () => generateExceptions(BANK_TRANSACTIONS, LEDGER_ENTRIES),
    []
  );

  // Filter exceptions
  const filteredExceptions = useMemo(() => {
    if (filter === "ALL") return allExceptions;
    return allExceptions.filter((exc) => exc.severity === filter);
  }, [allExceptions, filter]);

  // Count by severity
  const counts = useMemo(() => {
    const result = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    allExceptions.forEach((exc) => {
      result[exc.severity]++;
    });
    return result;
  }, [allExceptions]);

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
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Exceptions</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            {allExceptions.length} Items Need Attention
          </p>
        </div>
      </header>

      {/* Contextual Advisory */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-4 rounded-[28px] bg-amber-500/5 border border-amber-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-white/70 leading-relaxed">
            Unmatched transactions requiring manual review, prioritized by severity and aging.
          </p>
        </div>
      </motion.div>

      {/* Severity Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <FilterPill
          label="All"
          count={allExceptions.length}
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          color="cyan"
        />
        <FilterPill
          label="Critical"
          count={counts.CRITICAL}
          active={filter === "CRITICAL"}
          onClick={() => setFilter("CRITICAL")}
          color="red"
        />
        <FilterPill
          label="High"
          count={counts.HIGH}
          active={filter === "HIGH"}
          onClick={() => setFilter("HIGH")}
          color="amber"
        />
        <FilterPill
          label="Medium"
          count={counts.MEDIUM}
          active={filter === "MEDIUM"}
          onClick={() => setFilter("MEDIUM")}
          color="blue"
        />
        <FilterPill
          label="Low"
          count={counts.LOW}
          active={filter === "LOW"}
          onClick={() => setFilter("LOW")}
          color="emerald"
        />
      </div>

      {/* Exception List */}
      <div className="space-y-3 pb-6">
        {filteredExceptions.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          filteredExceptions.map((exception, i) => (
            <ExceptionCard
              key={exception.id}
              exception={exception}
              onResolve={() => onResolveException(exception.id)}
              delay={0.05 * i}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS — Gold Standard Design System
// ============================================

function FilterPill({
  label,
  count,
  active,
  onClick,
  color,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: "cyan" | "red" | "amber" | "blue" | "emerald";
}) {
  const colorMap = {
    cyan: active
      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
      : "bg-white/5 border-white/10 text-white/40 hover:text-white/60",
    red: active
      ? "bg-red-500/20 border-red-500/40 text-red-300"
      : "bg-white/5 border-white/10 text-white/40 hover:text-white/60",
    amber: active
      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
      : "bg-white/5 border-white/10 text-white/40 hover:text-white/60",
    blue: active
      ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
      : "bg-white/5 border-white/10 text-white/40 hover:text-white/60",
    emerald: active
      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
      : "bg-white/5 border-white/10 text-white/40 hover:text-white/60",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold border whitespace-nowrap transition-all ${colorMap[color]}`}
    >
      {label} ({count})
    </button>
  );
}

function ExceptionCard({
  exception,
  onResolve,
  delay,
}: {
  exception: ReconciliationException;
  onResolve: () => void;
  delay: number;
}) {
  // Get transaction details
  const transaction =
    exception.transactionSource === "BANK"
      ? BANK_TRANSACTIONS.find((t) => t.id === exception.transactionId)
      : LEDGER_ENTRIES.find((t) => t.id === exception.transactionId);

  if (!transaction) return null;

  const severityConfig = {
    LOW: {
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
      iconColor: "text-emerald-400",
      badgeBg: "bg-emerald-500/15",
      badgeText: "text-emerald-300",
      badgeBorder: "border-emerald-500/30",
    },
    MEDIUM: {
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
      iconColor: "text-blue-400",
      badgeBg: "bg-blue-500/15",
      badgeText: "text-blue-300",
      badgeBorder: "border-blue-500/30",
    },
    HIGH: {
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
      iconColor: "text-amber-400",
      badgeBg: "bg-amber-500/15",
      badgeText: "text-amber-300",
      badgeBorder: "border-amber-500/30",
    },
    CRITICAL: {
      border: "border-red-500/20",
      bg: "bg-red-500/5",
      iconColor: "text-red-400",
      badgeBg: "bg-red-500/15",
      badgeText: "text-red-300",
      badgeBorder: "border-red-500/30",
    },
  };

  const cfg = severityConfig[exception.severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay }}
      className={`p-4 rounded-[28px] ${cfg.bg} ${cfg.border} border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle size={14} className={cfg.iconColor} />
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">
              {exception.exceptionType.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-white/90 line-clamp-2">
            {transaction.description}
          </p>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold shrink-0 ml-2 ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder}`}
        >
          {exception.severity}
        </span>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Banknote size={13} className="text-white/30" />
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider">Amount</p>
            <p className="text-sm text-white font-serif">
              {formatAmount(exception.amount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-white/30" />
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider">Age</p>
            <p className="text-sm text-white font-serif">
              {exception.ageDays} days
            </p>
          </div>
        </div>
      </div>

      {/* Source Badge */}
      <div className="mb-3">
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-[0.15em] border ${
            exception.transactionSource === "BANK"
              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
              : "bg-purple-500/10 text-purple-300 border-purple-500/20"
          }`}
        >
          Source: {exception.transactionSource}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onResolve}
          className="flex-1 py-2.5 px-3 rounded-[20px] bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 font-semibold hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          Resolve Manually
          <ArrowRight size={12} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2.5 rounded-[20px] bg-white/5 border border-white/10 text-[11px] text-white/60 font-semibold hover:bg-white/10 transition-all"
        >
          Details
        </motion.button>
      </div>
    </motion.div>
  );
}

function EmptyState({ filter }: { filter: FilterType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className="py-12 flex flex-col items-center justify-center rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
    >
      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
        <AlertTriangle size={20} className="text-emerald-400" />
      </div>
      <p className="text-sm text-white/40">
        {filter === "ALL"
          ? "No exceptions found"
          : `No ${filter.toLowerCase()} severity exceptions`}
      </p>
    </motion.div>
  );
}
