import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { motion } from "motion/react";

interface CollectionMatchScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function CollectionMatchScreen({ onBack }: CollectionMatchScreenProps) {
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
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Collection Matching</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Intelligent Matching
          </p>
        </div>
      </header>

      {/* Feature Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING}
        className="p-8 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-center mb-6"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <RefreshCw size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-serif font-bold text-white mb-2">Auto-Match Collections</h2>
        <p className="text-white/60 text-sm mb-6">
          Intelligent system to match inflows with outstanding invoices
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDBA12]/20 border border-[#EDBA12]/30 text-[#EDBA12] text-sm font-medium">
          🎯 System Workflow
        </div>
      </motion.div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <FeatureCard
          icon={<CheckCircle size={20} className="text-emerald-400" />}
          label="Auto Matching"
          description="Reference-based"
          delay={0.1}
        />
        <FeatureCard
          icon={<AlertCircle size={20} className="text-amber-400" />}
          label="Exception Queue"
          description="Manual review"
          delay={0.15}
        />
        <FeatureCard
          icon={<Clock size={20} className="text-blue-400" />}
          label="Aging Tracker"
          description="Outstanding items"
          delay={0.2}
        />
        <FeatureCard
          icon={<RefreshCw size={20} className="text-purple-400" />}
          label="Batch Processing"
          description="Bulk matching"
          delay={0.25}
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, label, description, delay }: { icon: React.ReactNode; label: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className="p-4 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
    >
      <div className="mb-3">{icon}</div>
      <p className="text-sm font-semibold text-white mb-1">{label}</p>
      <p className="text-xs text-white/60">{description}</p>
    </motion.div>
  );
}