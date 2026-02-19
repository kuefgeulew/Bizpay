/**
 * USER MANAGEMENT DATA MODELS
 * Static roles, permissions, and user data
 * Backend-agnostic structure ready for API integration
 */

// ============================================
// 1. TYPE DEFINITIONS
// ============================================

export type RoleType = "admin" | "maker" | "checker" | "approver" | "viewer";

export type PermissionCode =
  | "balance.view"
  | "transaction.create"
  | "transaction.verify"
  | "transaction.approve"
  | "beneficiary.add"
  | "beneficiary.approve"
  | "service.request"
  | "service.approve"
  | "user.manage"
  | "activity.view"
  | "reports.view";

export interface Permission {
  code: PermissionCode;
  description: string;
  category: "transaction" | "beneficiary" | "service" | "user" | "view";
}

export interface Role {
  id: RoleType;
  name: string;
  description: string;
  color: string; // For badge display
  icon: string; // Emoji for visual identity
  permissions: PermissionCode[];
  canDelete: boolean; // System roles cannot be deleted
}

export interface Business {
  id: string;
  name: string;
  status: "active" | "suspended";
  registrationNumber?: string;
  industry?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "suspended";
  createdAt: string;
}

export interface BusinessUser {
  id: string;
  businessId: string;
  userId: string;
  role: RoleType;
  status: "active" | "suspended" | "pending";
  dailyLimit: number;
  createdAt: string;
  lastActivity?: string;
  // Joined data (for display)
  user?: User;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: RoleType;
  action: string;
  entity: "transaction" | "beneficiary" | "service" | "user" | "system";
  entityId?: string;
  status: "success" | "failed" | "pending_approval";
  metadata?: Record<string, any>;
  timestamp: string;
}

// ============================================
// 2. STATIC PERMISSIONS (SEED DATA)
// ============================================

export const PERMISSIONS: Permission[] = [
  // View Permissions
  { code: "balance.view", description: "View account balances", category: "view" },
  { code: "reports.view", description: "View reports and statements", category: "view" },
  { code: "activity.view", description: "View activity logs", category: "view" },
  
  // Transaction Permissions
  { code: "transaction.create", description: "Create new transactions", category: "transaction" },
  { code: "transaction.verify", description: "Verify transactions", category: "transaction" },
  { code: "transaction.approve", description: "Approve and execute transactions", category: "transaction" },
  
  // Beneficiary Permissions
  { code: "beneficiary.add", description: "Add new beneficiaries (pending)", category: "beneficiary" },
  { code: "beneficiary.approve", description: "Approve beneficiaries", category: "beneficiary" },
  
  // Service Permissions
  { code: "service.request", description: "Create service requests", category: "service" },
  { code: "service.approve", description: "Approve service requests", category: "service" },
  
  // User Management
  { code: "user.manage", description: "Manage users and roles", category: "user" },
];

// ============================================
// 3. SYSTEM ROLES (NON-DELETABLE)
// ============================================

export const ROLES: Role[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Super user with user management powers. Cannot bypass approval rules.",
    color: "#DC2626", // Red
    icon: "🔴",
    canDelete: false,
    permissions: [
      "balance.view",
      "reports.view",
      "activity.view",
      "user.manage",
    ],
  },
  {
    id: "maker",
    name: "Maker",
    description: "Creates transactions and service requests. Cannot approve anything.",
    color: "#F59E0B", // Amber
    icon: "🟡",
    canDelete: false,
    permissions: [
      "balance.view",
      "transaction.create",
      "beneficiary.add",
      "service.request",
      "activity.view",
      "reports.view",
    ],
  },
  {
    id: "checker",
    name: "Checker",
    description: "Verifies maker actions. Can send back or reject. Cannot execute.",
    color: "#3B82F6", // Blue
    icon: "🔵",
    canDelete: false,
    permissions: [
      "balance.view",
      "transaction.verify",
      "activity.view",
      "reports.view",
    ],
  },
  {
    id: "approver",
    name: "Approver",
    description: "Final authority. Executes transactions and approves beneficiaries.",
    color: "#10B981", // Green
    icon: "🟢",
    canDelete: false,
    permissions: [
      "balance.view",
      "transaction.approve",
      "beneficiary.approve",
      "service.approve",
      "activity.view",
      "reports.view",
    ],
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access. Reports, balances, and activity logs only.",
    color: "#6B7280", // Gray
    icon: "⚪",
    canDelete: false,
    permissions: [
      "balance.view",
      "reports.view",
      "activity.view",
    ],
  },
];

// ============================================
// 4. REFERENCE DATA
// ============================================

export const BUSINESS_ENTITY: Business = {
  id: "biz_001",
  name: "ABC Traders Ltd.",
  status: "active",
  registrationNumber: "C-123456",
  industry: "Wholesale Trade",
};

export const MANAGED_USERS: User[] = [
  {
    id: "usr_001",
    name: "Rahim Ahmed",
    email: "rahim@abctraders.com",
    phone: "01711234567",
    status: "active",
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "usr_002",
    name: "Fatima Khan",
    email: "fatima@abctraders.com",
    phone: "01712345678",
    status: "active",
    createdAt: "2025-01-20T14:15:00Z",
  },
  {
    id: "usr_003",
    name: "Karim Hossain",
    email: "karim@abctraders.com",
    phone: "01713456789",
    status: "active",
    createdAt: "2025-02-01T09:00:00Z",
  },
  {
    id: "usr_004",
    name: "Nadia Islam",
    email: "nadia@abctraders.com",
    phone: "01714567890",
    status: "suspended",
    createdAt: "2025-02-10T11:45:00Z",
  },
  {
    id: "usr_005",
    name: "Tariq Rahman",
    email: "tariq@abctraders.com",
    phone: "01715678901",
    status: "active",
    createdAt: "2025-02-12T16:20:00Z",
  },
];

export const BUSINESS_USER_REGISTRY: BusinessUser[] = [
  {
    id: "bu_001",
    businessId: "biz_001",
    userId: "usr_001",
    role: "admin",
    status: "active",
    dailyLimit: 0, // Admin has no transaction limits
    createdAt: "2025-01-15T10:30:00Z",
    lastActivity: "2025-02-17T08:30:00Z",
    user: MANAGED_USERS[0],
  },
  {
    id: "bu_002",
    businessId: "biz_001",
    userId: "usr_002",
    role: "maker",
    status: "active",
    dailyLimit: 500000,
    createdAt: "2025-01-20T14:15:00Z",
    lastActivity: "2025-02-16T15:20:00Z",
    user: MANAGED_USERS[1],
  },
  {
    id: "bu_003",
    businessId: "biz_001",
    userId: "usr_003",
    role: "approver",
    status: "active",
    dailyLimit: 2000000,
    createdAt: "2025-02-01T09:00:00Z",
    lastActivity: "2025-02-17T07:45:00Z",
    user: MANAGED_USERS[2],
  },
  {
    id: "bu_004",
    businessId: "biz_001",
    userId: "usr_004",
    role: "checker",
    status: "suspended",
    dailyLimit: 0,
    createdAt: "2025-02-10T11:45:00Z",
    lastActivity: "2025-02-15T12:30:00Z",
    user: MANAGED_USERS[3],
  },
  {
    id: "bu_005",
    businessId: "biz_001",
    userId: "usr_005",
    role: "viewer",
    status: "active",
    dailyLimit: 0,
    createdAt: "2025-02-12T16:20:00Z",
    lastActivity: "2025-02-17T09:10:00Z",
    user: MANAGED_USERS[4],
  },
];

export const USER_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "log_001",
    actorId: "usr_002",
    actorName: "Fatima Khan",
    actorRole: "maker",
    action: "CREATE_TRANSACTION",
    entity: "transaction",
    entityId: "txn_12345",
    status: "pending_approval",
    metadata: { amount: 250000, beneficiary: "Acme Corp" },
    timestamp: "2025-02-17T10:30:00Z",
  },
  {
    id: "log_002",
    actorId: "usr_003",
    actorName: "Karim Hossain",
    actorRole: "approver",
    action: "APPROVE_TRANSACTION",
    entity: "transaction",
    entityId: "txn_12340",
    status: "success",
    metadata: { amount: 150000, beneficiary: "Global Traders" },
    timestamp: "2025-02-17T09:15:00Z",
  },
  {
    id: "log_003",
    actorId: "usr_001",
    actorName: "Rahim Ahmed",
    actorRole: "admin",
    action: "SUSPEND_USER",
    entity: "user",
    entityId: "usr_004",
    status: "success",
    metadata: { reason: "Policy violation" },
    timestamp: "2025-02-16T14:20:00Z",
  },
  {
    id: "log_004",
    actorId: "usr_002",
    actorName: "Fatima Khan",
    actorRole: "maker",
    action: "ADD_BENEFICIARY",
    entity: "beneficiary",
    entityId: "ben_789",
    status: "pending_approval",
    metadata: { name: "New Supplier Ltd", bank: "BRAC Bank" },
    timestamp: "2025-02-17T08:45:00Z",
  },
];

// ============================================
// 5. HELPER FUNCTIONS
// ============================================

/**
 * Get role by ID
 */
export function getRoleById(roleId: RoleType): Role | undefined {
  return ROLES.find((r) => r.id === roleId);
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(roleId: RoleType, permissionCode: PermissionCode): boolean {
  const role = getRoleById(roleId);
  return role ? role.permissions.includes(permissionCode) : false;
}

/**
 * Get all permissions for a role, with full details
 */
export function getRolePermissions(roleId: RoleType): Permission[] {
  const role = getRoleById(roleId);
  if (!role) return [];
  
  return PERMISSIONS.filter((p) => role.permissions.includes(p.code));
}

/**
 * Format currency (BDT)
 */
export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}