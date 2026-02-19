import { useState } from "react";
import { ArrowLeft, XCircle, Search, Calendar, Hash } from "lucide-react";
import { motion } from "motion/react";
import { enforceTransactionGate, type EnforcementResult } from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

// GOVERNANCE_ENFORCEMENT — Cancel Approved Transaction mock data
const APPROVED_TRANSACTIONS = [
  { ref: "DD-2026-00451", amount: 25000, amountLabel: "৳25,000.00", date: "15 Feb 2026", account: "2052836410001" },
  { ref: "DD-2026-00447", amount: 12500, amountLabel: "৳12,500.00", date: "14 Feb 2026", account: "2052836410001" },
  { ref: "DD-2026-00439", amount: 8750, amountLabel: "৳8,750.00", date: "13 Feb 2026", account: "2052836410001" },
];

interface DirectDebitCancelApprovedProps {
  onBack: () => void;
}

export default function DirectDebitCancelApproved({ onBack }: DirectDebitCancelApprovedProps) {
  // GOVERNANCE_ENFORCEMENT — Enforcement state per transaction row
  const [enforcementResults, setEnforcementResults] = useState<Record<string, EnforcementResult | null>>({});

  // GOVERNANCE_ENFORCEMENT — Cancel gate for approved DD transactions
  function handleCancelTransaction(ref: string, amount: number) {
    const result = enforceTransactionGate({
      amount,
      category: "DIRECT_DEBIT",
      description: `Cancel Approved DD Transaction ${ref}`,
    });
    setEnforcementResults((prev) => ({ ...prev, [ref]: result }));
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
          <h1 className="text-3xl font-serif tracking-tight">Cancel Approved Transactions</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Transaction Reversal
          </p>
        </div>
      </header>

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 md:p-8 max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <XCircle size={20} className="text-red-400" />
          </div>
          <h2 className="font-serif text-white">Search Approved Transactions</h2>
        </div>

        <div className="space-y-5">
          <Field label="Transaction Reference *">
            <div className="relative">
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input className="dd-input pl-11" placeholder="Enter transaction reference" />
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="From Date">
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input type="date" className="dd-input pl-11" />
              </div>
            </Field>
            <Field label="To Date">
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input type="date" className="dd-input pl-11" />
              </div>
            </Field>
          </div>

          <Field label="Debit Account">
            <select className="dd-input">
              <option className="bg-slate-900">All Accounts</option>
              <option className="bg-slate-900">TEST-1 [AC:2052836410001]</option>
            </select>
          </Field>

          <button className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold transition-all active:scale-[0.98] shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2">
            <Search size={16} />
            Search Transactions
          </button>
        </div>
      </motion.div>

      {/* Results Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mt-6 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 md:p-8 max-w-3xl mx-auto"
      >
        <h3 className="text-sm font-serif text-white mb-4">Approved Transactions</h3>
        <div className="space-y-3">
          {APPROVED_TRANSACTIONS.map((txn) => (
            <div key={txn.ref}>
              <div className="flex items-center justify-between p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all">
                <div>
                  <p className="text-sm text-white/90">{txn.ref}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{txn.date} · A/C {txn.account}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-white/80">{txn.amountLabel}</p>
                  {/* GOVERNANCE_ENFORCEMENT — Cancel button with enforcement gate */}
                  <button
                    onClick={() => handleCancelTransaction(txn.ref, txn.amount)}
                    disabled={!!enforcementResults[txn.ref]}
                    className={`text-[10px] uppercase tracking-wider font-semibold mt-1 transition-colors ${
                      !!enforcementResults[txn.ref]
                        ? "text-white/20 cursor-not-allowed"
                        : "text-red-400 hover:text-red-300"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {/* GOVERNANCE_ENFORCEMENT — Inline enforcement bar per row */}
              {enforcementResults[txn.ref] && (
                <div className="mt-2">
                  <GovernanceBar
                    result={enforcementResults[txn.ref]}
                    onDismiss={() =>
                      setEnforcementResults((prev) => ({ ...prev, [txn.ref]: null }))
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="flex justify-center mt-6"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-bold">
          Informational View — Cancellation Workflow
        </div>
      </motion.div>

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