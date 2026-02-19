import { useState } from "react";
import { 
  ArrowLeft, 
  UserCheck, 
  Users, 
  FileStack, 
  FileSpreadsheet, 
  XCircle, 
  ShieldAlert,
  ChevronRight
} from "lucide-react";

import DirectDebitOwnSingle from "./directdebit/DirectDebitOwnSingle";
import DirectDebitThirdPartySingle from "./directdebit/DirectDebitThirdPartySingle";
import DirectDebitOwnBulk from "./directdebit/DirectDebitOwnBulk";
import DirectDebitThirdPartyBulk from "./directdebit/DirectDebitThirdPartyBulk";
import DirectDebitCancelApproved from "./directdebit/DirectDebitCancelApproved";
import DirectDebitCancelMandate from "./directdebit/DirectDebitCancelMandate";

interface DirectDebitMenuProps {
  onBack: () => void;
}

export default function DirectDebitMenu({ onBack }: DirectDebitMenuProps) {
  const [view, setView] = useState("menu");

  /* ---------- ROUTING TO ALL 6 SCREENS ---------- */

  if (view === "ownSingle")
    return <DirectDebitOwnSingle onBack={() => setView("menu")} />;

  if (view === "thirdSingle")
    return <DirectDebitThirdPartySingle onBack={() => setView("menu")} />;

  if (view === "ownBulk")
    return <DirectDebitOwnBulk onBack={() => setView("menu")} />;

  if (view === "thirdBulk")
    return <DirectDebitThirdPartyBulk onBack={() => setView("menu")} />;

  if (view === "cancelApproved")
    return <DirectDebitCancelApproved onBack={() => setView("menu")} />;

  if (view === "cancelMandate")
    return <DirectDebitCancelMandate onBack={() => setView("menu")} />;

  /* ---------- MAIN MENU ---------- */

  return (
    <div className="h-full text-slate-50 px-6 py-8 overflow-y-auto">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Direct Debit</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">Collection & Cancellation</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Collection Section */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Collection Methods</h2>
          <div className="grid gap-4">
            <MenuCard
              icon={<UserCheck className="text-blue-400" size={20} />}
              label="Collect from Own A/C [Single]"
              onClick={() => setView("ownSingle")}
            />
            <MenuCard
              icon={<Users className="text-blue-400" size={20} />}
              label="Collect from 3rd Party A/C [Single]"
              onClick={() => setView("thirdSingle")}
            />
            <MenuCard
              icon={<FileStack className="text-indigo-400" size={20} />}
              label="Collect from Own Accounts [Bulk]"
              onClick={() => setView("ownBulk")}
            />
            <MenuCard
              icon={<FileSpreadsheet className="text-indigo-400" size={20} />}
              label="Collect from 3rd Party Accounts [Bulk]"
              onClick={() => setView("thirdBulk")}
            />
          </div>
        </section>

        {/* Management Section */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Management & Safety</h2>
          <div className="grid gap-4">
            <MenuCard
              icon={<XCircle className="text-red-400" size={20} />}
              label="Cancel Approved Transactions"
              onClick={() => setView("cancelApproved")}
            />
            <MenuCard
              icon={<ShieldAlert className="text-red-400" size={20} />}
              label="Cancel By Mandate Reference"
              onClick={() => setView("cancelMandate")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- UI ---------- */

interface MenuCardProps {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}

function MenuCard({ label, onClick, icon }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        group w-full text-left px-6 py-5
        bg-white/5 backdrop-blur-2xl border border-white/10
        rounded-[24px] flex items-center justify-between
        hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] 
        active:scale-[0.99] transition-all duration-300
      "
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
          {label}
        </span>
      </div>
      <ChevronRight 
        size={18} 
        className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" 
      />
    </button>
  );
}