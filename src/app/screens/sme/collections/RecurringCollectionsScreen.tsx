/**
 * RECURRING COLLECTIONS ENGINE — Phase B1
 * Governed time-based collection schedules (EMI / Subscription)
 * // GOVERNANCE_ENFORCEMENT — All schedule actions hit governance engine
 *
 * Governance touchpoints:
 *  - Create schedule → enforceTransactionGate (DIRECT_DEBIT)
 *  - Pause schedule → enforceTransactionGate (DIRECT_DEBIT, role-check)
 *  - Cancel schedule → enforceTransactionGate (DIRECT_DEBIT, role-check)
 *  - Each run → enforceTransactionGate re-evaluation (not assumed approved)
 */

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Pause,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  RECURRING_COLLECTIONS,
  getTotalScheduledMonthly,
  getTotalScheduledWeekly,
  getCollectionRate,
  getRunOutcomeConfig,
  getStatusConfig,
  formatBDT,
  type RecurringCollection,
  type RecurringFrequency,
  type RecurringRunRecord,
} from "../../../data/recurringCollections";
import {
  enforceTransactionGate,
  type EnforcementResult,
} from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";
import { getCurrentUser } from "../../../mock/users";
import { INVOICES } from "../../../data/receivablesData";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface RecurringCollectionsScreenProps {
  onBack: () => void;
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
  schedules: RecurringCollection[];
  onSelect: (s: RecurringCollection) => void;
  onNewSchedule: () => void;
  governanceResult: EnforcementResult | null;
  onDismissGovernance: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "ACTIVE" | "PAUSED" | "CANCELLED">("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? schedules
        : schedules.filter((s) => s.status === filter),
    [schedules, filter]
  );

  const activeCount = schedules.filter((s) => s.status === "ACTIVE").length;
  const monthlyTotal = getTotalScheduledMonthly();
  const weeklyTotal = getTotalScheduledWeekly();
  const collectionRate = getCollectionRate();

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
            Active Schedules
          </p>
          <p className="text-2xl text-white font-serif">{activeCount}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-emerald-400/80 font-bold mb-2">
            Collection Rate
          </p>
          <p className="text-2xl text-white font-serif">{collectionRate}%</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.15 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-white/50 font-bold mb-2">
            Monthly Inflow
          </p>
          <p className="text-lg text-white">{formatBDT(monthlyTotal)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.2 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
        >
          <p className="text-[9px] uppercase tracking-[0.25em] text-white/50 font-bold mb-2">
            Weekly Inflow
          </p>
          <p className="text-lg text-white">{formatBDT(weeklyTotal)}</p>
        </motion.div>
      </div>

      {/* Governance Bar */}
      {governanceResult && (
        <div className="mb-4">
          <GovernanceBar result={governanceResult} onDismiss={onDismissGovernance} />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {(["all", "ACTIVE", "PAUSED", "CANCELLED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold border transition-all ${
              filter === f
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
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
          <p className="text-sm text-white font-semibold">New Recurring Schedule</p>
          <p className="text-[10px] text-white/50">
            Set up monthly or weekly collection
          </p>
        </div>
      </motion.button>

      {/* Schedule Cards */}
      <div className="space-y-3">
        {filtered.map((schedule, i) => {
          const statusCfg = getStatusConfig(schedule.status);
          const lastRun = schedule.runHistory[schedule.runHistory.length - 1];
          const lastRunCfg = lastRun ? getRunOutcomeConfig(lastRun.outcome) : null;

          return (
            <motion.button
              key={schedule.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.05 * i }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(schedule)}
              className={`w-full p-4 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-left transition-all hover:bg-white/5 ${statusCfg.border} bg-white/[0.03]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-semibold truncate">
                    {schedule.customerName}
                  </p>
                  {schedule.invoiceRef && (
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      {schedule.invoiceRef}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
                >
                  {statusCfg.label}
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
                    Frequency
                  </p>
                  <p className="text-white text-sm capitalize">
                    {schedule.frequency.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider">
                    Runs
                  </p>
                  <p className="text-white text-sm">{schedule.runCount}</p>
                </div>
              </div>

              {/* Last Run Status */}
              {lastRun && lastRunCfg && (
                <div
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl ${lastRunCfg.bg} border ${lastRunCfg.border}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      lastRun.outcome === "COLLECTED"
                        ? "bg-emerald-400"
                        : lastRun.outcome === "MISSED" || lastRun.outcome === "BLOCKED"
                        ? "bg-red-400"
                        : "bg-amber-400"
                    }`}
                  />
                  <p className={`text-[10px] ${lastRunCfg.text}`}>
                    Last run: {lastRunCfg.label} — {lastRun.scheduledDate}
                  </p>
                </div>
              )}

              {/* Next Run */}
              {schedule.status === "ACTIVE" && (
                <p className="text-[10px] text-cyan-400/60 mt-2 flex items-center gap-1">
                  <Clock size={10} />
                  Next: {schedule.nextRunDate}
                </p>
              )}
            </motion.button>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">
            No schedules match this filter
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
  onPause,
  onCancel,
  onSimulateRun,
  governanceResult,
  onDismissGovernance,
}: {
  schedule: RecurringCollection;
  onBack: () => void;
  onPause: () => void;
  onCancel: () => void;
  onSimulateRun: () => void;
  governanceResult: EnforcementResult | null;
  onDismissGovernance: () => void;
}) {
  const [showHistory, setShowHistory] = useState(true);
  const statusCfg = getStatusConfig(schedule.status);

  const collectedRuns = schedule.runHistory.filter((r) => r.outcome === "COLLECTED").length;
  const missedRuns = schedule.runHistory.filter(
    (r) => r.outcome === "MISSED" || r.outcome === "OVERDUE"
  ).length;
  const blockedRuns = schedule.runHistory.filter((r) => r.outcome === "BLOCKED").length;

  return (
    <>
      {/* Schedule Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white font-semibold">{schedule.customerName}</p>
            {schedule.invoiceRef && (
              <p className="text-[10px] text-white/40 font-mono mt-0.5">
                Ref: {schedule.invoiceRef}
              </p>
            )}
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
          >
            {statusCfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Collection Amount
            </p>
            <p className="text-xl text-white font-serif">{formatBDT(schedule.amount)}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Frequency
            </p>
            <p className="text-xl text-white font-serif capitalize">
              {schedule.frequency.toLowerCase()}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Start Date
            </p>
            <p className="text-sm text-white">{schedule.startDate}</p>
          </div>
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Next Run
            </p>
            <p className="text-sm text-cyan-400">
              {schedule.status === "ACTIVE" ? schedule.nextRunDate : "—"}
            </p>
          </div>
        </div>

        {/* Pause/Cancel Reason */}
        {schedule.pauseReason && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-[9px] text-amber-400/70 uppercase tracking-wider font-bold mb-1">
              Pause Reason
            </p>
            <p className="text-[11px] text-amber-300/80">{schedule.pauseReason}</p>
          </div>
        )}
        {schedule.cancelReason && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-[9px] text-red-400/70 uppercase tracking-wider font-bold mb-1">
              Cancellation Reason
            </p>
            <p className="text-[11px] text-red-300/80">{schedule.cancelReason}</p>
          </div>
        )}
      </motion.div>

      {/* Run Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        <div className="p-3 rounded-[20px] bg-emerald-500/5 border border-emerald-500/20 text-center">
          <CheckCircle2 size={16} className="text-emerald-400 mx-auto mb-1" />
          <p className="text-lg text-white">{collectedRuns}</p>
          <p className="text-[9px] text-emerald-400/60 uppercase tracking-wider">
            Collected
          </p>
        </div>
        <div className="p-3 rounded-[20px] bg-amber-500/5 border border-amber-500/20 text-center">
          <AlertTriangle size={16} className="text-amber-400 mx-auto mb-1" />
          <p className="text-lg text-white">{missedRuns}</p>
          <p className="text-[9px] text-amber-400/60 uppercase tracking-wider">
            Missed
          </p>
        </div>
        <div className="p-3 rounded-[20px] bg-red-500/5 border border-red-500/20 text-center">
          <ShieldAlert size={16} className="text-red-400 mx-auto mb-1" />
          <p className="text-lg text-white">{blockedRuns}</p>
          <p className="text-[9px] text-red-400/60 uppercase tracking-wider">
            Blocked
          </p>
        </div>
      </motion.div>

      {/* Total Collected */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Total Collected
            </p>
            <p className="text-xl text-emerald-400 font-serif">
              {formatBDT(schedule.totalCollected)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
              Total Missed
            </p>
            <p className="text-xl text-red-400 font-serif">
              {formatBDT(schedule.totalMissed)}
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
          {schedule.totalCollected + schedule.totalMissed > 0 && (
            <div
              className="h-full bg-emerald-500/60 rounded-full"
              style={{
                width: `${
                  (schedule.totalCollected /
                    (schedule.totalCollected + schedule.totalMissed)) *
                  100
                }%`,
              }}
            />
          )}
        </div>
        <p className="text-[9px] text-white/30 mt-1.5">
          Created by {schedule.createdByName} on{" "}
          {new Date(schedule.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </motion.div>

      {/* Governance Bar */}
      {governanceResult && (
        <div className="mb-4">
          <GovernanceBar result={governanceResult} onDismiss={onDismissGovernance} />
        </div>
      )}

      {/* Action Buttons — Pause / Cancel / Simulate Run */}
      {schedule.status === "ACTIVE" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.15 }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          {/* // GOVERNANCE_ENFORCEMENT — Pause action */}
          <button
            onClick={onPause}
            disabled={!!governanceResult}
            className="p-3 rounded-[20px] bg-amber-500/5 border border-amber-500/20 flex items-center justify-center gap-2 hover:bg-amber-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Pause size={14} className="text-amber-400" />
            <span className="text-[11px] text-amber-300 font-semibold">Pause</span>
          </button>
          {/* // GOVERNANCE_ENFORCEMENT — Cancel action */}
          <button
            onClick={onCancel}
            disabled={!!governanceResult}
            className="p-3 rounded-[20px] bg-red-500/5 border border-red-500/20 flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <XCircle size={14} className="text-red-400" />
            <span className="text-[11px] text-red-300 font-semibold">Cancel</span>
          </button>
        </motion.div>
      )}

      {/* Simulate Next Run (governance re-check) */}
      {schedule.status === "ACTIVE" && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSimulateRun}
          className="w-full mb-5 p-4 rounded-[28px] border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 hover:bg-cyan-500/10 transition-all"
        >
          <RotateCcw size={16} className="text-cyan-400" />
          <span className="text-sm text-cyan-300 font-semibold">
            Run Governance Check for Next Collection
          </span>
        </motion.button>
      )}

      {/* Run History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.25 }}
        className="rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden"
      >
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-4 flex items-center justify-between"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Run History ({schedule.runHistory.length})
          </p>
          {showHistory ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {[...schedule.runHistory].reverse().map((run) => {
                  const runCfg = getRunOutcomeConfig(run.outcome);
                  return (
                    <div
                      key={run.id}
                      className={`p-3 rounded-xl border ${runCfg.border} ${runCfg.bg}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] text-white/80">
                          {run.scheduledDate}
                        </p>
                        <span
                          className={`text-[9px] uppercase tracking-wider font-bold ${runCfg.text}`}
                        >
                          {runCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">{formatBDT(run.amount)}</p>
                      {run.executedDate && run.executedDate !== run.scheduledDate && (
                        <p className="text-[9px] text-white/30 mt-1">
                          Executed: {run.executedDate}
                        </p>
                      )}
                      {run.note && (
                        <p className="text-[10px] text-white/40 mt-1 italic">
                          {run.note}
                        </p>
                      )}
                      {run.governanceAuditId && (
                        <p className="text-[8px] text-white/20 font-mono mt-1">
                          Audit: {run.governanceAuditId}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ============================================
// SUB-VIEW: CREATE NEW SCHEDULE
// ============================================

function CreateScheduleForm({
  onBack,
  onCreate,
  governanceResult,
  onDismissGovernance,
}: {
  onBack: () => void;
  onCreate: (data: {
    customerId: string;
    customerName: string;
    invoiceRef: string;
    amount: number;
    frequency: RecurringFrequency;
    startDate: string;
  }) => void;
  governanceResult: EnforcementResult | null;
  onDismissGovernance: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("MONTHLY");
  const [startDate, setStartDate] = useState("2026-03-01");

  // Available customers from invoices (non-paid, outstanding)
  const availableInvoices = INVOICES.filter(
    (inv) => inv.outstandingAmount > 0
  );

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    const inv = INVOICES.find((i) => i.invoiceId === invoiceId);
    if (inv) {
      setCustomerName(inv.customerName);
      setAmount(String(Math.round(inv.outstandingAmount / 6))); // Default: split into 6 installments
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const isValid = customerName.trim() && parsedAmount > 0 && startDate;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-5">
          Schedule Details
        </p>

        {/* Invoice Selector */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Bind to Invoice (Optional)
          </label>
          <select
            value={selectedInvoice}
            onChange={(e) => handleInvoiceSelect(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors appearance-none"
          >
            <option value="">Manual entry</option>
            {availableInvoices.map((inv) => (
              <option key={inv.invoiceId} value={inv.invoiceId}>
                {inv.invoiceId} — {inv.customerName} (৳
                {inv.outstandingAmount.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Customer Name */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Collection Amount (BDT)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors"
          />
          {parsedAmount > 0 && (
            <p className="text-[10px] text-white/30 mt-1">
              {formatBDT(parsedAmount)} per{" "}
              {frequency === "MONTHLY" ? "month" : "week"}
            </p>
          )}
        </div>

        {/* Frequency */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Frequency
          </label>
          <div className="flex gap-3">
            {(["MONTHLY", "WEEKLY"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`flex-1 p-3 rounded-xl border text-sm transition-all ${
                  frequency === f
                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
                }`}
              >
                {f === "MONTHLY" ? "Monthly" : "Weekly"}
              </button>
            ))}
          </div>
        </div>

        {/* Start Date */}
        <div className="mb-4">
          <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>
      </motion.div>

      {/* Governance Bar */}
      {governanceResult && (
        <div className="mb-4">
          <GovernanceBar result={governanceResult} onDismiss={onDismissGovernance} />
        </div>
      )}

      {/* Summary + Submit */}
      {isValid && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] mb-5"
        >
          <p className="text-[9px] text-white/40 uppercase tracking-wider mb-2">
            Schedule Summary
          </p>
          <p className="text-sm text-white">
            Collect {formatBDT(parsedAmount)}{" "}
            {frequency === "MONTHLY" ? "monthly" : "weekly"} from{" "}
            <span className="text-cyan-400">{customerName}</span>
            {selectedInvoice && (
              <span className="text-white/40"> (Ref: {selectedInvoice})</span>
            )}
          </p>
          <p className="text-[10px] text-white/30 mt-1">
            Starting {startDate} — governed by DIRECT_DEBIT limits
          </p>
        </motion.div>
      )}

      {/* // GOVERNANCE_ENFORCEMENT — Schedule creation hits enforceTransactionGate */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
        whileTap={{ scale: 0.97 }}
        disabled={
          !isValid ||
          !!governanceResult
        }
        onClick={() =>
          onCreate({
            customerId:
              INVOICES.find((i) => i.invoiceId === selectedInvoice)
                ?.customerId || `CUST-NEW-${Date.now()}`,
            customerName,
            invoiceRef: selectedInvoice,
            amount: parsedAmount,
            frequency,
            startDate,
          })
        }
        className="w-full p-4 rounded-[28px] bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold text-sm hover:bg-cyan-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-[45px]"
      >
        Create Recurring Schedule
      </motion.button>
    </>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function RecurringCollectionsScreen({
  onBack,
}: RecurringCollectionsScreenProps) {
  const [view, setView] = useState<"list" | "detail" | "create">("list");
  const [selectedSchedule, setSelectedSchedule] =
    useState<RecurringCollection | null>(null);
  const [governanceResult, setGovernanceResult] =
    useState<EnforcementResult | null>(null);
  const [schedules, setSchedules] = useState<RecurringCollection[]>([
    ...RECURRING_COLLECTIONS,
  ]);

  const clearGovernance = () => setGovernanceResult(null);

  // ---- GOVERNANCE TOUCHPOINT: Create Schedule ----
  // // GOVERNANCE_ENFORCEMENT — Schedule creation
  const handleCreate = (data: {
    customerId: string;
    customerName: string;
    invoiceRef: string;
    amount: number;
    frequency: RecurringFrequency;
    startDate: string;
  }) => {
    const result = enforceTransactionGate({
      amount: data.amount,
      category: "DIRECT_DEBIT",
      description: `Recurring collection schedule creation: ${data.customerName} — ${formatBDT(data.amount)} ${data.frequency.toLowerCase()}`,
    });
    setGovernanceResult(result);

    if (result.outcome === "BLOCKED") return;

    const user = getCurrentUser();
    const newSchedule: RecurringCollection = {
      id: `rc_${Date.now()}`,
      customerId: data.customerId,
      customerName: data.customerName,
      invoiceRef: data.invoiceRef || undefined,
      amount: data.amount,
      frequency: data.frequency,
      startDate: data.startDate,
      nextRunDate: data.startDate,
      status: result.outcome === "APPROVAL_REQUIRED" ? "PAUSED" : "ACTIVE",
      totalCollected: 0,
      totalMissed: 0,
      runCount: 0,
      runHistory: [],
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
    };

    if (result.outcome === "APPROVAL_REQUIRED") {
      newSchedule.pauseReason =
        "Pending approval — schedule will activate after authorization";
    }

    setSchedules((prev) => [newSchedule, ...prev]);

    // Stay on create view to show governance result, then user can navigate
    if (result.outcome === "ALLOWED") {
      setSelectedSchedule(newSchedule);
      setView("detail");
    }
  };

  // ---- GOVERNANCE TOUCHPOINT: Pause Schedule ----
  // // GOVERNANCE_ENFORCEMENT — Schedule pause
  const handlePause = () => {
    if (!selectedSchedule) return;

    const result = enforceTransactionGate({
      amount: 0,
      category: "DIRECT_DEBIT",
      description: `Recurring collection pause: ${selectedSchedule.customerName} (${selectedSchedule.id})`,
    });
    setGovernanceResult(result);

    if (result.outcome === "BLOCKED") return;

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === selectedSchedule.id
          ? {
              ...s,
              status: "PAUSED" as const,
              pauseReason: "Manually paused by operator",
              lastModifiedBy: getCurrentUser().id,
              lastModifiedByName: getCurrentUser().name,
              lastModifiedAt: new Date().toISOString(),
            }
          : s
      )
    );
    setSelectedSchedule((prev) =>
      prev
        ? {
            ...prev,
            status: "PAUSED",
            pauseReason: "Manually paused by operator",
          }
        : prev
    );
  };

  // ---- GOVERNANCE TOUCHPOINT: Cancel Schedule ----
  // // GOVERNANCE_ENFORCEMENT — Schedule cancel
  const handleCancel = () => {
    if (!selectedSchedule) return;

    const result = enforceTransactionGate({
      amount: 0,
      category: "DIRECT_DEBIT",
      description: `Recurring collection cancel: ${selectedSchedule.customerName} (${selectedSchedule.id})`,
    });
    setGovernanceResult(result);

    if (result.outcome === "BLOCKED") return;

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === selectedSchedule.id
          ? {
              ...s,
              status: "CANCELLED" as const,
              cancelReason: "Cancelled by operator",
              lastModifiedBy: getCurrentUser().id,
              lastModifiedByName: getCurrentUser().name,
              lastModifiedAt: new Date().toISOString(),
            }
          : s
      )
    );
    setSelectedSchedule((prev) =>
      prev
        ? {
            ...prev,
            status: "CANCELLED",
            cancelReason: "Cancelled by operator",
          }
        : prev
    );
  };

  // ---- GOVERNANCE TOUCHPOINT: Simulate Run (re-check) ----
  // // GOVERNANCE_ENFORCEMENT — Each run re-evaluates governance
  const handleSimulateRun = () => {
    if (!selectedSchedule) return;

    // Critical rule: A scheduled run is re-checked, not assumed approved
    const result = enforceTransactionGate({
      amount: selectedSchedule.amount,
      category: "DIRECT_DEBIT",
      description: `Recurring collection run execution: ${selectedSchedule.customerName} — ${formatBDT(selectedSchedule.amount)} (schedule ${selectedSchedule.id})`,
    });
    setGovernanceResult(result);

    // Record the run result
    const newRun: RecurringRunRecord = {
      id: `run_${Date.now()}`,
      scheduledDate: selectedSchedule.nextRunDate,
      amount: selectedSchedule.amount,
      governanceAuditId: result.auditId,
      outcome:
        result.outcome === "BLOCKED"
          ? "BLOCKED"
          : result.outcome === "APPROVAL_REQUIRED"
          ? "APPROVAL_PENDING"
          : "COLLECTED",
      executedDate:
        result.outcome === "ALLOWED"
          ? new Date().toISOString().slice(0, 10)
          : undefined,
      note:
        result.outcome === "BLOCKED"
          ? `Governance blocked: ${result.reason}`
          : result.outcome === "APPROVAL_REQUIRED"
          ? `Routed to Approval Queue: ${result.ruleTriggered}`
          : "Governance checks passed — collected",
    };

    // Calculate next run date
    const nextDate = new Date(selectedSchedule.nextRunDate);
    if (selectedSchedule.frequency === "WEEKLY") {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    const nextRunStr = nextDate.toISOString().slice(0, 10);

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === selectedSchedule.id
          ? {
              ...s,
              runHistory: [...s.runHistory, newRun],
              runCount: s.runCount + 1,
              nextRunDate: nextRunStr,
              totalCollected:
                result.outcome === "ALLOWED"
                  ? s.totalCollected + s.amount
                  : s.totalCollected,
              totalMissed:
                result.outcome !== "ALLOWED"
                  ? s.totalMissed + s.amount
                  : s.totalMissed,
            }
          : s
      )
    );

    setSelectedSchedule((prev) =>
      prev
        ? {
            ...prev,
            runHistory: [...prev.runHistory, newRun],
            runCount: prev.runCount + 1,
            nextRunDate: nextRunStr,
            totalCollected:
              result.outcome === "ALLOWED"
                ? prev.totalCollected + prev.amount
                : prev.totalCollected,
            totalMissed:
              result.outcome !== "ALLOWED"
                ? prev.totalMissed + prev.amount
                : prev.totalMissed,
          }
        : prev
    );
  };

  const viewTitle =
    view === "create"
      ? "New Schedule"
      : view === "detail"
      ? "Schedule Detail"
      : "Recurring Collections";

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
      <header className="flex items-center gap-4 mb-10">
        <button
          onClick={() => {
            clearGovernance();
            if (view === "detail" || view === "create") {
              setView("list");
              setSelectedSchedule(null);
            } else {
              onBack();
            }
          }}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">{viewTitle}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            {view === "create"
              ? "EMI / Subscription Setup"
              : view === "detail"
              ? "Schedule Overview"
              : "Governed Automation"}
          </p>
        </div>
      </header>

      {/* Sub-views */}
      {view === "list" && (
        <ScheduleList
          schedules={schedules}
          onSelect={(s) => {
            clearGovernance();
            setSelectedSchedule(s);
            setView("detail");
          }}
          onNewSchedule={() => {
            clearGovernance();
            setView("create");
          }}
          governanceResult={governanceResult}
          onDismissGovernance={clearGovernance}
        />
      )}

      {view === "detail" && selectedSchedule && (
        <ScheduleDetail
          schedule={selectedSchedule}
          onBack={() => {
            clearGovernance();
            setView("list");
            setSelectedSchedule(null);
          }}
          onPause={handlePause}
          onCancel={handleCancel}
          onSimulateRun={handleSimulateRun}
          governanceResult={governanceResult}
          onDismissGovernance={clearGovernance}
        />
      )}

      {view === "create" && (
        <CreateScheduleForm
          onBack={() => {
            clearGovernance();
            setView("list");
          }}
          onCreate={handleCreate}
          governanceResult={governanceResult}
          onDismissGovernance={clearGovernance}
        />
      )}
    </div>
  );
}