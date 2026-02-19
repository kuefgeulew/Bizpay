import { ArrowLeft, QrCode, Link, Wallet, Zap, ArrowRight, CalendarClock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import BanglaQRScreen from "./BanglaQRScreen";
import PaymentLinksScreen from "./PaymentLinksScreen";
import SettlementPreferencesScreen from "./SettlementPreferencesScreen";
import VamScreen from "../insights/VamScreen";
import RecurringCollectionsScreen from "./RecurringCollectionsScreen";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export interface CollectPrefill {
  view: "bangla-qr" | "payment-links";
  invoiceRef?: string;
  amount?: string;
  customerName?: string;
}

interface CollectHubProps {
  onBack: () => void;
  initialPrefill?: CollectPrefill | null;
  onNavigateToReceivables?: () => void;
}

export default function CollectHub({ onBack, initialPrefill, onNavigateToReceivables }: CollectHubProps) {
  const [view, setView] = useState(initialPrefill?.view || "menu");

  if (view === "bangla-qr") return (
    <BanglaQRScreen
      onBack={() => setView("menu")}
      prefillAmount={initialPrefill?.view === "bangla-qr" ? initialPrefill.amount : undefined}
      prefillInvoiceRef={initialPrefill?.view === "bangla-qr" ? initialPrefill.invoiceRef : undefined}
      onNavigateToReceivables={onNavigateToReceivables}
    />
  );
  if (view === "payment-links") return (
    <PaymentLinksScreen
      onBack={() => setView("menu")}
      prefillAmount={initialPrefill?.view === "payment-links" ? initialPrefill.amount : undefined}
      prefillDescription={initialPrefill?.view === "payment-links" && initialPrefill.invoiceRef ? `Collection — ${initialPrefill.customerName || initialPrefill.invoiceRef}` : undefined}
      prefillInvoiceRef={initialPrefill?.view === "payment-links" ? initialPrefill.invoiceRef : undefined}
      onNavigateToReceivables={onNavigateToReceivables}
    />
  );
  if (view === "virtual-accounts") return <VamScreen onBack={() => setView("menu")} />;
  if (view === "settlement") return <SettlementPreferencesScreen onBack={() => setView("menu")} />;
  if (view === "recurring") return <RecurringCollectionsScreen onBack={() => setView("menu")} />;

  const collectMethods = [
    {
      id: "bangla-qr",
      icon: QrCode,
      label: "Bangla QR",
      description: "Static & Dynamic QR generation",
      color: "emerald",
    },
    {
      id: "payment-links",
      icon: Link,
      label: "Payment Links",
      description: "SMS / WhatsApp / Email",
      color: "cyan",
    },
    {
      id: "virtual-accounts",
      icon: Wallet,
      label: "Virtual Accounts",
      description: "Distributor collections (VAM)",
      color: "purple",
    },
    {
      id: "settlement",
      icon: Zap,
      label: "Same-Day Settlement",
      description: "T+0 / Instant settlement toggle",
      color: "amber",
    },
    {
      id: "recurring",
      icon: CalendarClock,
      label: "Recurring Collections",
      description: "EMI / Subscription schedules",
      color: "rose",
    },
  ];

  const colors: Record<string, { border: string; bg: string; icon: string }> = {
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: "text-emerald-400" },
    cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", icon: "text-cyan-400" },
    purple: { border: "border-purple-500/30", bg: "bg-purple-500/10", icon: "text-purple-400" },
    amber: { border: "border-amber-500/30", bg: "bg-amber-500/10", icon: "text-amber-400" },
    rose: { border: "border-rose-500/30", bg: "bg-rose-500/10", icon: "text-rose-400" },
  };

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Header */}
      <header className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Collect Money</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Collection Channels
          </p>
        </div>
      </header>

      {/* Collection Methods */}
      <div className="space-y-3">
        {collectMethods.map((method, i) => {
          const color = colors[method.color];
          const Icon = method.icon;

          return (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setView(method.id)}
              className={`w-full p-5 rounded-[28px] border backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all hover:bg-white/10 text-left ${color.border} ${color.bg}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-white/5 ${color.icon}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white mb-1">{method.label}</p>
                  <p className="text-xs text-white/60">{method.description}</p>
                </div>
                <ArrowRight size={18} className="text-white/40" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.25 }}
        className="mt-6 p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Money In — Collections
        </p>
        <p className="text-sm text-white/80 leading-relaxed">
          All incoming money flows are managed here. From Bangla QR codes to virtual account
          mappings, this hub consolidates all collection methods for SME cash inflows.
        </p>
      </motion.div>
    </div>
  );
}