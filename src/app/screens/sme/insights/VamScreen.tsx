import { useState, useMemo } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  calculateReceivableLedger,
  generateOverdueBuckets,
  getAllRiskSignals,
  formatAmount,
  formatDate,
  getStatusBadge,
  CLIENT_INFLOWS,
  type ReceivableLedger,
  type ClientStatus,
} from "../../../data/vamIntelligence";

interface VamScreenProps {
  onBack: () => void;
}

type ViewMode = "overview" | "clients" | "inflows" | "risks";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function VamScreen({ onBack }: VamScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Calculate intelligence data
  const ledgers = useMemo(() => calculateReceivableLedger(), []);
  const overdueBuckets = useMemo(() => generateOverdueBuckets(), []);
  const riskSignals = useMemo(() => getAllRiskSignals(), []);

  // Calculate summary stats
  const totalOutstanding = ledgers.reduce(
    (sum, l) => sum + l.outstandingBalance,
    0
  );
  const totalOverdue = ledgers.reduce((sum, l) => sum + l.overdueAmount, 0);
  const criticalClients = ledgers.filter((l) => l.status === "CRITICAL").length;
  const unmatchedInflows = CLIENT_INFLOWS.filter((i) => !i.matched).length;

  // Render main content based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case "clients":
        return <ClientsView ledgers={ledgers} onSelectClient={setSelectedClient} />;
      case "inflows":
        return <InflowsView />;
      case "risks":
        return <RisksView signals={riskSignals} />;
      case "overview":
      default:
        return (
          <OverviewView
            ledgers={ledgers}
            overdueBuckets={overdueBuckets}
            riskSignals={riskSignals}
            stats={{
              totalOutstanding,
              totalOverdue,
              criticalClients,
              unmatchedInflows,
            }}
            onNavigate={setViewMode}
          />
        );
    }
  };

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Header */}
      <header className="flex items-center gap-4 mb-10">
        <button 
          onClick={viewMode === "overview" ? onBack : () => setViewMode("overview")}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">VAM Intelligence</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Receivable Control & Client Insights
          </p>
        </div>
      </header>

      {renderContent()}
    </div>
  );
}

// ============================================
// OVERVIEW VIEW
// ============================================

function OverviewView({
  ledgers,
  overdueBuckets,
  riskSignals,
  stats,
  onNavigate,
}: {
  ledgers: ReceivableLedger[];
  overdueBuckets: any[];
  riskSignals: any[];
  stats: {
    totalOutstanding: number;
    totalOverdue: number;
    criticalClients: number;
    unmatchedInflows: number;
  };
  onNavigate: (view: ViewMode) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<DollarSign size={18} className="text-blue-400" />}
          label="Total Outstanding"
          value={formatAmount(stats.totalOutstanding)}
          color="blue"
          delay={0}
        />
        <MetricCard
          icon={<TrendingDown size={18} className="text-red-400" />}
          label="Overdue Amount"
          value={formatAmount(stats.totalOverdue)}
          color="red"
          delay={0.05}
        />
        <MetricCard
          icon={<AlertTriangle size={18} className="text-amber-400" />}
          label="Critical Clients"
          value={stats.criticalClients.toString()}
          color="amber"
          delay={0.1}
        />
        <MetricCard
          icon={<XCircle size={18} className="text-purple-400" />}
          label="Unmatched Inflows"
          value={stats.unmatchedInflows.toString()}
          color="purple"
          delay={0.15}
        />
      </div>

      {/* Overdue Buckets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">Overdue Analysis</p>
          <Clock size={16} className="text-white/40" />
        </div>

        <div className="space-y-3">
          {overdueBuckets.map((bucket, index) => (
            <OverdueBucketCard key={index} bucket={bucket} delay={0.25 + index * 0.05} />
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <ActionButton
          icon={<Users size={18} className="text-blue-400" />}
          label="View All Clients"
          description={`${ledgers.length} active clients`}
          onClick={() => onNavigate("clients")}
          color="blue"
          delay={0.35}
        />

        <ActionButton
          icon={<DollarSign size={18} className="text-purple-400" />}
          label="Inflow Management"
          description={`${stats.unmatchedInflows} need attention`}
          onClick={() => onNavigate("inflows")}
          color="purple"
          delay={0.4}
        />

        <ActionButton
          icon={<AlertTriangle size={18} className="text-red-400" />}
          label="Risk Signals"
          description={`${riskSignals.length} active alerts`}
          onClick={() => onNavigate("risks")}
          color="red"
          delay={0.45}
        />
      </div>
    </div>
  );
}

// ============================================
// CLIENTS VIEW
// ============================================

function ClientsView({
  ledgers,
  onSelectClient,
}: {
  ledgers: ReceivableLedger[];
  onSelectClient: (clientId: string) => void;
}) {
  const [filter, setFilter] = useState<"ALL" | ClientStatus>("ALL");

  const filteredLedgers = useMemo(() => {
    if (filter === "ALL") return ledgers;
    return ledgers.filter((l) => l.status === filter);
  }, [ledgers, filter]);

  const counts = useMemo(() => {
    return {
      ALL: ledgers.length,
      HEALTHY: ledgers.filter((l) => l.status === "HEALTHY").length,
      WARNING: ledgers.filter((l) => l.status === "WARNING").length,
      CRITICAL: ledgers.filter((l) => l.status === "CRITICAL").length,
    };
  }, [ledgers]);

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <FilterPill
          label="All"
          count={counts.ALL}
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          color="gray"
        />
        <FilterPill
          label="Healthy"
          count={counts.HEALTHY}
          active={filter === "HEALTHY"}
          onClick={() => setFilter("HEALTHY")}
          color="emerald"
        />
        <FilterPill
          label="Warning"
          count={counts.WARNING}
          active={filter === "WARNING"}
          onClick={() => setFilter("WARNING")}
          color="amber"
        />
        <FilterPill
          label="Critical"
          count={counts.CRITICAL}
          active={filter === "CRITICAL"}
          onClick={() => setFilter("CRITICAL")}
          color="red"
        />
      </div>

      {/* Client Cards */}
      <div className="space-y-3">
        {filteredLedgers.map((ledger, i) => (
          <ClientCard key={ledger.clientId} ledger={ledger} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// INFLOWS VIEW
// ============================================

function InflowsView() {
  const [showUnmatchedOnly, setShowUnmatchedOnly] = useState(false);

  const inflows = useMemo(() => {
    if (showUnmatchedOnly) {
      return CLIENT_INFLOWS.filter((i) => !i.matched);
    }
    return CLIENT_INFLOWS;
  }, [showUnmatchedOnly]);

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between p-4 rounded-[24px] bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl">
        <span className="text-sm font-medium text-white">
          Show unmatched only
        </span>
        <button
          onClick={() => setShowUnmatchedOnly(!showUnmatchedOnly)}
          className={`w-12 h-6 rounded-full transition-colors relative ${
            showUnmatchedOnly ? "bg-blue-500" : "bg-white/20"
          }`}
        >
          <motion.div
            layout
            transition={SPRING}
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg ${
              showUnmatchedOnly ? "left-6" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Inflow List */}
      <div className="space-y-3">
        {inflows.map((inflow, i) => (
          <InflowCard key={inflow.id} inflow={inflow} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// RISKS VIEW
// ============================================

function RisksView({ signals }: { signals: any[] }) {
  return (
    <div className="space-y-3">
      {signals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          className="p-12 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] text-center"
        >
          <CheckCircle size={48} className="text-emerald-400 mb-3 mx-auto" />
          <p className="text-white font-semibold mb-1">No Active Risk Signals</p>
          <p className="text-sm text-white/60">All clients performing well</p>
        </motion.div>
      ) : (
        signals.map((signal, i) => <RiskSignalCard key={signal.id} signal={signal} delay={i * 0.05} />)
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function MetricCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "red" | "amber" | "purple";
  delay: number;
}) {
  const colors = {
    blue: { border: "border-blue-500/30", bg: "bg-blue-500/10" },
    red: { border: "border-red-500/30", bg: "bg-red-500/10" },
    amber: { border: "border-amber-500/30", bg: "bg-amber-500/10" },
    purple: { border: "border-purple-500/30", bg: "bg-purple-500/10" },
  };

  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING, delay }}
      className={`p-4 rounded-[24px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] ${c.border} ${c.bg}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-white/70">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function OverdueBucketCard({ bucket, delay }: { bucket: any; delay: number }) {
  const colors = {
    "1-7": { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400" },
    "8-30": { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400" },
    "30+": { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-400" },
  };

  const color = colors[bucket.range as keyof typeof colors];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay }}
      className={`p-4 rounded-[20px] border ${color.border} ${color.bg} backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${color.text}`}>{bucket.label}</span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
          {bucket.count} clients
        </span>
      </div>
      <p className="text-xl font-bold text-white">{formatAmount(bucket.totalAmount)}</p>
    </motion.div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color: "blue" | "purple" | "red";
  delay: number;
}) {
  const colors = {
    blue: { border: "border-blue-500/20", bg: "bg-blue-500/10" },
    purple: { border: "border-purple-500/20", bg: "bg-purple-500/10" },
    red: { border: "border-red-500/20", bg: "bg-red-500/10" },
  };

  const c = colors[color];

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full p-4 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all hover:bg-white/10 text-left ${c.border} ${c.bg}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-white/5">{icon}</div>
        <div className="flex-1">
          <p className="font-semibold text-white mb-1">{label}</p>
          <p className="text-xs text-white/60">{description}</p>
        </div>
        <ArrowRight size={18} className="text-white/40" />
      </div>
    </motion.button>
  );
}

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
  color: "gray" | "emerald" | "amber" | "red";
}) {
  const colors = {
    gray: active
      ? "bg-white/20 text-white border-white/30"
      : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10",
    emerald: active
      ? "bg-emerald-500/30 text-emerald-300 border-emerald-500/50"
      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
    amber: active
      ? "bg-amber-500/30 text-amber-300 border-amber-500/50"
      : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
    red: active
      ? "bg-red-500/30 text-red-300 border-red-500/50"
      : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
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

function ClientCard({ ledger, delay }: { ledger: ReceivableLedger; delay: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className="p-5 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{ledger.clientName}</h4>
          <p className="text-xs text-white/60">{ledger.virtualAccountId}</p>
        </div>
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusBadge(ledger.status)}`}>
          {ledger.status}
        </span>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-white/60 mb-1">Outstanding</p>
          <p className="text-sm font-bold text-white">
            {formatAmount(ledger.outstandingBalance)}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/60 mb-1">Overdue</p>
          <p className="text-sm font-bold text-red-400">
            {formatAmount(ledger.overdueAmount)}
          </p>
        </div>
      </div>

      {/* Risk Flags */}
      {ledger.riskFlags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {ledger.riskFlags.map((flag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30"
            >
              {flag.replace("_", " ")}
            </span>
          ))}
        </div>
      )}

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-cyan-400 font-medium hover:text-cyan-300"
      >
        {expanded ? "Hide Details" : "Show Details"}
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="mt-3 pt-3 border-t border-white/10 space-y-2 overflow-hidden"
          >
            <DetailRow label="Expected Amount" value={formatAmount(ledger.expectedAmount)} />
            <DetailRow label="Received Amount" value={formatAmount(ledger.receivedAmount)} />
            <DetailRow
              label="Last Payment"
              value={
                ledger.lastPaymentDate
                  ? `${formatAmount(ledger.lastPaymentAmount)} on ${formatDate(
                      ledger.lastPaymentDate
                    )}`
                  : "No payments yet"
              }
            />
            <DetailRow label="Payment Pattern" value={ledger.paymentPattern} />
            {ledger.overdueDays > 0 && (
              <DetailRow label="Overdue Days" value={`${ledger.overdueDays} days`} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InflowCard({ inflow, delay }: { inflow: any; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className={`p-5 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] ${
        inflow.matched
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-amber-500/30 bg-amber-500/10"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white mb-1">
            {inflow.clientName}
          </p>
          <p className="text-xs text-white/60">{inflow.description}</p>
        </div>
        {inflow.matched ? (
          <CheckCircle size={16} className="text-emerald-400" />
        ) : (
          <XCircle size={16} className="text-amber-400" />
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xl font-bold text-white">
          {formatAmount(inflow.amount)}
        </span>
        <span className="text-xs text-white/60">
          {formatDate(inflow.date)}
        </span>
      </div>

      {/* Confidence Badge */}
      <div className="flex items-center gap-2">
        <span
          className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
            inflow.confidence >= 90
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : inflow.confidence >= 70
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}
        >
          {inflow.confidence}% confidence
        </span>
        {inflow.invoiceNumber && (
          <span className="text-xs text-white/60">
            → {inflow.invoiceNumber}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function RiskSignalCard({ signal, delay }: { signal: any; delay: number }) {
  const severityColors = {
    LOW: { border: "border-blue-500/30", bg: "bg-blue-500/10" },
    MEDIUM: { border: "border-amber-500/30", bg: "bg-amber-500/10" },
    HIGH: { border: "border-red-500/30", bg: "bg-red-500/10" },
    CRITICAL: { border: "border-red-500/40", bg: "bg-red-500/20" },
  };

  const severityBadge = {
    LOW: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    MEDIUM: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    HIGH: "bg-red-500/20 text-red-400 border border-red-500/30",
    CRITICAL: "bg-red-500/30 text-red-300 border border-red-500/50",
  };

  const colors = severityColors[signal.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className={`p-5 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] ${colors.border} ${colors.bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{signal.clientName}</h4>
          <p className="text-sm text-white/80">{signal.description}</p>
        </div>
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${severityBadge[signal.severity]}`}>
          {signal.severity}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <AlertTriangle size={14} className="text-red-400" />
        <span className="text-xs text-white/60 uppercase font-semibold">
          {signal.signalType.replace(/_/g, " ")}
        </span>
      </div>

      {signal.amount && (
        <p className="text-xs text-white/60 mt-2">
          Amount: {formatAmount(signal.amount)}
        </p>
      )}
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-white/60">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}