import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Users,
  CreditCard,
  ChevronRight,
  Hash,
  CheckCircle,
  Eye,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// ⚠️ ADMIN-ONLY IMPORT — Isolated data store
import {
  BUSINESS_PROFILES,
  getProfileStatusConfig,
  getRegistrationLabel,
  type BusinessProfile,
} from "../../../mock/businessProfiles";

// Audit triple-write sinks
import {
  AUDIT_EVENTS,
  type AuditEvent,
} from "../../../data/adminGovernance";
import { createActivityLog } from "../../../mock/activityLogs";
import {
  ACTIVITY_LOG,
  type ActivityLogEntry,
} from "../../../data/activityLog";

interface BusinessProfilesScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function BusinessProfilesScreen({ onBack }: BusinessProfilesScreenProps) {
  const [profiles, setProfiles] = useState(BUSINESS_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<BusinessProfile | null>(null);

  const currentProfile = profiles.find((p) => p.isCurrent);
  const activeProfiles = profiles.filter((p) => p.status === "ACTIVE").length;
  const totalUsers = profiles.reduce((sum, p) => sum + p.userCount, 0);
  const totalAccounts = profiles.reduce((sum, p) => sum + p.accountCount, 0);

  /**
   * ADMIN_CONTEXT_SWITCH — Triple-write audit + visual context update
   * No approval required. Admin-level viewing context only.
   */
  const handleSwitchContext = (targetId: string) => {
    const fromProfile = profiles.find((p) => p.isCurrent);
    const toProfile = profiles.find((p) => p.id === targetId);

    if (!fromProfile || !toProfile) return;
    if (fromProfile.id === toProfile.id) return;

    const timestamp = new Date().toISOString();
    const auditId = `audit_ctx_${Date.now()}`;

    // ── Sink 1: AUDIT_EVENTS ──
    const auditEvent: AuditEvent = {
      id: auditId,
      timestamp,
      eventType: "SYSTEM_CONFIG_CHANGE",
      severity: "INFO",
      actorId: "usr_002",
      actorName: "Current User",
      actorRole: "admin",
      description: `Admin context switched from "${fromProfile.tradeName}" to "${toProfile.tradeName}"`,
      details: {
        action: "ADMIN_CONTEXT_SWITCH",
        fromEntityId: fromProfile.id,
        toEntityId: toProfile.id,
        fromEntityName: fromProfile.tradeName,
        toEntityName: toProfile.tradeName,
        userId: "usr_002",
        isImmutable: true,
      },
      isImmutable: true,
      correlationId: auditId,
    };
    AUDIT_EVENTS.unshift(auditEvent);

    // ── Sink 2: ACTIVITY_LOGS (via createActivityLog) ──
    createActivityLog(
      "usr_002",
      "Current User",
      "admin",
      "LOGIN" as any, // Closest action type for context switch
      `Admin context switched: ${fromProfile.tradeName} → ${toProfile.tradeName}`,
      {
        action: "ADMIN_CONTEXT_SWITCH",
        fromEntityId: fromProfile.id,
        toEntityId: toProfile.id,
        userId: "usr_002",
        correlationId: auditId,
      },
      "INFO"
    );

    // ── Sink 3: ACTIVITY_LOG (Enhanced Activity Log) ──
    const enhancedEntry: ActivityLogEntry = {
      id: `log_ctx_${Date.now()}`,
      timestamp,
      userId: "usr_002",
      userName: "Current User",
      userRole: "admin",
      action: "LOGIN" as any,
      category: "AUTHENTICATION",
      severity: "INFO",
      description: `Admin context switched: ${fromProfile.tradeName} → ${toProfile.tradeName}`,
      entityType: "business_profile",
      entityId: toProfile.id,
      correlationId: auditId,
      metadata: {
        action: "ADMIN_CONTEXT_SWITCH",
        fromEntityId: fromProfile.id,
        toEntityId: toProfile.id,
        userId: "usr_002",
      },
      isImmutable: true,
    };
    ACTIVITY_LOG.unshift(enhancedEntry);

    // ── State update — Admin visual context only ──
    setProfiles((prev) =>
      prev.map((p) => ({ ...p, isCurrent: p.id === targetId }))
    );

    toast.success("Context Switched", {
      description: `Viewing Admin context for: ${toProfile.tradeName}`,
    });

    setSelectedProfile(null);
  };

  // ── Detail View ──
  if (selectedProfile) {
    return (
      <ProfileDetailView
        profile={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        onSwitch={() => handleSwitchContext(selectedProfile.id)}
        isCurrent={selectedProfile.id === currentProfile?.id}
      />
    );
  }

  // ── List View ──
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
          <h1 className="text-3xl font-serif tracking-tight">Business Profiles</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Entity Structure & Context
          </p>
        </div>
      </header>

      {/* Active Context Banner */}
      <AnimatePresence mode="wait">
        {currentProfile && (
          <motion.div
            key={currentProfile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={SPRING}
            className="mb-6 p-5 rounded-[28px] bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(6,182,212,0.15)]"
          >
            <div className="flex items-center gap-3 mb-2">
              <Eye size={16} className="text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/80 font-bold">
                Viewing Admin Context For
              </span>
            </div>
            <h3 className="text-lg text-white font-medium">{currentProfile.tradeName}</h3>
            <p className="text-xs text-white/50 mt-1">
              {currentProfile.legalName} · {getRegistrationLabel(currentProfile.registrationType)} · {currentProfile.registrationNo}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Entities</p>
          <p className="text-xl text-white">{activeProfiles}</p>
          <p className="text-[10px] text-white/30">Active</p>
        </div>
        <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Users</p>
          <p className="text-xl text-white">{totalUsers}</p>
          <p className="text-[10px] text-white/30">Total</p>
        </div>
        <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Accounts</p>
          <p className="text-xl text-white">{totalAccounts}</p>
          <p className="text-[10px] text-white/30">Across All</p>
        </div>
      </motion.div>

      {/* Profile List */}
      <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
        Registered Entities
      </p>
      <div className="space-y-3">
        {profiles.map((profile, i) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onSelect={() => setSelectedProfile(profile)}
            delay={0.1 + i * 0.04}
          />
        ))}
      </div>
    </div>
  );
}

/* -------- Profile Card -------- */

function ProfileCard({
  profile,
  onSelect,
  delay,
}: {
  profile: BusinessProfile;
  onSelect: () => void;
  delay: number;
}) {
  const statusConfig = getProfileStatusConfig(profile.status);

  const lastActiveDate = new Date(profile.lastActivity).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      onClick={onSelect}
      className={`w-full p-5 rounded-[28px] border backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] text-left transition-all hover:border-white/20 active:scale-[0.98] ${
        profile.isCurrent
          ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20"
          : "bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              profile.isCurrent
                ? "bg-cyan-500/20 border border-cyan-500/30"
                : "bg-white/5 border border-white/10"
            }`}
          >
            <Building2
              size={18}
              className={profile.isCurrent ? "text-cyan-400" : "text-white/60"}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm text-white font-medium">{profile.tradeName}</h3>
              {profile.isCurrent && (
                <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  CURRENT
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/40">
              {getRegistrationLabel(profile.registrationType)} · {profile.industry}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 text-[8px] font-bold rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
          >
            {profile.status}
          </span>
          <ChevronRight size={14} className="text-white/20" />
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-white/40">
        <div className="flex items-center gap-1">
          <Users size={10} />
          <span>{profile.userCount} users</span>
        </div>
        <div className="flex items-center gap-1">
          <CreditCard size={10} />
          <span>{profile.accountCount} accounts</span>
        </div>
        <span>Last active: {lastActiveDate}</span>
      </div>
    </motion.button>
  );
}

/* -------- Profile Detail View -------- */

function ProfileDetailView({
  profile,
  onBack,
  onSwitch,
  isCurrent,
}: {
  profile: BusinessProfile;
  onBack: () => void;
  onSwitch: () => void;
  isCurrent: boolean;
}) {
  const statusConfig = getProfileStatusConfig(profile.status);
  const createdDate = new Date(profile.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
          <h1 className="text-3xl font-serif tracking-tight">{profile.tradeName}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            {profile.registrationNo}
          </p>
        </div>
      </header>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className={`mb-6 p-4 rounded-[24px] border backdrop-blur-xl ${statusConfig.bg} ${statusConfig.border}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
          >
            {profile.status}
          </span>
          {isCurrent && (
            <span className="text-xs text-cyan-400">Currently Viewing</span>
          )}
        </div>
      </motion.div>

      {/* Entity Information */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] mb-4"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Entity Information
        </p>
        <div className="space-y-3">
          <DetailRow label="Legal Name" value={profile.legalName} />
          <DetailRow label="Trade Name" value={profile.tradeName} />
          <DetailRow label="Registration No." value={profile.registrationNo} />
          <DetailRow label="Registration Type" value={getRegistrationLabel(profile.registrationType)} />
          <DetailRow label="Primary Account" value={profile.primaryAccountId} />
          <DetailRow label="Industry" value={profile.industry} />
          <DetailRow label="Primary Contact" value={profile.primaryContact} />
          <DetailRow label="Address" value={profile.address} />
          <DetailRow label="Registered Since" value={createdDate} />
        </div>
      </motion.div>

      {/* Resources */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] mb-4"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold mb-4">
          Resources
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-[20px] bg-white/[0.03] border border-white/[0.05]">
            <Users size={18} className="text-cyan-400 mx-auto mb-2" />
            <p className="text-lg text-white">{profile.userCount}</p>
            <p className="text-[9px] text-white/30 uppercase">Users</p>
          </div>
          <div className="text-center p-3 rounded-[20px] bg-white/[0.03] border border-white/[0.05]">
            <CreditCard size={18} className="text-cyan-400 mx-auto mb-2" />
            <p className="text-lg text-white">{profile.accountCount}</p>
            <p className="text-[9px] text-white/30 uppercase">Accounts</p>
          </div>
          <div className="text-center p-3 rounded-[20px] bg-white/[0.03] border border-white/[0.05]">
            <Briefcase size={18} className="text-cyan-400 mx-auto mb-2" />
            <p className="text-lg text-white">5</p>
            <p className="text-[9px] text-white/30 uppercase">Roles</p>
          </div>
        </div>
      </motion.div>

      {/* Switch Context — Only for non-current ACTIVE profiles */}
      {!isCurrent && profile.status === "ACTIVE" && (
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.15 }}
          onClick={onSwitch}
          className="w-full py-4 rounded-[28px] bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-semibold text-sm transition-all shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 active:scale-[0.98]"
        >
          Switch to {profile.tradeName}
        </motion.button>
      )}
    </div>
  );
}

/* -------- Detail Row -------- */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-white/5 last:border-0 gap-4">
      <span className="text-xs text-white/50 shrink-0">{label}</span>
      <span className="text-xs text-white/90 font-medium text-right">{value}</span>
    </div>
  );
}