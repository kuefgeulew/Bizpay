import { ArrowLeft, ChevronRight, Droplets, Waves, Wind } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import FeatureOverviewScreen from "../../../../components/FeatureOverviewScreen";
import DhakaWasaPayment from "./DhakaWasaPayment";

interface UtilityWasaMenuProps {
  onBack: () => void;
}

export default function UtilityWasaMenu({ onBack }: UtilityWasaMenuProps) {
  const [view, setView] = useState("menu");

  if (view === "Dhaka WASA") return <DhakaWasaPayment onBack={() => setView("menu")} />;
  if (view !== "menu") {
    return (
      <FeatureOverviewScreen
        title={view}
        subtitle="Water & Sewerage"
        purpose="This module enables water and sewerage bill payments for the selected WASA authority, supporting postpaid collection methods."
        features={[
          "Bill number validation",
          "Postpaid payment processing",
          "Payment receipt generation",
          "Transaction history tracking",
        ]}
        icon={Droplets}
        onBack={() => setView("menu")}
      />
    );
  }

  const items = [
    { name: "Dhaka WASA", sub: "Central Water & Sewerage", icon: <Droplets size={20} /> },
    { name: "Rajshahi WASA", sub: "Northern Region Supply", icon: <Waves size={20} /> },
    { name: "Khulna WASA", sub: "Southern Region Supply", icon: <Wind size={20} /> },
  ];

  // Locked-in Stiff Spring Physics
  const springConfig = { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <div className="relative h-full text-slate-50 px-6 pt-8 overflow-y-auto pb-24 font-sans selection:bg-cyan-500/30">
      
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={springConfig}
        className="flex items-center gap-6 mb-12"
      >
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.12)" }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-colors"
        >
          <ArrowLeft size={22} className="text-white" />
        </motion.button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-white">Utility - WASA</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-2">Water & Sewerage Authorities</p>
        </div>
      </motion.header>

      {/* Menu Items */}
      <div className="max-w-xl mx-auto space-y-5">
        {items.map((item) => (
          <motion.button
            key={item.name}
            whileHover={{ scale: 1.02, y: -3, backgroundColor: "rgba(255,255,255,0.06)" }}
            whileTap={{ scale: 0.97 }}
            transition={springConfig}
            onClick={() => setView(item.name)}
            className="group w-full text-left flex items-center justify-between px-7 py-6
            bg-white/[0.03] backdrop-blur-[45px] border border-white/10
            rounded-[28px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)]"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-cyan-500/10 transition-all border border-white/5 group-hover:border-cyan-500/20">
                <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                  {item.icon}
                </span>
              </div>
              <div>
                <span className="text-xl font-light tracking-wide text-slate-100 group-hover:text-white transition-colors block">
                  {item.name}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-cyan-400/80 transition-colors">
                  {item.sub}
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