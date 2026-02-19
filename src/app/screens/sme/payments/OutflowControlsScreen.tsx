/**
 * SCHEDULED PAYMENTS ENGINE — Phase B2
 * Single-run governed outflow delay (NOT recurring, NOT autopay)
 * // GOVERNANCE_ENFORCEMENT — All schedule actions hit governance engine
 *
 * Governance touchpoints:
 *  - Create schedule → enforceTransactionGate (method-mapped category)
 *  - Execute on date → enforceTransactionGate re-evaluation (never assumes prior approval)
 *  - Cancel schedule → enforceTransactionGate (role-check)
 *  - Every outcome emits immutable audit events
 */

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  CalendarClock,
  Send,
  Wallet,
  Smartphone,
  ArrowRightLeft,
  Shield,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  SCHEDULED_PAYMENTS,
  getTotalScheduledOutflow,
  getTotalExecutedOutflow,
  getOutcomeConfig,
  formatBDT,
  methodLabel,
  methodToCategory,
  getMinScheduleDate,
  getDefaultScheduleDate,
  type ScheduledPayment,
  type PaymentMethod,
  type ScheduleOutcome,
} from "../../../data/scheduledPayments";
import {
  enforceTransactionGate,
  type EnforcementResult,
} from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";
import { getCurrentUser } from "../../../mock/users";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface OutflowControlsScreenProps {
  onBack: () => void;
}

// ============================================
// PAYMENT METHOD ICON HELPER
// ============================================

function MethodIcon({ method, size = 16 }: { method: PaymentMethod; size?: number }) {
  switch (method) {
    case "OWN_ACCOUNT":
      return <ArrowRightLeft size={size} className="text-cyan-400" />;
    case "THIRD_PARTY":
      return <Send size={size} className="text-amber-400" />;
    case "MFS":
      return <Smartphone size={size} className="text-emerald-400" />;
  }
}

// ============================================
// SUB-VIEW: SCHEDULE LIST
// ============================================

function ScheduleList({
  schedules,
  onSelect,
  onNewSchedule,
  governanceResult,
  onDismissGovernance,
}: {
  schedules: ScheduledPayment[];
  onSelect: (s: ScheduledPayment) => void;
  onNewSchedule: () => void;
  governanceResult: EnforcementResult | null;
  onDismissGovernance: () => void;
}) {
  const [filter, setFilter] = useState<"all" | ScheduleOutcome>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? schedules
        : schedules.filter((s) => s.outcome === filter),
    [schedules, filter]
  );

  const pendingCount = schedules.filter((s) => s.outcome === "SCHEDULED").length;
  const executedCount = schedules.filter((s) => s.outcome === "EXECUTED").length;
  const totalScheduled = getTotalScheduledOutflow();
  const totalExecuted = getTotalExecutedOutflow();

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-2">
            Pending
          </p>
          <p className="text-2xl text-white font-serif">{pendingCount}</p>
          <p className="text-[10px] text-white/30 mt-1">{formatBDT(totalScheduled)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-emerald-400/80 font-bold mb-2">
            Executed
          </p>
          <p className="text-2xl text-white font-serif">{executedCount}</p>
          <p className="text-[10px] text-white/30 mt-1">{formatBDT(totalExecuted)}</p>
        </motion.div>
      </div>

      {/* Governance Bar */}
      {governanceResult && (
        <div className="mb-4">
          <GovernanceBar result={governanceResult} onDismiss={onDismissGovernance} />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(
          [
            "all",
            "SCHEDULED",
            "EXECUTED",
            "APPROVAL_REQUIRED",
            "BLOCKED",
            "CANCELLED",
          ] as const
        ).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold border transition-all ${
              filter === f
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "APPROVAL_REQUIRED"
              ? "Pending"
              : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* New Schedule Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.25 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNewSchedule}
        className="w-full mb-5 p-4 rounded-[28px] border border-dashed border-cyan-500/30 bg-cyan-500/5 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center gap-3 hover:bg-cyan-500/10 transition-all"
      >
        <div className="p-2 rounded-full bg-cyan-500/10">
          <Plus size={18} className="text-cyan-400" />
        </div>
        <div className="text-left">
          <p className="text-sm text-white font-semibold">Schedule Payment</p>
          <p className="text-[10px] text-white/50">
            Delay an outflow to a future date under governance
          </p>
        </div>
      </motion.button>

      {/* Schedule Cards */}
      <div className="space-y-3">
        {filtered.map((schedule, i) => {
          const outcomeCfg = getOutcomeConfig(schedule.outcome);

          return (
            <motion.button
              key={schedule.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.05 * i }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(schedule)}
              className={`w-full p-4 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-left transition-all hover:bg-white/5 ${outcomeCfg.border} bg-white/[0.03]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <MethodIcon method={schedule.paymentMethod} />
                  <div className="min-w-0">
                    <p className="text-sm text-white font-semibold truncate">
                      {schedule.beneficiaryName}
                    </p>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5 truncate">
                      {schedule.beneficiaryAccount}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold shrink-0 ${outcomeCfg.bg} ${outcomeCfg.text} border ${outcomeCfg.border}`}
                >
                  {outcomeCfg.label}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider">
                    Amount
                  </p>
                  <p className="text-white text-sm">{formatBDT(schedule.amount)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider">
                    Method
                  </p>
                  <p className="text-white text-sm">
                    {methodLabel(schedule.paymentMethod).split(" ")[0]}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider">
                    Date
                  </p>
                  <p className="text-white text-sm">{schedule.scheduledDate}</p>
                </div>
              </div>

              {/* Execution status indicator */}
              {schedule.outcome === "SCHEDULED" && (
                <p className="text-[10px] text-cyan-400/60 flex items-center gap-1">
                  <Clock size={10} />
                  Governance re-check on {schedule.scheduledDate}
                </p>
              )}
              {schedule.outcome === "BLOCKED" && schedule.executionBlockReason && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <p className="text-[10px] text-red-300/80 truncate">
                    {schedule.executionBlockReason}
                  </p>
                </div>
              )}
            </motion.button>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">
            No scheduled payments match this filter
          </div>
        )}
      </div>
    </>
  );
}

// ============================================
// SUB-VIEW: SCHEDULE DETAIL
// ============================================

function ScheduleDetail({
  schedule,
  onBack,
  onCancel,
  onExecuteCheck,
  governanceResult,
  onDismissGovernance,
}: {
  schedule: ScheduledPayment;
  onBack: () => void;
  onCancel: () => void;
  onExecuteCheck: () => void;
  governanceResult: EnforcementResult | null;
  onDismissGovernance: () => void;
}) {
  const [showAudit, setShowAudit] = useState(true);
  const outcomeCfg = getOutcomeConfig(schedule.outcome);

  // Collect all audit IDs for this schedule
  const auditTrail: { label: string; id: string; timestamp?: string }[] = [];
  auditTrail.push({
    label: "Creation",
    id: schedule.creationAuditId,
    timestamp: schedule.createdAt,
  });
  if (schedule.executionAuditId) {
    auditTrail.push({
      label: "Execution",
      id: schedule.executionAuditId,
      timestamp: schedule.executedAt,
    });
  }
  if (schedule.cancellationAuditId) {
    auditTrail.push({
      label: "Cancellation",
      id: schedule.cancellationAuditId,
      timestamp: schedule.cancelledAt,
    });
  }

  return (
    <>
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <MethodIcon method={schedule.paymentMethod} size={20} />
            <div>
              <p className="text-white font-semibold">{schedule.beneficiaryName}</p>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">
                {schedule.beneficiaryAccount}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold ${outcomeCfg.bg} ${outcomeCfg.text} border ${outcomeCfg.border}`}
          >
            {outcomeCfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Payment Amount
            </p>
            <p className="text-xl text-white font-serif">{formatBDT(schedule.amount)}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Method
            </p>
            <p className="text-sm text-white">{methodLabel(schedule.paymentMethod)}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Scheduled Date
            </p>
            <p className="text-sm text-cyan-400">{schedule.scheduledDate}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Source Account
            </p>
            <p className="text-[11px] text-white/80">{schedule.sourceAccount}</p>
          </div>
        </div>

        {/* Memo */}
        {schedule.memo && (
          <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Memo / Reference
            </p>
            <p className="text-[11px] text-white/70">{schedule.memo}</p>
          </div>
        )}

        {/* Cancel Reason */}
        {schedule.cancelReason && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-[9px] text-red-400/70 uppercase tracking-wider font-bold mb-1">
              Cancellation Reason
            </p>
            <p className="text-[11px] text-red-300/80">{schedule.cancelReason}</p>
            {schedule.cancelledByName && (
              <p className="text-[9px] text-white/30 mt-1.5">
                Cancelled by {schedule.cancelledByName} on{" "}
                {schedule.cancelledAt
                  ? new Date(schedule.cancelledAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            )}
          </div>
        )}

        {/* Execution block reason */}
        {schedule.executionBlockReason && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-[9px] text-red-400/70 uppercase tracking-wider font-bold mb-1">
              Execution Blocked
            </p>
            <p className="text-[11px] text-red-300/80">
              {schedule.executionBlockReason}
            </p>
          </div>
        )}
      </motion.div>

      {/* Lifecycle Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Lifecycle
        </p>

        <div className="space-y-3">
          {/* Created */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <CalendarClock size={12} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/80">Scheduled by {schedule.createdByName}</p>
              <p className="text-[9px] text-white/30">
                {new Date(schedule.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span
              className={`text-[8px] uppercase tracking-wider font-bold ${
                schedule.creationOutcome === "ALLOWED"
                  ? "text-emerald-400"
                  : schedule.creationOutcome === "APPROVAL_REQUIRED"
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {schedule.creationOutcome}
            </span>
          </div>

          {/* Approved (if applicable) */}
          {schedule.approvedByName && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 size={12} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/80">
                  Approved by {schedule.approvedByName}
                </p>
                {schedule.approvedAt && (
                  <p className="text-[9px] text-white/30">
                    {new Date(schedule.approvedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Executed */}
          {schedule.outcome === "EXECUTED" && schedule.executedAt && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Send size={12} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/80">Executed</p>
                <p className="text-[9px] text-white/30">
                  {new Date(schedule.executedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="text-[8px] uppercase tracking-wider font-bold text-emerald-400">
                ALLOWED
              </span>
            </div>
          )}

          {/* Blocked on execution */}
          {schedule.outcome === "BLOCKED" && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert size={12} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/80">
                  Skipped — governance blocked on execution day
                </p>
              </div>
              <span className="text-[8px] uppercase tracking-wider font-bold text-red-400">
                BLOCKED
              </span>
            </div>
          )}

          {/* Cancelled */}
          {schedule.outcome === "CANCELLED" && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <XCircle size={12} className="text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/80">
                  Cancelled{schedule.cancelledByName ? ` by ${schedule.cancelledByName}` : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Governance Bar */}
      {governanceResult && (
        <div className="mb-4">
          <GovernanceBar result={governanceResult} onDismiss={onDismissGovernance} />
        </div>
      )}

      {/* Action Buttons — Cancel / Execute Governance Check */}
      {schedule.outcome === "SCHEDULED" && (
        <>
          {/* // GOVERNANCE_ENFORCEMENT — Execution-day re-evaluation */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.15 }}
            whileTap={{ scale: 0.97 }}
            onClick={onExecuteCheck}
            className="w-full mb-3 p-4 rounded-[28px] border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 hover:bg-cyan-500/10 transition-all"
          >
            <Shield size={16} className="text-cyan-400" />
            <span className="text-sm text-cyan-300 font-semibold">
              Run Execution-Day Governance Check
            </span>
          </motion.button>

          {/* // GOVERNANCE_ENFORCEMENT — Cancel action */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            disabled={!!governanceResult}
            className="w-full mb-5 p-3.5 rounded-[28px] border border-red-500/20 bg-red-500/5 backdrop-blur-[45px] flex items-center justify-center gap-3 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <XCircle size={14} className="text-red-400" />
            <span className="text-[12px] text-red-300 font-semibold">
              Cancel Scheduled Payment
            </span>
          </motion.button>
        </>
      )}

      {/* Audit Trail */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.25 }}
        className="rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden"
      >
        <button
          onClick={() => setShowAudit(!showAudit)}
          className="w-full p-4 flex items-center justify-between"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Audit Trail ({auditTrail.length})
          </p>
          {showAudit ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </button>

        <AnimatePresence>
          {showAudit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {auditTrail.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] text-white/80">{entry.label}</p>
                      {entry.timestamp && (
                        <p className="text-[9px] text-white/30">
                          {new Date(entry.timestamp).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <p className="text-[8px] text-white/20 font-mono tracking-wider">
                      {entry.id}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ============================================
// SUB-VIEW: CREATE SCHEDULED PAYMENT
// ============================================

function CreateScheduleForm({
  onBack,
  onCreate,
  governanceResult,
  onDismissGovernance,
}: {
  onBack: () => void;
  onCreate: (data: {
    beneficiaryName: string;
    beneficiaryAccount: string;
    paymentMethod: PaymentMethod;
    sourceAccount: string;
    amount: number;
    scheduledDate: string;
    memo: string;
  }) => void;
  governanceResult: EnforcementResult | null;
  onDismissGovernance: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("THIRD_PARTY");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryAccount, setBeneficiaryAccount] = useState("");
  const [sourceAccount, setSourceAccount] = useState("2001-0012345-01 (Operating)");
  const [amount, setAmount] = useState("");
  const [scheduledDate, setScheduledDate] = useState(getDefaultScheduleDate());
  const [memo, setMemo] = useState("");

  const parsedAmount = parseFloat(amount) || 0;
  const minDate = getMinScheduleDate();
  const isValid =
    beneficiaryName.trim() &&
    beneficiaryAccount.trim() &&
    parsedAmount > 0 &&
    scheduledDate >= minDate;

  const sourceAccounts = [
    "2001-0012345-01 (Operating)",
    "2001-0012345-02 (Savings)",
    "2001-0012345-03 (Tax Vault)",
  ];

  const methodOptions: { value: PaymentMethod; label: string; icon: typeof Send }[] = [
    { value: "OWN_ACCOUNT", label: "Own Account", icon: ArrowRightLeft },
    { value: "THIRD_PARTY", label: "Third Party", icon: Send },
    { value: "MFS", label: "MFS", icon: Smartphone },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">
          Payment Intent
        </p>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {methodOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setPaymentMethod(opt.value)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === opt.value
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                      : "bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60"
                  }`}
                >
                  <Icon
                    size={16}
                    className={`mx-auto mb-1.5 ${
                      paymentMethod === opt.value ? "text-cyan-400" : "text-white/30"
                    }`}
                  />
                  <p className="text-[9px] uppercase tracking-wider font-bold">
                    {opt.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Beneficiary Name */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Beneficiary Name
          </label>
          <input
            type="text"
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>

        {/* Beneficiary Account */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            {paymentMethod === "MFS" ? "Mobile Number" : "Account Number"}
          </label>
          <input
            type="text"
            value={beneficiaryAccount}
            onChange={(e) => setBeneficiaryAccount(e.target.value)}
            placeholder={
              paymentMethod === "MFS"
                ? "01XXX-XXXXXX"
                : paymentMethod === "OWN_ACCOUNT"
                ? "Select destination account"
                : "XXXX-XXXXXXX-XXX"
            }
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors placeholder:text-white/20"
          />
        </div>

        {/* Source Account */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Source Account
          </label>
          <select
            value={sourceAccount}
            onChange={(e) => setSourceAccount(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors appearance-none"
          >
            {sourceAccounts.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Amount (BDT)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors"
          />
          {parsedAmount > 0 && (
            <p className="text-[10px] text-white/30 mt-1">
              {formatBDT(parsedAmount)} via {methodLabel(paymentMethod)}
            </p>
          )}
        </div>

        {/* Scheduled Date */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Scheduled Execution Date
          </label>
          <input
            type="date"
            value={scheduledDate}
            min={minDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors"
          />
          <p className="text-[9px] text-cyan-400/50 mt-1.5">
            Governance will re-evaluate on this date before execution
          </p>
        </div>

        {/* Memo */}
        <div className="mb-2">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Memo / Reference
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Invoice reference, purpose, etc."
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors placeholder:text-white/20"
          />
        </div>
      </motion.div>

      {/* Governance Bar */}
      {governanceResult && (
        <div className="mb-4">
          <GovernanceBar result={governanceResult} onDismiss={onDismissGovernance} />
        </div>
      )}

      {/* Submit */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        whileTap={{ scale: 0.97 }}
        disabled={!isValid || !!governanceResult}
        onClick={() =>
          onCreate({
            beneficiaryName,
            beneficiaryAccount,
            paymentMethod,
            sourceAccount,
            amount: parsedAmount,
            scheduledDate,
            memo,
          })
        }
        className="w-full p-4 rounded-[28px] bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 hover:bg-cyan-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <CalendarClock size={16} className="text-cyan-400" />
        <span className="text-sm text-cyan-300 font-semibold">
          Schedule Payment
        </span>
      </motion.button>

      {/* Governance Disclosure */}
      <p className="text-[9px] text-white/20 text-center mt-3 px-4">
        This payment will be held until the scheduled date. On that date, governance rules
        will be re-evaluated before execution. Prior approval does not guarantee execution.
      </p>
    </>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

type SubView = "list" | "detail" | "create";

export default function OutflowControlsScreen({ onBack }: OutflowControlsScreenProps) {
  const [subView, setSubView] = useState<SubView>("list");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledPayment | null>(null);
  const [governanceResult, setGovernanceResult] = useState<EnforcementResult | null>(null);
  const [schedules, setSchedules] = useState<ScheduledPayment[]>([
    ...SCHEDULED_PAYMENTS,
  ]);

  const handleDismissGovernance = () => setGovernanceResult(null);

  // ============================
  // GOVERNANCE: CREATE SCHEDULE
  // ============================
  // // GOVERNANCE_ENFORCEMENT — Creation gate
  const handleCreate = (data: {
    beneficiaryName: string;
    beneficiaryAccount: string;
    paymentMethod: PaymentMethod;
    sourceAccount: string;
    amount: number;
    scheduledDate: string;
    memo: string;
  }) => {
    // // GOVERNANCE_ENFORCEMENT — enforceTransactionGate at schedule creation
    const result = enforceTransactionGate({
      amount: data.amount,
      category: methodToCategory(data.paymentMethod),
      description: `Scheduled payment: ${formatBDT(data.amount)} to ${data.beneficiaryName} on ${data.scheduledDate}`,
    });

    setGovernanceResult(result);

    if (result.outcome === "BLOCKED") {
      // // GOVERNANCE_ENFORCEMENT — Hard stop, no schedule created
      return;
    }

    const user = getCurrentUser();
    const newSchedule: ScheduledPayment = {
      id: `sp_${Date.now()}`,
      amount: data.amount,
      beneficiaryName: data.beneficiaryName,
      beneficiaryAccount: data.beneficiaryAccount,
      paymentMethod: data.paymentMethod,
      sourceAccount: data.sourceAccount,
      memo: data.memo,
      scheduledDate: data.scheduledDate,
      outcome: result.outcome === "APPROVAL_REQUIRED" ? "APPROVAL_REQUIRED" : "SCHEDULED",
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
      creationAuditId: result.auditId,
      creationOutcome: result.outcome,
    };

    setSchedules((prev) => [newSchedule, ...prev]);

    // Remain on create view to show governance feedback, then navigate
    setTimeout(() => {
      setSubView("list");
    }, 1500);
  };

  // ============================
  // GOVERNANCE: CANCEL SCHEDULE
  // ============================
  // // GOVERNANCE_ENFORCEMENT — Cancel gate
  const handleCancel = () => {
    if (!selectedSchedule) return;

    // // GOVERNANCE_ENFORCEMENT — enforceTransactionGate for cancellation
    const result = enforceTransactionGate({
      amount: selectedSchedule.amount,
      category: methodToCategory(selectedSchedule.paymentMethod),
      description: `Cancel scheduled payment ${selectedSchedule.id}: ${formatBDT(selectedSchedule.amount)} to ${selectedSchedule.beneficiaryName}`,
    });

    setGovernanceResult(result);

    if (result.outcome === "BLOCKED") {
      // // GOVERNANCE_ENFORCEMENT — Cannot cancel, blocked by role
      return;
    }

    const user = getCurrentUser();
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === selectedSchedule.id
          ? {
              ...s,
              outcome: "CANCELLED" as const,
              cancelReason: "Cancelled by operator",
              cancelledBy: user.id,
              cancelledByName: user.name,
              cancelledAt: new Date().toISOString(),
              cancellationAuditId: result.auditId,
            }
          : s
      )
    );

    // Update selected schedule for detail view
    setSelectedSchedule((prev) =>
      prev
        ? {
            ...prev,
            outcome: "CANCELLED" as const,
            cancelReason: "Cancelled by operator",
            cancelledBy: user.id,
            cancelledByName: user.name,
            cancelledAt: new Date().toISOString(),
            cancellationAuditId: result.auditId,
          }
        : null
    );
  };

  // ============================
  // GOVERNANCE: EXECUTION-DAY RE-CHECK
  // ============================
  // // GOVERNANCE_ENFORCEMENT — Execution-day re-evaluation (never assume prior approval)
  const handleExecuteCheck = () => {
    if (!selectedSchedule) return;

    // // GOVERNANCE_ENFORCEMENT — enforceTransactionGate runs again on execution day
    const result = enforceTransactionGate({
      amount: selectedSchedule.amount,
      category: methodToCategory(selectedSchedule.paymentMethod),
      description: `Execution-day governance check for ${selectedSchedule.id}: ${formatBDT(selectedSchedule.amount)} to ${selectedSchedule.beneficiaryName}`,
    });

    setGovernanceResult(result);

    // Update schedule based on outcome
    const now = new Date().toISOString();
    let updatedOutcome: ScheduleOutcome = selectedSchedule.outcome;
    let updates: Partial<ScheduledPayment> = {};

    if (result.outcome === "ALLOWED") {
      updatedOutcome = "EXECUTED";
      updates = {
        executedAt: now,
        executionAuditId: result.auditId,
        executionOutcome: "ALLOWED",
      };
    } else if (result.outcome === "BLOCKED") {
      updatedOutcome = "BLOCKED";
      updates = {
        executionAuditId: result.auditId,
        executionOutcome: "BLOCKED",
        executionBlockReason: result.reason,
      };
    } else if (result.outcome === "APPROVAL_REQUIRED") {
      updatedOutcome = "APPROVAL_REQUIRED";
      updates = {
        executionAuditId: result.auditId,
        executionOutcome: "APPROVAL_REQUIRED",
      };
    }

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === selectedSchedule.id
          ? { ...s, outcome: updatedOutcome, ...updates }
          : s
      )
    );

    setSelectedSchedule((prev) =>
      prev ? { ...prev, outcome: updatedOutcome, ...updates } : null
    );
  };

  // ============================
  // NAVIGATION
  // ============================

  const handleSelectSchedule = (s: ScheduledPayment) => {
    setSelectedSchedule(s);
    setGovernanceResult(null);
    setSubView("detail");
  };

  const handleSubBack = () => {
    setGovernanceResult(null);
    if (subView === "detail" || subView === "create") {
      setSubView("list");
      setSelectedSchedule(null);
    } else {
      onBack();
    }
  };

  // Title based on subView
  const titleMap: Record<SubView, string> = {
    list: "Outflow Controls",
    detail: "Payment Detail",
    create: "Schedule Payment",
  };

  return (
    <div className="px-6 pt-8 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleSubBack}
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={16} className="text-white/70" />
        </button>
        <div>
          <h1 className="text-3xl font-serif text-white">{titleMap[subView]}</h1>
          <p className="text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] font-bold mt-1">
            Time-Shifted Execution Under Governance
          </p>
        </div>
      </div>

      {/* Sub-view Router */}
      {subView === "list" && (
        <ScheduleList
          schedules={schedules}
          onSelect={handleSelectSchedule}
          onNewSchedule={() => {
            setGovernanceResult(null);
            setSubView("create");
          }}
          governanceResult={governanceResult}
          onDismissGovernance={handleDismissGovernance}
        />
      )}

      {subView === "detail" && selectedSchedule && (
        <ScheduleDetail
          schedule={selectedSchedule}
          onBack={handleSubBack}
          onCancel={handleCancel}
          onExecuteCheck={handleExecuteCheck}
          governanceResult={governanceResult}
          onDismissGovernance={handleDismissGovernance}
        />
      )}

      {subView === "create" && (
        <CreateScheduleForm
          onBack={handleSubBack}
          onCreate={handleCreate}
          governanceResult={governanceResult}
          onDismissGovernance={handleDismissGovernance}
        />
      )}
    </div>
  );
}