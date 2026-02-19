import { useState, useMemo } from "react";
import { ArrowLeft, Shield, TrendingUp, AlertTriangle, CheckCircle, Eye, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import {
  calculateApprovalHealth,
  calculateUserRiskExposure,
  calculateReconciliationPressure,
  calculateVAMReceivableRisk,
  calculateSystemIntegrity,
  formatAmount,
  getHealthBadge,
  type ApprovalHealthMetrics,
  type UserRiskExposure,
  type ReconciliationPressure,
  type VAMReceivableRisk,
  type SystemIntegritySignals,
} from "../../../data/adminInsights";

interface AdminInsightScreenProps {
  onBack: () => void;
}

type ViewMode = "overview" | "approvals" | "users" | "reconciliation" | "vam" | "integrity";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function AdminInsightScreen({ onBack }: AdminInsightScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  // Calculate all metrics
  const approvalHealth = useMemo(() => calculateApprovalHealth(), []);
  const userRisks = useMemo(() => calculateUserRiskExposure(), []);
  const reconciliationPressure = useMemo(() => calculateReconciliationPressure(), []);
  const vamRisk = useMemo(() => calculateVAMReceivableRisk(), []);
  const systemIntegrity = useMemo(() => calculateSystemIntegrity(), []);

  const renderContent = () => {
    switch (viewMode) {
      case "approvals":
        return <ApprovalHealthView metrics={approvalHealth} />;
      case "users":
        return <UserRiskView risks={userRisks} />;
      case "reconciliation":
        return <ReconciliationPressureView pressure={reconciliationPressure} />;
      case "vam":
        return <VAMRiskView risk={vamRisk} />;
      case "integrity":
        return <SystemIntegrityView integrity={systemIntegrity} />;
      case "overview":
      default:
        return (
          <OverviewView
            approvalHealth={approvalHealth}
            userRisks={userRisks}
            reconciliationPressure={reconciliationPressure}
            vamRisk={vamRisk}
            systemIntegrity={systemIntegrity}
            onNavigate={setViewMode}
          />
        );
    }
  };

  const hasCriticalAlerts =
    approvalHealth.healthStatus === "CRITICAL" ||
    reconciliationPressure.pressureStatus === "CRITICAL" ||
    vamRisk.riskStatus === "CRITICAL" ||
    systemIntegrity.integrityStatus === "CRITICAL";

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
          <h1 className="text-3xl font-serif tracking-tight">Admin Control Tower</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            🔒 Read-Only Foresight • No Execution Power
          </p>
        </div>
      </header>

      {/* System-Wide Alert */}
      {hasCriticalAlerts && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="mb-6 p-4 rounded-[24px] bg-red-500/10 border border-red-500/30 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Critical System Alerts</p>
              <p className="text-xs text-white/70">Multiple areas require immediate attention</p>
            </div>
          </div>
        </motion.div>
      )}

      {renderContent()}
    </div>
  );
}

// ============================================
// OVERVIEW VIEW
// ============================================

function OverviewView({
  approvalHealth,
  userRisks,
  reconciliationPressure,
  vamRisk,
  systemIntegrity,
  onNavigate,
}: {
  approvalHealth: ApprovalHealthMetrics;
  userRisks: UserRiskExposure[];
  reconciliationPressure: ReconciliationPressure;
  vamRisk: VAMReceivableRisk;
  systemIntegrity: SystemIntegritySignals;
  onNavigate: (view: ViewMode) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Approval Health */}
      <InsightCard
        title="Approval Health"
        status={approvalHealth.healthStatus}
        icon="⏳"
        onClick={() => onNavigate("approvals")}
        delay={0}
      >
        <div className="grid grid-cols-2 gap-3">
          <MetricDisplay label="Pending" value={approvalHealth.totalPending.toString()} />
          <MetricDisplay label="Breaching SLA" value={approvalHealth.breachingSLA.toString()} />
          <MetricDisplay label="At Checker" value={approvalHealth.stuckAtChecker.toString()} />
          <MetricDisplay label="At Approver" value={approvalHealth.stuckAtApprover.toString()} />
        </div>
      </InsightCard>

      {/* User Risk Exposure */}
      <InsightCard
        title="User Risk Exposure"
        status={userRisks.length >= 3 ? "CRITICAL" : userRisks.length >= 1 ? "WARNING" : "HEALTHY"}
        icon="👥"
        onClick={() => onNavigate("users")}
        delay={0.05}
      >
        <div className="space-y-2">
          <MetricDisplay label="Users at Risk" value={userRisks.length.toString()} />
          {userRisks.slice(0, 2).map((risk, i) => (
            <div key={i} className="text-xs text-white/60">
              • {risk.name} - {risk.details}
            </div>
          ))}
        </div>
      </InsightCard>

      {/* Reconciliation Pressure */}
      <InsightCard
        title="Reconciliation Pressure"
        status={reconciliationPressure.pressureStatus}
        icon="⚖️"
        onClick={() => onNavigate("reconciliation")}
        delay={0.1}
      >
        <div className="grid grid-cols-2 gap-3">
          <MetricDisplay
            label="Unmatched Amount"
            value={formatAmount(reconciliationPressure.totalUnmatchedAmount)}
          />
          <MetricDisplay
            label="Aging 30+ Days"
            value={reconciliationPressure.itemsAging30Plus.toString()}
          />
        </div>
      </InsightCard>

      {/* VAM Receivable Risk */}
      <InsightCard
        title="VAM Receivable Risk"
        status={vamRisk.riskStatus}
        icon="💰"
        onClick={() => onNavigate("vam")}
        delay={0.15}
      >
        <div className="grid grid-cols-2 gap-3">
          <MetricDisplay
            label="Total Outstanding"
            value={formatAmount(vamRisk.totalOutstanding)}
          />
          <MetricDisplay
            label="Critical Clients"
            value={vamRisk.clientsCritical.toString()}
          />
        </div>
      </InsightCard>

      {/* System Integrity */}
      <InsightCard
        title="System Integrity"
        status={systemIntegrity.integrityStatus}
        icon="🛡️"
        onClick={() => onNavigate("integrity")}
        delay={0.2}
      >
        <div className="grid grid-cols-2 gap-3">
          <MetricDisplay
            label="Critical Risks"
            value={systemIntegrity.overallRiskSummary.critical.toString()}
          />
          <MetricDisplay
            label="High Risks"
            value={systemIntegrity.overallRiskSummary.high.toString()}
          />
        </div>
      </InsightCard>
    </div>
  );
}

// ============================================
// DETAIL VIEWS
// ============================================

function ApprovalHealthView({ metrics }: { metrics: ApprovalHealthMetrics }) {
  return (
    <div className="space-y-4">
      <StatusBanner status={metrics.healthStatus} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">Key Metrics</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailMetric label="Total Pending" value={metrics.totalPending.toString()} />
          <DetailMetric label="Avg. Approval Time" value={`${metrics.avgApprovalTimeHours}h`} />
          <DetailMetric label="Breaching SLA (>48h)" value={metrics.breachingSLA.toString()} />
          <DetailMetric label="Stuck at Checker" value={metrics.stuckAtChecker.toString()} />
          <DetailMetric label="Stuck at Approver" value={metrics.stuckAtApprover.toString()} />
        </div>
      </motion.div>

      <ReadOnlyNotice message="View full approval queue from Approvals screen" />
    </div>
  );
}

function UserRiskView({ risks }: { risks: UserRiskExposure[] }) {
  return (
    <div className="space-y-4">
      {risks.length === 0 ? (
        <EmptyState message="No user risks detected" />
      ) : (
        risks.map((risk, i) => <UserRiskCard key={risk.userId} risk={risk} delay={i * 0.05} />)
      )}
    </div>
  );
}

function ReconciliationPressureView({ pressure }: { pressure: ReconciliationPressure }) {
  return (
    <div className="space-y-4">
      <StatusBanner status={pressure.pressureStatus} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">Pressure Metrics</p>
        <div className="space-y-3">
          <DetailMetric
            label="Total Unmatched Amount"
            value={formatAmount(pressure.totalUnmatchedAmount)}
          />
          <DetailMetric
            label="Items Aging 30+ Days"
            value={pressure.itemsAging30Plus.toString()}
          />
          <DetailMetric
            label="Manual Overrides (7 days)"
            value={pressure.manualOverridesLast7Days.toString()}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">Confidence Distribution</p>
        <div className="space-y-3">
          <ConfidenceBar
            label="High (90-100%)"
            count={pressure.confidenceDistribution.high}
            color="emerald"
          />
          <ConfidenceBar
            label="Medium (70-89%)"
            count={pressure.confidenceDistribution.medium}
            color="amber"
          />
          <ConfidenceBar
            label="Low (<70%)"
            count={pressure.confidenceDistribution.low}
            color="red"
          />
        </div>
      </motion.div>

      <ReadOnlyNotice message="Resolve exceptions from Reconciliation screen" />
    </div>
  );
}

function VAMRiskView({ risk }: { risk: VAMReceivableRisk }) {
  return (
    <div className="space-y-4">
      <StatusBanner status={risk.riskStatus} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">Receivable Metrics</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailMetric label="Total Outstanding" value={formatAmount(risk.totalOutstanding)} />
          <DetailMetric label="Critical Clients" value={risk.clientsCritical.toString()} />
          <DetailMetric
            label="Partial Payment Frequency"
            value={risk.partialPaymentFrequency.toString()}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">Top 5 Risky Clients</p>
        <div className="space-y-3">
          {risk.top5RiskyClients.map((client, i) => (
            <RiskyClientCard key={i} client={client} rank={i + 1} delay={0.15 + i * 0.05} />
          ))}
        </div>
      </motion.div>

      <ReadOnlyNotice message="Manage clients from VAM screen" />
    </div>
  );
}

function SystemIntegrityView({ integrity }: { integrity: SystemIntegritySignals }) {
  return (
    <div className="space-y-4">
      <StatusBanner status={integrity.integrityStatus} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">Security Signals</p>
        <div className="space-y-3">
          <DetailMetric
            label="Role Violations Blocked"
            value={integrity.roleViolationsBlocked.toString()}
          />
          <DetailMetric
            label="Approval Rejections Spike"
            value={integrity.approvalRejectionsSpike ? "YES" : "NO"}
          />
          <DetailMetric
            label="Beneficiary Changes + Payments"
            value={integrity.beneficiaryChangesWithPayments.toString()}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="p-6 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">Overall Risk Summary</p>
        <div className="space-y-3">
          <RiskBar label="Critical" count={integrity.overallRiskSummary.critical} color="red" />
          <RiskBar label="High" count={integrity.overallRiskSummary.high} color="orange" />
          <RiskBar label="Medium" count={integrity.overallRiskSummary.medium} color="amber" />
          <RiskBar label="Low" count={integrity.overallRiskSummary.low} color="blue" />
        </div>
      </motion.div>

      <ReadOnlyNotice message="View detailed risks from Risk Dashboard" />
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function InsightCard({
  title,
  status,
  icon,
  onClick,
  delay,
  children,
}: {
  title: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  icon: string;
  onClick: () => void;
  delay: number;
  children: React.ReactNode;
}) {
  const statusColors = {
    CRITICAL: { border: "border-red-500/30", bg: "bg-red-500/10" },
    WARNING: { border: "border-amber-500/30", bg: "bg-amber-500/10" },
    HEALTHY: { border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  };

  const colors = statusColors[status];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full p-5 rounded-[28px] border backdrop-blur-[45px] text-left transition-all hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] ${colors.border} ${colors.bg}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getHealthBadge(status)}`}>
          {status}
        </span>
      </div>
      {children}
      <div className="flex items-center gap-2 mt-4 text-xs text-cyan-400 font-medium">
        <Eye size={14} />
        <span>View Details</span>
        <ArrowRight size={14} className="ml-auto" />
      </div>
    </motion.button>
  );
}

function MetricDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function StatusBanner({ status }: { status: "HEALTHY" | "WARNING" | "CRITICAL" }) {
  const config = {
    HEALTHY: {
      bg: "bg-emerald-500/10 border-emerald-500/30",
      icon: <CheckCircle size={20} className="text-emerald-400" />,
      message: "System operating normally",
    },
    WARNING: {
      bg: "bg-amber-500/10 border-amber-500/30",
      icon: <TrendingUp size={20} className="text-amber-400" />,
      message: "Requires monitoring",
    },
    CRITICAL: {
      bg: "bg-red-500/10 border-red-500/30",
      icon: <AlertTriangle size={20} className="text-red-400" />,
      message: "Immediate attention required",
    },
  };

  const c = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING}
      className={`p-4 rounded-[24px] border backdrop-blur-xl ${c.bg}`}
    >
      <div className="flex items-center gap-3">
        {c.icon}
        <div>
          <p className="font-semibold text-white text-sm">Status: {status}</p>
          <p className="text-xs text-white/70">{c.message}</p>
        </div>
      </div>
    </motion.div>
  );
}

function UserRiskCard({ risk, delay }: { risk: UserRiskExposure; delay: number }) {
  const severityColors = {
    CRITICAL: { border: "border-red-500/30", bg: "bg-red-500/10" },
    HIGH: { border: "border-orange-500/30", bg: "bg-orange-500/10" },
    MEDIUM: { border: "border-amber-500/30", bg: "bg-amber-500/10" },
    LOW: { border: "border-blue-500/30", bg: "bg-blue-500/10" },
  };

  const colors = severityColors[risk.severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay }}
      className={`p-5 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] ${colors.border} ${colors.bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white">{risk.name}</h4>
          <p className="text-xs text-white/60 uppercase">{risk.role}</p>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/10 text-white">
          {risk.severity}
        </span>
      </div>
      <p className="text-sm text-white/80 mb-3">{risk.details}</p>
      <span className="text-xs font-semibold text-cyan-400 uppercase">
        {risk.riskType.replace(/_/g, " ")}
      </span>
    </motion.div>
  );
}

function RiskyClientCard({ client, rank, delay }: { client: any; rank: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING, delay }}
      className="flex items-center justify-between p-4 rounded-[20px] bg-white/5"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-white/40">#{rank}</span>
        <div>
          <p className="font-semibold text-white text-sm">{client.clientName}</p>
          <p className="text-xs text-white/60">
            {client.overdueDays > 0 ? `${client.overdueDays} days overdue` : "Current"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-white text-sm">{formatAmount(client.outstandingAmount)}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getHealthBadge(client.status)}`}>
          {client.status}
        </span>
      </div>
    </motion.div>
  );
}

function ConfidenceBar({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "emerald" | "amber" | "red";
}) {
  const colors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/70">{label}</span>
        <span className="text-xs font-bold text-white">{count}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(count / 11) * 100}%` }}
          transition={{ ...SPRING, delay: 0.2 }}
          className={`h-full ${colors[color]}`}
        />
      </div>
    </div>
  );
}

function RiskBar({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "red" | "orange" | "amber" | "blue";
}) {
  const colors = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/70">{label}</span>
        <span className="text-xs font-bold text-white">{count}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((count / 5) * 100, 100)}%` }}
          transition={{ ...SPRING, delay: 0.2 }}
          className={`h-full ${colors[color]}`}
        />
      </div>
    </div>
  );
}

function ReadOnlyNotice({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...SPRING, delay: 0.3 }}
      className="p-4 rounded-[24px] bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2">
        <Shield size={14} className="text-blue-400" />
        <p className="text-xs text-white/90 font-medium">
          🔒 Read-only view • {message}
        </p>
      </div>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING}
      className="p-12 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] text-center"
    >
      <CheckCircle size={48} className="text-emerald-400 mb-3 mx-auto" />
      <p className="text-white/70">{message}</p>
    </motion.div>
  );
}
