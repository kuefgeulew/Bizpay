import { useState } from "react";
import { ArrowLeft, ChevronDown, ShieldCheck, Info, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { enforceTransactionGate, type EnforcementResult } from "../../utils/governanceEngine";
import GovernanceBar from "../../components/GovernanceBar";

interface OwnAccountTransferSingleProps {
  onBack: () => void;
}

export default function OwnAccountTransferSingle({ onBack }: OwnAccountTransferSingleProps) {
  const [executionType, setExecutionType] = useState("instant");
  const [amount, setAmount] = useState("");
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);
  const springConfig = { type: "spring" as const, stiffness: 300, damping: 30 };

  // GOVERNANCE_ENFORCEMENT — Transaction Execution Gate
  function handleAuthorize() {
    const numAmount = parseFloat(amount) || 0;
    const result = enforceTransactionGate({
      amount: numAmount,
      category: "OWN_ACCOUNT",
      description: "Own Account Transfer — Single",
    });
    setEnforcementResult(result);
  }

  return (
    <div className="relative h-full text-white px-6 pt-10 overflow-y-auto pb-32 font-sans">
      
      {/* Visual Depth Layers */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Header Section */}
      <header className="flex items-center gap-4 mb-10 max-w-2xl mx-auto">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-white leading-tight">Transfer Details</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">Single Transaction</p>
        </div>
      </header>

      {/* Main Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="relative rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] max-w-2xl mx-auto overflow-hidden"
      >
        <div className="p-8 space-y-10">
          
          {/* Group 1: Account Selection */}
          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold flex items-center gap-2">
              <span className="w-4 h-[1px] bg-cyan-400/30"></span> Origin & Type
            </h2>
            
            <Field label="From Account *">
              <div className="relative group">
                <select className="input-glass font-mono"><option className="bg-[#080c16]">Select a From Account</option></select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
            </Field>

            <Field label="Payment Type *">
              <div className="relative">
                <select className="input-glass"><option className="bg-[#080c16]">Select a Payment Type</option></select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
            </Field>
          </section>

          {/* Group 2: Beneficiary Details */}
          <section className="space-y-6 pt-4 border-t border-white/5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold flex items-center gap-2">
              <span className="w-4 h-[1px] bg-cyan-400/30"></span> Beneficiary Information
            </h2>

            <Field label="Beneficiary *">
              <div className="relative">
                <select className="input-glass"><option className="bg-[#080c16]">Select a Beneficiary</option></select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
            </Field>

            <Field label="Account Number *">
              <input className="input-glass font-mono tracking-widest" placeholder="0000 0000 0000" />
            </Field>

            <Field label="Account Name *">
              <input className="input-glass" placeholder="Full Legal Name" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Bank Name">
                <input className="input-glass text-sm" placeholder="Bank Title" />
              </Field>
              <Field label="Branch Name">
                <input className="input-glass text-sm" placeholder="Branch Office" />
              </Field>
            </div>
          </section>

          {/* Group 3: Amount & Execution */}
          <section className="space-y-6 pt-4 border-t border-white/5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold flex items-center gap-2">
              <span className="w-4 h-[1px] bg-cyan-400/30"></span> Amount & Timing
            </h2>

            <Field label="Amount (BDT) *">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-lg">৳</span>
                <input
                  className="input-glass pl-14 text-xl font-medium"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setEnforcementResult(null); }}
                />
              </div>
            </Field>

            <Field label="Execution Strategy *">
              <div className="flex p-1 bg-black/30 rounded-2xl border border-white/5 w-full">
                <ExecutionTab label="Instant" active={executionType === "instant"} onClick={() => setExecutionType("instant")} />
                <ExecutionTab label="Scheduled" active={executionType === "scheduled"} onClick={() => setExecutionType("scheduled")} />
              </div>
            </Field>

            <AnimatePresence>
              {executionType === "scheduled" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-2"
                >
                  <Field label="Execution Date *">
                    <div className="relative">
                      <input className="input-glass" defaultValue="24-01-2026" />
                      <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-400/60" />
                    </div>
                  </Field>
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex gap-3 items-start">
                    <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Please ensure sufficient balance. System retries: 10:30, 12:30, 14:00, 15:00.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Governance Enforcement Bar */}
          {enforcementResult && (
            <div className="mb-4">
              <GovernanceBar result={enforcementResult} onDismiss={() => setEnforcementResult(null)} />
            </div>
          )}

          {/* Submission */}
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleAuthorize}
            disabled={!!enforcementResult}
            className={`w-full py-5 ${!!enforcementResult ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"} font-bold rounded-2xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px]`}
          >
            <ShieldCheck size={18} />
            Authorize Transfer
          </motion.button>
        </div>
      </motion.div>

      <style>{`
        .input-glass {
          @apply w-full bg-white/[0.03] border border-white/10 rounded-[20px] px-6 py-4.5 outline-none 
                 focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all 
                 placeholder:text-white/10 text-[15px] appearance-none
                 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)];
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
    <div className="w-full">
      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2.5 block ml-1">{label}</label>
      {children}
    </div>
  );
}

interface ExecutionTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function ExecutionTab({ label, active, onClick }: ExecutionTabProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-3 text-[10px] font-bold rounded-xl transition-all duration-300 tracking-widest ${
        active ? 'bg-cyan-500 text-slate-900 shadow-lg' : 'text-white/30 hover:text-white/50'
      }`}
    >
      {label}
    </button>
  );
}