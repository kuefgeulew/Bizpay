/**
 * NPSB TRANSFER — TOP-LEVEL MENU
 * Routes to Within BBPLC or Outside BBPLC sub-flows.
 * Internal view state only — no App.tsx route growth.
 */

import { useState } from "react";
import { ArrowLeft, Building2, Globe } from "lucide-react";
import { motion } from "motion/react";
import NpsbWithinBBPLCScreen from "./NpsbWithinBBPLCScreen";
import NpsbOutsideBBPLCScreen from "./NpsbOutsideBBPLCScreen";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface NpsbMenuProps {
  onBack: () => void;
}

export default function NpsbMenu({ onBack }: NpsbMenuProps) {
  const [subView, setSubView] = useState<"menu" | "within" | "outside">("menu");

  if (subView === "within") {
    return <NpsbWithinBBPLCScreen onBack={() => setSubView("menu")} />;
  }
  if (subView === "outside") {
    return <NpsbOutsideBBPLCScreen onBack={() => setSubView("menu")} />;
  }

  return (
    <div className="relative h-full text-white px-8 pt-10 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <header className="flex items-center gap-4 mb-12">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">NPSB Transfer</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            National Payment Switch
          </p>
        </div>
      </header>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-[20px] backdrop-blur-xl">
        <p className="text-[11px] text-white/60 leading-relaxed">
          Transfer funds via the National Payment Switch Bangladesh (NPSB). Select whether the
          destination is within BRAC Bank PLC or another participating bank.
        </p>
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        {[
          {
            id: "within" as const,
            icon: <Building2 size={24} />,
            title: "Within BBPLC",
            description: "BRAC Bank PLC accounts via NPSB rails",
          },
          {
            id: "outside" as const,
            icon: <Globe size={24} />,
            title: "Outside BBPLC",
            description: "Inter-bank transfer to other banks",
          },
        ].map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: idx * 0.05 }}
            onClick={() => setSubView(item.id)}
            className="group w-full relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98] overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/10 text-cyan-400 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-lg font-bold text-white tracking-tight truncate">
                  {item.title}
                </div>
                <div className="text-[11px] text-white/60 mt-0.5 truncate">
                  {item.description}
                </div>
              </div>
              <div className="text-white/30 group-hover:text-white/60 transition-colors shrink-0">
                <ArrowLeft size={18} className="rotate-180" />
              </div>
            </div>

            {/* Shimmer */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-[-25deg]" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
