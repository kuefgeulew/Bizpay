import { ArrowLeft, FileText, TrendingUp, AlertCircle, DollarSign, FilePlus } from "lucide-react";
import { motion } from "motion/react";
import SystemDisclaimer from "../../../components/SystemDisclaimer";
import { getInvoiceKPIs } from "../../../mock/invoiceEngine";
import type { InvoiceView } from "./InvoicesHub";

interface InvoiceOverviewScreenProps {
  onBack: () => void;
  onNavigate: (view: InvoiceView) => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function InvoiceOverviewScreen({ onBack, onNavigate }: InvoiceOverviewScreenProps) {
  const kpis = getInvoiceKPIs();

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 1000).toFixed(0)}K`;
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
          <h1 className="text-3xl font-serif tracking-tight">Invoices & Outstanding</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Receivables & Aging Tracker
          </p>
        </div>
      </header>

      {/* System Note */}
      <div className="mb-6 relative z-10">
        <SystemDisclaimer message="This module provides invoice management and tracking capabilities." />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        {/* Total Invoiced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
              <FileText size={18} className="text-cyan-400" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Feb 2025</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{formatCurrency(kpis.totalInvoiced)}</p>
          <p className="text-xs text-white/60">Total Invoiced</p>
        </motion.div>

        {/* Paid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.15 }}
          className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-green-500/10 border border-green-400/20">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-green-400/60 font-bold">✓ PAID</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{formatCurrency(kpis.totalPaid)}</p>
          <p className="text-xs text-white/60">Received (All Time)</p>
        </motion.div>

        {/* Outstanding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.2 }}
          className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
              <DollarSign size={18} className="text-yellow-400" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-yellow-400/60 font-bold">PENDING</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{formatCurrency(kpis.totalOutstanding)}</p>
          <p className="text-xs text-white/60">Outstanding</p>
        </motion.div>

        {/* Overdue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.25 }}
          className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-400/20">
              <AlertCircle size={18} className="text-red-400" />
            </div>
            <span className="text-[9px] uppercase tracking-widest text-red-400/60 font-bold">⚠ RISK</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{formatCurrency(kpis.totalOverdue)}</p>
          <p className="text-xs text-white/60">Overdue</p>
        </motion.div>
      </div>

      {/* Aging Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.3 }}
        className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 mb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Aging Summary</h3>
        
        <div className="space-y-3">
          {/* 0-7 Days */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-white/80">0–7 Days</span>
            </div>
            <span className="text-sm font-bold text-white">{kpis.aging["0-7"]} invoices</span>
          </div>

          {/* 8-30 Days */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-white/80">8–30 Days</span>
            </div>
            <span className="text-sm font-bold text-white">{kpis.aging["8-30"]} invoices</span>
          </div>

          {/* 30+ Days */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-white/80">30+ Days</span>
            </div>
            <span className="text-sm font-bold text-red-400">{kpis.aging["30+"]} invoices</span>
          </div>
        </div>
      </motion.div>

      {/* At-Risk Clients */}
      {kpis.atRiskClients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.35 }}
          className="relative bg-white/[0.02] backdrop-blur-[45px] border border-red-500/20 rounded-[28px] p-6 mb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-red-400" />
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">High Risk Clients</h3>
          </div>
          
          <div className="space-y-3">
            {kpis.atRiskClients.map((client) => (
              <div key={client.clientId} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{client.clientName}</p>
                  <p className="text-xs text-white/60">{client.invoiceCount} overdue invoice(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-400">{formatCurrency(client.totalDue)}</p>
                  <p className="text-xs text-white/40">30+ days</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4 relative z-10">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.38 }}
          onClick={() => onNavigate("create")}
          className="w-full group"
        >
          <div className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-[45px] border border-cyan-500/30 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(6,182,212,0.2)] transition-all duration-300 hover:bg-cyan-500/15 hover:border-cyan-500/50 active:scale-[0.98]">
            <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/30">
                  <FilePlus size={20} className="text-cyan-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-white mb-1">Create New Invoice</h3>
                  <p className="text-xs text-cyan-200/60">GST-compliant tax invoice</p>
                </div>
              </div>
              <div className="text-white/40 group-hover:text-white/80 transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.4 }}
          onClick={() => onNavigate("list")}
          className="w-full group"
        >
          <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98]">
            <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
                  <FileText size={20} className="text-cyan-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-white mb-1">View All Invoices</h3>
                  <p className="text-xs text-white/60">Browse & filter invoice list</p>
                </div>
              </div>
              <div className="text-white/40 group-hover:text-white/80 transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.45 }}
          onClick={() => onNavigate("outstanding")}
          className="w-full group"
        >
          <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98]">
            <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-400/20">
                  <DollarSign size={20} className="text-yellow-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-white mb-1">Outstanding Tracker</h3>
                  <p className="text-xs text-white/60">Client-wise receivables & risk</p>
                </div>
              </div>
              <div className="text-white/40 group-hover:text-white/80 transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}