import { useState, useEffect } from "react";
import { ArrowLeft, Users, Grid3X3, GitBranch, ShieldAlert, Fingerprint, FileSearch, Building2 } from "lucide-react";
import { motion } from "motion/react";
import { ACTIVITY_LOG, type ActivityLogEntry } from "../../../data/activityLog";

// Sub-screens
import UserManagementHub from "../usermanagement/UserManagementHub";
import PermissionMatrixScreen from "./PermissionMatrixScreen";
import ApprovalWorkflowScreen from "./ApprovalWorkflowScreen";
import AdminTransactionLimitsScreen from "./AdminTransactionLimitsScreen";
import DeviceSecurityScreen from "./DeviceSecurityScreen";
import AuditComplianceScreen from "./AuditComplianceScreen";
import BusinessProfilesScreen from "./BusinessProfilesScreen";

interface AdminHubProps {
  onBack: () => void;
}

type AdminView =
  | "hub"
  | "users"
  | "access-control"
  | "approval-rules"
  | "transaction-limits"
  | "security"
  | "audit"
  | "business-profiles";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function AdminHub({ onBack }: AdminHubProps) {
  const [view, setView] = useState<AdminView>("hub");

  useEffect(() => {
    const logEntry: ActivityLogEntry = {
      id: `log_admin_hub_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_002",
      userName: "Current User",
      userRole: "admin",
      action: "LOGIN" as any,
      category: "AUTHENTICATION",
      severity: "INFO",
      description: "Opened Admin & Governance Hub",
      entityType: "admin_hub",
      metadata: {},
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(logEntry);
  }, []);

  // Internal routing — sub-screens manage their own back buttons
  switch (view) {
    case "users":
      return <UserManagementHub onBack={() => setView("hub")} />;
    case "access-control":
      return <PermissionMatrixScreen onBack={() => setView("hub")} />;
    case "approval-rules":
      return <ApprovalWorkflowScreen onBack={() => setView("hub")} />;
    case "transaction-limits":
      return <AdminTransactionLimitsScreen onBack={() => setView("hub")} />;
    case "security":
      return <DeviceSecurityScreen onBack={() => setView("hub")} />;
    case "audit":
      return <AuditComplianceScreen onBack={() => setView("hub")} />;
    case "business-profiles":
      return <BusinessProfilesScreen onBack={() => setView("hub")} />;
  }

  // Hub landing
  const sections: {
    category: string;
    items: AdminCard[];
  }[] = [
    {
      category: "User & Access Control",
      items: [
        {
          id: "users",
          label: "Users",
          description: "Sub-user management, role assignment",
          icon: Users,
          accent: false,
        },
        {
          id: "access-control",
          label: "Access Control",
          description: "Feature-level permission matrix",
          icon: Grid3X3,
          accent: false,
        },
      ],
    },
    {
      category: "Approval & Rule Engines",
      items: [
        {
          id: "approval-rules",
          label: "Approval Rules",
          description: "Multi-level chains, SLA timers, escalation",
          icon: GitBranch,
          accent: true,
        },
        {
          id: "transaction-limits",
          label: "Transaction Limits",
          description: "Per-role caps, daily/monthly, auto-block",
          icon: ShieldAlert,
          accent: true,
        },
      ],
    },
    {
      category: "Security & Trust",
      items: [
        {
          id: "security",
          label: "Security",
          description: "Device binding, sessions, token control",
          icon: Fingerprint,
          accent: false,
        },
        {
          id: "audit",
          label: "Audit & Compliance",
          description: "Immutable logs, override records, breach history",
          icon: FileSearch,
          accent: false,
        },
      ],
    },
    {
      category: "Entity Structure",
      items: [
        {
          id: "business-profiles",
          label: "Business Profiles",
          description: "Multi-entity management, context switching",
          icon: Building2,
          accent: false,
        },
      ],
    },
  ];

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
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
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Admin</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Governance • Access • Compliance
          </p>
        </div>
      </header>

      {/* Purpose Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-8 p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        <p className="text-sm text-white/80 leading-relaxed">
          Configure once, govern always. Users, permissions, approval chains, limits, security, and audit — all in one place.
        </p>
      </motion.div>

      {/* Section Cards */}
      {sections.map((section, catIndex) => (
        <div key={section.category} className="mb-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.05 + catIndex * 0.05 }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
              {section.category}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-3">
            {section.items.map((card, i) => {
              const Icon = card.icon;
              const isAccent = card.accent;

              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING, delay: 0.1 + catIndex * 0.05 + i * 0.03 }}
                  onClick={() => setView(card.id as AdminView)}
                  className={`group relative p-5 rounded-[28px] border backdrop-blur-xl text-left transition-all duration-300 active:scale-[0.98] ${
                    isAccent
                      ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50 shadow-[inset_0_1px_1px_rgba(6,182,212,0.2)]"
                      : "bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isAccent
                          ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/30"
                          : "bg-white/5 border border-white/10 text-white/60 group-hover:bg-white/10 group-hover:text-white/80"
                      }`}
                    >
                      <Icon size={20} strokeWidth={isAccent ? 2.5 : 2} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base text-white group-hover:text-cyan-400 transition-colors">
                          {card.label}
                        </h3>
                      </div>
                      <p
                        className={`text-sm ${isAccent ? "text-cyan-200/80" : "text-white/60"}`}
                      >
                        {card.description}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isAccent ? "bg-cyan-500/20 text-cyan-400" : "bg-white/10 text-white/60"
                        }`}
                      >
                        <span className="text-sm">&rarr;</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------- Type -------- */

interface AdminCard {
  id: string;
  label: string;
  description: string;
  icon: any;
  accent: boolean;
}