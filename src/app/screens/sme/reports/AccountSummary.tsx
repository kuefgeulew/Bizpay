import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Share2, MousePointer2 } from "lucide-react";

const fmtBDT = (n = 0) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(Math.max(0, Number(n)))
    .replace("BDT", "")
    .trim();

interface AccountSummaryProps {
  onBack: () => void;
}

export default function AccountSummary({ onBack }: AccountSummaryProps) {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      title: "PRAPTI Current Account",
      accountNo: "1074165690001",
      balance: 171155.29,
    },
    {
      id: 2,
      title: "CORPORATE Savings",
      accountNo: "2052836410002",
      balance: 12840.00,
    },
  ]);

  const handleDragEnd = (_event: any, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) > 100) {
      setAccounts((prev) => {
        const newArr = [...prev];
        const shifted = newArr.shift();
        if (shifted) newArr.push(shifted);
        return newArr;
      });
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 px-6 pt-8 flex-1">
        {/* Header */}
        <header className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-white">Account Summary</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
              Portfolio Overview
            </p>
          </div>
        </header>

        {/* Swipe Interaction Cue */}
        <motion.div 
          animate={{ x: [0, 30, -30, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[45%] left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-2"
        >
          <MousePointer2 className="text-white/20 rotate-12 shadow-sm" size={24} fill="currentColor" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20">Swipe to Shuffle</span>
        </motion.div>

        {/* Locked Stack Container */}
        <div className="relative w-full h-[400px] flex justify-center">
          <AnimatePresence initial={false}>
            {accounts.map((acc, index) => {
              const isTop = index === 0;
              return (
                <motion.div
                  key={acc.id}
                  style={{ 
                    zIndex: accounts.length - index, 
                    position: 'absolute',
                    width: '100%',
                    touchAction: "none" 
                  }}
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={handleDragEnd}
                  initial={{ scale: 0.94, y: 70, opacity: 0 }}
                  animate={{ 
                    scale: isTop ? 1 : 0.94, 
                    y: isTop ? 0 : 70, 
                    x: 0,
                    opacity: 1
                  }}
                  exit={{ 
                    x: 500, 
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] } 
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                >
                  <CardItem acc={acc} isTop={isTop} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface CardItemProps {
  acc: {
    title: string;
    accountNo: string;
    balance: number;
  };
  isTop: boolean;
}

function CardItem({ acc, isTop }: CardItemProps) {
  return (
    <div
      className={`
        relative mx-auto w-full max-w-[340px]
        rounded-[28px] px-6 pb-6 pt-7
        bg-white/[0.04] backdrop-blur-xl transition-all duration-500
        ${isTop ? 'shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]' : 'shadow-lg'}
        border border-white/10
        group overflow-hidden
      `}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite] skew-x-[-25deg]" />
      </div>

      {/* Internal Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Rim Lighting */}
      <div className="absolute inset-0 rounded-[28px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] pointer-events-none" />

      {/* Ribbon */}
      <div className={`absolute -right-2 top-7 rotate-45 z-20 transition-all duration-700 ${!isTop ? 'opacity-0 scale-50' : 'opacity-100'}`}>
        <div className="bg-emerald-500 px-10 py-[4px] text-[10px] font-semibold tracking-widest text-white shadow-xl uppercase">
          Active
        </div>
      </div>

      <div className="relative z-10">
        <div>
          <div className={`text-[17px] tracking-tight transition-colors duration-500 ${isTop ? 'text-white' : 'text-white/40'}`}>
            {acc.title}
          </div>
          <div className="mt-1 text-[12px] text-white/50 font-mono tracking-tighter opacity-80">{acc.accountNo}</div>
        </div>

        <motion.div 
          animate={{ opacity: isTop ? 1 : 0, y: isTop ? 0 : 10 }}
          className="mt-8 flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/40 opacity-70 font-semibold">Available Balance</div>
            <div className="mt-1 text-3xl font-serif text-emerald-400 tracking-tight">
              {fmtBDT(acc.balance)}{" "}
              <span className="ml-1 align-middle text-sm text-white/40">
                BDT
              </span>
            </div>
          </div>

          <button className="grid h-12 w-12 place-items-center rounded-full bg-white/10 border border-white/10 text-white/40 shadow-sm hover:text-cyan-400 hover:border-cyan-500/30 transition-all active:scale-75">
            <Share2 size={18} />
          </button>
        </motion.div>

        <div className="mt-10 flex items-center justify-between">
          <div className={`text-[11px] tracking-[0.3em] transition-colors font-semibold ${isTop ? 'text-white/80' : 'text-white/30'}`}>
            BRAC BANK
          </div>
          {!isTop && (
            <div className="text-[9px] text-cyan-400 uppercase tracking-[0.2em] animate-pulse font-semibold">
              Next Account
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}