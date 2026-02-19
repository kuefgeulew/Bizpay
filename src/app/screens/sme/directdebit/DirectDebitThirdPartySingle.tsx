import { useState } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import { enforceTransactionGate, type EnforcementResult } from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";

interface DirectDebitThirdPartySingleProps {
  onBack: () => void;
}

export default function DirectDebitThirdPartySingle({ onBack }: DirectDebitThirdPartySingleProps) {
  const [cycle, setCycle] = useState("MONTHLY");
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  // GOVERNANCE_ENFORCEMENT — Direct Debit Third Party Gate
  function handleSubmitInstruction() {
    const result = enforceTransactionGate({
      amount: 200000,
      category: "DIRECT_DEBIT",
      description: "Direct Debit — Third Party Single",
    });
    setEnforcementResult(result);
  }

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
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
          <h1 className="text-3xl font-serif tracking-tight">Collect from 3rd Party A/C</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Single Instruction
          </p>
        </div>
      </header>

      {/* Main Glass Card */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 md:p-8 max-w-3xl mx-auto">
        {/* Section Icon */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <CreditCard size={20} className="text-cyan-400" />
          </div>
          <h2 className="font-serif text-white">Mandate & Collection Details</h2>
        </div>

        <div className="space-y-5">
          <Field label="Credit Account *">
            <select className="dd-input">
              <option className="bg-slate-900">Select a Credit Account</option>
              <option className="bg-slate-900">TEST-1 [AC:2052836410001]</option>
            </select>
          </Field>

          <Field label="Mandate Info *">
            <select className="dd-input">
              <option className="bg-slate-900">Select a mandate</option>
            </select>
          </Field>

          <Field label="Amount (BDT) *">
            <input className="dd-input" placeholder="Enter Amount" />
          </Field>

          <Field label="Credit Narration *">
            <input className="dd-input" placeholder="Enter credit narration" />
          </Field>

          <Field label="Cycle Type *">
            <select
              className="dd-input"
              value={cycle}
              onChange={(e) => setCycle(e.target.value)}
            >
              <option className="bg-slate-900">INSTANT</option>
              <option className="bg-slate-900">MONTHLY</option>
              <option className="bg-slate-900">QUARTERLY</option>
              <option className="bg-slate-900">HALF YEARLY</option>
              <option className="bg-slate-900">YEARLY</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="SI Start Date (DD/MM/YYYY) *">
              <input type="date" className="dd-input" />
            </Field>

            <Field label="SI End Date (DD/MM/YYYY) *">
              <input type="date" className="dd-input" />
            </Field>
          </div>

          <Field label="Purpose *">
            <input className="dd-input" placeholder="Enter purpose" />
          </Field>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-white/10" />

        {/* Additional Details */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <CreditCard size={20} className="text-blue-400" />
          </div>
          <h2 className="font-serif text-white">Debit Account Details</h2>
        </div>

        <div className="space-y-5">
          <Field label="Mandate Reference ID *">
            <input className="dd-input" placeholder="Enter mandate reference" />
          </Field>

          <Field label="Debit Account Name *">
            <input className="dd-input" placeholder="Enter account name" />
          </Field>

          <Field label="Debit Account Number *">
            <input className="dd-input" placeholder="Enter account number" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Routing Number *">
              <input className="dd-input" placeholder="Enter routing number" />
            </Field>

            <Field label="Bank Name">
              <input className="dd-input" placeholder="Enter bank name" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Receiver's Email">
              <input className="dd-input" placeholder="Enter email" />
            </Field>

            <Field label="Receiver's Mobile Number">
              <input className="dd-input" placeholder="Enter mobile number" />
            </Field>
          </div>
        </div>

        {/* Submit */}
        {enforcementResult && (
          <div className="mb-4">
            <GovernanceBar result={enforcementResult} onDismiss={() => setEnforcementResult(null)} />
          </div>
        )}
        <button
          onClick={handleSubmitInstruction}
          disabled={!!enforcementResult}
          className={`w-full mt-8 py-3.5 rounded-2xl ${!!enforcementResult ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"} font-semibold transition-all active:scale-[0.98] shadow-lg shadow-cyan-900/30`}
        >
          Submit Instruction
        </button>
      </div>

      <style>{`
        .dd-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          outline: none;
          transition: all 0.2s;
          appearance: none;
        }
        .dd-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .dd-input:focus {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
        select.dd-input {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
        input[type="date"].dd-input::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.4);
        }
      `}</style>
    </div>
  );
}

/* -------- Reusable -------- */

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}