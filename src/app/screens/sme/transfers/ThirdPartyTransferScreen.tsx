import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ShieldCheck, Calendar, Info, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { enforceTransactionGate, type EnforcementResult } from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";
import { BENEFICIARIES, type BeneficiaryRecord } from "../../../mock/beneficiaryGovernance";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

export interface ThirdPartyPrefill {
  beneficiaryId?: string;
  amount?: number;
  narration?: string;
}

interface ThirdPartyTransferScreenProps {
  onBack: () => void;
  prefill?: ThirdPartyPrefill | null;
}

export default function ThirdPartyTransferScreen({
  onBack,
  prefill,
}: ThirdPartyTransferScreenProps) {
  // Only active beneficiaries are selectable
  const activeBeneficiaries = BENEFICIARIES.filter((b) => b.status === "active");

  const [selectedBenId, setSelectedBenId] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [scheduleType, setScheduleType] = useState<"scheduled" | "today">("scheduled");
  const [scheduledDate, setScheduledDate] = useState("2026-02-25");
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  // Apply prefill on mount
  useEffect(() => {
    if (prefill) {
      if (prefill.beneficiaryId) {
        const exists = activeBeneficiaries.find((b) => b.id === prefill.beneficiaryId);
        if (exists) setSelectedBenId(prefill.beneficiaryId);
      }
      if (prefill.amount) setAmount(String(prefill.amount));
      if (prefill.narration) setNarration(prefill.narration);
    }
  }, []); // Run once on mount

  const selectedBen = activeBeneficiaries.find((b) => b.id === selectedBenId);

  // GOVERNANCE_ENFORCEMENT — Third-Party Transaction Execution Gate
  function handleAuthorize() {
    const numAmount = parseFloat(amount) || 0;
    const result = enforceTransactionGate({
      amount: numAmount,
      category: "THIRD_PARTY",
      description: `Third Party Transfer — ${selectedBen?.name || "Unknown"}`,
    });
    setEnforcementResult(result);
  }

  const isFormValid = selectedBenId && parseFloat(amount) > 0;
  const isBlocked = enforcementResult?.outcome === "BLOCKED";

  return (
    <div className="relative h-full text-white px-6 pt-10 overflow-y-auto pb-32 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
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
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-white leading-tight">
            Third Party Transfer
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Other Bank Payment
          </p>
        </div>
      </header>

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="relative rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] max-w-2xl mx-auto overflow-hidden"
      >
        <div className="p-8 space-y-10">
          {/* Section 1: Beneficiary Selection */}
          <section className="space-y-6">
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
                    Choose an existing beneficiary
                  </option>
                  {activeBeneficiaries.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#080c16]">
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
                      <Building2 size={18} className="text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 font-medium truncate">
                        {selectedBen.name}
                      </p>
                      <p className="text-[10px] font-mono text-white/30 tracking-wider mt-0.5">
                        {selectedBen.accountNumber} · {selectedBen.bankName}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Section 2: Amount & Purpose */}
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
                placeholder="e.g. Invoice payment, Supplier settlement"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              />
            </Field>
          </section>

          {/* Section 3: Schedule */}
          <section className="space-y-6 pt-4 border-t border-white/5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold flex items-center gap-2">
              <span className="w-4 h-[1px] bg-cyan-400/30" /> Schedule
            </h2>

            <Field label="Execution Timing *">
              <div className="flex p-1 bg-black/30 rounded-2xl border border-white/5 w-full">
                <ScheduleTab
                  label="Future Date"
                  active={scheduleType === "scheduled"}
                  onClick={() => setScheduleType("scheduled")}
                />
                <ScheduleTab
                  label="Today"
                  active={scheduleType === "today"}
                  onClick={() => setScheduleType("today")}
                />
              </div>
            </Field>

            <AnimatePresence>
              {scheduleType === "scheduled" && (
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
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                      <Calendar
                        size={18}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-400/60 pointer-events-none"
                      />
                    </div>
                  </Field>
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex gap-3 items-start">
                    <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Scheduled transfers execute at 10:00 on the selected date. Ensure sufficient
                      balance. Retry windows: 10:30, 12:30, 14:00, 15:00.
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

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleAuthorize}
            disabled={!isFormValid || isBlocked || !!enforcementResult}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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