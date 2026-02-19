import { useState } from "react";
import { ArrowLeft, Search, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { motion } from "motion/react";
import { checkTransactionRules } from "@/app/mock/transactionLimits";
import { getCurrentUser } from "@/app/mock";

interface TransactionPreCheckScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function TransactionPreCheckScreen({ onBack }: TransactionPreCheckScreenProps) {
  const currentUser = getCurrentUser();
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<ReturnType<typeof checkTransactionRules> | null>(null);

  const handleCheck = () => {
    const numAmount = parseFloat(amount.replace(/,/g, ""));
    if (!isNaN(numAmount) && numAmount > 0) {
      const checkResult = checkTransactionRules(numAmount, currentUser.role);
      setResult(checkResult);
    }
  };

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getStatusIcon = () => {
    if (!result) return null;
    switch (result.status) {
      case "within_limit":
        return <CheckCircle className="w-12 h-12 text-emerald-400" />;
      case "requires_approval":
        return <AlertTriangle className="w-12 h-12 text-orange-400" />;
      case "auto_escalate":
      case "exceeds_daily":
        return <XCircle className="w-12 h-12 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    if (!result) return "blue";
    switch (result.severity) {
      case "success":
        return "emerald";
      case "warning":
        return "orange";
      case "critical":
        return "red";
    }
  };

  const getStatusBadge = () => {
    if (!result) return null;
    const statusText = result.status.replace(/_/g, " ").toUpperCase();
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          result.severity === "success"
            ? "bg-emerald-500/20 text-emerald-400"
            : result.severity === "warning"
            ? "bg-orange-500/20 text-orange-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {statusText}
      </span>
    );
  };

  // Quick test amounts
  const quickAmounts = [
    { label: "100K", value: 100000 },
    { label: "250K", value: 250000 },
    { label: "500K", value: 500000 },
    { label: "1M", value: 1000000 },
  ];

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black tracking-tight">Transaction Pre-Check</h1>
        <div className="w-11" />
      </div>

      {/* System Note */}
      <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-200 leading-relaxed">
            <span className="font-bold">System Note:</span> Simulated rule check interface. Actual validation requires backend integration & live limit tracking.
          </p>
        </div>
      </div>

      {/* Current Role Badge */}
      <div className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-2">
          Checking as Role
        </p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <div>
            <p className="text-sm font-black text-white">{currentUser.name}</p>
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">
              {currentUser.role}
            </p>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-3">
          Enter Transaction Amount (BDT)
        </p>
        <div className="relative">
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              setAmount(val ? formatAmount(parseFloat(val)) : "");
            }}
            placeholder="0.00"
            className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xl font-bold text-center focus:outline-none focus:border-[#EDBA12] transition-colors"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {quickAmounts.map((qa) => (
            <motion.button
              key={qa.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAmount(formatAmount(qa.value))}
              className="py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <p className="text-xs font-bold text-white">{qa.label}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Check Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleCheck}
        disabled={!amount || parseFloat(amount.replace(/,/g, "")) <= 0}
        className="w-full py-4 rounded-2xl bg-[#EDBA12] text-[#002D52] font-black text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mb-6 shadow-lg"
      >
        <Search className="w-5 h-5" />
        Check Transaction Rules
      </motion.button>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          className={`p-6 rounded-[24px] bg-gradient-to-br from-${getStatusColor()}-500/10 to-${getStatusColor()}-600/10 border border-${getStatusColor()}-500/20 space-y-4`}
        >
          {/* Status Icon & Badge */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, ...SPRING }}
            >
              {getStatusIcon()}
            </motion.div>
            <div className="mt-3">{getStatusBadge()}</div>
          </div>

          {/* Transaction Amount */}
          <div className="text-center">
            <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-1">
              Transaction Amount
            </p>
            <p className="text-3xl font-black text-white">
              BDT {formatAmount(result.amount)}
            </p>
          </div>

          {/* Message */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-white/90 leading-relaxed text-center">
              {result.message}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">
              Recommended Actions
            </p>
            {result.actions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-6 h-6 rounded-full bg-[#EDBA12]/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[#EDBA12]">{idx + 1}</span>
                </div>
                <p className="text-[11px] text-white/80">{action}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...SPRING }}
          className="p-4 rounded-2xl bg-white/5 border border-white/10"
        >
          <p className="text-[10px] text-white/70 leading-relaxed text-center">
            Enter an amount above to simulate transaction rule validation. 
            This check runs instantly with your current role permissions.
          </p>
        </motion.div>
      )}
    </div>
  );
}