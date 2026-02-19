import { ArrowLeft, Brain, TrendingUp, Shield, Clock, Receipt, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface InsightsHubProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

interface InsightCard {
  id: string;
  label: string;
  description: string;
  icon: any;
  category: string;
}

/**
 * INSIGHTS HUB
 * 
 * Central navigation hub for all insight features in BizPay Cash OS.
 * Accessible via: DockGrid → Insights
 * 
 * Purpose: Consolidate all behavioral intelligence, reporting, and monitoring features.
 * Navigation: Click any card to access the feature screen.
 */
export default function InsightsHub({ onBack, onNavigate }: InsightsHubProps) {
  // Log activity on mount
  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_insights_hub_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_INSIGHTS_HUB" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Opened Insights Hub (central navigation for all insight features)",
      entityType: "insights_hub",
      metadata: {},
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  // All insight features organized by category
  const insightCards: InsightCard[] = [
    // CASH BEHAVIOR & INTELLIGENCE
    {
      id: "smart-alerts",
      label: "Smart Alerts",
      description: "Behavioral cash insights • Read-only intelligence",
      icon: Brain,
      category: "Cash Behavior",
    },
    {
      id: "cash-intelligence",
      label: "Cash Intelligence",
      description: "Cash runway, Safe balance, Forecasting",
      icon: TrendingUp,
      category: "Cash Behavior",
    },

    // RECEIVABLES & PAYABLES
    {
      id: "receivables-intelligence",
      label: "Receivables Intelligence",
      description: "AR command center • DSO, Aging, Customer actions",
      icon: Receipt,
      category: "Receivables & Payables",
    },
    {
      id: "payables-intelligence",
      label: "Payables Intelligence",
      description: "AP command center • Vendor aging, Payment scheduling",
      icon: Wallet,
      category: "Receivables & Payables",
    },

    // RISK & MONITORING
    {
      id: "risk-dashboard",
      label: "Risk Dashboard",
      description: "Fraud prevention & monitoring",
      icon: Shield,
      category: "Risk & Monitoring",
    },

    // OPERATIONAL INTELLIGENCE
    {
      id: "timeline",
      label: "Timeline View",
      description: "Schedule view, Payment calendar",
      icon: Clock,
      category: "Operations",
    },
  ];

  // Group cards by category
  const categories = Array.from(new Set(insightCards.map(c => c.category)));

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* HEADER */}
      <header className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Insights</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Behavioral Intelligence • Reporting • Monitoring
          </p>
        </div>
      </header>

      {/* PURPOSE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-8 p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        <p className="text-sm text-white/80 leading-relaxed">
          Access behavioral cash insights, risk monitoring, operational intelligence, and reporting tools.
          All features are designed for CFO-grade decision support.
        </p>
      </motion.div>

      {/* INSIGHT CARDS BY CATEGORY */}
      {categories.map((category, catIndex) => (
        <div key={category} className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.05 + catIndex * 0.05 }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
              {category}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-3">
            {insightCards
              .filter(card => card.category === category)
              .map((card, i) => {
                const Icon = card.icon;
                const isSmartAlerts = card.id === "smart-alerts";

                return (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING, delay: 0.1 + catIndex * 0.05 + i * 0.03 }}
                    onClick={() => onNavigate(card.id)}
                    className={`group relative p-5 rounded-[28px] border backdrop-blur-xl text-left transition-all duration-300 active:scale-[0.98] ${
                      isSmartAlerts
                        ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50 shadow-[inset_0_1px_1px_rgba(6,182,212,0.2)]"
                        : "bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isSmartAlerts
                            ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/30"
                            : "bg-white/5 border border-white/10 text-white/60 group-hover:bg-white/10 group-hover:text-white/80"
                        }`}
                      >
                        <Icon size={20} strokeWidth={isSmartAlerts ? 2.5 : 2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {card.label}
                          </h3>
                        </div>
                        <p
                          className={`text-sm ${isSmartAlerts ? "text-cyan-200/80" : "text-white/60"}`}
                        >
                          {card.description}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSmartAlerts ? "bg-cyan-500/20 text-cyan-400" : "bg-white/10 text-white/60"
                          }`}
                        >
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}