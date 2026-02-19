/**
 * USERS DATA
 * Role-based user registry
 */

export type Role = "admin" | "maker" | "checker" | "approver" | "viewer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  phone?: string;
  status: "active" | "suspended";
  limits?: {
    singleTransaction: number;
    dailyTotal: number;
  };
}

export const USERS: AppUser[] = [
  {
    id: "usr_001",
    name: "Admin User",
    email: "admin@bizpay.com",
    role: "admin",
    department: "Operations",
    phone: "+880 1711-123456",
    status: "active",
  },
  {
    id: "usr_002",
    name: "Fatima Khan",
    email: "fatima.khan@bizpay.com",
    role: "maker",
    department: "Finance",
    phone: "+880 1711-234567",
    status: "active",
    limits: {
      singleTransaction: 500000,
      dailyTotal: 2000000,
    },
  },
  {
    id: "usr_003",
    name: "Rashid Ahmed",
    email: "rashid.ahmed@bizpay.com",
    role: "checker",
    department: "Finance",
    phone: "+880 1711-345678",
    status: "active",
    limits: {
      singleTransaction: 1000000,
      dailyTotal: 5000000,
    },
  },
  {
    id: "usr_004",
    name: "Sarah Rahman",
    email: "sarah.rahman@bizpay.com",
    role: "approver",
    department: "Finance",
    phone: "+880 1711-456789",
    status: "active",
    limits: {
      singleTransaction: 5000000,
      dailyTotal: 20000000,
    },
  },
  {
    id: "usr_005",
    name: "Viewer User",
    email: "viewer@bizpay.com",
    role: "viewer",
    department: "Audit",
    phone: "+880 1711-567890",
    status: "active",
  },
];

// Current session user (configurable via role switcher)
let currentUser: AppUser = USERS[1]; // Default to Maker

export function getCurrentUser(): AppUser {
  return currentUser;
}

export function setCurrentUser(userId: string): AppUser | null {
  const user = USERS.find(u => u.id === userId);
  if (user) {
    currentUser = user;
    return user;
  }
  return null;
}

export function getUserById(userId: string): AppUser | undefined {
  return USERS.find(u => u.id === userId);
}

export function getUsersByRole(role: Role): AppUser[] {
  return USERS.filter(u => u.role === role);
}