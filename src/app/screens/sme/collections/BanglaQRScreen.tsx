import { ArrowLeft, QrCode, Copy, Share2, RefreshCw, CheckCircle, Clock, ArrowDownLeft, Hash, Calendar, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback, useEffect } from "react";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

/* ── Recent QR Collections ── */
interface QRCollection {
  id: string;
  payerName: string;
  payerRef: string;
  amount: number;
  invoiceRef: string | null;
  settledAt: string;
  status: "settled" | "pending";
}

const RECENT_COLLECTIONS: QRCollection[] = [
  { id: "QRC-001", payerName: "Rahman Fabrics", payerRef: "RF-2026-112", amount: 84500, invoiceRef: "INV-2026-044", settledAt: "18 Feb 2026, 11:42 AM", status: "settled" },
  { id: "QRC-002", payerName: "Dhaka Spice Co.", payerRef: "DSC-PAY-0881", amount: 32000, invoiceRef: null, settledAt: "18 Feb 2026, 10:15 AM", status: "settled" },
  { id: "QRC-003", payerName: "Bengal Logistics", payerRef: "BL-FEB-019", amount: 125750, invoiceRef: "INV-2026-039", settledAt: "17 Feb 2026, 4:58 PM", status: "settled" },
  { id: "QRC-004", payerName: "Sylhet Tea Gardens", payerRef: "STG-Q1-007", amount: 67200, invoiceRef: "INV-2026-041", settledAt: "17 Feb 2026, 2:30 PM", status: "settled" },
  { id: "QRC-005", payerName: "Chittagong Parts Ltd.", payerRef: "CPL-0293", amount: 215000, invoiceRef: "INV-2026-036", settledAt: "17 Feb 2026, 11:05 AM", status: "settled" },
  { id: "QRC-006", payerName: "Motijheel Agencies", payerRef: "MA-2026-14", amount: 18900, invoiceRef: null, settledAt: "16 Feb 2026, 3:22 PM", status: "settled" },
  { id: "QRC-007", payerName: "Narayanganj Exports", payerRef: "NE-INV-88", amount: 156300, invoiceRef: "INV-2026-033", settledAt: "16 Feb 2026, 10:48 AM", status: "settled" },
  { id: "QRC-008", payerName: "Comilla Agro Hub", payerRef: "CAH-FEB-05", amount: 43600, invoiceRef: null, settledAt: "Awaiting confirmation", status: "pending" },
];

/* ── Generated Dynamic QR record ── */
interface GeneratedQR {
  id: string;
  amount: string;
  invoiceRef: string;
  generatedAt: string;
  expiresAt: string;
}

const formatCurrency = (v: number) =>
  `৳${v.toLocaleString("en-BD")}`;

interface BanglaQRScreenProps {
  onBack: () => void;
  prefillAmount?: string;
  prefillInvoiceRef?: string;
  onNavigateToReceivables?: () => void;
}

export default function BanglaQRScreen({ onBack, prefillAmount, prefillInvoiceRef, onNavigateToReceivables }: BanglaQRScreenProps) {
  const [mode, setMode] = useState<"static" | "dynamic">(prefillAmount || prefillInvoiceRef ? "dynamic" : "static");
  const [amount, setAmount] = useState(prefillAmount || "");
  const [reference, setReference] = useState(prefillInvoiceRef || "");
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-switch to dynamic mode when prefill arrives
  useEffect(() => {
    if (prefillAmount || prefillInvoiceRef) {
      setMode("dynamic");
      if (prefillAmount) setAmount(prefillAmount);
      if (prefillInvoiceRef) setReference(prefillInvoiceRef);
    }
  }, [prefillAmount, prefillInvoiceRef]);

  const handleGenerate = useCallback(() => {
    if (!amount) return;
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    setGeneratedQR({
      id: `DQR-${Date.now().toString(36).toUpperCase()}`,
      amount,
      invoiceRef: reference || "—",
      generatedAt: now.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      expiresAt: expires.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    });
  }, [amount, reference]);

  const handleResetDynamic = useCallback(() => {
    setGeneratedQR(null);
    setAmount("");
    setReference("");
  }, []);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const todayTotal = RECENT_COLLECTIONS
    .filter(c => c.settledAt.includes("18 Feb"))
    .reduce((s, c) => s + c.amount, 0);

  const settledCount = RECENT_COLLECTIONS.filter(c => c.status === "settled").length;

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
          <h1 className="text-3xl font-serif tracking-tight">Bangla QR</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            QR-Based Collections
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
          <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Today</p>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(todayTotal)}</p>
        </div>
        <div className="p-4 rounded-[24px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-xl">
          <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Settled</p>
          <p className="text-xl font-bold text-cyan-400">{settledCount}</p>
        </div>
        <div className="p-4 rounded-[24px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-xl">
          <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-xl font-bold text-amber-400">{RECENT_COLLECTIONS.length - settledCount}</p>
        </div>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.04 }}
        className="flex p-1.5 bg-white/[0.04] rounded-2xl border border-white/5 mb-6"
      >
        <button
          onClick={() => { setMode("static"); setGeneratedQR(null); }}
          className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all duration-300 tracking-wider ${
            mode === "static"
              ? "bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/10"
              : "text-white/30 hover:text-white/60"
          }`}
        >
          Static QR
        </button>
        <button
          onClick={() => setMode("dynamic")}
          className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all duration-300 tracking-wider ${
            mode === "dynamic"
              ? "bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/10"
              : "text-white/30 hover:text-white/60"
          }`}
        >
          Dynamic QR
        </button>
      </motion.div>

      {/* ═══ STATIC QR ═══ */}
      {mode === "static" && (
        <motion.div
          key="static-qr"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="mb-6 p-6 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col items-center"
        >
          {/* QR Visual */}
          <div className="w-48 h-48 bg-white rounded-2xl p-3 mb-4 flex items-center justify-center">
            <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-[repeating-conic-gradient(#1e293b_0%_25%,#e2e8f0_0%_50%)] bg-[length:12px_12px]">
              <div className="bg-white rounded-md p-1.5 shadow-md">
                <QrCode size={28} className="text-slate-800" />
              </div>
            </div>
          </div>

          <p className="text-sm text-white/90 font-semibold mb-0.5">Hazi Traders Ltd.</p>
          <p className="text-[10px] text-white/50 font-mono mb-1">AC: 2052836410001</p>
          <span className="px-3 py-1 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider mb-5">
            Permanent — Always Active
          </span>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => handleCopy("https://pay.bizpay.bd/qr/HAZI-STATIC-001", "static-copy")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-all active:scale-95"
            >
              {copiedId === "static-copy" ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copiedId === "static-copy" ? "Copied" : "Copy"}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-all active:scale-95">
              <Share2 size={16} /> Share
            </button>
          </div>
        </motion.div>
      )}

      {/* ═══ DYNAMIC QR ═══ */}
      {mode === "dynamic" && (
        <AnimatePresence mode="wait">
          {!generatedQR ? (
            /* ── Input Form ── */
            <motion.div
              key="dynamic-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={SPRING}
              className="mb-6 p-6 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-5"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
                Generate Invoice-Bound QR
              </p>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 block ml-1">
                  Collection Amount *
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

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 block ml-1">
                  Invoice Reference
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500/50 transition-all text-[15px] text-white"
                  placeholder="INV-2026-001"
                />
                <p className="text-[10px] text-white/30 mt-2 ml-1">
                  Binding an invoice auto-tags the inflow for reconciliation.
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!amount}
                className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-[0.98] text-sm uppercase tracking-[0.2em] ${
                  amount
                    ? "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                Generate Dynamic QR
              </button>
            </motion.div>
          ) : (
            /* ── Generated QR Display ── */
            <motion.div
              key="dynamic-result"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={SPRING}
              className="mb-6 p-6 rounded-[28px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col items-center"
            >
              {/* QR Visual */}
              <div className="w-44 h-44 bg-white rounded-2xl p-3 mb-4 flex items-center justify-center">
                <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-[repeating-conic-gradient(#0e7490_0%_25%,#e2e8f0_0%_50%)] bg-[length:10px_10px]">
                  <div className="bg-white rounded-md p-1.5 shadow-md">
                    <QrCode size={24} className="text-cyan-700" />
                  </div>
                </div>
              </div>

              <p className="text-sm text-white/90 font-semibold mb-0.5">Hazi Traders Ltd.</p>
              <p className="text-2xl font-bold text-cyan-400 mb-1">৳{Number(generatedQR.amount).toLocaleString("en-BD")}</p>

              {generatedQR.invoiceRef !== "—" && (
                <span className="px-3 py-1 text-[9px] font-bold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase tracking-wider mb-2">
                  <Hash size={9} className="inline mr-0.5 -mt-px" /> {generatedQR.invoiceRef}
                </span>
              )}

              <span className="px-3 py-1 text-[9px] font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 uppercase tracking-wider mb-4">
                <Clock size={9} className="inline mr-1 -mt-px" /> Single-Use — Expires {generatedQR.expiresAt}
              </span>

              {/* Meta */}
              <div className="w-full space-y-1.5 mb-5 px-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">QR ID</span>
                  <span className="text-white/80 font-mono text-xs">{generatedQR.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Generated</span>
                  <span className="text-white/80 text-xs">{generatedQR.generatedAt}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Settlement</span>
                  <span className="text-white/80 text-xs">CASA — Real-time</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full mb-3">
                <button
                  onClick={() => handleCopy(`https://pay.bizpay.bd/qr/${generatedQR.id}`, "dqr-copy")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-all active:scale-95"
                >
                  {copiedId === "dqr-copy" ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  {copiedId === "dqr-copy" ? "Copied" : "Copy Link"}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-all active:scale-95">
                  <Share2 size={16} /> Share
                </button>
              </div>

              <button
                onClick={handleResetDynamic}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
              >
                <RefreshCw size={14} /> Generate Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Collection Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-6 p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-3">
          Collection Configuration
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Credit To</span>
            <span className="text-white/90">Current Account (CASA)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Settlement</span>
            <span className="text-white/90">Real-time</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">QR Standard</span>
            <span className="text-white/90">Bangladesh Bank Bangla QR</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Invoice Binding</span>
            <span className="text-white/90">Dynamic QR only</span>
          </div>
        </div>
      </motion.div>

      {/* ═══ RECENT COLLECTIONS FEED ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <ArrowDownLeft size={16} className="text-emerald-400" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
            Recent QR Collections ({RECENT_COLLECTIONS.length})
          </p>
        </div>

        <div className="space-y-3">
          {RECENT_COLLECTIONS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.18 + i * 0.03 }}
              className="p-4 rounded-[24px] bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{c.payerName}</p>
                  <p className="text-xs text-white/50 font-mono mt-0.5">{c.payerRef}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(c.amount)}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[8px] font-bold rounded-full uppercase tracking-wider ${
                    c.status === "settled"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}>
                    {c.status === "settled" ? <CheckCircle size={8} /> : <Clock size={8} />}
                    {c.status === "settled" ? "Settled" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                  <Calendar size={10} />
                  {c.settledAt}
                </div>
                {c.invoiceRef && (
                  <button
                    onClick={() => onNavigateToReceivables?.()}
                    className="flex items-center gap-1 text-[10px] text-purple-400/80 hover:text-purple-300 transition-colors"
                  >
                    <Hash size={9} />
                    {c.invoiceRef}
                    <ExternalLink size={8} className="ml-0.5 opacity-60" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CASA Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.4 }}
        className="mt-6 p-4 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl"
      >
        <p className="text-xs text-white/80 text-center">
          <span className="font-bold text-emerald-400">CASA Inflow:</span> All QR collections settle directly into your current account, strengthening operating balance and CASA ratio.
        </p>
      </motion.div>
    </div>
  );
}