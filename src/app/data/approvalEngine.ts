/**
 * APPROVAL ENGINE — SPRINT 2
 * Generic approval system for all sensitive actions
 * Feature-agnostic, role-enforced, audit-ready
 */

import type { RoleType } from "./userManagement";

// ============================================
// 1. TYPE DEFINITIONS
// ============================================

export type EntityType = "transaction" | "beneficiary" | "service" | "user";

export type EntitySubType =
  // Transactions
  | "MFS"
  | "OWN_ACCOUNT"
  | "THIRD_PARTY"
  | "DIRECT_DEBIT"
  | "BILL_PAYMENT"
  // Beneficiaries
  | "BRAC_BENEFICIARY"
  | "OTHER_BANK_BENEFICIARY"
  | "POSITIVE_PAY_BENEFICIARY"
  // Services
  | "CHEQUEBOOK_REQUEST"
  | "POSITIVE_PAY_SETUP"
  | "SOFTWARE_TOKEN"
  // User Management
  | "USER_ADD"
  | "USER_ROLE_CHANGE"
  | "USER_SUSPEND";

export type ApprovalStage = "CHECKER" | "APPROVER";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "SENT_BACK";

export interface ApprovalItem {
  id: string;
  entityType: EntityType;
  entitySubType: EntitySubType;
  entityId?: string; // Optional: May not exist until approved
  
  // Workflow
  initiatedByUserId: string;
  initiatedByName: string;
  initiatedByRole: RoleType;
  currentStage: ApprovalStage;
  requiredStages: ApprovalStage[];
  status: ApprovalStatus;
  
  // Payload (Immutable Snapshot)
  payloadSnapshot: Record<string, any>;
  
  // History
  checkerUserId?: string;
  checkerName?: string;
  checkerAction?: "VERIFIED" | "SENT_BACK";
  checkerComment?: string;
  checkerTimestamp?: string;
  
  approverUserId?: string;
  approverName?: string;
  approverAction?: "APPROVED" | "REJECTED";
  approverComment?: string;
  approverTimestamp?: string;
  
  // Metadata
  amount?: number; // For display & limit checking
  riskLevel?: "LOW" | "MEDIUM" | "HIGH"; // Based on amount/limits
  priority?: "NORMAL" | "URGENT";
  
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalAction {
  approvalId: string;
  actorId: string;
  actorName: string;
  actorRole: RoleType;
  action: "VERIFY" | "SEND_BACK" | "APPROVE" | "REJECT";
  comment?: string;
  timestamp: string;
}

// ============================================
// 2. MOCK APPROVAL DATA (FOR SPRINT 2)
// ============================================

export const APPROVAL_ITEMS: ApprovalItem[] = [
  // Pending for Checker
  {
    id: "apv_001",
    entityType: "transaction",
    entitySubType: "MFS",
    initiatedByUserId: "usr_002",
    initiatedByName: "Fatima Khan",
    initiatedByRole: "maker",
    currentStage: "CHECKER",
    requiredStages: ["CHECKER", "APPROVER"],
    status: "PENDING",
    payloadSnapshot: {
      mfsProvider: "bKash",
      recipientPhone: "01711234567",
      amount: 250000,
      narration: "Payment for Invoice #12345",
    },
    amount: 250000,
    riskLevel: "MEDIUM",
    priority: "NORMAL",
    createdAt: "2026-02-17T10:30:00Z",
    updatedAt: "2026-02-17T10:30:00Z",
  },
  
  {
    id: "apv_002",
    entityType: "beneficiary",
    entitySubType: "OTHER_BANK_BENEFICIARY",
    initiatedByUserId: "usr_002",
    initiatedByName: "Fatima Khan",
    initiatedByRole: "maker",
    currentStage: "CHECKER",
    requiredStages: ["CHECKER", "APPROVER"],
    status: "PENDING",
    payloadSnapshot: {
      beneficiaryName: "Acme Trading Ltd.",
      accountNumber: "1234567890",
      bankName: "Dutch-Bangla Bank",
      routingNumber: "090260124",
    },
    riskLevel: "LOW",
    priority: "NORMAL",
    createdAt: "2026-02-17T08:45:00Z",
    updatedAt: "2026-02-17T08:45:00Z",
  },
  
  // Pending for Approver (Verified by Checker)
  {
    id: "apv_003",
    entityType: "transaction",
    entitySubType: "OWN_ACCOUNT",
    initiatedByUserId: "usr_002",
    initiatedByName: "Fatima Khan",
    initiatedByRole: "maker",
    currentStage: "APPROVER",
    requiredStages: ["CHECKER", "APPROVER"],
    status: "PENDING",
    payloadSnapshot: {
      fromAccount: "1020304050",
      toAccount: "5060708090",
      amount: 500000,
      narration: "Internal fund allocation",
    },
    amount: 500000,
    riskLevel: "HIGH",
    priority: "URGENT",
    checkerUserId: "usr_004",
    checkerName: "Nadia Islam",
    checkerAction: "VERIFIED",
    checkerComment: "Documents verified, amount confirmed",
    checkerTimestamp: "2026-02-17T11:15:00Z",
    createdAt: "2026-02-17T09:00:00Z",
    updatedAt: "2026-02-17T11:15:00Z",
  },
  
  // Approved
  {
    id: "apv_004",
    entityType: "transaction",
    entitySubType: "BILL_PAYMENT",
    entityId: "txn_12340",
    initiatedByUserId: "usr_002",
    initiatedByName: "Fatima Khan",
    initiatedByRole: "maker",
    currentStage: "APPROVER",
    requiredStages: ["CHECKER", "APPROVER"],
    status: "APPROVED",
    payloadSnapshot: {
      provider: "DESCO",
      consumerNumber: "123456789012",
      amount: 15000,
      narration: "Electricity bill - February 2026",
    },
    amount: 15000,
    riskLevel: "LOW",
    priority: "NORMAL",
    checkerUserId: "usr_004",
    checkerName: "Nadia Islam",
    checkerAction: "VERIFIED",
    checkerTimestamp: "2026-02-16T14:00:00Z",
    approverUserId: "usr_003",
    approverName: "Karim Hossain",
    approverAction: "APPROVED",
    approverComment: "Approved for payment",
    approverTimestamp: "2026-02-16T15:30:00Z",
    createdAt: "2026-02-16T13:00:00Z",
    updatedAt: "2026-02-16T15:30:00Z",
  },
  
  // Rejected
  {
    id: "apv_005",
    entityType: "transaction",
    entitySubType: "MFS",
    initiatedByUserId: "usr_002",
    initiatedByName: "Fatima Khan",
    initiatedByRole: "maker",
    currentStage: "APPROVER",
    requiredStages: ["CHECKER", "APPROVER"],
    status: "REJECTED",
    payloadSnapshot: {
      mfsProvider: "Nagad",
      recipientPhone: "01798765432",
      amount: 1000000,
      narration: "Large payment",
    },
    amount: 1000000,
    riskLevel: "HIGH",
    priority: "NORMAL",
    checkerUserId: "usr_004",
    checkerName: "Nadia Islam",
    checkerAction: "VERIFIED",
    checkerTimestamp: "2026-02-15T10:00:00Z",
    approverUserId: "usr_003",
    approverName: "Karim Hossain",
    approverAction: "REJECTED",
    approverComment: "Exceeds policy limit. Requires additional documentation.",
    approverTimestamp: "2026-02-15T11:30:00Z",
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-02-15T11:30:00Z",
  },
  
  // Sent Back by Checker
  {
    id: "apv_006",
    entityType: "beneficiary",
    entitySubType: "BRAC_BENEFICIARY",
    initiatedByUserId: "usr_002",
    initiatedByName: "Fatima Khan",
    initiatedByRole: "maker",
    currentStage: "CHECKER",
    requiredStages: ["CHECKER", "APPROVER"],
    status: "SENT_BACK",
    payloadSnapshot: {
      beneficiaryName: "ABC Suppliers",
      accountNumber: "9876543210",
    },
    riskLevel: "LOW",
    priority: "NORMAL",
    checkerUserId: "usr_004",
    checkerName: "Nadia Islam",
    checkerAction: "SENT_BACK",
    checkerComment: "Beneficiary name mismatch with account details",
    checkerTimestamp: "2026-02-14T16:00:00Z",
    createdAt: "2026-02-14T15:00:00Z",
    updatedAt: "2026-02-14T16:00:00Z",
  },
];

// ============================================
// 3. APPROVAL ENGINE LOGIC
// ============================================

/**
 * Submit an action for approval
 */
export function submitForApproval(
  entityType: EntityType,
  entitySubType: EntitySubType,
  payload: Record<string, any>,
  initiator: {
    userId: string;
    name: string;
    role: RoleType;
  },
  amount?: number
): ApprovalItem {
  // Validate: Only Makers can submit
  if (initiator.role !== "maker") {
    throw new Error("Only Makers can submit items for approval");
  }
  
  // Calculate risk level based on amount
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (amount) {
    if (amount > 500000) riskLevel = "HIGH";
    else if (amount > 100000) riskLevel = "MEDIUM";
  }
  
  const now = new Date().toISOString();
  
  const approvalItem: ApprovalItem = {
    id: `apv_${Date.now()}`,
    entityType,
    entitySubType,
    initiatedByUserId: initiator.userId,
    initiatedByName: initiator.name,
    initiatedByRole: initiator.role,
    currentStage: "CHECKER",
    requiredStages: ["CHECKER", "APPROVER"],
    status: "PENDING",
    payloadSnapshot: { ...payload }, // Immutable copy
    amount,
    riskLevel,
    priority: "NORMAL",
    createdAt: now,
    updatedAt: now,
  };
  
  // In production: Save to database
  console.log("✅ Approval item created:", approvalItem);
  
  return approvalItem;
}

/**
 * Checker verifies an approval item
 */
export function verifyApproval(
  approvalItem: ApprovalItem,
  checker: {
    userId: string;
    name: string;
    role: RoleType;
  },
  comment?: string
): ApprovalItem {
  // Validate: Only Checkers can verify
  if (checker.role !== "checker") {
    throw new Error("Only Checkers can verify approval items");
  }
  
  // Validate: Must be in CHECKER stage
  if (approvalItem.currentStage !== "CHECKER") {
    throw new Error("Item is not in CHECKER stage");
  }
  
  // Validate: Cannot verify own submission
  if (approvalItem.initiatedByUserId === checker.userId) {
    throw new Error("Cannot verify your own submission");
  }
  
  const now = new Date().toISOString();
  
  return {
    ...approvalItem,
    currentStage: "APPROVER",
    checkerUserId: checker.userId,
    checkerName: checker.name,
    checkerAction: "VERIFIED",
    checkerComment: comment,
    checkerTimestamp: now,
    updatedAt: now,
  };
}

/**
 * Checker sends back an approval item
 */
export function sendBackApproval(
  approvalItem: ApprovalItem,
  checker: {
    userId: string;
    name: string;
    role: RoleType;
  },
  comment: string
): ApprovalItem {
  // Validate: Only Checkers can send back
  if (checker.role !== "checker") {
    throw new Error("Only Checkers can send back items");
  }
  
  // Validate: Must be in CHECKER stage
  if (approvalItem.currentStage !== "CHECKER") {
    throw new Error("Item is not in CHECKER stage");
  }
  
  const now = new Date().toISOString();
  
  return {
    ...approvalItem,
    status: "SENT_BACK",
    checkerUserId: checker.userId,
    checkerName: checker.name,
    checkerAction: "SENT_BACK",
    checkerComment: comment,
    checkerTimestamp: now,
    updatedAt: now,
  };
}

/**
 * Approver approves an item
 */
export function approveItem(
  approvalItem: ApprovalItem,
  approver: {
    userId: string;
    name: string;
    role: RoleType;
  },
  comment?: string
): ApprovalItem {
  // Validate: Only Approvers can approve
  if (approver.role !== "approver") {
    throw new Error("Only Approvers can approve items");
  }
  
  // Validate: Must be in APPROVER stage
  if (approvalItem.currentStage !== "APPROVER") {
    throw new Error("Item is not in APPROVER stage");
  }
  
  // Validate: Cannot approve own submission
  if (approvalItem.initiatedByUserId === approver.userId) {
    throw new Error("Cannot approve your own submission");
  }
  
  const now = new Date().toISOString();
  
  return {
    ...approvalItem,
    status: "APPROVED",
    approverUserId: approver.userId,
    approverName: approver.name,
    approverAction: "APPROVED",
    approverComment: comment,
    approverTimestamp: now,
    updatedAt: now,
  };
}

/**
 * Approver rejects an item
 */
export function rejectItem(
  approvalItem: ApprovalItem,
  approver: {
    userId: string;
    name: string;
    role: RoleType;
  },
  comment: string
): ApprovalItem {
  // Validate: Only Approvers can reject
  if (approver.role !== "approver") {
    throw new Error("Only Approvers can reject items");
  }
  
  // Validate: Must be in APPROVER stage
  if (approvalItem.currentStage !== "APPROVER") {
    throw new Error("Item is not in APPROVER stage");
  }
  
  const now = new Date().toISOString();
  
  return {
    ...approvalItem,
    status: "REJECTED",
    approverUserId: approver.userId,
    approverName: approver.name,
    approverAction: "REJECTED",
    approverComment: comment,
    approverTimestamp: now,
    updatedAt: now,
  };
}

// ============================================
// 4. LIMIT ENFORCEMENT
// ============================================

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage: number;
  limit: number;
  remaining: number;
}

/**
 * Check if user has sufficient daily limit
 */
export function checkDailyLimit(
  userId: string,
  userDailyLimit: number,
  requestedAmount: number,
  todaysPendingTotal: number = 0
): LimitCheckResult {
  const currentUsage = todaysPendingTotal;
  const remaining = userDailyLimit - currentUsage;
  
  if (requestedAmount > remaining) {
    return {
      allowed: false,
      reason: `Transaction exceeds daily limit. Available: ৳${remaining.toLocaleString()}`,
      currentUsage,
      limit: userDailyLimit,
      remaining,
    };
  }
  
  return {
    allowed: true,
    currentUsage,
    limit: userDailyLimit,
    remaining: remaining - requestedAmount,
  };
}

// ============================================
// 5. HELPER FUNCTIONS
// ============================================

/**
 * Get pending items for a specific user based on their role
 */
export function getPendingItemsForUser(
  userId: string,
  userRole: RoleType,
  allItems: ApprovalItem[]
): ApprovalItem[] {
  if (userRole === "checker") {
    return allItems.filter(
      (item) =>
        item.status === "PENDING" &&
        item.currentStage === "CHECKER" &&
        item.initiatedByUserId !== userId // Cannot check own items
    );
  }
  
  if (userRole === "approver") {
    return allItems.filter(
      (item) =>
        item.status === "PENDING" &&
        item.currentStage === "APPROVER" &&
        item.initiatedByUserId !== userId // Cannot approve own items
    );
  }
  
  return [];
}

/**
 * Get items submitted by a user
 */
export function getItemsSubmittedByUser(
  userId: string,
  allItems: ApprovalItem[]
): ApprovalItem[] {
  return allItems.filter((item) => item.initiatedByUserId === userId);
}

/**
 * Format entity type for display
 */
export function formatEntityType(
  entityType: EntityType,
  entitySubType: EntitySubType
): string {
  const map: Record<EntitySubType, string> = {
    MFS: "MFS Transfer",
    OWN_ACCOUNT: "Own Account Transfer",
    THIRD_PARTY: "Third Party Transfer",
    DIRECT_DEBIT: "Direct Debit",
    BILL_PAYMENT: "Bill Payment",
    BRAC_BENEFICIARY: "BRAC Beneficiary",
    OTHER_BANK_BENEFICIARY: "Other Bank Beneficiary",
    POSITIVE_PAY_BENEFICIARY: "Positive Pay Beneficiary",
    CHEQUEBOOK_REQUEST: "Chequebook Request",
    POSITIVE_PAY_SETUP: "Positive Pay Setup",
    SOFTWARE_TOKEN: "Software Token Request",
    USER_ADD: "Add User",
    USER_ROLE_CHANGE: "Change User Role",
    USER_SUSPEND: "Suspend User",
  };
  
  return map[entitySubType] || entitySubType;
}

/**
 * Calculate time elapsed since creation
 */
export function getTimeElapsed(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/**
 * Get all approval items
 */
export function getAllApprovals(): any[] {
  // Transform APPROVAL_ITEMS to match expected format
  return APPROVAL_ITEMS.map((item) => ({
    ...item,
    submittedBy: item.initiatedByUserId,
    submittedAt: item.createdAt,
    approvedAt: item.approverTimestamp,
    status:
      item.status === "PENDING" && item.currentStage === "CHECKER"
        ? "PENDING_CHECKER"
        : item.status === "PENDING" && item.currentStage === "APPROVER"
        ? "PENDING_APPROVER"
        : item.status === "APPROVED"
        ? "APPROVED"
        : item.status === "REJECTED"
        ? "REJECTED"
        : item.status === "SENT_BACK"
        ? "SENT_BACK"
        : "PENDING",
    payload: item.payloadSnapshot,
  }));
}