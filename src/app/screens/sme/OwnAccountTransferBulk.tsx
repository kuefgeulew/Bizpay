import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { enforceTransactionGate, type EnforcementResult } from "../../utils/governanceEngine";
import GovernanceBar from "../../components/GovernanceBar";

interface OwnAccountTransferBulkProps {
  onBack: () => void;
}

export default function OwnAccountTransferBulk({ onBack }: OwnAccountTransferBulkProps) {
  const [executionType, setExecutionType] = useState("instant");
  const [payroll, setPayroll] = useState("no");
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  // GOVERNANCE_ENFORCEMENT — Bulk Transaction Execution Gate
  function handleProcessUpload() {
    const result = enforceTransactionGate({
      amount: 2000000, // Bulk transfers use aggregate limit
      category: "BULK_PAYMENT",
      description: "Own Account Bulk Transfer",
    });
    setEnforcementResult(result);
  }

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans selection:bg-white/20">
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
          <h1 className="text-3xl font-serif tracking-tight">Bulk Transfer</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Own Account Batch Upload
          </p>
        </div>
      </header>

      {/* Main Glass Container */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 md:p-8 max-w-3xl mx-auto space-y-6">

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Upload size={20} className="text-cyan-400" />
          </div>
          <h2 className="font-serif text-white">Upload Configuration</h2>
        </div>

        <Field label="Debit Account *">
          <select className="dd-input">
            <option className="bg-slate-900">TEST-1 [ AC:2052836410001 ]</option>
          </select>
        </Field>

        <Field label="Payroll">
          <div className="flex gap-8">
            <Radio
              label="Yes"
              checked={payroll === "yes"}
              onChange={() => setPayroll("yes")}
            />
            <Radio
              label="No"
              checked={payroll === "no"}
              onChange={() => setPayroll("no")}
            />
          </div>
        </Field>

        {payroll === "yes" && (
          <div className="space-y-5 pt-2">
            <Field label="Payroll Purpose *">
              <select className="dd-input">
                <option className="bg-slate-900">--SELECT--</option>
                <option className="bg-slate-900">Salary</option>
                <option className="bg-slate-900">Bonus</option>
                <option className="bg-slate-900">Incentive</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Select Month *">
                <select className="dd-input">
                  {["January","February","March","April","May","June"].map((m) => (
                    <option key={m} className="bg-slate-900">{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Select Year *">
                <select className="dd-input">
                  <option className="bg-slate-900">2026</option>
                  <option className="bg-slate-900">2027</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        <Field label="Input File *">
          <div className="relative group">
            <input type="file" className="dd-input file:hidden cursor-pointer" />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity uppercase tracking-wider font-semibold">Upload File</div>
          </div>
        </Field>

        <Field label="Execution Type *">
          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            <Radio
              label="Instant Execution"
              checked={executionType === "instant"}
              onChange={() => setExecutionType("instant")}
            />
            <Radio
              label="Scheduled Execution"
              checked={executionType === "scheduled"}
              onChange={() => setExecutionType("scheduled")}
            />
          </div>
        </Field>

        <Field label="Mode Of Debit *">
          <div className="flex gap-8">
            <Radio label="Single" checked={true} onChange={() => {}} />
            <Radio label="Multiple" checked={false} onChange={() => {}} />
          </div>
        </Field>

        {executionType === "scheduled" && (
          <div className="bg-white/[0.04] border border-white/10 text-white p-5 rounded-[20px] text-xs leading-relaxed shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-semibold block mb-1">Notes:</span>
            You are authorizing/approving future dated transaction(s). Ensure sufficient balance. 
            System retries: 10:30, 12:30, 14:00, and 15:00.
          </div>
        )}

        {/* Governance Enforcement Bar */}
        {enforcementResult && (
          <div className="mb-4">
            <GovernanceBar result={enforcementResult} onDismiss={() => setEnforcementResult(null)} />
          </div>
        )}

        <button
          onClick={handleProcessUpload}
          disabled={!!enforcementResult}
          className={`w-full py-3.5 rounded-2xl ${!!enforcementResult ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"} font-semibold transition-all active:scale-[0.98] shadow-lg shadow-cyan-900/30`}
        >
          Process Upload
        </button>

        {/* Instructions Section */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40 mb-5">Instructions</h3>

          <ul className="text-xs space-y-3 text-white/60">
            <li className="flex gap-3"><span className="text-cyan-400/60">→</span> IFT — executed in real time</li>
            <li className="flex gap-3"><span className="text-cyan-400/60">→</span> BEFTN — goes to BEFTN session</li>
            <li className="flex gap-3"><span className="text-cyan-400/60">→</span> RTGS — goes to RTGS queue</li>
            <li className="text-white/70 border-l-2 border-white/20 pl-4 py-1 italic">
              Any file that does not follow the given format will not be processed.
            </li>
          </ul>

          <div className="mt-6 p-4 bg-white/[0.03] rounded-[20px] border border-white/10 flex items-center justify-between">
            <div className="text-[10px]">
              <span className="text-white/40 block mb-1 font-semibold">File Type</span>
              <span className="text-white/30 font-mono italic">MS-Excel (.xls | .xlsx)</span>
            </div>
            <button className="text-cyan-400 font-semibold uppercase tracking-wider text-[10px] hover:text-cyan-300 transition-colors">
              Download sample
            </button>
          </div>
        </div>
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

interface RadioProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function Radio({ label, checked, onChange }: RadioProps) {
  return (
    <label className="flex items-center gap-3 text-xs cursor-pointer group">
      <div className="relative flex items-center justify-center">
        <input 
            type="radio" 
            className="sr-only" 
            checked={checked} 
            onChange={onChange} 
        />
        <div className={`w-5 h-5 rounded-full border-2 transition-all ${checked ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/20 bg-white/5'}`} />
        {checked && <div className="absolute w-2 h-2 bg-cyan-400 rounded-full" />}
      </div>
      <span className={`${checked ? 'text-white' : 'text-white/50 group-hover:text-white/70'} transition-colors uppercase tracking-wider font-semibold`}>{label}</span>
    </label>
  );
}