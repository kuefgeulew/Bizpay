import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, Key, ShieldCheck, Unlock, ShieldAlert, Plus } from "lucide-react";
import FeatureOverviewScreen from "../../../components/FeatureOverviewScreen";
import { Settings } from "lucide-react";
import { enforceServiceRequestGate, createServiceRequestApproval, type EnforcementResult } from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 35 };

interface SoftwareTokenMenuProps {
  onBack: () => void;
}

export default function SoftwareTokenMenu({ onBack }: SoftwareTokenMenuProps) {
  const [view, setView] = useState("menu");
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  // GOVERNANCE_ENFORCEMENT — Service Request Risk Gate
  function handleTokenAction(actionLabel: string) {
    const result = enforceServiceRequestGate({
      serviceType: "SOFTWARE_TOKEN",
      actionLabel,
    });
    setEnforcementResult(result);

    // GOVERNANCE_ENFORCEMENT — Route to Approval Queue on APPROVAL_REQUIRED
    if (result.outcome === "APPROVAL_REQUIRED") {
      createServiceRequestApproval({
        serviceType: "SOFTWARE_TOKEN",
        actionLabel,
        requestParams: { tokenAction: actionLabel },
      });
      return;
    }

    if (result.outcome === "ALLOWED") {
      setView(actionLabel);
    }
    // BLOCKED shows bar, does not navigate
  }

  if (view !== "menu") {
    return (
      <FeatureOverviewScreen
        title={view}
        subtitle="Token Management"
        purpose="This module provides tools for managing software token lifecycle operations including activation, deactivation, and OTP unlock procedures."
        features={[
          "Token activation and re-activation",
          "Digipass OTP unlock procedures",
          "Token deactivation workflows",
          "Security audit trail logging",
        ]}
        icon={Settings}
        onBack={() => setView("menu")}
      />
    );
  }

  const items = [
    { id: "Activate Token", label: "Activate Token", icon: <ShieldCheck size={20} /> },
    { id: "Re-Activate Token", label: "Re-Activate Token", icon: <Key size={20} /> },
    { id: "Digipass OTP Unlock", label: "Digipass OTP Unlock", icon: <Unlock size={20} /> },
    { id: "De-activate Token", label: "De-activate Token", icon: <ShieldAlert size={20} /> },
    { id: "Other", label: "Other", icon: <Plus size={20} /> },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 h-full flex flex-col px-8 pt-10">
        {/* Header */}
        <header className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-white">
              Software Token
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              Security Management
            </p>
          </div>
        </header>

        {/* Governance Enforcement Bar */}
        {enforcementResult && (
          <div className="px-8 mb-4">
            <GovernanceBar result={enforcementResult} onDismiss={() => setEnforcementResult(null)} />
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-12">
          {items.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...STIFF_SPRING, delay: idx * 0.06 }}
              onClick={() => handleTokenAction(item.id)}
              disabled={!!enforcementResult}
              className="
                group w-full flex justify-between items-center px-6 py-6 
                bg-white/5 backdrop-blur-[24px] rounded-[28px] 
                border border-white/10 relative overflow-hidden
                shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                active:scale-[0.98] transition-all duration-200
              "
            >
              <div className="absolute inset-0 pointer-events-none rounded-[28px] border border-white/5" />

              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white group-hover:text-cyan-400 transition-colors">
                  {item.icon}
                </div>
                <span className="text-lg text-white tracking-tight">
                  {item.label}
                </span>
              </div>
              
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                <ChevronRight size={18} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}