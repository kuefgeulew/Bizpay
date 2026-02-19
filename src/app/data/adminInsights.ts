/**
 * ADMIN INSIGHT DASHBOARD — SPRINT 3 MODULE 5
 * Read-only control tower for admins
 * NO EXECUTION BUTTONS — VISIBILITY ONLY
 */

import { getAllApprovals } from "./approvalEngine";
import { getAllRiskSignals } from "./riskSignals";
import { calculateReceivableLedger } from "./vamIntelligence";
import { generateExceptions, BANK_TRANSACTIONS, LEDGER_ENTRIES } from "./reconciliationEngine";
import { MANAGED_USERS } from "./userManagement";
import { TRANSACTIONS } from "./transactionData";

// ============================================
// 1. APPROVAL HEALTH METRICS
// ============================================

export interface ApprovalHealthMetrics {
  totalPending: number;
  avgApprovalTimeHours: number;
  breachingSLA: number;
  stuckAtChecker: number;
  stuckAtApprover: number;
  healthStatus: "HEALTHY" | "WARNING" | "CRITICAL";
}

export function calculateApprovalHealth(): ApprovalHealthMetrics {
  const approvals = getAllApprovals();
  const pending = approvals.filter(
    (a) => a.status === "PENDING_CHECKER" || a.status === "PENDING_APPROVER"
  );

  const stuckAtChecker = pending.filter((a) => a.status === "PENDING_CHECKER").length;
  const stuckAtApprover = pending.filter((a) => a.status === "PENDING_APPROVER").length;

  // Calculate average approval time for completed approvals
  const completed = approvals.filter((a) => a.status === "APPROVED");
  let avgApprovalTimeHours = 0;
  if (completed.length > 0) {
    const totalHours = completed.reduce((sum, a) => {
      if (!a.approvedAt) return sum;
      const hours = Math.floor(
        (new Date(a.approvedAt).getTime() - new Date(a.submittedAt).getTime()) /
          (1000 * 60 * 60)
      );
      return sum + hours;
    }, 0);
    avgApprovalTimeHours = Math.round(totalHours / completed.length);
  }

  // Calculate SLA breaches (>48 hours)
  const SLA_HOURS = 48;
  const breachingSLA = pending.filter((a) => {
    const hoursPending = Math.floor(
      (new Date().getTime() - new Date(a.submittedAt).getTime()) /
        (1000 * 60 * 60)
    );
    return hoursPending > SLA_HOURS;
  }).length;

  // Determine health status
  let healthStatus: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
  if (breachingSLA >= 3 || pending.length >= 10) {
    healthStatus = "CRITICAL";
  } else if (breachingSLA >= 1 || pending.length >= 5) {
    healthStatus = "WARNING";
  }

  return {
    totalPending: pending.length,
    avgApprovalTimeHours,
    breachingSLA,
    stuckAtChecker,
    stuckAtApprover,
    healthStatus,
  };
}

// ============================================
// 2. USER RISK EXPOSURE
// ============================================

export interface UserRiskExposure {
  userId: string;
  name: string;
  role: string;
  riskType: "LIMIT_NEAR" | "FREQUENT_SENDBACKS" | "LARGE_TRANSACTIONS" | "SUSPENDED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: string;
  metadata: Record<string, any>;
}

export function calculateUserRiskExposure(): UserRiskExposure[] {
  const risks: UserRiskExposure[] = [];

  // Mock limit usage data
  const userLimits = [
    { userId: "usr_002", name: "Fatima Khan", role: "maker", dailyLimit: 1000000, usedToday: 850000 },
    { userId: "usr_005", name: "Nadia Ahmed", role: "maker", dailyLimit: 500000, usedToday: 450000 },
  ];

  // Risk: Users near daily limit (>80%)
  userLimits.forEach((user) => {
    const usagePercent = (user.usedToday / user.dailyLimit) * 100;
    if (usagePercent >= 80) {
      risks.push({
        userId: user.userId,
        name: user.name,
        role: user.role,
        riskType: "LIMIT_NEAR",
        severity: usagePercent >= 95 ? "CRITICAL" : "MEDIUM",
        details: `${Math.round(usagePercent)}% of daily limit used`,
        metadata: {
          dailyLimit: user.dailyLimit,
          usedToday: user.usedToday,
          remainingLimit: user.dailyLimit - user.usedToday,
          usagePercent: Math.round(usagePercent),
        },
      });
    }
  });

  // Risk: Frequent send-backs
  const approvals = getAllApprovals();
  const userSendbacks = new Map<string, number>();

  approvals.forEach((approval) => {
    if (approval.status === "SENT_BACK") {
      const count = userSendbacks.get(approval.submittedBy) || 0;
      userSendbacks.set(approval.submittedBy, count + 1);
    }
  });

  userSendbacks.forEach((count, userId) => {
    if (count >= 2) {
      const user = MANAGED_USERS.find((u) => u.userId === userId);
      if (user) {
        risks.push({
          userId: user.userId,
          name: user.name,
          role: user.role,
          riskType: "FREQUENT_SENDBACKS",
          severity: count >= 3 ? "HIGH" : "MEDIUM",
          details: `${count} transactions sent back`,
          metadata: { sendbackCount: count },
        });
      }
    }
  });

  // Risk: Suspended users with pending items
  const suspendedUsers = MANAGED_USERS.filter((u) => u.status === "SUSPENDED");
  suspendedUsers.forEach((user) => {
    const pendingApprovals = approvals.filter(
      (a) => a.submittedBy === user.userId && 
      (a.status === "PENDING_CHECKER" || a.status === "PENDING_APPROVER")
    );

    if (pendingApprovals.length > 0) {
      risks.push({
        userId: user.userId,
        name: user.name,
        role: user.role,
        riskType: "SUSPENDED",
        severity: "HIGH",
        details: `Suspended user with ${pendingApprovals.length} pending items`,
        metadata: { pendingCount: pendingApprovals.length },
      });
    }
  });

  // Risk: Large transactions by single maker
  const makerTransactions = new Map<string, { count: number; totalAmount: number }>();
  
  TRANSACTIONS.forEach((txn) => {
    // Default maker is usr_002 for current session
    const makerId = "usr_002";
    const existing = makerTransactions.get(makerId) || { count: 0, totalAmount: 0 };
    makerTransactions.set(makerId, {
      count: existing.count + 1,
      totalAmount: existing.totalAmount + txn.amount,
    });
  });

  makerTransactions.forEach((data, userId) => {
    if (data.totalAmount >= 5000000) {
      const user = MANAGED_USERS.find((u) => u.userId === userId);
      if (user) {
        risks.push({
          userId: user.userId,
          name: user.name,
          role: user.role,
          riskType: "LARGE_TRANSACTIONS",
          severity: "MEDIUM",
          details: `${data.count} transactions totaling ৳${data.totalAmount.toLocaleString()}`,
          metadata: {
            transactionCount: data.count,
            totalAmount: data.totalAmount,
          },
        });
      }
    }
  });

  return risks.sort((a, b) => {
    const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

// ============================================
// 3. RECONCILIATION PRESSURE
// ============================================

export interface ReconciliationPressure {
  totalUnmatchedAmount: number;
  itemsAging30Plus: number;
  manualOverridesLast7Days: number;
  confidenceDistribution: {
    high: number; // 90-100%
    medium: number; // 70-89%
    low: number; // <70%
  };
  pressureStatus: "HEALTHY" | "WARNING" | "CRITICAL";
}

export function calculateReconciliationPressure(): ReconciliationPressure {
  const exceptions = generateExceptions(BANK_TRANSACTIONS, LEDGER_ENTRIES);
  
  const totalUnmatchedAmount = exceptions.reduce((sum, e) => sum + e.amount, 0);
  const itemsAging30Plus = exceptions.filter((e) => e.ageDays >= 30).length;

  // Mock manual overrides (from approvals)
  const manualOverridesLast7Days = approvals.filter((a) => {
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(a.submittedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return (
      daysSince <= 7 &&
      a.payload?.matchType === "MANUAL_RECONCILIATION"
    );
  }).length;

  // Mock confidence distribution
  const confidenceDistribution = {
    high: 2, // 90-100%
    medium: 5, // 70-89%
    low: 4, // <70%
  };

  // Determine pressure status
  let pressureStatus: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
  if (itemsAging30Plus >= 4 || totalUnmatchedAmount >= 1000000) {
    pressureStatus = "CRITICAL";
  } else if (itemsAging30Plus >= 2 || totalUnmatchedAmount >= 500000) {
    pressureStatus = "WARNING";
  }

  return {
    totalUnmatchedAmount,
    itemsAging30Plus,
    manualOverridesLast7Days,
    confidenceDistribution,
    pressureStatus,
  };
}

// ============================================
// 4. VAM RECEIVABLE RISK
// ============================================

export interface VAMReceivableRisk {
  totalOutstanding: number;
  clientsCritical: number;
  partialPaymentFrequency: number;
  top5RiskyClients: Array<{
    clientName: string;
    outstandingAmount: number;
    overdueDays: number;
    status: string;
  }>;
  riskStatus: "HEALTHY" | "WARNING" | "CRITICAL";
}

export function calculateVAMReceivableRisk(): VAMReceivableRisk {
  const ledgers = calculateReceivableLedger();

  const totalOutstanding = ledgers.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const clientsCritical = ledgers.filter((l) => l.status === "CRITICAL").length;

  // Calculate partial payment frequency
  const partialPaymentFrequency = ledgers.filter(
    (l) => l.paymentPattern === "PARTIAL"
  ).length;

  // Top 5 risky clients (by outstanding amount + overdue days)
  const top5RiskyClients = ledgers
    .filter((l) => l.outstandingBalance > 0)
    .sort((a, b) => {
      // Risk score = outstanding amount + (overdue days * 10000)
      const scoreA = a.outstandingBalance + a.overdueDays * 10000;
      const scoreB = b.outstandingBalance + b.overdueDays * 10000;
      return scoreB - scoreA;
    })
    .slice(0, 5)
    .map((l) => ({
      clientName: l.clientName,
      outstandingAmount: l.outstandingBalance,
      overdueDays: l.overdueDays,
      status: l.status,
    }));

  // Determine risk status
  let riskStatus: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
  if (clientsCritical >= 2 || totalOutstanding >= 1000000) {
    riskStatus = "CRITICAL";
  } else if (clientsCritical >= 1 || totalOutstanding >= 500000) {
    riskStatus = "WARNING";
  }

  return {
    totalOutstanding,
    clientsCritical,
    partialPaymentFrequency,
    top5RiskyClients,
    riskStatus,
  };
}

// ============================================
// 5. SYSTEM INTEGRITY SIGNALS
// ============================================

export interface SystemIntegritySignals {
  roleViolationsBlocked: number;
  approvalRejectionsSpike: boolean;
  beneficiaryChangesWithPayments: number;
  overallRiskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  integrityStatus: "HEALTHY" | "WARNING" | "CRITICAL";
}

export function calculateSystemIntegrity(): SystemIntegritySignals {
  // Mock role violations (would come from activity log)
  const roleViolationsBlocked = 0; // No violations in current system

  // Approval rejections spike detection
  const last7Days = approvals.filter((a) => {
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(a.submittedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysSince <= 7 && a.status === "SENT_BACK";
  });

  const approvalRejectionsSpike = last7Days.length >= 5;

  // Beneficiary changes + payments correlation (mock)
  const beneficiaryChangesWithPayments = 0; // Would track from activity log

  // Overall risk summary
  const allRiskSignals = getAllRiskSignals();
  const overallRiskSummary = {
    critical: allRiskSignals.filter((s) => s.severity === "CRITICAL").length,
    high: allRiskSignals.filter((s) => s.severity === "HIGH").length,
    medium: allRiskSignals.filter((s) => s.severity === "MEDIUM").length,
    low: allRiskSignals.filter((s) => s.severity === "LOW").length,
  };

  // Determine integrity status
  let integrityStatus: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
  if (
    overallRiskSummary.critical >= 2 ||
    roleViolationsBlocked >= 3 ||
    approvalRejectionsSpike
  ) {
    integrityStatus = "CRITICAL";
  } else if (
    overallRiskSummary.critical >= 1 ||
    overallRiskSummary.high >= 3 ||
    roleViolationsBlocked >= 1
  ) {
    integrityStatus = "WARNING";
  }

  return {
    roleViolationsBlocked,
    approvalRejectionsSpike,
    beneficiaryChangesWithPayments,
    overallRiskSummary,
    integrityStatus,
  };
}

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

export function formatAmount(amount: number): string {
  return `৳${amount.toLocaleString()}`;
}

export function getHealthColor(status: "HEALTHY" | "WARNING" | "CRITICAL"): string {
  switch (status) {
    case "HEALTHY":
      return "emerald";
    case "WARNING":
      return "amber";
    case "CRITICAL":
      return "red";
  }
}

export function getHealthBadge(status: "HEALTHY" | "WARNING" | "CRITICAL"): string {
  switch (status) {
    case "HEALTHY":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "WARNING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "CRITICAL":
      return "bg-red-100 text-red-700 border-red-200";
  }
}