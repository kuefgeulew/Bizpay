import { ArrowLeft, Zap, Clock, Info, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface SettlementPreferencesScreenProps {
  onBack: () => void;
}

export default function SettlementPreferencesScreen({ onBack }: SettlementPreferencesScreenProps) {
  const [settlementMode, setSettlementMode] = useState<"t0" | "t1">("t0");

  const modes = [
    {
      id: "t0" as const,
      label: "Same-Day (T+0)",
      description: "Funds available in your current account on the same business day. Ideal for maintaining real-time liquidity visibility.",
      icon: Zap,
      fee: "৳15 per settlement batch",
      timing: "Cut-off: 3:00 PM BST",
    },
    {
      id: "t1" as const,
      label: "Next-Day (T+1)",
      description: "Standard settlement cycle. Funds credited by next business day morning. No additional processing fees apply.",
      icon: Clock,
      fee: "No additional fee",
      timing: "Credited by 9:00 AM next business day",
    },
  ];

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
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Settlement</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Collection Settlement Preferences
          </p>
        </div>
      </header>

      {/* Current Setting Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-6 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Active Configuration
        </p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            {settlementMode === "t0" ? (
              <Zap size={24} className="text-cyan-400" />
            ) : (
              <Clock size={24} className="text-cyan-400" />
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              {settlementMode === "t0" ? "Same-Day Settlement" : "Next-Day Settlement"}
            </p>
            <p className="text-xs text-white/60">
              {settlementMode === "t0" ? "T+0 — Real-time liquidity" : "T+1 — Standard cycle"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mode Selection */}
      <div className="space-y-4 mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
          Settlement Cycle
        </p>
        {modes.map((mode, i) => {
          const Icon = mode.icon;
          const isActive = settlementMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: i * 0.05 }}
              onClick={() => setSettlementMode(mode.id)}
              className={`w-full text-left p-5 rounded-[28px] border backdrop-blur-xl transition-all active:scale-[0.98] ${
                isActive
                  ? "bg-cyan-500/10 border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border shrink-0 ${
                  isActive
                    ? "bg-cyan-500/20 border-cyan-500/30"
                    : "bg-white/5 border-white/10"
                }`}>
                  <Icon size={20} className={isActive ? "text-cyan-400" : "text-white/40"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-bold text-sm ${isActive ? "text-white" : "text-white/80"}`}>
                      {mode.label}
                    </p>
                    {isActive && (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed mb-3">{mode.description}</p>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-white/40">{mode.fee}</span>
                    <span className="text-white/40">{mode.timing}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Fee Visibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
        className="mb-6 p-5 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Fee Summary
        </p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Settlement Fee (T+0)</span>
            <span className="text-white/90">৳15 / batch</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Settlement Fee (T+1)</span>
            <span className="text-emerald-400">Free</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t border-white/10">
            <span className="text-white/60">Current Monthly Estimate</span>
            <span className="text-white/90">
              {settlementMode === "t0" ? "৳450" : "৳0"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Settlement History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.18 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-cyan-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Settlement History — Last 30 Days
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-[24px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-cyan-400" />
              <p className="text-[10px] text-white/60 uppercase tracking-wide">T+0 Settlements</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">24</p>
            <p className="text-[10px] text-white/40 mt-1">৳1,847,500 total</p>
          </div>
          <div className="p-4 rounded-[24px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-purple-400" />
              <p className="text-[10px] text-white/60 uppercase tracking-wide">T+1 Settlements</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">6</p>
            <p className="text-[10px] text-white/40 mt-1">৳412,000 total</p>
          </div>
        </div>

        <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-2.5">
          {[
            { date: "18 Feb 2026", type: "T+0", count: 3, amount: "৳246,500", status: "settled" },
            { date: "17 Feb 2026", type: "T+0", count: 4, amount: "৳389,200", status: "settled" },
            { date: "16 Feb 2026", type: "T+0", count: 2, amount: "৳175,300", status: "settled" },
            { date: "15 Feb 2026", type: "T+1", count: 1, amount: "৳68,000", status: "settled" },
            { date: "14 Feb 2026", type: "T+0", count: 5, amount: "৳512,400", status: "settled" },
          ].map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 w-24">
                  <Calendar size={10} />
                  {entry.date.replace(" 2026", "")}
                </div>
                <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full border uppercase tracking-wider ${
                  entry.type === "T+0"
                    ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/25"
                    : "bg-purple-500/15 text-purple-400 border-purple-500/25"
                }`}>
                  {entry.type}
                </span>
                <span className="text-[10px] text-white/40">{entry.count} batch{entry.count > 1 ? "es" : ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white/80">{entry.amount}</span>
                <CheckCircle size={12} className="text-emerald-400/70" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="p-4 rounded-[24px] bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl"
      >
        <div className="flex items-start gap-3">
          <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-white/80 leading-relaxed">
            <span className="font-bold text-white">System Note:</span> Settlement preferences apply to all collection channels including Bangla QR and Payment Links. Changes take effect from the next business day.
          </p>
        </div>
      </motion.div>
    </div>
  );
}