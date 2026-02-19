import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Shield, ArrowRight } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export interface CreditBackstopAdvisoryProps {
  visible: boolean;
  paymentAmount: number;
  balanceAfterPayment: number;
  safeFloor: number;
  odBufferAvailable: number;
  onContinueWithBuffer?: () => void;
  onAdjustTiming?: () => void;
}

const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `৳${lakh.toFixed(1)}L`;
  }
  return `৳${amount.toLocaleString("en-IN")}`;
};

/**
 * Credit Backstop Advisory — Contextual Panel
 *
 * Appears when a payment would reduce balance below safe floor.
 * Read-only, advisory-only. Two navigation choices:
 *   1. Continue using OD buffer (default-highlighted)
 *   2. Adjust payment timing (routes back)
 *
 * No execution, no loan initiation, no approvals.
 */
export default function CreditBackstopAdvisory({
  visible,
  paymentAmount,
  balanceAfterPayment,
  safeFloor,
  odBufferAvailable,
  onContinueWithBuffer,
  onAdjustTiming,
}: CreditBackstopAdvisoryProps) {
  const wouldBreachFloor = balanceAfterPayment < safeFloor;
  const shortfall = safeFloor - balanceAfterPayment;
  const bufferCanAbsorb = shortfall <= odBufferAvailable;

  if (!visible || !wouldBreachFloor) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={SPRING}
          className="p-6 rounded-[28px] bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/25 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-serif text-white tracking-tight">Payment Advisory</h3>
              <p className="text-[10px] uppercase tracking-[0.25em] text-amber-400/80 font-bold mt-0.5">
                Balance Threshold Alert
              </p>
            </div>
          </div>

          {/* Advisory Message */}
          <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/10 mb-5">
            <p className="text-sm text-white/90 leading-relaxed mb-2">
              This payment would reduce available balance below {formatCurrency(safeFloor)}.
            </p>
            {bufferCanAbsorb ? (
              <p className="text-sm text-white/70 leading-relaxed">
                Overdraft buffer can absorb the difference without impacting operations.
              </p>
            ) : (
              <p className="text-sm text-red-400/90 leading-relaxed">
                Overdraft buffer ({formatCurrency(odBufferAvailable)}) cannot fully absorb the shortfall of {formatCurrency(shortfall)}.
              </p>
            )}
          </div>

          {/* Advisory Impact Summary */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/10">
              <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Payment</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(paymentAmount)}</p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/10">
              <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Buffer Needed</p>
              <p className="text-sm font-semibold text-amber-400">{formatCurrency(shortfall)}</p>
            </div>
          </div>

          {/* Two Advisory Options */}
          <div className="space-y-2">
            <button
              onClick={onContinueWithBuffer}
              className="w-full p-4 rounded-[20px] bg-cyan-500/10 border border-cyan-500/30 text-left transition-all hover:bg-cyan-500/15 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-cyan-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Continue using OD buffer</p>
                  <p className="text-[10px] text-white/50 mt-0.5">Balance stays above floor — buffer absorbs shortfall</p>
                </div>
                <ArrowRight size={14} className="text-cyan-400/60" />
              </div>
            </button>

            <button
              onClick={onAdjustTiming}
              className="w-full p-4 rounded-[20px] bg-white/[0.03] border border-white/10 text-left transition-all hover:bg-white/[0.06] active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <ArrowRight size={18} className="text-white/40 shrink-0 rotate-180" />
                <div className="flex-1">
                  <p className="text-sm text-white/70">Adjust payment timing</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Return to payment queue without executing</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
