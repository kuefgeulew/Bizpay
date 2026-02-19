import { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import ReconciliationDashboardScreen from "./ReconciliationDashboardScreen";
import ExceptionManagementScreen from "./ExceptionManagementScreen";
import ManualMatchingScreen from "./ManualMatchingScreen";
import AutoReconRulesHub from "./autorules/AutoReconRulesHub";
import TaxVaultScreen from "../accounts/TaxVaultScreen";
import {
  BANK_TRANSACTIONS,
  LEDGER_ENTRIES,
  getReconciliationStats,
  formatAmount,
  formatDate,
} from "../../../data/reconciliationEngine";

interface ReconciliationHubProps {
  onBack: () => void;
  currentUser: {
    userId: string;
    name: string;
    role: "maker" | "checker" | "approver" | "admin" | "viewer";
  };
}

type View = "dashboard" | "matches" | "exceptions" | "manual" | "auto-rules" | "tax-vault";

export default function ReconciliationHub({
  onBack,
  currentUser,
}: ReconciliationHubProps) {
  const [view, setView] = useState<View>("dashboard");

  const handleViewChange = (newView: "matches" | "exceptions" | "manual" | "auto-rules" | "tax-vault") => {
    setView(newView);
  };

  const handleResolveException = (exceptionId: string) => {
    // Navigate to manual matching to resolve
    setView("manual");
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
  };

  switch (view) {
    case "exceptions":
      return (
        <ExceptionManagementScreen
          onBack={handleBackToDashboard}
          onResolveException={handleResolveException}
        />
      );

    case "manual":
      return (
        <ManualMatchingScreen
          onBack={handleBackToDashboard}
          currentUser={currentUser}
        />
      );

    case "auto-rules":
      return (
        <AutoReconRulesHub onBack={handleBackToDashboard} />
      );

    case "tax-vault":
      return (
        <TaxVaultScreen onBack={handleBackToDashboard} />
      );

    case "matches":
      return (
        <MatchedItemsScreen onBack={handleBackToDashboard} />
      );

    case "dashboard":
    default:
      return (
        <ReconciliationDashboardScreen
          onBack={onBack}
          onViewDetails={handleViewChange}
        />
      );
  }
}

// ============================================
// Matched Items — Gold Standard inline screen
// ============================================

function MatchedItemsScreen({ onBack }: { onBack: () => void }) {
  const stats = getReconciliationStats(BANK_TRANSACTIONS, LEDGER_ENTRIES);

  // Matched transactions: bank txns whose status is MATCHED
  const matchedBank = BANK_TRANSACTIONS.filter((t) => t.status === "MATCHED");
  const matchedLedger = LEDGER_ENTRIES.filter((t) => t.status === "MATCHED");

  const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Matched Items</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            {stats.matchedBank} Reconciled
          </p>
        </div>
      </header>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-6 rounded-[28px] bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 font-bold">
            Match Rate
          </p>
          <CheckCircle size={18} className="text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-serif text-white">
            {stats.matchRate}%
          </span>
          <span className="text-sm text-white/50">
            {stats.matchedBank} of {stats.totalBank}
          </span>
        </div>
      </motion.div>

      {/* Matched Bank Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-3">
          Matched Bank Transactions
        </p>
        <div className="space-y-2">
          {matchedBank.length === 0 ? (
            <div className="py-8 text-center rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <p className="text-sm text-white/30">No matched bank transactions</p>
            </div>
          ) : (
            matchedBank.map((txn, i) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.03 * i }}
                className="p-4 rounded-[20px] bg-emerald-500/5 border border-emerald-500/15 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[12px] text-white/90 flex-1 line-clamp-1">
                    {txn.description}
                  </p>
                  <CheckCircle size={14} className="text-emerald-400 shrink-0 ml-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30">{formatDate(txn.date)}</span>
                    <span className="text-[10px] text-white/30 font-mono">{txn.reference}</span>
                  </div>
                  <span className="text-sm text-emerald-300 font-serif">
                    {formatAmount(txn.amount)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Matched Ledger Entries */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-5"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-purple-400/80 font-bold mb-3">
          Matched Ledger Entries
        </p>
        <div className="space-y-2">
          {matchedLedger.length === 0 ? (
            <div className="py-8 text-center rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <p className="text-sm text-white/30">No matched ledger entries</p>
            </div>
          ) : (
            matchedLedger.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.03 * i }}
                className="p-4 rounded-[20px] bg-purple-500/5 border border-purple-500/15 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[12px] text-white/90 flex-1 line-clamp-1">
                    {entry.description}
                  </p>
                  <CheckCircle size={14} className="text-purple-400 shrink-0 ml-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30">{formatDate(entry.date)}</span>
                    <span className="text-[10px] text-white/30 font-mono">{entry.reference}</span>
                  </div>
                  <span className="text-sm text-purple-300 font-serif">
                    {formatAmount(entry.amount)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="p-4 rounded-[28px] bg-white/[0.03] border border-white/5 backdrop-blur-[45px]"
      >
        <p className="text-[9px] text-white/20 text-center">
          Illustrative workflow with representative data
        </p>
      </motion.div>
    </div>
  );
}