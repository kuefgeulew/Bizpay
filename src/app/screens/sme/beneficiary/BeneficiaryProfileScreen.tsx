import { useState } from "react";
import { ArrowLeft, User, Building2, Hash, Clock, ShieldAlert, AlertTriangle, CheckCircle, Activity, Edit3, Trash2, Power, PowerOff, Save, X } from "lucide-react";
import { motion } from "motion/react";
import SystemDisclaimer from "../../../components/SystemDisclaimer";
import RoleBadge from "../../../components/RoleBadge";
import GovernanceBar from "../../../components/GovernanceBar";
import {
  BENEFICIARIES,
  getApprovalHistory,
  getCoolingTimeRemaining,
  getRiskColor,
  getStatusColor,
  getStatusLabel,
} from "../../../mock/beneficiaryGovernance";
import { enforceBeneficiaryGate, createBeneficiaryMutationApproval, type EnforcementResult, type BeneficiaryAction } from "../../../utils/governanceEngine";

interface BeneficiaryProfileScreenProps {
  beneficiaryId: string;
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function BeneficiaryProfileScreen({ beneficiaryId, onBack }: BeneficiaryProfileScreenProps) {
  const beneficiary = BENEFICIARIES.find(b => b.id === beneficiaryId);
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);
  const [lastAction, setLastAction] = useState<BeneficiaryAction | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(beneficiary?.name || "");
  const [editAccount, setEditAccount] = useState(beneficiary?.accountNumber || "");

  if (!beneficiary) {
    return (
      <div className="h-full flex items-center justify-center text-white/50">
        <p>Beneficiary not found</p>
      </div>
    );
  }

  const approvalHistory = getApprovalHistory(beneficiaryId);
  const coolingTimeRemaining = getCoolingTimeRemaining(beneficiary);

  // Determine beneficiary type from bank
  function getBeneficiaryType(): "BRAC" | "OTHER_BANK" | "POSITIVE_PAY" {
    if (beneficiary!.bankName === "BRAC Bank") return "BRAC";
    return "OTHER_BANK";
  }

  // GOVERNANCE_ENFORCEMENT — Execute beneficiary action through gate
  function handleAction(action: BeneficiaryAction) {
    const result = enforceBeneficiaryGate({
      action,
      beneficiaryType: getBeneficiaryType(),
      beneficiaryName: beneficiary!.name,
      beneficiaryId: beneficiary!.id,
    });
    setEnforcementResult(result);
    setLastAction(action);

    // GOVERNANCE_ENFORCEMENT — Route to Approval Queue on APPROVAL_REQUIRED
    if (result.outcome === "APPROVAL_REQUIRED") {
      createBeneficiaryMutationApproval({
        beneficiaryId: beneficiary!.id,
        mutationType: action,
        beneficiaryName: beneficiary!.name,
        beneficiaryType: getBeneficiaryType(),
      });
      return;
    }

    // Execute mutation on ALLOWED (no state change before approval)
    if (result.outcome === "ALLOWED") {
      switch (action) {
        case "DELETE":
          beneficiary!.status = "disabled";
          break;
        case "ACTIVATE":
          beneficiary!.status = "active";
          break;
        case "DEACTIVATE":
          beneficiary!.status = "disabled";
          break;
      }
    }
  }

  // GOVERNANCE_ENFORCEMENT — Save edited details through EDIT gate
  function handleSaveEdit() {
    const result = enforceBeneficiaryGate({
      action: "EDIT",
      beneficiaryType: getBeneficiaryType(),
      beneficiaryName: editName || beneficiary!.name,
      beneficiaryId: beneficiary!.id,
    });
    setEnforcementResult(result);
    setLastAction("EDIT");

    // GOVERNANCE_ENFORCEMENT — Route edit to Approval Queue on APPROVAL_REQUIRED
    if (result.outcome === "APPROVAL_REQUIRED") {
      createBeneficiaryMutationApproval({
        beneficiaryId: beneficiary!.id,
        mutationType: "EDIT",
        beneficiaryName: beneficiary!.name,
        beneficiaryType: getBeneficiaryType(),
        proposedChanges: {
          name: { from: beneficiary!.name, to: editName },
          accountNumber: { from: beneficiary!.accountNumber, to: editAccount },
        },
        coolingPeriodHours: 24,
      });
      setEditMode(false);
      return;
    }

    if (result.outcome === "ALLOWED") {
      beneficiary!.name = editName;
      beneficiary!.accountNumber = editAccount;
      setEditMode(false);
    }
  }

  function handleCancelEdit() {
    setEditName(beneficiary.name);
    setEditAccount(beneficiary.accountNumber);
    setEditMode(false);
    setEnforcementResult(null);
    setLastAction(null);
  }

  function handleStartEdit() {
    setEditName(beneficiary.name);
    setEditAccount(beneficiary.accountNumber);
    setEditMode(true);
    setEnforcementResult(null);
    setLastAction(null);
  }

  const isDisabled = beneficiary.status === "disabled";
  const isActive = beneficiary.status === "active";
  const isCooling = beneficiary.status === "cooling_period";

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
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-serif tracking-tight">Beneficiary Profile</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Lifecycle & Approval Status
          </p>
        </div>
      </header>

      {/* System Disclaimer */}
      <SystemDisclaimer
        message="Beneficiary profile and lifecycle status configuration interface."
        className="mb-6"
      />

      {/* Beneficiary Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-6 rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <User size={24} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{beneficiary.name}</h2>
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold mt-0.5">
                {beneficiary.bankName}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border bg-gradient-to-br ${getStatusColor(
              beneficiary.status
            )}`}
          >
            {getStatusLabel(beneficiary.status)}
          </div>
        </div>

        {/* Account Details Grid */}
        {!editMode ? (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <DetailRow label="Account Number" value={beneficiary.accountNumber} icon={<Hash size={12} />} />
            <DetailRow label="Account Type" value={beneficiary.accountType.toUpperCase()} icon={<Building2 size={12} />} />
            <DetailRow label="Bank Code" value={beneficiary.bankCode} icon={<Building2 size={12} />} />
            <DetailRow
              label="Risk Level"
              value={
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase border bg-gradient-to-br ${getRiskColor(
                    beneficiary.riskLevel
                  )}`}
                >
                  {beneficiary.riskLevel}
                </span>
              }
              icon={<ShieldAlert size={12} />}
            />
          </div>
        ) : (
          /* Inline Edit Mode */
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Beneficiary Name</label>
              <input
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/50 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] transition-all"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Account Number</label>
              <input
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/50 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] transition-all"
                value={editAccount}
                onChange={(e) => setEditAccount(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={!!enforcementResult}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] ${
                  !!enforcementResult
                    ? "bg-white/10 text-white/30 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
                }`}
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-5 py-3 rounded-2xl bg-white/10 text-white/70 hover:bg-white/15 font-semibold text-sm transition-all active:scale-[0.98]"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* GOVERNANCE_ENFORCEMENT — Action Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-6"
      >
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Lifecycle Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Edit */}
          {!editMode && (
            <ActionButton
              icon={<Edit3 size={16} />}
              label="Edit Details"
              color="from-purple-500/20 to-fuchsia-500/20 border-purple-500/30"
              iconColor="text-purple-400"
              onClick={handleStartEdit}
              disabled={false}
            />
          )}

          {/* Delete */}
          <ActionButton
            icon={<Trash2 size={16} />}
            label="Delete"
            color="from-red-500/20 to-rose-500/20 border-red-500/30"
            iconColor="text-red-400"
            onClick={() => handleAction("DELETE")}
            disabled={isDisabled && lastAction === "DELETE" && enforcementResult?.outcome === "ALLOWED"}
          />

          {/* Activate / Deactivate */}
          {isDisabled ? (
            <ActionButton
              icon={<Power size={16} />}
              label="Reactivate"
              color="from-emerald-500/20 to-green-500/20 border-emerald-500/30"
              iconColor="text-emerald-400"
              onClick={() => handleAction("ACTIVATE")}
              disabled={false}
            />
          ) : (
            <ActionButton
              icon={<PowerOff size={16} />}
              label="Deactivate"
              color="from-orange-500/20 to-amber-500/20 border-orange-500/30"
              iconColor="text-orange-400"
              onClick={() => handleAction("DEACTIVATE")}
              disabled={false}
            />
          )}
        </div>

        {/* Governance Enforcement Bar */}
        {enforcementResult && (
          <div className="mt-4">
            <GovernanceBar result={enforcementResult} onDismiss={() => { setEnforcementResult(null); setLastAction(null); }} />
          </div>
        )}
      </motion.div>

      {/* Cooling Period Banner (if applicable) */}
      {beneficiary.status === "cooling_period" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-cyan-400" />
            <div className="flex-1">
              <div className="text-sm font-bold text-white">Cooling Period Active</div>
              <div className="text-[11px] text-white/70 mt-0.5">
                Transfers blocked for {coolingTimeRemaining}
              </div>
            </div>
            <div className="px-2 py-1 rounded-md bg-white/10 text-[9px] font-black uppercase text-cyan-400">
              {coolingTimeRemaining}
            </div>
          </div>
        </motion.div>
      )}

      {/* Risk Flags (if any) */}
      {beneficiary.riskFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Risk Flags</h3>
          <div className="space-y-2">
            {beneficiary.riskFlags.map((flag, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.3 + idx * 0.05 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-orange-500/30"
              >
                <AlertTriangle size={16} className="text-orange-400" />
                <span className="text-[11px] font-medium text-white/90">{flag}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Lifecycle Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.3 }}
        className="mb-6"
      >
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Lifecycle Metadata</h3>
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-3">
          <MetadataRow label="Added By" value={beneficiary.addedBy} role={beneficiary.addedByRole} />
          <MetadataRow label="Added Date" value={beneficiary.addedDate} />
          {beneficiary.approvedBy && (
            <>
              <MetadataRow label="Approved By" value={beneficiary.approvedBy} role={beneficiary.approvedByRole} />
              <MetadataRow label="Approved Date" value={beneficiary.approvedDate || "N/A"} />
            </>
          )}
          <MetadataRow label="Last Used" value={beneficiary.lastUsedDate || "Never"} />
          <MetadataRow label="Cooling Period" value={`${beneficiary.coolingPeriodHours} hours`} />
        </div>
      </motion.div>

      {/* Activity Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.4 }}
        className="mb-6"
      >
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Transaction Activity</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Transactions" value={beneficiary.transactionCount.toString()} />
          <StatCard label="Total Sent" value={`BDT ${(beneficiary.totalTransferred / 100000).toFixed(1)}L`} />
          <StatCard label="First Txn" value={beneficiary.firstTransactionDate?.split(" ")[0] || "N/A"} />
        </div>
      </motion.div>

      {/* Approval History Timeline */}
      {approvalHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.5 }}
          className="mb-6"
        >
          <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Approval History</h3>
          <div className="space-y-3">
            {approvalHistory.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.6 + idx * 0.05 }}
                className="relative pl-6 pb-4 border-l-2 border-white/10 last:border-transparent last:pb-0"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-[-5px] top-0 w-2 h-2 rounded-full ${
                    event.status === "approved"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      : event.status === "pending"
                      ? "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]"
                      : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"
                  }`}
                />

                {/* Event Card */}
                <div className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-cyan-400" />
                      <span className="text-[11px] font-bold text-white">{event.action}</span>
                    </div>
                    <span className="text-[9px] text-white/50">{event.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-white/70">{event.actor}</span>
                    <RoleBadge role={event.role} size="xs" />
                  </div>
                  {event.notes && (
                    <div className="mt-2 p-2 rounded-md bg-white/5 text-[10px] text-white/60 italic">{event.notes}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Action Button Component
interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  iconColor: string;
  onClick: () => void;
  disabled: boolean;
}

function ActionButton({ icon, label, color, iconColor, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-2xl bg-gradient-to-br ${color} border backdrop-blur-xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
        disabled ? "opacity-30 cursor-not-allowed" : ""
      }`}
    >
      <span className={iconColor}>{icon}</span>
      <span className="text-[10px] font-bold text-white/90">{label}</span>
    </button>
  );
}

// Detail Row Component
interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}

function DetailRow({ label, value, icon }: DetailRowProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1 text-white/30">
        <span className="opacity-50">{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-[13px] font-medium text-white tracking-tight">{value}</div>
    </div>
  );
}

// Metadata Row Component
interface MetadataRowProps {
  label: string;
  value: string;
  role?: string;
}

function MetadataRow({ label, value, role }: MetadataRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-white/90 font-medium">{value}</span>
        {role && <RoleBadge role={role as any} size="xs" />}
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}