/**
 * CREATE GST INVOICE SCREEN
 * GST-compliant invoice creation form.
 * Line items, tax split (CGST/SGST), Save + View.
 * Status lifecycle: Draft → Issued → Paid (derived).
 * No payment trigger. No auto-collect. No reminders.
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Building2,
  Save,
  Eye,
  CheckCircle2,
} from "lucide-react";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45 };

const fmtBDT = (n: number) =>
  `৳${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── KNOWN CLIENTS (from invoiceEngine) ──
const CLIENTS = [
  { id: "CLI-001", name: "Karim General Store", gstin: "TIN-987654321" },
  { id: "CLI-002", name: "Hasan Departmental Store", gstin: "TIN-456789123" },
  { id: "CLI-003", name: "Rahman Trading", gstin: "TIN-789123456" },
  { id: "CLI-004", name: "Mina Grocery", gstin: "TIN-321654987" },
  { id: "CLI-005", name: "Alam Wholesale", gstin: "TIN-654987321" },
];

const TAX_RATES = [
  { label: "Exempt (0%)", value: 0 },
  { label: "Reduced (2.5%)", value: 2.5 },
  { label: "Standard (5%)", value: 5 },
  { label: "Higher (9%)", value: 9 },
];

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
}

type InvoiceFormStatus = "draft" | "issued";

interface CreatedInvoice {
  invoiceNo: string;
  clientName: string;
  clientGSTIN: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  status: InvoiceFormStatus;
  createdAt: string;
}

interface CreateGSTInvoiceScreenProps {
  onBack: () => void;
}

export default function CreateGSTInvoiceScreen({ onBack }: CreateGSTInvoiceScreenProps) {
  const [view, setView] = useState<"form" | "preview">("form");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("2026-02-18");
  const [dueDate, setDueDate] = useState("2026-03-18");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "li_1", description: "", quantity: 1, rate: 0, taxRate: 0 },
  ]);
  const [status, setStatus] = useState<InvoiceFormStatus>("draft");
  const [savedInvoice, setSavedInvoice] = useState<CreatedInvoice | null>(null);

  const selectedClient = CLIENTS.find((c) => c.id === selectedClientId);

  // Calculations
  const subtotal = lineItems.reduce((sum, li) => sum + li.quantity * li.rate, 0);
  const totalCGST = lineItems.reduce((sum, li) => sum + (li.quantity * li.rate * li.taxRate) / 200, 0);
  const totalSGST = totalCGST; // SGST mirrors CGST for intra-state
  const grandTotal = subtotal + totalCGST + totalSGST;

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { id: `li_${Date.now()}`, description: "", quantity: 1, rate: 0, taxRate: 0 },
    ]);
  }

  function removeLineItem(id: string) {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((li) => (li.id === id ? { ...li, [field]: value } : li))
    );
  }

  function handleSave(saveStatus: InvoiceFormStatus) {
    const invoiceNo = `BP/2026/${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`;
    const invoice: CreatedInvoice = {
      invoiceNo,
      clientName: selectedClient?.name || "—",
      clientGSTIN: selectedClient?.gstin || "—",
      invoiceDate,
      dueDate,
      lineItems,
      subtotal,
      cgst: totalCGST,
      sgst: totalSGST,
      total: grandTotal,
      status: saveStatus,
      createdAt: new Date().toISOString(),
    };
    setStatus(saveStatus);
    setSavedInvoice(invoice);
    setView("preview");
  }

  // ═══ PREVIEW VIEW ═══
  if (view === "preview" && savedInvoice) {
    return (
      <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <header className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setView("form")}
            className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-serif tracking-tight">{savedInvoice.invoiceNo}</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              GST Invoice
            </p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
              savedInvoice.status === "issued"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            {savedInvoice.status}
          </span>
        </header>

        {/* Certificate-style Invoice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={STIFF_SPRING}
          className="rounded-[28px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/15 backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500" />
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Building2 size={16} className="text-cyan-400" />
                <h2 className="text-sm tracking-[0.15em] text-white/90 uppercase">
                  Tax Invoice
                </h2>
              </div>
              <p className="text-[9px] text-white/30 tracking-[0.2em]">
                {savedInvoice.invoiceNo} &middot; GSTIN: TIN-123456789
              </p>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-[8px] uppercase tracking-[0.2em] text-white/25 mb-1">From</p>
                <p className="text-[11px] text-white/80">BizPay Enterprises</p>
                <p className="text-[9px] text-white/30">TIN-123456789</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-[8px] uppercase tracking-[0.2em] text-white/25 mb-1">To</p>
                <p className="text-[11px] text-white/80">{savedInvoice.clientName}</p>
                <p className="text-[9px] text-white/30">{savedInvoice.clientGSTIN}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex gap-4 mb-5 text-[10px] text-white/40">
              <span>
                Issued:{" "}
                {new Date(savedInvoice.invoiceDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span>
                Due:{" "}
                {new Date(savedInvoice.dueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Line Items Table */}
            <div className="mb-4">
              <div className="grid grid-cols-[1fr_40px_60px_50px_60px] gap-2 mb-2 px-1">
                <span className="text-[8px] uppercase tracking-wider text-white/25">Item</span>
                <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">Qty</span>
                <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">Rate</span>
                <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">Tax%</span>
                <span className="text-[8px] uppercase tracking-wider text-white/25 text-right">Amt</span>
              </div>
              {savedInvoice.lineItems.map((li) => (
                <div
                  key={li.id}
                  className="grid grid-cols-[1fr_40px_60px_50px_60px] gap-2 py-2 px-1 border-b border-white/[0.04] last:border-0"
                >
                  <span className="text-[10px] text-white/70 truncate">{li.description || "—"}</span>
                  <span className="text-[10px] text-white/50 text-right font-mono">{li.quantity}</span>
                  <span className="text-[10px] text-white/50 text-right font-mono">{li.rate.toLocaleString()}</span>
                  <span className="text-[10px] text-white/50 text-right font-mono">{li.taxRate}%</span>
                  <span className="text-[10px] text-white/70 text-right font-mono">
                    {(li.quantity * li.rate).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/40">Subtotal</span>
                <span className="text-white/70 font-mono">{fmtBDT(savedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/40">CGST</span>
                <span className="text-white/70 font-mono">{fmtBDT(savedInvoice.cgst)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/40">SGST</span>
                <span className="text-white/70 font-mono">{fmtBDT(savedInvoice.sgst)}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between">
                <span className="text-[11px] text-white/60 font-semibold">Grand Total</span>
                <span className="text-lg font-serif text-cyan-400">{fmtBDT(savedInvoice.total)}</span>
              </div>
            </div>

            <p className="text-[8px] text-white/15 text-center mt-4">
              Generated {new Date(savedInvoice.createdAt).toLocaleString("en-GB")}
            </p>
          </div>
        </motion.div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setView("form")}
            className="flex-1 py-3.5 bg-white/5 border border-white/10 text-white/60 rounded-2xl text-xs uppercase tracking-[0.15em] font-semibold hover:bg-white/10 transition-all"
          >
            Edit
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-2xl text-xs uppercase tracking-[0.15em] font-semibold hover:bg-cyan-500/30 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ═══ FORM VIEW ═══
  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">New GST Invoice</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Tax-Compliant Invoice
          </p>
        </div>
      </header>

      {/* ═══ CLIENT SELECTION ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.05 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 mb-4"
      >
        <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3">
          Client
        </label>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            paddingRight: "2.5rem",
          }}
        >
          <option value="" className="bg-slate-900">Select client...</option>
          {CLIENTS.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900">
              {c.name} ({c.gstin})
            </option>
          ))}
        </select>
      </motion.div>

      {/* ═══ DATES ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.08 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <div className="rounded-[22px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] p-4">
          <label className="block text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">
            Invoice Date
          </label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white text-sm [color-scheme:dark]"
          />
        </div>
        <div className="rounded-[22px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] p-4">
          <label className="block text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white text-sm [color-scheme:dark]"
          />
        </div>
      </motion.div>

      {/* ═══ LINE ITEMS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.12 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
            Line Items
          </h3>
          <button
            onClick={addLineItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all"
          >
            <Plus size={12} /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {lineItems.map((li, idx) => (
            <div
              key={li.id}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/25 font-mono">#{idx + 1}</span>
                {lineItems.length > 1 && (
                  <button
                    onClick={() => removeLineItem(li.id)}
                    className="p-1 hover:bg-red-500/10 rounded-lg transition-all text-white/20 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Item description..."
                value={li.description}
                onChange={(e) => updateLineItem(li.id, "description", e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/30 transition-colors"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] uppercase text-white/20 mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={li.quantity}
                    onChange={(e) => updateLineItem(li.id, "quantity", parseInt(e.target.value) || 0)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/30 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase text-white/20 mb-1">Rate (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={li.rate}
                    onChange={(e) => updateLineItem(li.id, "rate", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/30 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase text-white/20 mb-1">Tax Rate</label>
                  <select
                    value={li.taxRate}
                    onChange={(e) => updateLineItem(li.id, "taxRate", parseFloat(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-2 py-2 text-sm text-white outline-none appearance-none cursor-pointer"
                  >
                    {TAX_RATES.map((tr) => (
                      <option key={tr.value} value={tr.value} className="bg-slate-900">
                        {tr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] text-white/20">Line Total</span>
                <span className="text-[11px] font-mono text-white/60">
                  {fmtBDT(li.quantity * li.rate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ TAX SUMMARY ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.16 }}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 mb-5"
      >
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">
          Tax Summary
        </h3>
        <div className="space-y-2.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-white/40">Subtotal</span>
            <span className="text-white/70 font-mono">{fmtBDT(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-white/40">CGST (Central)</span>
            <span className="text-white/70 font-mono">{fmtBDT(totalCGST)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-white/40">SGST (State)</span>
            <span className="text-white/70 font-mono">{fmtBDT(totalSGST)}</span>
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-between items-center">
            <span className="text-[11px] text-white/60 font-semibold uppercase tracking-wider">
              Grand Total
            </span>
            <span className="text-xl font-serif text-cyan-400">{fmtBDT(grandTotal)}</span>
          </div>
        </div>
      </motion.div>

      {/* ═══ ACTIONS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...STIFF_SPRING, delay: 0.2 }}
        className="flex gap-3"
      >
        <button
          onClick={() => handleSave("draft")}
          disabled={!selectedClientId || lineItems.every((li) => !li.description)}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white/60 rounded-2xl text-xs uppercase tracking-[0.15em] font-semibold hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <Save size={14} /> Save Draft
        </button>
        <button
          onClick={() => handleSave("issued")}
          disabled={!selectedClientId || lineItems.every((li) => !li.description)}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-2xl shadow-lg shadow-cyan-900/30 tracking-[0.15em] text-xs uppercase transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <FileText size={14} /> Issue Invoice
        </button>
      </motion.div>
    </div>
  );
}
