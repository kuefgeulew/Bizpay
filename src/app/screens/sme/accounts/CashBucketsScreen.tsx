import { ArrowLeft, FolderOpen, Lock, Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface CashBucketsScreenProps {
  onBack: () => void;
}

interface Bucket {
  id: string;
  name: string;
  purpose: string;
  allocated: number;
  softLock?: string;
  color: string;
}

const TOTAL_CASA_BALANCE = 4250000; // ৳42.5L

export default function CashBucketsScreen({ onBack }: CashBucketsScreenProps) {
  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_cash_buckets_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_CASH_BUCKETS" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Viewed Cash Buckets (purpose-based allocation)",
      entityType: "cash_buckets",
      metadata: {},
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  const [buckets, setBuckets] = useState<Bucket[]>([
    {
      id: "payroll",
      name: "Payroll Bucket",
      purpose: "Salaries & wages",
      allocated: 1200000,
      softLock: "Monthly",
      color: "blue",
    },
    {
      id: "tax",
      name: "Tax Bucket",
      purpose: "GST / TDS obligations",
      allocated: 850000,
      softLock: "Statutory",
      color: "amber",
    },
    {
      id: "vendor",
      name: "Vendor Bucket",
      purpose: "Supplier payments",
      allocated: 950000,
      softLock: "Operational",
      color: "green",
    },
    {
      id: "free",
      name: "Free Cash",
      purpose: "Available to spend",
      allocated: 1250000,
      softLock: undefined,
      color: "cyan",
    },
  ]);

  const totalAllocated = buckets.reduce((sum, b) => sum + b.allocated, 0);
  const unallocated = TOTAL_CASA_BALANCE - totalAllocated;

  const adjustBucket = (id: string, delta: number) => {
    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newAmount = Math.max(0, Math.min(TOTAL_CASA_BALANCE, b.allocated + delta));
          return { ...b, allocated: newAmount };
        }
        return b;
      })
    );
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-400",
          iconBg: "bg-blue-500/20",
          iconBorder: "border-blue-500/30",
        };
      case "amber":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          iconBg: "bg-amber-500/20",
          iconBorder: "border-amber-500/30",
        };
      case "green":
        return {
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          text: "text-green-400",
          iconBg: "bg-green-500/20",
          iconBorder: "border-green-500/30",
        };
      case "cyan":
        return {
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/30",
          text: "text-cyan-400",
          iconBg: "bg-cyan-500/20",
          iconBorder: "border-cyan-500/30",
        };
      default:
        return {
          bg: "bg-white/5",
          border: "border-white/10",
          text: "text-white/60",
          iconBg: "bg-white/10",
          iconBorder: "border-white/20",
        };
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
      ></div>

      {/* HEADER */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Cash Buckets</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Purpose-Based Cash Allocation
          </p>
        </div>
      </header>

      {/* PURPOSE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-4 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        <p className="text-sm text-white/80 leading-relaxed">
          Visually allocate cash for specific business purposes to prevent accidental overspending.
        </p>
      </motion.div>

      {/* SYSTEM NOTE */}
      <div className="mb-6 p-4 rounded-[24px] bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl">
        <p className="text-xs text-white/80">
          <span className="font-bold text-cyan-400">System Note:</span> Buckets are logical labels applied to a single current account. All funds remain in the same account. No physical segregation occurs.
        </p>
      </div>

      {/* TOTAL BALANCE STRIP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-6 p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2">
              Total CASA Balance
            </p>
            <p className="text-2xl font-serif text-white">
              ৳{(TOTAL_CASA_BALANCE / 100000).toFixed(1)}L
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2">
              Allocated
            </p>
            <p className="text-2xl font-serif text-white">
              ৳{(totalAllocated / 100000).toFixed(1)}L
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2">
              Unallocated
            </p>
            <p className="text-2xl font-serif text-cyan-400">
              ৳{(unallocated / 100000).toFixed(1)}L
            </p>
          </div>
        </div>
      </motion.div>

      {/* BUCKET CARDS */}
      <div className="space-y-4 mb-6">
        {buckets.map((bucket, idx) => {
          const colors = getColorClasses(bucket.color);
          const percentage = ((bucket.allocated / TOTAL_CASA_BALANCE) * 100).toFixed(1);

          return (
            <motion.div
              key={bucket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.1 + idx * 0.05 }}
              className={`p-5 rounded-[28px] border backdrop-blur-xl ${colors.bg} ${colors.border} shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colors.iconBg} border ${colors.iconBorder}`}
                  >
                    <FolderOpen size={20} className={colors.text} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-white mb-1">{bucket.name}</h3>
                    <p className="text-xs text-white/60">{bucket.purpose}</p>
                    {bucket.softLock && (
                      <div className="flex items-center gap-1 mt-2">
                        <Lock size={12} className="text-white/40" />
                        <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">
                          {bucket.softLock}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-serif text-white mb-1">
                    ৳{(bucket.allocated / 100000).toFixed(1)}L
                  </p>
                  <span className={`text-xs font-bold ${colors.text}`}>{percentage}%</span>
                </div>
              </div>

              {/* ALLOCATION CONTROLS */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustBucket(bucket.id, -50000)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                >
                  <Minus size={16} className="text-white/60" />
                </button>
                <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-full ${colors.bg} border-r-2 ${colors.border}`}
                  />
                </div>
                <button
                  onClick={() => adjustBucket(bucket.id, 50000)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                >
                  <Plus size={16} className="text-white/60" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* PSYCHOLOGICAL GUARDRAIL MESSAGE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.5 }}
        className="mb-8 p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        <p className="text-sm text-white/70 leading-relaxed text-center italic">
          "Buckets create intent. Money marked for a purpose is less likely to be spent impulsively — even when technically available."
        </p>
      </motion.div>
    </div>
  );
}