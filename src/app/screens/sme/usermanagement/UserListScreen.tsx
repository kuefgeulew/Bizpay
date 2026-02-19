import { useState } from "react";
import { ArrowLeft, Search, Plus, MoreVertical, Shield, Clock } from "lucide-react";
import { motion } from "motion/react";
import RoleBadge from "../../../components/RoleBadge";
import {
  BUSINESS_USER_REGISTRY,
  formatRelativeTime,
  type BusinessUser,
} from "../../../data/userManagement";

interface UserListScreenProps {
  onBack: () => void;
  onAddUser: () => void;
  onEditUser: (userId: string) => void;
  onViewRoles: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

export default function UserListScreen({
  onBack,
  onAddUser,
  onEditUser,
  onViewRoles,
}: UserListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users] = useState<BusinessUser[]>(BUSINESS_USER_REGISTRY);

  // Filter users based on search
  const filteredUsers = users.filter((bu) => {
    const query = searchQuery.toLowerCase();
    return (
      bu.user?.name.toLowerCase().includes(query) ||
      bu.user?.email.toLowerCase().includes(query) ||
      bu.role.toLowerCase().includes(query)
    );
  });

  // Stats
  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;

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
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-serif tracking-tight">User Management</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            Access & Permissions
          </p>
        </div>
        <button
          onClick={onViewRoles}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
          title="View Role Details"
        >
          <Shield size={18} className="text-cyan-400" />
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-3xl mx-auto">
        <StatsCard label="Total Users" value={users.length} color="text-white" />
        <StatsCard label="Active" value={activeCount} color="text-emerald-400" />
        <StatsCard label="Pending" value={pendingCount} color="text-amber-400" />
      </div>

      {/* Search & Add */}
      <div className="flex gap-3 mb-6 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dd-input pl-11"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAddUser}
          className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold transition-all shadow-lg shadow-cyan-900/30 flex items-center gap-2 whitespace-nowrap text-sm"
        >
          <Plus size={16} />
          Add User
        </motion.button>
      </div>

      {/* User List */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {filteredUsers.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          filteredUsers.map((businessUser) => (
            <UserCard
              key={businessUser.id}
              businessUser={businessUser}
              onEdit={() => onEditUser(businessUser.userId)}
            />
          ))
        )}
      </div>

      <style>{`
        .dd-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          outline: none;
          transition: all 0.2s;
          appearance: none;
        }
        .dd-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .dd-input:focus {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
      `}</style>
    </div>
  );
}

/* -------- Sub-Components -------- */

function StatsCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="p-4 rounded-[24px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
      <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function UserCard({
  businessUser,
  onEdit,
}: {
  businessUser: BusinessUser;
  onEdit: () => void;
}) {
  const user = businessUser.user!;
  const isActive = businessUser.status === "active";
  const isPending = businessUser.status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className="p-4 rounded-[24px] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all cursor-pointer"
      onClick={onEdit}
    >
      {/* Top Row: Name, Badge, Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm text-white/90 font-medium">{user.name}</h3>
            {!isActive && (
              <span
                className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${
                  isPending
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {isPending ? "PENDING" : "SUSPENDED"}
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/40">{user.email}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <MoreVertical size={16} className="text-white/30" />
        </button>
      </div>

      {/* Bottom Row: Role, Limit, Last Activity */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <RoleBadge role={businessUser.role} size="sm" />
          {businessUser.dailyLimit > 0 && (
            <span className="text-[10px] text-white/30">
              Limit: {formatLimit(businessUser.dailyLimit)}
            </span>
          )}
        </div>

        {businessUser.lastActivity && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <Clock size={10} />
            <span>{formatRelativeTime(businessUser.lastActivity)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="p-12 rounded-[28px] bg-white/[0.03] border border-white/[0.05] flex flex-col items-center justify-center">
      <p className="text-white/30 text-sm">
        {searchQuery ? `No users found for "${searchQuery}"` : "No users yet"}
      </p>
    </div>
  );
}

/* -------- Helpers -------- */

function formatLimit(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return `${amount}`;
}