import { motion } from "motion/react";
import { ArrowLeft, Search, Download, Receipt } from "lucide-react";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 35 };

const mockTransactions = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  parentRef: `REF-${1000 + i}`,
  initDate: "24-01-2026",
  execDate: "24-01-2026",
  beneficiary: i % 2 === 0 ? "Global Logistics Ltd" : "Inter-Corp Solutions",
  accNum: `102938${475 + i}`,
  batchId: `BATCH-00${i + 1}`,
  amount: (Math.random() * 50000 + 1000).toLocaleString(undefined, { minimumFractionDigits: 2 })
}));

interface TRPaymentReportProps {
  onBack: () => void;
}

export default function TRPaymentReport({ onBack }: TRPaymentReportProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent font-sans">
      {/* Visual Foundation: Film Grain & Depth */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 h-full flex flex-col px-6 pt-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-white">
              Transaction Report
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              Payment Analytics
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-1 pb-24 custom-scrollbar">
          {/* Filter Glass Pane */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={STIFF_SPRING}
            className="relative p-6 rounded-[28px] bg-white/5 backdrop-blur-[32px] border border-white/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.15)] mb-10"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <ReportField label="From Date"><input type="date" defaultValue="2026-01-24" className="rpt-field" /></ReportField>
                <ReportField label="To Date"><input type="date" defaultValue="2026-01-24" className="rpt-field" /></ReportField>
              </div>
              <ReportField label="Beneficiary Name"><input placeholder="Enter name" className="rpt-field" /></ReportField>
              <ReportField label="Payment Status">
                <select className="rpt-field appearance-none">
                  <option className="bg-slate-900">--SELECT--</option>
                  <option className="bg-slate-900">Paid</option>
                  <option className="bg-slate-900">Pending</option>
                </select>
              </ReportField>

              <div className="flex gap-3 pt-2">
                <motion.button whileTap={{ scale: 0.96 }} className="flex-1 py-4 rounded-2xl bg-cyan-500 text-slate-900 text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                  <Search size={16} /> Search
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} className="w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white"><Download size={18} /></motion.button>
              </div>
            </div>
          </motion.div>

          {/* Details Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Transaction Detail</h2>
              <span className="text-[10px] text-white font-bold bg-white/10 border border-white/10 px-3 py-1 rounded-full uppercase tracking-tighter">Last 23 Entries</span>
            </div>

            {mockTransactions.map((txn, idx) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ ...STIFF_SPRING, delay: idx * 0.02 }}
                className="relative p-5 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group active:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:text-cyan-400 transition-colors">
                      <Receipt size={14} />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white">{txn.beneficiary}</div>
                      <div className="text-[9px] font-mono text-white/60 uppercase tracking-tighter">{txn.parentRef}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-serif text-emerald-400 font-bold">{txn.amount}</div>
                    <div className="text-[8px] text-white font-black uppercase tracking-widest">BDT</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <div className="text-[9px] text-white/50 font-medium">Batch: {txn.batchId}</div>
                  <div className="text-[9px] text-white/50 font-medium uppercase tracking-widest">{txn.execDate}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .rpt-field {
          @apply w-full bg-white/[0.05] border border-white/10 px-4 py-3 rounded-xl text-white font-medium text-sm focus:outline-none focus:border-cyan-500/40 transition-all;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.8; }
      `}</style>
    </div>
  );
}

interface ReportFieldProps {
  label: string;
  children: React.ReactNode;
}

function ReportField({ label, children }: ReportFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] px-1">{label}</label>
      {children}
    </div>
  );
}