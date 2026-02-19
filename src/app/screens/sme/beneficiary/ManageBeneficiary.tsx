import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, User, Hash, Building2, Edit3, Trash2, Power, PowerOff, ShieldAlert } from "lucide-react";
import GovernanceBar from "../../../components/GovernanceBar";
import { BENEFICIARIES, getStatusColor, getStatusLabel, getRiskColor } from "../../../mock/beneficiaryGovernance";
import { enforceBeneficiaryGate, createBeneficiaryMutationApproval, type EnforcementResult, type BeneficiaryAction } from "../../../utils/governanceEngine";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 35 };

interface ManageBeneficiaryProps {
  onBack: () => void;
}

export default function ManageBeneficiary({ onBack }: ManageBeneficiaryProps) {
  // Per-row governance enforcement state
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  // GOVERNANCE_ENFORCEMENT — Execute beneficiary action through gate
  function handleRowAction(beneficiary: typeof BENEFICIARIES[0], action: BeneficiaryAction) {
    const benType: "BRAC" | "OTHER_BANK" = beneficiary.bankName === "BRAC Bank" ? "BRAC" : "OTHER_BANK";
    const result = enforceBeneficiaryGate({
      action,
      beneficiaryType: benType,
      beneficiaryName: beneficiary.name,
      beneficiaryId: beneficiary.id,
    });
    setActiveRowId(beneficiary.id);
    setEnforcementResult(result);

    // GOVERNANCE_ENFORCEMENT — Route to Approval Queue on APPROVAL_REQUIRED
    if (result.outcome === "APPROVAL_REQUIRED") {
      createBeneficiaryMutationApproval({
        beneficiaryId: beneficiary.id,
        mutationType: action,
        beneficiaryName: beneficiary.name,
        beneficiaryType: benType,
        coolingPeriodHours: action === "EDIT" ? 24 : undefined,
      });
      return;
    }

    // Execute mutation on ALLOWED (no state change before approval)
    if (result.outcome === "ALLOWED") {
      switch (action) {
        case "DELETE":
          beneficiary.status = "disabled";
          break;
        case "ACTIVATE":
          beneficiary.status = "active";
          break;
        case "DEACTIVATE":
          beneficiary.status = "disabled";
          break;
      }
    }
  }

  function dismissEnforcement() {
    setActiveRowId(null);
    setEnforcementResult(null);
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
          <h1 className="text-3xl font-serif tracking-tight">List of Beneficiaries</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Registered Accounts
          </p>
        </div>
      </header>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={STIFF_SPRING}
        className="grid grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto"
      >
        <SummaryCard label="Total" value={BENEFICIARIES.length} color="text-white/80" />
        <SummaryCard label="Active" value={BENEFICIARIES.filter(b => b.status === "active").length} color="text-emerald-400" />
        <SummaryCard label="Pending" value={BENEFICIARIES.filter(b => b.status === "pending_approval").length} color="text-orange-400" />
        <SummaryCard label="Disabled" value={BENEFICIARIES.filter(b => b.status === "disabled").length} color="text-red-400" />
      </motion.div>

      {/* Beneficiary List */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {BENEFICIARIES.map((bn, idx) => {
          const isActiveRow = activeRowId === bn.id;
          const isDisabled = bn.status === "disabled";

          return (
            <motion.div
              key={bn.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...STIFF_SPRING, delay: idx * 0.06 }}
              className="
                relative p-5 rounded-[24px] bg-white/5 backdrop-blur-[20px] 
                border border-white/10 overflow-hidden
                shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
              "
            >
              {/* Internal Rim Light catch */}
              <div className="absolute inset-0 pointer-events-none rounded-[24px] border border-white/5" />

              {/* Main Header */}
              <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/80">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-white">{bn.name}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{bn.bankName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Risk Badge */}
                  <div
                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border bg-gradient-to-br ${getRiskColor(bn.riskLevel)}`}
                  >
                    {bn.riskLevel}
                  </div>
                  {/* Status Badge */}
                  <div
                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border bg-gradient-to-br ${getStatusColor(bn.status)}`}
                  >
                    {getStatusLabel(bn.status)}
                  </div>
                </div>
              </div>

              {/* Data Detail Grid */}
              <div className="grid grid-cols-3 gap-y-4 mb-4">
                <DetailRow label="Account Number" value={bn.accountNumber} icon={<Hash size={12} />} />
                <DetailRow label="Bank Code" value={bn.bankCode} icon={<Building2 size={12} />} />
                <DetailRow label="Account Type" value={bn.accountType.toUpperCase()} icon={<Building2 size={12} />} />
              </div>

              {/* GOVERNANCE_ENFORCEMENT — Per-Row Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-white/5">
                <RowActionButton
                  icon={<Edit3 size={14} />}
                  label="Edit"
                  onClick={() => handleRowAction(bn, "EDIT")}
                />
                <RowActionButton
                  icon={<Trash2 size={14} />}
                  label="Delete"
                  onClick={() => handleRowAction(bn, "DELETE")}
                />
                {isDisabled ? (
                  <RowActionButton
                    icon={<Power size={14} />}
                    label="Reactivate"
                    onClick={() => handleRowAction(bn, "ACTIVATE")}
                  />
                ) : (
                  <RowActionButton
                    icon={<PowerOff size={14} />}
                    label="Deactivate"
                    onClick={() => handleRowAction(bn, "DEACTIVATE")}
                  />
                )}
              </div>

              {/* Per-Row Governance Bar */}
              {isActiveRow && enforcementResult && (
                <div className="mt-3">
                  <GovernanceBar result={enforcementResult} onDismiss={dismissEnforcement} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Summary Card
interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
}

function SummaryCard({ label, value, color }: SummaryCardProps) {
  return (
    <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="text-[9px] uppercase tracking-widest text-white/50 font-bold mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

// Row Action Button
interface RowActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function RowActionButton({ icon, label, onClick }: RowActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.96] text-[10px] font-bold text-white/70 hover:text-white/90"
    >
      {icon}
      {label}
    </button>
  );
}

// Detail Row
interface DetailRowProps {
  label: string;
  value: string;
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