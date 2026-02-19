import { ArrowLeft, Check, X, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import RoleBadge from "../../../components/RoleBadge";
import {
  ROLES,
  PERMISSIONS,
  getRolePermissions,
  type RoleType,
  type PermissionCode,
} from "../../../data/userManagement";

interface RoleDetailsScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function RoleDetailsScreen({ onBack }: RoleDetailsScreenProps) {
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
          <h1 className="text-3xl font-serif tracking-tight">Role & Permissions</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Governance Matrix
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        {/* Governance Rules Banner */}
        <div className="mb-6 p-5 rounded-[24px] bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-cyan-400" />
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Governance Rules
            </h3>
          </div>
          <ul className="space-y-1.5 text-xs text-white/60">
            <li>Admin cannot also be Approver. No single user can both create + approve.</li>
            <li>Maker cannot approve anything they create.</li>
            <li>All actions are logged and immutable.</li>
            <li>Admin cannot bypass approval workflows.</li>
          </ul>
        </div>

        {/* Role Cards */}
        <div className="space-y-4 mb-8">
          {ROLES.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>

        {/* Permission Matrix */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
            Permission Matrix
          </p>
          <PermissionMatrix />
        </div>
      </div>
    </div>
  );
}

/* -------- Sub-Components -------- */

function RoleCard({ role }: { role: (typeof ROLES)[0] }) {
  const permissions = getRolePermissions(role.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className="p-5 rounded-[24px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">{role.icon}</span>
          <div>
            <h3 className="text-sm text-white/90 font-medium">{role.name}</h3>
            {!role.canDelete && (
              <span className="text-[9px] text-white/30 uppercase tracking-wider">
                System Role
              </span>
            )}
          </div>
        </div>
        <RoleBadge role={role.id} size="sm" showIcon={false} />
      </div>

      {/* Description */}
      <p className="text-xs text-white/50 mb-4">{role.description}</p>

      {/* Permissions */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">
          Permissions ({permissions.length})
        </p>
        <div className="space-y-2">
          {permissions.map((perm) => (
            <div
              key={perm.code}
              className="flex items-center gap-2 text-xs text-white/70"
            >
              <Check size={14} className="text-emerald-400" />
              <span>{perm.description}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PermissionMatrix() {
  return (
    <div className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 pr-4 text-xs font-semibold text-white/50 uppercase tracking-wider">
              Capability
            </th>
            {ROLES.map((role) => (
              <th
                key={role.id}
                className="text-center py-3 px-2 text-sm"
              >
                {role.icon}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map((perm, idx) => (
            <tr key={perm.code} className={idx % 2 === 0 ? "bg-white/[0.02]" : ""}>
              <td className="py-2.5 pr-4 text-white/60">
                {perm.description}
              </td>
              {ROLES.map((role) => (
                <td key={role.id} className="text-center py-2.5 px-2">
                  {role.permissions.includes(perm.code) ? (
                    <Check size={14} className="inline text-emerald-400" />
                  ) : (
                    <X size={14} className="inline text-white/10" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
