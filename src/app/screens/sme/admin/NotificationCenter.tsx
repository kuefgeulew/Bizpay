import { useState, useEffect } from "react";
import { ArrowLeft, Bell, CheckCircle, TrendingUp, AlertTriangle, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  formatNotificationTime,
  type Notification,
} from "../../../data/notificationEngine";

const SPRING = { type: "spring" as const, stiffness: 450, damping: 35 };

interface NotificationCenterProps {
  userId?: string;
  onBack: () => void;
  onNavigate?: (url: string) => void;
}

export default function NotificationCenter({ userId = "usr_002", onBack, onNavigate }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    const allNotifications = getNotificationsForUser(userId);
    setNotifications(allNotifications);
    setUnreadCount(getUnreadCount(userId));
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const handleMarkAllAsRead = () => {
    markAllAsRead(userId);
    loadNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
      loadNotifications();
    }
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "APPROVAL_REQUEST":
      case "APPROVAL_APPROVED":
      case "APPROVAL_REJECTED":
        return "bg-cyan-500/20 border-cyan-500/30";
      case "SYSTEM_ALERT":
      case "USER_ADDED":
      case "LIMIT_CHANGED":
        return "bg-white/10 border-white/20";
      case "RISK_ALERT":
        return "bg-amber-500/20 border-amber-500/30";
      default:
        return "bg-white/10 border-white/20";
    }
  };

  const getStatusTag = (notification: Notification) => {
    if (notification.type.includes("REQUEST")) {
      return { label: "Pending", color: "bg-amber-500/20 border-amber-500/30 text-amber-400" };
    }
    if (notification.type.includes("APPROVED") || notification.type.includes("REJECTED")) {
      return { label: "Actioned", color: "bg-white/10 border-white/20 text-white/60" };
    }
    return null;
  };

  return (
    <div className="relative h-full text-white px-6 pt-8 overflow-y-auto pb-24 font-sans">
      {/* Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* HEADER */}
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Notifications</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mt-1">
            System and approval updates
          </p>
        </div>
      </header>

      {/* MARK ALL AS READ */}
      {unreadCount > 0 && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* NOTIFICATION LIST */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="p-8 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col items-center"
          >
            <Bell size={48} className="text-white/20 mb-3" />
            <p className="text-sm text-white/60">No new notifications at the moment.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, idx) => {
              const statusTag = getStatusTag(notification);
              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ ...SPRING, delay: idx * 0.05 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative p-4 rounded-[24px] border backdrop-blur-xl cursor-pointer transition-all hover:bg-white/[0.06] ${
                    notification.isRead ? "bg-white/[0.02] border-white/5 opacity-60" : "bg-white/[0.03] border-white/10"
                  }`}
                >
                  {/* Left Accent Line */}
                  <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getCategoryColor(notification.type)}`} />

                  <div className="pl-3 flex items-start gap-3">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-serif text-white">{notification.title}</h4>
                        {statusTag && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusTag.color}`}>
                            {statusTag.label}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      <p className="text-[10px] text-white/50">
                        {formatNotificationTime(notification.timestamp)}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)] shrink-0 mt-1" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ============================================
// NOTIFICATION BELL BADGE (FOR GLOBAL USE)
// ============================================

export function NotificationBellBadge({ userId, onClick }: { userId: string; onClick: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadCount(userId));
    };

    updateCount();
    const interval = setInterval(updateCount, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-xl hover:bg-muted transition-colors"
      title="Notifications"
    >
      <Bell size={20} className="text-foreground" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}