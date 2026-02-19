/**
 * ADMIN GOVERNANCE DATA
 * Data models and mock data for Admin/Governance module
 * Covers: Permission Matrix, Approval Workflows, Transaction Limits,
 *         Device Security, Audit/Compliance, Business Profiles
 */

import { ROLES, PERMISSIONS, MANAGED_USERS, BUSINESS_USER_REGISTRY, type RoleType, type PermissionCode } from "./userManagement";

// ============================================
// 1. PERMISSION MATRIX (Access Control)
// ============================================

export type FeatureArea =
  | "PAYMENTS"
  | "COLLECTIONS"
  | "RECONCILIATION"
  | "APPROVALS"
  | "BENEFICIARIES"
  | "REPORTS"
  | "SETTINGS"
  | "USER_MANAGEMENT"
  | "INSIGHTS"
  | "SERVICE_REQUESTS";

export type AccessLevel = "NONE" | "VIEW" | "INITIATE" | "APPROVE" | "MODIFY";

export interface FeaturePermission {
  featureArea: FeatureArea;
  label: string;
  accessByRole: Record<RoleType, AccessLevel[]>;
}

export const FEATURE_PERMISSIONS: FeaturePermission[] = [
  {
    featureArea: "PAYMENTS",
    label: "Payments & Transfers",
    accessByRole: {
      admin: ["VIEW"],
      maker: ["VIEW", "INITIATE"],
      checker: ["VIEW", "APPROVE"],
      approver: ["VIEW", "APPROVE"],
      viewer: ["VIEW"],
    },
  },
  {
    featureArea: "COLLECTIONS",
    label: "Collections & Receivables",
    accessByRole: {
      admin: ["VIEW"],
      maker: ["VIEW", "INITIATE"],
      checker: ["VIEW", "APPROVE"],
      approver: ["VIEW", "APPROVE"],
      viewer: ["VIEW"],
    },
  },
  {
    featureArea: "RECONCILIATION",
    label: "Reconciliation",
    accessByRole: {
      admin: ["VIEW"],
      maker: ["VIEW", "INITIATE"],
      checker: ["VIEW"],
      approver: ["VIEW", "APPROVE", "MODIFY"],
      viewer: ["VIEW"],
    },
  },
  {
    featureArea: "APPROVALS",
    label: "Approval Queue",
    accessByRole: {
      admin: ["VIEW"],
      maker: ["VIEW"],
      checker: ["VIEW", "APPROVE"],
      approver: ["VIEW", "APPROVE"],
      viewer: ["VIEW"],
    },
  },
  {
    featureArea: "BENEFICIARIES",
    label: "Beneficiary Management",
    accessByRole: {
      admin: ["VIEW", "MODIFY"],
      maker: ["VIEW", "INITIATE"],
      checker: ["VIEW"],
      approver: ["VIEW", "APPROVE"],
      viewer: ["VIEW"],
    },
  },
  {
    featureArea: "REPORTS",
    label: "Reports & Statements",
    accessByRole: {
      admin: ["VIEW"],
      maker: ["VIEW"],
      checker: ["VIEW"],
      approver: ["VIEW"],
      viewer: ["VIEW"],
    },
  },
  {
    featureArea: "SETTINGS",
    label: "Account Settings",
    accessByRole: {
      admin: ["VIEW", "MODIFY"],
      maker: ["VIEW"],
      checker: ["VIEW"],
      approver: ["VIEW"],
      viewer: ["VIEW"],
    },
  },
  {
    featureArea: "USER_MANAGEMENT",
    label: "User Management",
    accessByRole: {
      admin: ["VIEW", "INITIATE", "MODIFY"],
      maker: ["NONE"],
      checker: ["NONE"],
      approver: ["VIEW"],
      viewer: ["NONE"],
    },
  },
  {
    featureArea: "INSIGHTS",
    label: "Insights & Analytics",
    accessByRole: {
      admin: ["VIEW"],
      maker: ["VIEW"],
      checker: ["VIEW"],
      approver: ["VIEW"],
      viewer: ["VIEW"],
    },
  },
  {
    featureArea: "SERVICE_REQUESTS",
    label: "Service Requests",
    accessByRole: {
      admin: ["VIEW", "APPROVE"],
      maker: ["VIEW", "INITIATE"],
      checker: ["VIEW"],
      approver: ["VIEW", "APPROVE"],
      viewer: ["VIEW"],
    },
  },
];

// ============================================
// 2. APPROVAL WORKFLOW RULES
// ============================================

export type ApprovalTrigger = "AMOUNT_THRESHOLD" | "TRANSACTION_TYPE" | "BENEFICIARY_NEW" | "SERVICE_REQUEST" | "USER_CHANGE";

export interface ApprovalRule {
  id: string;
  name: string;
  trigger: ApprovalTrigger;
  condition: string;
  stages: ("CHECKER" | "APPROVER")[];
  slaHours: number;
  escalationPath: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  lastTriggered?: string;
  triggerCount30d: number;
}

export const APPROVAL_RULES: ApprovalRule[] = [
  {
    id: "rule_001",
    name: "High-Value Payment",
    trigger: "AMOUNT_THRESHOLD",
    condition: "Amount > BDT 500,000",
    stages: ["CHECKER", "APPROVER"],
    slaHours: 24,
    escalationPath: "Auto-escalate to Admin after SLA breach",
    isActive: true,
    priority: 1,
    createdAt: "2025-01-15T10:00:00Z",
    lastTriggered: "2026-02-17T14:30:00Z",
    triggerCount30d: 47,
  },
  {
    id: "rule_002",
    name: "Critical Payment",
    trigger: "AMOUNT_THRESHOLD",
    condition: "Amount > BDT 2,000,000",
    stages: ["CHECKER", "APPROVER"],
    slaHours: 4,
    escalationPath: "Immediate notification to all Approvers + Admin",
    isActive: true,
    priority: 0,
    createdAt: "2025-01-15T10:00:00Z",
    lastTriggered: "2026-02-16T09:15:00Z",
    triggerCount30d: 12,
  },
  {
    id: "rule_003",
    name: "New Beneficiary Registration",
    trigger: "BENEFICIARY_NEW",
    condition: "Any new beneficiary addition",
    stages: ["CHECKER", "APPROVER"],
    slaHours: 48,
    escalationPath: "Escalate to Admin after 48h",
    isActive: true,
    priority: 2,
    createdAt: "2025-01-20T14:00:00Z",
    lastTriggered: "2026-02-17T08:45:00Z",
    triggerCount30d: 23,
  },
  {
    id: "rule_004",
    name: "Direct Debit Setup",
    trigger: "TRANSACTION_TYPE",
    condition: "Direct debit mandate creation",
    stages: ["CHECKER", "APPROVER"],
    slaHours: 24,
    escalationPath: "Auto-escalate to Approver after 12h at Checker",
    isActive: true,
    priority: 3,
    createdAt: "2025-02-01T09:00:00Z",
    lastTriggered: "2026-02-15T16:20:00Z",
    triggerCount30d: 8,
  },
  {
    id: "rule_005",
    name: "Service Request Approval",
    trigger: "SERVICE_REQUEST",
    condition: "Chequebook, Positive Pay, Token requests",
    stages: ["APPROVER"],
    slaHours: 72,
    escalationPath: "Notify Admin if unattended 48h+",
    isActive: true,
    priority: 4,
    createdAt: "2025-02-05T11:00:00Z",
    lastTriggered: "2026-02-14T10:00:00Z",
    triggerCount30d: 5,
  },
  {
    id: "rule_006",
    name: "User Role Change",
    trigger: "USER_CHANGE",
    condition: "Any role assignment or modification",
    stages: ["APPROVER"],
    slaHours: 24,
    escalationPath: "Block change if unapproved after SLA",
    isActive: true,
    priority: 1,
    createdAt: "2025-01-15T10:00:00Z",
    lastTriggered: "2026-02-10T15:30:00Z",
    triggerCount30d: 3,
  },
  {
    id: "rule_007",
    name: "Bulk Payment Batch",
    trigger: "TRANSACTION_TYPE",
    condition: "Bulk payment with 5+ items",
    stages: ["CHECKER", "APPROVER"],
    slaHours: 12,
    escalationPath: "Priority notification to all Approvers",
    isActive: true,
    priority: 2,
    createdAt: "2025-02-10T08:00:00Z",
    lastTriggered: "2026-02-17T11:00:00Z",
    triggerCount30d: 15,
  },
];

// ============================================
// 3. TRANSACTION LIMITS ENGINE
// ============================================

export type LimitScope = "PER_TRANSACTION" | "DAILY" | "MONTHLY";
export type TransactionCategory = "OWN_ACCOUNT" | "THIRD_PARTY" | "MFS" | "DIRECT_DEBIT" | "BILL_PAYMENT" | "BULK_PAYMENT" | "NPSB_WITHIN_BBPLC" | "NPSB_OUTSIDE_BBPLC";

export interface TransactionLimit {
  id: string;
  role: RoleType;
  category: TransactionCategory;
  categoryLabel: string;
  perTransaction: number;
  daily: number;
  monthly: number;
  autoBlock: boolean;
  escalateOnBreach: boolean;
  lastModified: string;
}

export const ADMIN_TRANSACTION_LIMITS: TransactionLimit[] = [
  // MAKER LIMITS
  { id: "lim_001", role: "maker", category: "OWN_ACCOUNT", categoryLabel: "Own Account Transfer", perTransaction: 1000000, daily: 5000000, monthly: 50000000, autoBlock: false, escalateOnBreach: true, lastModified: "2025-12-01T10:00:00Z" },
  { id: "lim_002", role: "maker", category: "THIRD_PARTY", categoryLabel: "Third Party Transfer", perTransaction: 500000, daily: 2000000, monthly: 20000000, autoBlock: true, escalateOnBreach: true, lastModified: "2025-12-01T10:00:00Z" },
  { id: "lim_003", role: "maker", category: "MFS", categoryLabel: "Mobile Financial Services", perTransaction: 25000, daily: 100000, monthly: 500000, autoBlock: true, escalateOnBreach: false, lastModified: "2025-12-15T14:00:00Z" },
  { id: "lim_004", role: "maker", category: "DIRECT_DEBIT", categoryLabel: "Direct Debit", perTransaction: 200000, daily: 1000000, monthly: 10000000, autoBlock: false, escalateOnBreach: true, lastModified: "2025-12-01T10:00:00Z" },
  { id: "lim_005", role: "maker", category: "BILL_PAYMENT", categoryLabel: "Bill Payment", perTransaction: 100000, daily: 500000, monthly: 2000000, autoBlock: false, escalateOnBreach: false, lastModified: "2025-12-20T09:00:00Z" },
  { id: "lim_006", role: "maker", category: "BULK_PAYMENT", categoryLabel: "Bulk Payment", perTransaction: 2000000, daily: 10000000, monthly: 100000000, autoBlock: true, escalateOnBreach: true, lastModified: "2026-01-05T11:00:00Z" },
  // NPSB LIMITS — MAKER (mirrors Third Party)
  { id: "lim_012", role: "maker", category: "NPSB_WITHIN_BBPLC", categoryLabel: "NPSB Within BBPLC", perTransaction: 500000, daily: 2000000, monthly: 20000000, autoBlock: true, escalateOnBreach: true, lastModified: "2026-02-19T10:00:00Z" },
  { id: "lim_013", role: "maker", category: "NPSB_OUTSIDE_BBPLC", categoryLabel: "NPSB Outside BBPLC", perTransaction: 500000, daily: 2000000, monthly: 20000000, autoBlock: true, escalateOnBreach: true, lastModified: "2026-02-19T10:00:00Z" },
  // CHECKER LIMITS (view-only, no initiation)
  { id: "lim_007", role: "checker", category: "OWN_ACCOUNT", categoryLabel: "Own Account Transfer", perTransaction: 0, daily: 0, monthly: 0, autoBlock: true, escalateOnBreach: false, lastModified: "2025-12-01T10:00:00Z" },
  { id: "lim_008", role: "checker", category: "THIRD_PARTY", categoryLabel: "Third Party Transfer", perTransaction: 0, daily: 0, monthly: 0, autoBlock: true, escalateOnBreach: false, lastModified: "2025-12-01T10:00:00Z" },
  // NPSB LIMITS — CHECKER (view-only, no initiation)
  { id: "lim_016", role: "checker", category: "NPSB_WITHIN_BBPLC", categoryLabel: "NPSB Within BBPLC", perTransaction: 0, daily: 0, monthly: 0, autoBlock: true, escalateOnBreach: false, lastModified: "2026-02-19T10:00:00Z" },
  { id: "lim_017", role: "checker", category: "NPSB_OUTSIDE_BBPLC", categoryLabel: "NPSB Outside BBPLC", perTransaction: 0, daily: 0, monthly: 0, autoBlock: true, escalateOnBreach: false, lastModified: "2026-02-19T10:00:00Z" },
  // APPROVER LIMITS
  { id: "lim_009", role: "approver", category: "OWN_ACCOUNT", categoryLabel: "Own Account Transfer", perTransaction: 5000000, daily: 20000000, monthly: 200000000, autoBlock: false, escalateOnBreach: true, lastModified: "2025-12-01T10:00:00Z" },
  { id: "lim_010", role: "approver", category: "THIRD_PARTY", categoryLabel: "Third Party Transfer", perTransaction: 2000000, daily: 10000000, monthly: 100000000, autoBlock: false, escalateOnBreach: true, lastModified: "2025-12-01T10:00:00Z" },
  { id: "lim_011", role: "approver", category: "BULK_PAYMENT", categoryLabel: "Bulk Payment", perTransaction: 10000000, daily: 50000000, monthly: 500000000, autoBlock: false, escalateOnBreach: true, lastModified: "2026-01-05T11:00:00Z" },
  // NPSB LIMITS — APPROVER
  { id: "lim_014", role: "approver", category: "NPSB_WITHIN_BBPLC", categoryLabel: "NPSB Within BBPLC", perTransaction: 2000000, daily: 10000000, monthly: 100000000, autoBlock: false, escalateOnBreach: true, lastModified: "2026-02-19T10:00:00Z" },
  { id: "lim_015", role: "approver", category: "NPSB_OUTSIDE_BBPLC", categoryLabel: "NPSB Outside BBPLC", perTransaction: 2000000, daily: 10000000, monthly: 100000000, autoBlock: false, escalateOnBreach: true, lastModified: "2026-02-19T10:00:00Z" },
];

// ============================================
// 4. DEVICE & SESSION SECURITY
// ============================================

export interface BoundDevice {
  id: string;
  deviceName: string;
  deviceType: "MOBILE" | "DESKTOP" | "TABLET";
  os: string;
  browser?: string;
  boundAt: string;
  lastUsed: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  trustLevel: "TRUSTED" | "VERIFIED" | "UNVERIFIED";
}

export interface SessionRecord {
  id: string;
  userId: string;
  userName: string;
  deviceId: string;
  deviceName: string;
  loginAt: string;
  logoutAt?: string;
  logoutReason?: "MANUAL" | "TIMEOUT" | "FORCED" | "SESSION_REPLACED";
  ipAddress: string;
  location: string;
  duration: string;
  status: "ACTIVE" | "ENDED";
}

export const BOUND_DEVICES: BoundDevice[] = [
  {
    id: "dev_001",
    deviceName: "Rahim's MacBook Pro",
    deviceType: "DESKTOP",
    os: "macOS 15.2",
    browser: "Chrome 121",
    boundAt: "2025-06-15T10:00:00Z",
    lastUsed: "2026-02-18T08:30:00Z",
    ipAddress: "103.48.16.XXX",
    location: "Dhaka, BD",
    isCurrent: true,
    trustLevel: "TRUSTED",
  },
  {
    id: "dev_002",
    deviceName: "Rahim's iPhone 15",
    deviceType: "MOBILE",
    os: "iOS 18.3",
    boundAt: "2025-07-01T14:00:00Z",
    lastUsed: "2026-02-17T22:15:00Z",
    ipAddress: "103.48.16.XXX",
    location: "Dhaka, BD",
    isCurrent: false,
    trustLevel: "TRUSTED",
  },
  {
    id: "dev_003",
    deviceName: "Office Windows PC",
    deviceType: "DESKTOP",
    os: "Windows 11",
    browser: "Edge 121",
    boundAt: "2025-09-20T09:00:00Z",
    lastUsed: "2026-02-14T17:45:00Z",
    ipAddress: "203.17.92.XXX",
    location: "Chattogram, BD",
    isCurrent: false,
    trustLevel: "VERIFIED",
  },
  {
    id: "dev_004",
    deviceName: "Samsung Galaxy Tab S9",
    deviceType: "TABLET",
    os: "Android 14",
    browser: "Chrome Mobile 121",
    boundAt: "2026-01-10T11:30:00Z",
    lastUsed: "2026-01-25T14:00:00Z",
    ipAddress: "103.48.16.XXX",
    location: "Dhaka, BD",
    isCurrent: false,
    trustLevel: "UNVERIFIED",
  },
];

export const SESSION_HISTORY: SessionRecord[] = [
  {
    id: "sess_001",
    userId: "usr_001",
    userName: "Rahim Ahmed",
    deviceId: "dev_001",
    deviceName: "Rahim's MacBook Pro",
    loginAt: "2026-02-18T08:30:00Z",
    ipAddress: "103.48.16.XXX",
    location: "Dhaka, BD",
    duration: "Active",
    status: "ACTIVE",
  },
  {
    id: "sess_002",
    userId: "usr_002",
    userName: "Fatima Khan",
    deviceId: "dev_002",
    deviceName: "Fatima's Laptop",
    loginAt: "2026-02-18T07:45:00Z",
    ipAddress: "103.48.16.XXX",
    location: "Dhaka, BD",
    duration: "Active",
    status: "ACTIVE",
  },
  {
    id: "sess_003",
    userId: "usr_001",
    userName: "Rahim Ahmed",
    deviceId: "dev_002",
    deviceName: "Rahim's iPhone 15",
    loginAt: "2026-02-17T20:00:00Z",
    logoutAt: "2026-02-17T22:15:00Z",
    logoutReason: "MANUAL",
    ipAddress: "103.48.16.XXX",
    location: "Dhaka, BD",
    duration: "2h 15m",
    status: "ENDED",
  },
  {
    id: "sess_004",
    userId: "usr_003",
    userName: "Karim Hossain",
    deviceId: "dev_003",
    deviceName: "Office Windows PC",
    loginAt: "2026-02-17T09:00:00Z",
    logoutAt: "2026-02-17T17:30:00Z",
    logoutReason: "TIMEOUT",
    ipAddress: "203.17.92.XXX",
    location: "Chattogram, BD",
    duration: "8h 30m",
    status: "ENDED",
  },
  {
    id: "sess_005",
    userId: "usr_005",
    userName: "Tariq Rahman",
    deviceId: "dev_004",
    deviceName: "Samsung Galaxy Tab S9",
    loginAt: "2026-02-16T14:00:00Z",
    logoutAt: "2026-02-16T14:15:00Z",
    logoutReason: "FORCED",
    ipAddress: "103.48.16.XXX",
    location: "Dhaka, BD",
    duration: "15m",
    status: "ENDED",
  },
  {
    id: "sess_006",
    userId: "usr_004",
    userName: "Nadia Islam",
    deviceId: "dev_003",
    deviceName: "Office Windows PC",
    loginAt: "2026-02-15T11:00:00Z",
    logoutAt: "2026-02-15T11:02:00Z",
    logoutReason: "SESSION_REPLACED",
    ipAddress: "203.17.92.XXX",
    location: "Chattogram, BD",
    duration: "2m",
    status: "ENDED",
  },
];

// ============================================
// 5. AUDIT & COMPLIANCE CENTER
// ============================================

export type AuditEventType =
  | "APPROVAL_LOG"
  | "OVERRIDE_LOG"
  | "LOCK_BREACH"
  | "ROLE_VIOLATION"
  | "LIMIT_BREACH"
  | "SESSION_ANOMALY"
  | "BENEFICIARY_CHANGE"
  | "SYSTEM_CONFIG_CHANGE";

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  actorId: string;
  actorName: string;
  actorRole: RoleType;
  description: string;
  details: Record<string, any>;
  isImmutable: boolean;
  correlationId?: string;
}

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "audit_001",
    timestamp: "2026-02-18T08:30:00Z",
    eventType: "APPROVAL_LOG",
    severity: "INFO",
    actorId: "usr_003",
    actorName: "Karim Hossain",
    actorRole: "approver",
    description: "Approved payment TXN-20260218-001 for BDT 750,000 to Acme Corp",
    details: { txnId: "TXN-20260218-001", amount: 750000, beneficiary: "Acme Corp" },
    isImmutable: true,
  },
  {
    id: "audit_002",
    timestamp: "2026-02-18T07:45:00Z",
    eventType: "OVERRIDE_LOG",
    severity: "HIGH",
    actorId: "usr_003",
    actorName: "Karim Hossain",
    actorRole: "approver",
    description: "Reconciliation manual override: matched TXN-20260215-047 to ledger entry LE-9812",
    details: { txnId: "TXN-20260215-047", ledgerEntry: "LE-9812", reason: "Timing difference" },
    isImmutable: true,
    correlationId: "corr_recon_001",
  },
  {
    id: "audit_003",
    timestamp: "2026-02-17T22:10:00Z",
    eventType: "LOCK_BREACH",
    severity: "CRITICAL",
    actorId: "usr_004",
    actorName: "Nadia Islam",
    actorRole: "checker",
    description: "Attempted access to suspended account features — blocked by lock guard",
    details: { attemptedFeature: "PAYMENTS", lockReason: "ACCOUNT_SUSPENDED" },
    isImmutable: true,
  },
  {
    id: "audit_004",
    timestamp: "2026-02-17T16:30:00Z",
    eventType: "ROLE_VIOLATION",
    severity: "CRITICAL",
    actorId: "usr_002",
    actorName: "Fatima Khan",
    actorRole: "maker",
    description: "Maker attempted direct approval bypass — role guard intercepted",
    details: { attemptedAction: "APPROVE_TRANSACTION", txnId: "TXN-20260217-012" },
    isImmutable: true,
  },
  {
    id: "audit_005",
    timestamp: "2026-02-17T14:00:00Z",
    eventType: "LIMIT_BREACH",
    severity: "HIGH",
    actorId: "usr_002",
    actorName: "Fatima Khan",
    actorRole: "maker",
    description: "Daily limit breach attempt: BDT 2,500,000 (limit: BDT 2,000,000) — auto-blocked",
    details: { attemptedAmount: 2500000, limit: 2000000, type: "DAILY_THIRD_PARTY" },
    isImmutable: true,
  },
  {
    id: "audit_006",
    timestamp: "2026-02-17T11:15:00Z",
    eventType: "BENEFICIARY_CHANGE",
    severity: "WARNING",
    actorId: "usr_002",
    actorName: "Fatima Khan",
    actorRole: "maker",
    description: "New beneficiary added: Global Suppliers Ltd (pending approval)",
    details: { beneficiaryName: "Global Suppliers Ltd", bank: "Dutch-Bangla Bank", accountNo: "XXX4521" },
    isImmutable: true,
  },
  {
    id: "audit_007",
    timestamp: "2026-02-17T09:00:00Z",
    eventType: "SESSION_ANOMALY",
    severity: "WARNING",
    actorId: "usr_005",
    actorName: "Tariq Rahman",
    actorRole: "viewer",
    description: "Unusual login time detected — outside normal business hours",
    details: { loginTime: "04:30 AM", normalRange: "09:00 AM - 06:00 PM", location: "Dhaka" },
    isImmutable: true,
  },
  {
    id: "audit_008",
    timestamp: "2026-02-16T15:45:00Z",
    eventType: "SYSTEM_CONFIG_CHANGE",
    severity: "INFO",
    actorId: "usr_001",
    actorName: "Rahim Ahmed",
    actorRole: "admin",
    description: "Transaction limit updated: Maker daily third-party limit changed from BDT 1.5M to BDT 2M",
    details: { field: "maker.thirdParty.daily", oldValue: 1500000, newValue: 2000000 },
    isImmutable: true,
  },
  {
    id: "audit_009",
    timestamp: "2026-02-16T10:30:00Z",
    eventType: "APPROVAL_LOG",
    severity: "INFO",
    actorId: "usr_003",
    actorName: "Karim Hossain",
    actorRole: "approver",
    description: "Rejected beneficiary addition: XYZ Holdings (reason: incomplete documentation)",
    details: { beneficiaryName: "XYZ Holdings", reason: "Incomplete documentation" },
    isImmutable: true,
  },
  {
    id: "audit_010",
    timestamp: "2026-02-15T17:00:00Z",
    eventType: "LOCK_BREACH",
    severity: "HIGH",
    actorId: "usr_004",
    actorName: "Nadia Islam",
    actorRole: "checker",
    description: "Multiple failed authentication attempts (3/3) — account temporarily locked",
    details: { attempts: 3, lockDuration: "30 minutes" },
    isImmutable: true,
  },
];

// ============================================
// 6. BUSINESS PROFILES / ENTITY SWITCH
// ============================================

export interface BusinessEntity {
  id: string;
  name: string;
  registrationNo: string;
  industry: string;
  status: "ACTIVE" | "DORMANT" | "UNDER_REVIEW";
  accountCount: number;
  userCount: number;
  lastActivity: string;
  primaryContact: string;
  address: string;
  isCurrent: boolean;
}

export const BUSINESS_ENTITIES: BusinessEntity[] = [
  {
    id: "ent_001",
    name: "ABC Traders Ltd.",
    registrationNo: "C-123456",
    industry: "Wholesale Trade",
    status: "ACTIVE",
    accountCount: 3,
    userCount: 5,
    lastActivity: "2026-02-18T08:30:00Z",
    primaryContact: "Rahim Ahmed",
    address: "12/A Motijheel C/A, Dhaka 1000",
    isCurrent: true,
  },
  {
    id: "ent_002",
    name: "ABC Garments Export",
    registrationNo: "C-789012",
    industry: "Textile & Garments",
    status: "ACTIVE",
    accountCount: 2,
    userCount: 3,
    lastActivity: "2026-02-17T14:20:00Z",
    primaryContact: "Karim Hossain",
    address: "45 Gulshan Avenue, Dhaka 1212",
    isCurrent: false,
  },
  {
    id: "ent_003",
    name: "ABC Logistics",
    registrationNo: "C-345678",
    industry: "Transport & Logistics",
    status: "DORMANT",
    accountCount: 1,
    userCount: 2,
    lastActivity: "2025-11-30T16:00:00Z",
    primaryContact: "Fatima Khan",
    address: "78 Agrabad C/A, Chattogram 4100",
    isCurrent: false,
  },
];

// ============================================
// 7. HELPER FUNCTIONS
// ============================================

export function formatBDTCompact(amount: number): string {
  if (amount === 0) return "N/A";
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return `${amount}`;
}

export function formatBDTFull(amount: number): string {
  if (amount === 0) return "N/A";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getAuditSeverityConfig(severity: AuditEvent["severity"]) {
  const config = {
    INFO: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
    WARNING: { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
    HIGH: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
    CRITICAL: { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  };
  return config[severity];
}

export function getAccessLevelColor(level: AccessLevel): string {
  const colors: Record<AccessLevel, string> = {
    NONE: "bg-white/5 text-white/20",
    VIEW: "bg-blue-500/15 text-blue-400",
    INITIATE: "bg-cyan-500/15 text-cyan-400",
    APPROVE: "bg-emerald-500/15 text-emerald-400",
    MODIFY: "bg-amber-500/15 text-amber-400",
  };
  return colors[level];
}

export function getTriggerLabel(trigger: ApprovalTrigger): string {
  const labels: Record<ApprovalTrigger, string> = {
    AMOUNT_THRESHOLD: "Amount Threshold",
    TRANSACTION_TYPE: "Transaction Type",
    BENEFICIARY_NEW: "New Beneficiary",
    SERVICE_REQUEST: "Service Request",
    USER_CHANGE: "User Change",
  };
  return labels[trigger];
}

export function getEntityStatusConfig(status: BusinessEntity["status"]) {
  const config = {
    ACTIVE: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    DORMANT: { bg: "bg-white/5", text: "text-white/40", border: "border-white/10" },
    UNDER_REVIEW: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  };
  return config[status];
}