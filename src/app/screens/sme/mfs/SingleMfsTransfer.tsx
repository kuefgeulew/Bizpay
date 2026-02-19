import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, CheckCircle2, Shield, 
  UserPlus, Zap, Search as SearchIcon
} from "lucide-react";
import { enforceTransactionGate, type EnforcementResult } from "../../../utils/governanceEngine";
import GovernanceBar from "../../../components/GovernanceBar";

// Elevated Physics
const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45, mass: 1 };

/** MFS brand config for logos */
const MFS_BRAND: Record<string, { color: string; bg: string; border: string; initials: string }> = {
  bKash: { color: "#E2136E", bg: "bg-[#E2136E]/15", border: "border-[#E2136E]/30", initials: "bK" },
  Nagad: { color: "#F6921E", bg: "bg-[#F6921E]/15", border: "border-[#F6921E]/30", initials: "Ng" },
  Rocket: { color: "#8B2F91", bg: "bg-[#8B2F91]/15", border: "border-[#8B2F91]/30", initials: "Rk" },
  Upay: { color: "#00A651", bg: "bg-[#00A651]/15", border: "border-[#00A651]/30", initials: "Up" },
};

const BENEFICIARIES = [
  { name: "Rafsan Jany", number: "01755998811", initial: "RJ" },
  { name: "Ishrat Jahan", number: "01822334455", initial: "IJ" },
  { name: "Kazi Mushfiq", number: "01911447788", initial: "KM" },
];

interface SingleMfsTransferProps {
  provider: string;
  onBack: () => void;
}

export default function SingleMfsTransfer({ provider, onBack }: SingleMfsTransferProps) {
  const [step, setStep] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBen, setSelectedBen] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [enforcementResult, setEnforcementResult] = useState<EnforcementResult | null>(null);

  const brand = MFS_BRAND[provider] || { color: "#22d3ee", bg: "bg-cyan-500/15", border: "border-cyan-500/30", initials: provider.slice(0, 2) };

  const filtered = BENEFICIARIES.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.number.includes(searchTerm)
  );

  return (
    <div className="relative h-full w-full overflow-hidden text-white font-sans selection:bg-cyan-500/30">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <AnimatePresence mode="wait">
        {/* BENEFICIARY LIST */}
        {step === "list" && (
          <motion.div 
            key="list" 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={STIFF_SPRING}
            className="relative z-10 px-6 pt-8 flex flex-col h-full"
          >
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
                <h1 className="text-3xl font-serif tracking-tight">{provider} Transfer</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
                  Mobile Financial Services
                </p>
              </div>
            </header>
            
            <div className="flex gap-4 mb-10">
              <button onClick={() => setStep("add_new")} className="flex-1 p-6 bg-white/[0.03] rounded-[28px] border border-white/10 flex flex-col items-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] hover:bg-white/[0.06] transition-all group">
                <UserPlus size={20} className="text-cyan-400 mb-3 group-hover:scale-110 transition-transform"/>
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">New Account</span>
              </button>
              <button onClick={() => setStep("one_time")} className="flex-1 p-6 bg-white/[0.03] rounded-[28px] border border-white/10 flex flex-col items-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] hover:bg-white/[0.06] transition-all group">
                <Zap size={20} className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform"/>
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">Quick Pay</span>
              </button>
            </div>

            <div className="relative mb-8 group">
              <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18}/>
              <input 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or wallet..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-5 pl-16 pr-6 focus:outline-none focus:border-white/20 text-sm placeholder:text-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pb-10">
              {filtered.map((b, i) => (
                <motion.button 
                  key={i} whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedBen(b); setStep("details"); }}
                  className="w-full flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.05] rounded-[28px] hover:bg-white/[0.05] transition-all shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)]"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs text-white/60 shadow-lg">{b.initial}</div>
                    <div className="text-left">
                      <p className="text-sm tracking-tight text-white/90">{b.name}</p>
                      <p className="text-[10px] font-mono text-white/20 tracking-wider mt-0.5">{b.number}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* AMOUNT INPUT */}
        {step === "details" && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={STIFF_SPRING}
            className="relative z-10 px-6 pt-8 flex flex-col h-full"
          >
            <header className="flex items-center gap-4 mb-10">
              <button
                onClick={() => setStep("list")}
                className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
              >
                <ArrowLeft size={20} />
              </button>
              <div className={`w-10 h-10 rounded-xl ${brand.bg} ${brand.border} border flex items-center justify-center shrink-0`}>
                <span className="text-xs font-bold" style={{ color: brand.color }}>{brand.initials}</span>
              </div>
              <div>
                <h1 className="text-3xl font-serif tracking-tight">Enter Amount</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
                  Transfer Details
                </p>
              </div>
            </header>

            <div className="flex-1">
              <div className="flex items-baseline gap-4 border-b border-white/10 pb-6">
                <span className="text-white/20 font-serif">BDT</span>
                <input 
                  autoFocus type="number" placeholder="0.00" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-6xl font-serif outline-none placeholder:text-white/5 caret-cyan-400 tracking-tighter"
                />
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.97 }}
              disabled={!amount}
              onClick={() => setStep("review")}
              className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-2xl shadow-lg shadow-cyan-900/30 disabled:opacity-10 transition-all mb-8 text-xs tracking-[0.2em] uppercase"
            >
              Review Details
            </motion.button>
          </motion.div>
        )}

        {/* REVIEW */}
        {step === "review" && (
          <motion.div 
            key="review"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={STIFF_SPRING}
            className="relative z-10 px-6 pt-8 h-full flex flex-col"
          >
            <header className="flex items-center gap-4 mb-10">
              <button
                onClick={() => { setStep("details"); setEnforcementResult(null); }}
                className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
              >
                <ArrowLeft size={20} />
              </button>
              <div className={`w-10 h-10 rounded-xl ${brand.bg} ${brand.border} border flex items-center justify-center shrink-0`}>
                <span className="text-xs font-bold" style={{ color: brand.color }}>{brand.initials}</span>
              </div>
              <div>
                <h1 className="text-3xl font-serif tracking-tight">Confirmation</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
                  Review & Authorize
                </p>
              </div>
            </header>

            <div className="flex-1 space-y-6">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] p-8 rounded-[28px] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-6">
                <div className="flex justify-between items-center"><span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Amount</span><span className="text-xl font-mono">৳{amount}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Fee</span><span className="text-sm text-emerald-400 font-semibold">WAIVED</span></div>
                <div className="h-[1px] bg-white/5 w-full" />
                <div className="flex justify-between items-center"><span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Total Payable</span><span className="text-3xl font-serif text-cyan-400">৳{amount}</span></div>
              </div>
              
              <div className="p-5 flex gap-5 bg-white/[0.03] rounded-[28px] border border-white/[0.05] items-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">{selectedBen?.initial}</div>
                <div>
                  <p className="text-white/90">{selectedBen?.name}</p>
                  <p className="text-xs text-white/20 font-mono mt-1 tracking-widest">{selectedBen?.number}</p>
                </div>
              </div>

              {/* GOVERNANCE_ENFORCEMENT — MFS Transaction Gate */}
              {enforcementResult && (
                <GovernanceBar result={enforcementResult} onDismiss={() => setEnforcementResult(null)} />
              )}
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // GOVERNANCE_ENFORCEMENT — Check before proceeding to OTP
                const numAmount = parseFloat(amount) || 0;
                const result = enforceTransactionGate({
                  amount: numAmount,
                  category: "MFS",
                  description: `${provider} MFS Transfer`,
                });
                setEnforcementResult(result);
                if (result.outcome === "ALLOWED") {
                  setStep("otp");
                }
                // APPROVAL_REQUIRED shows bar but does not proceed to OTP
                // BLOCKED shows bar and button is disabled on re-render
              }}
              disabled={!!enforcementResult}
              className={`w-full py-5 ${!!enforcementResult ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"} font-semibold rounded-2xl shadow-lg shadow-cyan-900/30 tracking-[0.2em] text-xs uppercase mb-8`}
            >
              Authorize Transfer
            </motion.button>
          </motion.div>
        )}

        {/* OTP */}
        {step === "otp" && (
          <motion.div 
            key="otp"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={STIFF_SPRING}
            className="relative z-10 p-8 flex flex-col items-center pt-32"
          >
            <Shield size={72} strokeWidth={1} className="text-cyan-500/20 mb-10"/>
            <h2 className="text-3xl font-serif tracking-tight mb-14 text-white/90">Verify Identity</h2>
            <div className="relative w-full h-24 bg-white/[0.04] rounded-[28px] border border-white/10 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group overflow-hidden">
               <span className="text-4xl tracking-[0.6em] text-cyan-400 ml-8 font-mono">
                {otpValue.padEnd(6, "\u2022")}
               </span>
               <input 
                autoFocus type="text" maxLength={6} value={otpValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtpValue(val);
                  if(val.length === 6) {
                    setIsProcessing(true);
                    setTimeout(() => { setIsProcessing(false); setStep("success"); }, 2200);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-none"
               />
            </div>
            <p className="mt-8 text-[10px] text-white/20 tracking-[0.2em] uppercase font-semibold">6-Digit OTP sent to your device</p>
          </motion.div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={STIFF_SPRING}
            className="relative z-10 p-8 h-full flex flex-col items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, ...STIFF_SPRING }}
              className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 size={48} strokeWidth={1.5} className="text-emerald-400"/>
            </motion.div>
            <h1 className="text-3xl font-serif tracking-tight mb-14 text-white/90">Funds Delivered</h1>
            <div className="w-full bg-gradient-to-br from-white/5 to-white/[0.02] p-8 rounded-[28px] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] mb-14 backdrop-blur-xl">
               <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-[0.2em] mb-6 font-semibold"><span>Recipient</span><span className="text-white">{selectedBen?.name}</span></div>
               <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-[0.2em] items-center font-semibold"><span>Value</span><span className="text-white font-mono text-xl">৳{amount}.00</span></div>
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={onBack} className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-2xl shadow-lg shadow-cyan-900/30 tracking-[0.2em] text-xs uppercase">Back to Home</motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADER OVERLAY */}
      {isProcessing && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center">
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
              className="w-20 h-20 border-[3px] border-white/5 border-t-cyan-500 rounded-full mb-10 shadow-[0_0_30px_rgba(6,182,212,0.2)]" 
            />
            <p className="text-[11px] tracking-[0.8em] text-white/40 animate-pulse uppercase font-semibold">Encrypting</p>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        ::selection { background: rgba(6, 182, 212, 0.3); }
      `}</style>
    </div>
  );
}