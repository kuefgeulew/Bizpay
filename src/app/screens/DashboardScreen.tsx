import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import AccountCard from "../components/AccountCard";
import { FolderOpen, Vault } from "lucide-react";

// Premium Stiff Spring Physics
const TACTILE_SPRING = { type: "spring", stiffness: 600, damping: 35 };

const CardImage = ({ isLive }: { isLive: boolean }) => {
  const CARD_ID = "1pPhY1-mvPEM1IorlxINDpXsTG5w2vVi2";
  const SOURCES = [
    `https://lh3.googleusercontent.com/d/${CARD_ID}=s1000`,
    `https://lh3.googleusercontent.com/d/${CARD_ID}`,
    `https://drive.google.com/thumbnail?id=${CARD_ID}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${CARD_ID}`,
  ];
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!failed ? (
        <img 
          src={SOURCES[idx]} 
          alt="Credit Card"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={() => {
            if (idx < SOURCES.length - 1) {
              setIdx(idx + 1);
            } else {
              setFailed(true);
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${isLive ? 'grayscale-0 scale-105' : 'grayscale-[0.4] brightness-75'}`}
        />
      ) : (
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#0a1628] transition-all duration-1000 ${isLive ? 'brightness-110' : 'brightness-75'}`}>
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            <div className="flex justify-between items-start">
              <div className="text-white/80 text-[10px] tracking-[0.2em] uppercase">Uddomi SME</div>
              <div className="text-cyan-400/80 text-[10px] tracking-wider">SIGNATURE</div>
            </div>
            <div className="space-y-2">
              <div className="text-white/60 text-xs tracking-[0.35em]">•••• •••• •••• 4829</div>
              <div className="text-white/40 text-[10px]">VALID THRU 12/28</div>
            </div>
          </div>
        </div>
      )}
      <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] pointer-events-none" />
    </div>
  );
};

interface DashboardScreenProps {
  activeTab: string;
  onNavigate?: (screen: string) => void;
}

export default function DashboardScreen({ activeTab, onNavigate }: DashboardScreenProps) {
  const [step, setStep] = useState("initial"); 
  const [timer, setTimer] = useState(168);
  const [isLive, setIsLive] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Trigger Sticky Notification after 10 seconds
  useEffect(() => {
    const trigger = setTimeout(() => {
      setShowNotification(true);
    }, 10000); 
    return () => clearTimeout(trigger);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const Grain = () => (
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );

  const perks = [
    { icon: "✈️", title: "Global Travel", desc: "10 Free LoungeKey Visits & Balaka Lounge access", color: "bg-blue-500/10" },
    { icon: "🍽️", title: "Elite Dining", desc: "Buy 1 Get 1 Free Buffet at top-tier hotels", color: "bg-amber-500/10" },
    { icon: "🛡️", title: "SME Protection", desc: "Up to BDT 40 Lac Accidental Death Insurance", color: "bg-purple-500/10" },
    { icon: "💎", title: "4X Rewards", desc: "Quadruple points on Groceries & SME spending", color: "bg-emerald-500/10" }
  ];

  return (
    <div className="relative min-h-full">
      {/* --- STICKY NOTIFICATION (Fitted to screen border) --- */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={TACTILE_SPRING}
            className="absolute top-4 left-4 right-4 z-[9999]"
          >
            <div className="relative w-full bg-[#002D52]/90 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 flex items-center gap-4 shadow-2xl overflow-hidden">
              <Grain />
              <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] pointer-events-none" />
              
              <div className="w-10 h-10 bg-[#EDBA12] rounded-xl flex items-center justify-center text-lg shadow-lg shrink-0">
                ⌛
              </div>
              
              <div className="flex-1">
                <h4 className="text-[#EDBA12] font-black text-[9px] uppercase tracking-[2px] mb-0.5">Payment Alert</h4>
                <p className="text-white text-[11px] leading-tight font-medium">
                  Your <span className="font-black text-[#EDBA12]">Druti Loan</span> is due tomorrow.
                </p>
              </div>
              
              <button onClick={() => setShowNotification(false)} className="text-white/40 text-xs p-2">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "Credit Card" ? (
        <div className="px-6 space-y-6 flex flex-col items-center pt-4 pb-24 min-h-full">
          {/* --- DYNAMIC CARD COMPONENT --- */}
          <motion.div 
            layout
            transition={TACTILE_SPRING}
            className="relative w-full aspect-[1.58/1] rounded-[22px] overflow-hidden border border-white/20 shadow-2xl"
          >
            <CardImage isLive={isLive} />
            <Grain />
            
            <AnimatePresence>
              {!isLive && step === "initial" && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center"
                >
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep("entry")}
                    className="bg-[#EDBA12] text-[#002D52] px-8 py-3 rounded-full font-black text-xs tracking-widest uppercase shadow-xl"
                  >
                    Activate Signature Card
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {isLive && (
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-4 right-4">
                <div className="bg-green-500/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-lg">
                  <p className="text-white text-[8px] font-black uppercase tracking-tighter">● Card Active</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "entry" && (
              <motion.div key="entry" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full bg-white/[0.04] backdrop-blur-2xl rounded-[28px] p-8 shadow-2xl space-y-5 border border-white/10 relative overflow-hidden">
                <Grain />
                <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[28px] pointer-events-none" />
                <h3 className="font-serif text-white text-sm uppercase tracking-tight border-b border-white/10 pb-3">Activation Details</h3>
                <div className="space-y-4 text-[11px]">
                  <div className="space-y-1">
                    <label className="text-white/40 font-bold uppercase text-[9px]">Linked Card</label>
                    <div className="p-4 bg-white/[0.05] rounded-xl text-white/90 font-bold border border-white/10">4777-92XX-XXXX-5678</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/40 font-bold uppercase text-[9px]">Security Verification</label>
                    <input type="password" placeholder="Enter 1234" className="w-full p-4 bg-white/[0.05] border-b-2 border-[#EDBA12] outline-none rounded-t-xl font-mono text-lg text-white placeholder-white/30" maxLength={4} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1"><label className="text-white/40 font-bold uppercase text-[9px]">Expiry Month</label><select className="w-full p-3 bg-white/[0.05] border-b border-white/10 rounded-lg text-white/90"><option>08</option></select></div>
                    <div className="flex-1 space-y-1"><label className="text-white/40 font-bold uppercase text-[9px]">Expiry Year</label><select className="w-full p-3 bg-white/[0.05] border-b border-white/10 rounded-lg text-white/90"><option>2030</option></select></div>
                  </div>
                </div>
                <button onClick={() => setStep("confirm")} className="w-full py-4 bg-[#EDBA12] text-[#002D52] rounded-[18px] font-black text-xs tracking-widest mt-4 shadow-lg">CONTINUE</button>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div key="confirm" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full bg-white/[0.04] backdrop-blur-2xl rounded-[28px] p-8 shadow-2xl space-y-6 border border-white/10 relative overflow-hidden">
                <Grain />
                <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[28px] pointer-events-none" />
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/40 font-medium">Card Name</span><span className="text-white/90 font-bold">TANVIR HASAN</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/40 font-medium">Card Number</span><span className="text-white/90 font-bold">4777 9200 1234 5678</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/40 font-medium">Status</span><span className="text-[#EDBA12] font-black">PENDING ACTIVATION</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/40 font-medium">Auth Channel</span><span className="text-white/90 font-bold">SMS (+88017******12)</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("entry")} className="flex-1 py-4 border border-white/20 rounded-2xl text-white/60 font-bold text-xs">CANCEL</button>
                  <button onClick={() => setStep("otp")} className="flex-1 py-4 bg-[#EDBA12] text-[#002D52] rounded-2xl font-black text-xs shadow-lg">SEND OTP</button>
                </div>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full bg-white/[0.04] backdrop-blur-2xl rounded-[28px] p-10 text-white flex flex-col items-center space-y-8 shadow-2xl border border-white/10 relative overflow-hidden">
                <Grain />
                <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[28px] pointer-events-none" />
                <div className="text-center space-y-2">
                  <h4 className="text-[#EDBA12] font-black text-xs tracking-[4px] uppercase">Verify OTP</h4>
                  <p className="text-white/40 text-[10px]">6-digit code sent to your phone</p>
                </div>
                <div className="flex gap-2">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="w-10 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center font-bold text-lg shadow-inner">{" "}</div>)}
                </div>
                <button onClick={() => { setStep("success"); setIsLive(true); }} className="w-full py-4 bg-[#EDBA12] text-[#002D52] rounded-2xl font-black uppercase tracking-widest text-xs">Verify & Complete</button>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full py-10 flex flex-col items-center text-center space-y-6 relative">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 text-3xl shadow-[0_0_40px_rgba(34,197,94,0.2)]">✓</div>
                <div className="space-y-2">
                  <h2 className="font-serif text-white text-2xl">Success</h2>
                  <p className="text-white/50 text-xs px-10 leading-relaxed uppercase tracking-tighter font-bold">Uddomi Sme Signature Credit Card is now active</p>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep("perks")}
                  className="px-16 py-4 bg-[#EDBA12] text-[#002D52] rounded-full font-black text-[10px] tracking-[2px] uppercase shadow-xl"
                >
                  See Perks
                </motion.button>
              </motion.div>
            )}

            {step === "perks" && (
              <motion.div key="perks" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full space-y-4">
                <div className="grid grid-cols-1 gap-3 w-full">
                  {perks.map((perk, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ x: -20, opacity: 0 }} 
                      animate={{ x: 0, opacity: 1 }} 
                      transition={{ delay: i * 0.1, ...TACTILE_SPRING }}
                      className="p-5 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] flex items-center gap-5 group relative overflow-hidden shadow-lg"
                    >
                      <Grain />
                      <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[28px] pointer-events-none" />
                      <div className={`w-14 h-14 rounded-2xl ${perk.color} backdrop-blur-sm border border-white/10 flex items-center justify-center text-2xl`}>
                        {perk.icon}
                      </div>
                      <div className="flex-1 relative z-10">
                        <h4 className="text-cyan-400 font-black text-[10px] uppercase tracking-widest mb-1">{perk.title}</h4>
                        <p className="text-white/60 text-[11px] leading-snug">{perk.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep("initial")}
                  className="w-full py-4 text-white/30 font-bold text-[9px] uppercase tracking-[4px] border border-white/10 rounded-full backdrop-blur-sm"
                >
                  Close Gallery
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="px-6 space-y-6">
          <AccountCard />
        </div>
      )}
    </div>
  );
}