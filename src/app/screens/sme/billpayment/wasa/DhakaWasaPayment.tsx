import { ArrowLeft, ChevronDown, ShieldCheck, Droplets } from "lucide-react";
import { motion } from "motion/react";

interface DhakaWasaPaymentProps {
  onBack: () => void;
}

export default function DhakaWasaPayment({ onBack }: DhakaWasaPaymentProps) {
  // Stiff Spring Physics Configuration
  const springConfig = { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      
      {/* 1. LAYER: Adaptive Noise Floor (Film Grain) */}
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
          <h1 className="text-3xl font-serif tracking-tight text-white">Dhaka WASA</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">Bill Payment Portal</p>
        </div>
      </header>

      {/* 3. Main Glass Card with Rim Lighting */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden max-w-xl mx-auto"
      >
        <div className="p-8 md:p-10 space-y-9">

          {/* Collection Method (Logic: Post Paid Only) */}
          <Field label="Collection Method *">
            <div className="flex p-1.5 bg-white/[0.04] rounded-2xl border border-white/5 w-fit">
              <div className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-white/10 shadow-inner">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Post Paid</span>
              </div>
            </div>
          </Field>

          {/* Form Fields */}
          <div className="space-y-7">
            <Field label="Debit Account *">
              <div className="relative group">
                <select className="bp-field font-mono tracking-tight">
                  <option className="bg-[#080c16]">TEST-1 [ AC:2052836410001 ]</option>
                </select>
                <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none group-focus-within:text-cyan-400 transition-colors" />
              </div>
            </Field>

            <Field label="Bill Number *">
              <div className="relative group">
                <input className="bp-field" placeholder="Enter 12-digit bill number" />
                <Droplets size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-cyan-400/30 transition-colors" />
              </div>
            </Field>

            <Field label="Remarks *">
              <input className="bp-field" placeholder="Enter reference remarks" />
            </Field>
          </div>

          {/* Premium Button with Shimmer */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-2xl transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs overflow-hidden"
          >
            <ShieldCheck size={18} />
            <span className="relative z-10">Validate Information</span>
          </motion.button>
        </div>
      </motion.div>

      <style>{`
        .bp-field {
          @apply w-full bg-white/[0.03] border border-white/10 rounded-[20px] px-6 py-4 outline-none 
                 focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all 
                 placeholder:text-white/20 text-[15px] appearance-none
                 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)];
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

/* Helpers (Maintaining Logic Structure) */

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 mb-4 block ml-1">{label}</label>
      {children}
    </div>
  );
}