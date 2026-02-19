import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRightLeft, Smartphone, Building2, Repeat, CreditCard, Zap, ChevronRight, Globe } from "lucide-react";
import { motion } from "motion/react";
import DirectDebitMenu from "./DirectDebitMenu";
import MfsMenu from "./mfs/MfsMenu";
import OwnAccountTransferSingle from "./OwnAccountTransferSingle";
import OwnAccountTransferBulk from "./OwnAccountTransferBulk";
import BillPaymentMenu from "./billpayment/BillPaymentMenu";
import ThirdPartyTransferScreen, { type ThirdPartyPrefill } from "./transfers/ThirdPartyTransferScreen";
import NpsbMenu from "./transfers/npsb/NpsbMenu";
import {
  QUICK_PAY_ENTRIES,
  getMethodLabel,
  getMethodStyle,
  type QuickPayEntry,
} from "../../mock/quickPay";

interface TransactionScreenProps {
  onBack: () => void;
  setTransactionView: (setter: (view: string) => void) => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function TransactionScreen({ onBack, setTransactionView }: TransactionScreenProps) {
  const [view, setView] = useState("menu");
  const [thirdPartyPrefill, setThirdPartyPrefill] = useState<ThirdPartyPrefill | null>(null);
  const [mfsPrefill, setMfsPrefill] = useState<{ provider: string } | null>(null);

  // CRITICAL: Register setter so searchNavigator can control view
  useEffect(() => {
    setTransactionView(setView);
  }, [setTransactionView]);

  // Handle Quick Pay navigation
  const handleQuickPay = (entry: QuickPayEntry) => {
    switch (entry.method) {
      case "THIRD_PARTY":
        setThirdPartyPrefill({
          beneficiaryId: entry.beneficiaryId,
          amount: entry.lastAmount,
          narration: `Repeat payment — ${entry.referenceId}`,
        });
        setView("thirdparty");
        break;
      case "OWN_ACCOUNT":
        setView("own");
        break;
      case "MFS":
        if (entry.mfsProvider) {
          setMfsPrefill({ provider: entry.mfsProvider });
        }
        setView("mfs");
        break;
    }
  };

  // Clear prefill when returning to menu
  const handleReturnToMenu = () => {
    setThirdPartyPrefill(null);
    setMfsPrefill(null);
    setView("menu");
  };

  // Route to sub-screens
  switch (view) {
    case "mfs":
      return <MfsMenu onBack={handleReturnToMenu} prefillProvider={mfsPrefill?.provider} />;

    case "own":
      return (
        <OwnTransferRouter 
          onBack={handleReturnToMenu} 
        />
      );

    case "directdebit":
      return <DirectDebitMenu onBack={handleReturnToMenu} />;

    case "bill":
      return <BillPaymentMenu onBack={handleReturnToMenu} />;

    case "thirdparty":
      return (
        <ThirdPartyTransferScreen
          onBack={handleReturnToMenu}
          prefill={thirdPartyPrefill}
        />
      );

    case "npsb":
      return <NpsbMenu onBack={handleReturnToMenu} />;

    default:
      // Transaction Menu Hub
      return <TransactionMenuHub onBack={onBack} onSelect={setView} onQuickPay={handleQuickPay} />;
  }
}

// Own Transfer Sub-Router (Single/Bulk)
function OwnTransferRouter({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<"menu" | "single" | "bulk">("menu");

  if (mode === "single") {
    return <OwnAccountTransferSingle onBack={() => setMode("menu")} />;
  }

  if (mode === "bulk") {
    return <OwnAccountTransferBulk onBack={() => setMode("menu")} />;
  }

  // Own Transfer Mode Selection
  return (
    <div className="relative h-full text-white px-8 pt-10 overflow-y-auto pb-24 font-sans">
      <header className="flex items-center gap-4 mb-12">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Own Account</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Transfer Between Accounts
          </p>
        </div>
      </header>

      <div className="space-y-4 max-w-xl mx-auto">
        <MenuCard
          icon={<CreditCard size={24} />}
          title="Single Transfer"
          description="Transfer funds between your accounts"
          onClick={() => setMode("single")}
        />
        <MenuCard
          icon={<Repeat size={24} />}
          title="Bulk Transfer"
          description="Multiple transfers in one batch"
          onClick={() => setMode("bulk")}
        />
      </div>
    </div>
  );
}

// Transaction Menu Hub
function TransactionMenuHub({
  onBack,
  onSelect,
  onQuickPay,
}: {
  onBack: () => void;
  onSelect: (view: string) => void;
  onQuickPay: (entry: QuickPayEntry) => void;
}) {
  const menuItems = [
    {
      id: "own",
      icon: <ArrowRightLeft size={24} />,
      title: "Own Account Transfer",
      description: "Transfer between your accounts",
      color: "cyan"
    },
    {
      id: "thirdparty",
      icon: <Building2 size={24} />,
      title: "Third Party Transfer",
      description: "Other bank payments",
      color: "orange"
    },
    {
      id: "directdebit",
      icon: <Repeat size={24} />,
      title: "Direct Debit",
      description: "Auto-pay mandate setup",
      color: "purple"
    },
    {
      id: "npsb",
      icon: <Globe size={24} />,
      title: "NPSB Transfer",
      description: "National Payment Switch Bangladesh",
      color: "red"
    },
    {
      id: "mfs",
      icon: <Smartphone size={24} />,
      title: "MFS Transfer",
      description: "bKash, Nagad, Rocket, Upay",
      color: "blue"
    },
    {
      id: "bill",
      icon: <CreditCard size={24} />,
      title: "Bill Payment",
      description: "Utilities & Government services",
      color: "green"
    },
  ];

  return (
    <div className="relative h-full text-white px-8 pt-10 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Transactions</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Payment Execution
          </p>
        </div>
      </header>

      {/* Quick Pay Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-cyan-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Quick Pay
          </p>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {QUICK_PAY_ENTRIES.map((entry, idx) => {
            const methodStyle = getMethodStyle(entry.method);
            return (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: idx * 0.03 }}
                onClick={() => onQuickPay(entry)}
                className="shrink-0 w-[160px] p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] hover:bg-white/[0.06] hover:border-white/10 transition-all active:scale-[0.97] text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-1.5 py-0.5 text-[7px] font-bold rounded border ${methodStyle.bg} ${methodStyle.text} ${methodStyle.border}`}
                  >
                    {getMethodLabel(entry.method)}
                  </span>
                  <ChevronRight size={12} className="text-white/15" />
                </div>
                <p className="text-xs text-white/80 font-medium truncate mb-1">
                  {entry.payeeName}
                </p>
                <p className="text-sm text-white font-mono">
                  ৳{entry.lastAmount.toLocaleString()}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Contextual Helper */}
      <div className="mb-6 px-4 py-3 bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
        <p className="text-sm text-white/90 font-medium">
          Select a transaction type to initiate payments. All transactions require approval based on amount and role permissions.
        </p>
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        {menuItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: idx * 0.05 }}
          >
            <MenuCard
              icon={item.icon}
              title={item.title}
              description={item.description}
              onClick={() => onSelect(item.id)}
            />
          </motion.div>
        ))}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// Reusable Menu Card Component
interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function MenuCard({ icon, title, description, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98] overflow-hidden"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-white/10 text-cyan-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-left flex-1">
          <div className="text-lg font-bold text-white tracking-tight">{title}</div>
          <div className="text-[11px] text-white/60 mt-0.5">{description}</div>
        </div>
        <div className="text-white/30 group-hover:text-white/60 transition-colors">
          <ArrowLeft size={18} className="rotate-180" />
        </div>
      </div>

      {/* Shimmer on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-[-25deg]" />
      </div>
    </button>
  );
}