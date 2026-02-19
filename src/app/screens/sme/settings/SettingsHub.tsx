import { ArrowLeft, Building2, FileKey, BookOpen, ShieldCheck, Key, Settings, Store, Plug, ShieldBan, ArrowLeftRight, Lock, CalendarClock } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";
import MarketplaceScreen from "./MarketplaceScreen";
import IntegrationsScreen from "./IntegrationsScreen";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface SettingsHubProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

interface SettingsCard {
  id: string;
  label: string;
  description: string;
  icon: any;
  category: string;
}

export default function SettingsHub({ onBack, onNavigate }: SettingsHubProps) {
  const [internalView, setInternalView] = useState<string>("hub");

  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_settings_hub_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_SETTINGS_HUB" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Opened Settings Hub",
      entityType: "settings_hub",
      metadata: {},
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  // Internal sub-views (no App.tsx routes needed)
  if (internalView === "marketplace") return <MarketplaceScreen onBack={() => setInternalView("hub")} />;
  if (internalView === "integrations") return <IntegrationsScreen onBack={() => setInternalView("hub")} />;

  const settingsCards: SettingsCard[] = [
    // ACCOUNT & LIQUIDITY
    {
      id: "account-control-tower",
      label: "Account Control Tower",
      description: "Consolidated business liquidity view",
      icon: Building2,
      category: "Account & Liquidity",
    },
    {
      id: "cash-buckets",
      label: "Cash Buckets",
      description: "Multi-wallet allocation strategy",
      icon: FileKey,
      category: "Account & Liquidity",
    },
    {
      id: "tax-vault",
      label: "Tax Vault",
      description: "Pre-ring-fenced compliance pool",
      icon: BookOpen,
      category: "Account & Liquidity",
    },

    // CASH OS — Control & Discipline
    {
      id: "credit-backstop",
      label: "Credit Backstop",
      description: "Overdraft protection & credit buffer configuration",
      icon: ShieldBan,
      category: "Cash OS",
    },
    {
      id: "sweep-park",
      label: "Sweep & Park",
      description: "Automated idle-cash sweep rules & parking",
      icon: ArrowLeftRight,
      category: "Cash OS",
    },
    {
      id: "cash-locks",
      label: "Cash Locks",
      description: "Time-locked & purpose-locked cash discipline",
      icon: Lock,
      category: "Cash OS",
    },
    {
      id: "outflow-controls",
      label: "Outflow Controls",
      description: "Scheduled payment windows & outflow delay rules",
      icon: CalendarClock,
      category: "Cash OS",
    },

    // SERVICE REQUESTS
    {
      id: "service-request",
      label: "Service Requests",
      description: "Positive Pay, Chequebook, Token",
      icon: Settings,
      category: "Service & Support",
    },
    {
      id: "benefits-incentives",
      label: "Benefits & Incentives",
      description: "Privileges earned through balance discipline",
      icon: ShieldCheck,
      category: "Service & Support",
    },

    // BUSINESS TOOLS
    {
      id: "_marketplace",
      label: "Marketplace",
      description: "Partner directory — Accounting, Logistics, Insurance",
      icon: Store,
      category: "Business Tools",
    },
    {
      id: "_integrations",
      label: "Integrations",
      description: "Tally, Zoho, QuickBooks — connection scope",
      icon: Plug,
      category: "Business Tools",
    },
  ];

  const categories = Array.from(new Set(settingsCards.map(c => c.category)));

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
          <h1 className="text-3xl font-serif tracking-tight">Settings</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Account Management • Service Requests • Configuration
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
          Manage account configurations, liquidity allocation, service requests, and system preferences.
        </p>
      </motion.div>

      {/* SETTINGS CARDS BY CATEGORY */}
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
            {settingsCards
              .filter(card => card.category === category)
              .map((card, i) => {
                const Icon = card.icon;
                const isACT = card.id === "account-control-tower";
                const isCashBuckets = card.id === "cash-buckets";
                const isFeature = isACT || isCashBuckets;

                return (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING, delay: 0.1 + catIndex * 0.05 + i * 0.03 }}
                    onClick={() => {
                      // Internal views use setInternalView, external use onNavigate
                      if (card.id === "_marketplace") {
                        setInternalView("marketplace");
                      } else if (card.id === "_integrations") {
                        setInternalView("integrations");
                      } else {
                        onNavigate(card.id);
                      }
                    }}
                    className={`group relative p-5 rounded-[28px] border backdrop-blur-xl text-left transition-all duration-300 active:scale-[0.98] ${
                      isFeature
                        ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50 shadow-[inset_0_1px_1px_rgba(6,182,212,0.2)]"
                        : "bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isFeature
                            ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/30"
                            : "bg-white/5 border border-white/10 text-white/60 group-hover:bg-white/10 group-hover:text-white/80"
                        }`}
                      >
                        <Icon size={20} strokeWidth={isFeature ? 2.5 : 2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {card.label}
                          </h3>
                        </div>
                        <p
                          className={`text-sm ${isFeature ? "text-cyan-200/80" : "text-white/60"}`}
                        >
                          {card.description}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isFeature ? "bg-cyan-500/20 text-cyan-400" : "bg-white/10 text-white/60"
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