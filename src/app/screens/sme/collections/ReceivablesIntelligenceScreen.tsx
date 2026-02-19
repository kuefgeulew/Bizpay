import { ArrowLeft, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Zap, Gift, Users, QrCode, Link2, Building2, MessageSquare, Mail, Smartphone, Send } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  INVOICES,
  calculateTotalOutstanding,
  calculateDSO,
  getOverdueBuckets,
  getTopOverdueCustomers,
  generateNudgeSuggestions,
  generateDiscountSuggestions,
  formatCurrency,
  type CustomerARSummary,
  type NudgeSuggestion,
  type DiscountSuggestion,
} from "../../../data/receivablesData";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";
import {
  MESSAGE_TEMPLATES,
  getMessagesForCustomer,
  addSentMessage,
  type MessageChannel,
  type SentMessage,
} from "../../../mock/customerMessaging";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface ReceivablesIntelligenceScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  onCollectViaQR?: (invoiceRef: string, amount: string, customerName: string) => void;
  onCollectViaLink?: (invoiceRef: string, amount: string, customerName: string) => void;
}

export default function ReceivablesIntelligenceScreen({ onBack, onNavigate, onCollectViaQR, onCollectViaLink }: ReceivablesIntelligenceScreenProps) {
  const [sortBy, setSortBy] = useState<"amount" | "days">("amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedNudges, setExpandedNudges] = useState<Set<string>>(new Set());
  const [expandedDiscounts, setExpandedDiscounts] = useState<Set<string>>(new Set());
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());

  // Calculate metrics
  const totalOutstanding = calculateTotalOutstanding(INVOICES);
  const dso = calculateDSO(INVOICES);
  const overdueBuckets = getOverdueBuckets(INVOICES);
  const topCustomers = getTopOverdueCustomers(INVOICES, 8);
  const nudgeSuggestions = generateNudgeSuggestions(INVOICES);
  const discountSuggestions = generateDiscountSuggestions(INVOICES);

  // Sort customers
  const sortedCustomers = [...topCustomers].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "amount") {
      return multiplier * (a.totalOutstanding - b.totalOutstanding);
    } else {
      return multiplier * (a.oldestOverdueDays - b.oldestOverdueDays);
    }
  });

  // Log activity on mount
  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_ar_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "maker",
      action: "VIEW_AR_DASHBOARD" as any,
      category: "TRANSACTION",
      severity: "INFO",
      description: "Viewed Receivables Intelligence Dashboard",
      entityType: "ar_dashboard",
      metadata: {
        totalOutstanding,
        dso,
        overdueCount: INVOICES.filter(inv => inv.status === "Overdue").length,
      },
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  const toggleSort = (field: "amount" | "days") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const toggleNudgeExpand = (id: string) => {
    const newExpanded = new Set(expandedNudges);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNudges(newExpanded);
  };

  const toggleDiscountExpand = (id: string) => {
    const newExpanded = new Set(expandedDiscounts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDiscounts(newExpanded);
  };

  const toggleCustomerExpand = (id: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCustomers(newExpanded);
  };

  const getRiskBadge = (riskLevel: "Low" | "Medium" | "High") => {
    switch (riskLevel) {
      case "High":
        return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" };
      case "Medium":
        return { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" };
      case "Low":
        return { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" };
    }
  };

  const getPriorityBadge = (priority: "Low" | "Medium" | "High") => {
    switch (priority) {
      case "High":
        return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" };
      case "Medium":
        return { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" };
      case "Low":
        return { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" };
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

      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Receivables Intelligence</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            AR Command Center
          </p>
        </div>
      </header>

      {/* System Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6 p-4 rounded-[24px] bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
      >
        <p className="text-xs text-white/80">
          <span className="font-bold text-cyan-400">Live Feature:</span> All calculations use illustrative data. No emails or SMS will be sent. This demonstrates intelligence, not execution.
        </p>
      </motion.div>

      {/* AR Dashboard - Top Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          AR Dashboard
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Total Outstanding */}
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl">
            <p className="text-xs text-white/60 mb-2">Total Outstanding</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalOutstanding)}</p>
            <p className="text-[10px] text-white/40 mt-1">Across {INVOICES.filter(inv => inv.outstandingAmount > 0).length} invoices</p>
          </div>

          {/* Average DSO */}
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-xl">
            <p className="text-xs text-white/60 mb-2">Average DSO</p>
            <p className="text-2xl font-bold text-white">{dso} days</p>
            <p className="text-[10px] text-white/40 mt-1">Days Sales Outstanding</p>
          </div>
        </div>

        {/* Overdue Buckets */}
        <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
          <p className="text-xs text-white/60 mb-4">Overdue Aging Buckets</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">0–30 days</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(overdueBuckets.bucket0to30)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">31–60 days</span>
              <span className="text-sm font-semibold text-amber-400">{formatCurrency(overdueBuckets.bucket31to60)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">60+ days</span>
              <span className="text-sm font-semibold text-red-400">{formatCurrency(overdueBuckets.bucket60plus)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Overdue Customers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Top Overdue Customers
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => toggleSort("amount")}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${
                sortBy === "amount"
                  ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              Amount {sortBy === "amount" && (sortOrder === "desc" ? <ChevronDown className="inline" size={12} /> : <ChevronUp className="inline" size={12} />)}
            </button>
            <button
              onClick={() => toggleSort("days")}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${
                sortBy === "days"
                  ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              Delay {sortBy === "days" && (sortOrder === "desc" ? <ChevronDown className="inline" size={12} /> : <ChevronUp className="inline" size={12} />)}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {sortedCustomers.map((customer, i) => {
            const riskBadge = getRiskBadge(customer.riskLevel);
            const isExpanded = expandedCustomers.has(customer.customerId);

            return (
              <motion.div
                key={customer.customerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.15 + i * 0.03 }}
                className="p-4 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-1">{customer.customerName}</p>
                    <p className="text-xs text-white/60">{customer.invoiceCount} invoice{customer.invoiceCount > 1 ? "s" : ""} • {customer.percentOfTotalAR.toFixed(1)}% of total AR</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-[9px] font-bold rounded-full ${riskBadge.bg} ${riskBadge.text} border ${riskBadge.border}`}>
                      {customer.riskLevel}
                    </span>
                    <button
                      onClick={() => toggleCustomerExpand(customer.customerId)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-all"
                    >
                      {isExpanded ? <ChevronUp size={16} className="text-white/60" /> : <ChevronDown size={16} className="text-white/60" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Outstanding</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(customer.totalOutstanding)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Oldest Overdue</p>
                    <p className="text-lg font-bold text-amber-400">{customer.oldestOverdueDays}d</p>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={SPRING}
                    className="mt-3 pt-3 border-t border-white/10"
                  >
                    <p className="text-[10px] uppercase tracking-wide text-cyan-400/80 font-bold mb-3">
                      Collect Now
                    </p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {/* QR Code */}
                      <button
                        onClick={() => {
                          const inv = INVOICES.find(i => i.customerId === customer.customerId && i.outstandingAmount > 0);
                          if (onCollectViaQR && inv) {
                            onCollectViaQR(inv.invoiceId, String(inv.outstandingAmount), customer.customerName);
                          } else if (onNavigate) {
                            onNavigate('collect');
                          }
                        }}
                        className="p-3 rounded-[16px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all text-center active:scale-95"
                      >
                        <QrCode size={20} className="text-blue-400 mx-auto mb-2" />
                        <p className="text-[10px] text-white/80 font-semibold">Bangla QR</p>
                        <p className="text-[8px] text-white/50 mt-1">Invoice-bound</p>
                      </button>

                      {/* Payment Link */}
                      <button
                        onClick={() => {
                          const inv = INVOICES.find(i => i.customerId === customer.customerId && i.outstandingAmount > 0);
                          if (onCollectViaLink && inv) {
                            onCollectViaLink(inv.invoiceId, String(inv.outstandingAmount), customer.customerName);
                          } else if (onNavigate) {
                            onNavigate('collect');
                          }
                        }}
                        className="p-3 rounded-[16px] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-center active:scale-95"
                      >
                        <Link2 size={20} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-[10px] text-white/80 font-semibold">Pay Link</p>
                        <p className="text-[8px] text-white/50 mt-1">SMS / Email</p>
                      </button>

                      {/* Virtual Account */}
                      <button
                        onClick={() => {
                          if (onNavigate) onNavigate('vam');
                        }}
                        className="p-3 rounded-[16px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all text-center active:scale-95"
                      >
                        <Building2 size={20} className="text-purple-400 mx-auto mb-2" />
                        <p className="text-[10px] text-white/80 font-semibold">Virtual A/C</p>
                        <p className="text-[8px] text-white/50 mt-1">Auto-map</p>
                      </button>
                    </div>
                    <p className="text-[10px] text-white/40 text-center">
                      QR and Link pre-fill with {customer.customerName}'s top outstanding invoice
                    </p>
                    
                    {/* ═══ 7B: Invoice-Level Aging Breakdown ═══ */}
                    <CustomerInvoiceAging customerId={customer.customerId} />

                    {/* ═══ 7C: Customer Messaging ═══ */}
                    <CustomerMessaging customerId={customer.customerId} customerName={customer.customerName} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Auto-Nudge Engine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-cyan-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Auto-Nudge Suggestions ({nudgeSuggestions.length})
          </p>
        </div>

        <div className="space-y-3">
          {nudgeSuggestions.slice(0, 5).map((nudge, i) => {
            const priorityBadge = getPriorityBadge(nudge.priority);
            const isExpanded = expandedNudges.has(nudge.id);

            return (
              <motion.div
                key={nudge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.2 + i * 0.03 }}
                className="p-4 rounded-[24px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-xl"
              >
                <div className="flex items-start gap-3 mb-2">
                  <AlertCircle size={18} className="text-blue-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{nudge.customerName}</p>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${priorityBadge.bg} ${priorityBadge.text} border ${priorityBadge.border}`}>
                        {nudge.priority}
                      </span>
                    </div>
                    <p className="text-xs text-white/80">{nudge.message}</p>
                    <p className="text-[10px] text-cyan-400/80 mt-1 italic">{nudge.reason}</p>
                  </div>
                  <button
                    onClick={() => toggleNudgeExpand(nudge.id)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-all"
                  >
                    {isExpanded ? <ChevronUp size={16} className="text-white/60" /> : <ChevronDown size={16} className="text-white/60" />}
                  </button>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={SPRING}
                    className="mt-3 pt-3 border-t border-white/10"
                  >
                    <p className="text-[10px] uppercase tracking-wide text-white/50 mb-2">Recommended Action</p>
                    <p className="text-xs text-white/70 leading-relaxed">{nudge.recommendedAction}</p>
                    <p className="text-[10px] text-amber-400/80 mt-2 italic">System Note: No actual messages sent from this interface</p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {nudgeSuggestions.length > 5 && (
          <p className="text-xs text-white/50 text-center mt-3">
            +{nudgeSuggestions.length - 5} more suggestions available
          </p>
        )}
      </motion.div>

      {/* Early-Pay Discount Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Gift size={16} className="text-emerald-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Early-Pay Discount Opportunities ({discountSuggestions.length})
          </p>
        </div>

        {discountSuggestions.length === 0 ? (
          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] text-center">
            <p className="text-sm text-white/60">No discount opportunities with positive ROI at this time.</p>
            <p className="text-xs text-white/40 mt-2">Discounts are only suggested when working capital savings exceed discount cost.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {discountSuggestions.slice(0, 3).map((discount, i) => {
              const isExpanded = expandedDiscounts.has(discount.id);

              return (
                <motion.div
                  key={discount.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: 0.25 + i * 0.03 }}
                  className="p-4 rounded-[24px] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <Gift size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-white">{discount.customerName}</p>
                        <span className="px-2 py-1 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {discount.suggestedDiscount}% OFF
                        </span>
                      </div>
                      <p className="text-xs text-white/80">
                        Outstanding: {formatCurrency(discount.outstandingAmount)} • {discount.daysOverdue} days overdue
                      </p>
                    </div>
                    <button
                      onClick={() => toggleDiscountExpand(discount.id)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-all"
                    >
                      {isExpanded ? <ChevronUp size={16} className="text-white/60" /> : <ChevronDown size={16} className="text-white/60" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={SPRING}
                      className="mt-3 pt-3 border-t border-white/10"
                    >
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Discount Cost</p>
                          <p className="text-sm font-semibold text-red-400">৳{discount.discountCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Cash Benefit</p>
                          <p className="text-sm font-semibold text-emerald-400">৳{discount.cashInBenefit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Net Gain</p>
                          <p className="text-sm font-semibold text-cyan-400">৳{discount.netBenefit.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">{discount.rationale}</p>
                      <p className="text-[10px] text-amber-400/80 mt-2 italic">System Note: Configuration view only — no discount enforcement</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {discountSuggestions.length > 3 && (
          <p className="text-xs text-white/50 text-center mt-3">
            +{discountSuggestions.length - 3} more opportunities available
          </p>
        )}
      </motion.div>

      {/* Link to VAM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.25 }}
        className="p-5 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-[45px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <div className="flex items-center gap-3 mb-3">
          <Users size={20} className="text-purple-400" />
          <div>
            <p className="text-sm font-semibold text-white">Virtual Account Management</p>
            <p className="text-xs text-white/60">View which receivables are mapped to VAs</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (onNavigate) onNavigate('vam');
          }}
          className="text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
        >
          → Open VAM Dashboard
        </button>
      </motion.div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.3 }}
        className="mt-6 p-4 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl"
      >
        <p className="text-xs text-white/80 text-center">
          <span className="font-bold text-emerald-400">CASA Impact:</span> All features here accelerate cash inflow INTO current account. DSO reduction = faster working capital cycle.
        </p>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 7B — INVOICE-LEVEL AGING BREAKDOWN (per customer)
// ═══════════════════════════════════════════════════════

function CustomerInvoiceAging({ customerId }: { customerId: string }) {
  const customerInvoices = INVOICES.filter(
    (inv) => inv.customerId === customerId && inv.outstandingAmount > 0
  );

  if (customerInvoices.length === 0) return null;

  // Bucket invoices
  const bucket0_30 = customerInvoices.filter((inv) => inv.daysOverdue >= 0 && inv.daysOverdue <= 30);
  const bucket31_60 = customerInvoices.filter((inv) => inv.daysOverdue > 30 && inv.daysOverdue <= 60);
  const bucket60plus = customerInvoices.filter((inv) => inv.daysOverdue > 60);

  const totalCustomerOutstanding = customerInvoices.reduce((s, inv) => s + inv.outstandingAmount, 0);

  const agingBuckets = [
    { label: "0–30 days", invoices: bucket0_30, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "31–60 days", invoices: bucket31_60, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "60+ days", invoices: bucket60plus, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  ].filter((b) => b.invoices.length > 0);

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-[10px] uppercase tracking-wide text-cyan-400/80 font-bold mb-3">
        Invoice-Level Aging
      </p>
      <div className="space-y-2">
        {agingBuckets.map((bucket) => (
          <div key={bucket.label} className={`rounded-[16px] ${bucket.bg} ${bucket.border} border p-3`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${bucket.color}`}>
                {bucket.label}
              </span>
              <span className="text-[9px] text-white/30">
                {bucket.invoices.length} invoice{bucket.invoices.length > 1 ? "s" : ""}
              </span>
            </div>
            {bucket.invoices.map((inv) => {
              const pct = totalCustomerOutstanding > 0
                ? (inv.outstandingAmount / totalCustomerOutstanding) * 100
                : 0;
              return (
                <div key={inv.invoiceId} className="flex items-center justify-between py-1.5 border-t border-white/[0.04] first:border-0">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-white/60 font-mono">{inv.invoiceId}</span>
                    {inv.daysOverdue > 0 && (
                      <span className="text-[8px] text-white/25 ml-2">{inv.daysOverdue}d overdue</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bucket.color.replace("text-", "bg-")}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-white/60 w-16 text-right">
                      {formatCurrency(inv.outstandingAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between items-center pt-2 border-t border-white/[0.06]">
        <span className="text-[9px] text-white/25 uppercase tracking-wider">Customer Total</span>
        <span className="text-[11px] font-mono text-white/70">{formatCurrency(totalCustomerOutstanding)}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 7C — CUSTOMER MESSAGING (per customer)
// ═══════════════════════════════════════════════════════

function CustomerMessaging({ customerId, customerName }: { customerId: string; customerName: string }) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<MessageChannel | "">("");
  const [justSent, setJustSent] = useState(false);
  const [messages, setMessages] = useState<SentMessage[]>(() => getMessagesForCustomer(customerId));

  const channelIcon: Record<MessageChannel, React.ReactNode> = {
    SMS: <Smartphone size={12} />,
    WhatsApp: <MessageSquare size={12} />,
    Email: <Mail size={12} />,
  };

  const channelColor: Record<MessageChannel, string> = {
    SMS: "bg-blue-500/15 border-blue-500/25 text-blue-400",
    WhatsApp: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
    Email: "bg-purple-500/15 border-purple-500/25 text-purple-400",
  };

  const statusBadge: Record<string, string> = {
    Sent: "text-white/40",
    Delivered: "text-cyan-400/60",
    Read: "text-emerald-400/60",
  };

  function handleSend() {
    if (!selectedTemplate || !selectedChannel) return;
    const tpl = MESSAGE_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!tpl) return;

    const topInvoice = INVOICES.find((inv) => inv.customerId === customerId && inv.outstandingAmount > 0);

    const newMsg = addSentMessage({
      customerId,
      customerName,
      templateId: tpl.id,
      templateLabel: tpl.label,
      channel: selectedChannel as MessageChannel,
      invoiceRef: topInvoice?.invoiceId,
    });

    setMessages((prev) => [newMsg, ...prev]);
    setSelectedTemplate("");
    setSelectedChannel("");
    setJustSent(true);
    setTimeout(() => setJustSent(false), 2000);
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} className="text-cyan-400" />
        <p className="text-[10px] uppercase tracking-wide text-cyan-400/80 font-bold">
          Communication
        </p>
      </div>

      {/* Template + Channel Picker */}
      <div className="space-y-2 mb-3">
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[11px] outline-none appearance-none cursor-pointer"
        >
          <option value="" className="bg-slate-900">Select message template...</option>
          {MESSAGE_TEMPLATES.map((tpl) => (
            <option key={tpl.id} value={tpl.id} className="bg-slate-900">
              {tpl.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {(["SMS", "WhatsApp", "Email"] as MessageChannel[]).map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[10px] font-semibold transition-all ${
                selectedChannel === ch
                  ? channelColor[ch]
                  : "bg-white/[0.03] border-white/[0.06] text-white/30"
              }`}
            >
              {channelIcon[ch]}
              {ch}
            </button>
          ))}
        </div>

        <button
          onClick={handleSend}
          disabled={!selectedTemplate || !selectedChannel}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-cyan-500/25 disabled:opacity-25 disabled:pointer-events-none"
        >
          <Send size={12} />
          {justSent ? "Sent" : "Send Message"}
        </button>
      </div>

      {/* Message Log */}
      {messages.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-wider text-white/20 mb-2">
            Message Log ({messages.length})
          </p>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
            {messages.slice(0, 5).map((msg) => (
              <div
                key={msg.id}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/[0.02]"
              >
                <span className={`shrink-0 ${channelColor[msg.channel].split(" ").pop()}`}>
                  {channelIcon[msg.channel]}
                </span>
                <span className="text-[10px] text-white/50 flex-1 truncate">
                  {msg.templateLabel}
                </span>
                <span className={`text-[8px] ${statusBadge[msg.status]}`}>{msg.status}</span>
                <span className="text-[8px] text-white/15 shrink-0">
                  {new Date(msg.sentAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}