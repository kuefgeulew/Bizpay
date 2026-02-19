import { useState, useRef, useEffect } from "react";
import { ArrowLeft, CheckCircle, XCircle, ArrowUpLeft, AlertTriangle, Clock, User, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  type MockApproval,
  getCurrentUser,
  getAvailableActions,
  approveItem,
  rejectItem,
  verifyItem,
  sendBack,
} from "../../../mock";
import SystemDisclaimer from "../../../components/SystemDisclaimer";
import { enforceApprovalAction, resolveApprovalOnce, type EnforcementResult } from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";

interface ApprovalDetailScreenProps {
  item: MockApproval;
  onBack: () => void;
  currentUser: {
    userId: string;
    name: string;
    role: "maker" | "checker" | "approver" | "admin" | "viewer";
  };
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function ApprovalDetailScreen({
  item,
  onBack,
  currentUser,
}: ApprovalDetailScreenProps) {
  const [comment, setComment] = useState("");
  const [showActionDialog, setShowActionDialog] = useState<
    "verify" | "send_back" | "approve" | "reject" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // GOVERNANCE_ENFORCEMENT — A2: Approval Workflow Binding state
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);
  // D4-8: Unmount safety — prevent state mutations after unmount
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // D4-8: Abort any in-flight processing on unmount
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const user = getCurrentUser();
  const actions = getAvailableActions(item);

  const handleAction = async (action: "verify" | "send_back" | "approve" | "reject") => {
    // D4-7: Disabled-state guarantee — prevent double-click
    if (isProcessing) return;
    setIsProcessing(true);

    // D4-8: Create abort controller for this operation
    abortRef.current = new AbortController();

    // GOVERNANCE_ENFORCEMENT — A2: Gate approval actions through governance engine
    const governanceActionMap: Record<string, "APPROVE" | "REJECT" | "SEND_BACK"> = {
      verify: "APPROVE",
      approve: "APPROVE",
      reject: "REJECT",
      send_back: "SEND_BACK",
    };
    const enfResult = enforceApprovalAction({
      action: governanceActionMap[action],
      itemAmount: item.amount,
    });

    // D4-8: Check if still mounted
    if (!mountedRef.current) return;
    setEnforcementResult(enfResult);

    if (enfResult.outcome === "BLOCKED") {
      // GOVERNANCE_ENFORCEMENT — Hard stop: role or limit violation
      setIsProcessing(false);
      setShowActionDialog(null);
      return;
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // D4-8: Check if still mounted after async delay
    if (!mountedRef.current || abortRef.current?.signal.aborted) return;

    // D2-3: Wrap approval/reject in resolveApprovalOnce for atomic resolution
    const resolutionAction = governanceActionMap[action];
    let result;

    if (action === "approve" || action === "reject") {
      const atomicResult = resolveApprovalOnce(
        item.id,
        resolutionAction,
        () => {
          if (action === "approve") {
            const r = approveItem(item.id, comment || undefined);
            return { success: r.success, message: r.message };
          } else {
            const r = rejectItem(item.id, comment);
            return { success: r.success, message: r.message };
          }
        }
      );

      if (atomicResult.blocked) {
        if (mountedRef.current) {
          setIsProcessing(false);
          setShowActionDialog(null);
        }
        return;
      }
      result = { success: atomicResult.success, message: atomicResult.reason };
    } else {
      switch (action) {
        case "verify":
          result = verifyItem(item.id, comment || undefined);
          break;
        case "send_back":
          if (!comment.trim()) {
            if (mountedRef.current) setIsProcessing(false);
            return;
          }
          result = sendBack(item.id, comment);
          break;
      }
    }

    // D4-8: Final mount check before state updates
    if (!mountedRef.current) return;

    setIsProcessing(false);
    setShowActionDialog(null);

    if (result?.success) {
      // Return to queue after successful action
      setTimeout(() => {
        if (mountedRef.current) {
          onBack();
        }
      }, 1500);
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case "pending":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "approved":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-white/10 text-white/50 border-white/20";
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400";
      case "high":
        return "bg-orange-500/20 text-orange-400";
      case "medium":
        return "bg-cyan-500/20 text-cyan-400";
      case "low":
        return "bg-white/10 text-white/40";
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = item.expiresAt;
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) return "Expired";
    if (diffHours < 24) return `${diffHours} hours remaining`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days remaining`;
  };

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
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-serif tracking-tight">{item.title}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Approval Detail
          </p>
        </div>
        <span
          className={`px-3 py-1.5 text-[9px] font-bold rounded-full border capitalize ${getStatusColor()}`}
        >
          {item.status}
        </span>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Status Banner */}
        {item.status === "pending" && item.requiresReAuth && (
          <div className="p-4 rounded-[24px] bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 backdrop-blur-xl">
            <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white/90 font-semibold mb-1">Re-authentication Required</p>
              <p className="text-xs text-white/60">
                This transaction requires additional authentication before approval.
              </p>
            </div>
          </div>
        )}

        {/* Amount Card */}
        {item.amount && (
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Transaction Amount</p>
            <p className="text-3xl font-serif text-white">
              ৳{item.amount.toLocaleString()}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <DetailCard
            icon={<User size={14} className="text-cyan-400" />}
            label="Submitted By"
            value={item.submittedByName}
          />
          <DetailCard
            icon={<Clock size={14} className="text-cyan-400" />}
            label="Submitted At"
            value={new Date(item.submittedAt).toLocaleDateString()}
          />
          <DetailCard
            icon={<FileText size={14} className="text-cyan-400" />}
            label="Type"
            value={`${item.type} - ${item.subType}`}
          />
          <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Priority</p>
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getPriorityColor()}`}>
              {item.priority}
            </span>
          </div>
        </div>

        {/* SLA Timer */}
        {item.status === "pending" && (
          <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-white/30" />
              <p className="text-sm text-white/70 font-medium">SLA Countdown</p>
            </div>
            <span className="text-sm text-white/90 font-semibold">
              {getTimeRemaining()}
            </span>
          </div>
        )}

        {/* Metadata */}
        {Object.keys(item.metadata).length > 0 && (
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">
              Additional Information
            </p>
            <div className="space-y-2">
              {Object.entries(item.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0">
                  <span className="text-xs text-white/40 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-white/80 font-medium">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Timeline */}
        <div className="p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-4">
            Approval Workflow
          </p>
          <WorkflowTimeline item={item} />
        </div>

        {/* GOVERNANCE_ENFORCEMENT — A2: Inline enforcement bar for approval actions */}
        {enforcementResult && (
          <GovernanceBar
            result={enforcementResult}
            onDismiss={() => setEnforcementResult(null)}
          />
        )}

        {/* Action Buttons */}
        {!actions.canViewOnly && item.status === "pending" && (
          <div className="grid grid-cols-2 gap-3">
            {actions.canVerify && (
              <ActionButton
                icon={<CheckCircle size={18} />}
                label="Verify"
                variant="success"
                onClick={() => setShowActionDialog("verify")}
                disabled={isProcessing || !!enforcementResult}
              />
            )}

            {actions.canApprove && (
              <ActionButton
                icon={<CheckCircle size={18} />}
                label="Approve"
                variant="success"
                onClick={() => setShowActionDialog("approve")}
                disabled={isProcessing || !!enforcementResult}
              />
            )}

            {actions.canSendBack && (
              <ActionButton
                icon={<ArrowUpLeft size={18} />}
                label="Send Back"
                variant="warning"
                onClick={() => setShowActionDialog("send_back")}
                disabled={isProcessing || !!enforcementResult}
              />
            )}

            {actions.canReject && (
              <ActionButton
                icon={<XCircle size={18} />}
                label="Reject"
                variant="danger"
                onClick={() => setShowActionDialog("reject")}
                disabled={isProcessing || !!enforcementResult}
              />
            )}
          </div>
        )}

        {/* View Only Message */}
        {actions.canViewOnly && (
          <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/[0.05] text-center">
            <p className="text-xs text-white/40">
              {user.role === "maker" && item.submittedBy === user.id
                ? "You cannot approve your own submission"
                : `Action not available for ${user.role} role`}
            </p>
          </div>
        )}

        {/* System Note */}
        <SystemDisclaimer context="footer" className="mt-8" />
      </div>

      {/* Action Dialog */}
      <AnimatePresence>
        {showActionDialog && (
          <ActionDialog
            action={showActionDialog}
            item={item}
            comment={comment}
            setComment={setComment}
            onConfirm={() => handleAction(showActionDialog)}
            onCancel={() => setShowActionDialog(null)}
            isProcessing={isProcessing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------- Sub-Components -------- */

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/[0.05]">
      <div className="flex items-center gap-2 mb-2 text-white/40">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      {value && <p className="text-xs text-white/80 font-medium">{value}</p>}
    </div>
  );
}

function WorkflowTimeline({ item }: { item: MockApproval }) {
  const stages = [
    { name: "Maker", status: "completed", user: item.submittedByName },
    { name: "Checker", status: item.status === "pending" ? "pending" : "completed", user: item.approvedByName },
    { name: "Approver", status: item.status === "approved" ? "completed" : "pending", user: item.approvedByName },
  ];

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={stage.name} className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${
              stage.status === "completed"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : stage.status === "pending"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-white/20 border border-white/10"
            }`}
          >
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/80 font-medium">{stage.name}</p>
            {stage.user && (
              <p className="text-[10px] text-white/30">{stage.user}</p>
            )}
          </div>
          <span
            className={`px-2 py-1 text-[9px] font-bold rounded-full capitalize ${
              stage.status === "completed"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : stage.status === "pending"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-white/20 border border-white/10"
            }`}
          >
            {stage.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function ActionButton({
  icon,
  label,
  variant,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  variant: "success" | "warning" | "danger";
  onClick: () => void;
  disabled?: boolean;
}) {
  const colors = {
    success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30",
    warning: "bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30",
    danger: "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30",
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold transition-all border text-sm ${colors[variant]} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

function ActionDialog({
  action,
  item,
  comment,
  setComment,
  onConfirm,
  onCancel,
  isProcessing,
}: {
  action: "verify" | "send_back" | "approve" | "reject";
  item: MockApproval;
  comment: string;
  setComment: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}) {
  const config = {
    verify: {
      title: "Verify Item",
      description: "Mark this item as verified and forward to approver",
      confirmText: "Verify",
      requireComment: false,
      variant: "success" as const,
    },
    send_back: {
      title: "Send Back for Revision",
      description: "Return this item to the maker for corrections",
      confirmText: "Send Back",
      requireComment: true,
      variant: "warning" as const,
    },
    approve: {
      title: "Approve Item",
      description: "Grant final approval for this transaction",
      confirmText: "Approve",
      requireComment: false,
      variant: "success" as const,
    },
    reject: {
      title: "Reject Item",
      description: "Permanently reject this transaction",
      confirmText: "Reject",
      requireComment: true,
      variant: "danger" as const,
    },
  };

  const { title, description, confirmText, requireComment, variant } = config[action];

  const confirmColors = {
    success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30",
    warning: "bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30",
    danger: "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30",
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
        onClick={onCancel}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md rounded-[28px] bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] z-[101] p-6"
      >
        <h3 className="font-serif text-white mb-2">{title}</h3>
        <p className="text-xs text-white/50 mb-4">{description}</p>

        {/* Item Summary */}
        <div className="p-3 rounded-[16px] bg-white/[0.05] border border-white/10 mb-4">
          <p className="text-sm text-white/80 font-medium">{item.title}</p>
          {item.amount && (
            <p className="text-[10px] text-white/40 mt-1">
              ৳{item.amount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Comment Input */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
            {requireComment ? "Reason (Required)" : "Comment (Optional)"}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={requireComment ? "Please provide a reason..." : "Add a comment..."}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm resize-none focus:outline-none focus:border-cyan-500/50 placeholder:text-white/20"
            rows={3}
            disabled={isProcessing}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-2xl font-semibold bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing || (requireComment && !comment.trim())}
            className={`flex-1 px-4 py-3 rounded-2xl font-semibold transition-all disabled:opacity-50 text-sm border ${confirmColors[variant]}`}
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </motion.div>
    </>
  );
}