/**
 * STATE MANAGER
 * Centralized session state management
 * State resets on page refresh (session-scoped)
 */

import { getCurrentUser, setCurrentUser, type Role, type AppUser } from "./users";
import { createActivityLog } from "./activityLogs";
import { createNotification } from "./notifications";
import { updateApprovalStatus, type MockApproval } from "./approvals";
import { updateTransactionStatus, type MockTransaction } from "./transactions";

// ============================================
// ROLE-BASED PERMISSIONS (COSMETIC ONLY)
// ============================================

export interface RolePermissions {
  canCreateTransaction: boolean;
  canApproveTransaction: boolean;
  canRejectTransaction: boolean;
  canViewApprovals: boolean;
  canCreateBeneficiary: boolean;
  canDeleteBeneficiary: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
  canViewAdminDashboard: boolean;
  canOverrideReconciliation: boolean;
}

export function getRolePermissions(role: Role): RolePermissions {
  switch (role) {
    case "admin":
      return {
        canCreateTransaction: false, // Separation of duties
        canApproveTransaction: false, // Separation of duties
        canRejectTransaction: false,
        canViewApprovals: true,
        canCreateBeneficiary: false,
        canDeleteBeneficiary: true,
        canViewReports: true,
        canExportData: true,
        canManageUsers: true,
        canViewAdminDashboard: true,
        canOverrideReconciliation: true,
      };
    case "maker":
      return {
        canCreateTransaction: true,
        canApproveTransaction: false, // Cannot approve own transactions
        canRejectTransaction: false,
        canViewApprovals: true, // Can view but not approve
        canCreateBeneficiary: true,
        canDeleteBeneficiary: false,
        canViewReports: true,
        canExportData: false,
        canManageUsers: false,
        canViewAdminDashboard: false,
        canOverrideReconciliation: false,
      };
    case "checker":
      return {
        canCreateTransaction: false,
        canApproveTransaction: true, // First-level approval
        canRejectTransaction: true,
        canViewApprovals: true,
        canCreateBeneficiary: false,
        canDeleteBeneficiary: false,
        canViewReports: true,
        canExportData: false,
        canManageUsers: false,
        canViewAdminDashboard: false,
        canOverrideReconciliation: false,
      };
    case "approver":
      return {
        canCreateTransaction: false,
        canApproveTransaction: true, // Final approval
        canRejectTransaction: true,
        canViewApprovals: true,
        canCreateBeneficiary: false,
        canDeleteBeneficiary: false,
        canViewReports: true,
        canExportData: true,
        canManageUsers: false,
        canViewAdminDashboard: false,
        canOverrideReconciliation: false,
      };
    case "viewer":
      return {
        canCreateTransaction: false,
        canApproveTransaction: false,
        canRejectTransaction: false,
        canViewApprovals: true, // Read-only
        canCreateBeneficiary: false,
        canDeleteBeneficiary: false,
        canViewReports: true, // Read-only
        canExportData: false,
        canManageUsers: false,
        canViewAdminDashboard: false,
        canOverrideReconciliation: false,
      };
  }
}

// ============================================
// ROLE SWITCHING
// ============================================

export function switchRole(userId: string): {
  success: boolean;
  user?: AppUser;
  message: string;
} {
  const user = setCurrentUser(userId);
  if (user) {
    createActivityLog(
      user.id,
      user.name,
      user.role,
      "LOGIN",
      `Role switched to ${user.role}`,
      { roleSwitch: true },
      "INFO"
    );
    return {
      success: true,
      user,
      message: `Switched to ${user.name} (${user.role})`,
    };
  }
  return {
    success: false,
    message: "User not found",
  };
}

// ============================================
// APPROVAL WORKFLOW
// ============================================

export function processApproval(
  approval: MockApproval,
  reason?: string
): {
  success: boolean;
  message: string;
} {
  const currentUser = getCurrentUser();
  const permissions = getRolePermissions(currentUser.role);

  // Visual permission check
  if (!permissions.canApproveTransaction) {
    return {
      success: false,
      message: `${currentUser.role} role cannot approve transactions`,
    };
  }

  // Prevent self-approval (visual check)
  if (approval.submittedBy === currentUser.id) {
    return {
      success: false,
      message: "You cannot approve your own submission",
    };
  }

  // Update approval status
  updateApprovalStatus(
    approval.id,
    "approved",
    currentUser.id,
    currentUser.name
  );

  // Update related transaction if applicable
  if (approval.type === "transaction" && approval.metadata.transactionId) {
    updateTransactionStatus(
      approval.metadata.transactionId,
      "approved",
      currentUser.id,
      currentUser.name
    );
  }

  // Create activity log
  createActivityLog(
    currentUser.id,
    currentUser.name,
    currentUser.role,
    "APPROVAL_APPROVED",
    `Approved ${approval.type}: ${approval.title}`,
    {
      approvalId: approval.id,
      reason,
    },
    approval.priority === "urgent" ? "WARNING" : "INFO"
  );

  // Create notification for submitter
  createNotification(
    "approval_approved",
    "Approval Granted",
    `Your ${approval.type} request has been approved by ${currentUser.name}`,
    "low",
    approval.type === "transaction" ? "transactions" : undefined,
    {
      approvalId: approval.id,
      approvedBy: currentUser.id,
    }
  );

  return {
    success: true,
    message: "Approval granted successfully",
  };
}

export function processRejection(
  approval: MockApproval,
  reason: string
): {
  success: boolean;
  message: string;
} {
  const currentUser = getCurrentUser();
  const permissions = getRolePermissions(currentUser.role);

  // Visual permission check
  if (!permissions.canRejectTransaction) {
    return {
      success: false,
      message: `${currentUser.role} role cannot reject transactions`,
    };
  }

  // Update approval status
  updateApprovalStatus(
    approval.id,
    "rejected",
    currentUser.id,
    currentUser.name,
    reason
  );

  // Update related transaction if applicable
  if (approval.type === "transaction" && approval.metadata.transactionId) {
    updateTransactionStatus(
      approval.metadata.transactionId,
      "rejected",
      currentUser.id,
      currentUser.name
    );
  }

  // Create activity log
  createActivityLog(
    currentUser.id,
    currentUser.name,
    currentUser.role,
    "APPROVAL_REJECTED",
    `Rejected ${approval.type}: ${approval.title}`,
    {
      approvalId: approval.id,
      reason,
    },
    "WARNING"
  );

  // Create notification for submitter
  createNotification(
    "approval_rejected",
    "Approval Rejected",
    `Your ${approval.type} request has been rejected: ${reason}`,
    "medium",
    undefined,
    {
      approvalId: approval.id,
      rejectedBy: currentUser.id,
      reason,
    }
  );

  return {
    success: true,
    message: "Approval rejected",
  };
}

// ============================================
// SCREEN ACCESS GUARD (COSMETIC)
// ============================================

export function canAccessScreen(screenName: string): {
  allowed: boolean;
  message?: string;
} {
  const currentUser = getCurrentUser();
  const permissions = getRolePermissions(currentUser.role);

  switch (screenName) {
    case "admin-insights":
      return {
        allowed: permissions.canViewAdminDashboard,
        message: permissions.canViewAdminDashboard
          ? undefined
          : "Admin dashboard is restricted to admin users",
      };
    case "approvals":
      return {
        allowed: permissions.canViewApprovals,
        message: undefined, // All roles can view
      };
    case "transactions":
      return { allowed: true }; // All can view
    case "user-management":
      return {
        allowed: permissions.canManageUsers,
        message: permissions.canManageUsers
          ? undefined
          : "User management is restricted to admin users",
      };
    default:
      return { allowed: true };
  }
}