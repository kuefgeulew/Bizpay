/**
 * PARTNER MARKETPLACE SCREEN
 * Read-only partner cards: Accounting, Logistics, Insurance.
 * "Contact Partner" → external link placeholder.
 * No integrations. No transactions. No endorsements.
 */

import { motion } from "motion/react";
import {
  ArrowLeft,
  Calculator,
  Truck,
  Shield,
  ExternalLink,
  Star,
  Users,
  Globe,
} from "lucide-react";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45 };

interface MarketplaceScreenProps {
  onBack: () => void;
}

interface Partner {
  id: string;
  name: string;
  category: "Accounting" | "Logistics" | "Insurance";
  description: string;
  features: string[];
  rating: number;
  users: string;
  website: string;
}

const PARTNERS: Partner[] = [
  {
    id: "p_001",
    name: "Tally Solutions",
    category: "Accounting",
    description: "End-to-end business management software for SMEs, trusted across South Asia.",
    features: ["GST Compliance", "Inventory Management", "Multi-currency"],
    rating: 4.5,
    users: "2M+",
    website: "https://tallysolutions.com",
  },
  {
    id: "p_002",
    name: "Zoho Books",
    category: "Accounting",
    description: "Cloud accounting platform with automated workflows and bank reconciliation.",
    features: ["Auto Bank Feeds", "Expense Tracking", "Client Portal"],
    rating: 4.3,
    users: "500K+",
    website: "https://zoho.com/books",
  },
  {
    id: "p_003",
    name: "Pathao Courier",
    category: "Logistics",
    description: "Last-mile delivery and logistics solutions for e-commerce and SME businesses.",
    features: ["Same-Day Delivery", "Cash on Delivery", "Live Tracking"],
    rating: 4.1,
    users: "50K+",
    website: "https://pathao.com",
  },
  {
    id: "p_004",
    name: "Paperfly Logistics",
    category: "Logistics",
    description: "Nationwide parcel delivery and warehousing services across Bangladesh.",
    features: ["Nationwide Coverage", "Warehouse Hub", "API Integration"],
    rating: 4.0,
    users: "30K+",
    website: "https://paperfly.com.bd",
  },
  {
    id: "p_005",
    name: "Green Delta Insurance",
    category: "Insurance",
    description: "Comprehensive business insurance solutions including trade credit and asset protection.",
    features: ["Trade Credit Cover", "Asset Insurance", "Health & Safety"],
    rating: 4.4,
    users: "100K+",
    website: "https://greendelta.com",
  },
  {
    id: "p_006",
    name: "Guardian Life Insurance",
    category: "Insurance",
    description: "Employee group insurance and business continuity solutions for SME sector.",
    features: ["Group Health Plans", "Key Person Cover", "Business Continuity"],
    rating: 4.2,
    users: "80K+",
    website: "https://guardianlife.com.bd",
  },
];

const CATEGORY_CONFIG = {
  Accounting: {
    icon: Calculator,
    gradient: "from-blue-500/10 to-indigo-500/10",
    border: "border-blue-500/20",
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10",
  },
  Logistics: {
    icon: Truck,
    gradient: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/20",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
  },
  Insurance: {
    icon: Shield,
    gradient: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/20",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
  },
};

export default function MarketplaceScreen({ onBack }: MarketplaceScreenProps) {
  const categories = ["Accounting", "Logistics", "Insurance"] as const;

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
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Marketplace</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Partner Directory
          </p>
        </div>
      </header>

      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={STIFF_SPRING}
        className="mb-6 p-4 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <p className="text-xs text-white/60 leading-relaxed">
          Explore vetted partners across accounting, logistics, and insurance categories.
          These are independent service providers — BizPay does not process transactions or manage credentials on their behalf.
        </p>
      </motion.div>

      {/* Categories + Partners */}
      {categories.map((cat, catIdx) => {
        const config = CATEGORY_CONFIG[cat];
        const Icon = config.icon;
        const catPartners = PARTNERS.filter((p) => p.category === cat);

        return (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...STIFF_SPRING, delay: 0.05 + catIdx * 0.08 }}
            className="mb-6"
          >
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-lg ${config.accentBg} border ${config.border} flex items-center justify-center`}>
                <Icon size={14} className={config.accent} />
              </div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-bold">
                {cat}
              </h2>
            </div>

            {/* Partner Cards */}
            <div className="space-y-3">
              {catPartners.map((partner, idx) => (
                <div
                  key={partner.id}
                  className={`rounded-[28px] bg-gradient-to-br ${config.gradient} border ${config.border} backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] p-5`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base text-white tracking-tight">{partner.name}</h3>
                      <p className="text-[10px] text-white/40 mt-0.5">{partner.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {partner.features.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[9px] text-white/40"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-white/50">{partner.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-white/30" />
                      <span className="text-[10px] text-white/40">{partner.users} users</span>
                    </div>
                  </div>

                  {/* Contact */}
                  <button
                    onClick={() => {
                      // External link placeholder — no actual navigation
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${config.border} ${config.accentBg} ${config.accent} text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/10`}
                  >
                    <Globe size={12} />
                    Contact Partner
                    <ExternalLink size={10} className="opacity-50" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
