import { ArrowLeft, Link2, MessageSquare, Mail, Share2, Plus, Copy, ExternalLink, CheckCircle, Clock, XCircle, MousePointerClick, RefreshCw, Hash, Calendar, Ban } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback, useEffect } from "react";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

/* ── Types ── */
type LinkStatus = "active" | "paid" | "expired" | "cancelled";

interface PaymentLink {
  id: string;
  description: string;
  invoiceRef: string | null;
  amount: number;
  status: LinkStatus;
  created: string;
  expiresAt: string;
  clicks: number;
  paidAt: string | null;
  payerRef: string | null;
  shareChannel: string | null;
}

/* ── Seed Data ── */
const INITIAL_LINKS: PaymentLink[] = [
  {
    id: "PL-001",
    description: "Invoice #INV-2026-044",
    invoiceRef: "INV-2026-044",
    amount: 125000,
    status: "active",
    created: "15 Feb 2026",
    expiresAt: "22 Feb 2026",
    clicks: 3,
    paidAt: null,
    payerRef: null,
    shareChannel: "WhatsApp",
  },
  {
    id: "PL-002",
    description: "Q1 Subscription Renewal",
    invoiceRef: "SUB-Q1-2026",
    amount: 45000,
    status: "paid",
    created: "12 Feb 2026",
    expiresAt: "19 Feb 2026",
    clicks: 1,
    paidAt: "14 Feb 2026, 2:18 PM",
    payerRef: "Bengal Logistics — BL-FEB-019",
    shareChannel: "Email",
  },
  {
    id: "PL-003",
    description: "Maintenance Fee — Feb",
    invoiceRef: null,
    amount: 8500,
    status: "expired",
    created: "01 Feb 2026",
    expiresAt: "08 Feb 2026",
    clicks: 0,
    paidAt: null,
    payerRef: null,
    shareChannel: "SMS",
  },
  {
    id: "PL-004",
    description: "Workshop Parts Supply",
    invoiceRef: "INV-2026-038",
    amount: 67200,
    status: "paid",
    created: "08 Feb 2026",
    expiresAt: "15 Feb 2026",
    clicks: 2,
    paidAt: "10 Feb 2026, 11:45 AM",
    payerRef: "Chittagong Parts Ltd. — CPL-0288",
    shareChannel: "WhatsApp",
  },
  {
    id: "PL-005",
    description: "Deposit — Event Space",
    invoiceRef: null,
    amount: 30000,
    status: "cancelled",
    created: "05 Feb 2026",
    expiresAt: "12 Feb 2026",
    clicks: 0,
    paidAt: null,
    payerRef: null,
    shareChannel: null,
  },
  {
    id: "PL-006",
    description: "Fabric Consignment #7",
    invoiceRef: "INV-2026-041",
    amount: 210000,
    status: "active",
    created: "16 Feb 2026",
    expiresAt: "23 Feb 2026",
    clicks: 5,
    paidAt: null,
    payerRef: null,
    shareChannel: "WhatsApp",
  },
  {
    id: "PL-007",
    description: "Transport Service — Jan",
    invoiceRef: "INV-2026-029",
    amount: 18200,
    status: "paid",
    created: "28 Jan 2026",
    expiresAt: "04 Feb 2026",
    clicks: 1,
    paidAt: "30 Jan 2026, 9:32 AM",
    payerRef: "Narayanganj Exports — NE-INV-73",
    shareChannel: "SMS",
  },
];

const formatCurrency = (v: number) =>
  `৳${v.toLocaleString("en-BD")}`;

const STATUS_CONFIG: Record<LinkStatus, { label: string; bg: string; text: string; border: string; Icon: typeof CheckCircle }> = {
  active: { label: "Active", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", Icon: CheckCircle },
  paid: { label: "Paid", bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30", Icon: CheckCircle },
  expired: { label: "Expired", bg: "bg-white/10", text: "text-white/40", border: "border-white/20", Icon: Clock },
  cancelled: { label: "Cancelled", bg: "bg-red-500/15", text: "text-red-400/70", border: "border-red-500/25", Icon: XCircle },
};

interface PaymentLinksScreenProps {
  onBack: () => void;
  prefillAmount?: string;
  prefillDescription?: string;
  prefillInvoiceRef?: string;
  onNavigateToReceivables?: () => void;
}

export default function PaymentLinksScreen({ onBack, prefillAmount, prefillDescription, prefillInvoiceRef, onNavigateToReceivables }: PaymentLinksScreenProps) {
  const [view, setView] = useState<"list" | "create">(prefillAmount || prefillInvoiceRef ? "create" : "list");
  const [links, setLinks] = useState<PaymentLink[]>(INITIAL_LINKS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create form state
  const [amount, setAmount] = useState(prefillAmount || "");
  const [description, setDescription] = useState(prefillDescription || "");
  const [invoiceRef, setInvoiceRef] = useState(prefillInvoiceRef || "");
  const [expiryDays, setExpiryDays] = useState<7 | 14 | 30>(7);
  const [shareChannel, setShareChannel] = useState<string | null>(null);

  // Auto-open create form when prefill arrives
  useEffect(() => {
    if (prefillAmount || prefillInvoiceRef) {
      setView("create");
      if (prefillAmount) setAmount(prefillAmount);
      if (prefillDescription) setDescription(prefillDescription);
      if (prefillInvoiceRef) setInvoiceRef(prefillInvoiceRef);
    }
  }, [prefillAmount, prefillDescription, prefillInvoiceRef]);

  const handleCreate = useCallback(() => {
    if (!amount || !description) return;
    const now = new Date();
    const expires = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    const newLink: PaymentLink = {
      id: `PL-${(links.length + 1).toString().padStart(3, "0")}`,
      description,
      invoiceRef: invoiceRef || null,
      amount: Number(amount),
      status: "active",
      created: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      expiresAt: expires.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      clicks: 0,
      paidAt: null,
      payerRef: null,
      shareChannel: shareChannel,
    };
    setLinks([newLink, ...links]);
    setAmount("");
    setDescription("");
    setInvoiceRef("");
    setExpiryDays(7);
    setShareChannel(null);
    setView("list");
  }, [amount, description, invoiceRef, expiryDays, shareChannel, links]);

  const handleCancel = useCallback((linkId: string) => {
    setLinks(prev => prev.map(l => l.id === linkId ? { ...l, status: "cancelled" as LinkStatus } : l));
  }, []);

  const handleRegenerate = useCallback((linkId: string) => {
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setLinks(prev => prev.map(l => {
      if (l.id !== linkId) return l;
      return {
        ...l,
        id: `PL-${Date.now().toString(36).toUpperCase().slice(-4)}`,
        status: "active" as LinkStatus,
        created: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        expiresAt: expires.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        clicks: 0,
      };
    }));
  }, []);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  // Summary metrics
  const activeCount = links.filter(l => l.status === "active").length;
  const paidTotal = links.filter(l => l.status === "paid").reduce((s, l) => s + l.amount, 0);
  const pendingTotal = links.filter(l => l.status === "active").reduce((s, l) => s + l.amount, 0);

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
          <h1 className="text-3xl font-serif tracking-tight">Payment Links</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Invoice-Based Collections
          </p>
        </div>
      </header>

      {/* Summary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.02 }}
        className="mb-6 grid grid-cols-3 gap-3"
      >
        <div className="p-4 rounded-[24px] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-xl">
          <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Active</p>
          <p className="text-xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="p-4 rounded-[24px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-xl">
          <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Collected</p>
          <p className="text-xl font-bold text-cyan-400">{formatCurrency(paidTotal)}</p>
        </div>
        <div className="p-4 rounded-[24px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-xl">
          <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-xl font-bold text-amber-400">{formatCurrency(pendingTotal)}</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={SPRING}
          >
            {/* Create Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.04 }}
              onClick={() => setView("create")}
              className="w-full mb-6 py-4 rounded-[28px] bg-cyan-500 text-slate-900 font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-[0.98]"
            >
              <Plus size={18} /> Create Payment Link
            </motion.button>

            {/* Links List */}
            <div className="mb-4 flex items-center gap-2">
              <Link2 size={16} className="text-cyan-400" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
                All Links ({links.length})
              </p>
            </div>

            <div className="space-y-3">
              {links.map((link, i) => {
                const cfg = STATUS_CONFIG[link.status];
                const isExpanded = expandedId === link.id;

                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...SPRING, delay: 0.06 + i * 0.03 }}
                    className="rounded-[24px] bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-xl overflow-hidden"
                  >
                    {/* Link Header — Click to expand */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedId(isExpanded ? null : link.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : link.id); } }}
                      className="w-full p-5 text-left cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{link.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-white/40">{link.created}</p>
                            {link.invoiceRef && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onNavigateToReceivables?.(); }}
                                className="flex items-center gap-0.5 text-[10px] text-purple-400/70 hover:text-purple-300 transition-colors"
                              >
                                <Hash size={8} /> {link.invoiceRef}
                                <ExternalLink size={7} className="ml-0.5 opacity-60" />
                              </button>
                            )}
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <cfg.Icon size={9} />
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <p className="text-lg font-bold text-white">{formatCurrency(link.amount)}</p>
                        <div className="flex items-center gap-3 text-[10px] text-white/40">
                          <span className="flex items-center gap-1">
                            <MousePointerClick size={10} /> {link.clicks} {link.clicks === 1 ? "click" : "clicks"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> Exp: {link.expiresAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={SPRING}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4">
                            <div className="border-t border-white/10 pt-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Link ID</span>
                                <span className="text-white/80 font-mono text-xs">{link.id}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Status</span>
                                <span className={`${cfg.text} text-xs font-semibold`}>{cfg.label}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Created</span>
                                <span className="text-white/80 text-xs">{link.created}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Expires</span>
                                <span className="text-white/80 text-xs">{link.expiresAt}</span>
                              </div>
                              {link.shareChannel && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-white/50">Shared Via</span>
                                  <span className="text-white/80 text-xs">{link.shareChannel}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Interactions</span>
                                <span className={`text-xs font-semibold ${link.clicks > 0 ? "text-cyan-400" : "text-white/40"}`}>
                                  {link.clicks > 0 ? `${link.clicks} click${link.clicks > 1 ? "s" : ""}` : "No interactions"}
                                </span>
                              </div>
                              {link.paidAt && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Paid At</span>
                                    <span className="text-emerald-400 text-xs font-semibold">{link.paidAt}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Payer</span>
                                    <span className="text-white/80 text-xs">{link.payerRef}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCopy(`https://pay.bizpay.bd/link/${link.id}`, `copy-${link.id}`); }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-all active:scale-95"
                              >
                                {copiedId === `copy-${link.id}` ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                {copiedId === `copy-${link.id}` ? "Copied" : "Copy Link"}
                              </button>

                              {link.status === "active" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCancel(link.id); }}
                                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400/80 hover:bg-red-500/20 transition-all active:scale-95"
                                >
                                  <Ban size={14} /> Cancel
                                </button>
                              )}

                              {(link.status === "expired" || link.status === "cancelled") && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRegenerate(link.id); }}
                                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/20 transition-all active:scale-95"
                                >
                                  <RefreshCw size={14} /> Regenerate
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* ═══ CREATE VIEW ═══ */
          <motion.div
            key="create-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={SPRING}
            className="p-6 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-5"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
                New Payment Link
              </p>
              <button
                onClick={() => setView("list")}
                className="text-xs text-white/40 hover:text-white/80 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 block ml-1">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500 font-bold">৳</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-5 py-4 outline-none focus:border-cyan-500/50 transition-all text-[15px] text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 block ml-1">
                Description *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all text-[15px] text-white"
                placeholder="Invoice or purpose"
              />
            </div>

            {/* Invoice Reference */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 block ml-1">
                Invoice Reference
              </label>
              <input
                type="text"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all text-[15px] text-white"
                placeholder="INV-2026-XXX"
              />
              <p className="text-[10px] text-white/30 mt-2 ml-1">
                Linked invoices auto-tag for reconciliation.
              </p>
            </div>

            {/* Expiry */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 block ml-1">
                Link Expiry
              </label>
              <div className="flex gap-2">
                {([7, 14, 30] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setExpiryDays(d)}
                    className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all duration-300 tracking-wider border ${
                      expiryDays === d
                        ? "bg-white/10 text-white border-white/15 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                        : "bg-white/[0.02] text-white/30 border-white/5 hover:text-white/60"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Share Channel */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 block ml-1">
                Share Via
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "SMS", icon: MessageSquare },
                  { id: "WhatsApp", icon: Share2 },
                  { id: "Email", icon: Mail },
                ].map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setShareChannel(shareChannel === ch.id ? null : ch.id)}
                    className={`flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all active:scale-95 ${
                      shareChannel === ch.id
                        ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    <ch.icon size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{ch.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <button
              onClick={handleCreate}
              disabled={!amount || !description}
              className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-[0.98] text-sm uppercase tracking-[0.2em] ${
                amount && description
                  ? "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Generate Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CASA Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.4 }}
        className="mt-6 p-4 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl"
      >
        <p className="text-xs text-white/80 text-center">
          <span className="font-bold text-emerald-400">CASA Inflow:</span> All link payments settle into your current account. Invoice-bound links auto-tag for receivables reconciliation.
        </p>
      </motion.div>
    </div>
  );
}