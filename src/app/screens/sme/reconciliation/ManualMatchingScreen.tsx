import { useState, useMemo } from "react";
import { ArrowLeft, Link2, CheckCircle, ArrowRight, AlertTriangle, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  BANK_TRANSACTIONS,
  LEDGER_ENTRIES,
  createManualMatch,
  formatAmount,
  formatDate,
  type BankTransaction,
  type SystemLedgerEntry,
} from "../../../data/reconciliationEngine";
import { submitForApproval } from "../../../data/approvalEngine";

interface ManualMatchingScreenProps {
  onBack: () => void;
  currentUser: {
    userId: string;
    name: string;
    role: "maker" | "checker" | "approver" | "admin" | "viewer";
  };
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function ManualMatchingScreen({
  onBack,
  currentUser,
}: ManualMatchingScreenProps) {
  const [selectedBankTxns, setSelectedBankTxns] = useState<string[]>([]);
  const [selectedLedgerEntries, setSelectedLedgerEntries] = useState<string[]>(
    []
  );
  const [matchReason, setMatchReason] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Filter unmatched transactions
  const unmatchedBank = useMemo(
    () =>
      BANK_TRANSACTIONS.filter(
        (t) => t.status === "UNMATCHED" || t.status === "EXCEPTION"
      ),
    []
  );

  const unmatchedLedger = useMemo(
    () => LEDGER_ENTRIES.filter((t) => t.status === "UNMATCHED"),
    []
  );

  // Calculate totals
  const selectedBankTotal = useMemo(() => {
    return selectedBankTxns.reduce((sum, id) => {
      const txn = unmatchedBank.find((t) => t.id === id);
      return sum + (txn?.amount || 0);
    }, 0);
  }, [selectedBankTxns, unmatchedBank]);

  const selectedLedgerTotal = useMemo(() => {
    return selectedLedgerEntries.reduce((sum, id) => {
      const entry = unmatchedLedger.find((t) => t.id === id);
      return sum + (entry?.amount || 0);
    }, 0);
  }, [selectedLedgerEntries, unmatchedLedger]);

  const amountDifference = Math.abs(selectedBankTotal - selectedLedgerTotal);

  const canSubmit =
    selectedBankTxns.length > 0 &&
    selectedLedgerEntries.length > 0 &&
    matchReason.trim().length >= 10;

  const handleBankSelect = (id: string) => {
    setSelectedBankTxns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLedgerSelect = (id: string) => {
    setSelectedLedgerEntries((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmitMatch = () => {
    try {
      // Create manual match
      const match = createManualMatch(
        selectedBankTxns,
        selectedLedgerEntries,
        currentUser.userId,
        matchReason
      );

      // Submit for approval
      const approval = submitForApproval(
        "transaction",
        "THIRD_PARTY", // Using generic type for reconciliation
        {
          matchType: "MANUAL_RECONCILIATION",
          bankTransactionIds: selectedBankTxns,
          ledgerEntryIds: selectedLedgerEntries,
          reason: matchReason,
          amountDifference,
          matchId: match.id,
        },
        currentUser,
        selectedBankTotal
      );

      console.log("Manual match submitted for approval:", approval);

      toast.success("Match Submitted for Approval", {
        description: "Awaiting Checker verification",
      });

      // Reset form
      setSelectedBankTxns([]);
      setSelectedLedgerEntries([]);
      setMatchReason("");
      setShowConfirmDialog(false);

      // Return to dashboard after short delay
      setTimeout(() => onBack(), 1000);
    } catch (error: any) {
      toast.error("Submission Failed", {
        description: error.message,
      });
    }
  };

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
          <h1 className="text-3xl font-serif tracking-tight">Manual Matching</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Select Transactions to Match
          </p>
        </div>
      </header>

      {/* Selection Summary */}
      <AnimatePresence>
        {(selectedBankTxns.length > 0 || selectedLedgerEntries.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={SPRING}
            className="mb-6 p-5 rounded-[28px] bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
              Selection Summary
            </p>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
                  Bank Selected
                </p>
                <p className="text-xl text-white font-serif">
                  {formatAmount(selectedBankTotal)}
                </p>
                <p className="text-[10px] text-cyan-400/60 mt-0.5">
                  {selectedBankTxns.length} transaction(s)
                </p>
              </div>
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
                  Ledger Selected
                </p>
                <p className="text-xl text-white font-serif">
                  {formatAmount(selectedLedgerTotal)}
                </p>
                <p className="text-[10px] text-purple-400/60 mt-0.5">
                  {selectedLedgerEntries.length} entry(s)
                </p>
              </div>
            </div>

            {amountDifference > 0 && (
              <div className="flex items-center justify-between p-3 rounded-[20px] bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={13} className="text-amber-400" />
                  <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                    Amount Difference
                  </span>
                </div>
                <span className="text-sm text-amber-300 font-serif">
                  {formatAmount(amountDifference)}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank Transactions Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-3">
          Bank Transactions ({unmatchedBank.length} unmatched)
        </p>
        <div className="space-y-2">
          {unmatchedBank.map((txn, i) => (
            <SelectableTransactionCard
              key={txn.id}
              id={txn.id}
              description={txn.description}
              amount={txn.amount}
              date={txn.date}
              reference={txn.reference}
              selected={selectedBankTxns.includes(txn.id)}
              onSelect={handleBankSelect}
              color="cyan"
              delay={0.02 * i}
            />
          ))}
        </div>
      </motion.div>

      {/* Ledger Entries Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-purple-400/80 font-bold mb-3">
          Ledger Entries ({unmatchedLedger.length} unmatched)
        </p>
        <div className="space-y-2">
          {unmatchedLedger.map((entry, i) => (
            <SelectableTransactionCard
              key={entry.id}
              id={entry.id}
              description={entry.description}
              amount={entry.amount}
              date={entry.date}
              reference={entry.reference}
              selected={selectedLedgerEntries.includes(entry.id)}
              onSelect={handleLedgerSelect}
              color="purple"
              delay={0.02 * i}
            />
          ))}
        </div>
      </motion.div>

      {/* Match Reason */}
      <AnimatePresence>
        {(selectedBankTxns.length > 0 || selectedLedgerEntries.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={SPRING}
            className="mb-6 p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
          >
            <label className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold block mb-3">
              Match Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={matchReason}
              onChange={(e) => setMatchReason(e.target.value)}
              placeholder="Explain why these transactions should be matched (min 10 characters)..."
              rows={3}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/40 transition-colors resize-none placeholder:text-white/20"
            />
            <p className="text-[9px] text-white/30 mt-1.5">
              {matchReason.length} / 10 characters minimum
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <AnimatePresence>
        {canSubmit && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowConfirmDialog(true)}
            className="w-full p-4 rounded-[28px] bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 hover:bg-cyan-500/20 transition-all"
          >
            <Link2 size={16} className="text-cyan-400" />
            <span className="text-sm text-cyan-300 font-semibold">
              Submit Match for Approval
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog — phone-contained */}
      <AnimatePresence>
        {showConfirmDialog && (
          <ConfirmationDialog
            bankCount={selectedBankTxns.length}
            ledgerCount={selectedLedgerEntries.length}
            amountDifference={amountDifference}
            onConfirm={handleSubmitMatch}
            onCancel={() => setShowConfirmDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS — Gold Standard Design System
// ============================================

function SelectableTransactionCard({
  id,
  description,
  amount,
  date,
  reference,
  selected,
  onSelect,
  color,
  delay,
}: {
  id: string;
  description: string;
  amount: number;
  date: string;
  reference: string;
  selected: boolean;
  onSelect: (id: string) => void;
  color: "cyan" | "purple";
  delay: number;
}) {
  const colorStyles = {
    cyan: selected
      ? "bg-cyan-500/10 border-cyan-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
      : "bg-white/[0.03] border-white/10 hover:bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
    purple: selected
      ? "bg-purple-500/10 border-purple-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
      : "bg-white/[0.03] border-white/10 hover:bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(id)}
      className={`w-full p-3.5 rounded-[20px] border-2 backdrop-blur-[45px] transition-all text-left ${colorStyles[color]}`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-[12px] text-white/90 flex-1 line-clamp-2">
          {description}
        </p>
        {selected && (
          <CheckCircle
            size={16}
            className={`shrink-0 ml-2 ${color === "cyan" ? "text-cyan-400" : "text-purple-400"}`}
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30">{formatDate(date)}</span>
          <span className="text-[10px] text-white/30 font-mono">{reference}</span>
        </div>
        <span className="text-sm text-white font-serif">
          {formatAmount(amount)}
        </span>
      </div>
    </motion.button>
  );
}

function ConfirmationDialog({
  bankCount,
  ledgerCount,
  amountDifference,
  onConfirm,
  onCancel,
}: {
  bankCount: number;
  ledgerCount: number;
  amountDifference: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-[#001E3C]/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={SPRING}
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-[28px] bg-[#0F172A] border border-white/10 p-6 shadow-2xl shadow-black/40"
      >
        <h3 className="text-xl font-serif text-white mb-1">
          Confirm Manual Match
        </h3>
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/60 font-bold mb-5">
          Review Before Submission
        </p>

        <div className="mb-5 space-y-2.5">
          <p className="text-[11px] text-white/60">
            You are about to submit a manual match:
          </p>
          <div className="space-y-2 pl-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <p className="text-[11px] text-white/80">{bankCount} bank transaction(s)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <p className="text-[11px] text-white/80">{ledgerCount} ledger entry(s)</p>
            </div>
            {amountDifference > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="text-[11px] text-amber-300">
                  Amount difference: {formatAmount(amountDifference)}
                </p>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mt-3">
            <p className="text-[10px] text-white/40">
              This match will require Checker verification and Approver approval.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-[20px] bg-white/5 border border-white/10 text-[11px] text-white/60 font-semibold hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-[20px] bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 font-semibold hover:bg-cyan-500/20 transition-all"
          >
            Submit for Approval
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
