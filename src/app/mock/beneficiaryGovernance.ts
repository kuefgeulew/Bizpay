/**
 * BENEFICIARY LIFECYCLE GOVERNANCE — DATA STORE
 * Beneficiary records, approval history, and governance rules
 * for lifecycle management and risk controls.
 */

import type { Role } from "./users";

export type BeneficiaryStatus = 
  | "active" 
  | "pending_approval" 
  | "cooling_period" 
  | "disabled" 
  | "rejected";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface BeneficiaryRecord {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountType: "savings" | "current" | "cc";
  status: BeneficiaryStatus;
  riskLevel: RiskLevel;
  riskFlags: string[];
  
  // Lifecycle metadata
  addedBy: string;
  addedByRole: Role;
  addedDate: string;
  approvedBy?: string;
  approvedByRole?: Role;
  approvedDate?: string;
  lastUsedDate?: string;
  
  // Cooling period
  coolingPeriodHours: number;
  coolingEndsAt?: string;
  
  // Activity stats
  transactionCount: number;
  totalTransferred: number;
  firstTransactionDate?: string;
}

export interface ApprovalHistoryEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  role: Role;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface GovernanceRule {
  id: string;
  title: string;
  condition: string;
  action: string;
  requiresApproval: boolean;
  coolingPeriod: number; // hours
  riskLevel: RiskLevel;
}

// Mock beneficiary records with various states
export const BENEFICIARIES: BeneficiaryRecord[] = [
  {
    id: "BEN-001",
    name: "Rahman Textiles Ltd",
    accountNumber: "1234567890",
    bankName: "BRAC Bank",
    bankCode: "BRACLK22",
    accountType: "current",
    status: "active",
    riskLevel: "low",
    riskFlags: [],
    addedBy: "Fatima Khan",
    addedByRole: "maker",
    addedDate: "2024-01-15 10:30",
    approvedBy: "Rashid Ahmed",
    approvedByRole: "approver",
    approvedDate: "2024-01-15 14:45",
    lastUsedDate: "2024-02-16 09:15",
    coolingPeriodHours: 24,
    transactionCount: 47,
    totalTransferred: 12450000,
    firstTransactionDate: "2024-01-16 11:00",
  },
  {
    id: "BEN-002",
    name: "Green Valley Suppliers",
    accountNumber: "9876543210",
    bankName: "Dutch-Bangla Bank",
    bankCode: "DBBL",
    accountType: "current",
    status: "cooling_period",
    riskLevel: "medium",
    riskFlags: ["First-time beneficiary", "High initial amount"],
    addedBy: "Fatima Khan",
    addedByRole: "maker",
    addedDate: "2024-02-16 16:20",
    approvedBy: "Sarah Rahman",
    approvedByRole: "approver",
    approvedDate: "2024-02-16 18:30",
    coolingEndsAt: "2024-02-17 18:30",
    coolingPeriodHours: 24,
    transactionCount: 0,
    totalTransferred: 0,
  },
  {
    id: "BEN-003",
    name: "City Steel Industries",
    accountNumber: "5555666677",
    bankName: "Islami Bank",
    bankCode: "IBBL",
    accountType: "current",
    status: "pending_approval",
    riskLevel: "high",
    riskFlags: ["New bank", "Large expected volume", "High-value entity"],
    addedBy: "Karim Hassan",
    addedByRole: "maker",
    addedDate: "2024-02-17 08:45",
    coolingPeriodHours: 48,
    transactionCount: 0,
    totalTransferred: 0,
  },
  {
    id: "BEN-004",
    name: "Ocean Logistics Pvt Ltd",
    accountNumber: "4444333322",
    bankName: "Standard Chartered",
    bankCode: "SCBL",
    accountType: "current",
    status: "active",
    riskLevel: "medium",
    riskFlags: ["Modified account details", "Dormant for 30 days"],
    addedBy: "Fatima Khan",
    addedByRole: "maker",
    addedDate: "2023-11-20 14:00",
    approvedBy: "Rashid Ahmed",
    approvedByRole: "approver",
    approvedDate: "2023-11-21 10:15",
    lastUsedDate: "2024-01-10 16:40",
    coolingPeriodHours: 24,
    transactionCount: 23,
    totalTransferred: 8750000,
    firstTransactionDate: "2023-11-22 09:30",
  },
  {
    id: "BEN-005",
    name: "Tech Solutions Bangladesh",
    accountNumber: "7777888899",
    bankName: "City Bank",
    bankCode: "CITY",
    accountType: "current",
    status: "disabled",
    riskLevel: "critical",
    riskFlags: ["Suspicious pattern", "AML review required", "Admin disabled"],
    addedBy: "Karim Hassan",
    addedByRole: "maker",
    addedDate: "2024-01-05 11:20",
    approvedBy: "Sarah Rahman",
    approvedByRole: "approver",
    approvedDate: "2024-01-05 15:30",
    lastUsedDate: "2024-02-10 14:20",
    coolingPeriodHours: 24,
    transactionCount: 8,
    totalTransferred: 15000000,
    firstTransactionDate: "2024-01-06 10:00",
  },
];

// Approval history for BEN-003 (Pending)
export const APPROVAL_HISTORY_BEN003: ApprovalHistoryEvent[] = [
  {
    id: "EVT-003-001",
    timestamp: "2024-02-17 08:45",
    action: "Beneficiary Created",
    actor: "Karim Hassan",
    role: "maker",
    status: "pending",
    notes: "New supplier for steel procurement project",
  },
  {
    id: "EVT-003-002",
    timestamp: "2024-02-17 08:47",
    action: "Sent for Approval",
    actor: "System",
    role: "maker",
    status: "pending",
    notes: "Auto-routed to Approver due to high risk flags",
  },
];

// Approval history for BEN-002 (Cooling)
export const APPROVAL_HISTORY_BEN002: ApprovalHistoryEvent[] = [
  {
    id: "EVT-002-001",
    timestamp: "2024-02-16 16:20",
    action: "Beneficiary Created",
    actor: "Fatima Khan",
    role: "maker",
    status: "pending",
  },
  {
    id: "EVT-002-002",
    timestamp: "2024-02-16 16:22",
    action: "Sent for Approval",
    actor: "System",
    role: "maker",
    status: "pending",
  },
  {
    id: "EVT-002-003",
    timestamp: "2024-02-16 18:30",
    action: "Approved by Approver",
    actor: "Sarah Rahman",
    role: "approver",
    status: "approved",
    notes: "Verified supplier credentials. 24hr cooling period applied.",
  },
  {
    id: "EVT-002-004",
    timestamp: "2024-02-16 18:30",
    action: "Cooling Period Started",
    actor: "System",
    role: "approver",
    status: "approved",
    notes: "Transfers blocked until 2024-02-17 18:30",
  },
];

// Approval history for BEN-001 (Active, complete history)
export const APPROVAL_HISTORY_BEN001: ApprovalHistoryEvent[] = [
  {
    id: "EVT-001-001",
    timestamp: "2024-01-15 10:30",
    action: "Beneficiary Created",
    actor: "Fatima Khan",
    role: "maker",
    status: "pending",
  },
  {
    id: "EVT-001-002",
    timestamp: "2024-01-15 10:32",
    action: "Sent for Approval",
    actor: "System",
    role: "maker",
    status: "pending",
  },
  {
    id: "EVT-001-003",
    timestamp: "2024-01-15 14:45",
    action: "Approved by Approver",
    actor: "Rashid Ahmed",
    role: "approver",
    status: "approved",
    notes: "Long-term supplier. Approved with 24hr cooling.",
  },
  {
    id: "EVT-001-004",
    timestamp: "2024-01-15 14:45",
    action: "Cooling Period Started",
    actor: "System",
    role: "approver",
    status: "approved",
  },
  {
    id: "EVT-001-005",
    timestamp: "2024-01-16 14:45",
    action: "Cooling Period Ended",
    actor: "System",
    role: "approver",
    status: "approved",
  },
  {
    id: "EVT-001-006",
    timestamp: "2024-01-16 11:00",
    action: "First Transaction Executed",
    actor: "Fatima Khan",
    role: "maker",
    status: "approved",
    notes: "BDT 250,000 via BEFTN",
  },
];

// Governance rules for beneficiary lifecycle
export const BENEFICIARY_GOVERNANCE_RULES: GovernanceRule[] = [
  {
    id: "RULE-BEN-001",
    title: "New Beneficiary Addition",
    condition: "Any new beneficiary",
    action: "Requires Approver approval + 24hr cooling",
    requiresApproval: true,
    coolingPeriod: 24,
    riskLevel: "medium",
  },
  {
    id: "RULE-BEN-002",
    title: "High-Value Expected Usage",
    condition: "Expected monthly volume > BDT 5M",
    action: "Requires Approver approval + 48hr cooling",
    requiresApproval: true,
    coolingPeriod: 48,
    riskLevel: "high",
  },
  {
    id: "RULE-BEN-003",
    title: "Account Details Modification",
    condition: "Bank/account number change",
    action: "Requires Approver re-approval + 24hr cooling",
    requiresApproval: true,
    coolingPeriod: 24,
    riskLevel: "medium",
  },
  {
    id: "RULE-BEN-004",
    title: "Dormant Beneficiary Reactivation",
    condition: "No transactions for 60+ days",
    action: "Auto-flag for review before next use",
    requiresApproval: false,
    coolingPeriod: 0,
    riskLevel: "low",
  },
  {
    id: "RULE-BEN-005",
    title: "Suspicious Pattern Detection",
    condition: "Rapid high-value transactions or AML flag",
    action: "Auto-disable + compliance review required",
    requiresApproval: true,
    coolingPeriod: 0,
    riskLevel: "critical",
  },
];

/**
 * Get approval history for a beneficiary
 */
export function getApprovalHistory(beneficiaryId: string): ApprovalHistoryEvent[] {
  switch (beneficiaryId) {
    case "BEN-001":
      return APPROVAL_HISTORY_BEN001;
    case "BEN-002":
      return APPROVAL_HISTORY_BEN002;
    case "BEN-003":
      return APPROVAL_HISTORY_BEN003;
    default:
      return [];
  }
}

/**
 * Calculate remaining cooling time
 */
export function getCoolingTimeRemaining(beneficiary: BeneficiaryRecord): string {
  if (beneficiary.status !== "cooling_period" || !beneficiary.coolingEndsAt) {
    return "N/A";
  }
  
  return "6 hours 15 minutes";
}

/**
 * Get risk badge color
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400";
    case "medium":
      return "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400";
    case "high":
      return "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400";
    case "critical":
      return "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400";
  }
}

/**
 * Get status badge color
 */
export function getStatusColor(status: BeneficiaryStatus): string {
  switch (status) {
    case "active":
      return "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400";
    case "pending_approval":
      return "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400";
    case "cooling_period":
      return "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400";
    case "disabled":
      return "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400";
    case "rejected":
      return "from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-400";
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: BeneficiaryStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "pending_approval":
      return "Pending Approval";
    case "cooling_period":
      return "Cooling Period";
    case "disabled":
      return "Disabled";
    case "rejected":
      return "Rejected";
  }
}