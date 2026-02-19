/**
 * BUSINESS PROFILES — ISOLATED DATA STORE
 * Multi-Entity / Business Profiles
 *
 * ADMIN-ONLY STORE — Must NOT be imported by:
 *   - TransactionScreen / payment flows
 *   - CollectHub / collection flows
 *   - ReconciliationHub / reconcile flows
 *   - InsightsHub / report flows
 *   - GovernanceEngine (governanceEngine.ts)
 *
 * This store exists solely for Admin → Business Profiles context viewing.
 */

// ============================================
// 1. TYPE DEFINITIONS
// ============================================

export type RegistrationType = "Sole" | "Partnership" | "Ltd";
export type EntityStatus = "ACTIVE" | "SUSPENDED";

export interface BusinessProfile {
  id: string;
  legalName: string;
  tradeName: string;
  registrationType: RegistrationType;
  primaryAccountId: string;
  status: EntityStatus;
  createdAt: string;
  // Extended display fields (Admin context only)
  registrationNo: string;
  industry: string;
  primaryContact: string;
  address: string;
  accountCount: number;
  userCount: number;
  lastActivity: string;
  isCurrent: boolean;
}

// ============================================
// 2. REFERENCE DATA — 3 BUSINESS ENTITIES
// ============================================

export const BUSINESS_PROFILES: BusinessProfile[] = [
  {
    id: "bp_001",
    legalName: "ABC Traders Limited",
    tradeName: "ABC Traders",
    registrationType: "Ltd",
    primaryAccountId: "acc_10201",
    status: "ACTIVE",
    createdAt: "2023-04-15T09:00:00Z",
    registrationNo: "C-123456",
    industry: "Wholesale Trade",
    primaryContact: "Rahim Ahmed",
    address: "12/A Motijheel C/A, Dhaka 1000",
    accountCount: 3,
    userCount: 5,
    lastActivity: "2026-02-18T08:30:00Z",
    isCurrent: true,
  },
  {
    id: "bp_002",
    legalName: "ABC Garments Export Private Limited",
    tradeName: "ABC Garments Export",
    registrationType: "Ltd",
    primaryAccountId: "acc_20415",
    status: "ACTIVE",
    createdAt: "2024-01-10T10:30:00Z",
    registrationNo: "C-789012",
    industry: "Textile & Garments",
    primaryContact: "Karim Hossain",
    address: "45 Gulshan Avenue, Dhaka 1212",
    accountCount: 2,
    userCount: 3,
    lastActivity: "2026-02-17T14:20:00Z",
    isCurrent: false,
  },
  {
    id: "bp_003",
    legalName: "Ahmed & Sons Partnership",
    tradeName: "Ahmed Logistics",
    registrationType: "Partnership",
    primaryAccountId: "acc_30782",
    status: "SUSPENDED",
    createdAt: "2022-08-22T14:00:00Z",
    registrationNo: "P-345678",
    industry: "Transport & Logistics",
    primaryContact: "Fatima Khan",
    address: "78 Agrabad C/A, Chattogram 4100",
    accountCount: 1,
    userCount: 2,
    lastActivity: "2025-11-30T16:00:00Z",
    isCurrent: false,
  },
];

// ============================================
// 3. STATUS CONFIG HELPER
// ============================================

export function getProfileStatusConfig(status: EntityStatus) {
  const config: Record<EntityStatus, { bg: string; text: string; border: string }> = {
    ACTIVE: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    },
    SUSPENDED: {
      bg: "bg-red-500/15",
      text: "text-red-400",
      border: "border-red-500/30",
    },
  };
  return config[status];
}

// ============================================
// 4. REGISTRATION TYPE LABEL
// ============================================

export function getRegistrationLabel(type: RegistrationType): string {
  const labels: Record<RegistrationType, string> = {
    Sole: "Sole Proprietorship",
    Partnership: "Partnership",
    Ltd: "Private Limited",
  };
  return labels[type];
}