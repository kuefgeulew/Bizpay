/**
 * APPROVAL QUEUE DATA STORE
 * Centralized approval records for all governed actions
 */

import { isTerminalState } from "../utils/idempotency";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";
export type ApprovalType = "transaction" | "beneficiary" | "beneficiary_mutation" | "service_request" | "reconciliation" | "user" | "service";

export type BeneficiaryMutationType = "ADD" | "EDIT" | "DELETE" | "ACTIVATE" | "DEACTIVATE";

export type ServiceRequestType = "SOFTWARE_TOKEN" | "CHEQUEBOOK" | "POSITIVE_PAY" | "STOP_CHEQUE" | "DISPUTE_REQUEST" | "SUPPORT_TICKET" | "OTHER";

export interface ServiceRequestClassification {
  serviceType: ServiceRequestType;
  requiresApproval: boolean;
  approvalCategory: "SERVICE_REQUEST";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export const SERVICE_REQUEST_CLASSIFICATIONS: Record<ServiceRequestType, ServiceRequestClassification> = {
  SOFTWARE_TOKEN: {
    serviceType: "SOFTWARE_TOKEN",
    requiresApproval: true,
    approvalCategory: "SERVICE_REQUEST",
    riskLevel: "HIGH",
  },
  CHEQUEBOOK: {
    serviceType: "CHEQUEBOOK",
    requiresApproval: true,
    approvalCategory: "SERVICE_REQUEST",
    riskLevel: "HIGH",
  },
  POSITIVE_PAY: {
    serviceType: "POSITIVE_PAY",
    requiresApproval: true,
    approvalCategory: "SERVICE_REQUEST",
    riskLevel: "MEDIUM",
  },
  STOP_CHEQUE: {
    serviceType: "STOP_CHEQUE",
    requiresApproval: true,
    approvalCategory: "SERVICE_REQUEST",
    riskLevel: "HIGH",
  },
  DISPUTE_REQUEST: {
    serviceType: "DISPUTE_REQUEST",
    requiresApproval: true,
    approvalCategory: "SERVICE_REQUEST",
    riskLevel: "MEDIUM",
  },
  SUPPORT_TICKET: {
    serviceType: "SUPPORT_TICKET",
    requiresApproval: true,
    approvalCategory: "SERVICE_REQUEST",
    riskLevel: "LOW",
  },
  OTHER: {
    serviceType: "OTHER",
    requiresApproval: false,
    approvalCategory: "SERVICE_REQUEST",
    riskLevel: "LOW",
  },
};

export interface MockApproval {
  id: string;
  type: ApprovalType;
  subType: string;
  title: string;
  description: string;
  amount?: number;
  status: ApprovalStatus;
  priority: "low" | "medium" | "high" | "urgent";
  submittedBy: string;
  submittedByName: string;
  submittedAt: Date;
  expiresAt: Date;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  metadata: Record<string, any>;
  requiresReAuth: boolean;
  /** D1: Deterministic idempotency key — prevents duplicate creation */
  idempotencyKey?: string;
  /** D1: Resolution lock flag — true while resolution is in flight */
  resolutionLocked?: boolean;
}

export const APPROVAL_RECORDS: MockApproval[] = [
  {
    id: "apr_001",
    type: "transaction",
    subType: "Bank Transfer",
    title: "Bank Transfer to Tech Solutions Ltd",
    description: "Service Fee payment",
    amount: 480000,
    status: "pending",
    priority: "high",
    submittedBy: "usr_002",
    submittedByName: "Fatima Khan",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 70 * 60 * 60 * 1000),
    metadata: {
      transactionId: "txn_003",
      recipient: "Tech Solutions Ltd",
      account: "9876543210",
      bank: "BRAC Bank",
    },
    requiresReAuth: false,
  },
  {
    id: "apr_002",
    type: "transaction",
    subType: "Bank Transfer",
    title: "Bank Transfer to Bengal Imports Ltd",
    description: "Raw Material Procurement",
    amount: 1500000,
    status: "pending",
    priority: "urgent",
    submittedBy: "usr_002",
    submittedByName: "Rahim Ahmed",
    submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 71 * 60 * 60 * 1000),
    metadata: {
      transactionId: "txn_004",
      recipient: "Bengal Imports Ltd",
      account: "BD1234567890",
      bank: "Sonali Bank",
    },
    requiresReAuth: true,
  },
  {
    id: "apr_003",
    type: "reconciliation",
    subType: "Manual Match",
    title: "Reconciliation Exception - Manual Override",
    description: "Match incoming payment to invoice INV-2024-089",
    amount: 125000,
    status: "pending",
    priority: "medium",
    submittedBy: "usr_002",
    submittedByName: "Fatima Khan",
    submittedAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 71.5 * 60 * 60 * 1000),
    metadata: {
      exceptionId: "exc_089",
      invoiceNumber: "INV-2024-089",
      reason: "Amount mismatch due to bank charges",
    },
    requiresReAuth: false,
  },
  {
    id: "apr_004",
    type: "beneficiary",
    subType: "New Beneficiary",
    title: "Add New Beneficiary: XYZ Traders",
    description: "New supplier beneficiary",
    status: "approved",
    priority: "low",
    submittedBy: "usr_002",
    submittedByName: "Fatima Khan",
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    approvedBy: "usr_004",
    approvedByName: "Sarah Rahman",
    approvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    metadata: {
      beneficiaryName: "XYZ Traders",
      accountNumber: "1122334455",
      bank: "Islami Bank Bangladesh",
    },
    requiresReAuth: false,
  },
];

export function getAllApprovals(): MockApproval[] {
  return [...APPROVAL_RECORDS];
}

export function getApprovalById(id: string): MockApproval | undefined {
  return APPROVAL_RECORDS.find(a => a.id === id);
}

export function getApprovalsByStatus(status: ApprovalStatus): MockApproval[] {
  return APPROVAL_RECORDS.filter(a => a.status === status);
}

export function getPendingApprovals(): MockApproval[] {
  return APPROVAL_RECORDS.filter(a => a.status === "pending");
}

export function createApproval(data: Omit<MockApproval, "id" | "submittedAt" | "expiresAt">): MockApproval {
  const newApproval: MockApproval = {
    ...data,
    id: `apr_${Date.now()}`,
    submittedAt: new Date(),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
  };
  APPROVAL_RECORDS.push(newApproval);
  return newApproval;
}

export function updateApprovalStatus(
  id: string,
  status: ApprovalStatus,
  approvedBy?: string,
  approvedByName?: string,
  rejectionReason?: string
): MockApproval | null {
  const approval = APPROVAL_RECORDS.find(a => a.id === id);
  if (!approval) return null;

  // D1-2: Terminal state guard — once resolved, no further mutations
  if (isTerminalState(approval.status)) {
    return null;
  }

  approval.status = status;
  if (approvedBy && approvedByName) {
    approval.approvedBy = approvedBy;
    approval.approvedByName = approvedByName;
    approval.approvedAt = new Date();
  }
  if (rejectionReason) {
    approval.rejectionReason = rejectionReason;
  }
  return approval;
}