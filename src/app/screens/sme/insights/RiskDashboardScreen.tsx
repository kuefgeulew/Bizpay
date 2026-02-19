import { useState, useMemo } from "react";
import { ArrowLeft, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  getAllRiskSignals,
  getSeverityCounts,
  getSeverityBadge,
  getCategoryIcon,
  getCategoryLabel,
  type RiskSignal,
  type RiskSeverity,
  type RiskCategory,
} from "../../../data/riskSignals";

interface RiskDashboardScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function RiskDashboardScreen({ onBack }: RiskDashboardScreenProps) {
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<RiskCategory | "ALL">("ALL");
  const [dismissedSignals, setDismissedSignals] = useState<Set<string>>(new Set());

  // Get all signals
  const allSignals = useMemo(() => getAllRiskSignals(), []);

  // Apply filters
  const filteredSignals = useMemo(() => {
    let filtered = allSignals.filter((s) => !dismissedSignals.has(s.id));

    if (severityFilter !== "ALL") {
      filtered = filtered.filter((s) => s.severity === severityFilter);
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((s) => s.category === categoryFilter);
    }

    return filtered;
  }, [allSignals, severityFilter, categoryFilter, dismissedSignals]);

  // Get counts
  const counts = useMemo(() => getSeverityCounts(), []);

  const handleDismiss = (signalId: string) => {
    setDismissedSignals((prev) => new Set(prev).add(signalId));
  };

  const hasCriticalOrHigh = counts.CRITICAL > 0 || counts.HIGH > 0;

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
          <h1 className="text-3xl font-serif tracking-tight">Risk Signals</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Proactive Alerts & Warnings
          </p>
        </div>
      </header>

      {/* Alert Banner */}
      {hasCriticalOrHigh && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="mb-6 p-4 rounded-[24px] bg-red-500/10 border border-red-500/30 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">High Priority Alerts</p>
              <p className="text-xs text-white/70">
                {counts.CRITICAL} critical, {counts.HIGH} high severity
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Severity Filter */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
          Filter by Severity
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <SeverityPill
            label="All"
            count={allSignals.length - dismissedSignals.size}
            active={severityFilter === "ALL"}
            onClick={() => setSeverityFilter("ALL")}
            color="gray"
          />
          {counts.CRITICAL > 0 && (
            <SeverityPill
              label="Critical"
              count={counts.CRITICAL}
              active={severityFilter === "CRITICAL"}
              onClick={() => setSeverityFilter("CRITICAL")}
              color="red"
            />
          )}
          {counts.HIGH > 0 && (
            <SeverityPill
              label="High"
              count={counts.HIGH}
              active={severityFilter === "HIGH"}
              onClick={() => setSeverityFilter("HIGH")}
              color="orange"
            />
          )}
          {counts.MEDIUM > 0 && (
            <SeverityPill
              label="Medium"
              count={counts.MEDIUM}
              active={severityFilter === "MEDIUM"}
              onClick={() => setSeverityFilter("MEDIUM")}
              color="amber"
            />
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
          Filter by Category
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <CategoryPill
            label="All"
            active={categoryFilter === "ALL"}
            onClick={() => setCategoryFilter("ALL")}
          />
          <CategoryPill
            label="Transaction"
            active={categoryFilter === "TRANSACTION"}
            onClick={() => setCategoryFilter("TRANSACTION")}
          />
          <CategoryPill
            label="Approval"
            active={categoryFilter === "APPROVAL"}
            onClick={() => setCategoryFilter("APPROVAL")}
          />
          <CategoryPill
            label="Reconciliation"
            active={categoryFilter === "RECONCILIATION"}
            onClick={() => setCategoryFilter("RECONCILIATION")}
          />
          <CategoryPill
            label="Receivable"
            active={categoryFilter === "RECEIVABLE"}
            onClick={() => setCategoryFilter("RECEIVABLE")}
          />
          <CategoryPill
            label="Limit"
            active={categoryFilter === "LIMIT"}
            onClick={() => setCategoryFilter("LIMIT")}
          />
        </div>
      </div>

      {/* Risk Signals List */}
      <div className="space-y-3 pb-6">
        <AnimatePresence mode="popLayout">
          {filteredSignals.length === 0 ? (
            <EmptyState />
          ) : (
            filteredSignals.map((signal, i) => (
              <RiskSignalCard
                key={signal.id}
                signal={signal}
                onDismiss={handleDismiss}
                delay={i * 0.03}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SeverityPill({
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
  color: "gray" | "red" | "orange" | "amber";
}) {
  const colors = {
    gray: active
      ? "bg-white/20 text-white border-white/30"
      : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10",
    red: active
      ? "bg-red-500/30 text-red-300 border-red-500/50"
      : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
    orange: active
      ? "bg-orange-500/30 text-orange-300 border-orange-500/50"
      : "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20",
    amber: active
      ? "bg-amber-500/30 text-amber-300 border-amber-500/50"
      : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-xl ${colors[color]}`}
    >
      {label} ({count})
    </motion.button>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-xl ${
        active
          ? "bg-cyan-500/30 text-cyan-300 border-cyan-500/50"
          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
      }`}
    >
      {label}
    </motion.button>
  );
}

function RiskSignalCard({
  signal,
  onDismiss,
  delay,
}: {
  signal: RiskSignal;
  onDismiss: (id: string) => void;
  delay: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const cardColors = {
    CRITICAL: { border: "border-red-500/30", bg: "bg-red-500/10" },
    HIGH: { border: "border-orange-500/30", bg: "bg-orange-500/10" },
    MEDIUM: { border: "border-amber-500/30", bg: "bg-amber-500/10" },
    LOW: { border: "border-blue-500/30", bg: "bg-blue-500/10" },
    INFO: { border: "border-white/10", bg: "bg-white/5" },
  };

  const colors = cardColors[signal.severity];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ ...SPRING, delay }}
      className={`p-5 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] ${colors.border} ${colors.bg}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{getCategoryIcon(signal.category)}</span>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-white pr-2">{signal.title}</h4>
            <button
              onClick={() => onDismiss(signal.id)}
              className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={14} className="text-white/60" />
            </button>
          </div>

          <p className="text-sm text-white/80 mb-3">{signal.description}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getSeverityBadge(
                signal.severity
              )}`}
            >
              {signal.severity}
            </span>
            <span className="text-xs text-white/60 uppercase font-semibold">
              {getCategoryLabel(signal.category)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {signal.actionable && (
        <button className="w-full py-2.5 px-4 rounded-[20px] bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity mb-3 shadow-lg">
          {signal.actionLabel || "Take Action"}
        </button>
      )}

      {/* Expand Toggle */}
      {Object.keys(signal.metadata).length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-cyan-400 font-medium hover:text-cyan-300"
          >
            {expanded ? "Hide Details" : "Show Details"}
          </button>

          {/* Expanded Metadata */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={SPRING}
                className="mt-3 pt-3 border-t border-white/10 space-y-2 overflow-hidden"
              >
                {Object.entries(signal.metadata).map(([key, value]) => (
                  <MetadataRow
                    key={key}
                    label={key.replace(/([A-Z])/g, " $1").trim()}
                    value={String(value)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/60 capitalize">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING}
      className="p-12 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-center"
    >
      <div className="text-5xl mb-3">✅</div>
      <p className="text-white/90 text-sm font-medium mb-1">No active risk signals</p>
      <p className="text-xs text-white/60">All systems operating normally</p>
    </motion.div>
  );
}
