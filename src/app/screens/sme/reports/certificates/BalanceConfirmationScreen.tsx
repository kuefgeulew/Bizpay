/**
 * BALANCE CONFIRMATION CERTIFICATE
 * PDF-style visual-only certificate screen.
 * As-of date selector, masked account number, balance, bank signature block.
 * No request workflow. No approval. Generated document view only.
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  FileCheck,
  Building2,
  Calendar,
  Shield,
  Download,
} from "lucide-react";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45 };

const fmtBDT = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

// Mock account data
const ACCOUNTS = [
  {
    id: "acc_001",
    name: "PRAPTI Current Account",
    number: "1074165690001",
    maskedNumber: "XXXX XXXX X0001",
    balance: 1_711_55.29,
    branch: "Gulshan Corporate Branch",
    type: "Current Account",
  },
  {
    id: "acc_002",
    name: "CORPORATE Savings",
    number: "2052836410002",
    maskedNumber: "XXXX XXXX X0002",
    balance: 12_840.0,
    branch: "Gulshan Corporate Branch",
    type: "Savings Account",
  },
];

// Available as-of dates
const AS_OF_DATES = [
  { value: "2026-02-18", label: "18 Feb 2026 (Today)" },
  { value: "2026-02-17", label: "17 Feb 2026" },
  { value: "2026-02-15", label: "15 Feb 2026" },
  { value: "2026-01-31", label: "31 Jan 2026" },
  { value: "2025-12-31", label: "31 Dec 2025" },
  { value: "2025-09-30", label: "30 Sep 2025" },
];

interface BalanceConfirmationScreenProps {
  onBack: () => void;
}

export default function BalanceConfirmationScreen({ onBack }: BalanceConfirmationScreenProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(ACCOUNTS[0].id);
  const [asOfDate, setAsOfDate] = useState(AS_OF_DATES[0].value);
  const [showCertificate, setShowCertificate] = useState(false);

  const selectedAccount = ACCOUNTS.find((a) => a.id === selectedAccountId)!;
  const selectedDateLabel = AS_OF_DATES.find((d) => d.value === asOfDate)?.label || asOfDate;
  const generatedAt = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Certificate Reference
  const certRef = `BCC-${asOfDate.replace(/-/g, "")}-${selectedAccount.number.slice(-4)}`;

  if (showCertificate) {
    return (
      <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
        {/* Film Grain */}
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Header */}
        <header className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowCertificate(false)}
            className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-serif tracking-tight">Certificate</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              Balance Confirmation
            </p>
          </div>
        </header>

        {/* ═══ PDF-STYLE CERTIFICATE ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={STIFF_SPRING}
          className="rounded-[28px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/15 backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          {/* Certificate Top Border / Accent */}
          <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500" />

          <div className="p-6">
            {/* Bank Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 size={18} className="text-cyan-400" />
                <h2 className="text-lg tracking-[0.15em] text-white/90 uppercase">
                  BRAC Bank Limited
                </h2>
              </div>
              <p className="text-[9px] text-white/30 tracking-[0.3em] uppercase">
                1 Gulshan Avenue, Dhaka 1212, Bangladesh
              </p>
              <p className="text-[9px] text-white/25 tracking-[0.2em] mt-0.5">
                Swift: BABORDDH &middot; Routing: 060261725
              </p>

              {/* Divider */}
              <div className="mt-4 mb-4 border-b border-white/10" />

              <h3 className="text-sm font-serif text-cyan-400 tracking-[0.2em] uppercase">
                Balance Confirmation Certificate
              </h3>
              <p className="text-[9px] text-white/30 mt-1">
                Ref: {certRef}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 mb-6">
              <p className="text-[11px] text-white/60 leading-relaxed">
                This is to certify that the following account is maintained with BRAC Bank Limited,
                and the balance as stated herein is correct as of the date indicated below.
              </p>

              {/* Account Details Table */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                <CertRow label="Account Holder" value="Hazi Traders" />
                <CertRow label="Account Name" value={selectedAccount.name} />
                <CertRow label="Account Number" value={selectedAccount.maskedNumber} mono />
                <CertRow label="Account Type" value={selectedAccount.type} />
                <CertRow label="Branch" value={selectedAccount.branch} />

                {/* Balance — Highlighted */}
                <div className="pt-3 mt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-bold">
                      Balance as of {new Date(asOfDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-2xl font-serif text-cyan-400 mt-2 tracking-tight">
                    ৳{fmtBDT(selectedAccount.balance)}
                  </p>
                  <p className="text-[9px] text-white/25 mt-1">
                    (In words: {numberToWords(selectedAccount.balance)} Taka and{" "}
                    {Math.round((selectedAccount.balance % 1) * 100)} Paisa only)
                  </p>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="border-t border-white/10 pt-5 mb-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="h-10 mb-2 border-b border-dashed border-white/15" />
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.15em]">
                    Authorised Signatory
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5">
                    Branch Manager
                  </p>
                </div>
                <div>
                  <div className="h-10 mb-2 border-b border-dashed border-white/15 flex items-end justify-center pb-1">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                      <Shield size={14} className="text-white/15" />
                    </div>
                  </div>
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.15em] text-center">
                    Bank Seal
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
              <p className="text-[8px] text-white/20 leading-relaxed">
                This certificate is generated electronically and is valid without physical signature
                for the purpose of account balance confirmation. The balance reflected is subject to
                clearance of any pending transactions as of the stated date. This document does not
                constitute a guarantee or commitment of any kind by BRAC Bank Limited. For any
                discrepancies, please contact your Relationship Manager.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-[8px] text-white/15">
                Generated: {generatedAt}
              </p>
              <p className="text-[8px] text-white/15 font-mono">
                {certRef}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCertificate(false)}
          className="w-full mt-6 py-4 bg-white/5 border border-white/10 text-white/60 rounded-2xl text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white/10 transition-all"
        >
          Back to Selection
        </motion.button>
      </div>
    );
  }

  // ── SELECTION FORM ──
  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Balance Confirmation</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Certificate Generation
          </p>
        </div>
      </header>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={STIFF_SPRING}
        className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <FileCheck size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="font-serif text-white">Certificate Parameters</h2>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-0.5">
              Select account and date
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Account Selector */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">
              Account
            </label>
            <div className="space-y-2">
              {ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                    selectedAccountId === acc.id
                      ? "bg-cyan-500/10 border-cyan-500/30"
                      : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="text-[12px] text-white/80">{acc.name}</p>
                  <p className="text-[10px] text-white/30 font-mono mt-0.5">
                    {acc.maskedNumber} &middot; ৳{fmtBDT(acc.balance)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* As-Of Date Selector */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">
              As-of Date
            </label>
            <select
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                paddingRight: "2.5rem",
              }}
            >
              {AS_OF_DATES.map((d) => (
                <option key={d.value} value={d.value} className="bg-slate-900">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Summary */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-white/30 uppercase tracking-wider">Account</span>
              <span className="text-white/70">{selectedAccount.name}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-white/30 uppercase tracking-wider">Number</span>
              <span className="text-white/70 font-mono">{selectedAccount.maskedNumber}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-white/30 uppercase tracking-wider">As-of</span>
              <span className="text-white/70">{selectedDateLabel}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-2 border-t border-white/[0.06]">
              <span className="text-white/30 uppercase tracking-wider">Balance</span>
              <span className="text-cyan-400 font-mono">
                ৳{fmtBDT(selectedAccount.balance)}
              </span>
            </div>
          </div>

          {/* Generate CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCertificate(true)}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-2xl shadow-lg shadow-cyan-900/30 tracking-[0.15em] text-xs uppercase transition-all"
          >
            Generate Certificate
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════
// CERTIFICATE DETAIL ROW
// ═══════════════════════════════════════════

function CertRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] uppercase tracking-[0.12em] text-white/30 font-bold">
        {label}
      </span>
      <span
        className={`text-[11px] text-white/70 text-right ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════
// NUMBER TO WORDS (basic BDT)
// ═══════════════════════════════════════════

function numberToWords(n: number): string {
  const intPart = Math.floor(n);
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (intPart === 0) return "Zero";

  function twoDigit(num: number): string {
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    return tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "");
  }

  function threeDigit(num: number): string {
    if (num < 100) return twoDigit(num);
    return units[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + twoDigit(num % 100) : "");
  }

  // BD numbering: Lakh (100,000), Crore (10,000,000)
  const crore = Math.floor(intPart / 10_000_000);
  const lakh = Math.floor((intPart % 10_000_000) / 100_000);
  const thousand = Math.floor((intPart % 100_000) / 1_000);
  const remainder = intPart % 1_000;

  let result = "";
  if (crore > 0) result += threeDigit(crore) + " Crore ";
  if (lakh > 0) result += twoDigit(lakh) + " Lakh ";
  if (thousand > 0) result += twoDigit(thousand) + " Thousand ";
  if (remainder > 0) result += threeDigit(remainder);

  return result.trim();
}