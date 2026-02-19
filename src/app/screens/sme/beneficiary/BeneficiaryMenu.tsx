import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Building2, ShieldCheck, Users, Shield } from "lucide-react";
import { motion } from "motion/react";
import AddBracBeneficiary from "./AddBracBeneficiary";
import AddOtherBankBeneficiary from "./AddOtherBankBeneficiary";
import PositivePayBeneficiary from "./PositivePayBeneficiary";
import ManageBeneficiary from "./ManageBeneficiary";
import BeneficiaryGovernanceHub from "./BeneficiaryGovernanceHub";

interface BeneficiaryMenuProps {
  onBack: () => void;
  setBeneficiaryView: (setter: (view: string) => void) => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function BeneficiaryMenu({ onBack, setBeneficiaryView }: BeneficiaryMenuProps) {
  const [view, setView] = useState("menu");

  // CRITICAL: Register setter so searchNavigator can control view
  useEffect(() => {
    setBeneficiaryView(setView);
  }, [setBeneficiaryView]);

  // Route to sub-screens
  switch (view) {
    case "brac":
      return <AddBracBeneficiary onBack={() => setView("menu")} />;

    case "other":
      return <AddOtherBankBeneficiary onBack={() => setView("menu")} />;

    case "pp":
      return <PositivePayBeneficiary onBack={() => setView("menu")} />;

    case "manage":
      return <ManageBeneficiary onBack={() => setView("menu")} />;

    case "governance":
      return <BeneficiaryGovernanceHub onBack={() => setView("menu")} />;

    default:
      // Beneficiary Menu Hub
      return <BeneficiaryMenuHub onBack={onBack} onSelect={setView} />;
  }
}

// Beneficiary Menu Hub
function BeneficiaryMenuHub({ onBack, onSelect }: { onBack: () => void; onSelect: (view: string) => void }) {
  const menuItems = [
    {
      id: "governance",
      icon: <Shield size={24} />,
      title: "Beneficiary Governance",
      description: "Approval workflows & lifecycle management",
      color: "purple"
    },
    {
      id: "manage",
      icon: <Users size={24} />,
      title: "Manage Beneficiaries",
      description: "View, modify, and delete saved beneficiaries",
      color: "cyan"
    },
    {
      id: "brac",
      icon: <UserPlus size={24} />,
      title: "Add BRAC Bank Beneficiary",
      description: "Add internal account recipient",
      color: "blue"
    },
    {
      id: "other",
      icon: <Building2 size={24} />,
      title: "Add Other Bank Beneficiary",
      description: "Add external account recipient",
      color: "purple"
    },
    {
      id: "pp",
      icon: <ShieldCheck size={24} />,
      title: "Positive Pay Beneficiary",
      description: "Cheque safety list management",
      color: "green"
    }
  ];

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      <header className="flex items-center gap-4 mb-12">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Beneficiaries</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Payment Recipients
          </p>
        </div>
      </header>

      <div className="space-y-4 max-w-xl mx-auto">
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
              onClick={() => onSelect(item.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Reusable Menu Card Component
interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function MenuCard({ icon, title, description, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98] overflow-hidden"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-white/10 text-cyan-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-left flex-1">
          <div className="text-lg font-bold text-white tracking-tight">{title}</div>
          <div className="text-[11px] text-white/60 mt-0.5">{description}</div>
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