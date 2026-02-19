import {
  ArrowLeft,
  Shield,
  Lock,
  Unlock,
  Award,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  BENEFIT_CATEGORIES,
  BENEFIT_HISTORY,
  RELATIONSHIP_TIER,
  type BenefitCategory,
  type BenefitHistoryEntry,
} from "../../../data/incentives.mock";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface BenefitsIncentivesScreenProps {
  onBack: () => void;
}

export default function BenefitsIncentivesScreen({ onBack }: BenefitsIncentivesScreenProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("cat_fw");

  const totalBenefits = BENEFIT_CATEGORIES.reduce((sum, cat) => sum + cat.benefits.length, 0);
  const unlockedCount = BENEFIT_CATEGORIES.reduce(
    (sum, cat) => sum + cat.benefits.filter((b) => b.status === "unlocked").length,
    0
  );

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
        <div className="flex-1">
          <h1 className="text-3xl font-serif tracking-tight">Benefits & Incentives</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Earned Privileges
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-[10px] font-bold text-cyan-400">
            {unlockedCount}/{totalBenefits} Unlocked
          </p>
        </div>
      </header>

      {/* ── Section 1: Relationship Tier ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Relationship Tier
        </p>

        <div className="p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Shield size={22} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-serif text-white tracking-tight">
                  {RELATIONSHIP_TIER.label}
                </p>
                <span className="px-3 py-1 text-[8px] font-bold uppercase tracking-wider rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                  Current Status
                </span>
              </div>
              <p className="text-[10px] text-white/40 mt-1.5">
                {RELATIONSHIP_TIER.condition}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Benefit Categories ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.08 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Benefit Categories
        </p>

        <div className="space-y-4">
          {BENEFIT_CATEGORIES.map((category) => (
            <BenefitCategoryCard
              key={category.id}
              category={category}
              expanded={expandedCategory === category.id}
              onToggleExpand={() =>
                setExpandedCategory(expandedCategory === category.id ? null : category.id)
              }
            />
          ))}
        </div>
      </motion.div>

      {/* ── Section 3: Benefit History ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.16 }}
        className="mb-6"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Benefit History
        </p>

        <div className="space-y-2">
          {BENEFIT_HISTORY.map((entry, i) => (
            <BenefitHistoryRow key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </motion.div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.28 }}
        className="p-4 rounded-[24px] bg-cyan-500/[0.04] border border-cyan-500/10 backdrop-blur-xl"
      >
        <p className="text-xs text-white/60 text-center">
          <span className="font-semibold text-cyan-400">Behavior-bound:</span>{" "}
          Benefits reflect past account behavior only. They carry no monetary value and involve no cash movement.
        </p>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────── */

function BenefitCategoryCard({
  category,
  expanded,
  onToggleExpand,
}: {
  category: BenefitCategory;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const unlockedInCategory = category.benefits.filter((b) => b.status === "unlocked").length;
  const totalInCategory = category.benefits.length;

  const getCategoryIcon = () => {
    switch (category.type) {
      case "fee-waivers":
        return Award;
      case "preferential-pricing":
        return Briefcase;
      case "operational-privileges":
        return Shield;
      default:
        return Award;
    }
  };

  const CategoryIcon = getCategoryIcon();

  return (
    <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-5 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <CategoryIcon size={18} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-serif text-white tracking-tight">{category.label}</p>
          <p className="text-[10px] text-white/40 mt-0.5">{category.description}</p>
        </div>
        <span className="px-2.5 py-1 text-[8px] font-bold rounded-full uppercase tracking-wider mr-2 bg-cyan-500/10 text-cyan-400/70 border border-cyan-500/15">
          {unlockedInCategory}/{totalInCategory}
        </span>
        {expanded ? (
          <ChevronUp size={16} className="text-white/30" />
        ) : (
          <ChevronDown size={16} className="text-white/30" />
        )}
      </button>

      {/* Expanded Benefits */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              <div className="border-t border-white/5 pt-4" />

              {category.benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className={`p-4 rounded-[20px] border transition-all ${
                    benefit.status === "unlocked"
                      ? "bg-emerald-500/[0.04] border-emerald-500/15"
                      : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        benefit.status === "unlocked"
                          ? "bg-emerald-500/10 border border-emerald-500/20"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      {benefit.status === "unlocked" ? (
                        <Unlock size={14} className="text-emerald-400" />
                      ) : (
                        <Lock size={14} className="text-white/25" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`text-sm ${
                            benefit.status === "unlocked" ? "text-white/80" : "text-white/40"
                          }`}
                        >
                          {benefit.label}
                        </p>
                        <span
                          className={`px-2 py-0.5 text-[7px] font-bold rounded-full uppercase tracking-wider shrink-0 ${
                            benefit.status === "unlocked"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-white/5 text-white/25 border border-white/10"
                          }`}
                        >
                          {benefit.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/30 leading-relaxed">
                        {benefit.qualificationCondition}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BenefitHistoryRow({ entry, index }: { entry: BenefitHistoryEntry; index: number }) {
  const getEventStyle = () => {
    switch (entry.event) {
      case "granted":
        return {
          icon: Plus,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        };
      case "renewed":
        return {
          icon: RotateCcw,
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/20",
          badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
        };
      case "expired":
        return {
          icon: Minus,
          color: "text-white/40",
          bg: "bg-white/5",
          border: "border-white/10",
          badge: "bg-white/5 text-white/30 border-white/10",
        };
    }
  };

  const style = getEventStyle();
  const EventIcon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay: 0.2 + index * 0.03 }}
      className="p-4 rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full ${style.bg} border ${style.border} flex items-center justify-center shrink-0 mt-0.5`}
        >
          <EventIcon size={14} className={style.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/80 leading-snug">{entry.benefitLabel}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <Clock size={9} className="text-white/25" />
              <p className="text-[9px] text-white/35">{entry.timestamp}</p>
            </div>
            <p className="text-[9px] text-white/30">{entry.reason}</p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 text-[7px] font-bold rounded-full uppercase tracking-wider shrink-0 border ${style.badge}`}
        >
          {entry.event}
        </span>
      </div>
    </motion.div>
  );
}