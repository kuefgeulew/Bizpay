import { ArrowLeft, AlertTriangle, TrendingUp, QrCode, Link2 } from "lucide-react";
import { motion } from "motion/react";
import SystemDisclaimer from "../../../components/SystemDisclaimer";
import { getClientOutstandingSummary, getInvoiceKPIs } from "../../../mock/invoiceEngine";

interface OutstandingTrackerScreenProps {
  onBack: () => void;
  onSelectClient: (clientId: string) => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

/* ── Last collection attempt data (read-only bridge) ── */
const LAST_COLLECTION_ATTEMPT: Record<string, { method: "Bangla QR" | "Payment Link"; date: string; status: string }> = {
  "CLI-002": { method: "Payment Link", date: "14 Feb 2026", status: "Active" },
  "CLI-003": { method: "Bangla QR", date: "12 Feb 2026", status: "Settled" },
  "CLI-004": { method: "Payment Link", date: "10 Feb 2026", status: "Expired" },
};

export default function OutstandingTrackerScreen({ onBack, onSelectClient }: OutstandingTrackerScreenProps) {
  const clients = getClientOutstandingSummary();
  const kpis = getInvoiceKPIs();

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const getRiskBadge = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return (
          <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-400/20">
            Low Risk
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-400/20">
            Medium
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-400/20">
            High Risk
          </span>
        );
    }
  };

  const getAgingColor = (bucket: string) => {
    switch (bucket) {
      case "0-7":
        return "bg-green-500";
      case "8-30":
        return "bg-yellow-500";
      case "30+":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAgingWidth = (bucket: string) => {
    switch (bucket) {
      case "0-7":
        return "25%";
      case "8-30":
        return "60%";
      case "30+":
        return "100%";
      default:
        return "0%";
    }
  };

  return (
    <div className="relative h-full text-white px-8 pt-10 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Outstanding Tracker</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Client-Wise Receivables & Risk
          </p>
        </div>
      </header>

      {/* System Note */}
      <div className="mb-6 relative z-10">
        <SystemDisclaimer message="This module provides invoice management and tracking capabilities." />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        {/* Total Outstanding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
              <TrendingUp size={18} className="text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{formatCurrency(kpis.totalOutstanding)}</p>
          <p className="text-xs text-white/60">Total Outstanding</p>
        </motion.div>

        {/* Overdue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.15 }}
          className="relative bg-white/[0.02] backdrop-blur-[45px] border border-red-500/20 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-400/20">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-red-400/60 font-bold">⚠ RISK</span>
          </div>
          <p className="text-2xl font-bold text-red-400 mb-1">{formatCurrency(kpis.totalOverdue)}</p>
          <p className="text-xs text-white/60">Overdue Amount</p>
        </motion.div>
      </div>

      {/* Insight Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="relative bg-gradient-to-r from-cyan-500/10 to-blue-600/10 backdrop-blur-[45px] border border-cyan-500/20 rounded-[28px] p-5 mb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
        <p className="text-sm text-white/80 leading-relaxed">
          💡 <span className="font-bold text-cyan-400">System Insight:</span> "BizPay doesn't just show balances — it shows who owes you money, how long they've owed it, and where risk is building."
        </p>
      </motion.div>

      {/* Client Outstanding Table */}
      <div className="space-y-3 relative z-10">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Client-Wise Outstanding</h3>

        {clients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">No outstanding receivables</p>
          </div>
        ) : (
          clients.map((client, idx) => (
            <motion.button
              key={client.clientId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.25 + idx * 0.05 }}
              onClick={() => onSelectClient(client.clientId)}
              className="w-full group"
            >
              <div className={`relative backdrop-blur-[45px] border rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98] ${
                client.riskLevel === "high"
                  ? "bg-red-500/[0.02] border-red-500/20"
                  : client.riskLevel === "medium"
                  ? "bg-yellow-500/[0.02] border-yellow-500/20"
                  : "bg-white/[0.02] border-white/10"
              }`}>
                <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
                
                {/* Client Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white">{client.clientName}</p>
                      {getRiskBadge(client.riskLevel)}
                    </div>
                    <p className="text-xs text-white/60">{client.invoiceCount} outstanding invoice(s)</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-bold ${
                      client.riskLevel === "high" ? "text-red-400" : "text-white"
                    }`}>
                      {formatCurrency(client.totalDue)}
                    </p>
                  </div>
                </div>

                {/* Aging Bucket */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Oldest Due: {formatDate(client.oldestDueDate)}</span>
                    <span className={`font-bold ${
                      client.agingBucket === "30+"
                        ? "text-red-400"
                        : client.agingBucket === "8-30"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}>
                      {client.agingBucket === "0-7"
                        ? "0–7 days"
                        : client.agingBucket === "8-30"
                        ? "8–30 days"
                        : "30+ days"}
                    </span>
                  </div>

                  {/* Visual Aging Bar */}
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getAgingColor(client.agingBucket)} transition-all duration-500`}
                      style={{ width: getAgingWidth(client.agingBucket) }}
                    />
                  </div>
                </div>

                {/* Last Collection Attempt */}
                {LAST_COLLECTION_ATTEMPT[client.clientId] && (() => {
                  const attempt = LAST_COLLECTION_ATTEMPT[client.clientId];
                  return (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] text-white/50">
                      {attempt.method === "Bangla QR" ? (
                        <QrCode size={12} className="text-blue-400/70" />
                      ) : (
                        <Link2 size={12} className="text-emerald-400/70" />
                      )}
                      <span>Last collection: <span className="text-white/70 font-semibold">{attempt.method}</span> — {attempt.date}</span>
                      <span className={`ml-auto px-1.5 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-wider ${
                        attempt.status === "Settled"
                          ? "bg-emerald-500/15 text-emerald-400/80 border border-emerald-500/20"
                          : attempt.status === "Active"
                          ? "bg-cyan-500/15 text-cyan-400/80 border border-cyan-500/20"
                          : "bg-white/5 text-white/40 border border-white/10"
                      }`}>
                        {attempt.status}
                      </span>
                    </div>
                  );
                })()}

                {/* High Risk Warning */}
                {client.riskLevel === "high" && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-red-400">
                    <AlertTriangle size={14} />
                    <span className="font-bold">Action Required: 30+ days overdue</span>
                  </div>
                )}
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Risk Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.5 }}
        className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 mt-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Risk Levels</h3>
        
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div>
              <span className="text-white font-bold">Low Risk:</span>
              <span className="text-white/60 ml-1">0–7 days outstanding</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div>
              <span className="text-white font-bold">Medium Risk:</span>
              <span className="text-white/60 ml-1">8–30 days outstanding</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div>
              <span className="text-white font-bold">High Risk:</span>
              <span className="text-white/60 ml-1">30+ days overdue — requires escalation</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}