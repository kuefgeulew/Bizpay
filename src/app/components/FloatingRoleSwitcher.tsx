import { useState } from "react";
import { User2 } from "lucide-react";
import { getCurrentUser, switchRole, USERS, type AppUser } from "../mock";
import { motion, AnimatePresence } from "motion/react";

interface FloatingRoleSwitcherProps {
  onRoleChange?: () => void;
}

export default function FloatingRoleSwitcher({ onRoleChange }: FloatingRoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const handleSwitch = (userId: string) => {
    const result = switchRole(userId);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      onRoleChange?.();
      setIsOpen(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500";
      case "maker":
        return "bg-blue-500";
      case "checker":
        return "bg-orange-500";
      case "approver":
        return "bg-green-500";
      case "viewer":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
        title="Switch Role"
      >
        <User2 size={24} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-6 w-96 max-h-[600px] bg-background border border-border rounded-2xl shadow-2xl z-[70] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
                <h3 className="font-bold text-foreground">Switch Role</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a user to view different permission levels
                </p>
              </div>

              {/* User List */}
              <div className="max-h-[400px] overflow-y-auto">
                {USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSwitch(user.id)}
                    disabled={user.id === currentUser.id}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                      user.id === currentUser.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full ${getRoleBadgeColor(user.role)} flex items-center justify-center text-white font-bold`}>
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{user.name}</span>
                        {user.id === currentUser.id && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold uppercase ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.department}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 bg-amber-50 border-t border-amber-200">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <span className="shrink-0">ℹ️</span>
                  <span>Role switching provides a view of UI permissions for each role. State resets on page refresh.</span>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}