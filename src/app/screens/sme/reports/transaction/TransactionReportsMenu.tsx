import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, FileText, Receipt, Download, Clock } from "lucide-react";
import FeatureOverviewScreen from "../../../../components/FeatureOverviewScreen";
import { Settings } from "lucide-react";
import TRPaymentReport from "./TRPaymentReport";

interface TransactionReportsMenuProps {
  onBack: () => void;
}

export default function TransactionReportsMenu({ onBack }: TransactionReportsMenuProps) {
  const [view, setView] = useState("menu");

  if (view === "payment") return <TRPaymentReport onBack={() => setView("menu")} />;
  if (view !== "menu") {
    return (
      <FeatureOverviewScreen
        title={view}
        subtitle="Transaction Reports"
        purpose="This module provides reporting on fund transfer transactions, including file summaries, payment slips, and pending transaction lists."
        features={[
          "Transaction file summary reports",
          "Payment slip generation and download",
          "Pending transaction tracking",
          "Period-based analytics",
        ]}
        icon={Settings}
        onBack={() => setView("menu")}
      />
    );
  }

  const items = [
    { label: "File Summary", icon: <FileText size={20} />, action: () => setView("file") },
    { label: "Payment Report", icon: <Receipt size={20} />, action: () => setView("payment") },
    { label: "Download Payment Slip", icon: <Download size={20} />, action: () => setView("slip") },
    { label: "Pending Transaction List", icon: <Clock size={20} />, action: () => setView("pending") },
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

      <div className="relative z-10 h-full flex flex-col px-6 pt-8">
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
              Transaction Reports
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              Reports & Analytics
            </p>
          </div>
        </header>

        {/* Menu Items */}
        <div className="space-y-4">
          {items.map((it, idx) => (
            <motion.button
              key={it.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 35,
                delay: idx * 0.05,
              }}
              onClick={it.action}
              className="
                group w-full flex justify-between items-center px-6 py-6 
                bg-white/5 backdrop-blur-[24px] rounded-[28px] 
                border border-white/10 relative overflow-hidden
                shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                active:scale-[0.98] transition-all duration-200
              "
            >
              <div className="absolute inset-0 border border-white/5 rounded-[28px] pointer-events-none" />
              
              <div className="flex items-center gap-5">
                <div className="p-3 rounded-xl bg-white/10 text-white/60 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all duration-500">
                  {it.icon}
                </div>
                <span className="text-lg text-white/90 tracking-tight">
                  {it.label}
                </span>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:text-white transition-colors">
                <ChevronRight size={18} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}