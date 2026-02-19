/**
 * RISK SIGNALS ENGINE — SPRINT 3 MODULE 4
 * Proactive warnings based on rule-based logic (no AI)
 * Non-blocking alerts for dashboard and approval warnings
 */

import { TRANSACTIONS } from "./transactionData";
import {
  getAllApprovals,
  type Approval,
} from "./approvalEngine";
import {
  calculateReceivableLedger,
  type ReceivableLedger,
} from "./vamIntelligence";
import {
  generateExceptions,
  BANK_TRANSACTIONS,
  LEDGER_ENTRIES,
} from "./reconciliationEngine";

// ============================================
// 1. TYPE DEFINITIONS
// ============================================

export type RiskCategory =
  | "TRANSACTION"
  | "APPROVAL"
  | "RECONCILIATION"
  | "RECEIVABLE"
  | "LIMIT"
  | "BENEFICIARY";

export type RiskSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskSignal {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  description: string;
  detectedAt: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata: Record<string, any>;
  actionable: boolean;
  actionLabel?: string;
  dismissed: boolean;
}

// ============================================
// 2. RISK DETECTION RULES
// ============================================

/**
 * RULE 1: Amount Spike Detection
 * Flags transactions significantly higher than historical average
 */
export function detectAmountSpikes(): RiskSignal[] {
  const signals: RiskSignal[] = [];

  // Calculate average transaction amount (last 30 days)
  const recentTransactions = TRANSACTIONS.filter((t) => {
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(t.date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysSince <= 30;
  });

  if (recentTransactions.length === 0) return signals;

  const avgAmount =
    recentTransactions.reduce((sum, t) => sum + t.amount, 0) /
    recentTransactions.length;

  // Flag transactions > 3x average
  const threshold = avgAmount * 3;

  recentTransactions.forEach((txn) => {
    if (txn.amount > threshold) {
      signals.push({
        id: `risk_spike_${txn.id}`,
        category: "TRANSACTION",
        severity: txn.amount > avgAmount * 5 ? "HIGH" : "MEDIUM",
        title: "Unusual Transaction Amount",
        description: `Transaction of ${formatAmount(txn.amount)} is ${Math.round(
          txn.amount / avgAmount
        )}x the average`,
        detectedAt: new Date().toISOString(),
        relatedEntityId: txn.id,
        relatedEntityType: "transaction",
        metadata: {
          transactionAmount: txn.amount,
          averageAmount: Math.round(avgAmount),
          multiplier: Math.round((txn.amount / avgAmount) * 10) / 10,
        },
        actionable: true,
        actionLabel: "Review Transaction",
        dismissed: false,
      });
    }
  });

  return signals;
}

/**
 * RULE 2: New Beneficiary + High Amount
 * Flags high-value transactions to new beneficiaries
 */
export function detectNewBeneficiaryRisk(): RiskSignal[] {
  const signals: RiskSignal[] = [];

  const newBeneficiaryTransactions = TRANSACTIONS.filter((t) => {
    // Check if beneficiary is "new" (first transaction < 30 days ago)
    const beneficiaryTxns = TRANSACTIONS.filter(
      (x) => x.beneficiary === t.beneficiary
    );

    if (beneficiaryTxns.length > 1) return false; // Not new

    // High amount threshold
    return t.amount >= 500000;
  });

  newBeneficiaryTransactions.forEach((txn) => {
    signals.push({
      id: `risk_newben_${txn.id}`,
      category: "BENEFICIARY",
      severity: "HIGH",
      title: "First Transaction to New Beneficiary",
      description: `High-value payment of ${formatAmount(txn.amount)} to ${
        txn.beneficiary
      }`,
      detectedAt: new Date().toISOString(),
      relatedEntityId: txn.id,
      relatedEntityType: "transaction",
      metadata: {
        beneficiary: txn.beneficiary,
        amount: txn.amount,
        isFirstTransaction: true,
      },
      actionable: true,
      actionLabel: "Verify Beneficiary",
      dismissed: false,
    });
  });

  return signals;
}

/**
 * RULE 3: Multiple Approval Send-Backs
 * Flags transactions rejected multiple times
 */
export function detectApprovalSendbacks(): RiskSignal[] {
  const signals: RiskSignal[] = [];

  const allApprovals = getAllApprovals();

  // Group by transaction/entity
  const entityApprovals = new Map<string, Approval[]>();

  allApprovals.forEach((approval) => {
    const key = `${approval.entityType}_${approval.entityId}`;
    if (!entityApprovals.has(key)) {
      entityApprovals.set(key, []);
    }
    entityApprovals.get(key)!.push(approval);
  });

  // Check for multiple sendbacks
  entityApprovals.forEach((approvals, entityKey) => {
    const sendbackCount = approvals.filter(
      (a) => a.status === "SENT_BACK"
    ).length;

    if (sendbackCount >= 2) {
      const latestApproval = approvals[approvals.length - 1];

      signals.push({
        id: `risk_sendback_${entityKey}`,
        category: "APPROVAL",
        severity: sendbackCount >= 3 ? "HIGH" : "MEDIUM",
        title: "Multiple Approval Rejections",
        description: `Item has been sent back ${sendbackCount} times`,
        detectedAt: new Date().toISOString(),
        relatedEntityId: latestApproval.entityId,
        relatedEntityType: latestApproval.entityType,
        metadata: {
          sendbackCount,
          currentStatus: latestApproval.status,
        },
        actionable: true,
        actionLabel: "Review Item",
        dismissed: false,
      });
    }
  });

  return signals;
}

/**
 * RULE 4: Approvals Pending > SLA
 * Flags approvals exceeding time limits
 */
export function detectApprovalSLABreach(): RiskSignal[] {
  const signals: RiskSignal[] = [];

  const pendingApprovals = getAllApprovals().filter(
    (a) => a.status === "PENDING_CHECKER" || a.status === "PENDING_APPROVER"
  );

  const SLA_HOURS = 48; // 2 days

  pendingApprovals.forEach((approval) => {
    const hoursPending = Math.floor(
      (new Date().getTime() - new Date(approval.submittedAt).getTime()) /
        (1000 * 60 * 60)
    );

    if (hoursPending > SLA_HOURS) {
      signals.push({
        id: `risk_sla_${approval.id}`,
        category: "APPROVAL",
        severity: hoursPending > SLA_HOURS * 2 ? "CRITICAL" : "HIGH",
        title: "Approval SLA Breached",
        description: `Approval pending for ${Math.floor(
          hoursPending / 24
        )} days`,
        detectedAt: new Date().toISOString(),
        relatedEntityId: approval.id,
        relatedEntityType: "approval",
        metadata: {
          hoursPending,
          daysPending: Math.floor(hoursPending / 24),
          currentStage: approval.status,
        },
        actionable: true,
        actionLabel: "Escalate",
        dismissed: false,
      });
    }
  });

  return signals;
}

/**
 * RULE 5: Limit Usage > 80%
 * Flags users approaching transaction limits
 */
export function detectLimitUsage(): RiskSignal[] {
  const signals: RiskSignal[] = [];

  // Mock user limits
  const userLimits = [
    {
      userId: "usr_002",
      name: "Fatima Khan",
      role: "maker",
      dailyLimit: 1000000,
      usedToday: 850000,
    },
    {
      userId: "usr_005",
      name: "Nadia Ahmed",
      role: "maker",
      dailyLimit: 500000,
      usedToday: 450000,
    },
  ];

  userLimits.forEach((user) => {
    const usagePercent = (user.usedToday / user.dailyLimit) * 100;

    if (usagePercent >= 80) {
      signals.push({
        id: `risk_limit_${user.userId}`,
        category: "LIMIT",
        severity: usagePercent >= 95 ? "CRITICAL" : "MEDIUM",
        title: "Daily Limit Approaching",
        description: `${user.name} has used ${Math.round(
          usagePercent
        )}% of daily limit`,
        detectedAt: new Date().toISOString(),
        relatedEntityId: user.userId,
        relatedEntityType: "user",
        metadata: {
          userName: user.name,
          dailyLimit: user.dailyLimit,
          usedToday: user.usedToday,
          remainingLimit: user.dailyLimit - user.usedToday,
          usagePercent: Math.round(usagePercent),
        },
        actionable: false,
        dismissed: false,
      });
    }
  });

  return signals;
}

/**
 * RULE 6: Reconciliation Gaps > 30 Days
 * Flags critical reconciliation exceptions
 */
export function detectReconciliationRisk(): RiskSignal[] {
  const signals: RiskSignal[] = [];

  const exceptions = generateExceptions(
    BANK_TRANSACTIONS,
    LEDGER_ENTRIES
  );

  const criticalExceptions = exceptions.filter((e) => e.severity === "CRITICAL");

  if (criticalExceptions.length > 0) {
    const totalAmount = criticalExceptions.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    signals.push({
      id: "risk_reconciliation_critical",
      category: "RECONCILIATION",
      severity: "CRITICAL",
      title: "Critical Reconciliation Gaps",
      description: `${criticalExceptions.length} items unmatched for 30+ days`,
      detectedAt: new Date().toISOString(),
      metadata: {
        count: criticalExceptions.length,
        totalAmount,
        oldestDays: Math.max(...criticalExceptions.map((e) => e.ageDays)),
      },
      actionable: true,
      actionLabel: "Reconcile Now",
      dismissed: false,
    });
  }

  return signals;
}

/**
 * RULE 7: Receivable Overdue > 30 Days
 * Flags clients with long-overdue payments
 */
export function detectReceivableRisk(): RiskSignal[] {
  const signals: RiskSignal[] = [];

  const ledgers = calculateReceivableLedger();
  const criticalClients = ledgers.filter((l) => l.status === "CRITICAL");

  criticalClients.forEach((client) => {
    signals.push({
      id: `risk_receivable_${client.clientId}`,
      category: "RECEIVABLE",
      severity: "HIGH",
      title: "Critical Receivable Overdue",
      description: `${client.clientName} - ${formatAmount(
        client.overdueAmount
      )} overdue for ${client.overdueDays} days`,
      detectedAt: new Date().toISOString(),
      relatedEntityId: client.clientId,
      relatedEntityType: "client",
      metadata: {
        clientName: client.clientName,
        overdueAmount: client.overdueAmount,
        overdueDays: client.overdueDays,
        outstandingBalance: client.outstandingBalance,
      },
      actionable: true,
      actionLabel: "Follow Up",
      dismissed: false,
    });
  });

  return signals;
}

// ============================================
// 3. AGGREGATE ALL SIGNALS
// ============================================

export function getAllRiskSignals(): RiskSignal[] {
  const allSignals: RiskSignal[] = [
    ...detectAmountSpikes(),
    ...detectNewBeneficiaryRisk(),
    ...detectApprovalSendbacks(),
    ...detectApprovalSLABreach(),
    ...detectLimitUsage(),
    ...detectReconciliationRisk(),
    ...detectReceivableRisk(),
  ];

  // Sort by severity (Critical → Info)
  const severityOrder: Record<RiskSeverity, number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1,
  };

  return allSignals.sort(
    (a, b) => severityOrder[b.severity] - severityOrder[a.severity]
  );
}

/**
 * Get risk signals by category
 */
export function getSignalsByCategory(category: RiskCategory): RiskSignal[] {
  return getAllRiskSignals().filter((s) => s.category === category);
}

/**
 * Get risk signals by severity
 */
export function getSignalsBySeverity(severity: RiskSeverity): RiskSignal[] {
  return getAllRiskSignals().filter((s) => s.severity === severity);
}

/**
 * Get count by severity
 */
export function getSeverityCounts() {
  const signals = getAllRiskSignals();
  return {
    CRITICAL: signals.filter((s) => s.severity === "CRITICAL").length,
    HIGH: signals.filter((s) => s.severity === "HIGH").length,
    MEDIUM: signals.filter((s) => s.severity === "MEDIUM").length,
    LOW: signals.filter((s) => s.severity === "LOW").length,
    INFO: signals.filter((s) => s.severity === "INFO").length,
  };
}

// ============================================
// 4. HELPER FUNCTIONS
// ============================================

export function formatAmount(amount: number): string {
  return `৳${amount.toLocaleString()}`;
}

export function getSeverityColor(severity: RiskSeverity): string {
  switch (severity) {
    case "CRITICAL":
      return "red";
    case "HIGH":
      return "orange";
    case "MEDIUM":
      return "amber";
    case "LOW":
      return "blue";
    case "INFO":
      return "gray";
  }
}

export function getSeverityBadge(severity: RiskSeverity): string {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-100 text-red-700 border-red-200";
    case "HIGH":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "LOW":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "INFO":
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export function getCategoryIcon(category: RiskCategory): string {
  switch (category) {
    case "TRANSACTION":
      return "💸";
    case "APPROVAL":
      return "⏳";
    case "RECONCILIATION":
      return "⚠️";
    case "RECEIVABLE":
      return "💰";
    case "LIMIT":
      return "📊";
    case "BENEFICIARY":
      return "👤";
  }
}

export function getCategoryLabel(category: RiskCategory): string {
  return category.replace(/_/g, " ");
}