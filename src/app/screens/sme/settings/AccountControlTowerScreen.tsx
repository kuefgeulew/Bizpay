import { ArrowLeft, Building2, Eye, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";
import {
  ACCOUNTS,
  BALANCE_UPDATES,
  type BusinessAccount,
  type BalanceUpdateEntry,
} from "../../../data/controlTower.mock";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface AccountControlTowerScreenProps {
  onBack: () => void;
}

export default function AccountControlTowerScreen({ onBack }: AccountControlTowerScreenProps) {
  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_account_tower_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_ACCOUNT_CONTROL_TOWER" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Viewed Account Control Tower",
      entityType: "account_control_tower",
      metadata: {},
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  const primaryAccount = ACCOUNTS.find((a) => a.category === "primary")!;
  const internalAccounts = ACCOUNTS.filter((a) => a.category === "internal");
  const externalAccounts = ACCOUNTS.filter((a) => a.category === "external");
  const totalVisible = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const primaryShare = Math.round((primaryAccount.balance / totalVisible) * 100);
  const totalAccountCount = ACCOUNTS.length;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(1)}L`;
    return `৳${(amount / 1000).toFixed(0)}K`;
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
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-serif tracking-tight">Account Control Tower</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Multi-Account Visibility
          </p>
        </div>
      </header>

      {/* ── Section 1: Primary BizPay CASA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Primary Current Account
        </p>

        <div className="p-5 rounded-[28px] bg-gradient-to-br from-cyan-500/[0.08] to-cyan-600/[0.04] border border-cyan-500/25 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(6,182,212,0.2)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Building2 size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-lg font-serif text-white">{primaryAccount.nickname}</p>
                  <p className="text-[10px] text-white/50">
                    {primaryAccount.bank} · {primaryAccount.branch}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-serif text-white">{formatCurrency(primaryAccount.balance)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Other BizPay Accounts ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.06 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Other BizPay Accounts
        </p>

        <div className="space-y-3">
          {internalAccounts.map((account, i) => (
            <AccountRow key={account.id} account={account} index={i} delay={0.1} formatCurrency={formatCurrency} />
          ))}
        </div>
      </motion.div>

      {/* ── Section 3: External Accounts ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.18 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            External Accounts
          </p>
          <span className="px-2 py-0.5 text-[7px] font-bold uppercase tracking-wider rounded-full bg-white/5 text-white/30 border border-white/10">
            Read-Only
          </span>
        </div>

        <div className="space-y-3">
          {externalAccounts.map((account, i) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.22 + i * 0.04 }}
              className="p-4 rounded-[24px] bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-white/50">{account.nickname}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">
                    {account.bank} · {account.accountNumber}
                  </p>
                </div>
                <p className="text-lg font-serif text-white/40">{formatCurrency(account.balance)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Section 4: Fragmentation Indicator ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.28 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Distribution
        </p>

        <div className="p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
              <Eye size={16} className="text-cyan-400/70" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
              Fragmentation
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Accounts visible</p>
              <p className="text-sm text-white/80 font-serif">{totalAccountCount}</p>
            </div>

            <div className="border-t border-white/5"></div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Cash distributed across</p>
              <p className="text-sm text-white/80 font-serif">{totalAccountCount} accounts</p>
            </div>

            <div className="border-t border-white/5"></div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Primary account holds</p>
              <p className="text-sm text-cyan-400 font-serif">{primaryShare}% of total visible balance</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 5: Balance Update History ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.34 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Recent Balance Updates
        </p>

        <div className="space-y-2">
          {BALANCE_UPDATES.map((entry, i) => (
            <BalanceUpdateRow key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </motion.div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.42 }}
        className="p-4 rounded-[24px] bg-cyan-500/[0.04] border border-cyan-500/10 backdrop-blur-xl"
      >
        <p className="text-xs text-white/50 text-center">
          This screen provides visibility only. No account actions or fund movements are performed here.
        </p>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────── */

function AccountRow({
  account,
  index,
  delay,
  formatCurrency,
}: {
  account: BusinessAccount;
  index: number;
  delay: number;
  formatCurrency: (n: number) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay: delay + index * 0.04 }}
      className="p-4 rounded-[24px] bg-gradient-to-br from-white/[0.04] to-white/[0.015] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-white/80">{account.nickname}</p>
            {account.activityStatus && (
              <span
                className={`px-2 py-0.5 text-[7px] font-bold uppercase tracking-wider rounded-full border ${
                  account.activityStatus === "active"
                    ? "bg-cyan-500/10 text-cyan-400/60 border-cyan-500/15"
                    : "bg-white/5 text-white/25 border-white/10"
                }`}
              >
                {account.activityStatus}
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/35">
            {account.bank}
            {account.branch ? ` · ${account.branch}` : ""}
            {account.entity ? ` · ${account.entity}` : ""}
          </p>
        </div>
        <p className="text-lg font-serif text-white/80">{formatCurrency(account.balance)}</p>
      </div>
    </motion.div>
  );
}

function BalanceUpdateRow({ entry, index }: { entry: BalanceUpdateEntry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay: 0.38 + index * 0.03 }}
      className="p-4 rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-cyan-500/[0.06] border border-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <Clock size={13} className="text-cyan-400/50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/70">{entry.accountLabel}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[9px] text-white/30">{entry.timestamp}</p>
            <p className="text-[9px] text-white/20">{entry.source}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}