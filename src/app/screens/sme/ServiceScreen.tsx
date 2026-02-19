import { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, BookOpen, Key, Clock } from "lucide-react";
import { motion } from "motion/react";
import ServiceRequestMenu from "./servicerequest/ServiceRequestMenu";
import PositivePayMenu from "./servicerequest/PositivePayMenu";
import ChequeServicesMenu from "./servicerequest/ChequeServicesMenu";
import SoftwareTokenMenu from "./servicerequest/SoftwareTokenMenu";

interface ServiceScreenProps {
  onBack: () => void;
  setServiceView: (setter: (view: string) => void) => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function ServiceScreen({ onBack, setServiceView }: ServiceScreenProps) {
  const [view, setView] = useState("menu");

  // CRITICAL: Register setter so searchNavigator can control view
  useEffect(() => {
    setServiceView(setView);
  }, [setServiceView]);

  // Route to sub-screens
  switch (view) {
    case "ppMenu":
      return <PositivePayMenu onBack={() => setView("menu")} />;

    case "cheque":
      return <ChequeServicesMenu onBack={() => setView("menu")} />;

    case "software":
      return <SoftwareTokenMenu onBack={() => setView("menu")} />;

    case "history":
      return <OverviewScreen title="Request History" onBack={() => setView("menu")} />;

    default:
      // Service Request Menu Hub
      return <ServiceRequestMenu 
        onBack={onBack} 
        setServiceView={setView}
      />;
  }
}

// Feature overview for non-routed views
function OverviewScreen({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="relative h-full text-white px-8 pt-10 overflow-y-auto pb-24 font-sans">
      <header className="mb-6">
        <button onClick={onBack} className="glass-back">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <h1 className="glass-title">{title}</h1>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
          Informational Workflow
        </p>
      </header>

      <div className="max-w-xl mx-auto">
        <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-white/60 text-sm">Feature overview for configuration purposes</p>
          </div>
        </div>
      </div>
    </div>
  );
}