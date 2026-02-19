import { useState } from "react";
import { ArrowLeft, Filter, Search } from "lucide-react";
import { motion } from "motion/react";
import SystemDisclaimer from "../../../components/SystemDisclaimer";
import { getAllInvoices, type Invoice, type InvoiceStatus, type AgingBucket } from "../../../mock/invoiceEngine";

interface InvoiceListScreenProps {
  onBack: () => void;
  onSelectInvoice: (id: string) => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function InvoiceListScreen({ onBack, onSelectInvoice }: InvoiceListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
  const [filterAging, setFilterAging] = useState<AgingBucket | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const allInvoices = getAllInvoices();

  // Apply filters
  const filteredInvoices = allInvoices.filter((invoice) => {
    const matchesSearch =
      searchQuery === "" ||
      invoice.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    const matchesAging = filterAging === "all" || invoice.agingBucket === filterAging;

    return matchesSearch && matchesStatus && matchesAging;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-400/20">
            Paid
          </span>
        );
      case "partial":
        return (
          <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-400/20">
            Partial
          </span>
        );
      case "due":
        return (
          <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-400/20">
            Due
          </span>
        );
      case "overdue":
        return (
          <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-400/20">
            Overdue
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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
          <h1 className="text-3xl font-serif tracking-tight">Invoice List</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            {filteredInvoices.length} Invoices
          </p>
        </div>
      </header>

      {/* System Note */}
      <div className="mb-6 relative z-10">
        <SystemDisclaimer message="This module provides invoice management and tracking capabilities." />
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 space-y-3 relative z-10">
        {/* Search */}
        <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3">
            <Search size={18} className="text-white/40" />
            <input
              type="text"
              placeholder="Search by invoice or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              showFilters
                ? "bg-cyan-500/10 border-cyan-400/20 text-cyan-400"
                : "bg-white/[0.02] border-white/10 text-white/60"
            }`}
          >
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
          </button>

          {(filterStatus !== "all" || filterAging !== "all") && (
            <button
              onClick={() => {
                setFilterStatus("all");
                setFilterAging("all");
              }}
              className="px-4 py-2 rounded-full border bg-red-500/10 border-red-400/20 text-red-400 text-xs font-bold uppercase tracking-widest"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Status Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "paid", "partial", "due", "overdue"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      filterStatus === status
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                        : "bg-white/[0.02] text-white/60 border border-white/10"
                    }`}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Aging Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Aging</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "0-7", "8-30", "30+"] as const).map((aging) => (
                  <button
                    key={aging}
                    onClick={() => setFilterAging(aging)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      filterAging === aging
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                        : "bg-white/[0.02] text-white/60 border border-white/10"
                    }`}
                  >
                    {aging === "all" ? "All" : `${aging} days`}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Invoice List */}
      <div className="space-y-3 relative z-10">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">No invoices found</p>
          </div>
        ) : (
          filteredInvoices.map((invoice, idx) => (
            <motion.button
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: idx * 0.05 }}
              onClick={() => onSelectInvoice(invoice.id)}
              className="w-full group"
            >
              <div className="relative bg-white/[0.02] backdrop-blur-[45px] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98]">
                <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white">{invoice.invoiceNo}</p>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-xs text-white/60">{invoice.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-white">{formatCurrency(invoice.totalAmount)}</p>
                    {invoice.outstandingAmount > 0 && (
                      <p className="text-xs text-yellow-400">
                        Due: {formatCurrency(invoice.outstandingAmount)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Issued: {formatDate(invoice.invoiceDate)}</span>
                  <span className={invoice.status === "overdue" ? "text-red-400" : ""}>
                    Due: {formatDate(invoice.dueDate)}
                  </span>
                </div>

                {invoice.status === "overdue" && invoice.daysOverdue > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
                    <span className="font-bold">{invoice.daysOverdue} days overdue</span>
                  </div>
                )}
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}