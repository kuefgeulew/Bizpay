import { useState, useMemo } from "react";
import { ArrowLeft, Filter, Download, Search, Link2, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ACTIVITY_LOG,
  filterActivityLog,
  paginateActivityLog,
  getEntriesByCorrelation,
  exportToCSV,
  exportToPDF,
  downloadFile,
  getSeverityBadge,
  formatTimestamp,
  type ActivityLogEntry,
  type ActivityFilter,
  type ActivitySeverity,
  type ActivityCategory,
  type ActivityAction,
} from "../../../data/activityLog";

interface EnhancedActivityLogScreenProps {
  onBack: () => void;
}

const PAGE_SIZE = 20;
const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function EnhancedActivityLogScreen({ onBack }: EnhancedActivityLogScreenProps) {
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCorrelation, setSelectedCorrelation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Apply filters
  const filteredEntries = useMemo(() => {
    const filtered = filterActivityLog(ACTIVITY_LOG, {
      ...filter,
      searchQuery,
    });
    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filter, searchQuery]);

  // Pagination
  const paginatedData = useMemo(() => {
    return paginateActivityLog(filteredEntries, page, PAGE_SIZE);
  }, [filteredEntries, page]);

  // Correlation view
  const correlatedEntries = useMemo(() => {
    if (!selectedCorrelation) return null;
    return getEntriesByCorrelation(ACTIVITY_LOG, selectedCorrelation);
  }, [selectedCorrelation]);

  const handleExportCSV = () => {
    const csv = exportToCSV(filteredEntries);
    downloadFile(csv, `bizpay-activity-log-${Date.now()}.csv`, "text/csv");
  };

  const handleExportPDF = () => {
    const pdf = exportToPDF(filteredEntries);
    downloadFile(pdf, `bizpay-activity-log-${Date.now()}.pdf`, "application/pdf");
  };

  const handleLoadMore = () => {
    if (paginatedData.hasMore) {
      setPage((p) => p + 1);
    }
  };

  const resetFilters = () => {
    setFilter({});
    setSearchQuery("");
    setPage(0);
  };

  const activeFilterCount = Object.keys(filter).filter((k) => filter[k as keyof ActivityFilter]).length;

  if (correlatedEntries) {
    return (
      <CorrelationView
        entries={correlatedEntries}
        correlationId={selectedCorrelation!}
        onBack={() => setSelectedCorrelation(null)}
      />
    );
  }

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
          <h1 className="text-3xl font-serif tracking-tight">Activity Log</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            🔒 Immutable Audit Trail • {filteredEntries.length} entries
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search by description, user, entity..."
          className="w-full pl-12 pr-4 py-3 rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-[45px] text-white placeholder:text-white/40 text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] focus:outline-none focus:border-cyan-400/50"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex-1 py-3 px-4 rounded-[24px] border font-medium text-sm transition-all ${
            showFilters
              ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
              : "border-white/10 bg-white/5 text-white backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
          }`}
        >
          <Filter size={16} className="inline mr-2" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>

        <button
          onClick={handleExportCSV}
          className="flex-1 py-3 px-4 rounded-[24px] border border-white/10 bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-all backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <Download size={16} className="inline mr-2" />
          CSV
        </button>

        <button
          onClick={handleExportPDF}
          className="flex-1 py-3 px-4 rounded-[24px] border border-white/10 bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-all backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <Download size={16} className="inline mr-2" />
          PDF
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel filter={filter} setFilter={setFilter} onReset={resetFilters} onClose={() => setShowFilters(false)} />
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/60">Active filters:</span>
          {filter.severity && (
            <FilterBadge label={`Severity: ${filter.severity}`} onRemove={() => setFilter({ ...filter, severity: undefined })} />
          )}
          {filter.category && (
            <FilterBadge label={`Category: ${filter.category}`} onRemove={() => setFilter({ ...filter, category: undefined })} />
          )}
          {filter.role && (
            <FilterBadge label={`Role: ${filter.role}`} onRemove={() => setFilter({ ...filter, role: undefined })} />
          )}
          <button onClick={resetFilters} className="text-xs text-cyan-400 font-medium hover:text-cyan-300">
            Clear all
          </button>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-3">
        {paginatedData.entries.length === 0 ? (
          <div className="p-12 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] text-center">
            <p className="text-white/60">No activity logs found</p>
          </div>
        ) : (
          <>
            {paginatedData.entries.map((entry, i) => (
              <ActivityLogCard
                key={entry.id}
                entry={entry}
                delay={i * 0.03}
                onViewCorrelation={
                  entry.correlationId ? () => setSelectedCorrelation(entry.correlationId!) : undefined
                }
              />
            ))}

            {/* Load More */}
            {paginatedData.hasMore && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={SPRING}
                onClick={handleLoadMore}
                className="w-full py-4 rounded-[24px] border border-white/10 bg-white/5 text-cyan-400 font-medium text-sm hover:bg-white/10 transition-all backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
              >
                <ChevronDown size={16} className="inline mr-2" />
                Load More ({paginatedData.totalEntries - paginatedData.entries.length} remaining)
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 rounded-[24px] bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl">
        <p className="text-xs text-white/90 font-medium">
          🔒 All activity logs are immutable and cannot be deleted. Logs are retained for 7 years for compliance.
        </p>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ActivityLogCard({
  entry,
  delay,
  onViewCorrelation,
}: {
  entry: ActivityLogEntry;
  delay: number;
  onViewCorrelation?: () => void;
}) {
  const severityColors = {
    CRITICAL: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
    HIGH: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
    WARNING: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
    INFO: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  };

  const color = severityColors[entry.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className="p-4 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white text-sm">{entry.userName}</h4>
            <span className="text-xs text-white/40 uppercase px-2 py-0.5 rounded-full bg-white/5">
              {entry.userRole}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${color.border} ${color.bg} ${color.text}`}>
              {entry.severity}
            </span>
          </div>
          <p className="text-xs text-white/60">{formatTimestamp(entry.timestamp)}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-white/90 mb-3">{entry.description}</p>

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
        <span className="font-medium text-cyan-400">{entry.action.replace(/_/g, " ")}</span>
        <span>•</span>
        <span>{entry.category}</span>
        {entry.reasonCode && (
          <>
            <span>•</span>
            <span className="font-mono text-[#EDBA12]">{entry.reasonCode}</span>
          </>
        )}
      </div>

      {/* Entity Info */}
      {entry.entityType && (
        <div className="text-xs text-white/60 mb-2">
          Entity: {entry.entityType} {entry.entityId && `(${entry.entityId})`}
        </div>
      )}

      {/* Correlation Link */}
      {onViewCorrelation && (
        <button
          onClick={onViewCorrelation}
          className="flex items-center gap-1 text-xs text-cyan-400 font-medium hover:text-cyan-300 mb-2"
        >
          <Link2 size={12} />
          View Related Activities
        </button>
      )}

      {/* Device Info */}
      {entry.deviceInfo && (
        <div className="text-[10px] text-white/40">
          {entry.ipAddress} • {entry.deviceInfo}
        </div>
      )}
    </motion.div>
  );
}

function FilterPanel({
  filter,
  setFilter,
  onReset,
  onClose,
}: {
  filter: ActivityFilter;
  setFilter: (filter: ActivityFilter) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={SPRING}
      className="mb-4 p-5 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] space-y-4 overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">Filters</p>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Severity */}
      <div>
        <label className="text-xs font-medium text-white/60 mb-2 block">Severity</label>
        <select
          value={filter.severity || ""}
          onChange={(e) =>
            setFilter({
              ...filter,
              severity: e.target.value ? (e.target.value as ActivitySeverity) : undefined,
            })
          }
          className="w-full px-4 py-2.5 rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-xl text-white text-sm focus:outline-none focus:border-cyan-400/50"
        >
          <option value="">All</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="WARNING">Warning</option>
          <option value="INFO">Info</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-medium text-white/60 mb-2 block">Category</label>
        <select
          value={filter.category || ""}
          onChange={(e) =>
            setFilter({
              ...filter,
              category: e.target.value ? (e.target.value as ActivityCategory) : undefined,
            })
          }
          className="w-full px-4 py-2.5 rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-xl text-white text-sm focus:outline-none focus:border-cyan-400/50"
        >
          <option value="">All</option>
          <option value="AUTHENTICATION">Authentication</option>
          <option value="TRANSACTION">Transaction</option>
          <option value="APPROVAL">Approval</option>
          <option value="USER_MANAGEMENT">User Management</option>
          <option value="RECONCILIATION">Reconciliation</option>
          <option value="SECURITY">Security</option>
          <option value="DELEGATION">Delegation</option>
        </select>
      </div>

      {/* Role */}
      <div>
        <label className="text-xs font-medium text-white/60 mb-2 block">User Role</label>
        <select
          value={filter.role || ""}
          onChange={(e) =>
            setFilter({
              ...filter,
              role: e.target.value || undefined,
            })
          }
          className="w-full px-4 py-2.5 rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-xl text-white text-sm focus:outline-none focus:border-cyan-400/50"
        >
          <option value="">All</option>
          <option value="maker">Maker</option>
          <option value="checker">Checker</option>
          <option value="approver">Approver</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 rounded-[20px] bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
      >
        Reset Filters
      </button>
    </motion.div>
  );
}

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-cyan-300">
        <X size={12} />
      </button>
    </span>
  );
}

function CorrelationView({
  entries,
  correlationId,
  onBack,
}: {
  entries: ActivityLogEntry[];
  correlationId: string;
  onBack: () => void;
}) {
  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      <header className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Related Activities</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            ID: <span className="font-mono">{correlationId}</span>
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div key={entry.id} className="relative">
            {i < entries.length - 1 && (
              <div className="absolute left-5 top-14 bottom-0 w-0.5 bg-white/10" />
            )}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-lg">
                {i + 1}
              </div>
              <div className="flex-1">
                <ActivityLogCard entry={entry} delay={i * 0.05} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}