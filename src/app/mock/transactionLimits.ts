/**
 * TRANSACTION LIMITS & RULES ENGINE
 * 
 * Reference data for transaction limits, rule checks, and escalation logic.
 * Limits are enforced through the governance engine.
 */

import type { Role } from "./users";

export interface TransactionLimit {
  roleId: Role;
  roleName: string;
  singleTransactionLimit: number;
  dailyTotalLimit: number;
  monthlyTotalLimit: number;
  requiresApprovalAbove: number;
  autoEscalateAbove: number;
  allowedChannels: string[];
  restrictions: string[];
}

export interface RuleCheckResult {
  transactionId: string;
  amount: number;
  status: "within_limit" | "requires_approval" | "auto_escalate" | "exceeds_daily";
  message: string;
  actions: string[];
  severity: "success" | "warning" | "critical";
}

export interface LimitBreach {
  id: string;
  date: string;
  user: string;
  role: Role;
  transactionAmount: number;
  limitType: string;
  limitValue: number;
  action: string;
  resolved: boolean;
}

// Role-based transaction limits
export const ROLE_LIMITS: TransactionLimit[] = [
  {
    roleId: "admin",
    roleName: "Administrator",
    singleTransactionLimit: 999999999,
    dailyTotalLimit: 999999999,
    monthlyTotalLimit: 999999999,
    requiresApprovalAbove: 10000000,
    autoEscalateAbove: 50000000,
    allowedChannels: ["All Channels"],
    restrictions: ["None - Full Access"],
  },
  {
    roleId: "maker",
    roleName: "Transaction Maker",
    singleTransactionLimit: 500000,
    dailyTotalLimit: 2000000,
    monthlyTotalLimit: 40000000,
    requiresApprovalAbove: 250000,
    autoEscalateAbove: 500000,
    allowedChannels: ["BEFTN", "Own Account", "Brac Bank", "MFS"],
    restrictions: ["Cannot initiate RTGS >500K", "Requires checker above 250K"],
  },
  {
    roleId: "checker",
    roleName: "Transaction Checker",
    singleTransactionLimit: 1000000,
    dailyTotalLimit: 5000000,
    monthlyTotalLimit: 100000000,
    requiresApprovalAbove: 750000,
    autoEscalateAbove: 1000000,
    allowedChannels: ["BEFTN", "RTGS", "Own Account", "Brac Bank", "MFS"],
    restrictions: ["Cannot approve own transactions", "Daily limit resets at 00:00"],
  },
  {
    roleId: "approver",
    roleName: "Transaction Approver",
    singleTransactionLimit: 5000000,
    dailyTotalLimit: 20000000,
    monthlyTotalLimit: 400000000,
    requiresApprovalAbove: 5000000,
    autoEscalateAbove: 10000000,
    allowedChannels: ["All Channels"],
    restrictions: ["Dual approval required >10M", "Cannot modify after approval"],
  },
  {
    roleId: "viewer",
    roleName: "Read-Only Viewer",
    singleTransactionLimit: 0,
    dailyTotalLimit: 0,
    monthlyTotalLimit: 0,
    requiresApprovalAbove: 0,
    autoEscalateAbove: 0,
    allowedChannels: ["View Only - No Transactions"],
    restrictions: ["Cannot initiate any transactions", "Read-only access"],
  },
];

// Transaction pre-check scenarios
export const RULE_CHECKS: RuleCheckResult[] = [
  {
    transactionId: "TXN-2024-001",
    amount: 150000,
    status: "within_limit",
    message: "Transaction within your daily limit. Proceed without approval.",
    actions: ["Submit Transaction"],
    severity: "success",
  },
  {
    transactionId: "TXN-2024-002",
    amount: 350000,
    status: "requires_approval",
    message: "Amount exceeds single transaction limit. Requires checker approval.",
    actions: ["Submit for Approval", "Reduce Amount"],
    severity: "warning",
  },
  {
    transactionId: "TXN-2024-003",
    amount: 750000,
    status: "auto_escalate",
    message: "High-value transaction detected. Auto-escalated to Approver role.",
    actions: ["Pending Senior Approval", "Contact Finance Team"],
    severity: "critical",
  },
  {
    transactionId: "TXN-2024-004",
    amount: 2500000,
    status: "exceeds_daily",
    message: "Daily cumulative limit reached. Transaction blocked for today.",
    actions: ["Retry Tomorrow", "Request Limit Increase"],
    severity: "critical",
  },
];

// Limit breach history
export const LIMIT_BREACHES: LimitBreach[] = [
  {
    id: "BRH-001",
    date: "2024-02-15 14:23",
    user: "Fatima Khan",
    role: "maker",
    transactionAmount: 550000,
    limitType: "Single Transaction",
    limitValue: 500000,
    action: "Auto-escalated to Checker",
    resolved: true,
  },
  {
    id: "BRH-002",
    date: "2024-02-14 11:45",
    user: "Rashid Ahmed",
    role: "checker",
    transactionAmount: 1200000,
    limitType: "Single Transaction",
    limitValue: 1000000,
    action: "Auto-escalated to Approver",
    resolved: true,
  },
  {
    id: "BRH-003",
    date: "2024-02-13 16:10",
    user: "Fatima Khan",
    role: "maker",
    transactionAmount: 2100000,
    limitType: "Daily Total",
    limitValue: 2000000,
    action: "Transaction Blocked",
    resolved: false,
  },
  {
    id: "BRH-004",
    date: "2024-02-12 09:30",
    user: "Sarah Rahman",
    role: "approver",
    transactionAmount: 6000000,
    limitType: "Single Transaction",
    limitValue: 5000000,
    action: "Dual Approval Required",
    resolved: true,
  },
];

// Escalation rules matrix
export const ESCALATION_RULES = [
  {
    condition: "Amount > 250K (Maker)",
    action: "Requires Checker Approval",
    timeframe: "24 hours",
    bypass: "N/A",
  },
  {
    condition: "Amount > 750K (Checker)",
    action: "Requires Approver Approval",
    timeframe: "12 hours",
    bypass: "CEO Override",
  },
  {
    condition: "Amount > 5M (Approver)",
    action: "Requires Dual Approver",
    timeframe: "6 hours",
    bypass: "Board Resolution",
  },
  {
    condition: "Daily Limit Exceeded",
    action: "Block Transaction",
    timeframe: "Reset at 00:00",
    bypass: "Risk Manager Override",
  },
  {
    condition: "Suspicious Pattern Detected",
    action: "Auto-hold + AML Review",
    timeframe: "48 hours",
    bypass: "Compliance Head Only",
  },
];

/**
 * Rule check for a given transaction
 * Validates amount against role-based limits
 */
export function checkTransactionRules(
  amount: number,
  userRole: Role
): RuleCheckResult {
  const limit = ROLE_LIMITS.find(l => l.roleId === userRole);
  if (!limit) {
    return {
      transactionId: `TXN-${Date.now()}`,
      amount,
      status: "within_limit",
      message: "No limit configured for this role.",
      actions: ["Proceed"],
      severity: "success",
    };
  }

  // Check single transaction limit
  if (amount > limit.autoEscalateAbove) {
    return {
      transactionId: `TXN-${Date.now()}`,
      amount,
      status: "auto_escalate",
      message: `Transaction exceeds BDT ${(limit.autoEscalateAbove / 100000).toFixed(1)}L. Auto-escalated to higher authority.`,
      actions: ["Submit for Senior Approval", "Reduce Amount"],
      severity: "critical",
    };
  }

  if (amount > limit.requiresApprovalAbove) {
    return {
      transactionId: `TXN-${Date.now()}`,
      amount,
      status: "requires_approval",
      message: `Transaction requires approval. Amount exceeds BDT ${(limit.requiresApprovalAbove / 100000).toFixed(1)}L threshold.`,
      actions: ["Submit for Approval", "Proceed to Approval Queue"],
      severity: "warning",
    };
  }

  return {
    transactionId: `TXN-${Date.now()}`,
    amount,
    status: "within_limit",
    message: "Transaction within your authorized limit. Proceed without approval.",
    actions: ["Submit Transaction"],
    severity: "success",
  };
}