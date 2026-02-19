import { useState } from "react";
import { ArrowLeft, ChevronRight, FileText, Receipt, Landmark, ShieldCheck, DollarSign, TrendingUp, FileSpreadsheet, FileCheck } from "lucide-react";
import GenerateStatement from "./GenerateStatement";
import AccountSummary from "./AccountSummary";
import DirectDebitReportsMenu from "./directdebit/DirectDebitReportsMenu";
import TransactionReportsMenu from "./transaction/TransactionReportsMenu";
import BillPaymentReportsMenu from "./billpayment/BillPaymentReportsMenu";
import PositivePayReportsMenu from "./positivepay/PositivePayReportsMenu";
import InvoicesHub from "../invoices/InvoicesHub";
import CashFlowAnalysisScreen from "./CashFlowAnalysisScreen";
import TaxComplianceScreen from "./TaxComplianceScreen";
import CertificatesMenu from "./certificates/CertificatesMenu";
import FeatureOverviewScreen from "../../../components/FeatureOverviewScreen";
import { Settings } from "lucide-react";

interface ReportsMenuProps {
  onBack: () => void;
}

export default function ReportsMenu({ onBack }: ReportsMenuProps) {
  const [view, setView] = useState("menu");

  // Route Handling
  if (view === "gs") return <GenerateStatement onBack={() => setView("menu")} />;
  if (view === "as") return <AccountSummary onBack={() => setView("menu")} />;
  if (view === "dd") return <DirectDebitReportsMenu onBack={() => setView("menu")} />;
  if (view === "tr") return <TransactionReportsMenu onBack={() => setView("menu")} />;
  if (view === "bp") return <BillPaymentReportsMenu onBack={() => setView("menu")} />;
  if (view === "pp") return <PositivePayReportsMenu onBack={() => setView("menu")} />;
  if (view === "invoices") return <InvoicesHub onBack={() => setView("menu")} />;
  if (view === "cashflow") return <CashFlowAnalysisScreen onBack={() => setView("menu")} />;
  if (view === "tax") return <TaxComplianceScreen onBack={() => setView("menu")} />;
  if (view === "certificates") return <CertificatesMenu onBack={() => setView("menu")} />;
  if (view !== "menu")
    return (
      <FeatureOverviewScreen
        title={view}
        subtitle="Reports & Analytics"
        purpose="This module provides tools for generating, exporting, and analyzing financial reports across the platform."
        features={[
          "Automated report generation and export",
          "Period-based analytics and summaries",
          "Multi-format download support",
          "Historical data retrieval and filtering",
        ]}
        icon={Settings}
        onBack={() => setView("menu")}
      />
    );

  const items = [
    { label: "Account Summary", icon: <FileText size={18} />, onClick: () => setView("as") },
    { label: "Generate Statement", icon: <FileText size={18} />, onClick: () => setView("gs") },
    { label: "Cash Flow Analysis", icon: <TrendingUp size={18} />, onClick: () => setView("cashflow") },
    { label: "Invoices & Outstanding", icon: <DollarSign size={18} />, onClick: () => setView("invoices") },
    { label: "Tax & Compliance", icon: <FileSpreadsheet size={18} />, onClick: () => setView("tax") },
    { label: "Certificates", icon: <FileCheck size={18} />, onClick: () => setView("certificates") },
    { label: "Direct Debit Reports", icon: <Landmark size={18} />, onClick: () => setView("dd") },
    { label: "Transaction Reports", icon: <Receipt size={18} />, onClick: () => setView("tr") },
    { label: "Bill Payment Reports", icon: <Receipt size={18} />, onClick: () => setView("bp") },
    { label: "Positive Pay Reports", icon: <ShieldCheck size={18} />, onClick: () => setView("pp") },
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
            Reports
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Analytics & Exports
          </p>
        </div>
      </header>

      {/* Menu Items */}
      <div className="pb-10 space-y-3 relative z-10">
        {items.map((it) => (
          <Card
            key={it.label}
            label={it.label}
            icon={it.icon}
            onClick={it.onClick}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- UI COMPONENTS ---------- */

interface CardProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function Card({ label, icon, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      className="
        group relative w-full text-left flex items-center justify-between 
        px-5 py-3.5
        bg-white/[0.04] backdrop-blur-[30px]
        border border-white/10
        rounded-[28px]
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]
        transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
        hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1
        active:scale-[0.98] active:translate-y-0
        overflow-hidden
      "
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className="
          p-3 bg-white/[0.05] rounded-xl
          border border-white/5
          text-white/60
          group-hover:scale-105 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 
          transition-all duration-500
        ">
          {icon}
        </div>
        <span className="text-base tracking-tight text-slate-200 group-hover:text-white transition-colors">
          {label}
        </span>
      </div>

      <div className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center opacity-30 group-hover:opacity-100 group-hover:text-cyan-400 transition-all">
        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}