import { useState } from "react";
import { ArrowLeft, Smartphone, Monitor, Tablet, Shield, Clock, MapPin, Wifi, LogOut, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  BOUND_DEVICES,
  SESSION_HISTORY,
  type BoundDevice,
  type SessionRecord,
} from "../../../data/adminGovernance";

interface DeviceSecurityScreenProps {
  onBack: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

type SecurityView = "overview" | "devices" | "sessions";

export default function DeviceSecurityScreen({ onBack }: DeviceSecurityScreenProps) {
  const [view, setView] = useState<SecurityView>("overview");
  const [devices] = useState(BOUND_DEVICES);
  const [sessions] = useState(SESSION_HISTORY);

  const activeSessions = sessions.filter(s => s.status === "ACTIVE").length;
  const trustedDevices = devices.filter(d => d.trustLevel === "TRUSTED").length;
  const forcedLogouts = sessions.filter(s => s.logoutReason === "FORCED").length;

  const handleForceLogout = (sessionId: string) => {
    toast.success("Session Terminated", {
      description: "Remote session has been terminated successfully.",
    });
  };

  const handleRevokeDevice = (deviceId: string) => {
    toast.success("Device Revoked", {
      description: "Device trust has been revoked. Re-verification required on next login.",
    });
  };

  const handleTokenReset = () => {
    toast.success("Token Reset Initiated", {
      description: "All active tokens have been invalidated. Users must re-authenticate.",
    });
  };

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
          onClick={view === "overview" ? onBack : () => setView("overview")}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Security</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Devices • Sessions • Trust Control
          </p>
        </div>
      </header>

      {view === "overview" && (
        <>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Active</p>
              <p className="text-xl text-emerald-400">{activeSessions}</p>
              <p className="text-[10px] text-white/30">Sessions</p>
            </div>
            <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Trusted</p>
              <p className="text-xl text-cyan-400">{trustedDevices}</p>
              <p className="text-[10px] text-white/30">Devices</p>
            </div>
            <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">Forced</p>
              <p className="text-xl text-red-400">{forcedLogouts}</p>
              <p className="text-[10px] text-white/30">Logouts</p>
            </div>
          </motion.div>

          {/* Section Cards */}
          <div className="space-y-3">
            <SectionCard
              title="Bound Devices"
              description={`${devices.length} devices registered`}
              icon={<Smartphone size={20} className="text-cyan-400" />}
              onClick={() => setView("devices")}
              delay={0.05}
            />
            <SectionCard
              title="Session History"
              description={`${sessions.length} recent sessions`}
              icon={<Clock size={20} className="text-cyan-400" />}
              onClick={() => setView("sessions")}
              delay={0.1}
            />

            {/* Token Reset */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.15 }}
              onClick={handleTokenReset}
              className="w-full p-5 rounded-[28px] bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(239,68,68,0.1)] text-left transition-all hover:border-red-500/40 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                  <RotateCcw size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm text-white font-medium">Reset All Tokens</h3>
                  <p className="text-xs text-white/50">Invalidate all active authentication tokens</p>
                </div>
              </div>
            </motion.button>
          </div>
        </>
      )}

      {view === "devices" && (
        <div className="space-y-3">
          {devices.map((device, i) => (
            <DeviceCard
              key={device.id}
              device={device}
              onRevoke={() => handleRevokeDevice(device.id)}
              delay={i * 0.04}
            />
          ))}
        </div>
      )}

      {view === "sessions" && (
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <SessionCard
              key={session.id}
              session={session}
              onForceLogout={() => handleForceLogout(session.id)}
              delay={i * 0.04}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------- Sub-Components -------- */

function SectionCard({
  title,
  description,
  icon,
  onClick,
  delay,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      onClick={onClick}
      className="w-full p-5 rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] text-left transition-all hover:border-white/20 active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-sm text-white font-medium">{title}</h3>
          <p className="text-xs text-white/50">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

function DeviceCard({ device, onRevoke, delay }: { device: BoundDevice; onRevoke: () => void; delay: number }) {
  const DeviceIcon = device.deviceType === "MOBILE" ? Smartphone : device.deviceType === "TABLET" ? Tablet : Monitor;

  const trustColors = {
    TRUSTED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    VERIFIED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    UNVERIFIED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };

  const lastUsedDate = new Date(device.lastUsed).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className={`p-5 rounded-[28px] border backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] ${
        device.isCurrent
          ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20"
          : "bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            device.isCurrent ? "bg-cyan-500/20 border border-cyan-500/30" : "bg-white/5 border border-white/10"
          }`}>
            <DeviceIcon size={18} className={device.isCurrent ? "text-cyan-400" : "text-white/60"} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm text-white font-medium">{device.deviceName}</h4>
              {device.isCurrent && (
                <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  CURRENT
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/40">{device.os}{device.browser ? ` · ${device.browser}` : ""}</p>
          </div>
        </div>

        <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full border ${trustColors[device.trustLevel]}`}>
          {device.trustLevel}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-white/40 mb-3">
        <div className="flex items-center gap-1">
          <MapPin size={10} />
          <span>{device.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Wifi size={10} />
          <span>{device.ipAddress}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>{lastUsedDate}</span>
        </div>
      </div>

      {!device.isCurrent && (
        <button
          onClick={onRevoke}
          className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all active:scale-[0.98]"
        >
          Revoke Trust
        </button>
      )}
    </motion.div>
  );
}

function SessionCard({ session, onForceLogout, delay }: { session: SessionRecord; onForceLogout: () => void; delay: number }) {
  const isActive = session.status === "ACTIVE";

  const loginDate = new Date(session.loginAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const logoutReasonLabels: Record<string, string> = {
    MANUAL: "User logout",
    TIMEOUT: "Session timeout",
    FORCED: "Forced termination",
    SESSION_REPLACED: "Replaced by new session",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      className={`p-4 rounded-[24px] border backdrop-blur-xl ${
        isActive
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-white/[0.03] border-white/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" : "bg-white/20"}`} />
          <span className="text-sm text-white/90 font-medium">{session.userName}</span>
        </div>
        <span className={`text-[10px] font-bold ${isActive ? "text-emerald-400" : "text-white/30"}`}>
          {isActive ? "LIVE" : session.duration}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-white/40 mb-2">
        <span>{session.deviceName}</span>
        <span>·</span>
        <span>{session.location}</span>
        <span>·</span>
        <span>{loginDate}</span>
      </div>

      {!isActive && session.logoutReason && (
        <p className="text-[10px] text-white/30">
          {logoutReasonLabels[session.logoutReason] || session.logoutReason}
        </p>
      )}

      {isActive && (
        <button
          onClick={onForceLogout}
          className="mt-2 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <LogOut size={12} />
          Force Logout
        </button>
      )}
    </motion.div>
  );
}