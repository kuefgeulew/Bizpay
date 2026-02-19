import { getRoleById, type RoleType } from "../data/userManagement";

interface RoleBadgeProps {
  role: RoleType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export default function RoleBadge({ role, size = "md", showIcon = true }: RoleBadgeProps) {
  const roleData = getRoleById(role);
  
  if (!roleData) {
    return (
      <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
        Unknown
      </span>
    );
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${roleData.color}15`,
        color: roleData.color,
        border: `1px solid ${roleData.color}30`,
      }}
    >
      {showIcon && <span className="text-xs">{roleData.icon}</span>}
      <span>{roleData.name}</span>
    </span>
  );
}
