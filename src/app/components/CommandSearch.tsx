import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, ArrowLeft, Command, CreditCard, 
  FileText, Activity, Zap, LucideIcon, Users, Settings
} from "lucide-react";

// --- Tactile Physics ---
const STIFF_SPRING = { type: "spring", stiffness: 550, damping: 38 };

// ──────────────────────────────────────────────────────────
// Search UI must remain phone-contained.
// Rendering outside phone frame is a design violation.
// ──────────────────────────────────────────────────────────
// CONTAINMENT RULES:
//   ❌ No position: fixed
//   ❌ No vh / vw units
//   ❌ No createPortal(document.body)
//   ✅ position: absolute, inset: 0, rendered inside phone container
// ──────────────────────────────────────────────────────────

// Icon mapping - defined outside component to prevent recreation
const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  creditCard: CreditCard,
  activity: Activity,
  fileText: FileText,
  users: Users,
  settings: Settings,
};

interface CommandSearchProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

interface CommandItem {
  id: string;
  label: string;
  sub: string;
  group: string;
  iconKey: string;
}

export default function CommandSearch({ open, onClose, onNavigate }: CommandSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when query changes
  useEffect(() => setSelectedIndex(0), [query]);

  // --- Data Structure with Icon Keys (not components) ---
  const commands: CommandItem[] = useMemo(() => [
    // Transfers
    { id: "mfs", label: "MFS Transfer", sub: "bKash, Nagad, Rocket, SureCash, Upay", group: "Transfers", iconKey: "zap" },
    { id: "own", label: "Own Account Transfer", sub: "Internal fund movement", group: "Transfers", iconKey: "creditCard" },
    { id: "thirdparty", label: "Third Party Transfer", sub: "Other account payments", group: "Transfers", iconKey: "creditCard" },
    { id: "directdebit", label: "Direct Debit", sub: "Auto-pay setup", group: "Transfers", iconKey: "creditCard" },

    // Collections
    { id: "collect", label: "Collect Money", sub: "Bangla QR, Payment Links, Virtual Accounts, T+0 Settlement", group: "Collections", iconKey: "activity" },
    { id: "receivables-intelligence", label: "Receivables Intelligence", sub: "AR Dashboard, Overdue Customers, Auto-Nudge", group: "Collections", iconKey: "activity" },
    { id: "vam", label: "Virtual Account Management", sub: "Distributor collections", group: "Collections", iconKey: "activity" },
    { id: "collections", label: "Collections Hub", sub: "VAM, DD Collection, Matching", group: "Collections", iconKey: "activity" },
    { id: "reconciliation", label: "Collection Reconciliation", sub: "Auto match & reports", group: "Collections", iconKey: "activity" },

    // Payments
    { id: "outflow-controls", label: "Outflow Controls", sub: "Scheduled Payments, Maker-Checker Delays", group: "Payments", iconKey: "activity" },
    { id: "payables-intelligence", label: "Payables Intelligence", sub: "Optimal Pay Date, Penalty vs Float", group: "Payments", iconKey: "activity" },
    { id: "credit-backstop", label: "Credit Backstop", sub: "OD / CC as fallback (NOT loan initiation)", group: "Payments", iconKey: "activity" },
    { id: "bill", label: "Bill Payment", sub: "Utilities & Fees", group: "Payments", iconKey: "fileText" },

    // Reconcile
    { id: "sweep-park", label: "Sweep & Park", sub: "Auto-sweep rules, Reverse sweep, Idle balance", group: "Reconcile", iconKey: "activity" },
    { id: "cash-locks", label: "Cash Locks", sub: "No-debit windows, Daily outflow caps", group: "Reconcile", iconKey: "activity" },

    // Insights
    { id: "insights", label: "Insights Hub", sub: "All behavioral intelligence & reporting", group: "Insights", iconKey: "activity" },
    { id: "smart-alerts", label: "Smart Alerts", sub: "Read-only behavioral cash insights", group: "Insights", iconKey: "activity" },
    { id: "smart-alerts", label: "Behavioral Alerts", sub: "Read-only cash behavior insights", group: "Insights", iconKey: "activity" },
    { id: "smart-alerts", label: "Cash Behavior", sub: "Behavioral cash insights", group: "Insights", iconKey: "activity" },
    { id: "smart-alerts", label: "CFO Insights", sub: "Behavioral intelligence", group: "Insights", iconKey: "activity" },
    { id: "cash-intelligence", label: "Cash Intelligence", sub: "Cash runway, Minimum safe balance, Seasonality", group: "Insights", iconKey: "activity" },
    { id: "reports", label: "Reports & Reconciliation", sub: "Download statements", group: "Insights", iconKey: "activity" },
    { id: "invoice", label: "Invoices & Outstanding", sub: "GST invoices & receivables tracker", group: "Insights", iconKey: "fileText" },
    { id: "reconrules", label: "Auto-Reconciliation Rules", sub: "Intelligent matching engine", group: "Insights", iconKey: "activity" },
    { id: "timeline", label: "EMI & Timeline", sub: "Schedule view", group: "Insights", iconKey: "activity" },
    { id: "activity", label: "Activity Log", sub: "Audit trail & system activity", group: "Insights", iconKey: "activity" },
    { id: "risk-dashboard", label: "Risk Dashboard", sub: "Fraud prevention & monitoring", group: "Insights", iconKey: "activity" },
    { id: "admin-insight", label: "Admin & Governance", sub: "Users, permissions, approval rules, audit", group: "Admin", iconKey: "activity" },

    // Accounts
    { id: "cash-buckets", label: "Cash Buckets", sub: "Payroll, Tax, Vendor, Free Cash allocation", group: "Accounts", iconKey: "activity" },
    { id: "tax-vault", label: "Tax Vault", sub: "GST / TDS parking, One-tap statutory payment", group: "Accounts", iconKey: "activity" },
    { id: "tax-vault", label: "Statutory Parking", sub: "Tax obligations accumulation", group: "Accounts", iconKey: "activity" },
    { id: "tax-vault", label: "GST Parking", sub: "VAT / TDS vault", group: "Accounts", iconKey: "activity" },
    { id: "tax-vault", label: "TDS Vault", sub: "Statutory cash parking", group: "Accounts", iconKey: "activity" },

    // Settings
    { id: "settings", label: "Settings Hub", sub: "Account management & configuration", group: "Settings", iconKey: "settings" },
    { id: "account-control-tower", label: "Account Control Tower", sub: "Consolidated business liquidity view", group: "Settings", iconKey: "settings" },
    { id: "account-control-tower", label: "Multi-Account View", sub: "All business accounts", group: "Settings", iconKey: "settings" },
    { id: "account-control-tower", label: "Liquidity View", sub: "Fragmentation insight", group: "Settings", iconKey: "settings" },
    { id: "account-control-tower", label: "Consolidation View", sub: "Account control tower", group: "Settings", iconKey: "settings" },
    { id: "cash-buckets", label: "Mental Accounting", sub: "Bucket allocation", group: "Settings", iconKey: "settings" },
    { id: "cash-buckets", label: "Sub-Balances", sub: "Visual allocation strategy", group: "Settings", iconKey: "settings" },
    { id: "cash-buckets", label: "Purpose-Based Cash", sub: "Mental accounting", group: "Settings", iconKey: "settings" },
    { id: "benefits-incentives", label: "Benefits & Incentives", sub: "Privileges earned through balance discipline", group: "Settings", iconKey: "activity" },

    // Beneficiary
    { id: "beneficiary", label: "Manage Beneficiaries", sub: "Add or remove recipients", group: "Settings", iconKey: "activity" },
    { id: "addbrac", label: "Add BRAC Bank Beneficiary", sub: "Internal beneficiary", group: "Settings", iconKey: "activity" },
    { id: "addother", label: "Add Other Bank Beneficiary", sub: "External beneficiary", group: "Settings", iconKey: "activity" },
    { id: "ppbeneficiary", label: "Positive Pay Beneficiary", sub: "Cheque safety list", group: "Settings", iconKey: "activity" },

    // Services
    { id: "positivepay", label: "Positive Pay", sub: "Cheque clearance", group: "Services", iconKey: "fileText" },
    { id: "cheque", label: "Chequebook Inventory", sub: "Track leaves", group: "Services", iconKey: "fileText" },
    { id: "servicerequest", label: "Service Requests", sub: "All service options", group: "Services", iconKey: "fileText" },

    // Approvals & Workflows
    { id: "approvals", label: "Approval Queue", sub: "Review pending requests", group: "Workflows", iconKey: "activity" },

    // Transaction Limits & Rules
    { id: "limits", label: "Transaction Limits", sub: "Role limits & escalation rules", group: "Workflows", iconKey: "activity" },
    { id: "transactionlimits", label: "Role-Based Limits", sub: "View limits per role", group: "Workflows", iconKey: "activity" },
    { id: "escalation", label: "Escalation Rules", sub: "Auto-approval workflows", group: "Workflows", iconKey: "activity" },

    // Beneficiary Governance
    { id: "beneficiarygovernance", label: "Beneficiary Governance", sub: "Lifecycle & approval workflows", group: "Workflows", iconKey: "activity" },
    { id: "beneficiaryapproval", label: "Beneficiary Approval", sub: "Review new recipients", group: "Workflows", iconKey: "activity" },
    { id: "beneficiaryrisk", label: "Beneficiary Risk", sub: "Cooling periods & flags", group: "Workflows", iconKey: "activity" },

    // Users
    { id: "usermanagement", label: "User Management", sub: "Manage users & roles", group: "Settings", iconKey: "users" },
    { id: "rolemanagement", label: "Role Management", sub: "Define roles & permissions", group: "Settings", iconKey: "users" },
    { id: "permissionmanagement", label: "Permission Management", sub: "Set access controls", group: "Settings", iconKey: "users" },
  ], []);

  // --- Filter & Group Logic ---
  const filtered = useMemo(() => 
    commands.filter(c => 
      c.label.toLowerCase().includes(query.toLowerCase()) || 
      c.sub.toLowerCase().includes(query.toLowerCase())
    ), 
  [query, commands]);

  // --- Keyboard Navigation ---
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onNavigate(filtered[selectedIndex].id);
          onClose();
          setQuery("");
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selectedIndex, onNavigate, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[200] flex flex-col">
          
          {/* 1. Backdrop with Grain & Blur — phone-contained */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#001E3C]/60 backdrop-blur-xl"
          >
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
            />
          </motion.div>

          {/* 2. The Command Hub — phone-contained, no viewport units */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={STIFF_SPRING}
            className="relative z-10 flex flex-col mx-3 mt-16 bg-[#0F172A] rounded-2xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-black/50"
            style={{ maxHeight: "calc(100% - 5rem)" }}
          >
            {/* Rim Light Effect */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] z-50" />

            {/* Input Header */}
            <div className="flex items-center px-4 py-4 border-b border-white/5 bg-white/[0.02] shrink-0">
              {/* Back Button */}
              <button 
                onClick={onClose}
                className="mr-3 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              
              <Search className="w-5 h-5 text-white/20" />
              
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where would you like to go?"
                className="w-full bg-transparent border-none outline-none text-white text-lg px-3 placeholder:text-white/20 font-light"
              />
            </div>

            {/* Results List — scrolls internally, no vh units */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {filtered.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-white/20">
                  <Command size={48} strokeWidth={1} className="mb-4 opacity-50" />
                  <p className="text-sm font-medium">No commands found</p>
                </div>
              ) : (
                filtered.map((item, i) => {
                  const isActive = i === selectedIndex;
                  const Icon = ICON_MAP[item.iconKey];

                  return (
                    <motion.div
                      key={`${item.id}-${i}`}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                        setQuery("");
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`relative group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors duration-200 ${
                        isActive ? "bg-cyan-500/20" : "hover:bg-white/5"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="highlight"
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 rounded-xl border border-cyan-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                          initial={false}
                          transition={STIFF_SPRING}
                        />
                      )}

                      <div className="relative flex items-center gap-4 z-10">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                          isActive 
                            ? "bg-cyan-400 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                            : "bg-white/5 border-white/5 text-white/40"
                        } transition-all duration-300`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-medium ${isActive ? "text-white" : "text-white/80"}`}>
                            {item.label}
                          </h4>
                          <span className={`text-xs ${isActive ? "text-cyan-200" : "text-white/30"}`}>
                            {item.group} • {item.sub}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center gap-3">
                        {isActive && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Jump to</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer / Shortcuts */}
            <div className="px-4 py-3 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 font-medium tracking-wide uppercase shrink-0">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="bg-white/10 px-1 rounded">↑↓</span> to navigate</span>
                <span className="flex items-center gap-1"><span className="bg-white/10 px-1 rounded">↵</span> to select</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                BizPay
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}