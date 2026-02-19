import { useState } from "react";
import { ArrowLeft, UserPlus, Edit3, UserX, ShieldCheck, Users, Clock, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import SystemDisclaimer from "../../../components/SystemDisclaimer";
import BeneficiaryProfileScreen from "./BeneficiaryProfileScreen";
import BeneficiaryApprovalRulesScreen from "./BeneficiaryApprovalRulesScreen";
import { BENEFICIARIES } from "../../../mock/beneficiaryGovernance";

interface BeneficiaryGovernanceHubProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function BeneficiaryGovernanceHub({ onBack }: BeneficiaryGovernanceHubProps) {
  const [view, setView] = useState<"menu" | "profile" | "rules">("menu");
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);

  // Route to sub-screens
  if (view === "profile" && selectedBeneficiaryId) {
    return (
      <BeneficiaryProfileScreen
        beneficiaryId={selectedBeneficiaryId}
        onBack={() => {
          setView("menu");
          setSelectedBeneficiaryId(null);
        }}
      />
    );
  }

  if (view === "rules") {
    return <BeneficiaryApprovalRulesScreen onBack={() => setView("menu")} />;
  }

  // Main hub menu
  const stats = {
    total: BENEFICIARIES.length,
    active: BENEFICIARIES.filter(b => b.status === "active").length,
    pending: BENEFICIARIES.filter(b => b.status === "pending_approval").length,
    cooling: BENEFICIARIES.filter(b => b.status === "cooling_period").length,
  };

  const menuItems = [
    {
      id: "add",
      icon: UserPlus,
      title: "Add Beneficiary",
      description: "Create new payment recipient",
      color: "from-cyan-500 to-teal-500",
      badge: "Requires Approval",
      action: () => {
        // Navigate to a reference beneficiary profile
        setSelectedBeneficiaryId("BEN-003");
        setView("profile");
      },
    },
    {
      id: "modify",
      icon: Edit3,
      title: "Modify Beneficiary",
      description: "Update account details or status",
      color: "from-purple-500 to-fuchsia-500",
      badge: "Re-approval Required",
      action: () => {
        setSelectedBeneficiaryId("BEN-004");
        setView("profile");
      },
    },
    {
      id: "disable",
      icon: UserX,
      title: "Disable / Delete",
      description: "Suspend or remove beneficiary",
      color: "from-red-500 to-rose-500",
      badge: "High Risk",
      action: () => {
        setSelectedBeneficiaryId("BEN-005");
        setView("profile");
      },
    },
    {
      id: "rules",
      icon: ShieldCheck,
      title: "Approval Rules",
      description: "View governance & cooling periods",
      color: "from-cyan-500 to-teal-500",
      badge: "5 Rules Active",
      action: () => setView("rules"),
    },
  ];

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
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Beneficiary Governance</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Lifecycle Management & Risk Controls
          </p>
        </div>
      </header>

      {/* System Disclaimer */}
      <SystemDisclaimer
        message="Beneficiary approval workflows and governance rules configuration interface."
        className="mb-6"
      />

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="grid grid-cols-4 gap-3 mb-8"
      >
        <StatCard icon={Users} label="Total" value={stats.total} color="text-white/80" />
        <StatCard icon={ShieldCheck} label="Active" value={stats.active} color="text-emerald-400" />
        <StatCard icon={Clock} label="Cooling" value={stats.cooling} color="text-cyan-400" />
        <StatCard icon={AlertTriangle} label="Pending" value={stats.pending} color="text-orange-400" />
      </motion.div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto">
        {menuItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: idx * 0.05 }}
          >
            <MenuCard
              icon={item.icon}
              title={item.title}
              description={item.description}
              color={item.color}
              badge={item.badge}
              onClick={item.action}
            />
          </motion.div>
        ))}
      </div>

      {/* Quick Access: Recent Beneficiaries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.3 }}
        className="mt-10 max-w-xl mx-auto"
      >
        <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Recent Beneficiaries</h2>
        <div className="space-y-2">
          {BENEFICIARIES.slice(0, 3).map((ben, idx) => (
            <motion.button
              key={ben.id}
              onClick={() => {
                setSelectedBeneficiaryId(ben.id);
                setView("profile");
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.4 + idx * 0.05 }}
              className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98] text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{ben.name}</div>
                  <div className="text-[10px] text-white/50 mt-0.5">
                    {ben.bankName} • {ben.accountNumber.slice(-4)}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border bg-gradient-to-br ${getStatusColorClass(
                    ben.status
                  )}`}
                >
                  {getStatusLabel(ben.status)}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

// Menu Card Component
interface MenuCardProps {
  icon: React.ComponentType<{ size: number }>;
  title: string;
  description: string;
  color: string;
  badge: string;
  onClick: () => void;
}

function MenuCard({ icon: Icon, title, description, color, badge, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98] overflow-hidden text-left"
    >
      {/* Icon + Content */}
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-20 backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-transform`}
        >
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold text-white tracking-tight">{title}</div>
          <div className="text-[11px] text-white/60 mt-0.5">{description}</div>
          <div className="mt-2 inline-block px-2 py-1 rounded-md bg-white/10 text-[9px] font-black uppercase tracking-tighter text-cyan-400 border border-white/5">
            {badge}
          </div>
        </div>
        <div className="text-white/30 group-hover:text-white/60 transition-colors">
          <ArrowLeft size={18} className="rotate-180" />
        </div>
      </div>

      {/* Shimmer on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-[-25deg]" />
      </div>
    </button>
  );
}

// Helper functions
function getStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "pending_approval":
      return "Pending";
    case "cooling_period":
      return "Cooling";
    case "disabled":
      return "Disabled";
    default:
      return status;
  }
}

function getStatusColorClass(status: string): string {
  switch (status) {
    case "active":
      return "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400";
    case "pending_approval":
      return "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400";
    case "cooling_period":
      return "from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400";
    case "disabled":
      return "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400";
    default:
      return "from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-400";
  }
}