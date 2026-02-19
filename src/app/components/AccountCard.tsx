import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2 } from "lucide-react";

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

interface Account {
  id: number;
  title: string;
  accountNo: string;
  balance: number;
  status: string;
}

export default function AccountCard() {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 1,
      title: "PRAPTI Current Account",
      accountNo: "1074165690001",
      balance: 171155.29,
      status: "ACTIVE",
    },
    {
      id: 2,
      title: "EKOTA Current Account",
      accountNo: "2052836410002",
      balance: 1284596.36,
      status: "ACTIVE",
    },
    {
      id: 3,
      title: "Shadhin Current Account",
      accountNo: "3091274560003",
      balance: 452.12,
      status: "DORMANT",
    },
  ]);

  const handleDragEnd = (event: any, info: any) => {
    if (Math.abs(info.offset.x) > 80) {
      setAccounts((prev) => {
        const newArr = [...prev];
        const shifted = newArr.shift();
        if (shifted) newArr.push(shifted);
        return newArr;
      });
    }
  };

  return (
    <div className="relative w-full h-[280px] flex justify-center items-start bg-transparent overflow-hidden">
      <AnimatePresence initial={false}>
        {accounts.map((acc, index) => {
          const isTop = index === 0;
          return (
            <motion.div
              key={acc.id}
              style={{
                zIndex: accounts.length - index,
                position: "absolute",
                width: "100%",
                touchAction: "none",
              }}
              drag={isTop ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.94, y: 40, opacity: 0 }}
              animate={{
                scale: isTop ? 1 : 0.94,
                y: isTop ? 0 : 40,
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: 400,
                opacity: 0,
                scale: 0.9,
                transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },
              }}
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            >
              <CardItem acc={acc} isTop={isTop} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function CardItem({ acc, isTop }: { acc: Account; isTop: boolean }) {
  const isDormant = acc.status === "DORMANT";

  return (
    <div
      className={`
        relative mx-auto w-[90%] max-w-[340px]
        rounded-[24px] px-5 pb-4 pt-5
        bg-white transition-all duration-500
        ${isTop ? "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]" : "shadow-md"}
        border border-white/20
        group overflow-hidden
      `}
    >
      {/* 1. PREMIUM SHIMMER BEAM */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/60 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-[-25deg]" />
      </div>

      {/* 2. FILM GRAIN TEXTURE */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 3. CONDITIONAL RIBBON (Dormant Red vs Active Green) */}
      <div className={`absolute -right-2 top-6 rotate-45 z-20 transition-all duration-500 ${!isTop && "opacity-0 scale-50"}`}>
        <div className={`${isDormant ? "bg-red-500" : "bg-emerald-500"} px-8 py-[3px] text-[9px] font-black tracking-widest text-white shadow-lg`}>
          {acc.status}
        </div>
      </div>

      <div className="relative z-10">
        <div>
          <div className={`text-[15px] font-bold tracking-tight transition-colors duration-500 ${isTop ? "text-slate-900" : "text-slate-400"}`}>
            {acc.title}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-400 font-mono tracking-tighter italic">
            {acc.accountNo}
          </div>
        </div>

        <motion.div 
          animate={{ opacity: isTop ? 1 : 0 }} 
          className="mt-5 flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-70">
              Available Balance
            </div>
            <div className="mt-0.5 text-2xl font-serif font-bold text-emerald-600">
              {fmtBDT(acc.balance)}{" "}
              <span className="ml-1 align-middle text-xs font-semibold text-slate-400">
                BDT
              </span>
            </div>
          </div>

          <button className="grid h-10 w-10 place-items-center rounded-full bg-white border border-slate-100 text-slate-400 shadow-sm hover:text-[#002D52] transition-all active:scale-75">
            <Share2 size={16} />
          </button>
        </motion.div>

        <div className="mt-6 flex items-center justify-between">
          <div className={`text-[10px] font-black tracking-[0.25em] transition-colors ${isTop ? "text-slate-800" : "text-slate-300"}`}>
            BRAC BANK
          </div>
          {!isTop && (
            <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
              Swipe to Switch
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