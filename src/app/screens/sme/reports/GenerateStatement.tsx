import { useState } from "react";
import { ArrowLeft, Search, FileDown, FileSpreadsheet, Calendar, ChevronDown } from "lucide-react";

interface GenerateStatementProps {
  onBack: () => void;
}

export default function GenerateStatement({ onBack }: GenerateStatementProps) {
  const [mode, setMode] = useState<"simple" | "branch">("simple");
  const [dateFilter, setDateFilter] = useState<"txn" | "value">("txn");

  return (
    <div className="relative h-full text-slate-50 px-6 pt-8 bg-transparent overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-10 relative z-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-white">Export Transactions</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">Statement Generation</p>
        </div>
      </header>

      <div className="space-y-8 relative z-10 pb-12">
        {/* Mode Selection - Premium Segmented Control */}
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Statement Type</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "simple" as const, label: "Generate Statement" },
              { id: "branch" as const, label: "Include Branch & Value Date" }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={`
                  flex items-center p-4 rounded-2xl border transition-all duration-300 text-left
                  ${mode === opt.id 
                    ? "bg-cyan-500/20 border-cyan-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" 
                    : "bg-white/[0.03] border-white/10 opacity-60"}
                  active:scale-[0.98]
                `}
              >
                <div className={`w-4 h-4 rounded-full border-2 mr-4 flex items-center justify-center ${mode === opt.id ? "border-cyan-400" : "border-white/20"}`}>
                  {mode === opt.id && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Company Account */}
        <Field label="Company Account">
          <div className="relative group">
            <select className="input-premium appearance-none">
              <option>2052836410001</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
              <ChevronDown size={16} />
            </div>
          </div>
        </Field>

        {/* Conditional Date UI */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {mode === "simple" ? (
            <SimpleDates />
          ) : (
            <BranchDates dateFilter={dateFilter} setDateFilter={setDateFilter} />
          )}
        </div>

        {/* Action Buttons - Stiff Spring Physics */}
        <div className="grid grid-cols-1 gap-3 pt-4">
          <button className="btn-premium bg-cyan-500 text-slate-900 shadow-cyan-900/30">
            <Search size={18} /> Search Transactions
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-premium bg-white/5 border-white/10 hover:bg-white/10">
              <FileDown size={18} /> PDF
            </button>
            <button className="btn-premium bg-white/5 border-white/10 hover:bg-white/10">
              <FileSpreadsheet size={18} /> Excel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .input-premium {
          @apply w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4
                 text-sm text-white outline-none transition-all duration-300
                 focus:border-cyan-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)];
        }
        .btn-premium {
          @apply flex items-center justify-center gap-2 h-[56px] rounded-2xl font-bold text-sm
                 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                 active:scale-[0.96] border border-white/10;
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
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{label}</label>
      {children}
    </div>
  );
}

function SimpleDates() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="From Date">
        <div className="relative">
          <input type="text" defaultValue="24-01-2026" className="input-premium pl-12" />
          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        </div>
      </Field>
      <Field label="To Date">
        <div className="relative">
          <input type="text" defaultValue="24-01-2026" className="input-premium pl-12" />
          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        </div>
      </Field>
    </div>
  );
}

interface BranchDatesProps {
  dateFilter: "txn" | "value";
  setDateFilter: (filter: "txn" | "value") => void;
}

function BranchDates({ dateFilter, setDateFilter }: BranchDatesProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
        <button 
          onClick={() => setDateFilter("txn")}
          className={`py-2 text-[10px] font-bold uppercase tracking-tighter rounded-xl transition-all ${dateFilter === 'txn' ? 'bg-cyan-500 text-slate-900 shadow-lg' : 'opacity-40'}`}
        >
          Txn Date
        </button>
        <button 
          onClick={() => setDateFilter("value")}
          className={`py-2 text-[10px] font-bold uppercase tracking-tighter rounded-xl transition-all ${dateFilter === 'value' ? 'bg-cyan-500 text-slate-900 shadow-lg' : 'opacity-40'}`}
        >
          Value Date
        </button>
      </div>
      <SimpleDates />
    </div>
  );
}