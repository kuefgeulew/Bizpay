import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, CheckCircle, History, Users, Shield, Wrench } from "lucide-react";

import SoftwareTokenMenu from "./SoftwareTokenMenu";
import PositivePayMenu from "./PositivePayMenu";
import ChequeServicesMenu from "./ChequeServicesMenu";
import OperationsMenu from "./OperationsMenu";
import FeatureOverviewScreen from "../../../components/FeatureOverviewScreen";
import UserManagementHub from "../usermanagement/UserManagementHub";
import AdminInsightScreen from "../admin/AdminInsightScreen";

const TACTILE_SPRING = { type: "spring" as const, stiffness: 600, damping: 35 };

interface ServiceRequestMenuProps {
  onBack: () => void;
  setServiceView?: (setter: (view: string) => void) => void;
}

export default function ServiceRequestMenu({ onBack, setServiceView }: ServiceRequestMenuProps) {
  const [view, setView] = useState("menu");
  
  useEffect(() => {
    if (setServiceView) setServiceView(setView);
  }, [setServiceView]);

  if (view === "software")
    return <SoftwareTokenMenu onBack={() => setView("menu")} />;

  if (view === "positive")
    return <PositivePayMenu onBack={() => setView("menu")} />;

  if (view === "cheque")
    return <ChequeServicesMenu onBack={() => setView("menu")} />;

  if (view === "operations")
    return <OperationsMenu onBack={() => setView("menu")} />;

  if (view === "history")
    return (
      <FeatureOverviewScreen
        title="History"
        subtitle="Service Configuration"
        purpose="This module provides tools for managing service requests, generating reports, and tracking operational workflows across the platform."
        features={[
          "Request submission and status tracking",
          "Automated report generation and export",
          "Approval chain visibility and routing",
          "Historical data retrieval and filtering",
        ]}
        icon={History}
        onBack={() => setView("menu")}
      />
    );

  if (view === "users")
    return <UserManagementHub onBack={() => setView("menu")} />;

  if (view === "admin")
    return <AdminInsightScreen onBack={() => setView("menu")} />;

  const menuItems = [
    { id: "operations", label: "Operations", icon: <Wrench size={20} /> },
    { id: "positive", label: "Positive Pay", icon: <CheckCircle size={20} /> },
    { id: "users", label: "User Management", icon: <Users size={20} />, highlight: true },
    { id: "history", label: "History", icon: <History size={20} /> },
    { id: "admin", label: "Admin Insight", icon: <Shield size={20} />, highlight: true },
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
              Service Requests
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              Operations & Configuration
            </p>
          </div>
        </header>

        {/* Contextual Helper */}
        <div className="mb-8 px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
          <p className="text-sm text-white/70">
            Manage non-payment services including user management, cheque inventory, and security tokens.
          </p>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          {menuItems.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...TACTILE_SPRING, delay: idx * 0.05 }}
              onClick={() => setView(item.id)}
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
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-cyan-400 transition-colors">
                  {item.icon}
                </div>
                <span className="text-lg text-white tracking-tight">
                  {item.label}
                </span>
              </div>
              
              <div className="text-white/20 group-hover:text-white transition-colors">
                <ChevronRight size={20} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}