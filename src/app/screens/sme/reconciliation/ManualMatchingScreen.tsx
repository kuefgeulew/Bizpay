import { useState, useMemo } from "react";
import { ArrowLeft, Link2, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
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

      console.log("✅ Manual match submitted for approval:", approval);

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
    <div className="glass-page">
      {/* Header */}
      <header className="mb-6">
        <button onClick={onBack} className="glass-back">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="glass-title">Manual Matching</h1>
        <p className="text-sm text-muted-foreground -mt-4">
          Select transactions to match
        </p>
      </header>

      {/* Selection Summary */}
      {(selectedBankTxns.length > 0 || selectedLedgerEntries.length > 0) && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-blue-700 font-medium mb-1">
                Bank Selected
              </p>
              <p className="text-lg font-bold text-blue-900">
                {formatAmount(selectedBankTotal)}
              </p>
              <p className="text-xs text-blue-700">
                {selectedBankTxns.length} transaction(s)
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700 font-medium mb-1">
                Ledger Selected
              </p>
              <p className="text-lg font-bold text-blue-900">
                {formatAmount(selectedLedgerTotal)}
              </p>
              <p className="text-xs text-blue-700">
                {selectedLedgerEntries.length} entry(s)
              </p>
            </div>
          </div>

          {amountDifference > 0 && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-100">
              <span className="text-xs font-semibold text-amber-900">
                Amount Difference
              </span>
              <span className="text-xs font-bold text-amber-900">
                {formatAmount(amountDifference)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bank Transactions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Bank Transactions ({unmatchedBank.length} unmatched)
        </h3>
        <div className="space-y-2">
          {unmatchedBank.map((txn) => (
            <SelectableTransactionCard
              key={txn.id}
              id={txn.id}
              description={txn.description}
              amount={txn.amount}
              date={txn.date}
              reference={txn.reference}
              selected={selectedBankTxns.includes(txn.id)}
              onSelect={handleBankSelect}
              color="blue"
            />
          ))}
        </div>
      </div>

      {/* Ledger Entries */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Ledger Entries ({unmatchedLedger.length} unmatched)
        </h3>
        <div className="space-y-2">
          {unmatchedLedger.map((entry) => (
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
            />
          ))}
        </div>
      </div>

      {/* Match Reason */}
      {(selectedBankTxns.length > 0 || selectedLedgerEntries.length > 0) && (
        <div className="mb-6">
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Match Reason <span className="text-destructive">*</span>
          </label>
          <textarea
            value={matchReason}
            onChange={(e) => setMatchReason(e.target.value)}
            placeholder="Explain why these transactions should be matched (min 10 characters)..."
            rows={3}
            className="field resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {matchReason.length} / 10 characters minimum
          </p>
        </div>
      )}

      {/* Submit Button */}
      {canSubmit && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowConfirmDialog(true)}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Link2 size={18} />
          Submit Match for Approval
        </motion.button>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmationDialog
          bankCount={selectedBankTxns.length}
          ledgerCount={selectedLedgerEntries.length}
          amountDifference={amountDifference}
          onConfirm={handleSubmitMatch}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
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
}: {
  id: string;
  description: string;
  amount: number;
  date: string;
  reference: string;
  selected: boolean;
  onSelect: (id: string) => void;
  color: "blue" | "purple";
}) {
  const colors = {
    blue: selected
      ? "bg-blue-100 border-blue-400"
      : "bg-white border-blue-200 hover:border-blue-300",
    purple: selected
      ? "bg-purple-100 border-purple-400"
      : "bg-white border-purple-200 hover:border-purple-300",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(id)}
      className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${colors[color]}`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-foreground flex-1 line-clamp-2">
          {description}
        </p>
        {selected && <CheckCircle size={16} className="text-primary shrink-0 ml-2" />}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
          <span className="text-xs text-muted-foreground">{reference}</span>
        </div>
        <span className="text-sm font-bold text-foreground">
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={SPRING}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Confirm Manual Match
        </h3>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            You are about to submit a manual match:
          </p>
          <ul className="text-sm text-foreground space-y-1 ml-4 list-disc">
            <li>{bankCount} bank transaction(s)</li>
            <li>{ledgerCount} ledger entry(s)</li>
            {amountDifference > 0 && (
              <li className="text-amber-700 font-medium">
                Amount difference: {formatAmount(amountDifference)}
              </li>
            )}
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            This match will require Checker verification and Approver approval.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Submit for Approval
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}