import { useState } from "react";
import { ArrowLeft, UserX, DollarSign, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import RoleBadge from "../../../components/RoleBadge";
import {
  BUSINESS_USER_REGISTRY,
  ROLES,
  type RoleType,
  type BusinessUser,
  formatBDT,
} from "../../../data/userManagement";

interface EditUserScreenProps {
  userId: string;
  onBack: () => void;
  onSave: (updates: UserUpdates) => void;
}

export interface UserUpdates {
  role?: RoleType;
  dailyLimit?: number;
  status?: "active" | "suspended";
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function EditUserScreen({ userId, onBack, onSave }: EditUserScreenProps) {
  // Find user
  const businessUser = BUSINESS_USER_REGISTRY.find((bu) => bu.userId === userId);

  if (!businessUser || !businessUser.user) {
    return (
      <div className="h-full flex items-center justify-center text-white/50 font-sans">
        User not found
      </div>
    );
  }

  const user = businessUser.user;
  const [role, setRole] = useState<RoleType>(businessUser.role);
  const [dailyLimit, setDailyLimit] = useState(businessUser.dailyLimit);
  const [status, setStatus] = useState(businessUser.status);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const hasChanges =
    role !== businessUser.role ||
    dailyLimit !== businessUser.dailyLimit ||
    status !== businessUser.status;

  const needsLimit = role === "maker" || role === "approver";

  const handleSave = () => {
    const updates: UserUpdates = {};
    if (role !== businessUser.role) updates.role = role;
    if (dailyLimit !== businessUser.dailyLimit) updates.dailyLimit = dailyLimit;
    if (status !== businessUser.status) updates.status = status;

    onSave(updates);
  };

  const handleSuspend = () => {
    setStatus(status === "active" ? "suspended" : "active");
    setShowConfirmDialog(false);
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
      <header className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Edit User</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Access Management
          </p>
        </div>
      </header>

      {/* Main Glass Card */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 md:p-8 max-w-3xl mx-auto">
        {/* User Info Card */}
        <div className="p-5 rounded-[20px] bg-white/[0.03] border border-white/[0.05] mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-white/90 font-medium">{user.name}</h3>
              <p className="text-[10px] text-white/40">{user.email}</p>
            </div>
            <RoleBadge role={businessUser.role} size="md" />
          </div>
          <div className="pt-3 border-t border-white/10 text-[10px] text-white/30">
            <p>Phone: {user.phone}</p>
            <p className="mt-1">User ID: {user.id}</p>
          </div>
        </div>

        {/* Warning if changing critical settings */}
        {hasChanges && (
          <div className="mb-6 p-4 rounded-[20px] bg-amber-500/10 border border-amber-500/20 flex gap-3">
            <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white/90 font-semibold mb-1">Requires Approval</p>
              <p className="text-xs text-white/60">
                Changes to user roles or limits require Approver authorization.
              </p>
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
            Assign Role *
          </label>
          <div className="grid grid-cols-1 gap-2">
            {ROLES.map((r) => (
              <RoleOption
                key={r.id}
                role={r}
                selected={role === r.id}
                onSelect={() => setRole(r.id)}
              />
            ))}
          </div>
        </div>

        {/* Daily Limit */}
        {needsLimit && (
          <div className="mb-6 space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
              Daily Transaction Limit
            </label>
            <input
              type="number"
              placeholder="e.g., 500000"
              value={dailyLimit || ""}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="dd-input"
            />
            {dailyLimit > 0 && (
              <p className="text-[10px] text-white/40 mt-2 ml-1">
                Approx. {formatBDT(dailyLimit)}
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="my-6 border-t border-white/10" />

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Save Changes */}
          {hasChanges && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold transition-all shadow-lg shadow-cyan-900/30"
            >
              Save Changes
            </motion.button>
          )}

          {/* Suspend/Reactivate */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowConfirmDialog(true)}
            className={`w-full py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 border ${
              status === "active"
                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            <UserX size={18} />
            {status === "active" ? "Suspend User" : "Reactivate User"}
          </motion.button>

          {/* Cancel */}
          {hasChanges && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-semibold hover:bg-white/10 transition-all"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          title={status === "active" ? "Suspend User?" : "Reactivate User?"}
          message={
            status === "active"
              ? `${user.name} will lose access to BizPay immediately. This action requires Approver authorization.`
              : `${user.name} will regain access to BizPay. This action requires Approver authorization.`
          }
          confirmLabel={status === "active" ? "Suspend" : "Reactivate"}
          destructive={status === "active"}
          onConfirm={handleSuspend}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

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
      `}</style>
    </div>
  );
}

/* -------- Sub-Components -------- */

function RoleOption({
  role,
  selected,
  onSelect,
}: {
  role: (typeof ROLES)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        w-full p-4 rounded-[20px] border text-left transition-all
        ${
          selected
            ? "border-cyan-500/40 bg-cyan-500/10"
            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{role.icon}</span>
          <h4 className="text-sm text-white/90 font-medium">{role.name}</h4>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected ? "border-cyan-400" : "border-white/20"
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
        </div>
      </div>
      <p className="text-[10px] text-white/40">{role.description}</p>
    </button>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  destructive,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 450, damping: 35 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-[28px] bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 max-w-sm w-full"
      >
        <h3 className="font-serif text-white mb-3">{title}</h3>
        <p className="text-xs text-white/60 mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-semibold hover:bg-white/10 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-2xl font-semibold transition-all text-sm ${
              destructive
                ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}