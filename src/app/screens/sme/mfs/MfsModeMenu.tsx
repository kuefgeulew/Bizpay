import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, User, Users, ChevronRight } from "lucide-react";
import SingleMfsTransfer from "./SingleMfsTransfer";
import BulkMfsTransfer from "./BulkMfsTransfer";

// Stiff Spring for mechanical, premium interaction
const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 35 };

/** MFS brand config for logos */
const MFS_BRAND: Record<string, { color: string; bg: string; border: string; initials: string }> = {
  bKash: { color: "#E2136E", bg: "bg-[#E2136E]/15", border: "border-[#E2136E]/30", initials: "bK" },
  Nagad: { color: "#F6921E", bg: "bg-[#F6921E]/15", border: "border-[#F6921E]/30", initials: "Ng" },
  Rocket: { color: "#8B2F91", bg: "bg-[#8B2F91]/15", border: "border-[#8B2F91]/30", initials: "Rk" },
  Upay: { color: "#00A651", bg: "bg-[#00A651]/15", border: "border-[#00A651]/30", initials: "Up" },
};

interface MfsModeMenuProps {
  provider: string;
  onBack: () => void;
}

export default function MfsModeMenu({ provider, onBack }: MfsModeMenuProps) {
  const [mode, setMode] = useState<string | null>(null);

  const brand = MFS_BRAND[provider] || { color: "#22d3ee", bg: "bg-cyan-500/15", border: "border-cyan-500/30", initials: provider.slice(0, 2) };

  if (mode === "single")
    return <SingleMfsTransfer provider={provider} onBack={() => setMode(null)} />;

  if (mode === "bulk")
    return <BulkMfsTransfer provider={provider} onBack={() => setMode(null)} />;

  const modes = [
    { id: "single", label: "Single Transfer", icon: <User size={18} /> },
    { id: "bulk", label: "Bulk Transfer", icon: <Users size={18} /> },
  ];

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className={`w-10 h-10 rounded-xl ${brand.bg} ${brand.border} border flex items-center justify-center shrink-0`}>
          <span className="text-xs font-bold" style={{ color: brand.color }}>{brand.initials}</span>
        </div>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">{provider} Transfer</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">Select Mode</p>
        </div>
      </header>

        {/* Mode Selection */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {modes.map((m, idx) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...STIFF_SPRING, delay: idx * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode(m.id)}
              className="
                group w-full flex justify-between items-center px-6 py-5
                bg-white/5 backdrop-blur-xl rounded-[24px] 
                border border-white/10
                shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                hover:bg-white/10 hover:border-white/20 transition-all
              "
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/70 group-hover:text-cyan-400 transition-colors">
                  {m.icon}
                </div>
                <span className="text-sm font-medium text-white tracking-tight">
                  {m.label}
                </span>
              </div>
              
              <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </motion.button>
          ))}
        </div>
    </div>
  );
}