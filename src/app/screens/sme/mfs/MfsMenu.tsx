import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import MfsModeMenu from "./MfsModeMenu";

// Premium Stiff Spring Physics for a high-end mechanical feel
const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 35 };

/** Brand configuration for MFS providers */
const MFS_PROVIDERS: {
  name: string;
  brandColor: string;
  brandBg: string;
  brandBorder: string;
  brandText: string;
  initials: string;
}[] = [
  {
    name: "bKash",
    brandColor: "#E2136E",
    brandBg: "bg-[#E2136E]/15",
    brandBorder: "border-[#E2136E]/30",
    brandText: "text-[#E2136E]",
    initials: "bK",
  },
  {
    name: "Nagad",
    brandColor: "#F6921E",
    brandBg: "bg-[#F6921E]/15",
    brandBorder: "border-[#F6921E]/30",
    brandText: "text-[#F6921E]",
    initials: "Ng",
  },
  {
    name: "Rocket",
    brandColor: "#8B2F91",
    brandBg: "bg-[#8B2F91]/15",
    brandBorder: "border-[#8B2F91]/30",
    brandText: "text-[#8B2F91]",
    initials: "Rk",
  },
  {
    name: "Upay",
    brandColor: "#00A651",
    brandBg: "bg-[#00A651]/15",
    brandBorder: "border-[#00A651]/30",
    brandText: "text-[#00A651]",
    initials: "Up",
  },
  {
    name: "SureCash",
    brandColor: "#22d3ee",
    brandBg: "bg-cyan-500/15",
    brandBorder: "border-cyan-500/30",
    brandText: "text-cyan-400",
    initials: "SC",
  },
];

interface MfsMenuProps {
  onBack: () => void;
  prefillProvider?: string;
}

export default function MfsMenu({ onBack, prefillProvider }: MfsMenuProps) {
  const [provider, setProvider] = useState<string | null>(null);

  // Auto-navigate to prefilled provider on mount
  useEffect(() => {
    if (prefillProvider) {
      const match = MFS_PROVIDERS.find(
        (p) => p.name.toLowerCase() === prefillProvider.toLowerCase()
      );
      if (match) {
        setProvider(match.name);
      }
    }
  }, []); // Run once on mount

  if (provider) {
    return (
      <MfsModeMenu
        provider={provider}
        onBack={() => setProvider(null)}
      />
    );
  }

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
        <div>
          <h1 className="text-3xl font-serif tracking-tight">MFS Transfer</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Select Provider
          </p>
        </div>
      </header>

      {/* Provider List */}
      <div className="space-y-3 max-w-2xl mx-auto">
        {MFS_PROVIDERS.map((p, idx) => (
          <motion.button
            key={p.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...STIFF_SPRING, delay: idx * 0.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setProvider(p.name)}
            className="
              group w-full flex justify-between items-center px-6 py-5
              bg-white/5 backdrop-blur-xl rounded-[24px] 
              border border-white/10
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
              hover:bg-white/10 hover:border-white/20 transition-all
            "
          >
            <div className="flex items-center gap-4">
              {/* Brand Logo Badge */}
              <div
                className={`w-10 h-10 rounded-xl ${p.brandBg} ${p.brandBorder} border flex items-center justify-center shrink-0`}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: p.brandColor }}
                >
                  {p.initials}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-white tracking-tight block">
                  {p.name}
                </span>
                <span className="text-[9px] text-white/30 uppercase tracking-wider">
                  Mobile Financial Services
                </span>
              </div>
            </div>

            <ChevronRight
              size={18}
              className="text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}