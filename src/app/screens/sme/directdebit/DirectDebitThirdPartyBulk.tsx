import { ArrowLeft, Upload, FileText, Download, Info, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { enforceTransactionGate, type EnforcementResult } from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";

interface DirectDebitThirdPartyBulkProps {
  onBack: () => void;
}

export default function DirectDebitThirdPartyBulk({ onBack }: DirectDebitThirdPartyBulkProps) {
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  // GOVERNANCE_ENFORCEMENT — DD Third Party Bulk Gate
  function handleUploadInstruction() {
    const result = enforceTransactionGate({
      amount: 2000000,
      category: "DIRECT_DEBIT",
      description: "Direct Debit — Third Party Bulk",
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
          <h1 className="text-3xl font-serif tracking-tight">Collect from Third Party Accounts</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Bulk Upload
          </p>
        </div>
      </header>

      {/* Main Glass Card */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden max-w-3xl mx-auto">
        
        {/* Form Section */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Upload className="text-cyan-400" size={20} />
            </div>
            <h2 className="font-serif text-white">Upload Transaction File</h2>
          </div>

          <div className="space-y-5">
            <Field label="Credit Account *">
              <select className="dd-input">
                <option className="bg-slate-900">TEST-1 [ AC:2052836410001 ]</option>
              </select>
            </Field>

            <Field label="Input File *">
              <input 
                type="file" 
                className="dd-input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-900 hover:file:bg-cyan-400 cursor-pointer transition-all" 
              />
            </Field>

            <Field label="Purpose *">
              <input 
                className="dd-input" 
                placeholder="Enter purpose" 
              />
            </Field>

            <button 
              className={`w-full py-3.5 rounded-2xl ${!!enforcementResult ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"} font-semibold transition-all active:scale-[0.98] shadow-lg shadow-cyan-900/30`}
              onClick={handleUploadInstruction}
              disabled={!!enforcementResult}
            >
              Upload Instruction
            </button>
          </div>
        </div>

        {/* Guidelines Section */}
        <div className="bg-white/[0.03] p-6 md:p-8 border-t border-white/10">
          <div className="flex items-center gap-2 mb-6 text-cyan-400">
            <Info size={18} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Guidelines & Requirements</span>
          </div>

          <div className="space-y-4">
            <InstructionItem 
              text={<>Must be initiated against <span className="text-white font-medium">valid mandates/authorizations</span> by the Receivers.</>} 
            />
            <InstructionItem 
              text={<>Sent to Bangladesh Bank on <span className="text-white font-medium">Banking Days</span> only.</>} 
            />
            <InstructionItem 
              text={<>Cut-off times: <span className="text-white font-medium">01:00pm</span> (1st Session) & <span className="text-white font-medium">05:00pm</span> (2nd Session).</>} 
            />
            <InstructionItem 
              isWarning
              text={<>Use the sample format below to avoid <span className="text-red-300 font-medium">rejection by the bank.</span></>} 
            />
          </div>

          {/* Download Box */}
          <div className="mt-8 p-4 bg-white/[0.03] border border-white/10 rounded-[20px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <FileText className="text-cyan-400" size={18} />
              </div>
              <div>
                <div className="text-sm text-white/80">Transaction Template</div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Excel (.xlsx, .xls)</div>
              </div>
            </div>
            <button className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              <Download size={16} />
              <span>Download sample</span>
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
      `}</style>

      {/* Governance Bar */}
      {enforcementResult && <GovernanceBar result={enforcementResult} />}
    </div>
  );
}

/* Sub-components */

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      {children}
    </div>
  );
}

interface InstructionItemProps {
  text: React.ReactNode;
  isWarning?: boolean;
}

function InstructionItem({ text, isWarning = false }: InstructionItemProps) {
  return (
    <div className="flex gap-3 items-start leading-snug">
      <CheckCircle2 size={16} className={isWarning ? "text-red-400 mt-0.5 shrink-0" : "text-cyan-400/60 mt-0.5 shrink-0"} />
      <p className={`text-sm ${isWarning ? "text-red-200/80" : "text-white/60"}`}>{text}</p>
    </div>
  );
}