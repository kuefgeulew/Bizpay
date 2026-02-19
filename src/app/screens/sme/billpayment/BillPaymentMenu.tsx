import { useState } from "react";
import { ArrowLeft, ChevronRight, Zap, Droplets, Flame, Landmark } from "lucide-react";
import { motion } from "motion/react";
import FeatureOverviewScreen from "../../../components/FeatureOverviewScreen";
import { Banknote } from "lucide-react";
import UtilityElectricityMenu from "./electricity/UtilityElectricityMenu";
import UtilityWasaMenu from "./wasa/UtilityWasaMenu";
import UtilityGasMenu from "./gas/UtilityGasMenu";
import OtherGovtMenu from "./govt/OtherGovtMenu";

interface BillPaymentMenuProps {
  onBack: () => void;
}

export default function BillPaymentMenu({ onBack }: BillPaymentMenuProps) {
  const [view, setView] = useState("menu");

  // Locked-in Stiff Spring Physics
  const springConfig = { type: "spring" as const, stiffness: 300, damping: 30 };

  // Route handling
  if (view === "electricity") return <UtilityElectricityMenu onBack={() => setView("menu")} />;
  if (view === "wasa") return <UtilityWasaMenu onBack={() => setView("menu")} />;
  if (view === "gas") return <UtilityGasMenu onBack={() => setView("menu")} />;
  if (view === "govt") return <OtherGovtMenu onBack={() => setView("menu")} />;

  if (view !== "menu") {
    return (
      <FeatureOverviewScreen
        title={view}
        subtitle="Payment Processing"
        purpose="This module enables utility and government bill payments, supporting multiple providers with configurable payment schedules and batch processing."
        features={[
          "Multi-provider payment processing",
          "Scheduled and recurring payments",
          "Payment history and receipt generation",
          "Account-level billing configuration",
        ]}
        icon={Banknote}
        onBack={() => setView("menu")}
      />
    );
  }

  /* ---------- MAIN MENU DATA ---------- */
  const items = [
    { label: "Utility-Electricity", sub: "Power & Grid", key: "electricity", icon: <Zap size={20} className="text-cyan-400" /> },
    { label: "Utility-Wasa", sub: "Water & Sewerage", key: "wasa", icon: <Droplets size={20} className="text-cyan-400" /> },
    { label: "Utility-Gas", sub: "Natural Resources", key: "gas", icon: <Flame size={20} className="text-orange-400" /> },
    { label: "Other Govt. Services", sub: "Public Fees & Levies", key: "govt", icon: <Landmark size={20} className="text-emerald-400" /> },
  ];

  return (
    <div className="relative h-full text-slate-50 px-6 pt-8 overflow-y-auto pb-24 font-sans">
      
      {/* 1. LAYER: Film Grain Texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={springConfig}
        className="flex items-center gap-4 mb-10"
      >
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-white">Bill Payment</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">Payment Portal</p>
        </div>
      </motion.header>

      {/* 3. MENU ITEMS */}
      <div className="max-w-xl mx-auto space-y-4">
        {items.map((it) => (
          <motion.button
            key={it.key}
            whileHover={{ scale: 1.02, y: -3, backgroundColor: "rgba(255,255,255,0.06)" }}
            whileTap={{ scale: 0.97 }}
            transition={springConfig}
            onClick={() => setView(it.key)}
            className="group w-full text-left flex items-center justify-between px-6 py-5
            bg-white/[0.03] backdrop-blur-xl border border-white/10
            rounded-[28px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]
            hover:bg-white/[0.06] hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-all border border-white/5 group-hover:border-white/20">
                {it.icon}
              </div>
              <div>
                <span className="text-xl font-light tracking-wide text-slate-100 group-hover:text-white transition-colors block">
                  {it.label}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-cyan-400/80 transition-colors">
                  {it.sub}
                </span>
              </div>
            </div>
            
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/5 group-hover:bg-cyan-500/20 group-hover:translate-x-1 transition-all">
              <ChevronRight size={20} className="text-slate-500 group-hover:text-white" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}