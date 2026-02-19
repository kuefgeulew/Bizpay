import { useState, useMemo } from "react";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import {
  TIMELINE_ITEMS,
  groupTimelineByDate,
  filterBySeverity,
  getSeverityCounts,
  getTypeIcon,
  getTypeLabel,
  getSeverityBadge,
  getItemBorderColor,
  formatAmount,
  getDaysLabel,
  type TimelineSeverity,
  type TimelineItem,
} from "../../../data/financialTimeline";

interface TimelineScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function TimelineScreen({ onBack }: TimelineScreenProps) {
  const [severityFilter, setSeverityFilter] = useState<TimelineSeverity | "ALL">(
    "ALL"
  );

  // Apply filters
  const filteredItems = useMemo(
    () => filterBySeverity(TIMELINE_ITEMS, severityFilter),
    [severityFilter]
  );

  // Group by date
  const groupedTimeline = useMemo(
    () => groupTimelineByDate(filteredItems),
    [filteredItems]
  );

  // Calculate counts
  const counts = useMemo(
    () => getSeverityCounts(TIMELINE_ITEMS),
    []
  );

  // Count actionable items
  const actionableCount = TIMELINE_ITEMS.filter((i) => i.actionable).length;

  return (
    <div className="relative h-full text-white px-8 pt-10 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Header */}
      <header className="flex items-center gap-4 mb-12">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-4xl font-serif tracking-tight">Financial Timeline</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Upcoming Obligations
          </p>
        </div>
      </header>

      {/* Alert Banner */}
      {actionableCount > 0 && (
        <div className="mb-6 p-4 rounded-[24px] bg-red-500/10 border border-red-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-white text-sm">
                Action Required
              </p>
              <p className="text-xs text-white/60">
                {actionableCount} item(s) need immediate attention
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <SummaryCard
          label="Critical"
          count={counts.CRITICAL}
          color="red"
          active={severityFilter === "CRITICAL"}
          onClick={() =>
            setSeverityFilter(severityFilter === "CRITICAL" ? "ALL" : "CRITICAL")
          }
        />
        <SummaryCard
          label="Urgent"
          count={counts.URGENT}
          color="orange"
          active={severityFilter === "URGENT"}
          onClick={() =>
            setSeverityFilter(severityFilter === "URGENT" ? "ALL" : "URGENT")
          }
        />
        <SummaryCard
          label="Warning"
          count={counts.WARNING}
          color="amber"
          active={severityFilter === "WARNING"}
          onClick={() =>
            setSeverityFilter(severityFilter === "WARNING" ? "ALL" : "WARNING")
          }
        />
        <SummaryCard
          label="Info"
          count={counts.INFO}
          color="blue"
          active={severityFilter === "INFO"}
          onClick={() =>
            setSeverityFilter(severityFilter === "INFO" ? "ALL" : "INFO")
          }
        />
      </div>

      {/* Timeline Groups */}
      <div className="space-y-6 pb-6">
        {groupedTimeline.length === 0 ? (
          <EmptyState filter={severityFilter} />
        ) : (
          groupedTimeline.map((group) => (
            <TimelineGroup key={group.date} group={group} />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SummaryCard({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: "red" | "orange" | "amber" | "blue";
  active: boolean;
  onClick: () => void;
}) {
  const colors = {
    red: active
      ? "bg-red-600 text-white border-red-600"
      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    orange: active
      ? "bg-orange-600 text-white border-orange-600"
      : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    amber: active
      ? "bg-amber-600 text-white border-amber-600"
      : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    blue: active
      ? "bg-blue-600 text-white border-blue-600"
      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  };

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border transition-colors ${colors[color]}`}
    >
      <p className="text-2xl font-bold mb-1">{count}</p>
      <p className="text-[10px] font-semibold uppercase">{label}</p>
    </button>
  );
}

function TimelineGroup({ group }: { group: any }) {
  return (
    <div>
      {/* Date Header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <Calendar size={16} className="text-cyan-400" />
        <h3 className="font-bold text-white">{group.dayLabel}</h3>
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/60">
          {group.items.length} item(s)
        </span>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {group.items.map((item: TimelineItem) => (
          <TimelineItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function TimelineItemCard({ item }: { item: TimelineItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{getTypeIcon(item.type)}</span>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-bold text-white tracking-tight">{item.title}</h4>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getSeverityBadge(
                item.severity
              )}`}
            >
              {item.severity}
            </span>
          </div>

          <p className="text-sm text-white/60 mb-2">
            {item.description}
          </p>

          {/* Amount & Type */}
          <div className="flex items-center gap-3">
            {item.amount && (
              <span className="text-sm font-bold text-white">
                {formatAmount(item.amount)}
              </span>
            )}
            <span className="text-xs text-white/40 uppercase font-bold tracking-wider">
              {getTypeLabel(item.type)}
            </span>
          </div>
        </div>
      </div>

      {/* Days Label */}
      <div className="mb-3">
        <span className="text-xs font-bold text-cyan-400">
          {getDaysLabel(item.date)}
        </span>
      </div>

      {/* Action Button */}
      {item.actionable && (
        <button className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-white text-xs font-bold hover:bg-cyan-500/30 transition-all mb-3">
          {item.actionLabel || "Take Action"}
        </button>
      )}

      {/* Expand Toggle */}
      {Object.keys(item.metadata).length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-cyan-400 font-bold"
          >
            {expanded ? "Hide Details" : "Show Details"}
          </button>

          {/* Expanded Metadata */}
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 pt-3 border-t border-white/10 space-y-2"
            >
              {Object.entries(item.metadata).map(([key, value]) => (
                <MetadataRow
                  key={key}
                  label={key.replace(/([A-Z])/g, " $1").trim()}
                  value={String(value)}
                />
              ))}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/60 capitalize">{label}</span>
      <span className="text-xs font-bold text-white">{value}</span>
    </div>
  );
}

function EmptyState({ filter }: { filter: TimelineSeverity | "ALL" }) {
  return (
    <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center">
      <div className="text-4xl mb-3">📅</div>
      <p className="text-white/60 text-sm">
        {filter === "ALL"
          ? "No upcoming items"
          : `No ${filter.toLowerCase()} items`}
      </p>
    </div>
  );
}