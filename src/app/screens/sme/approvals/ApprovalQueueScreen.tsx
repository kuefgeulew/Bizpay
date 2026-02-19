import { useState } from "react";
import { ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import {
  getAllApprovals,
  getPendingApprovals,
  getCurrentUser,
  type MockApproval,
} from "../../../mock";
import SystemDisclaimer from "../../../components/SystemDisclaimer";

interface ApprovalQueueScreenProps {
  onBack: () => void;
  currentUserId: string;
  currentUserRole: "maker" | "checker" | "approver" | "admin" | "viewer";
  onItemClick: (item: MockApproval) => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

type TabType = "pending" | "sent" | "completed";

export default function ApprovalQueueScreen({
  onBack,
  currentUserId,
  currentUserRole,
  onItemClick,
}: ApprovalQueueScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const currentUser = getCurrentUser();
  const allApprovals = getAllApprovals();

  // Filter items based on tab and user role
  const filteredItems = allApprovals.filter((item) => {
    switch (activeTab) {
      case "pending":
        // Show items pending for current user based on role
        if (currentUserRole === "checker" || currentUserRole === "approver") {
          return (
            item.status === "pending" &&
            item.submittedBy !== currentUser.id // Cannot approve own submissions
          );
        }
        return false;

      case "sent":
        // Show items submitted by current user
        return item.submittedBy === currentUser.id;

      case "completed":
        // Show completed items (approved/rejected)
        return item.status === "approved" || item.status === "rejected";

      default:
        return false;
    }
  });

  // Count for badges
  const pendingCount = allApprovals.filter((item) => {
    if (currentUserRole === "checker" || currentUserRole === "approver") {
      return (
        item.status === "pending" &&
        item.submittedBy !== currentUser.id
      );
    }
    return false;
  }).length;

  const getRoleBadgeColor = () => {
    switch (currentUserRole) {
      case "admin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "maker":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "checker":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "approver":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "viewer":
        return "bg-white/10 text-white/50 border-white/20";
      default:
        return "bg-white/10 text-white/50 border-white/20";
    }
  };

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Header */}
      <header className="flex items-center gap-4 mb-12">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Approval Queue</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Workflow Management
          </p>
        </div>
      </header>

      {/* Contextual Helper */}
      <div className="mb-6 p-4 rounded-[24px] bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl">
        <p className="text-sm text-white/90 font-medium">
          This screen shows pending approvals assigned to your current role. Switch roles using the floating switcher to see different permission levels.
        </p>
      </div>

      {/* Role Badge */}
      <div className={`mb-6 inline-flex items-center px-3 py-1.5 rounded-full border ${getRoleBadgeColor()}`}>
        <span className="text-xs font-bold uppercase tracking-wider">
          {currentUserRole}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Tab
          label="Pending for Me"
          count={pendingCount}
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
        />
        <Tab
          label="Sent by Me"
          active={activeTab === "sent"}
          onClick={() => setActiveTab("sent")}
        />
        <Tab
          label="Completed"
          active={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
        />
      </div>

      {/* Items List */}
      <div className="space-y-3 pb-6">
        {filteredItems.length === 0 ? (
          <EmptyState tab={activeTab} role={currentUserRole} />
        ) : (
          filteredItems.map((item) => (
            <ApprovalCard
              key={item.id}
              item={item}
              onClick={() => onItemClick(item)}
            />
          ))
        )}
      </div>

      {/* System Note */}
      <SystemDisclaimer context="footer" className="mt-8" />
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function Tab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all relative backdrop-blur-xl
        ${
          active
            ? "bg-cyan-500/20 text-white border border-cyan-500/30 shadow-sm"
            : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
        }
      `}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`
          ml-2 px-2 py-0.5 rounded-full text-xs font-bold
          ${
            active
              ? "bg-cyan-400/30 text-white"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }
        `}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ApprovalCard({
  item,
  onClick,
}: {
  item: MockApproval;
  onClick: () => void;
}) {
  const priorityColors = {
    low: "bg-white/10 text-white/50 border-white/20",
    medium: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusColors = {
    pending: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    expired: "bg-white/10 text-white/40 border-white/20",
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = item.expiresAt;
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) return "Expired";
    if (diffHours < 24) return `${diffHours}h remaining`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d remaining`;
  };

  const getTimeElapsed = () => {
    const now = new Date();
    const created = item.submittedAt;
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      onClick={onClick}
      className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:bg-white/[0.05] cursor-pointer overflow-hidden"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-white tracking-tight mb-1">
            {item.title}
          </h3>
          <p className="text-xs text-white/60">
            by <span className="font-medium">{item.submittedByName}</span> • {getTimeElapsed()}
          </p>
        </div>

        {/* Priority Badge */}
        <span
          className={`px-2 py-1 text-[10px] font-bold rounded-full border uppercase ${
            priorityColors[item.priority]
          }`}
        >
          {item.priority}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-white/70 mb-3">{item.description}</p>

      {/* Amount (if applicable) */}
      {item.amount && (
        <div className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-white/60 mb-1 uppercase tracking-wider font-bold">Amount</p>
          <p className="text-lg font-bold text-white">
            ৳{item.amount.toLocaleString()}
          </p>
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-bold rounded-full border capitalize ${
              statusColors[item.status]
            }`}
          >
            {item.status}
          </span>
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-white/10 text-white/80 capitalize">
            {item.type}
          </span>
        </div>

        {/* SLA Timer */}
        {item.status === "pending" && (
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Clock size={14} />
            <span className="font-bold">{getTimeRemaining()}</span>
          </div>
        )}

        {/* Re-auth indicator */}
        {item.requiresReAuth && item.status === "pending" && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <AlertCircle size={14} />
            <span className="font-bold">Re-auth required</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ tab, role }: { tab: TabType; role: string }) {
  const messages = {
    pending: role === "maker"
      ? "You cannot approve items as a Maker. Switch to Checker or Approver role."
      : "No items pending your approval",
    sent: "You haven't submitted any items for approval",
    completed: "No completed approvals yet",
  };

  return (
    <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
        <Clock size={32} className="text-white/60" />
      </div>
      <h3 className="font-bold text-white mb-2">Nothing here</h3>
      <p className="text-sm text-white/70">{messages[tab]}</p>
    </div>
  );
}