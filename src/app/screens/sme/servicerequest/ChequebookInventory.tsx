import { useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { enforceServiceRequestGate, createServiceRequestApproval, type EnforcementResult } from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";

interface ChequebookInventoryProps {
  onBack: () => void;
}

export default function ChequebookInventory({ onBack }: ChequebookInventoryProps) {
  const [form, setForm] = useState({
    account: "",
    fromAmount: "",
    toAmount: "",
    chequeDate: "",
    chequeNumber: "",
    beneficiary: "",
    status: "",
  });
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  function update(k: string, v: string) {
    setForm({ ...form, [k]: v });
  }

  // GOVERNANCE_ENFORCEMENT — Chequebook Service Request Gate
  function handleSearch() {
    const result = enforceServiceRequestGate({
      serviceType: "CHEQUEBOOK",
      actionLabel: "Chequebook Inventory Search",
    });
    setEnforcementResult(result);

    // GOVERNANCE_ENFORCEMENT — Route to Approval Queue on APPROVAL_REQUIRED
    if (result.outcome === "APPROVAL_REQUIRED") {
      createServiceRequestApproval({
        serviceType: "CHEQUEBOOK",
        actionLabel: "Chequebook Inventory Search",
        requestParams: {
          account: form.account,
          chequeNumber: form.chequeNumber,
          beneficiary: form.beneficiary,
          status: form.status,
        },
      });
    }
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
          <h1 className="text-3xl font-serif tracking-tight">Chequebook Inventory</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Cheque Management
          </p>
        </div>
      </header>

      {/* Search Form Glass Card */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <BookOpen size={20} className="text-cyan-400" />
          </div>
          <h2 className="font-serif text-white">Search Criteria</h2>
        </div>

        <div className="space-y-5">
          <Field label="Select Account">
            <select
              className="dd-input"
              value={form.account}
              onChange={(e) => update("account", e.target.value)}
            >
              <option value="" className="bg-slate-900">SELECT ACCOUNT</option>
              <option className="bg-slate-900">TEST-1 [2052836410001]</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Cheque Amount (From)">
              <input
                className="dd-input"
                placeholder="Enter Amount"
                value={form.fromAmount}
                onChange={(e) => update("fromAmount", e.target.value)}
              />
            </Field>

            <Field label="Cheque Amount (To)">
              <input
                className="dd-input"
                placeholder="Enter Amount"
                value={form.toAmount}
                onChange={(e) => update("toAmount", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Cheque Date">
            <input
              type="date"
              className="dd-input"
              value={form.chequeDate}
              onChange={(e) => update("chequeDate", e.target.value)}
            />
          </Field>

          <Field label="Cheque Number">
            <input
              className="dd-input"
              placeholder="Enter BBL Cheque Number"
              value={form.chequeNumber}
              onChange={(e) => update("chequeNumber", e.target.value)}
            />
          </Field>

          <Field label="Beneficiary Name">
            <input
              className="dd-input"
              placeholder="Enter Beneficiary Name"
              value={form.beneficiary}
              onChange={(e) => update("beneficiary", e.target.value)}
            />
          </Field>

          <Field label="Status">
            <select
              className="dd-input"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="" className="bg-slate-900">Select Status</option>
              <option className="bg-slate-900">Unused</option>
              <option className="bg-slate-900">Used</option>
              <option className="bg-slate-900">Stopped</option>
            </select>
          </Field>

          {/* Governance Enforcement Bar */}
          {enforcementResult && (
            <div className="mb-4">
              <GovernanceBar result={enforcementResult} onDismiss={() => setEnforcementResult(null)} />
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={!!enforcementResult}
            className={`w-full py-3.5 rounded-2xl ${!!enforcementResult ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"} font-semibold transition-all active:scale-[0.98] shadow-lg shadow-cyan-900/30`}
          >
            Search
          </button>
        </div>
      </div>

      {/* Results Glass Card */}
      <div className="mt-6 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 md:p-8 max-w-3xl mx-auto">
        <h3 className="text-sm font-serif text-white mb-4">Cheque Details</h3>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all"
            >
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/40">Account</span>
                <span className="text-white/80">2052836410001</span>
              </div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/40">Cheque No</span>
                <span className="text-white/80 font-mono">00012{i}</span>
              </div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/40">Amount</span>
                <span className="text-white/80 font-mono">৳5,000.00</span>
              </div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/40">Date</span>
                <span className="text-white/80">24-01-2026</span>
              </div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/40">Status</span>
                <span className="text-emerald-400 text-sm">Unused</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Beneficiary</span>
                <span className="text-white/40">—</span>
              </div>
            </div>
          ))}
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