/**
 * SUPPORT & TICKETS — SERVICE REQUEST SCREEN
 * Non-money-moving governed service request for in-app support ticketing.
 * Uses enforceServiceRequestGate({ serviceType: "SUPPORT_TICKET" }) with
 * BLOCKED/APPROVAL_REQUIRED/ALLOWED handling.
 * Tickets are immutable post-creation — no edits, no status changes from UI.
 *
 * Three sections:
 * 1. RM PANEL — Read-only Relationship Manager card
 * 2. TICKET LIST — View all raised tickets
 * 3. RAISE TICKET — Governed form to submit a new ticket
 * 4. TICKET DETAIL — Read-only detail panel (no action buttons)
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader,
  PauseCircle,
  Ticket,
  User,
  Building2,
  Phone,
  Mail,
  CalendarClock,
  Paperclip,
  FileText,
  Shield,
} from "lucide-react";
import {
  enforceServiceRequestGate,
  createServiceRequestApproval,
  type EnforcementResult,
} from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";
import {
  getSupportTickets,
  addSupportTicket,
  type SupportTicket,
  type TicketStatus,
  type TicketCategory,
} from "../../../mock/supportTickets";
import { getAssignedServiceManager } from "../../../mock/serviceManagers";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45 };

const TICKET_CATEGORIES: TicketCategory[] = [
  "Service",
  "Technical",
  "Transaction",
  "Other",
];

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; border: string; text: string; icon: typeof Clock }
> = {
  OPEN: {
    label: "Open",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    icon: Loader,
  },
  WAITING_FOR_CUSTOMER: {
    label: "Waiting",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    icon: PauseCircle,
  },
  RESOLVED: {
    label: "Resolved",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Closed",
    bg: "bg-white/5",
    border: "border-white/20",
    text: "text-white/50",
    icon: XCircle,
  },
};

interface SupportTicketsScreenProps {
  onBack: () => void;
}

export default function SupportTicketsScreen({
  onBack,
}: SupportTicketsScreenProps) {
  const [view, setView] = useState<"list" | "raise" | "detail">("list");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>(getSupportTickets);

  function refreshTickets() {
    setTickets(getSupportTickets());
  }

  function openDetail(ticket: SupportTicket) {
    setSelectedTicket(ticket);
    setView("detail");
  }

  function openRaise() {
    setView("raise");
  }

  function backToList() {
    setSelectedTicket(null);
    refreshTickets();
    setView("list");
  }

  // ── VIEW ROUTING ──
  if (view === "raise") {
    return <RaiseTicketForm onBack={backToList} />;
  }

  if (view === "detail" && selectedTicket) {
    return <TicketDetail ticket={selectedTicket} onBack={backToList} />;
  }

  // ── MAIN LIST VIEW ──
  const rm = getAssignedServiceManager();

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
              Support & Tickets
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              Service Management
            </p>
          </div>
        </div>

        {/* Raise Ticket CTA */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openRaise}
          className="flex items-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-2xl font-semibold text-xs uppercase tracking-[0.15em] shadow-lg shadow-cyan-900/30 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Ticket
        </motion.button>
      </header>

      {/* ═══ PART A: RELATIONSHIP MANAGER PANEL ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.05 }}
        className="mb-6 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <User size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="font-serif text-white">Your Service Manager</h2>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold mt-0.5">
              Read-Only
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <RMInfoRow icon={User} label="Name" value={rm.name} />
          <RMInfoRow icon={Shield} label="Designation" value={rm.designation} />
          <RMInfoRow icon={Building2} label="Branch / Unit" value={`${rm.branch} — ${rm.unit}`} />
          <RMInfoRow icon={Phone} label="Phone" value={rm.phone} />
          <RMInfoRow icon={Mail} label="Email" value={rm.email} />
          <RMInfoRow icon={CalendarClock} label="Working Hours" value={rm.workingHours} />
        </div>
      </motion.div>

      {/* ═══ PART B: TICKET LIST ═══ */}

      {/* Summary Pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map((status) => {
          const count = tickets.filter((t) => t.status === status).length;
          const c = STATUS_CONFIG[status];
          return (
            <div
              key={status}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${c.bg} ${c.border} border backdrop-blur-xl`}
            >
              <span className={`text-[10px] font-semibold ${c.text}`}>
                {c.label}
              </span>
              <span className={`text-[10px] font-mono ${c.text}`}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Ticket Rows */}
      <div className="space-y-3">
        {tickets.map((ticket, idx) => {
          const sc = STATUS_CONFIG[ticket.status];
          const StatusIcon = sc.icon;
          return (
            <motion.button
              key={ticket.ticketId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...STIFF_SPRING, delay: idx * 0.04 }}
              onClick={() => openDetail(ticket)}
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
                      <span className="text-[11px] font-mono text-white/50">
                        {ticket.ticketId}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full ${sc.bg} ${sc.border} border ${sc.text} font-semibold uppercase tracking-wider`}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-sm text-white/90 truncate mb-1">
                      {ticket.subject}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-white/40">
                      <span>{ticket.category}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>{ticket.raisedByName}</span>
                    </div>
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
// RM INFO ROW — Display-only field
// ═══════════════════════════════════════════

function RMInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-white/25 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-0.5">
          {label}
        </p>
        <p className="text-[12px] text-white/80 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RAISE TICKET — GOVERNED FORM
// ═══════════════════════════════════════════

function RaiseTicketForm({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState("");
  const [enforcementResult, setEnforcementResult] =
    useState<EnforcementResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedOutcome, setSubmittedOutcome] = useState<
    "APPROVAL_REQUIRED" | "OPEN" | null
  >(null);
  const [submittedTicketId, setSubmittedTicketId] = useState("");

  const isFormValid =
    category !== "" &&
    subject.trim() !== "" &&
    description.trim() !== "";

  const rm = getAssignedServiceManager();

  // GOVERNANCE_ENFORCEMENT — Support Ticket Service Gate
  function handleSubmit() {
    const result = enforceServiceRequestGate({
      serviceType: "SUPPORT_TICKET",
      actionLabel: "Submit Ticket",
    });
    setEnforcementResult(result);

    if (result.outcome === "BLOCKED") {
      return;
    }

    const ticketId = `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

    const newTicket: SupportTicket = {
      ticketId,
      category: category as TicketCategory,
      subject: subject.trim(),
      description: description.trim(),
      attachment: attachment.trim() || null,
      status: "OPEN",
      raisedBy: "current",
      raisedByName: result.details.actor,
      assignedRmId: rm.id,
      assignedRmName: rm.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvalId: null,
      auditId: result.auditId,
      timeline: [
        {
          timestamp: new Date().toISOString(),
          status: "OPEN",
          note: "Ticket created — awaiting assignment",
          actor: result.details.actor,
        },
      ],
    };

    if (result.outcome === "APPROVAL_REQUIRED") {
      const approvalId = createServiceRequestApproval({
        serviceType: "SUPPORT_TICKET",
        actionLabel: "Submit Ticket",
        requestParams: {
          category,
          subject: subject.trim(),
          description: description.trim(),
        },
      });
      newTicket.approvalId = approvalId || null;
      newTicket.status = "OPEN";
      addSupportTicket(newTicket);
      setSubmittedTicketId(ticketId);
      setSubmitted(true);
      setSubmittedOutcome("APPROVAL_REQUIRED");
      return;
    }

    if (result.outcome === "ALLOWED") {
      newTicket.status = "OPEN";
      addSupportTicket(newTicket);
      setSubmittedTicketId(ticketId);
      setSubmitted(true);
      setSubmittedOutcome("OPEN");
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
              submittedOutcome === "OPEN"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-amber-500/10 border-amber-500/30"
            } border flex items-center justify-center mb-8`}
          >
            {submittedOutcome === "OPEN" ? (
              <CheckCircle2
                size={40}
                strokeWidth={1.5}
                className="text-emerald-400"
              />
            ) : (
              <Clock
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
            {submittedOutcome === "OPEN"
              ? "Ticket Submitted"
              : "Routed for Approval"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mb-12"
          >
            {submittedOutcome === "OPEN"
              ? "Ticket Open"
              : "Pending Authorisation"}
          </motion.p>

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...STIFF_SPRING, delay: 0.3 }}
            className="w-full max-w-md rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-7 space-y-4"
          >
            <ConfirmRow label="Ticket ID" value={submittedTicketId} mono />
            <ConfirmRow label="Category" value={category as string} />
            <ConfirmRow label="Subject" value={subject} />
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
            Back to Support & Tickets
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
          <h1 className="text-3xl font-serif tracking-tight">Raise Ticket</h1>
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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Ticket size={20} className="text-cyan-400" />
          </div>
          <h2 className="font-serif text-white">Ticket Details</h2>
        </div>

        <div className="space-y-5">
          {/* Category Dropdown */}
          <FormField label="Category">
            <select
              className="tkt-input"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as TicketCategory | "")
              }
            >
              <option value="" className="bg-slate-900">
                Select Category
              </option>
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          {/* Subject */}
          <FormField label="Subject">
            <input
              className="tkt-input"
              placeholder="Brief summary of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <textarea
              className="tkt-input min-h-[100px] resize-none"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          {/* Attachment (mock filename only) */}
          <FormField label="Attachment (Optional)">
            <div className="relative">
              <input
                className="tkt-input pl-10"
                placeholder="e.g. screenshot.png"
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
              />
              <Paperclip
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
              />
            </div>
          </FormField>

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
            Submit Ticket
          </motion.button>
        </div>
      </motion.div>

      <style>{`
        .tkt-input {
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
        .tkt-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .tkt-input:focus {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
        select.tkt-input {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
        textarea.tkt-input {
          resize: vertical;
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════
// TICKET DETAIL — READ-ONLY PANEL
// ═══════════════════════════════════════════

function TicketDetail({
  ticket,
  onBack,
}: {
  ticket: SupportTicket;
  onBack: () => void;
}) {
  const sc = STATUS_CONFIG[ticket.status];
  const rm = getAssignedServiceManager();

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
            Ticket Detail
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            {ticket.ticketId} &middot; Read-Only
          </p>
        </div>
      </header>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.05 }}
        className={`flex items-center gap-4 px-5 py-4 rounded-[28px] ${sc.bg} ${sc.border} border backdrop-blur-xl mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]`}
      >
        <div
          className={`w-10 h-10 rounded-xl ${sc.bg} ${sc.border} border flex items-center justify-center`}
        >
          {(() => {
            const StatusIcon = sc.icon;
            return <StatusIcon size={20} className={sc.text} />;
          })()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${sc.text} uppercase tracking-wider`}>
            {sc.label}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">
            Last updated:{" "}
            {new Date(ticket.updatedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </motion.div>

      {/* Ticket Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.1 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 mb-5 space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-cyan-400" />
          </div>
          <h3 className="font-serif text-white text-sm">Ticket Information</h3>
        </div>

        <DetailRow label="Ticket ID" value={ticket.ticketId} mono />
        <DetailRow label="Category" value={ticket.category} />
        <DetailRow label="Subject" value={ticket.subject} />
        <DetailRow label="Description" value={ticket.description} />
        {ticket.attachment && (
          <DetailRow label="Attachment" value={ticket.attachment} />
        )}
        <DetailRow label="Raised By" value={ticket.raisedByName} />
        <DetailRow
          label="Created"
          value={new Date(ticket.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      </motion.div>

      {/* RM Assigned Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.15 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 mb-5 space-y-3"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <User size={16} className="text-cyan-400" />
          </div>
          <h3 className="font-serif text-white text-sm">Assigned Service Manager</h3>
        </div>
        <DetailRow label="Name" value={rm.name} />
        <DetailRow label="Branch" value={rm.branch} />
        <DetailRow label="Contact" value={rm.phone} />
      </motion.div>

      {/* Audit Reference Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.2 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 mb-5 space-y-3"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-white/40" />
          </div>
          <h3 className="font-serif text-white text-sm">Audit Reference</h3>
        </div>
        <DetailRow label="Audit ID" value={ticket.auditId} mono />
        {ticket.approvalId && (
          <DetailRow label="Approval ID" value={ticket.approvalId} mono />
        )}
      </motion.div>

      {/* Status Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.25 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Clock size={16} className="text-white/40" />
          </div>
          <h3 className="font-serif text-white text-sm">Status Timeline</h3>
        </div>

        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

          <div className="space-y-5">
            {ticket.timeline.map((entry, idx) => {
              const esc = STATUS_CONFIG[entry.status];
              return (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full ${esc.bg} ${esc.border} border`}
                  />

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full ${esc.bg} ${esc.border} border ${esc.text} font-semibold uppercase tracking-wider`}
                      >
                        {esc.label}
                      </span>
                      <span className="text-[10px] text-white/30">
                        {new Date(entry.timestamp).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      {entry.note}
                    </p>
                    <p className="text-[10px] text-white/25 mt-0.5">
                      {entry.actor}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-bold shrink-0">
        {label}
      </span>
      <span
        className={`text-[11px] text-white/70 text-right leading-relaxed ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ConfirmRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-bold">
        {label}
      </span>
      <span
        className={`text-sm text-white/80 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
