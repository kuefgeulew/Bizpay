/**
 * DISPUTE MANAGEMENT — SERVICE REQUEST SCREEN
 * Non-money-moving governed service request for transaction disputes.
 * Uses enforceServiceRequestGate + createServiceRequestApproval.
 * Disputes are claims — they do NOT alter transaction state.
 *
 * Three views:
 * 1. DISPUTE LIST — View all raised disputes
 * 2. RAISE DISPUTE — Governed form to submit a new dispute
 * 3. DISPUTE DETAIL — Read-only detail panel (no action buttons)
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  FileWarning,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Paperclip,
} from "lucide-react";
import {
  enforceServiceRequestGate,
  createServiceRequestApproval,
  type EnforcementResult,
} from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";
import {
  getDisputes,
  addDispute,
  type Dispute,
  type DisputeStatus,
  type DisputeCategory,
} from "../../../mock/disputes";
import { getAllTransactions } from "../../../mock/transactions";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45 };

const DISPUTE_CATEGORIES: DisputeCategory[] = [
  "Wrong Debit",
  "Duplicate",
  "Failed",
  "Other",
];

const STATUS_CONFIG: Record<
  DisputeStatus,
  { label: string; bg: string; border: string; text: string; icon: typeof Clock }
> = {
  SUBMITTED: {
    label: "Submitted",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    icon: AlertTriangle,
  },
  RESOLVED: {
    label: "Resolved",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    icon: XCircle,
  },
};

interface DisputeManagementScreenProps {
  onBack: () => void;
}

export default function DisputeManagementScreen({
  onBack,
}: DisputeManagementScreenProps) {
  const [view, setView] = useState<"list" | "raise" | "detail">("list");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>(getDisputes);

  function refreshDisputes() {
    setDisputes(getDisputes());
  }

  function openDetail(dispute: Dispute) {
    setSelectedDispute(dispute);
    setView("detail");
  }

  function openRaise() {
    setView("raise");
  }

  function backToList() {
    setSelectedDispute(null);
    refreshDisputes();
    setView("list");
  }

  // ── VIEW ROUTING ──
  if (view === "raise") {
    return <RaiseDisputeForm onBack={backToList} />;
  }

  if (view === "detail" && selectedDispute) {
    return <DisputeDetail dispute={selectedDispute} onBack={backToList} />;
  }

  // ── DISPUTE LIST ──
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
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-serif tracking-tight">
              Disputes
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              Transaction Dispute Management
            </p>
          </div>
        </div>

        {/* Raise Dispute CTA */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openRaise}
          className="flex items-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-2xl font-semibold text-xs uppercase tracking-[0.15em] shadow-lg shadow-cyan-900/30 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          Raise Dispute
        </motion.button>
      </header>

      {/* Summary Pills */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {(Object.keys(STATUS_CONFIG) as DisputeStatus[]).map((status) => {
          const count = disputes.filter((d) => d.status === status).length;
          const c = STATUS_CONFIG[status];
          return (
            <div
              key={status}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${c.bg} ${c.border} border backdrop-blur-xl`}
            >
              <span className={`text-xs font-semibold ${c.text}`}>
                {c.label}
              </span>
              <span className={`text-xs font-mono ${c.text}`}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Dispute List */}
      <div className="space-y-3">
        {disputes.map((dispute, idx) => {
          const sc = STATUS_CONFIG[dispute.status];
          const StatusIcon = sc.icon;
          return (
            <motion.button
              key={dispute.disputeId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...STIFF_SPRING, delay: idx * 0.04 }}
              onClick={() => openDetail(dispute)}
              className="
                group w-full text-left px-5 py-5 
                bg-white/5 backdrop-blur-[24px] rounded-[28px] 
                border border-white/10 relative overflow-hidden
                shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                active:scale-[0.98] transition-all duration-200
              "
            >
              <div className="absolute inset-0 pointer-events-none rounded-[28px] border border-white/5" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl ${sc.bg} ${sc.border} border flex items-center justify-center shrink-0`}
                  >
                    <StatusIcon size={18} className={sc.text} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-white/90 truncate">
                        {dispute.transactionRef}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full ${sc.bg} ${sc.border} border ${sc.text} font-semibold uppercase tracking-wider`}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-white/40">
                      <span>{dispute.transactionType}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>
                        ৳{dispute.amount.toLocaleString()}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>{dispute.category}</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1 truncate">
                      {dispute.raisedByName} &middot;{" "}
                      {new Date(dispute.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight
                  size={18}
                  className="text-white/15 group-hover:text-white/50 transition-colors shrink-0 ml-3"
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RAISE DISPUTE — GOVERNED FORM
// ═══════════════════════════════════════════

function RaiseDisputeForm({ onBack }: { onBack: () => void }) {
  const transactions = getAllTransactions();

  const [selectedTxnId, setSelectedTxnId] = useState("");
  const [category, setCategory] = useState<DisputeCategory | "">("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState("");
  const [declaration, setDeclaration] = useState(false);
  const [enforcementResult, setEnforcementResult] =
    useState<EnforcementResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedOutcome, setSubmittedOutcome] = useState<
    "APPROVAL_REQUIRED" | "UNDER_REVIEW" | null
  >(null);

  const selectedTxn = transactions.find((t) => t.id === selectedTxnId);

  const isFormValid =
    selectedTxnId !== "" &&
    category !== "" &&
    description.trim() !== "" &&
    declaration;

  // GOVERNANCE_ENFORCEMENT — Dispute Request Service Gate
  function handleSubmit() {
    const result = enforceServiceRequestGate({
      serviceType: "DISPUTE_REQUEST",
      actionLabel: "Raise Dispute",
    });
    setEnforcementResult(result);

    if (result.outcome === "BLOCKED") {
      return;
    }

    const txnTypeMap: Record<string, Dispute["transactionType"]> = {
      "Bank Transfer": "Transfer",
      MFS: "MFS",
      "Bill Payment": "Bill",
    };

    const newDispute: Dispute = {
      disputeId: `dsp_${Date.now()}`,
      transactionId: selectedTxnId,
      transactionRef: selectedTxn?.reference || selectedTxnId,
      transactionType: txnTypeMap[selectedTxn?.type || ""] || "Other",
      amount: selectedTxn?.amount || 0,
      recipientName: selectedTxn?.recipient.name || "Unknown",
      category: category as DisputeCategory,
      description,
      attachment: attachment.trim() || null,
      status: "SUBMITTED",
      raisedBy: "current",
      raisedByName: result.details.actor,
      createdAt: new Date().toISOString(),
      approvalId: null,
      auditId: result.auditId,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNote: null,
    };

    if (result.outcome === "APPROVAL_REQUIRED") {
      const approvalId = createServiceRequestApproval({
        serviceType: "DISPUTE_REQUEST",
        actionLabel: "Raise Dispute",
        requestParams: {
          transactionId: selectedTxnId,
          transactionRef: selectedTxn?.reference,
          category,
          description,
          amount: selectedTxn?.amount,
        },
      });
      newDispute.approvalId = approvalId || null;
      newDispute.status = "SUBMITTED";
      addDispute(newDispute);
      setSubmitted(true);
      setSubmittedOutcome("APPROVAL_REQUIRED");
      return;
    }

    if (result.outcome === "ALLOWED") {
      newDispute.status = "UNDER_REVIEW";
      addDispute(newDispute);
      setSubmitted(true);
      setSubmittedOutcome("UNDER_REVIEW");
    }
  }

  // ── CONFIRMATION BANNER (post-submit) ──
  if (submitted) {
    return (
      <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
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
              submittedOutcome === "UNDER_REVIEW"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-amber-500/10 border-amber-500/30"
            } border flex items-center justify-center mb-8`}
          >
            {submittedOutcome === "UNDER_REVIEW" ? (
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
            {submittedOutcome === "UNDER_REVIEW"
              ? "Dispute Raised"
              : "Routed for Approval"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mb-12"
          >
            {submittedOutcome === "UNDER_REVIEW"
              ? "Under Review"
              : "Pending Authorisation"}
          </motion.p>

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...STIFF_SPRING, delay: 0.3 }}
            className="w-full max-w-md rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-7 space-y-4"
          >
            <ConfirmRow
              label="Transaction"
              value={selectedTxn?.reference || selectedTxnId}
            />
            <ConfirmRow
              label="Amount"
              value={`৳${(selectedTxn?.amount || 0).toLocaleString()}`}
            />
            <ConfirmRow label="Category" value={category as string} />
            <ConfirmRow
              label="Audit ID"
              value={enforcementResult?.auditId.slice(-12) || "\u2014"}
              mono
            />
          </motion.div>

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
            Back to Disputes
          </motion.button>
        </div>
      </div>
    );
  }

  // ── FORM SCREEN ──
  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
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
          <h1 className="text-3xl font-serif tracking-tight">Raise Dispute</h1>
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
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FileWarning size={20} className="text-amber-400" />
          </div>
          <h2 className="font-serif text-white">Dispute Details</h2>
        </div>

        <div className="space-y-5">
          {/* Transaction Selector */}
          <FormField label="Transaction">
            <select
              className="dsp-input"
              value={selectedTxnId}
              onChange={(e) => setSelectedTxnId(e.target.value)}
            >
              <option value="" className="bg-slate-900">
                Select Transaction
              </option>
              {transactions.map((txn) => (
                <option key={txn.id} value={txn.id} className="bg-slate-900">
                  {txn.reference} &mdash; ৳{txn.amount.toLocaleString()} &mdash;{" "}
                  {txn.recipient.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Selected Transaction Preview */}
          {selectedTxn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2"
            >
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30 uppercase tracking-wider">
                  Recipient
                </span>
                <span className="text-white/70">
                  {selectedTxn.recipient.name}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30 uppercase tracking-wider">
                  Type
                </span>
                <span className="text-white/70">{selectedTxn.type}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30 uppercase tracking-wider">
                  Status
                </span>
                <span className="text-white/70 capitalize">
                  {selectedTxn.status}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30 uppercase tracking-wider">
                  Date
                </span>
                <span className="text-white/70">
                  {selectedTxn.createdAt.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </motion.div>
          )}

          {/* Category Dropdown */}
          <FormField label="Dispute Category">
            <select
              className="dsp-input"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as DisputeCategory | "")
              }
            >
              <option value="" className="bg-slate-900">
                Select Category
              </option>
              {DISPUTE_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <textarea
              className="dsp-input min-h-[100px] resize-none"
              placeholder="Describe the dispute in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          {/* Attachment (mock filename only) */}
          <FormField label="Attachment (Optional)">
            <div className="relative">
              <input
                className="dsp-input pl-10"
                placeholder="e.g. evidence_doc.pdf"
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
              />
              <Paperclip
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
              />
            </div>
          </FormField>

          {/* Declaration */}
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-all">
            <input
              type="checkbox"
              checked={declaration}
              onChange={(e) => setDeclaration(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-cyan-500 rounded shrink-0"
            />
            <span className="text-sm text-white/70 leading-relaxed">
              I confirm the information provided is accurate and I authorise this
              dispute to be raised against the referenced transaction.
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
            Submit Dispute
          </motion.button>
        </div>
      </motion.div>

      <style>{`
        .dsp-input {
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
        .dsp-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .dsp-input:focus {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
        select.dsp-input {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
        textarea.dsp-input {
          resize: vertical;
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════
// DISPUTE DETAIL — READ-ONLY PANEL
// ═══════════════════════════════════════════

function DisputeDetail({
  dispute,
  onBack,
}: {
  dispute: Dispute;
  onBack: () => void;
}) {
  const sc = STATUS_CONFIG[dispute.status];

  // Build status timeline
  const timeline: { label: string; date: string; actor?: string }[] = [
    {
      label: "Dispute Raised",
      date: dispute.createdAt,
      actor: dispute.raisedByName,
    },
  ];

  if (
    dispute.status === "UNDER_REVIEW" ||
    dispute.status === "RESOLVED" ||
    dispute.status === "REJECTED"
  ) {
    timeline.push({
      label: "Under Review",
      date:
        dispute.status === "UNDER_REVIEW"
          ? dispute.createdAt
          : dispute.resolvedAt || dispute.createdAt,
    });
  }

  if (dispute.status === "RESOLVED") {
    timeline.push({
      label: "Resolved",
      date: dispute.resolvedAt || "",
      actor: dispute.resolvedBy || undefined,
    });
  }

  if (dispute.status === "REJECTED") {
    timeline.push({
      label: "Rejected",
      date: dispute.resolvedAt || "",
      actor: dispute.resolvedBy || undefined,
    });
  }

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-serif tracking-tight">
            Dispute Detail
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            {dispute.disputeId}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${sc.bg} ${sc.border} border`}
        >
          <sc.icon size={14} className={sc.text} />
          <span className={`text-xs font-semibold ${sc.text}`}>
            {sc.label}
          </span>
        </div>
      </header>

      {/* Transaction Snapshot Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.05 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 mb-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
            <FileText size={16} className="text-white/50" />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
            Transaction Snapshot
          </span>
        </div>

        <div className="space-y-3">
          <DetailRow label="Reference" value={dispute.transactionRef} mono />
          <DetailRow label="Transaction ID" value={dispute.transactionId} mono />
          <DetailRow label="Type" value={dispute.transactionType} />
          <DetailRow
            label="Amount"
            value={`৳${dispute.amount.toLocaleString()}`}
          />
          <DetailRow label="Recipient" value={dispute.recipientName} />
        </div>
      </motion.div>

      {/* Dispute Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.1 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 mb-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <FileWarning size={16} className="text-amber-400" />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
            Dispute Information
          </span>
        </div>

        <div className="space-y-3">
          <DetailRow label="Category" value={dispute.category} />
          <div>
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">
              Description
            </span>
            <p className="text-sm text-white/70 leading-relaxed">
              {dispute.description}
            </p>
          </div>
          {dispute.attachment && (
            <div className="flex items-center gap-2 mt-2">
              <Paperclip size={12} className="text-white/30" />
              <span className="text-xs text-cyan-400/80 font-mono">
                {dispute.attachment}
              </span>
            </div>
          )}
          <DetailRow label="Raised By" value={dispute.raisedByName} />
          <DetailRow
            label="Created"
            value={new Date(dispute.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </div>
      </motion.div>

      {/* Resolution Note (if resolved/rejected) */}
      {dispute.resolutionNote && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...STIFF_SPRING, delay: 0.15 }}
          className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 mb-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-8 h-8 rounded-lg ${sc.bg} ${sc.border} border flex items-center justify-center`}
            >
              <sc.icon size={16} className={sc.text} />
            </div>
            <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
              Resolution
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {dispute.resolutionNote}
          </p>
          {dispute.resolvedBy && (
            <p className="text-[10px] text-white/30 mt-3">
              Resolved by {dispute.resolvedBy}{" "}
              {dispute.resolvedAt &&
                `on ${new Date(dispute.resolvedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}`}
            </p>
          )}
        </motion.div>
      )}

      {/* Status Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.2 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 mb-5"
      >
        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold block mb-5">
          Status Timeline
        </span>

        <div className="space-y-0">
          {timeline.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    idx === timeline.length - 1
                      ? `${sc.bg} ${sc.border} border`
                      : "bg-white/20 border border-white/10"
                  }`}
                />
                {idx < timeline.length - 1 && (
                  <div className="w-px flex-1 bg-white/10 min-h-[32px]" />
                )}
              </div>

              {/* Content */}
              <div className="pb-5">
                <p
                  className={`text-sm ${
                    idx === timeline.length - 1
                      ? "text-white/90"
                      : "text-white/50"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-white/25 mt-0.5">
                  {step.date
                    ? new Date(step.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "\u2014"}
                  {step.actor && ` \u2014 ${step.actor}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Audit & Approval References */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.25 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 mb-5"
      >
        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold block mb-4">
          Audit & Governance
        </span>
        <div className="space-y-3">
          <DetailRow label="Dispute ID" value={dispute.disputeId} mono />
          <DetailRow label="Audit ID" value={dispute.auditId} mono />
          {dispute.approvalId && (
            <DetailRow
              label="Approval ID"
              value={dispute.approvalId}
              mono
            />
          )}
        </div>
      </motion.div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        whileTap={{ scale: 0.97 }}
        onClick={onBack}
        className="w-full max-w-md mx-auto block mt-4 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-semibold rounded-2xl tracking-[0.2em] text-xs uppercase transition-all"
      >
        Back to Disputes
      </motion.button>
    </div>
  );
}

// ═══════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════

function FormField({
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

function DetailRow({
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
        className={`text-sm text-white/80 ${mono ? "font-mono tracking-wider text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function ConfirmRow({
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