import { ArrowLeft, ChevronDown, Search } from "lucide-react";

interface DDFileSummaryProps {
  onBack: () => void;
}

export default function DDFileSummary({ onBack }: DDFileSummaryProps) {
  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto scrollbar-hide">
      {/* 1. Subtle Film Grain Layer */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <button 
          onClick={onBack} 
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">DD File Summary</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">Reports & Analytics</p>
        </div>
      </div>

      {/* Main Premium Glass Card */}
      <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[28px] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] group">
        
        {/* Interior Rim Lighting Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-2 mb-6">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Generate File Report</h2>
        </div>

        <div className="space-y-6">
          {/* Row 1: Dates */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="From Date">
              <input type="date" className="input-premium" defaultValue="2026-01-24" />
            </Field>

            <Field label="To Date">
              <input type="date" className="input-premium" defaultValue="2026-01-24" />
            </Field>
          </div>

          {/* Row 2: Mode & Account */}
          <div className="space-y-6">
            <Field label="Mode of Transaction">
              <div className="relative group/select">
                <select className="input-premium appearance-none pr-10 cursor-pointer">
                  <option className="bg-slate-900">--SELECT--</option>
                  <option className="bg-slate-900">Single</option>
                  <option className="bg-slate-900">Bulk</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/select:text-cyan-400 transition-colors pointer-events-none" />
              </div>
            </Field>

            <Field label="Credit Account Number">
              <input type="text" className="input-premium" placeholder="e.g. 1074165690001" />
            </Field>
          </div>

          {/* Search Button with Stiff Spring */}
          <button className="
            w-full h-[58px] mt-4
            bg-cyan-500 border-t border-white/20
            shadow-[0_15px_30px_-10px_rgba(6,182,212,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]
            hover:bg-cyan-400 text-slate-900 transition-all duration-300
            active:scale-[0.96] active:shadow-inner
            rounded-2xl font-bold flex items-center justify-center gap-3 tracking-wide
          ">
            <Search size={20} />
            SEARCH RECORDS
          </button>
        </div>
      </div>

      <style>{`
        .input-premium {
          @apply w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4
                 text-sm text-white outline-none transition-all duration-300
                 placeholder:text-white/20
                 focus:border-cyan-500/50 focus:bg-white/[0.07]
                 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)];
        }
      `}</style>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}