import { ArrowLeft, Vault, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface TaxVaultScreenProps {
  onBack: () => void;
}

export default function TaxVaultScreen({ onBack }: TaxVaultScreenProps) {
  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_tax_vault_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_TAX_VAULT" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Viewed Tax Vault (statutory cash parking)",
      entityType: "tax_vault",
      metadata: {},
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  // Static mock values
  const totalParked = 850000; // ৳8.5L
  const upcomingDue = 520000; // ৳5.2L
  const excessBuffer = totalParked - upcomingDue; // ৳3.3L

  const statutorySections = [
    {
      id: "gst",
      title: "GST / VAT",
      parked: 350000, // ৳3.5L
      nextDue: "28 Feb 2026",
      status: "On Track",
      color: "cyan",
    },
    {
      id: "tds",
      title: "TDS",
      parked: 170000, // ৳1.7L
      nextDue: "7 Mar 2026",
      status: "On Track",
      color: "blue",
    },
    {
      id: "other",
      title: "Other Statutory",
      parked: 330000, // ৳3.3L
      description: "Miscellaneous statutory obligations",
      nextDue: "15 Mar 2026",
      status: "On Track",
      color: "green",
    },
  ];

  return (
    <div className="relative h-full text-white px-8 pt-10 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 1️⃣ HEADER */}
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Tax Vault</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Statutory Cash Parking
          </p>
        </div>
      </header>

      {/* Purpose Line */}
      <p className="text-sm text-white/70 leading-relaxed mb-6 px-1">
        Set aside tax obligations gradually so statutory payments never disrupt operating cash.
      </p>

      {/* 2️⃣ DEMO SAFETY BANNER (REQUIRED) */}
      <div className="mb-6 p-4 rounded-[24px] bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl">
        <p className="text-xs text-white/80">
          <span className="font-bold text-cyan-400">System Note:</span> Tax Vault is a logical parking layer.
          Tax calculation, deduction, and payment are handled by the integrated tax engine.
        </p>
      </div>

      {/* 3️⃣ VAULT BALANCE CARD (TOP) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6"
      >
        <div className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]">
          {/* Inner rim light */}
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
              <Vault size={24} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Total Parked in Tax Vault</h3>
              <p className="text-xs text-white/60">Accumulated for statutory compliance</p>
            </div>
          </div>

          <div className="space-y-4 mt-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Total Parked Amount:</span>
              <span className="text-2xl font-bold text-white">৳{(totalParked / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Upcoming Statutory Due (Next 30 Days):</span>
              <span className="text-lg font-bold text-orange-400">৳{(upcomingDue / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Excess Parked (Safe Buffer):</span>
              <span className="text-lg font-bold text-green-400">৳{(excessBuffer / 100000).toFixed(1)}L</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4️⃣ STATUTORY BREAKDOWN CARDS */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 px-1">
          Statutory Breakdown
        </h2>
        <div className="space-y-4">
          {statutorySections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.1 + idx * 0.05 }}
            >
              <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]">
                {/* Inner rim light */}
                <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{section.title}</h3>
                    {section.description && (
                      <p className="text-xs text-white/60">{section.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-400/20">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-xs font-bold text-green-400">{section.status}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Parked Amount:</span>
                    <span className="text-xl font-bold text-white">৳{(section.parked / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Next Due Date:</span>
                    <span className="text-sm font-bold text-cyan-400">{section.nextDue}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 5️⃣ PARKING LOGIC EXPLANATION (VISUAL) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.3 }}
        className="mb-6"
      >
        <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[24px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 rounded-[24px] border border-white/5 pointer-events-none" />
          <h3 className="text-sm font-bold text-white/90 mb-2">How Parking Works</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Amounts shown here represent gradual parking from inflows. Parking early prevents last-minute cash
            stress.
          </p>
        </div>
      </motion.div>

      {/* 6️⃣ ONE-TAP PAYMENT CTA (DISABLED) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.35 }}
        className="mb-6"
      >
        <button
          disabled
          className="w-full py-4 px-6 rounded-[24px] bg-white/5 border border-white/10 text-white/40 font-bold text-base cursor-not-allowed backdrop-blur-xl"
        >
          Pay Statutory Dues
        </button>
        <p className="text-xs text-white/50 text-center mt-2">
          Enabled in production after bank & tax system integration.
        </p>
      </motion.div>

      {/* 7️⃣ BEHAVIORAL GUARDRAIL (BOTTOM) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.4 }}
        className="mb-8"
      >
        <div className="relative bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-[45px] border border-white/10 rounded-[24px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 rounded-[24px] border border-white/5 pointer-events-none" />
          <h3 className="text-sm font-bold text-white/90 mb-2">Behavioral Discipline</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Money marked for tax is rarely spent — even when technically available. This preserves discipline and
            protects operating cash.
          </p>
        </div>
      </motion.div>
    </div>
  );
}