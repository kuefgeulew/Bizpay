/**
 * APPROVAL FLOW ENGINE
 * Approval lifecycle management for all governed actions
 * Phase D: Hardened with idempotency, resolution locks, terminal state guards
 */

import { getCurrentUser } from "./users";
import { createActivityLog, type ActivityAction } from "./activityLogs";
import { createNotification } from "./notifications";
import {
  getAllApprovals,
  getApprovalById,
  updateApprovalStatus,
  type MockApproval,
  type ApprovalStatus,
} from "./approvals";
import {
  updateTransactionStatus,
  type TransactionStatus,
} from "./transactions";
import { BENEFICIARIES } from "./beneficiaryGovernance";
import { toast } from "sonner";
import { isTerminalState } from "../utils/idempotency";

// ============================================
// STATUS LIFECYCLE
// ============================================

export type WorkflowStatus =
  | "draft"
  | "submitted"
  | "verified"
  | "approved"
  | "completed"
  | "sent_back"
  | "rejected";

// Map approval status to workflow status
export function getWorkflowStatus(approval: MockApproval): WorkflowStatus {
  switch (approval.status) {
    case "pending":
      return "submitted";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "expired":
      return "rejected";
    default:
      return "submitted";
  }
}

// ============================================
// APPROVAL ACTIONS
// ============================================

export interface ApprovalActionResult {
  success: boolean;
  message: string;
  approval?: MockApproval;
}

/**
 * Submit an item for approval
 */
export function submitForApproval(
  approvalId: string
): ApprovalActionResult {
  const currentUser = getCurrentUser();
  const approval = getApprovalById(approvalId);

  if (!approval) {
    return {
      success: false,
      message: "Approval not found",
    };
  }

  // Visual check: Maker role only
  if (currentUser.role !== "maker") {
    return {
      success: false,
      message: "Only makers can submit for approval",
    };
  }

  // Update status to pending (submitted)
  const updated = updateApprovalStatus(approvalId, "pending");

  if (!updated) {
    return {
      success: false,
      message: "Failed to update approval status",
    };
  }

  // Create activity log
  createActivityLog(
    currentUser.id,
    currentUser.name,
    currentUser.role,
    "APPROVAL_SUBMITTED",
    `Submitted ${approval.type} for approval: ${approval.title}`,
    {
      approvalId: approval.id,
      amount: approval.amount,
    },
    approval.priority === "urgent" ? "WARNING" : "INFO"
  );

  // Notify checkers/approvers
  createNotification(
    "approval_pending",
    "New Approval Required",
    `${currentUser.name} submitted ${approval.type} for approval (${
      approval.amount
        ? `৳${approval.amount.toLocaleString()}`
        : ""
    })`,
    approval.priority,
    "approvals",
    {
      approvalId: approval.id,
      submittedBy: currentUser.id,
    }
  );

  toast.success("Submitted for approval", {
    description: `${approval.title} has been submitted`,
  });

  return {
    success: true,
    message: "Submitted for approval",
    approval: updated,
  };
}

/**
 * Verify an item (Checker role)
 */
export function verifyItem(
  approvalId: string,
  notes?: string
): ApprovalActionResult {
  const currentUser = getCurrentUser();
  const approval = getApprovalById(approvalId);

  if (!approval) {
    return {
      success: false,
      message: "Approval not found",
    };
  }

  // Visual check: Checker role only
  if (currentUser.role !== "checker") {
    return {
      success: false,
      message: "Only checkers can verify items",
    };
  }

  // Prevent self-verification
  if (approval.submittedBy === currentUser.id) {
    return {
      success: false,
      message: "You cannot verify your own submission",
    };
  }

  // Create activity log
  createActivityLog(
    currentUser.id,
    currentUser.name,
    currentUser.role,
    "APPROVAL_APPROVED",
    `Verified ${approval.type}: ${approval.title}${notes ? ` - ${notes}` : ""}`,
    {
      approvalId: approval.id,
      stage: "verification",
      notes,
    },
    "INFO"
  );

  // Notify submitter and approvers
  createNotification(
    "approval_approved",
    "Item Verified",
    `Your ${approval.type} has been verified by ${currentUser.name}`,
    "low",
    "approvals",
    {
      approvalId: approval.id,
      verifiedBy: currentUser.id,
    }
  );

  toast.success("Item verified", {
    description: `Forwarded to approver for final approval`,
  });

  return {
    success: true,
    message: "Item verified and forwarded",
    approval,
  };
}

/**
 * Approve an item (Approver role)
 */
export function approveItem(
  approvalId: string,
  notes?: string
): ApprovalActionResult {
  const currentUser = getCurrentUser();
  const approval = getApprovalById(approvalId);

  if (!approval) {
    return {
      success: false,
      message: "Approval not found",
    };
  }

  // D1-2: Terminal state guard — reject attempts on already-resolved approvals
  if (isTerminalState(approval.status)) {
    return {
      success: false,
      message: `Approval already resolved (${approval.status}) — duplicate resolution blocked`,
    };
  }

  // Visual check: Approver or Checker role
  if (currentUser.role !== "approver" && currentUser.role !== "checker") {
    return {
      success: false,
      message: "Only approvers/checkers can approve items",
    };
  }

  // Prevent self-approval
  if (approval.submittedBy === currentUser.id) {
    return {
      success: false,
      message: "You cannot approve your own submission",
    };
  }

  // Update approval status
  const updated = updateApprovalStatus(
    approvalId,
    "approved",
    currentUser.id,
    currentUser.name
  );

  if (!updated) {
    return {
      success: false,
      message: "Failed to update approval status",
    };
  }

  // Update related transaction if applicable
  if (approval.type === "transaction" && approval.metadata.transactionId) {
    updateTransactionStatus(
      approval.metadata.transactionId,
      "approved" as TransactionStatus,
      currentUser.id,
      currentUser.name
    );
  }

  // GOVERNANCE_ENFORCEMENT — Resolve beneficiary mutation on approval
  if (approval.type === "beneficiary_mutation" && approval.metadata.beneficiaryId) {
    const ben = BENEFICIARIES.find(b => b.id === approval.metadata.beneficiaryId);
    if (ben) {
      const mutationType = approval.metadata.mutationType;
      switch (mutationType) {
        case "EDIT":
          // Apply proposed changes from snapshot
          if (approval.metadata.proposedChanges) {
            const changes = approval.metadata.proposedChanges as Record<string, { from: string; to: string }>;
            if (changes.name) ben.name = changes.name.to;
            if (changes.accountNumber) ben.accountNumber = changes.accountNumber.to;
          }
          // Apply cooling period after edit
          if (approval.metadata.coolingPeriodHours) {
            ben.status = "cooling_period";
            ben.coolingEndsAt = new Date(
              Date.now() + (approval.metadata.coolingPeriodHours as number) * 60 * 60 * 1000
            ).toISOString();
          }
          break;
        case "DELETE":
          ben.status = "disabled";
          break;
        case "ACTIVATE":
          ben.status = "active";
          break;
        case "DEACTIVATE":
          ben.status = "disabled";
          break;
        case "ADD":
          // Cooling period after addition
          ben.status = "cooling_period";
          ben.coolingEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          break;
      }
      ben.approvedBy = currentUser.name;
      ben.approvedByRole = currentUser.role;
      ben.approvedDate = new Date().toISOString().replace("T", " ").slice(0, 16);
    }
  }

  // GOVERNANCE_ENFORCEMENT — Resolve service request on approval
  if (approval.type === "service_request" && approval.metadata.serviceType) {
    approval.metadata.executionStatus = "EXECUTED";
    approval.metadata.executedAt = new Date().toISOString();
    approval.metadata.executedBy = currentUser.name;
    approval.metadata.executedByRole = currentUser.role;
  }

  // Create activity log
  createActivityLog(
    currentUser.id,
    currentUser.name,
    currentUser.role,
    "APPROVAL_APPROVED",
    `Approved ${approval.type}: ${approval.title}${notes ? ` - ${notes}` : ""}`,
    {
      approvalId: approval.id,
      amount: approval.amount,
      notes,
    },
    approval.priority === "urgent" ? "WARNING" : "INFO"
  );

  // Notify submitter
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

  toast.success("Approval granted", {
    description: `${approval.title} has been approved`,
  });

  return {
    success: true,
    message: "Approval granted successfully",
    approval: updated,
  };
}

/**
 * Send back for revision (Checker/Approver)
 */
export function sendBack(
  approvalId: string,
  reason: string
): ApprovalActionResult {
  const currentUser = getCurrentUser();
  const approval = getApprovalById(approvalId);

  if (!approval) {
    return {
      success: false,
      message: "Approval not found",
    };
  }

  // Visual check: Checker or Approver role
  if (currentUser.role !== "checker" && currentUser.role !== "approver") {
    return {
      success: false,
      message: "Only checkers/approvers can send items back",
    };
  }

  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      message: "Please provide a reason for sending back",
    };
  }

  // Create activity log
  createActivityLog(
    currentUser.id,
    currentUser.name,
    currentUser.role,
    "APPROVAL_REJECTED",
    `Sent back ${approval.type}: ${approval.title} - Reason: ${reason}`,
    {
      approvalId: approval.id,
      reason,
      action: "sent_back",
    },
    "WARNING"
  );

  // Notify submitter
  createNotification(
    "approval_rejected",
    "Sent Back for Revision",
    `${currentUser.name} sent back your ${approval.type}: ${reason}`,
    "medium",
    undefined,
    {
      approvalId: approval.id,
      sentBackBy: currentUser.id,
      reason,
    }
  );

  toast.warning("Item sent back", {
    description: `Returned to maker for revision`,
  });

  return {
    success: true,
    message: "Item sent back for revision",
    approval,
  };
}

/**
 * Reject an item permanently
 */
export function rejectItem(
  approvalId: string,
  reason: string
): ApprovalActionResult {
  const currentUser = getCurrentUser();
  const approval = getApprovalById(approvalId);

  if (!approval) {
    return {
      success: false,
      message: "Approval not found",
    };
  }

  // D1-2: Terminal state guard — reject attempts on already-resolved approvals
  if (isTerminalState(approval.status)) {
    return {
      success: false,
      message: `Approval already resolved (${approval.status}) — duplicate resolution blocked`,
    };
  }

  // Visual check: Checker or Approver role
  if (currentUser.role !== "checker" && currentUser.role !== "approver") {
    return {
      success: false,
      message: "Only checkers/approvers can reject items",
    };
  }

  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      message: "Please provide a reason for rejection",
    };
  }

  // Update approval status
  const updated = updateApprovalStatus(
    approvalId,
    "rejected",
    currentUser.id,
    currentUser.name,
    reason
  );

  if (!updated) {
    return {
      success: false,
      message: "Failed to update approval status",
    };
  }

  // Update related transaction if applicable
  if (approval.type === "transaction" && approval.metadata.transactionId) {
    updateTransactionStatus(
      approval.metadata.transactionId,
      "rejected" as TransactionStatus,
      currentUser.id,
      currentUser.name
    );
  }

  // GOVERNANCE_ENFORCEMENT — Discard service request on rejection
  if (approval.type === "service_request" && approval.metadata.serviceType) {
    approval.metadata.executionStatus = "DISCARDED";
    approval.metadata.rejectedAt = new Date().toISOString();
    approval.metadata.rejectedBy = currentUser.name;
    approval.metadata.rejectedByRole = currentUser.role;
    approval.metadata.rejectionReason = reason;
  }

  // GOVERNANCE_ENFORCEMENT — Discard beneficiary mutation on rejection
  if (approval.type === "beneficiary_mutation" && approval.metadata.beneficiaryId) {
    approval.metadata.executionStatus = "DISCARDED";
    approval.metadata.rejectedAt = new Date().toISOString();
    approval.metadata.rejectedBy = currentUser.name;
    approval.metadata.rejectionReason = reason;
  }

  // Create activity log
  createActivityLog(
    currentUser.id,
    currentUser.name,
    currentUser.role,
    "APPROVAL_REJECTED",
    `Rejected ${approval.type}: ${approval.title} - Reason: ${reason}`,
    {
      approvalId: approval.id,
      reason,
    },
    "CRITICAL"
  );

  // Notify submitter
  createNotification(
    "approval_rejected",
    "Approval Rejected",
    `Your ${approval.type} request has been rejected: ${reason}`,
    "high",
    undefined,
    {
      approvalId: approval.id,
      rejectedBy: currentUser.id,
      reason,
    }
  );

  toast.error("Approval rejected", {
    description: `${approval.title} has been rejected`,
  });

  return {
    success: true,
    message: "Approval rejected",
    approval: updated,
  };
}

// ============================================
// ROLE-BASED ACTION AVAILABILITY
// ============================================

export interface AvailableActions {
  canSubmit: boolean;
  canVerify: boolean;
  canApprove: boolean;
  canSendBack: boolean;
  canReject: boolean;
  canViewOnly: boolean;
}

export function getAvailableActions(
  approval: MockApproval
): AvailableActions {
  const currentUser = getCurrentUser();
  const isSelfSubmitted = approval.submittedBy === currentUser.id;

  // Default: view only
  const actions: AvailableActions = {
    canSubmit: false,
    canVerify: false,
    canApprove: false,
    canSendBack: false,
    canReject: false,
    canViewOnly: true,
  };

  // Maker: Can submit (if draft status)
  if (currentUser.role === "maker" && approval.status === "pending") {
    actions.canSubmit = true;
    actions.canViewOnly = false;
  }

  // Checker: Can verify, send back, or approve (but not own submissions)
  if (currentUser.role === "checker" && !isSelfSubmitted && approval.status === "pending") {
    actions.canVerify = true;
    actions.canApprove = true;
    actions.canSendBack = true;
    actions.canReject = true;
    actions.canViewOnly = false;
  }

  // Approver: Can approve, send back, or reject (but not own submissions)
  if (currentUser.role === "approver" && !isSelfSubmitted && approval.status === "pending") {
    actions.canApprove = true;
    actions.canSendBack = true;
    actions.canReject = true;
    actions.canViewOnly = false;
  }

  // Admin: View only
  if (currentUser.role === "admin") {
    actions.canViewOnly = true;
  }

  // Viewer: View only
  if (currentUser.role === "viewer") {
    actions.canViewOnly = true;
  }

  return actions;
}