/**
 * STOP CHEQUE — SERVICE REQUEST SCREEN
 * Governed non-money-moving request flow.
 * Uses enforceServiceRequestGate + createServiceRequestApproval.
 * Admin direct execution → EXECUTED; non-admin → APPROVAL_REQUIRED.
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, OctagonX, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  enforceServiceRequestGate,
  createServiceRequestApproval,
  type EnforcementResult,
} from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";
import { addStopChequeRequest, type StopChequeRequest } from "../../../mock/chequeRequests";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45 };

const STOP_REASONS = [
  "Lost",
  "Stolen",
  "Payment Cancelled",
  "Issued in Error",
  "Damaged",
  "Dispute",
  "Other",
];

interface StopChequeScreenProps {
  onBack: () => void;
}

export default function StopChequeScreen({ onBack }: StopChequeScreenProps) {
  const [chequeFrom, setChequeFrom] = useState("");
  const [chequeTo, setChequeTo] = useState("");
  const [isRange, setIsRange] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [declaration, setDeclaration] = useState(false);
  const [enforcementResult, setEnforcementResult] =
    useState<EnforcementResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedOutcome, setSubmittedOutcome] = useState<
    "APPROVAL_REQUIRED" | "EXECUTED" | null
  >(null);

  const isFormValid =
    chequeFrom.trim() !== "" &&
    (!isRange || chequeTo.trim() !== "") &&
    reason !== "" &&
    effectiveDate !== "" &&
    declaration;

  // GOVERNANCE_ENFORCEMENT — Stop Cheque Service Request Gate
  function handleSubmit() {
    const result = enforceServiceRequestGate({
      serviceType: "STOP_CHEQUE",
      actionLabel: "Stop Cheque Request",
    });
    setEnforcementResult(result);

    const toNumber = isRange ? chequeTo : chequeFrom;

    if (result.outcome === "BLOCKED") {
      // Blocked — do nothing, GovernanceBar renders
      return;
    }

    if (result.outcome === "APPROVAL_REQUIRED") {
      // Create approval queue entry
      const approvalId = createServiceRequestApproval({
        serviceType: "STOP_CHEQUE",
        actionLabel: "Stop Cheque Request",
        requestParams: {
          accountNumber: "2052836410001",
          chequeNumberFrom: chequeFrom,
          chequeNumberTo: toNumber,
          reason,
          reasonDetail,
          effectiveDate,
        },
      });

      // Persist to local mock store
      const newReq: StopChequeRequest = {
        id: `sc_${Date.now()}`,
        accountNumber: "2052836410001",
        accountLabel: "TEST-1 [2052836410001]",
        chequeNumberFrom: chequeFrom,
        chequeNumberTo: toNumber,
        reason,
        reasonDetail,
        effectiveDate,
        declaration: true,
        status: "PENDING_APPROVAL",
        submittedBy: "current",
        submittedByName: result.details.actor,
        submittedAt: new Date().toISOString(),
        approvalId: approvalId || null,
        auditId: result.auditId,
      };
      addStopChequeRequest(newReq);

      setSubmitted(true);
      setSubmittedOutcome("APPROVAL_REQUIRED");
      return;
    }

    if (result.outcome === "ALLOWED") {
      // Admin direct execution — mark as EXECUTED (no cheque engine)
      const newReq: StopChequeRequest = {
        id: `sc_${Date.now()}`,
        accountNumber: "2052836410001",
        accountLabel: "TEST-1 [2052836410001]",
        chequeNumberFrom: chequeFrom,
        chequeNumberTo: toNumber,
        reason,
        reasonDetail,
        effectiveDate,
        declaration: true,
        status: "EXECUTED",
        submittedBy: "current",
        submittedByName: result.details.actor,
        submittedAt: new Date().toISOString(),
        approvalId: null,
        auditId: result.auditId,
        resolvedBy: result.details.actor,
        resolvedAt: new Date().toISOString(),
      };
      addStopChequeRequest(newReq);

      setSubmitted(true);
      setSubmittedOutcome("EXECUTED");
    }
  }

  // ── CONFIRMATION BANNER (post-submit) ──
  if (submitted) {
    return (
      <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
        {/* Film Grain */}
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center pt-20">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...STIFF_SPRING, delay: 0.1 }}
            className={`w-20 h-20 rounded-full ${
              submittedOutcome === "EXECUTED"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-amber-500/10 border-amber-500/30"
            } border flex items-center justify-center mb-8`}
          >
            {submittedOutcome === "EXECUTED" ? (
              <CheckCircle2
                size={40}
                strokeWidth={1.5}
                className="text-emerald-400"
              />
            ) : (
              <AlertTriangle
                size={40}
                strokeWidth={1.5}
                className="text-amber-400"
              />
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...STIFF_SPRING, delay: 0.2 }}
            className="text-3xl font-serif tracking-tight mb-3"
          >
            {submittedOutcome === "EXECUTED"
              ? "Stop Cheque Recorded"
              : "Routed for Approval"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mb-12"
          >
            {submittedOutcome === "EXECUTED"
              ? "Request Executed"
              : "Pending Authorisation"}
          </motion.p>

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...STIFF_SPRING, delay: 0.3 }}
            className="w-full max-w-md rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-7 space-y-4"
          >
            <Row label="Account" value="2052836410001" />
            <Row
              label="Cheque No."
              value={
                isRange
                  ? `${chequeFrom} – ${chequeTo}`
                  : chequeFrom
              }
            />
            <Row label="Reason" value={reason} />
            <Row label="Effective" value={effectiveDate} />
            <Row
              label="Audit ID"
              value={enforcementResult?.auditId.slice(-12) || "—"}
              mono
            />
          </motion.div>

          {/* GovernanceBar (shows the routing / execution detail) */}
          {enforcementResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="w-full max-w-md mt-6"
            >
              <GovernanceBar result={enforcementResult} />
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="w-full max-w-md mt-8 py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-2xl shadow-lg shadow-cyan-900/30 tracking-[0.2em] text-xs uppercase"
          >
            Back to Cheque Services
          </motion.button>
        </div>
      </div>
    );
  }

  // ── FORM SCREEN ──
  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay"
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
          <h1 className="text-3xl font-serif tracking-tight">Stop Cheque</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Service Request
          </p>
        </div>
      </header>

      {/* Form Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={STIFF_SPRING}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 md:p-8 max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <OctagonX size={20} className="text-red-400" />
          </div>
          <h2 className="font-serif text-white">Stop Instruction Details</h2>
        </div>

        <div className="space-y-5">
          {/* Account (read-only, primary CASA) */}
          <Field label="Account">
            <input
              readOnly
              className="sc-input bg-white/[0.02] cursor-not-allowed text-white/50"
              value="TEST-1 [2052836410001]"
            />
          </Field>

          {/* Cheque Number Mode Toggle */}
          <div className="flex items-center gap-4 mb-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
              Cheque Number
            </label>
            <button
              type="button"
              onClick={() => {
                setIsRange(!isRange);
                setChequeTo("");
              }}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all ${
                isRange
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                  : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/60"
              }`}
            >
              {isRange ? "Range" : "Single"}
            </button>
          </div>

          {isRange ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="From">
                <input
                  className="sc-input"
                  placeholder="e.g. 000451"
                  value={chequeFrom}
                  onChange={(e) => setChequeFrom(e.target.value)}
                />
              </Field>
              <Field label="To">
                <input
                  className="sc-input"
                  placeholder="e.g. 000460"
                  value={chequeTo}
                  onChange={(e) => setChequeTo(e.target.value)}
                />
              </Field>
            </div>
          ) : (
            <Field label="">
              <input
                className="sc-input"
                placeholder="e.g. 000451"
                value={chequeFrom}
                onChange={(e) => setChequeFrom(e.target.value)}
              />
            </Field>
          )}

          {/* Reason Dropdown */}
          <Field label="Reason for Stop">
            <select
              className="sc-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="" className="bg-slate-900">
                Select Reason
              </option>
              {STOP_REASONS.map((r) => (
                <option key={r} value={r} className="bg-slate-900">
                  {r}
                </option>
              ))}
            </select>
          </Field>

          {/* Optional Detail */}
          <Field label="Additional Detail (Optional)">
            <textarea
              className="sc-input min-h-[80px] resize-none"
              placeholder="Describe circumstances..."
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
            />
          </Field>

          {/* Effective Date */}
          <Field label="Effective Date">
            <input
              type="date"
              className="sc-input"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </Field>

          {/* Declaration */}
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-all">
            <input
              type="checkbox"
              checked={declaration}
              onChange={(e) => setDeclaration(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-cyan-500 rounded shrink-0"
            />
            <span className="text-sm text-white/70 leading-relaxed">
              I confirm the cheque(s) referenced above have not been presented
              for payment and I authorise this stop instruction.
            </span>
          </label>

          {/* Governance Enforcement Bar */}
          {enforcementResult && (
            <div className="mt-2">
              <GovernanceBar
                result={enforcementResult}
                onDismiss={() => setEnforcementResult(null)}
              />
            </div>
          )}

          {/* Submit CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!isFormValid || !!enforcementResult}
            className={`w-full py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-cyan-900/30 tracking-[0.15em] text-xs uppercase ${
              !isFormValid || !!enforcementResult
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
            }`}
          >
            Submit Stop Cheque Request
          </motion.button>
        </div>
      </motion.div>

      <style>{`
        .sc-input {
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
        .sc-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .sc-input:focus {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
        select.sc-input {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
        textarea.sc-input {
          resize: vertical;
        }
        input[type="date"].sc-input::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.4);
        }
      `}</style>
    </div>
  );
}

// ── FIELD WRAPPER ──
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

// ── ROW HELPER (confirmation banner) ──
function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
        {label}
      </span>
      <span
        className={`text-sm text-white/80 ${mono ? "font-mono tracking-wider" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
