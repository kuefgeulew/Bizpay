import { ArrowLeft, ChevronDown, Zap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { enforceTransactionGate, type EnforcementResult } from "../../../../utils/governanceEngine";
import GovernanceBar from "../../../../components/GovernanceBar";

interface DPDCPaymentProps {
  onBack: () => void;
}

export default function DPDCPayment({ onBack }: DPDCPaymentProps) {
  // Core Logic Preserved: method state controls conditional rendering
  const [method, setMethod] = useState<"pre" | "post">("pre");
  const [billAmount, setBillAmount] = useState("");
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  // GOVERNANCE_ENFORCEMENT — Bill Payment Execution Gate
  function handleValidatePayment() {
    const numAmount = parseFloat(billAmount) || 15000;
    const result = enforceTransactionGate({
      amount: numAmount,
      category: "BILL_PAYMENT",
      description: "DPDC Bill Payment",
    });
    setEnforcementResult(result);
  }

  const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      
      {/* 1. LAYER: Adaptive Noise Floor (Apple Aesthetic) */}
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
          <h1 className="text-3xl font-serif tracking-tight text-white">DPDC Bill Payment</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">Utility Collection Portal</p>
        </div>
      </header>

      {/* Main Glass Pane */}
      <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden max-w-xl mx-auto">
        <div className="p-8 md:p-10 space-y-10">
          
          {/* Method Selection (Base Logic: setMethod) */}
          <Field label="Collection Method *">
            <div className="flex p-1.5 bg-white/[0.04] rounded-2xl border border-white/5 w-full max-w-[300px]">
              <MethodTab label="Pre Paid" active={method === "pre"} onClick={() => setMethod("pre")} />
              <MethodTab label="Post Paid" active={method === "post"} onClick={() => setMethod("post")} />
            </div>
          </Field>

          {/* Form Fields */}
          <div className="space-y-7">
            <Field label="Debit Account *">
              <div className="relative group">
                <select className="bp-field font-mono">
                  <option className="bg-[#080c16]">TEST-1 [ AC:2052836410001 ]</option>
                </select>
                <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>
            </Field>

            <Field label="Customer Number *">
              <input className="bp-field" placeholder="Enter customer number" />
            </Field>

            {/* Logical Conditional Rendering: Clutter-Free Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={method}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={springTransition}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {method === "pre" ? (
                  <>
                    <Field label="Amount *">
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500 font-bold">৳</span>
                        <input
                          className="bp-field pl-10"
                          placeholder="0.00"
                          value={billAmount}
                          onChange={(e) => { setBillAmount(e.target.value); setEnforcementResult(null); }}
                        />
                      </div>
                    </Field>
                    <Field label="Remarks *">
                      <input className="bp-field" placeholder="Enter remarks" />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Bill Month *">
                      <div className="relative group">
                        <select className="bp-field">
                          {["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"].map(m =>
                            <option key={m} className="bg-[#080c16]">{m}</option>
                          )}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                      </div>
                    </Field>
                    <Field label="Bill Year *">
                      <div className="relative group">
                        <select className="bp-field">
                          {[2021,2022,2023,2024,2025,2026].map(y =>
                            <option key={y} className="bg-[#080c16]">{y}</option>
                          )}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                      </div>
                    </Field>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Governance Enforcement Bar */}
          {enforcementResult && (
            <div className="mb-4">
              <GovernanceBar result={enforcementResult} onDismiss={() => setEnforcementResult(null)} />
            </div>
          )}

          <button
            onClick={handleValidatePayment}
            disabled={!!enforcementResult}
            className={`w-full group relative overflow-hidden py-5 ${!!enforcementResult ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"} font-bold rounded-2xl transition-all shadow-lg shadow-cyan-900/30 active:scale-[0.98]`}
          >
            <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs">
              <ShieldCheck size={18} /> Validate Payment
            </span>
          </button>
        </div>
      </div>

      <style>{`
        .bp-field {
          @apply w-full bg-white/[0.03] border border-white/10 rounded-[22px] px-6 py-4 outline-none 
                 focus:border-cyan-500/50 focus:bg-white/[0.06] transition-all 
                 placeholder:text-white/20 text-[15px] appearance-none;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

/* Internal Components */

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 block ml-1">{label}</label>
      {children}
    </div>
  );
}

interface MethodTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function MethodTab({ label, active, onClick }: MethodTabProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all duration-300 tracking-wider ${
        active 
          ? 'bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/10' 
          : 'text-white/30 hover:text-white/60'
      }`}
    >
      {label}
    </button>
  );
}