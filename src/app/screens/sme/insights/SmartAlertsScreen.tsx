import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { BEHAVIORAL_INSIGHTS } from "../../../data/smartAlerts.mock";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface SmartAlertsScreenProps {
  onBack: () => void;
}

/**
 * SMART BEHAVIORAL ALERTS
 * 
 * NON-NEGOTIABLE RULES:
 * - Currency: ৳ only (never ₹)
 * - Nature: Read-only behavioral intelligence (NOT notifications, NOT actionable)
 * - CASA Rule: Must never accelerate cash outflow, must slow decisions
 * - NO buttons, NO links, NO CTAs, NO actions, NO drill-downs, NO severity colors
 * - Calm, CFO-grade tone
 * - Static mock data only
 * 
 * This feature explains HOW PAST BEHAVIOR affected cash.
 * It does NOT tell users what to do.
 * It does NOT execute anything.
 * It does NOT redirect anywhere.
 */
export default function SmartAlertsScreen({ onBack }: SmartAlertsScreenProps) {
  // Log activity on mount
  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_smart_alerts_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_SMART_ALERTS" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Viewed Smart Behavioral Alerts (read-only cash behavior insights)",
      entityType: "smart_alerts",
      metadata: {
        insightCount: BEHAVIORAL_INSIGHTS.length,
      },
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* 1️⃣ HEADER SECTION (MANDATORY) */}
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          {/* Title: Smart Alerts */}
          <h1 className="text-3xl font-serif tracking-tight">Smart Alerts</h1>
          {/* Subtitle: Behavioral Cash Insights */}
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Behavioral Cash Insights
          </p>
        </div>
      </header>

      {/* One-line purpose text (EXACT COPY FROM SPEC) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6"
      >
        <p className="text-sm text-white/80 leading-relaxed">
          These insights explain how past payment and collection behavior impacted your cash
          balance.
        </p>
      </motion.div>

      {/* 2️⃣ SYSTEM SAFETY BANNER (REQUIRED - EXACT STRUCTURE) */}
      <div className="mb-6 p-4 rounded-[24px] bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl">
        <p className="text-xs text-white/80">
          <span className="font-bold text-cyan-400">Live Insight:</span>
          <br />
          All statements use illustrative data. No actions are triggered.
          <br />
          This screen explains behavior impact — it does not execute decisions.
        </p>
      </div>

      {/* 3️⃣ INSIGHT CARDS (CORE CONTENT - 5 CANONICAL CARDS) */}
      <div className="space-y-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Behavioral Insights
        </p>

        {BEHAVIORAL_INSIGHTS.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.1 + i * 0.05 }}
            className="p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
          >
            {/* Short headline */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-serif text-white tracking-tight">
                {insight.headline}
              </h3>
              {/* Numeric impact (৳ or %) - calm styling, no urgency colors */}
              <span className="text-sm font-semibold text-cyan-400/80 shrink-0 ml-3">
                {insight.impact}
              </span>
            </div>

            {/* 1-2 sentence explanation - neutral tone */}
            <p className="text-sm text-white/70 leading-relaxed">{insight.explanation}</p>

            {/* NO buttons, NO links, NO "Fix now", NO actions - read-only appearance */}
          </motion.div>
        ))}
      </div>

      {/* EXPLICITLY FORBIDDEN ELEMENTS (DO NOT ADD):
          ❌ Buttons
          ❌ Links
          ❌ "Fix now" / "Act" / "Proceed" / "Optimize"
          ❌ Auto-navigation
          ❌ Drill-downs
          ❌ Severity badges (red/green urgency colors)
          ❌ Notification bell behavior
      */}
    </div>
  );
}