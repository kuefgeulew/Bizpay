import { useState } from "react";
import { ArrowLeft, ShieldAlert, TrendingUp, Users, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { motion } from "motion/react";
import LimitConfigurationScreen from "./LimitConfigurationScreen";
import TransactionPreCheckScreen from "./TransactionPreCheckScreen";
import EscalationRulesScreen from "./EscalationRulesScreen";
import LimitBreachHistoryScreen from "./LimitBreachHistoryScreen";

interface TransactionLimitsHubProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function TransactionLimitsHub({ onBack }: TransactionLimitsHubProps) {
  const [view, setView] = useState<"menu" | "limits" | "precheck" | "escalation" | "history">("menu");

  // Route to sub-screens
  if (view === "limits") {
    return <LimitConfigurationScreen onBack={() => setView("menu")} />;
  }
  if (view === "precheck") {
    return <TransactionPreCheckScreen onBack={() => setView("menu")} />;
  }
  if (view === "escalation") {
    return <EscalationRulesScreen onBack={() => setView("menu")} />;
  }
  if (view === "history") {
    return <LimitBreachHistoryScreen onBack={() => setView("menu")} />;
  }

  // Main hub menu
  const menuItems = [
    {
      id: "limits",
      icon: ShieldAlert,
      title: "Role-Based Limits",
      description: "View transaction limits for each role",
      color: "from-cyan-500 to-teal-500",
      badge: "5 Roles",
    },
    {
      id: "precheck",
      icon: TrendingUp,
      title: "Transaction Pre-Check",
      description: "Simulate limit validation before submission",
      color: "from-emerald-500 to-teal-500",
      badge: "Live Check",
    },
    {
      id: "escalation",
      icon: Users,
      title: "Escalation Rules",
      description: "Auto-escalation matrix & approval workflows",
      color: "from-purple-500 to-pink-500",
      badge: "5 Rules",
    },
    {
      id: "history",
      icon: AlertTriangle,
      title: "Limit Breach History",
      description: "View past limit violations & actions taken",
      color: "from-orange-500 to-red-500",
      badge: "4 Events",
    },
  ];

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Header */}
      <header className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Transaction Limits</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Role-Based Controls
          </p>
        </div>
      </header>

      {/* System Note */}
      <div className="mb-6 p-4 rounded-[24px] bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-white/90 leading-relaxed">
            <span className="font-bold">System Note:</span> All limits shown are illustrative and represent the configuration interface for transaction controls.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...SPRING }}
          className="p-4 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl"
        >
          <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
          <p className="text-2xl font-black text-white">12</p>
          <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Within Limits</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ...SPRING }}
          className="p-4 rounded-[24px] bg-orange-500/10 border border-orange-500/20 backdrop-blur-xl"
        >
          <AlertTriangle className="w-8 h-8 text-orange-400 mb-2" />
          <p className="text-2xl font-black text-white">4</p>
          <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Escalated</p>
        </motion.div>
      </div>

      {/* Feature Menu */}
      <div className="space-y-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05, ...SPRING }}
              onClick={() => setView(item.id as any)}
              className="w-full group"
            >
              <div className="relative p-5 rounded-[28px] bg-white/[0.02] backdrop-blur-[45px] border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/[0.05] transition-all overflow-hidden">
                {/* Gradient Accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                {/* Content */}
                <div className="relative flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-white">{item.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-bold text-white/80 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-snug">{item.description}</p>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <ArrowLeft size={14} className="text-white/60 rotate-180" />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}