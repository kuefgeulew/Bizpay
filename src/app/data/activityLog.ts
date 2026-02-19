/**
 * ENHANCED ACTIVITY LOG — SPRINT 4 MODULE 2
 * Enterprise-grade audit trail with filtering, pagination, export, correlation
 *
 * BizPay is BDT-only by design. Any non-BDT currency is a system violation.
 */

export type ActivityAction =
  | "LOGIN"
  | "LOGOUT"
  | "TRANSACTION_SUBMIT"
  | "TRANSACTION_APPROVE"
  | "TRANSACTION_REJECT"
  | "TRANSACTION_EXECUTED"
  | "BENEFICIARY_ADD"
  | "BENEFICIARY_EDIT"
  | "BENEFICIARY_DELETE"
  | "BENEFICIARY_APPROVED"
  | "BENEFICIARY_APPROVAL_REQUESTED"
  | "BENEFICIARY_CREATED"
  | "BENEFICIARY_DISABLED"
  | "FIRST_BENEFICIARY_TRANSACTION"
  | "COOLING_PERIOD_STARTED"
  | "USER_ADD"
  | "USER_EDIT"
  | "USER_SUSPEND"
  | "USER_ROLE_CHANGE"
  | "APPROVAL_VERIFY"
  | "APPROVAL_SENDBACK"
  | "RECONCILIATION_MATCH"
  | "RECONCILIATION_OVERRIDE"
  | "LIMIT_BREACH_ATTEMPT"
  | "ROLE_VIOLATION_BLOCKED"
  | "SESSION_TIMEOUT"
  | "PASSWORD_CHANGE"
  | "DELEGATION_CREATE"
  | "DELEGATION_REVOKE"
  | "STOP_CHEQUE_REQUESTED"
  | "DISPUTE_RAISED"
  | "SUPPORT_TICKET_CREATED"
  | "PROFILE_SWITCHED"
  | "FORCED_LOGOUT"
  | "APPROVAL_RULE_VIEWED";

export type ActivitySeverity = "INFO" | "WARNING" | "HIGH" | "CRITICAL";

export type ActivityCategory =
  | "AUTHENTICATION"
  | "TRANSACTION"
  | "APPROVAL"
  | "USER_MANAGEMENT"
  | "RECONCILIATION"
  | "SECURITY"
  | "DELEGATION"
  | "PAYMENT"
  | "SERVICE_REQUEST"
  | "ADMIN";

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: ActivityAction;
  category: ActivityCategory;
  severity: ActivitySeverity;
  description: string;
  feature?: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string; // Links related activities
  metadata: Record<string, any>;
  ipAddress?: string;
  deviceInfo?: string;
  reasonCode?: string; // Immutable reason for action
  isImmutable: boolean; // Cannot be deleted
  resource?: string;
}

export interface ActivityFilter {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  role?: string;
  action?: ActivityAction;
  category?: ActivityCategory;
  severity?: ActivitySeverity;
  searchQuery?: string;
  correlationId?: string;
}

// ============================================
// CANONICAL MOCK USERS
// ============================================

export const ACTIVITY_USERS = [
  { id: "u1", name: "Rahim Ahmed", role: "maker" },
  { id: "u2", name: "Nusrat Khan", role: "checker" },
  { id: "u3", name: "Tariq Hasan", role: "approver" },
  { id: "u4", name: "Shamima Akter", role: "admin" },
] as const;

// ============================================
// MOCK ACTIVITY LOG DATA — 35 entries
// Spread across: Today, Yesterday, Last 7 days
// Covers: Transactions, Beneficiaries, Service Requests, Admin
// ============================================

export const ACTIVITY_LOG: ActivityLogEntry[] = [
  // ── TODAY (2026-02-18) ──

  {
    id: "log_001",
    timestamp: "2026-02-18T14:30:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "TRANSACTION_SUBMIT",
    category: "TRANSACTION",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) initiated a Third-Party Transfer of ৳50,000 to Acme Corporation",
    feature: "Third-Party Transfer",
    entityType: "transaction",
    entityId: "txn_001",
    correlationId: "corr_txn_001",
    metadata: {
      amount: 50000,
      recipient: "Acme Corporation",
      method: "BEFTN",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "BUSINESS_PAYMENT",
    isImmutable: true,
  },
  {
    id: "log_002",
    timestamp: "2026-02-18T14:45:00Z",
    userId: "u2",
    userName: "Nusrat Khan",
    userRole: "checker",
    action: "APPROVAL_VERIFY",
    category: "APPROVAL",
    severity: "INFO",
    description: "Nusrat Khan (Checker) reviewed Third-Party Transfer of ৳50,000 — documents verified, amount confirmed",
    feature: "Third-Party Transfer",
    entityType: "transaction",
    entityId: "txn_001",
    correlationId: "corr_txn_001",
    metadata: {
      approvalId: "apr_001",
      comment: "Documents verified, amount confirmed",
    },
    ipAddress: "203.112.45.68",
    deviceInfo: "Chrome 120 / macOS 14",
    reasonCode: "CHECKER_VERIFICATION",
    isImmutable: true,
  },
  {
    id: "log_003",
    timestamp: "2026-02-18T15:00:00Z",
    userId: "u3",
    userName: "Tariq Hasan",
    userRole: "approver",
    action: "TRANSACTION_APPROVE",
    category: "TRANSACTION",
    severity: "HIGH",
    description: "Tariq Hasan (Approver) approved Third-Party Transfer of ৳50,000 to Acme Corporation",
    feature: "Third-Party Transfer",
    entityType: "transaction",
    entityId: "txn_001",
    correlationId: "corr_txn_001",
    metadata: {
      amount: 50000,
      approvalComment: "Approved for execution",
    },
    ipAddress: "203.112.45.69",
    deviceInfo: "Safari 17 / iOS 17",
    reasonCode: "APPROVER_APPROVAL",
    isImmutable: true,
  },
  {
    id: "log_004",
    timestamp: "2026-02-18T15:01:00Z",
    userId: "system",
    userName: "System",
    userRole: "system",
    action: "TRANSACTION_EXECUTED",
    category: "TRANSACTION",
    severity: "INFO",
    description: "Third-Party Transfer of ৳50,000 to Acme Corporation executed successfully via BEFTN",
    feature: "Third-Party Transfer",
    entityType: "transaction",
    entityId: "txn_001",
    correlationId: "corr_txn_001",
    metadata: {
      executionRef: "BEFTN-2026021801",
      completedAt: "2026-02-18T15:01:00Z",
    },
    ipAddress: "N/A",
    deviceInfo: "System Process",
    reasonCode: "AUTO_EXECUTION",
    isImmutable: true,
  },
  {
    id: "log_005",
    timestamp: "2026-02-18T13:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "TRANSACTION_SUBMIT",
    category: "TRANSACTION",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) initiated MFS disbursement of ৳85,000 to Ali Hasan via bKash",
    feature: "MFS Payment",
    entityType: "transaction",
    entityId: "txn_002",
    correlationId: "corr_txn_002",
    metadata: {
      amount: 85000,
      mfsProvider: "bKash",
      recipientPhone: "01711234567",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "SALARY_PAYMENT",
    isImmutable: true,
  },
  {
    id: "log_006",
    timestamp: "2026-02-18T11:30:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "LIMIT_BREACH_ATTEMPT",
    category: "SECURITY",
    severity: "WARNING",
    description: "Rahim Ahmed (Maker) attempted transaction of ৳9,00,000 exceeding daily limit of ৳8,50,000 — blocked by governance engine",
    feature: "Transaction Limits",
    metadata: {
      requestedAmount: 900000,
      availableLimit: 850000,
      breachAmount: 50000,
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "LIMIT_ENFORCEMENT",
    isImmutable: true,
  },
  {
    id: "log_007",
    timestamp: "2026-02-18T10:00:00Z",
    userId: "u4",
    userName: "Shamima Akter",
    userRole: "admin",
    action: "USER_ROLE_CHANGE",
    category: "USER_MANAGEMENT",
    severity: "CRITICAL",
    description: "Shamima Akter (Admin) changed Nadia Ahmed's role from Maker to Checker",
    feature: "User Management",
    entityType: "user",
    entityId: "usr_005",
    correlationId: "corr_user_001",
    metadata: {
      previousRole: "maker",
      newRole: "checker",
      targetUser: "Nadia Ahmed",
    },
    ipAddress: "203.112.45.70",
    deviceInfo: "Firefox 122 / Ubuntu 22.04",
    reasonCode: "ADMIN_ROLE_UPDATE",
    isImmutable: true,
  },
  {
    id: "log_008",
    timestamp: "2026-02-18T09:15:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "STOP_CHEQUE_REQUESTED",
    category: "SERVICE_REQUEST",
    severity: "HIGH",
    description: "Rahim Ahmed (Maker) requested stop cheque for cheque #004521 — routed to approval queue",
    feature: "Stop Cheque",
    entityType: "service_request",
    entityId: "sr_001",
    correlationId: "corr_sr_001",
    metadata: {
      chequeNumber: "004521",
      reason: "Cheque reported lost",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "STOP_CHEQUE",
    isImmutable: true,
  },
  {
    id: "log_009",
    timestamp: "2026-02-18T08:45:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "DISPUTE_RAISED",
    category: "SERVICE_REQUEST",
    severity: "WARNING",
    description: "Rahim Ahmed (Maker) raised dispute DSP-001 for wrong debit of ৳2,50,000 against TXN2025021501",
    feature: "Dispute Management",
    entityType: "dispute",
    entityId: "dsp_001",
    correlationId: "corr_dsp_001",
    metadata: {
      transactionRef: "TXN2025021501",
      disputeAmount: 250000,
      category: "Wrong Debit",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "DISPUTE_FILING",
    isImmutable: true,
  },
  {
    id: "log_010",
    timestamp: "2026-02-18T08:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "LOGIN",
    category: "AUTHENTICATION",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) logged in successfully",
    feature: "Authentication",
    metadata: {
      loginMethod: "PASSWORD",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "USER_LOGIN",
    isImmutable: true,
  },

  // ── YESTERDAY (2026-02-17) ──

  {
    id: "log_011",
    timestamp: "2026-02-17T18:00:00Z",
    userId: "u2",
    userName: "Nusrat Khan",
    userRole: "checker",
    action: "APPROVAL_SENDBACK",
    category: "APPROVAL",
    severity: "WARNING",
    description: "Nusrat Khan (Checker) sent back beneficiary addition for correction — beneficiary name mismatch with account details",
    feature: "Beneficiary Management",
    entityType: "beneficiary",
    entityId: "apv_006",
    correlationId: "corr_ben_001",
    metadata: {
      approvalId: "apv_006",
      comment: "Beneficiary name mismatch with account details",
    },
    ipAddress: "203.112.45.68",
    deviceInfo: "Chrome 120 / macOS 14",
    reasonCode: "CHECKER_SENDBACK",
    isImmutable: true,
  },
  {
    id: "log_012",
    timestamp: "2026-02-17T16:30:00Z",
    userId: "u4",
    userName: "Shamima Akter",
    userRole: "admin",
    action: "RECONCILIATION_OVERRIDE",
    category: "RECONCILIATION",
    severity: "CRITICAL",
    description: "Shamima Akter (Admin) manually matched reconciliation exception EXC-001 — confidence 85%",
    feature: "Reconciliation",
    entityType: "reconciliation",
    entityId: "exc_001",
    correlationId: "corr_recon_001",
    metadata: {
      exceptionId: "exc_001",
      matchType: "MANUAL",
      confidence: 85,
    },
    ipAddress: "203.112.45.70",
    deviceInfo: "Firefox 122 / Ubuntu 22.04",
    reasonCode: "MANUAL_RECONCILIATION",
    isImmutable: true,
  },
  {
    id: "log_013",
    timestamp: "2026-02-17T15:00:00Z",
    userId: "u3",
    userName: "Tariq Hasan",
    userRole: "approver",
    action: "DELEGATION_CREATE",
    category: "DELEGATION",
    severity: "HIGH",
    description: "Tariq Hasan (Approver) delegated approval rights to Rashid Ali (2026-02-18 to 2026-02-24)",
    feature: "Approval Delegation",
    entityType: "delegation",
    entityId: "del_001",
    correlationId: "corr_del_001",
    metadata: {
      delegateUserId: "usr_006",
      delegateName: "Rashid Ali",
      startDate: "2026-02-18",
      endDate: "2026-02-24",
      reason: "On business travel",
    },
    ipAddress: "203.112.45.69",
    deviceInfo: "Safari 17 / iOS 17",
    reasonCode: "DELEGATION_SETUP",
    isImmutable: true,
  },
  {
    id: "log_014",
    timestamp: "2026-02-17T14:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "BENEFICIARY_ADD",
    category: "TRANSACTION",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) added new beneficiary Acme Trading Ltd for approval",
    feature: "Beneficiary Management",
    entityType: "beneficiary",
    entityId: "apv_002",
    correlationId: "corr_ben_002",
    metadata: {
      beneficiaryName: "Acme Trading Ltd.",
      accountNumber: "1234567890",
      bankName: "Dutch-Bangla Bank",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "NEW_BENEFICIARY",
    isImmutable: true,
  },
  {
    id: "log_015",
    timestamp: "2026-02-17T12:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "ROLE_VIOLATION_BLOCKED",
    category: "SECURITY",
    severity: "CRITICAL",
    description: "Rahim Ahmed (Maker) attempted to approve transaction without Approver permission — blocked by governance engine",
    feature: "Role Enforcement",
    metadata: {
      attemptedAction: "APPROVE_TRANSACTION",
      requiredRole: "approver",
      actualRole: "maker",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "ROLE_ENFORCEMENT",
    isImmutable: true,
  },
  {
    id: "log_016",
    timestamp: "2026-02-17T11:30:00Z",
    userId: "u3",
    userName: "Tariq Hasan",
    userRole: "approver",
    action: "TRANSACTION_APPROVE",
    category: "TRANSACTION",
    severity: "HIGH",
    description: "Tariq Hasan (Approver) approved Bank Transfer of ৳4,80,000 to Tech Solutions Ltd",
    feature: "Bank Transfer",
    entityType: "transaction",
    entityId: "txn_003",
    correlationId: "corr_txn_003",
    metadata: {
      amount: 480000,
      approvalComment: "Approved — supporting documents verified",
    },
    ipAddress: "203.112.45.69",
    deviceInfo: "Safari 17 / iOS 17",
    reasonCode: "APPROVER_APPROVAL",
    isImmutable: true,
  },
  {
    id: "log_017",
    timestamp: "2026-02-17T10:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "SUPPORT_TICKET_CREATED",
    category: "SERVICE_REQUEST",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) created support ticket TKT-045 — Account statement discrepancy for January 2026",
    feature: "Support Tickets",
    entityType: "support_ticket",
    entityId: "tkt_045",
    correlationId: "corr_tkt_001",
    metadata: {
      ticketSubject: "Account statement discrepancy",
      priority: "medium",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "SUPPORT_REQUEST",
    isImmutable: true,
  },
  {
    id: "log_018",
    timestamp: "2026-02-17T09:00:00Z",
    userId: "u2",
    userName: "Nusrat Khan",
    userRole: "checker",
    action: "LOGIN",
    category: "AUTHENTICATION",
    severity: "INFO",
    description: "Nusrat Khan (Checker) logged in successfully",
    feature: "Authentication",
    metadata: {
      loginMethod: "PASSWORD",
    },
    ipAddress: "203.112.45.68",
    deviceInfo: "Chrome 120 / macOS 14",
    reasonCode: "USER_LOGIN",
    isImmutable: true,
  },

  // ── 2 DAYS AGO (2026-02-16) ──

  {
    id: "log_019",
    timestamp: "2026-02-16T16:00:00Z",
    userId: "u3",
    userName: "Tariq Hasan",
    userRole: "approver",
    action: "TRANSACTION_REJECT",
    category: "TRANSACTION",
    severity: "HIGH",
    description: "Tariq Hasan (Approver) rejected MFS payment of ৳10,00,000 — exceeds policy limit, requires additional documentation",
    feature: "MFS Payment",
    entityType: "transaction",
    entityId: "apv_005",
    correlationId: "corr_txn_005",
    metadata: {
      amount: 1000000,
      rejectReason: "Exceeds policy limit. Requires additional documentation.",
    },
    ipAddress: "203.112.45.69",
    deviceInfo: "Safari 17 / iOS 17",
    reasonCode: "POLICY_VIOLATION",
    isImmutable: true,
  },
  {
    id: "log_020",
    timestamp: "2026-02-16T14:30:00Z",
    userId: "u3",
    userName: "Tariq Hasan",
    userRole: "approver",
    action: "BENEFICIARY_APPROVED",
    category: "APPROVAL",
    severity: "INFO",
    description: "Tariq Hasan (Approver) approved new beneficiary Green Valley Suppliers with 24hr cooling period",
    feature: "Beneficiary Management",
    entityType: "beneficiary",
    entityId: "BEN-002",
    correlationId: "corr_ben_003",
    metadata: {
      beneficiaryId: "BEN-002",
      beneficiaryName: "Green Valley Suppliers",
      coolingPeriod: "24hrs",
      coolingEndsAt: "2026-02-17 14:30",
      approvalNotes: "Verified supplier credentials.",
    },
    ipAddress: "203.112.45.69",
    deviceInfo: "Safari 17 / iOS 17",
    reasonCode: "BENEFICIARY_APPROVAL",
    isImmutable: true,
  },
  {
    id: "log_021",
    timestamp: "2026-02-16T14:30:00Z",
    userId: "system",
    userName: "System",
    userRole: "system",
    action: "COOLING_PERIOD_STARTED",
    category: "PAYMENT",
    severity: "WARNING",
    description: "24-hour cooling period activated for Green Valley Suppliers (BEN-002) — transfers blocked until 2026-02-17 14:30",
    feature: "Beneficiary Management",
    resource: "Green Valley Suppliers (BEN-002)",
    entityType: "beneficiary",
    entityId: "BEN-002",
    correlationId: "corr_ben_003",
    metadata: {
      beneficiaryId: "BEN-002",
      coolingDuration: "24hrs",
      endsAt: "2026-02-17 14:30",
      note: "Read-only — governed by cooling period engine",
    },
    ipAddress: "N/A",
    deviceInfo: "System Process",
    reasonCode: "COOLING_ACTIVATION",
    isImmutable: true,
  },
  {
    id: "log_022",
    timestamp: "2026-02-16T12:00:00Z",
    userId: "u4",
    userName: "Shamima Akter",
    userRole: "admin",
    action: "PROFILE_SWITCHED",
    category: "ADMIN",
    severity: "HIGH",
    description: "Shamima Akter (Admin) switched business profile from PRAPTI Trading to PRAPTI Holdings",
    feature: "Business Profiles",
    entityType: "business_profile",
    entityId: "bp_002",
    metadata: {
      fromProfile: "PRAPTI Trading",
      toProfile: "PRAPTI Holdings",
    },
    ipAddress: "203.112.45.70",
    deviceInfo: "Firefox 122 / Ubuntu 22.04",
    reasonCode: "PROFILE_SWITCH",
    isImmutable: true,
  },
  {
    id: "log_023",
    timestamp: "2026-02-16T11:00:00Z",
    userId: "u4",
    userName: "Shamima Akter",
    userRole: "admin",
    action: "APPROVAL_RULE_VIEWED",
    category: "ADMIN",
    severity: "INFO",
    description: "Shamima Akter (Admin) viewed approval rules configuration — no changes made",
    feature: "Approval Rules",
    entityType: "governance_config",
    metadata: {
      viewedSection: "Transaction Approval Thresholds",
      rulesCount: 8,
    },
    ipAddress: "203.112.45.70",
    deviceInfo: "Firefox 122 / Ubuntu 22.04",
    reasonCode: "CONFIG_VIEW",
    isImmutable: true,
  },
  {
    id: "log_024",
    timestamp: "2026-02-16T10:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "TRANSACTION_SUBMIT",
    category: "TRANSACTION",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) initiated Bank Transfer of ৳4,80,000 to Tech Solutions Ltd for service fee payment",
    feature: "Bank Transfer",
    entityType: "transaction",
    entityId: "txn_003",
    correlationId: "corr_txn_003",
    metadata: {
      amount: 480000,
      recipient: "Tech Solutions Ltd",
      bank: "BRAC Bank",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "BUSINESS_PAYMENT",
    isImmutable: true,
  },

  // ── 3 DAYS AGO (2026-02-15) ──

  {
    id: "log_025",
    timestamp: "2026-02-15T17:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "BENEFICIARY_CREATED",
    category: "PAYMENT",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) created new beneficiary City Steel Industries (IBBL/5555666677) for steel procurement",
    feature: "Beneficiary Management",
    resource: "City Steel Industries (IBBL/5555666677)",
    entityType: "beneficiary",
    entityId: "BEN-003",
    correlationId: "corr_ben_004",
    metadata: {
      beneficiaryId: "BEN-003",
      beneficiaryName: "City Steel Industries",
      bankName: "Islami Bank",
      accountNumber: "5555666677",
      riskLevel: "high",
      requiresApproval: true,
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "NEW_BENEFICIARY",
    isImmutable: true,
  },
  {
    id: "log_026",
    timestamp: "2026-02-15T17:02:00Z",
    userId: "system",
    userName: "System",
    userRole: "system",
    action: "BENEFICIARY_APPROVAL_REQUESTED",
    category: "APPROVAL",
    severity: "INFO",
    description: "Beneficiary City Steel Industries (BEN-003) auto-routed to Approver — high risk flags detected: New bank, Large expected volume",
    feature: "Beneficiary Management",
    resource: "City Steel Industries (BEN-003)",
    entityType: "beneficiary",
    entityId: "BEN-003",
    correlationId: "corr_ben_004",
    metadata: {
      beneficiaryId: "BEN-003",
      riskFlags: ["New bank", "Large expected volume"],
      coolingPeriod: "48hrs",
    },
    ipAddress: "N/A",
    deviceInfo: "System Process",
    reasonCode: "AUTO_APPROVAL_ROUTING",
    isImmutable: true,
  },
  {
    id: "log_027",
    timestamp: "2026-02-15T14:00:00Z",
    userId: "u2",
    userName: "Nusrat Khan",
    userRole: "checker",
    action: "RECONCILIATION_MATCH",
    category: "RECONCILIATION",
    severity: "INFO",
    description: "Nusrat Khan (Checker) confirmed auto-matched reconciliation for ৳12,500 — BP/2025/001",
    feature: "Reconciliation",
    entityType: "reconciliation",
    entityId: "recon_001",
    correlationId: "corr_recon_002",
    metadata: {
      amount: 12500,
      reference: "BP/2025/001",
      matchType: "AUTO",
      confidence: 98,
    },
    ipAddress: "203.112.45.68",
    deviceInfo: "Chrome 120 / macOS 14",
    reasonCode: "AUTO_RECONCILIATION",
    isImmutable: true,
  },
  {
    id: "log_028",
    timestamp: "2026-02-15T11:00:00Z",
    userId: "u4",
    userName: "Shamima Akter",
    userRole: "admin",
    action: "FORCED_LOGOUT",
    category: "SECURITY",
    severity: "CRITICAL",
    description: "Shamima Akter (Admin) forced logout of user Nadia Ahmed — suspicious session detected from unknown device",
    feature: "Session Management",
    entityType: "user",
    entityId: "usr_005",
    metadata: {
      targetUser: "Nadia Ahmed",
      reason: "Suspicious session detected",
      deviceInfo: "Unknown Device / Unknown OS",
    },
    ipAddress: "203.112.45.70",
    deviceInfo: "Firefox 122 / Ubuntu 22.04",
    reasonCode: "SECURITY_ENFORCEMENT",
    isImmutable: true,
  },
  {
    id: "log_029",
    timestamp: "2026-02-15T09:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "LOGIN",
    category: "AUTHENTICATION",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) logged in successfully",
    feature: "Authentication",
    metadata: {
      loginMethod: "PASSWORD",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "USER_LOGIN",
    isImmutable: true,
  },

  // ── 4 DAYS AGO (2026-02-14) ──

  {
    id: "log_030",
    timestamp: "2026-02-14T16:00:00Z",
    userId: "u3",
    userName: "Tariq Hasan",
    userRole: "approver",
    action: "BENEFICIARY_DISABLED",
    category: "SECURITY",
    severity: "CRITICAL",
    description: "Tariq Hasan (Approver) disabled beneficiary Tech Solutions Bangladesh (BEN-005) — suspicious transaction pattern detected",
    feature: "Beneficiary Management",
    resource: "Tech Solutions Bangladesh (BEN-005)",
    entityType: "beneficiary",
    entityId: "BEN-005",
    metadata: {
      beneficiaryId: "BEN-005",
      riskFlags: ["Suspicious pattern", "AML review required"],
      disableReason: "Multiple high-value rapid transactions detected",
    },
    ipAddress: "203.112.45.69",
    deviceInfo: "Safari 17 / iOS 17",
    reasonCode: "RISK_MITIGATION",
    isImmutable: true,
  },
  {
    id: "log_031",
    timestamp: "2026-02-14T13:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "TRANSACTION_SUBMIT",
    category: "TRANSACTION",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) initiated Bank Transfer of ৳15,00,000 to Bengal Imports Ltd for raw material procurement",
    feature: "Bank Transfer",
    entityType: "transaction",
    entityId: "txn_004",
    correlationId: "corr_txn_004",
    metadata: {
      amount: 1500000,
      recipient: "Bengal Imports Ltd",
      bank: "Sonali Bank",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "PROCUREMENT_PAYMENT",
    isImmutable: true,
  },
  {
    id: "log_032",
    timestamp: "2026-02-14T10:00:00Z",
    userId: "u2",
    userName: "Nusrat Khan",
    userRole: "checker",
    action: "APPROVAL_VERIFY",
    category: "APPROVAL",
    severity: "INFO",
    description: "Nusrat Khan (Checker) verified supplier payment of ৳2,50,000 to Acme Corporation — all documentation confirmed",
    feature: "Bank Transfer",
    entityType: "transaction",
    entityId: "txn_001_prev",
    correlationId: "corr_txn_006",
    metadata: {
      approvalId: "apr_prev_001",
      amount: 250000,
      comment: "All documentation confirmed",
    },
    ipAddress: "203.112.45.68",
    deviceInfo: "Chrome 120 / macOS 14",
    reasonCode: "CHECKER_VERIFICATION",
    isImmutable: true,
  },

  // ── 5–7 DAYS AGO ──

  {
    id: "log_033",
    timestamp: "2026-02-13T14:00:00Z",
    userId: "u1",
    userName: "Rahim Ahmed",
    userRole: "maker",
    action: "FIRST_BENEFICIARY_TRANSACTION",
    category: "PAYMENT",
    severity: "INFO",
    description: "Rahim Ahmed (Maker) made first transaction of ৳2,50,000 to Rahman Textiles Ltd (BEN-001) after cooling period ended",
    feature: "Beneficiary Management",
    resource: "Rahman Textiles Ltd (BEN-001)",
    entityType: "beneficiary",
    entityId: "BEN-001",
    metadata: {
      beneficiaryId: "BEN-001",
      amount: 250000,
      method: "BEFTN",
      coolingPeriodEnded: "2026-02-13T10:30:00Z",
    },
    ipAddress: "203.112.45.67",
    deviceInfo: "Chrome 120 / Windows 11",
    reasonCode: "FIRST_TRANSACTION",
    isImmutable: true,
  },
  {
    id: "log_034",
    timestamp: "2026-02-12T16:00:00Z",
    userId: "u4",
    userName: "Shamima Akter",
    userRole: "admin",
    action: "PASSWORD_CHANGE",
    category: "SECURITY",
    severity: "HIGH",
    description: "Shamima Akter (Admin) reset password for user Rahim Ahmed — requested by user via verified channel",
    feature: "User Management",
    entityType: "user",
    entityId: "u1",
    metadata: {
      targetUser: "Rahim Ahmed",
      reason: "User requested via verified email",
    },
    ipAddress: "203.112.45.70",
    deviceInfo: "Firefox 122 / Ubuntu 22.04",
    reasonCode: "PASSWORD_RESET",
    isImmutable: true,
  },
  {
    id: "log_035",
    timestamp: "2026-02-11T10:00:00Z",
    userId: "u3",
    userName: "Tariq Hasan",
    userRole: "approver",
    action: "DELEGATION_REVOKE",
    category: "DELEGATION",
    severity: "WARNING",
    description: "Tariq Hasan (Approver) revoked previous delegation to Rashid Ali — returned early from travel",
    feature: "Approval Delegation",
    entityType: "delegation",
    entityId: "del_prev_001",
    metadata: {
      delegateUserId: "usr_006",
      delegateName: "Rashid Ali",
      revokeReason: "Returned early from travel",
    },
    ipAddress: "203.112.45.69",
    deviceInfo: "Safari 17 / iOS 17",
    reasonCode: "DELEGATION_REVOKE",
    isImmutable: true,
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Filter activity log entries based on criteria
 */
export function filterActivityLog(
  entries: ActivityLogEntry[],
  filter: ActivityFilter
): ActivityLogEntry[] {
  return entries.filter((entry) => {
    // Date range filter
    if (filter.dateFrom && entry.timestamp < filter.dateFrom) return false;
    if (filter.dateTo && entry.timestamp > filter.dateTo) return false;

    // User filter
    if (filter.userId && entry.userId !== filter.userId) return false;

    // Role filter
    if (filter.role && entry.userRole !== filter.role) return false;

    // Action filter
    if (filter.action && entry.action !== filter.action) return false;

    // Category filter
    if (filter.category && entry.category !== filter.category) return false;

    // Severity filter
    if (filter.severity && entry.severity !== filter.severity) return false;

    // Correlation ID filter
    if (filter.correlationId && entry.correlationId !== filter.correlationId)
      return false;

    // Search query filter (searches across multiple fields)
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      const searchableText = [
        entry.userName,
        entry.userRole,
        entry.action,
        entry.description,
        entry.entityType,
        entry.entityId,
        entry.ipAddress,
        entry.deviceInfo,
        entry.feature,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) return false;
    }

    return true;
  });
}

/**
 * Paginate activity log entries
 */
export function paginateActivityLog(
  entries: ActivityLogEntry[],
  page: number,
  pageSize: number
): { entries: ActivityLogEntry[]; totalEntries: number; hasMore: boolean } {
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    entries: entries.slice(startIndex, endIndex),
    totalEntries: entries.length,
    hasMore: endIndex < entries.length,
  };
}

/**
 * Get all entries related by correlation ID
 */
export function getEntriesByCorrelation(
  entries: ActivityLogEntry[],
  correlationId: string
): ActivityLogEntry[] {
  return entries.filter((entry) => entry.correlationId === correlationId);
}

/**
 * Download a file to the user's device
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export activity log entries to CSV format
 */
export function exportToCSV(entries: ActivityLogEntry[]): string {
  const headers = [
    "Timestamp",
    "User",
    "Role",
    "Action",
    "Category",
    "Severity",
    "Feature",
    "Description",
    "IP Address",
    "Device",
  ];

  const rows = entries.map((entry) => [
    entry.timestamp,
    entry.userName,
    entry.userRole,
    entry.action,
    entry.category,
    entry.severity,
    entry.feature || "N/A",
    entry.description,
    entry.ipAddress || "N/A",
    entry.deviceInfo || "N/A",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Export activity log entries to PDF format (simplified mock)
 */
export function exportToPDF(entries: ActivityLogEntry[]): string {
  // In a real implementation, this would use a PDF library like jsPDF
  // For now, return a simple text representation
  const pdfContent = [
    "BizPay Activity Log Report",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "=".repeat(80),
    "",
    ...entries.map(
      (entry) =>
        `[${entry.timestamp}] ${entry.userName} (${entry.userRole})\n` +
        `Action: ${entry.action} | Category: ${entry.category} | Severity: ${entry.severity}\n` +
        `Feature: ${entry.feature || "N/A"}\n` +
        `Description: ${entry.description}\n` +
        `IP: ${entry.ipAddress || "N/A"} | Device: ${entry.deviceInfo || "N/A"}\n` +
        "-".repeat(80)
    ),
  ].join("\n");

  return pdfContent;
}

/**
 * Get severity badge styling
 */
export function getSeverityBadge(severity: ActivitySeverity): {
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case "CRITICAL":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" };
    case "HIGH":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" };
    case "WARNING":
      return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
    case "INFO":
    default:
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" };
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timestamp;
  }
}
