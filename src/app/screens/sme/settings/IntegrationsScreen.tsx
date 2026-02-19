/**
 * ACCOUNTING INTEGRATIONS SCREEN (Mock)
 * Tally / Zoho / QuickBooks cards.
 * Connection status: Not Connected.
 * Sync Scope view (Invoices, Payments, GST).
 * No data sync. No background jobs. No credentials.
 */

import { motion } from "motion/react";
import {
  ArrowLeft,
  Unplug,
  FileText,
  CreditCard,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  CircleDot,
} from "lucide-react";
import { useState } from "react";

const STIFF_SPRING = { type: "spring" as const, stiffness: 600, damping: 45 };

interface IntegrationsScreenProps {
  onBack: () => void;
}

interface Integration {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: "not_connected";
  syncScopes: SyncScope[];
}

interface SyncScope {
  label: string;
  icon: React.ReactNode;
  direction: "Export" | "Import" | "Bi-directional";
  dataPoints: string[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: "int_tally",
    name: "Tally Prime",
    logo: "T",
    description: "Sync invoices, payments, and GST data with Tally Prime for seamless accounting.",
    status: "not_connected",
    syncScopes: [
      {
        label: "Invoices",
        icon: <FileText size={14} />,
        direction: "Export",
        dataPoints: ["Invoice Number", "Client Details", "Line Items", "Tax Breakdown", "Payment Status"],
      },
      {
        label: "Payments",
        icon: <CreditCard size={14} />,
        direction: "Export",
        dataPoints: ["Transaction ID", "Amount", "Recipient", "Date", "Status"],
      },
      {
        label: "GST Reports",
        icon: <FileSpreadsheet size={14} />,
        direction: "Export",
        dataPoints: ["CGST / SGST Split", "Outward Supply", "Inward Supply", "Net Payable"],
      },
    ],
  },
  {
    id: "int_zoho",
    name: "Zoho Books",
    logo: "Z",
    description: "Automate bookkeeping by connecting BizPay transactions to Zoho Books.",
    status: "not_connected",
    syncScopes: [
      {
        label: "Invoices",
        icon: <FileText size={14} />,
        direction: "Bi-directional",
        dataPoints: ["Invoice Records", "Client Mapping", "Due Dates", "Outstanding Amounts"],
      },
      {
        label: "Payments",
        icon: <CreditCard size={14} />,
        direction: "Export",
        dataPoints: ["Bank Transfers", "MFS Payments", "Bill Payments", "Collections"],
      },
      {
        label: "GST Reports",
        icon: <FileSpreadsheet size={14} />,
        direction: "Export",
        dataPoints: ["Tax Summary", "Period Reports", "Filing Data"],
      },
    ],
  },
  {
    id: "int_quickbooks",
    name: "QuickBooks",
    logo: "Q",
    description: "Connect to QuickBooks Online for automated journal entries and reconciliation.",
    status: "not_connected",
    syncScopes: [
      {
        label: "Invoices",
        icon: <FileText size={14} />,
        direction: "Export",
        dataPoints: ["Invoice Data", "Customer Records", "Tax Lines"],
      },
      {
        label: "Payments",
        icon: <CreditCard size={14} />,
        direction: "Export",
        dataPoints: ["Payment Records", "Vendor Payments", "Salary Disbursements"],
      },
      {
        label: "GST Reports",
        icon: <FileSpreadsheet size={14} />,
        direction: "Export",
        dataPoints: ["Tax Collected", "Input Credits", "Net Position"],
      },
    ],
  },
];

const LOGO_COLORS: Record<string, string> = {
  T: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Z: "bg-red-500/20 text-red-400 border-red-500/30",
  Q: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function IntegrationsScreen({ onBack }: IntegrationsScreenProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          <h1 className="text-3xl font-serif tracking-tight">Integrations</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Accounting Connections
          </p>
        </div>
      </header>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={STIFF_SPRING}
        className="mb-6 p-4 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
      >
        <p className="text-xs text-white/60 leading-relaxed">
          View available accounting integrations and their data sync scope. Connection setup requires
          credentials that are managed outside this interface. No data sync or background processes
          are active.
        </p>
      </motion.div>

      {/* Integration Cards */}
      <div className="space-y-4">
        {INTEGRATIONS.map((integration, idx) => {
          const isExpanded = expandedId === integration.id;
          const logoColor = LOGO_COLORS[integration.logo] || "bg-white/10 text-white/60 border-white/10";

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...STIFF_SPRING, delay: 0.05 + idx * 0.08 }}
              className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden"
            >
              <div className="p-5">
                {/* Top Row */}
                <div className="flex items-start gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg font-serif shrink-0 ${logoColor}`}>
                    {integration.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base text-white tracking-tight">{integration.name}</h3>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">{integration.description}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Unplug size={12} className="text-white/20" />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-bold">
                      Not Connected
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40 font-semibold hover:bg-white/10 transition-all"
                  >
                    Sync Scope
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

                {/* Expanded Sync Scope */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={STIFF_SPRING}
                    className="pt-3 border-t border-white/10"
                  >
                    <p className="text-[9px] uppercase tracking-[0.2em] text-cyan-400/60 font-bold mb-3">
                      Data Sync Scope
                    </p>

                    <div className="space-y-3">
                      {integration.syncScopes.map((scope) => (
                        <div
                          key={scope.label}
                          className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white/40">{scope.icon}</span>
                              <span className="text-[11px] text-white/70 font-semibold">
                                {scope.label}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[8px] text-white/30 uppercase tracking-wider">
                              {scope.direction}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {scope.dataPoints.map((dp) => (
                              <span
                                key={dp}
                                className="flex items-center gap-1 text-[9px] text-white/30"
                              >
                                <CircleDot size={6} className="text-white/15" />
                                {dp}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[8px] text-white/15 mt-3 text-center">
                      Scope shown for reference. No active data transfer.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
