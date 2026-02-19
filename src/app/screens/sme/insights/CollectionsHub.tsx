import { useState } from "react";
import { ArrowLeft, Wallet, GitBranch, CheckCircle2, FolderOpen, Vault } from "lucide-react";
import { motion } from "motion/react";
import VamScreen from "./VamScreen";
import DirectDebitCollectionScreen from "./DirectDebitCollectionScreen";
import CollectionMatchScreen from "./CollectionMatchScreen";
import CashBucketsScreen from "../accounts/CashBucketsScreen";
import TaxVaultScreen from "../accounts/TaxVaultScreen";

interface CollectionsHubProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function CollectionsHub({ onBack }: CollectionsHubProps) {
  const [view, setView] = useState("menu");

  // Route to sub-screens
  switch (view) {
    case "vam":
      return <VamScreen onBack={() => setView("menu")} />;

    case "dd-collection":
      return <DirectDebitCollectionScreen onBack={() => setView("menu")} />;

    case "match":
      return <CollectionMatchScreen onBack={() => setView("menu")} />;

    case "cash-buckets":
      return <CashBucketsScreen onBack={() => setView("menu")} />;

    case "tax-vault":
      return <TaxVaultScreen onBack={() => setView("menu")} />;

    default:
      // Collections Menu Hub
      return <CollectionsMenuHub onBack={onBack} onSelect={setView} />;
  }
}

// Collections Menu Hub
function CollectionsMenuHub({ onBack, onSelect }: { onBack: () => void; onSelect: (view: string) => void }) {
  const menuItems = [
    {
      id: "vam",
      icon: <Wallet size={24} />,
      title: "Virtual Account Management",
      description: "Distributor collections & VAM tracking",
      color: "cyan"
    },
    {
      id: "dd-collection",
      icon: <GitBranch size={24} />,
      title: "Direct Debit Collection",
      description: "Automated payment collection tracking",
      color: "blue"
    },
    {
      id: "match",
      icon: <CheckCircle2 size={24} />,
      title: "Collection Match",
      description: "Auto-match & reconcile collections",
      color: "green"
    },
    {
      id: "cash-buckets",
      icon: <FolderOpen size={24} />,
      title: "Cash Buckets",
      description: "Purpose-based cash allocation (Payroll, Tax, Vendor, Free Cash)",
      color: "cyan"
    },
    {
      id: "tax-vault",
      icon: <Vault size={24} />,
      title: "Tax Vault",
      description: "Statutory cash parking for GST / VAT / TDS obligations",
      color: "blue"
    }
  ];

  return (
    <div className="relative h-full text-white px-8 pt-10 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}>
      </div>

      <header className="flex items-center gap-4 mb-12">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Collections</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Treasury & Collection Management
          </p>
        </div>
      </header>

      <div className="space-y-4 relative z-10">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: idx * 0.1 }}
            onClick={() => onSelect(item.id)}
            className="w-full group"
          >
            <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98]">
              {/* Inner rim light */}
              <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />

              <div className="flex items-center gap-5">
                {/* Icon */}
                <div className={`p-3 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-400/20`}>
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <h3 className="text-base font-bold text-white mb-1 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="text-white/40 group-hover:text-white/80 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}