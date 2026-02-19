import { useState, useMemo } from "react";
import { ArrowLeft, Filter, ChevronDown, Shield, Lock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AUDIT_EVENTS,
  getAuditSeverityConfig,
  type AuditEvent,
  type AuditEventType,
} from "../../../data/adminGovernance";
import AutomationControlPanel from "./AutomationControlPanel";

interface AuditComplianceScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

const EVENT_TYPE_LABELS: Record<AuditEventType, string> = {
  APPROVAL_LOG: "Approval",
  OVERRIDE_LOG: "Override",
  LOCK_BREACH: "Lock Breach",
  ROLE_VIOLATION: "Role Violation",
  LIMIT_BREACH: "Limit Breach",
  SESSION_ANOMALY: "Session",
  BENEFICIARY_CHANGE: "Beneficiary",
  SYSTEM_CONFIG_CHANGE: "Config Change",
};

type AuditTab = "events" | "automation";

export default function AuditComplianceScreen({ onBack }: AuditComplianceScreenProps) {
  const [activeTab, setActiveTab] = useState<AuditTab>("events");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    return AUDIT_EVENTS.filter(event => {
      if (filterSeverity !== "all" && event.severity !== filterSeverity) return false;
      if (filterType !== "all" && event.eventType !== filterType) return false;
      return true;
    });
  }, [filterSeverity, filterType]);

  // Stats
  const criticalCount = AUDIT_EVENTS.filter(e => e.severity === "CRITICAL").length;
  const highCount = AUDIT_EVENTS.filter(e => e.severity === "HIGH").length;
  const overrideCount = AUDIT_EVENTS.filter(e => e.eventType === "OVERRIDE_LOG").length;
  const breachCount = AUDIT_EVENTS.filter(e => e.eventType === "LOCK_BREACH" || e.eventType === "LIMIT_BREACH").length;

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
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Audit & Compliance</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Immutable System Events
          </p>
        </div>
      </header>

      {/* Tab Segmented Control */}
      <div className="flex gap-2 mb-6">
        {(["events", "automation"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border transition-all ${
              activeTab === tab
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {tab === "events" ? "Audit Events" : "Automation"}
          </button>
        ))}
      </div>

      {/* Automation Tab */}
      {activeTab === "automation" && <AutomationControlPanel />}

      {/* Audit Events Tab */}
      {activeTab === "events" && (
        <>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="grid grid-cols-4 gap-2 mb-6"
          >
            <MiniStat label="Critical" value={criticalCount} color="text-red-400" />
            <MiniStat label="High" value={highCount} color="text-orange-400" />
            <MiniStat label="Overrides" value={overrideCount} color="text-amber-400" />
            <MiniStat label="Breaches" value={breachCount} color="text-red-400" />
          </motion.div>

          {/* Immutable Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.03 }}
            className="mb-6 p-4 rounded-[24px] bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-blue-400 shrink-0" />
              <p className="text-xs text-white/80">
                All events are immutable and tamper-proof. Records cannot be modified or deleted.
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.05 }}
            className="mb-6 space-y-3"
          >
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">
                Severity
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {["all", "CRITICAL", "HIGH", "WARNING", "INFO"].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterSeverity(s)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                      filterSeverity === s
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">
                Event Type
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                    filterType === "all"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}
                >
                  All
                </button>
                {(Object.keys(EVENT_TYPE_LABELS) as AuditEventType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                      filterType === type
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {EVENT_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Event List */}
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 rounded-[28px] bg-white/[0.03] border border-white/[0.05] text-center"
              >
                <p className="text-white/30 text-sm">No events match current filters</p>
              </motion.div>
            ) : (
              filteredEvents.map((event, i) => (
                <AuditEventCard
                  key={event.id}
                  event={event}
                  isExpanded={expandedEvent === event.id}
                  onToggle={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  delay={0.1 + i * 0.03}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* -------- Sub-Components -------- */

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-3 rounded-[20px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-center">
      <p className={`text-lg ${color}`}>{value}</p>
      <p className="text-[8px] text-white/30 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function AuditEventCard({
  event,
  isExpanded,
  onToggle,
  delay,
}: {
  event: AuditEvent;
  isExpanded: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const config = getAuditSeverityConfig(event.severity);
  const eventTime = new Date(event.timestamp);
  const timeStr = eventTime.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
    >
      <button
        onClick={onToggle}
        className={`w-full p-4 rounded-[24px] border backdrop-blur-xl text-left transition-all hover:bg-white/5 active:scale-[0.99] ${config.border} ${config.bg}`}
      >
        <div className="flex items-start gap-3">
          {/* Severity dot */}
          <div className="pt-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${config.bg} ${config.text} border ${config.border}`}>
                  {event.severity}
                </span>
                <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-white/5 text-white/50">
                  {EVENT_TYPE_LABELS[event.eventType]}
                </span>
              </div>
              <ChevronDown size={14} className={`text-white/20 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </div>

            {/* Description */}
            <p className="text-xs text-white/80 leading-relaxed mb-2">{event.description}</p>

            {/* Meta */}
            <div className="flex items-center gap-3 text-[10px] text-white/30">
              <span>{event.actorName}</span>
              <span>·</span>
              <span className="capitalize">{event.actorRole}</span>
              <span>·</span>
              <span>{timeStr}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-4 rounded-[20px] bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={12} className="text-blue-400" />
                <p className="text-[9px] uppercase tracking-[0.2em] text-blue-400/80 font-bold">
                  Event Details (Immutable)
                </p>
              </div>
              {Object.entries(event.details).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-[10px] text-white/40 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="text-[10px] text-white/70 font-medium">{String(value)}</span>
                </div>
              ))}
              {event.correlationId && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[10px] text-white/40">Correlation ID</span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">{event.correlationId}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[10px] text-white/40">Event ID</span>
                <span className="text-[10px] text-white/30 font-mono">{event.id}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}