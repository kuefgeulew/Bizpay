import { useState } from "react";
import { ArrowLeft, ChevronRight, FileText, ClipboardList, CheckCircle2, RefreshCcw, LayoutGrid, Clock, Settings } from "lucide-react";
import FeatureOverviewScreen from "../../../../components/FeatureOverviewScreen";
import DDFileSummary from "./DDFileSummary";

interface DirectDebitReportsMenuProps {
  onBack: () => void;
}

export default function DirectDebitReportsMenu({ onBack }: DirectDebitReportsMenuProps) {
  const [view, setView] = useState("menu");

  if (view === "file") return <DDFileSummary onBack={() => setView("menu")} />;
  if (view !== "menu") {
    return (
      <FeatureOverviewScreen
        title={view}
        subtitle="Direct Debit Reports"
        purpose="This module provides reporting on direct debit transactions, approvals, and standing instruction activity."
        features={[
          "File summary and instruction reports",
          "Approved transaction audit trails",
          "SI transaction analytics",
          "Pending transaction tracking",
        ]}
        icon={Settings}
        onBack={() => setView("menu")}
      />
    );
  }

  const items = [
    { label: "DD File Summary", icon: <FileText size={18} />, action: () => setView("file") },
    { label: "DD Instruction Report", icon: <ClipboardList size={18} />, action: () => setView("instruction") },
    { label: "DD Approved Report", icon: <CheckCircle2 size={18} />, action: () => setView("approved") },
    { label: "DD SI Transaction Report", icon: <RefreshCcw size={18} />, action: () => setView("si") },
    { label: "DD Universal Transaction Report", icon: <LayoutGrid size={18} />, action: () => setView("universal") },
    { label: "DD Pending Transaction (Maker)", icon: <Clock size={18} />, action: () => setView("pending") },
  ];

  return (
    <div className="relative h-full text-slate-50 px-6 pt-8 bg-transparent overflow-y-auto">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-10 relative z-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-white">
            Direct Debit Reports
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Reports & Analytics
          </p>
        </div>
      </header>

      {/* Menu Items */}
      <div className="pb-10 space-y-3 relative z-10">
        {items.map((it) => (
          <button
            key={it.label}
            onClick={it.action}
            className="
              group relative w-full text-left flex items-center justify-between 
              px-5 py-3.5 bg-white/[0.04] backdrop-blur-[30px] border border-white/10 rounded-[28px]
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]
              transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
              hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1
              active:scale-[0.98] active:translate-y-0 overflow-hidden
            "
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/[0.05] rounded-xl border border-white/5 text-white/60 group-hover:scale-105 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all duration-500">
                {it.icon}
              </div>
              <span className="text-base tracking-tight text-slate-200 group-hover:text-white transition-colors">
                {it.label}
              </span>
            </div>

            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center opacity-30 group-hover:opacity-100 group-hover:text-cyan-400 transition-all">
              <ChevronRight size={16} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}