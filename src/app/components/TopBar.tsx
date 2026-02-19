import { Menu, Search, Power, MoreVertical, ChevronDown, Bell } from "lucide-react";
import GlassPanel from "./GlassPanel";
import { useState, useEffect } from "react";
import { getUnreadCount } from "../mock/notifications";

// ──────────────────────────────────────────────────────────
// TopBar does NOT render CommandSearch.
// Search overlay is rendered in App.tsx inside the phone container.
// createPortal(document.body) is a containment violation — removed.
// ──────────────────────────────────────────────────────────

interface TopBarProps {
  onBnClick?: () => void;
  onNotificationClick?: () => void;
  onSearchOpen?: () => void;
  userId?: string;
}

export default function TopBar({ 
  onBnClick, 
  onNotificationClick,
  onSearchOpen,
  userId = "usr_002"
}: TopBarProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count
  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <GlassPanel className="mx-4 mt-2 rounded-2xl px-4 py-2 text-white/95">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="hover:opacity-90">
            <Menu size={22} />
          </button>
          <div className="font-medium flex items-center gap-1">
            <span>Offers</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBnClick}
            className="text-sm font-semibold hover:opacity-90"
          >
            BN
          </button>

          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="relative hover:opacity-90"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Search — triggers App-level search overlay */}
          <button onClick={onSearchOpen}>
            <Search size={20} />
          </button>

          <Power size={20} />
          <MoreVertical size={20} />
        </div>
      </div>
    </GlassPanel>
  );
}