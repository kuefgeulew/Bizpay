/**
 * NPSB TRANSFER — OUTSIDE BBPLC
 * Inter-bank transfers via National Payment Switch Bangladesh.
 * Governance: enforceTransactionGate({ category: "NPSB_OUTSIDE_BBPLC" })
 * Audit: Triple-write to all three audit sinks.
 * Currency: BDT ONLY — hard-coded. No beneficiary creation in this flow.
 */

import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Calendar,
  Info,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  enforceTransactionGate,
  type EnforcementResult,
} from "../../../../utils/governanceEngine";
import GovernanceBar from "../../../../components/GovernanceBar";
import {
  BENEFICIARIES,
  type BeneficiaryRecord,
} from "../../../../mock/beneficiaryGovernance";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

// CASA accounts (same demo data)
const CASA_ACCOUNTS = [
  { id: "casa-001", label: "Current A/C — 1001-3456-7890", balance: 4250000 },
  { id: "casa-002", label: "Current A/C — 1001-3456-8901", balance: 1820000 },
  { id: "casa-003", label: "Savings A/C — 2001-7890-1234", balance: 780000 },
];

// Static participating bank list
const PARTICIPATING_BANKS = [
  { code: "DBBL", name: "Dutch-Bangla Bank" },
  { code: "IBBL", name: "Islami Bank Bangladesh" },
  { code: "SCBL", name: "Standard Chartered Bangladesh" },
  { code: "CITY", name: "City Bank" },
  { code: "EBL", name: "Eastern Bank Ltd" },
  { code: "MTBL", name: "Mutual Trust Bank" },
  { code: "UCB", name: "United Commercial Bank" },
  { code: "PRIM", name: "Prime Bank" },
  { code: "PUBALI", name: "Pubali Bank" },
  { code: "SONALI", name: "Sonali Bank" },
];

interface NpsbOutsideBBPLCScreenProps {
  onBack: () => void;
}

export default function NpsbOutsideBBPLCScreen({
  onBack,
}: NpsbOutsideBBPLCScreenProps) {
  // Filter: non-BRAC beneficiaries only
  const externalBeneficiaries = BENEFICIARIES.filter(
    (b) =>
      b.status === "active" && !b.bankCode.toUpperCase().includes("BRAC")
  );

  const [fromAccount, setFromAccount] = useState("");
  const [selectedBenId, setSelectedBenId] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [scheduleType, setScheduleType] = useState<"today" | "future">(
    "today"
  );
  const [scheduledDate, setScheduledDate] = useState("2026-02-25");
  const [enforcementResult, setEnforcementResult] =
    useState<EnforcementResult | null>(null);

  const selectedBen = externalBeneficiaries.find(
    (b) => b.id === selectedBenId
  );

  // GOVERNANCE_ENFORCEMENT — NPSB Outside BBPLC Transaction Execution Gate
  function handleAuthorize() {
    const numAmount = parseFloat(amount) || 0;
    const result = enforceTransactionGate({
      amount: numAmount,
      category: "NPSB_OUTSIDE_BBPLC",
      description: `NPSB Outside BBPLC — ${selectedBen?.name || "Unknown"} (${selectedBen?.bankName || "External"})`,
    });
    setEnforcementResult(result);
  }

  const isFormValid =
    fromAccount && selectedBenId && parseFloat(amount) > 0;
  const isBlocked = enforcementResult?.outcome === "BLOCKED";

  return (
    <div className="relative h-full text-white px-6 pt-10 overflow-y-auto pb-32 font-sans">
      {/* Film Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-10 max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-3xl font-serif tracking-tight text-white leading-tight truncate">
            Outside BBPLC
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            NPSB — Inter-Bank Transfer
          </p>
        </div>
      </header>

      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="relative rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] max-w-2xl mx-auto overflow-hidden"
      >
        <div className="p-8 space-y-10">
          {/* Section 1: From Account */}
          <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold flex items-center gap-2">
              <span className="w-4 h-[1px] bg-cyan-400/30" /> Source Account
            </h2>

            <Field label="From Account (CASA) *">
              <div className="relative group">
                <select
                  value={fromAccount}
                  onChange={(e) => {
                    setFromAccount(e.target.value);
                    setEnforcementResult(null);
                  }}
                  className="input-glass appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#080c16]">
                    Select source account
                  </option>
                  {CASA_ACCOUNTS.map((acc) => (
                    <option
                      key={acc.id}
                      value={acc.id}
                      className="bg-[#080c16]"
                    >
                      {acc.label} — Balance: ৳{acc.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                />
              </div>
            </Field>
          </section>

          {/* Section 2: Beneficiary (External banks only) */}
          <section className="space-y-6 pt-4 border-t border-white/5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold flex items-center gap-2">
              <span className="w-4 h-[1px] bg-cyan-400/30" /> Beneficiary
            </h2>

            <Field label="Select Beneficiary *">
              <div className="relative group">
                <select
                  value={selectedBenId}
                  onChange={(e) => {
                    setSelectedBenId(e.target.value);
                    setEnforcementResult(null);
                  }}
                  className="input-glass appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#080c16]">
                    Choose an external bank beneficiary
                  </option>
                  {externalBeneficiaries.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      className="bg-[#080c16]"
                    >
                      {b.name} — {b.bankName}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                />
              </div>
            </Field>

            {/* Selected Beneficiary Card */}
            <AnimatePresence>
              {selectedBen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 bg-white/[0.03] rounded-[20px] border border-white/[0.06] flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 flex items-center justify-center shrink-0">
                      <Globe size={18} className="text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 font-medium truncate">
                        {selectedBen.name}
                      </p>
                      <p className="text-[10px] font-mono text-white/30 tracking-wider mt-0.5 truncate">
                        {selectedBen.accountNumber} ·{" "}
                        {selectedBen.bankName}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Maker-Checker notice */}
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3 items-start">
              <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/50 leading-relaxed">
                Inter-bank NPSB transfers are subject to Maker-Checker enforcement. New
                beneficiaries must be registered via the Pay tab before use.
              </p>
            </div>
          </section>

          {/* Section 3: Amount & Purpose */}
          <section className="space-y-6 pt-4 border-t border-white/5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold flex items-center gap-2">
              <span className="w-4 h-[1px] bg-cyan-400/30" /> Amount & Purpose
            </h2>

            <Field label="Amount (BDT) *">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-lg">
                  ৳
                </span>
                <input
                  type="number"
                  className="input-glass pl-14 text-xl font-medium"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setEnforcementResult(null);
                  }}
                />
              </div>
            </Field>

            <Field label="Purpose / Narration">
              <input
                className="input-glass"
                placeholder="e.g. Supplier payment, Invoice settlement"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              />
            </Field>
          </section>

          {/* Section 4: Schedule */}
          <section className="space-y-6 pt-4 border-t border-white/5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold flex items-center gap-2">
              <span className="w-4 h-[1px] bg-cyan-400/30" /> Schedule
            </h2>

            <Field label="Execution Timing *">
              <div className="flex p-1 bg-black/30 rounded-2xl border border-white/5 w-full">
                <ScheduleTab
                  label="Today"
                  active={scheduleType === "today"}
                  onClick={() => setScheduleType("today")}
                />
                <ScheduleTab
                  label="Future Date"
                  active={scheduleType === "future"}
                  onClick={() => setScheduleType("future")}
                />
              </div>
            </Field>

            <AnimatePresence>
              {scheduleType === "future" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-2"
                >
                  <Field label="Execution Date *">
                    <div className="relative">
                      <input
                        type="date"
                        className="input-glass"
                        value={scheduledDate}
                        onChange={(e) =>
                          setScheduledDate(e.target.value)
                        }
                      />
                      <Calendar
                        size={18}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-400/60 pointer-events-none"
                      />
                    </div>
                  </Field>
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex gap-3 items-start">
                    <Info
                      size={16}
                      className="text-cyan-400 shrink-0 mt-0.5"
                    />
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      NPSB inter-bank transfers settle during
                      Bangladesh Bank operating hours. Scheduled
                      transfers execute at 10:00 on the selected date.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Governance Enforcement Bar */}
          {enforcementResult && (
            <div className="mb-4">
              <GovernanceBar
                result={enforcementResult}
                onDismiss={() => setEnforcementResult(null)}
              />
            </div>
          )}

          {/* Submit CTA */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleAuthorize}
            disabled={
              !isFormValid || isBlocked || !!enforcementResult
            }
            className={`w-full py-5 ${
              !isFormValid || isBlocked || !!enforcementResult
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
            } font-bold rounded-2xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px]`}
          >
            <ShieldCheck size={18} />
            Authorize Transfer
          </motion.button>
        </div>
      </motion.div>

      <style>{`
        .input-glass {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1rem 1.5rem;
          outline: none;
          transition: all 0.2s;
          font-size: 15px;
          color: white;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .input-glass::placeholder {
          color: rgba(255, 255, 255, 0.1);
        }
        .input-glass:focus {
          border-color: rgba(6, 182, 212, 0.4);
          background: rgba(255, 255, 255, 0.06);
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

/* -------- Sub-Components -------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2.5 block ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function ScheduleTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-[10px] font-bold rounded-xl transition-all duration-300 tracking-widest ${
        active
          ? "bg-cyan-500 text-slate-900 shadow-lg"
          : "text-white/30 hover:text-white/50"
      }`}
    >
      {label}
    </button>
  );
}
