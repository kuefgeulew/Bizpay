import { ArrowLeft, FileText, Building2, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import SystemDisclaimer from "../../../components/SystemDisclaimer";
import { getInvoiceById } from "../../../mock/invoiceEngine";

interface InvoiceDetailScreenProps {
  invoiceId: string;
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function InvoiceDetailScreen({ invoiceId, onBack }: InvoiceDetailScreenProps) {
  const invoice = getInvoiceById(invoiceId);

  if (!invoice) {
    return (
      <div className="relative h-full text-white px-8 pt-10 flex items-center justify-center">
        <p className="text-white/60">Invoice not found</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  const getStatusBadge = () => {
    switch (invoice.status) {
      case "paid":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-400/20">
            ✓ Fully Paid
          </span>
        );
      case "partial":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-400/20">
            Partially Paid
          </span>
        );
      case "due":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-400/20">
            Payment Due
          </span>
        );
      case "overdue":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-400/20">
            ⚠ Overdue
          </span>
        );
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
        <div className="flex-1">
          <h1 className="text-3xl font-serif tracking-tight">{invoice.invoiceNo}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Invoice Details
          </p>
        </div>
      </header>

      {/* System Note */}
      <div className="mb-6 relative z-10">
        <SystemDisclaimer message="This module provides invoice management and tracking capabilities." />
      </div>

      {/* Status Badge */}
      <div className="mb-6 flex justify-center">
        {getStatusBadge()}
      </div>

      {/* Invoice Header Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 mb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
        
        <div className="space-y-4">
          {/* Seller */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">From (Seller)</p>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                <Building2 size={16} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">BizPay Enterprises</p>
                <p className="text-xs text-white/60">GSTIN: {invoice.sellerGSTIN}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Buyer */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">To (Buyer)</p>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/20">
                <Building2 size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{invoice.clientName}</p>
                <p className="text-xs text-white/60">GSTIN: {invoice.clientGSTIN}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={16} className="text-cyan-400" />
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Invoice Date</p>
          </div>
          <p className="text-sm font-bold text-white">{formatDate(invoice.invoiceDate)}</p>
        </div>

        <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-center gap-3 mb-2">
            <Clock size={16} className={invoice.status === "overdue" ? "text-red-400" : "text-yellow-400"} />
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Due Date</p>
          </div>
          <p className={`text-sm font-bold ${invoice.status === "overdue" ? "text-red-400" : "text-white"}`}>
            {formatDate(invoice.dueDate)}
          </p>
          {invoice.status === "overdue" && (
            <p className="text-xs text-red-400 mt-1">{invoice.daysOverdue} days overdue</p>
          )}
        </div>
      </motion.div>

      {/* Line Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 mb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Line Items</h3>
        
        <div className="space-y-4">
          {invoice.lineItems.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-white font-medium">{item.description}</p>
              </div>
              <div className="flex justify-between text-xs text-white/60">
                <span>{item.quantity} × {formatCurrency(item.rate)}</span>
                <span className="font-bold text-white">{formatCurrency(item.amount)}</span>
              </div>
              {item !== invoice.lineItems[invoice.lineItems.length - 1] && (
                <div className="h-px bg-white/10 mt-3" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tax Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.25 }}
        className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 mb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Tax Breakdown</h3>
        
        <div className="space-y-3">
          {invoice.cgst > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/60">CGST</span>
              <span className="font-bold text-white">{formatCurrency(invoice.cgst)}</span>
            </div>
          )}
          {invoice.sgst > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/60">SGST</span>
              <span className="font-bold text-white">{formatCurrency(invoice.sgst)}</span>
            </div>
          )}
          {invoice.igst > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/60">IGST</span>
              <span className="font-bold text-white">{formatCurrency(invoice.igst)}</span>
            </div>
          )}
          
          <div className="h-px bg-white/10 my-3" />
          
          <div className="flex justify-between text-base">
            <span className="font-bold text-white">Total Amount</span>
            <span className="font-bold text-cyan-400 text-lg">{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>
      </motion.div>

      {/* Payment History */}
      {invoice.paymentHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.3 }}
          className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-6 mb-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-green-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Payment History</h3>
          </div>
          
          <div className="space-y-3">
            {invoice.paymentHistory.map((payment, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-white">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-white/60">{payment.method} • {payment.reference}</p>
                </div>
                <p className="text-xs text-white/40">{formatDate(payment.date)}</p>
              </div>
            ))}
          </div>

          {invoice.outstandingAmount > 0 && (
            <>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between">
                <span className="text-sm font-bold text-yellow-400">Outstanding</span>
                <span className="text-sm font-bold text-yellow-400">{formatCurrency(invoice.outstandingAmount)}</span>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Linked Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.35 }}
        className="relative bg-white/[0.02] backdrop-blur-[45px] border border-cyan-500/20 rounded-[28px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
        <h3 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-widest">🔗 Linked Integration</h3>
        
        <div className="space-y-2 text-xs text-white/60">
          <p>✓ VAM Client ID: <span className="text-white font-mono">{invoice.vamClientId}</span></p>
          <p>✓ Timeline Event: <span className="text-white font-mono">{invoice.timelineEventId}</span></p>
          <p>✓ Activity Log: <span className="text-white">System entries created</span></p>
        </div>
      </motion.div>
    </div>
  );
}