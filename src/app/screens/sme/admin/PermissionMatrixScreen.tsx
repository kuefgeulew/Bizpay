import { useState } from "react";
import { ArrowLeft, Grid3X3, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ROLES, type RoleType } from "../../../data/userManagement";
import {
  FEATURE_PERMISSIONS,
  getAccessLevelColor,
  type FeaturePermission,
  type AccessLevel,
} from "../../../data/adminGovernance";

interface PermissionMatrixScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function PermissionMatrixScreen({ onBack }: PermissionMatrixScreenProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType | "all">("all");

  const visibleRoles = ROLES.filter(r =>
    selectedRole === "all" ? true : r.id === selectedRole
  );

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
          <h1 className="text-3xl font-serif tracking-tight">Access Control</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Feature-Level Permission Matrix
          </p>
        </div>
      </header>

      {/* Role Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="mb-6"
      >
        <div className="flex gap-2 overflow-x-auto pb-2">
          <RoleFilterChip
            label="All Roles"
            isActive={selectedRole === "all"}
            onClick={() => setSelectedRole("all")}
            color="#06B6D4"
          />
          {ROLES.map(role => (
            <RoleFilterChip
              key={role.id}
              label={role.name}
              isActive={selectedRole === role.id}
              onClick={() => setSelectedRole(role.id)}
              color={role.color}
            />
          ))}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-6 p-4 rounded-[24px] bg-white/[0.03] border border-white/[0.06]"
      >
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3">
          Access Levels
        </p>
        <div className="flex flex-wrap gap-2">
          {(["VIEW", "INITIATE", "APPROVE", "MODIFY", "NONE"] as AccessLevel[]).map(level => (
            <span
              key={level}
              className={`px-2.5 py-1 text-[9px] font-bold rounded-full ${getAccessLevelColor(level)}`}
            >
              {level}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Permission Matrix */}
      <div className="space-y-3">
        {FEATURE_PERMISSIONS.map((fp, i) => (
          <FeatureRow
            key={fp.featureArea}
            feature={fp}
            roles={visibleRoles}
            isExpanded={expandedFeature === fp.featureArea}
            onToggle={() =>
              setExpandedFeature(
                expandedFeature === fp.featureArea ? null : fp.featureArea
              )
            }
            delay={0.05 + i * 0.03}
          />
        ))}
      </div>
    </div>
  );
}

/* -------- Sub-Components -------- */

function RoleFilterChip({
  label,
  isActive,
  onClick,
  color,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
        isActive
          ? "text-white border"
          : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
      }`}
      style={isActive ? { backgroundColor: `${color}20`, borderColor: `${color}50`, color } : undefined}
    >
      {label}
    </button>
  );
}

function FeatureRow({
  feature,
  roles,
  isExpanded,
  onToggle,
  delay,
}: {
  feature: FeaturePermission;
  roles: typeof ROLES;
  isExpanded: boolean;
  onToggle: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 rounded-[24px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-left transition-all hover:border-white/20 active:scale-[0.99]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Grid3X3 size={14} className="text-cyan-400" />
            </div>
            <span className="text-sm text-white/90 font-medium">{feature.label}</span>
          </div>
          {isExpanded ? (
            <ChevronUp size={16} className="text-white/40" />
          ) : (
            <ChevronDown size={16} className="text-white/40" />
          )}
        </div>

        {/* Compact badge row */}
        <div className="flex flex-wrap gap-1.5">
          {roles.map(role => {
            const levels = feature.accessByRole[role.id];
            return (
              <div key={role.id} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: role.color }}
                />
                {levels.map(level => (
                  <span
                    key={`${role.id}-${level}`}
                    className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${getAccessLevelColor(level)}`}
                  >
                    {level}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-4 rounded-[20px] bg-white/[0.02] border border-white/5 space-y-3">
              {roles.map(role => (
                <div key={role.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{role.icon}</span>
                    <span className="text-xs text-white/70">{role.name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {feature.accessByRole[role.id].map(level => (
                      <span
                        key={`detail-${role.id}-${level}`}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${getAccessLevelColor(level)}`}
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
