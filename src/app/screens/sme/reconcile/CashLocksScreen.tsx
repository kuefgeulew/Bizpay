import {
  ArrowLeft,
  Lock,
  Unlock,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CalendarOff,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import {
  CASH_LOCKS,
  LOCK_TRACE,
  formatLockCurrency,
  formatTime24to12,
  type CashLock,
  type CashLockTraceEvent,
} from "../../../data/cashLocks.mock";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface CashLocksScreenProps {
  onBack: () => void;
}

export default function CashLocksScreen({ onBack }: CashLocksScreenProps) {
  const [locks, setLocks] = useState(CASH_LOCKS);
  const [traceLog] = useState(LOCK_TRACE);
  const [expandedLock, setExpandedLock] = useState<string | null>("lock_ndw");
  const [overrideStep, setOverrideStep] = useState<"idle" | "reason" | "confirm" | "done">("idle");
  const [overrideReason, setOverrideReason] = useState("");
  const [confirmCountdown, setConfirmCountdown] = useState(0);

  // Log activity on mount
  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_cash_locks_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_CASH_LOCKS" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Viewed Cash Locks — Outflow Prevention Controls",
      entityType: "cash_locks",
      metadata: {
        activeLocks: locks.filter((l) => l.status === "active").length,
        totalLocks: locks.length,
      },
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  // Confirmation countdown for emergency override friction
  useEffect(() => {
    if (overrideStep === "confirm" && confirmCountdown > 0) {
      const timer = setTimeout(() => setConfirmCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [overrideStep, confirmCountdown]);

  const toggleLock = (lockId: string) => {
    setLocks((prev) =>
      prev.map((l) =>
        l.id === lockId
          ? {
              ...l,
              status: l.status === "active" ? "inactive" : "active",
              lastModifiedBy: "Current User",
              lastModifiedAt: "Feb 18, 2026 · Just now",
            }
          : l
      )
    );
  };

  const initiateOverride = () => {
    setOverrideStep("reason");
    setOverrideReason("");
  };

  const proceedToConfirm = () => {
    if (overrideReason.trim().length < 10) return;
    setOverrideStep("confirm");
    setConfirmCountdown(3);
  };

  const executeOverride = () => {
    if (confirmCountdown > 0) return;
    setOverrideStep("done");
    // Temporarily deactivate all locks
    setLocks((prev) =>
      prev.map((l) =>
        l.type !== "emergency-override"
          ? {
              ...l,
              status: "inactive" as const,
              lastModifiedBy: "Current User (Override)",
              lastModifiedAt: "Feb 18, 2026 · Just now",
            }
          : {
              ...l,
              status: "active" as const,
              lastModifiedBy: "Current User",
              lastModifiedAt: "Feb 18, 2026 · Just now",
            }
      )
    );
  };

  const resetOverride = () => {
    setOverrideStep("idle");
    setOverrideReason("");
    setConfirmCountdown(0);
  };

  const activeLockCount = locks.filter((l) => l.status === "active").length;

  const getTraceIcon = (type: CashLockTraceEvent["type"]) => {
    switch (type) {
      case "lock_enabled":
        return { icon: Lock, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case "lock_disabled":
        return { icon: Unlock, color: "text-white/50", bg: "bg-white/5", border: "border-white/10" };
      case "lock_breached":
        return { icon: Ban, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
      case "override_used":
        return { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case "cap_enforced":
        return { icon: ShieldAlert, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };
    }
  };

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-serif tracking-tight">Cash Locks</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Outflow Prevention Controls
          </p>
        </div>
        {/* Active lock count badge */}
        <div className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-[10px] font-bold text-cyan-400">
            {activeLockCount}/{locks.length} Active
          </p>
        </div>
      </header>

      {/* ── Section 1: Lock Status Panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Lock Status
        </p>

        <div className="p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <ShieldCheck size={18} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-serif text-white">Protection Summary</p>
              <p className="text-[10px] text-white/40 mt-0.5">Changes take effect immediately</p>
            </div>
          </div>

          <div className="space-y-2">
            {locks.map((lock) => (
              <div
                key={lock.id}
                className={`p-3 rounded-[20px] border transition-all ${
                  lock.status === "active"
                    ? "bg-emerald-500/[0.04] border-emerald-500/15"
                    : "bg-white/[0.02] border-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      lock.status === "active" ? "bg-emerald-400" : "bg-white/20"
                    }`}
                  />
                  <p className="text-sm text-white/80 flex-1">{lock.label}</p>
                  <span
                    className={`px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-wider ${
                      lock.status === "active"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/5 text-white/30 border border-white/10"
                    }`}
                  >
                    {lock.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 ml-5">
                  <User size={9} className="text-white/25" />
                  <p className="text-[9px] text-white/30">
                    {lock.lastModifiedBy} · {lock.lastModifiedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Lock Configuration Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.08 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Lock Configuration
        </p>

        <div className="space-y-4">
          {/* ── 2A: No-Debit Windows ── */}
          <NoDebitWindowCard
            lock={locks[0]}
            expanded={expandedLock === "lock_ndw"}
            onToggleExpand={() =>
              setExpandedLock(expandedLock === "lock_ndw" ? null : "lock_ndw")
            }
            onToggleLock={() => toggleLock("lock_ndw")}
          />

          {/* ── 2B: Daily Outflow Cap ── */}
          <DailyOutflowCapCard
            lock={locks[1]}
            expanded={expandedLock === "lock_doc"}
            onToggleExpand={() =>
              setExpandedLock(expandedLock === "lock_doc" ? null : "lock_doc")
            }
            onToggleLock={() => toggleLock("lock_doc")}
          />

          {/* ── 2C: Emergency Override ── */}
          <EmergencyOverrideCard
            lock={locks[2]}
            overrideStep={overrideStep}
            overrideReason={overrideReason}
            confirmCountdown={confirmCountdown}
            onSetReason={setOverrideReason}
            onInitiate={initiateOverride}
            onProceed={proceedToConfirm}
            onExecute={executeOverride}
            onReset={resetOverride}
            expanded={expandedLock === "lock_eo"}
            onToggleExpand={() =>
              setExpandedLock(expandedLock === "lock_eo" ? null : "lock_eo")
            }
          />
        </div>
      </motion.div>

      {/* ── Section 3: Activity Trace ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.16 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Activity Trace
        </p>

        <div className="space-y-2">
          {traceLog.map((event, i) => {
            const traceStyle = getTraceIcon(event.type);
            const TraceIcon = traceStyle.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.2 + i * 0.03 }}
                className="p-4 rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${traceStyle.bg} border ${traceStyle.border} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <TraceIcon size={14} className={traceStyle.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 leading-snug">{event.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Clock size={9} className="text-white/25" />
                        <p className="text-[9px] text-white/35">{event.timestamp}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={9} className="text-white/25" />
                        <p className="text-[9px] text-white/35">{event.actor}</p>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[7px] font-bold rounded-full uppercase tracking-wider shrink-0 ${
                      event.type === "lock_breached"
                        ? "bg-red-500/15 text-red-400 border border-red-500/20"
                        : event.type === "override_used"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : event.type === "cap_enforced"
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {event.type.replace(/_/g, " ")}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.32 }}
        className="p-4 rounded-[24px] bg-cyan-500/[0.04] border border-cyan-500/10 backdrop-blur-xl"
      >
        <p className="text-xs text-white/60 text-center">
          <span className="font-semibold text-cyan-400">Prevention-first:</span>{" "}
          Cash Locks block outflows — they never move money, approve payments, or override limits.
        </p>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────── */

function NoDebitWindowCard({
  lock,
  expanded,
  onToggleExpand,
  onToggleLock,
}: {
  lock: CashLock;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleLock: () => void;
}) {
  const config = lock.noDebitConfig!;
  return (
    <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-5 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <CalendarOff size={18} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-serif text-white tracking-tight">{lock.label}</p>
          <p className="text-[10px] text-white/40 mt-0.5">{lock.description}</p>
        </div>
        <span
          className={`px-2.5 py-1 text-[8px] font-bold rounded-full uppercase tracking-wider mr-2 ${
            lock.status === "active"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-white/5 text-white/30 border border-white/10"
          }`}
        >
          {lock.status}
        </span>
        {expanded ? (
          <ChevronUp size={16} className="text-white/30" />
        ) : (
          <ChevronDown size={16} className="text-white/30" />
        )}
      </button>

      {/* Expanded Config */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <div className="border-t border-white/5 pt-4" />

              {/* Time Window */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Block From</p>
                  <p className="text-sm font-semibold text-cyan-400">
                    {formatTime24to12(config.dailyStart)}
                  </p>
                </div>
                <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Block Until</p>
                  <p className="text-sm font-semibold text-cyan-400">
                    {formatTime24to12(config.dailyEnd)}
                  </p>
                </div>
              </div>

              {/* Weekend */}
              <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-wide mb-0.5">Weekend Block</p>
                  <p className="text-xs text-white/60">
                    All outflows blocked on Saturday & Sunday
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-[8px] font-bold rounded-full uppercase ${
                    config.weekendBlocked
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-white/5 text-white/30 border border-white/10"
                  }`}
                >
                  {config.weekendBlocked ? "On" : "Off"}
                </span>
              </div>

              {/* Toggle */}
              <button
                onClick={onToggleLock}
                className={`w-full p-3 rounded-[20px] border text-sm transition-all active:scale-[0.98] ${
                  lock.status === "active"
                    ? "bg-red-500/[0.06] border-red-500/20 text-red-400 hover:bg-red-500/10"
                    : "bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {lock.status === "active" ? <Unlock size={14} /> : <Lock size={14} />}
                  {lock.status === "active" ? "Deactivate Lock" : "Activate Lock"}
                </div>
              </button>

              {/* Last modified */}
              <div className="flex items-center gap-1.5 justify-center">
                <User size={9} className="text-white/20" />
                <p className="text-[9px] text-white/25">
                  {lock.lastModifiedBy} · {lock.lastModifiedAt}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DailyOutflowCapCard({
  lock,
  expanded,
  onToggleExpand,
  onToggleLock,
}: {
  lock: CashLock;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleLock: () => void;
}) {
  const config = lock.outflowCapConfig!;
  const usagePercent = Math.round((config.usedToday / config.capAmount) * 100);
  const remaining = config.capAmount - config.usedToday;

  return (
    <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-5 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <ArrowDownRight size={18} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-serif text-white tracking-tight">{lock.label}</p>
          <p className="text-[10px] text-white/40 mt-0.5">{lock.description}</p>
        </div>
        <span
          className={`px-2.5 py-1 text-[8px] font-bold rounded-full uppercase tracking-wider mr-2 ${
            lock.status === "active"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-white/5 text-white/30 border border-white/10"
          }`}
        >
          {lock.status}
        </span>
        {expanded ? (
          <ChevronUp size={16} className="text-white/30" />
        ) : (
          <ChevronDown size={16} className="text-white/30" />
        )}
      </button>

      {/* Expanded Config */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <div className="border-t border-white/5 pt-4" />

              {/* Cap Amount */}
              <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/5">
                <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Daily Cap</p>
                <p className="text-2xl font-bold text-cyan-400">{formatLockCurrency(config.capAmount)}</p>
                <p className="text-[10px] text-white/35 mt-1">Maximum total outflow per calendar day</p>
              </div>

              {/* Usage Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/50">Used Today</p>
                  <p className="text-xs text-white/40">{usagePercent}%</p>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ ...SPRING, delay: 0.1 }}
                    className={`h-full rounded-full ${
                      usagePercent >= 90
                        ? "bg-gradient-to-r from-red-500/70 to-red-400/50"
                        : usagePercent >= 70
                        ? "bg-gradient-to-r from-amber-500/70 to-amber-400/50"
                        : "bg-gradient-to-r from-cyan-500/70 to-cyan-400/50"
                    }`}
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Spent</p>
                  <p className="text-sm font-semibold text-amber-400">{formatLockCurrency(config.usedToday)}</p>
                </div>
                <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Remaining</p>
                  <p className="text-sm font-semibold text-emerald-400">{formatLockCurrency(remaining)}</p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={onToggleLock}
                className={`w-full p-3 rounded-[20px] border text-sm transition-all active:scale-[0.98] ${
                  lock.status === "active"
                    ? "bg-red-500/[0.06] border-red-500/20 text-red-400 hover:bg-red-500/10"
                    : "bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {lock.status === "active" ? <Unlock size={14} /> : <Lock size={14} />}
                  {lock.status === "active" ? "Deactivate Lock" : "Activate Lock"}
                </div>
              </button>

              {/* Last modified */}
              <div className="flex items-center gap-1.5 justify-center">
                <User size={9} className="text-white/20" />
                <p className="text-[9px] text-white/25">
                  {lock.lastModifiedBy} · {lock.lastModifiedAt}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmergencyOverrideCard({
  lock,
  overrideStep,
  overrideReason,
  confirmCountdown,
  onSetReason,
  onInitiate,
  onProceed,
  onExecute,
  onReset,
  expanded,
  onToggleExpand,
}: {
  lock: CashLock;
  overrideStep: "idle" | "reason" | "confirm" | "done";
  overrideReason: string;
  confirmCountdown: number;
  onSetReason: (val: string) => void;
  onInitiate: () => void;
  onProceed: () => void;
  onExecute: () => void;
  onReset: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <div className="rounded-[28px] bg-gradient-to-br from-amber-500/[0.04] to-red-500/[0.03] border border-amber-500/15 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-5 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <ShieldAlert size={18} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-serif text-white tracking-tight">{lock.label}</p>
          <p className="text-[10px] text-white/40 mt-0.5">{lock.description}</p>
        </div>
        <span
          className={`px-2.5 py-1 text-[8px] font-bold rounded-full uppercase tracking-wider mr-2 ${
            lock.status === "active"
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
              : "bg-white/5 text-white/30 border border-white/10"
          }`}
        >
          {lock.status === "active" ? "In Use" : "Standby"}
        </span>
        {expanded ? (
          <ChevronUp size={16} className="text-white/30" />
        ) : (
          <ChevronDown size={16} className="text-white/30" />
        )}
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <div className="border-t border-white/5 pt-4" />

              {/* Info */}
              <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/70 leading-relaxed">
                  Emergency Override temporarily suspends all active locks. It requires an explicit reason and secondary confirmation. All overrides are logged in the activity trace.
                </p>
              </div>

              {/* Override Flow */}
              {overrideStep === "idle" && (
                <button
                  onClick={onInitiate}
                  className="w-full p-3 rounded-[20px] bg-amber-500/[0.06] border border-amber-500/20 text-amber-400 text-sm transition-all hover:bg-amber-500/10 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Unlock size={14} />
                    Initiate Override
                  </div>
                </button>
              )}

              {overrideStep === "reason" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRING}
                  className="space-y-3"
                >
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide mb-2">
                      Reason for Override
                    </p>
                    <textarea
                      value={overrideReason}
                      onChange={(e) => onSetReason(e.target.value)}
                      placeholder="Explain why locks must be temporarily suspended..."
                      className="w-full h-24 p-3 rounded-[16px] bg-white/[0.03] border border-white/10 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/30 transition-colors"
                    />
                    <p className="text-[9px] text-white/30 mt-1">
                      Minimum 10 characters required ({overrideReason.trim().length}/10)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onReset}
                      className="flex-1 p-3 rounded-[20px] bg-white/[0.03] border border-white/10 text-white/50 text-sm transition-all hover:bg-white/[0.06] active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onProceed}
                      disabled={overrideReason.trim().length < 10}
                      className={`flex-1 p-3 rounded-[20px] border text-sm transition-all active:scale-[0.98] ${
                        overrideReason.trim().length >= 10
                          ? "bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/15"
                          : "bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed"
                      }`}
                    >
                      Proceed
                    </button>
                  </div>
                </motion.div>
              )}

              {overrideStep === "confirm" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRING}
                  className="space-y-3"
                >
                  <div className="p-4 rounded-[20px] bg-red-500/[0.06] border border-red-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-white">Confirm Override</p>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      This will temporarily suspend all active cash locks. The override and your stated reason will be permanently recorded in the activity trace.
                    </p>
                  </div>

                  <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                    <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Your Reason</p>
                    <p className="text-xs text-white/60 italic">"{overrideReason}"</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onReset}
                      className="flex-1 p-3 rounded-[20px] bg-white/[0.03] border border-white/10 text-white/50 text-sm transition-all hover:bg-white/[0.06] active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onExecute}
                      disabled={confirmCountdown > 0}
                      className={`flex-1 p-3 rounded-[20px] border text-sm transition-all ${
                        confirmCountdown > 0
                          ? "bg-red-500/[0.04] border-red-500/10 text-red-400/40 cursor-not-allowed"
                          : "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/20 active:scale-[0.98]"
                      }`}
                    >
                      {confirmCountdown > 0
                        ? `Wait ${confirmCountdown}s...`
                        : "Confirm Override"}
                    </button>
                  </div>
                </motion.div>
              )}

              {overrideStep === "done" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={SPRING}
                  className="space-y-3"
                >
                  <div className="p-4 rounded-[20px] bg-amber-500/[0.06] border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-amber-400" />
                      <p className="text-sm font-semibold text-white">Override Active</p>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      All cash locks temporarily suspended. This action has been logged.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onReset();
                    }}
                    className="w-full p-3 rounded-[20px] bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-400 text-sm transition-all hover:bg-emerald-500/10 active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Lock size={14} />
                      Restore All Locks
                    </div>
                  </button>
                </motion.div>
              )}

              {/* Last modified */}
              <div className="flex items-center gap-1.5 justify-center">
                <User size={9} className="text-white/20" />
                <p className="text-[9px] text-white/25">
                  Last override: {lock.lastModifiedBy} · {lock.lastModifiedAt}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}