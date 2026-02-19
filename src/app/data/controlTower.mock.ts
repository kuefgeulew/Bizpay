// Account Control Tower — Multi-Account Consolidation
// Read-only. Visibility > optimization. No actions.
// Observation deck, not a tool.

export type AccountCategory = "primary" | "internal" | "external";
export type ActivityStatus = "active" | "idle";

export interface BusinessAccount {
  id: string;
  nickname: string;
  bank: string;
  branch?: string;
  entity?: string;
  balance: number;
  category: AccountCategory;
  accountNumber?: string;
  activityStatus?: ActivityStatus;
}

export interface BalanceUpdateEntry {
  id: string;
  timestamp: string;
  accountLabel: string;
  source: string;
}

// ── Account Inventory ──

export const ACCOUNTS: BusinessAccount[] = [
  // PRIMARY BIZPAY CASA
  {
    id: "acc_primary",
    nickname: "Main Operations",
    bank: "Bank Asia",
    branch: "Dhaka Main Branch",
    balance: 4250000,
    category: "primary",
  },
  // OTHER BIZPAY ACCOUNTS (Same Entity / Branches)
  {
    id: "acc_internal_1",
    nickname: "Payroll Reserve",
    bank: "Bank Asia",
    branch: "Gulshan Branch",
    entity: "HR Unit",
    balance: 1850000,
    category: "internal",
    activityStatus: "active",
  },
  {
    id: "acc_internal_2",
    nickname: "Vendor Payments",
    bank: "Bank Asia",
    branch: "Dhaka Main Branch",
    entity: "Procurement Unit",
    balance: 980000,
    category: "internal",
    activityStatus: "active",
  },
  {
    id: "acc_internal_3",
    nickname: "Legacy Reserve",
    bank: "Bank Asia",
    branch: "Chittagong Branch",
    entity: "Regional Unit",
    balance: 420000,
    category: "internal",
    activityStatus: "idle",
  },
  // EXTERNAL ACCOUNTS (Read-Only)
  {
    id: "acc_external_1",
    nickname: "BRAC Operations",
    bank: "BRAC Bank",
    accountNumber: "****7823",
    balance: 1450000,
    category: "external",
  },
  {
    id: "acc_external_2",
    nickname: "City Reserve",
    bank: "City Bank",
    accountNumber: "****5612",
    balance: 730000,
    category: "external",
  },
];

// ── Balance Update History ──

export const BALANCE_UPDATES: BalanceUpdateEntry[] = [
  {
    id: "upd_001",
    timestamp: "Feb 17, 2026 · 14:32",
    accountLabel: "Main Operations",
    source: "Core banking system",
  },
  {
    id: "upd_002",
    timestamp: "Feb 14, 2026 · 09:15",
    accountLabel: "Payroll Reserve",
    source: "Core banking system",
  },
  {
    id: "upd_003",
    timestamp: "Feb 12, 2026 · 11:48",
    accountLabel: "BRAC Operations",
    source: "External feed",
  },
  {
    id: "upd_004",
    timestamp: "Feb 10, 2026 · 16:22",
    accountLabel: "City Reserve",
    source: "External feed",
  },
  {
    id: "upd_005",
    timestamp: "Feb 08, 2026 · 08:05",
    accountLabel: "Vendor Payments",
    source: "Core banking system",
  },
];