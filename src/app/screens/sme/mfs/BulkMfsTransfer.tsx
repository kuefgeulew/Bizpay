import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, UploadCloud, MessageSquare, FileText, Send } from "lucide-react";
import { enforceTransactionGate, type EnforcementResult } from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";

// 2026 Stiff Spring Physics: Mechanical and high-tension
const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 35 };

/** MFS brand config for logos */
const MFS_BRAND: Record<string, { color: string; bg: string; border: string; initials: string }> = {
  bKash: { color: "#E2136E", bg: "bg-[#E2136E]/15", border: "border-[#E2136E]/30", initials: "bK" },
  Nagad: { color: "#F6921E", bg: "bg-[#F6921E]/15", border: "border-[#F6921E]/30", initials: "Ng" },
  Rocket: { color: "#8B2F91", bg: "bg-[#8B2F91]/15", border: "border-[#8B2F91]/30", initials: "Rk" },
  Upay: { color: "#00A651", bg: "bg-[#00A651]/15", border: "border-[#00A651]/30", initials: "Up" },
};

interface BulkMfsTransferProps {
  provider: string;
  onBack: () => void;
}

export default function BulkMfsTransfer({ provider, onBack }: BulkMfsTransferProps) {
  // GOVERNANCE_ENFORCEMENT — Bulk MFS Transaction Execution Gate
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  const brand = MFS_BRAND[provider] || { color: "#22d3ee", bg: "bg-cyan-500/15", border: "border-cyan-500/30", initials: provider.slice(0, 2) };

  function handleUploadTransfer() {
    const result = enforceTransactionGate({
      amount: 100000, // Bulk MFS uses aggregate MFS limit
      category: "MFS",
      description: `${provider} Bulk MFS Transfer`,
    });
    setEnforcementResult(result);
  }

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50"
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
        <div className={`w-10 h-10 rounded-xl ${brand.bg} ${brand.border} border flex items-center justify-center shrink-0`}>
          <span className="text-xs font-bold" style={{ color: brand.color }}>{brand.initials}</span>
        </div>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">{provider} Bulk Transfer</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">Batch Processing</p>
        </div>
      </header>

      {/* Main Glass Card */}
      <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <UploadCloud size={20} className="text-cyan-400" />
          </div>
          <h2 className="font-serif text-white">Upload Batch File</h2>
        </div>

        <div className="space-y-5">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Upload Batch File *</label>
            <label className="relative group cursor-pointer block">
              <input type="file" className="hidden" />
              <div className="
                w-full py-10 flex flex-col items-center justify-center gap-3
                bg-white/[0.03] border-2 border-dashed border-white/10 rounded-[20px]
                transition-all group-hover:border-white/20 group-hover:bg-white/[0.06]
              ">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <UploadCloud size={22} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60 font-semibold">Select CSV / Excel</p>
                  <p className="text-[10px] text-white/30 mt-1">Maximum 500 Records</p>
                </div>
              </div>
            </label>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Remarks</label>
            <input 
              className="dd-input" 
              placeholder="e.g. Salary Disbursement Jan 2026" 
            />
          </div>

          {/* GOVERNANCE_ENFORCEMENT — Inline enforcement bar */}
          {enforcementResult && (
            <div className="mb-4">
              <GovernanceBar result={enforcementResult} onDismiss={() => setEnforcementResult(null)} />
            </div>
          )}

          <button
            onClick={handleUploadTransfer}
            disabled={!!enforcementResult}
            className={`w-full py-3.5 rounded-2xl ${!!enforcementResult ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"} font-semibold transition-all active:scale-[0.98] shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2`}
          >
            <Send size={16} /> Upload & Transfer
          </button>
        </div>
      </div>

      <style>{`
        .dd-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          outline: none;
          transition: all 0.2s;
          appearance: none;
        }
        .dd-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .dd-input:focus {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
      `}</style>
    </div>
  );
}