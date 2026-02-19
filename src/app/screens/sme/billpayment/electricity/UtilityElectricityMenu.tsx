import { useState } from "react";
import { ArrowLeft, ChevronRight, Zap, Flashlight, Activity, Power } from "lucide-react";
import { motion } from "motion/react";
import FeatureOverviewScreen from "../../../../components/FeatureOverviewScreen";
import DPDCPayment from "./DPDCPayment";

interface UtilityElectricityMenuProps {
  onBack: () => void;
}

export default function UtilityElectricityMenu({ onBack }: UtilityElectricityMenuProps) {
  const [view, setView] = useState("menu");

  // Premium Stiff Spring Physics Configuration
  const springConfig = { type: "spring" as const, stiffness: 300, damping: 30 };

  if (view === "DPDC") return <DPDCPayment onBack={() => setView("menu")} />;
  if (view !== "menu") {
    return (
      <FeatureOverviewScreen
        title={view}
        subtitle="Electricity Provider"
        purpose="This module enables electricity bill payments for the selected distribution company, supporting prepaid and postpaid collection methods."
        features={[
          "Prepaid and postpaid payment options",
          "Customer number validation",
          "Bill month and year selection",
          "Payment receipt generation",
        ]}
        icon={Zap}
        onBack={() => setView("menu")}
      />
    );
  }

  const items = [
    { label: "DPDC", sub: "Dhaka Power Distribution Company", icon: <Zap size={18} className="text-cyan-400" /> },
    { label: "DESCO", sub: "Dhaka Electric Supply Company", icon: <Flashlight size={18} className="text-cyan-300" /> },
    { label: "NESCO", sub: "Northern Electricity Supply Company", icon: <Activity size={18} className="text-teal-400" /> },
    { label: "WZPDCL", sub: "West Zone Power Distribution Company", icon: <Power size={18} className="text-emerald-400" /> },
  ];

  return (
    <div className="relative h-full text-slate-50 px-6 pt-8 overflow-y-auto pb-24 font-sans selection:bg-cyan-500/30">
      
      {/* 1. LAYER: Adaptive Noise Floor (Eliminates color banding) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={springConfig}
        className="flex items-center gap-6 mb-12"
      >
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors"
        >
          <ArrowLeft size={22} />
        </motion.button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-white">Utility - Electricity</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-[1px] w-5 bg-cyan-500/60"></span>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold">Select Service Provider</p>
          </div>
        </div>
      </motion.header>

      {/* 3. MENU ITEMS: Frosted Glass with Rim Lighting */}
      <div className="max-w-xl mx-auto space-y-5">
        {items.map((item, idx) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: idx * 0.05 }}
            whileHover={{ scale: 1.015, y: -2, backgroundColor: "rgba(255,255,255,0.06)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView(item.label)}
            className="group w-full text-left flex items-center justify-between px-7 py-6
            bg-white/[0.03] backdrop-blur-[40px] border border-white/10
            rounded-[28px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-cyan-500/10 transition-colors border border-white/5 group-hover:border-cyan-500/20">
                {item.icon}
              </div>
              <div>
                <span className="text-xl font-medium tracking-wide text-slate-100 group-hover:text-white transition-colors block">
                  {item.label}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 group-hover:text-cyan-400/70 transition-colors">
                  {item.sub}
                </span>
              </div>
            </div>
            
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:translate-x-1 transition-all">
              <ChevronRight size={18} className="text-slate-500 group-hover:text-white" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}