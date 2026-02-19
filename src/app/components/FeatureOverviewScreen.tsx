import { ArrowLeft, LucideIcon } from "lucide-react";
import { motion } from "motion/react";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface FeatureOverviewScreenProps {
  title: string;
  subtitle: string;
  purpose: string;
  features: string[];
  icon?: LucideIcon;
  onBack: () => void;
}

export default function FeatureOverviewScreen({
  title,
  subtitle,
  purpose,
  features,
  icon: Icon,
  onBack,
}: FeatureOverviewScreenProps) {
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
      <header className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">{title}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            {subtitle}
          </p>
        </div>
      </header>

      {/* Configuration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Icon size={22} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-serif text-white mb-2">Capability Purpose</h2>
            <p className="text-xs text-white/70 leading-relaxed">{purpose}</p>
          </div>
        </div>
      </motion.div>

      {/* Feature List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-6 p-6 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <h3 className="text-sm font-serif text-white mb-4">Key Capabilities</h3>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.15 + idx * 0.05 }}
              className="flex items-start gap-3 text-sm text-white/80"
            >
              <span className="text-cyan-400 shrink-0">→</span>
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold">
          Feature Overview — Configuration Interface
        </div>
      </motion.div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.3 }}
        className="mt-8 px-5 py-4 rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl"
      >
        <p className="text-xs text-white/50 text-center">
          <span className="font-bold text-white/60">System Note:</span> This section provides an overview of the capability scope and configuration parameters.
        </p>
      </motion.div>
    </div>
  );
}
