/**
 * AUTOMATION CONTROL PANEL — Phase B4
 * Read-only observability layer over B1 (Recurring Collections),
 * B2 (Scheduled Payments), and B3 (Auto-Reconciliation Rules).
 *
 * ZERO buttons except Back. ZERO toggles. ZERO mutations.
 * Pure visibility for auditors and ops.
 *
 * Consumes existing data stores — no new data source.
 */

import { useMemo } from "react";
import {
  RefreshCw,
  CalendarClock,
  FileSearch,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";

// B1 — Recurring Collections
import {
  RECURRING_COLLECTIONS,
  type RecurringCollection,
  type RecurringRunRecord,
} from "../../../data/recurringCollections";

// B2 — Scheduled Payments
import {
  SCHEDULED_PAYMENTS,
  type ScheduledPayment,
} from "../../../data/scheduledPayments";

// B3 — Auto-Reconciliation Rules
import {
  AUTO_RECON_RULES,
  INFLOWS,
  EXPECTED_RECEIVABLES,
  executeRules,
  type AutoReconRule,
} from "../../../data/autoReconRules";

// Audit Events
import {
  AUDIT_EVENTS,
  type AuditEvent,
  getAuditSeverityConfig,
} from "../../../data/adminGovernance";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

// ============================================
// AGGREGATION FUNCTIONS — consume existing stores
// ============================================

function aggregateB1() {
  const all = RECURRING_COLLECTIONS;
  const active = all.filter((c) => c.status === "ACTIVE");
  const paused = all.filter((c) => c.status === "PAUSED");
  const allRuns = all.flatMap((c) => c.runHistory);
  const blocked = allRuns.filter((r) => r.outcome === "BLOCKED");
  const approvalPending = allRuns.filter((r) => r.outcome === "APPROVAL_PENDING");
  const missed = allRuns.filter((r) => r.outcome === "MISSED");
  const overdue = allRuns.filter((r) => r.outcome === "OVERDUE");

  // Latest execution timestamp
  const executed = allRuns.filter((r) => r.executedDate);
  const lastExecution = executed.length
    ? executed
        .map((r) => r.executedDate!)
        .sort()
        .pop()!
    : null;

  return {
    activeCount: active.length,
    pausedCount: paused.length,
    totalSchedules: all.length,
    totalRuns: allRuns.length,
    blockedRuns: blocked.length,
    approvalPendingRuns: approvalPending.length,
    missedRuns: missed.length,
    overdueRuns: overdue.length,
    lastExecution,
    status:
      blocked.length > 0
        ? ("PARTIALLY_BLOCKED" as const)
        : active.length > 0
        ? ("ACTIVE" as const)
        : ("INACTIVE" as const),
  };
}

function aggregateB2() {
  const all = SCHEDULED_PAYMENTS;
  const scheduled = all.filter((p) => p.outcome === "SCHEDULED");
  const executed = all.filter((p) => p.outcome === "EXECUTED");
  const blocked = all.filter((p) => p.outcome === "BLOCKED");
  const approvalRequired = all.filter((p) => p.outcome === "APPROVAL_REQUIRED");
  const cancelled = all.filter((p) => p.outcome === "CANCELLED");

  const lastExecution = executed.length
    ? executed
        .map((p) => p.executedAt!)
        .sort()
        .pop()!
    : null;

  return {
    scheduledCount: scheduled.length,
    executedCount: executed.length,
    blockedCount: blocked.length,
    approvalRequiredCount: approvalRequired.length,
    cancelledCount: cancelled.length,
    totalPayments: all.length,
    lastExecution,
    status:
      blocked.length > 0
        ? ("PARTIALLY_BLOCKED" as const)
        : scheduled.length > 0
        ? ("ACTIVE" as const)
        : ("INACTIVE" as const),
  };
}

function aggregateB3() {
  const all = AUTO_RECON_RULES;
  const enabled = all.filter((r) => r.status === "ENABLED");
  const disabled = all.filter((r) => r.status === "DISABLED");

  // Run rules to get current exception count
  const { results } = executeRules(
    [...INFLOWS],
    [...EXPECTED_RECEIVABLES],
    [...all]
  );
  const matchedCount = results.filter((r) => r.matched).length;
  const exceptionCount = results.filter((r) => !r.matched).length;

  // Last run
  const runsWithTimestamp = all.filter((r) => r.matchStats.lastRunAt);
  const lastExecution = runsWithTimestamp.length
    ? runsWithTimestamp
        .map((r) => r.matchStats.lastRunAt!)
        .sort()
        .pop()!
    : null;

  return {
    enabledCount: enabled.length,
    disabledCount: disabled.length,
    totalRules: all.length,
    matchedCount,
    exceptionCount,
    totalApplied: all.reduce((sum, r) => sum + r.matchStats.appliedCount, 0),
    totalFailed: all.reduce((sum, r) => sum + r.matchStats.failedCount, 0),
    lastExecution,
    status:
      enabled.length === 0
        ? ("INACTIVE" as const)
        : disabled.length > 0
        ? ("PARTIALLY_BLOCKED" as const)
        : ("ACTIVE" as const),
  };
}

function getAutomationAuditEvents(): AuditEvent[] {
  // Filter for governance enforcement events that relate to automation
  return AUDIT_EVENTS
    .filter((e) => {
      const details = e.details || {};
      const tag = details.enforcementTag;
      const label = (details.actionLabel || "").toLowerCase();
      const serviceType = details.serviceType || "";

      // Must be governance enforcement event
      if (tag !== "GOVERNANCE_ENFORCEMENT") return false;

      // Automation-related keywords
      const automationKeywords = [
        "recurring",
        "collection",
        "schedule",
        "scheduled payment",
        "outflow",
        "auto-recon",
        "reconciliation rule",
        "matching rule",
      ];

      return (
        automationKeywords.some((kw) => label.includes(kw)) ||
        serviceType === "OTHER" // B3 uses serviceType OTHER
      );
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

// ============================================
// STATUS BADGE HELPER
// ============================================

function statusConfig(status: "ACTIVE" | "PARTIALLY_BLOCKED" | "INACTIVE") {
  const map = {
    ACTIVE: {
      label: "Active",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      dot: "bg-emerald-400",
    },
    PARTIALLY_BLOCKED: {
      label: "Partially Blocked",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      dot: "bg-amber-400",
    },
    INACTIVE: {
      label: "Inactive",
      bg: "bg-white/5",
      text: "text-white/40",
      border: "border-white/10",
      dot: "bg-white/30",
    },
  };
  return map[status];
}

// ============================================
// COMPONENT
// ============================================

export default function AutomationControlPanel() {
  const b1 = useMemo(() => aggregateB1(), []);
  const b2 = useMemo(() => aggregateB2(), []);
  const b3 = useMemo(() => aggregateB3(), []);
  const auditFeed = useMemo(() => getAutomationAuditEvents(), []);

  // Risk & Block Summary aggregates
  const totalBlocked = b1.blockedRuns + b2.blockedCount;
  const totalApprovalRequired =
    b1.approvalPendingRuns + b2.approvalRequiredCount;
  const totalExceptions = b3.exceptionCount + b1.missedRuns + b1.overdueRuns;

  return (
    <div className="space-y-6">
      {/* Section 1: Automation Inventory */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Automation Inventory
        </p>

        <div className="space-y-3">
          {/* B1 — Recurring Collections */}
          <InventoryCard
            delay={0.05}
            icon={RefreshCw}
            title="Recurring Collections"
            phase="B1"
            status={b1.status}
            stats={[
              { label: "Active Schedules", value: String(b1.activeCount) },
              { label: "Paused", value: String(b1.pausedCount) },
              { label: "Total Runs", value: String(b1.totalRuns) },
            ]}
            lastExecution={b1.lastExecution}
          />

          {/* B2 — Scheduled Payments */}
          <InventoryCard
            delay={0.1}
            icon={CalendarClock}
            title="Scheduled Payments"
            phase="B2"
            status={b2.status}
            stats={[
              { label: "Pending", value: String(b2.scheduledCount) },
              { label: "Executed", value: String(b2.executedCount) },
              { label: "Blocked", value: String(b2.blockedCount) },
            ]}
            lastExecution={b2.lastExecution}
          />

          {/* B3 — Auto-Reconciliation Rules */}
          <InventoryCard
            delay={0.15}
            icon={FileSearch}
            title="Auto-Reconciliation Rules"
            phase="B3"
            status={b3.status}
            stats={[
              { label: "Enabled Rules", value: String(b3.enabledCount) },
              { label: "Matched", value: String(b3.matchedCount) },
              { label: "Exceptions", value: String(b3.exceptionCount) },
            ]}
            lastExecution={b3.lastExecution}
          />
        </div>
      </div>

      {/* Section 2: Risk & Block Summary */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Risk & Block Summary
        </p>

        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
            className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-center"
          >
            <ShieldAlert size={14} className="text-cyan-400 mx-auto mb-2" />
            <p className="text-lg text-white font-serif">{totalBlocked}</p>
            <p className="text-[8px] text-white/30 uppercase tracking-wider mt-1">
              Blocked by Governance
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.25 }}
            className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-center"
          >
            <Clock size={14} className="text-cyan-400 mx-auto mb-2" />
            <p className="text-lg text-white font-serif">
              {totalApprovalRequired}
            </p>
            <p className="text-[8px] text-white/30 uppercase tracking-wider mt-1">
              Required Approval
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.3 }}
            className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-center"
          >
            <AlertTriangle size={14} className="text-cyan-400 mx-auto mb-2" />
            <p className="text-lg text-white font-serif">{totalExceptions}</p>
            <p className="text-[8px] text-white/30 uppercase tracking-wider mt-1">
              Manual Handling
            </p>
          </motion.div>
        </div>

        {/* Factual prose — no suggestions, no warnings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.35 }}
          className="mt-3 p-4 rounded-[20px] bg-white/[0.03] border border-white/5"
        >
          <p className="text-[10px] text-white/40 leading-relaxed">
            {totalBlocked} automated execution
            {totalBlocked !== 1 ? "s were" : " was"} blocked by governance
            rules.{" "}
            {totalApprovalRequired} execution
            {totalApprovalRequired !== 1 ? "s" : ""} required approval before
            proceeding.{" "}
            {totalExceptions} item
            {totalExceptions !== 1 ? "s were" : " was"} routed for manual
            handling.
          </p>
        </motion.div>
      </div>

      {/* Section 3: Automation Activity Feed */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Automation Activity Feed
        </p>

        {auditFeed.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING, delay: 0.4 }}
            className="p-6 rounded-[28px] bg-white/[0.03] border border-white/5 text-center"
          >
            <p className="text-[11px] text-white/30">
              No automation-specific governance events recorded yet.
              Events appear here when governance blocks, approves, or logs
              actions on recurring collections, scheduled payments, or
              reconciliation rules.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {auditFeed.slice(0, 20).map((event, i) => {
              const sevCfg = getAuditSeverityConfig(event.severity);
              const time = new Date(event.timestamp);
              const timeStr = time.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              // Determine automation group
              const label = (
                event.details?.actionLabel || ""
              ).toLowerCase();
              let group = "Automation";
              if (
                label.includes("recurring") ||
                label.includes("collection")
              ) {
                group = "Collections";
              } else if (
                label.includes("scheduled") ||
                label.includes("outflow")
              ) {
                group = "Payments";
              } else if (
                label.includes("recon") ||
                label.includes("matching")
              ) {
                group = "Reconciliation";
              }

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: 0.4 + i * 0.03 }}
                  className={`p-3.5 rounded-[20px] border backdrop-blur-[45px] ${sevCfg.bg} ${sevCfg.border}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="pt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${sevCfg.dot}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${sevCfg.bg} ${sevCfg.text}`}
                        >
                          {event.severity}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/5 text-white/50">
                          {group}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/70 leading-relaxed mb-1 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-white/30">
                        <span>{event.actorName}</span>
                        <span>·</span>
                        <span className="capitalize">{event.actorRole}</span>
                        <span>·</span>
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Per-Module Breakdown */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Per-Module Breakdown
        </p>

        {/* B1 Breakdown */}
        <ModuleBreakdown
          delay={0.5}
          title="Recurring Collections"
          rows={[
            { label: "Active schedules", value: String(b1.activeCount) },
            { label: "Paused schedules", value: String(b1.pausedCount) },
            { label: "Total collection runs", value: String(b1.totalRuns) },
            {
              label: "Runs blocked by governance",
              value: String(b1.blockedRuns),
              isRisk: b1.blockedRuns > 0,
            },
            {
              label: "Runs pending approval",
              value: String(b1.approvalPendingRuns),
              isRisk: b1.approvalPendingRuns > 0,
            },
            {
              label: "Missed collections",
              value: String(b1.missedRuns),
              isRisk: b1.missedRuns > 0,
            },
            {
              label: "Overdue collections",
              value: String(b1.overdueRuns),
              isRisk: b1.overdueRuns > 0,
            },
          ]}
        />

        {/* B2 Breakdown */}
        <ModuleBreakdown
          delay={0.55}
          title="Scheduled Payments"
          rows={[
            { label: "Pending execution", value: String(b2.scheduledCount) },
            { label: "Successfully executed", value: String(b2.executedCount) },
            {
              label: "Blocked by governance",
              value: String(b2.blockedCount),
              isRisk: b2.blockedCount > 0,
            },
            {
              label: "Approval required",
              value: String(b2.approvalRequiredCount),
              isRisk: b2.approvalRequiredCount > 0,
            },
            { label: "Cancelled", value: String(b2.cancelledCount) },
          ]}
        />

        {/* B3 Breakdown */}
        <ModuleBreakdown
          delay={0.6}
          title="Auto-Reconciliation Rules"
          rows={[
            { label: "Enabled rules", value: String(b3.enabledCount) },
            { label: "Disabled rules", value: String(b3.disabledCount) },
            {
              label: "Total historical matches",
              value: String(b3.totalApplied),
            },
            {
              label: "Total historical failures",
              value: String(b3.totalFailed),
              isRisk: b3.totalFailed > 0,
            },
            {
              label: "Current inflow matches",
              value: String(b3.matchedCount),
            },
            {
              label: "Current exceptions",
              value: String(b3.exceptionCount),
              isRisk: b3.exceptionCount > 0,
            },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function InventoryCard({
  delay,
  icon: Icon,
  title,
  phase,
  status,
  stats,
  lastExecution,
}: {
  delay: number;
  icon: any;
  title: string;
  phase: string;
  status: "ACTIVE" | "PARTIALLY_BLOCKED" | "INACTIVE";
  stats: { label: string; value: string }[];
  lastExecution: string | null;
}) {
  const cfg = statusConfig(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
          <Icon size={16} className="text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm text-white font-semibold">{title}</p>
            <span className="text-[8px] text-white/20 font-mono">{phase}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            <span
              className={`text-[9px] uppercase tracking-[0.15em] font-bold ${cfg.text}`}
            >
              {cfg.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[11px] text-white/80 font-semibold">
              {stat.value}
            </p>
            <p className="text-[8px] text-white/30 uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Clock size={10} className="text-white/20" />
          <p className="text-[9px] text-white/20">
            Last execution:{" "}
            {lastExecution
              ? new Date(lastExecution).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "No execution recorded"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ModuleBreakdown({
  delay,
  title,
  rows,
}: {
  delay: number;
  title: string;
  rows: { label: string; value: string; isRisk?: boolean }[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className="mb-3 p-4 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
    >
      <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-1 border-b border-white/[0.03] last:border-0"
          >
            <span className="text-[10px] text-white/40">{row.label}</span>
            <span
              className={`text-[10px] font-semibold ${
                row.isRisk ? "text-amber-400" : "text-white/60"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}