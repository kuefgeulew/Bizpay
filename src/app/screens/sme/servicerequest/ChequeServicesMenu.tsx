/**
 * CHEQUE SERVICES MENU
 * Sub-menu grouping cheque-related service requests:
 * - Chequebook Inventory
 * - Stop Cheque
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, BookOpen, OctagonX } from "lucide-react";
import ChequebookInventory from "./ChequebookInventory";
import StopChequeScreen from "./StopChequeScreen";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 35 };

interface ChequeServicesMenuProps {
  onBack: () => void;
  initialView?: string;
}

export default function ChequeServicesMenu({ onBack, initialView }: ChequeServicesMenuProps) {
  const [view, setView] = useState(initialView || "menu");

  if (view === "inventory")
    return <ChequebookInventory onBack={() => setView("menu")} />;

  if (view === "stop_cheque")
    return <StopChequeScreen onBack={() => setView("menu")} />;

  const menuItems = [
    {
      id: "inventory",
      label: "Chequebook Inventory",
      icon: <BookOpen size={20} />,
    },
    {
      id: "stop_cheque",
      label: "Stop Cheque",
      icon: <OctagonX size={20} />,
    },
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
              Cheque Services
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              Cheque & Cash Management
            </p>
          </div>
        </header>

        {/* Menu Items */}
        <div className="space-y-4">
          {menuItems.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...STIFF_SPRING, delay: idx * 0.08 }}
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
