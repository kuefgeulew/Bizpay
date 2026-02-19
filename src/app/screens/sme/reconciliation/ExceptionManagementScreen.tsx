import { useState, useMemo } from "react";
import { ArrowLeft, AlertTriangle, Calendar, DollarSign } from "lucide-react";
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
    <div className="glass-page">
      {/* Header */}
      <header className="mb-6">
        <button onClick={onBack} className="glass-back">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="glass-title">Exception Management</h1>
        
        {/* Contextual Helper */}
        <div className="mt-3 mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-900 font-medium">
            This screen displays unmatched transactions that require manual review, prioritized by severity and aging.
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {allExceptions.length} items require attention
        </p>
      </header>

      {/* Severity Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <FilterPill
          label="All"
          count={allExceptions.length}
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          color="gray"
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
          filteredExceptions.map((exception) => (
            <ExceptionCard
              key={exception.id}
              exception={exception}
              onResolve={() => onResolveException(exception.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
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
  color: "gray" | "red" | "amber" | "blue" | "emerald";
}) {
  const colors = {
    gray: active
      ? "bg-gray-700 text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    red: active
      ? "bg-red-600 text-white"
      : "bg-red-50 text-red-700 hover:bg-red-100",
    amber: active
      ? "bg-amber-600 text-white"
      : "bg-amber-50 text-amber-700 hover:bg-amber-100",
    blue: active
      ? "bg-blue-600 text-white"
      : "bg-blue-50 text-blue-700 hover:bg-blue-100",
    emerald: active
      ? "bg-emerald-600 text-white"
      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${colors[color]}`}
    >
      {label} ({count})
    </button>
  );
}

function ExceptionCard({
  exception,
  onResolve,
}: {
  exception: ReconciliationException;
  onResolve: () => void;
}) {
  // Get transaction details
  const transaction =
    exception.transactionSource === "BANK"
      ? BANK_TRANSACTIONS.find((t) => t.id === exception.transactionId)
      : LEDGER_ENTRIES.find((t) => t.id === exception.transactionId);

  if (!transaction) return null;

  const severityColors = {
    LOW: "border-emerald-200 bg-emerald-50",
    MEDIUM: "border-blue-200 bg-blue-50",
    HIGH: "border-amber-200 bg-amber-50",
    CRITICAL: "border-red-200 bg-red-50",
  };

  const severityBadgeColors = {
    LOW: "bg-emerald-100 text-emerald-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-amber-100 text-amber-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className={`p-4 rounded-xl border ${
        severityColors[exception.severity]
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle
              size={16}
              className={
                exception.severity === "CRITICAL"
                  ? "text-red-600"
                  : exception.severity === "HIGH"
                  ? "text-amber-600"
                  : "text-blue-600"
              }
            />
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {exception.exceptionType.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {transaction.description}
          </p>
        </div>

        <span
          className={`px-2 py-1 text-[10px] font-bold rounded-full ${
            severityBadgeColors[exception.severity]
          }`}
        >
          {exception.severity}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-sm font-bold text-foreground">
              {formatAmount(exception.amount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="text-sm font-bold text-foreground">
              {exception.ageDays} days
            </p>
          </div>
        </div>
      </div>

      {/* Source Badge */}
      <div className="mb-3">
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            exception.transactionSource === "BANK"
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
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
          className="flex-1 py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Resolve Manually
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="px-3 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}

function EmptyState({ filter }: { filter: FilterType }) {
  return (
    <div className="glass-card !flex-col !items-center !justify-center !py-12 !cursor-default">
      <div className="text-4xl mb-3">✅</div>
      <p className="text-muted-foreground text-sm">
        {filter === "ALL"
          ? "No exceptions found"
          : `No ${filter.toLowerCase()} severity exceptions`}
      </p>
    </div>
  );
}