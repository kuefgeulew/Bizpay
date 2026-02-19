/**
 * ACTIVITY LOG DATA
 * Session-scoped immutable audit trail
 * All amounts are BDT — BizPay is BDT-only by design.
 */

export type ActivityAction =
  | "LOGIN"
  | "LOGOUT"
  | "TRANSACTION_CREATED"
  | "TRANSACTION_APPROVED"
  | "TRANSACTION_REJECTED"
  | "APPROVAL_SUBMITTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_REJECTED"
  | "BENEFICIARY_ADDED"
  | "BENEFICIARY_DELETED"
  | "RECONCILIATION_MATCHED"
  | "RECONCILIATION_OVERRIDE"
  | "USER_ROLE_CHANGED"
  | "SETTINGS_UPDATED"
  | "REPORT_GENERATED"
  | "EXPORT_COMPLETED";

export type ActivitySeverity = "INFO" | "WARNING" | "CRITICAL";

export interface MockActivityLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: ActivityAction;
  description: string;
  severity: ActivitySeverity;
  ipAddress: string;
  metadata: Record<string, any>;
  isImmutable: boolean; // Visual indicator only
}

export const SYSTEM_ACTIVITY_LOGS: MockActivityLog[] = [
  {
    id: "log_001",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "TRANSACTION_CREATED",
    description: "Created bank transfer to Acme Corporation for ৳2,50,000",
    severity: "INFO",
    ipAddress: "192.168.1.105",
    metadata: {
      transactionId: "txn_001",
      amount: 250000,
      recipient: "Acme Corporation",
    },
    isImmutable: true,
  },
  {
    id: "log_002",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000),
    userId: "u3",
    userName: "Tariq Hasan",
    userRole: "approver",
    action: "TRANSACTION_APPROVED",
    description: "Approved bank transfer to Acme Corporation",
    severity: "INFO",
    ipAddress: "192.168.1.112",
    metadata: {
      transactionId: "txn_001",
      approvalId: "apr_historical_001",
    },
    isImmutable: true,
  },
  {
    id: "log_003",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "TRANSACTION_CREATED",
    description: "Created MFS payment to Ali Hasan for ৳85,000",
    severity: "INFO",
    ipAddress: "192.168.1.105",
    metadata: {
      transactionId: "txn_002",
      amount: 85000,
      recipient: "Ali Hasan",
    },
    isImmutable: true,
  },
  {
    id: "log_004",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1800000),
    userId: "u3",
    userName: "Tariq Hasan",
    userRole: "approver",
    action: "TRANSACTION_APPROVED",
    description: "Approved MFS payment to Ali Hasan",
    severity: "INFO",
    ipAddress: "192.168.1.112",
    metadata: {
      transactionId: "txn_002",
      approvalId: "apr_historical_002",
    },
    isImmutable: true,
  },
  {
    id: "log_005",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "APPROVAL_SUBMITTED",
    description: "Submitted bank transfer to Tech Solutions Ltd for approval (৳4,80,000)",
    severity: "INFO",
    ipAddress: "192.168.1.105",
    metadata: {
      transactionId: "txn_003",
      approvalId: "apr_001",
      amount: 480000,
    },
    isImmutable: true,
  },
  {
    id: "log_006",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "APPROVAL_SUBMITTED",
    description: "Submitted bank transfer to Bengal Imports Ltd for approval (৳15,00,000)",
    severity: "WARNING",
    ipAddress: "192.168.1.105",
    metadata: {
      transactionId: "txn_004",
      approvalId: "apr_002",
      amount: 1500000,
    },
    isImmutable: true,
  },
  {
    id: "log_007",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    userId: "u2",
    userName: "Nusrat Khan",
    userRole: "checker",
    action: "RECONCILIATION_OVERRIDE",
    description: "Submitted reconciliation override for INV-2024-089",
    severity: "CRITICAL",
    ipAddress: "192.168.1.108",
    metadata: {
      exceptionId: "exc_089",
      approvalId: "apr_003",
      reason: "Amount mismatch due to bank charges",
    },
    isImmutable: true,
  },
];

export function getAllActivityLogs(): MockActivityLog[] {
  return [...SYSTEM_ACTIVITY_LOGS].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getActivityLogById(id: string): MockActivityLog | undefined {
  return SYSTEM_ACTIVITY_LOGS.find(log => log.id === id);
}

export function getActivityLogsByUser(userId: string): MockActivityLog[] {
  return SYSTEM_ACTIVITY_LOGS.filter(log => log.userId === userId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getActivityLogsByAction(action: ActivityAction): MockActivityLog[] {
  return SYSTEM_ACTIVITY_LOGS.filter(log => log.action === action)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getActivityLogsBySeverity(severity: ActivitySeverity): MockActivityLog[] {
  return SYSTEM_ACTIVITY_LOGS.filter(log => log.severity === severity)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function createActivityLog(
  userId: string,
  userName: string,
  userRole: string,
  action: ActivityAction,
  description: string,
  metadata: Record<string, any> = {},
  severity: ActivitySeverity = "INFO"
): MockActivityLog {
  const newLog: MockActivityLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    userId,
    userName,
    userRole,
    action,
    description,
    severity,
    ipAddress: "192.168.1.105", // Mock IP
    metadata,
    isImmutable: true, // Visual indicator
  };
  SYSTEM_ACTIVITY_LOGS.push(newLog);
  return newLog;
}

// Simulate export (returns CSV content)
export function exportActivityLogs(logs: MockActivityLog[]): string {
  const headers = ["Timestamp", "User", "Role", "Action", "Description", "Severity", "IP Address"];
  const rows = logs.map(log => [
    log.timestamp.toISOString(),
    log.userName,
    log.userRole,
    log.action,
    log.description,
    log.severity,
    log.ipAddress,
  ]);
  
  const csv = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
  ].join("\n");
  
  return csv;
}
