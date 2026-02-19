// Incentives — Non-rate, behavior-bound privileges
// Earned, not offered. Status surface, not conversion funnel.
// Zero cash movement, zero coaching, zero optimization.

export type BenefitStatus = "unlocked" | "locked";
export type BenefitCategoryType = "fee-waivers" | "preferential-pricing" | "operational-privileges" | "relationship-tier";

export interface Benefit {
  id: string;
  label: string;
  status: BenefitStatus;
  qualificationCondition: string;
}

export interface BenefitCategory {
  id: string;
  type: BenefitCategoryType;
  label: string;
  description: string;
  benefits: Benefit[];
}

export interface BenefitHistoryEntry {
  id: string;
  timestamp: string;
  event: "renewed" | "granted" | "expired";
  benefitLabel: string;
  reason: string;
}

// ── Relationship Tier ──

export interface RelationshipTier {
  label: string;
  condition: string;
}

export const RELATIONSHIP_TIER: RelationshipTier = {
  label: "Priority",
  condition: "Maintained average balance above threshold for 90+ days",
};

// ── Benefit Categories ──

export const BENEFIT_CATEGORIES: BenefitCategory[] = [
  {
    id: "cat_fw",
    type: "fee-waivers",
    label: "Fee Waivers",
    description: "Transaction fee exemptions earned through balance discipline",
    benefits: [
      {
        id: "ben_fw_bulk",
        label: "Bulk Payment Fee Waiver",
        status: "unlocked",
        qualificationCondition: "Maintained average balance ≥ ৳50L for 30 days",
      },
      {
        id: "ben_fw_payroll",
        label: "Payroll Run Fee Waiver",
        status: "unlocked",
        qualificationCondition: "Completed 3+ consecutive payroll runs",
      },
    ],
  },
  {
    id: "cat_pp",
    type: "preferential-pricing",
    label: "Preferential Pricing",
    description: "Reduced charges on select banking services",
    benefits: [
      {
        id: "ben_pp_fx",
        label: "Transfer Fee Reduction",
        status: "unlocked",
        qualificationCondition: "Sustained quarterly transaction volume above threshold",
      },
      {
        id: "ben_pp_lc",
        label: "LC Charge Benefit",
        status: "locked",
        qualificationCondition: "Requires 6-month trade finance history",
      },
    ],
  },
  {
    id: "cat_op",
    type: "operational-privileges",
    label: "Operational Privileges",
    description: "Processing and service enhancements tied to account standing",
    benefits: [
      {
        id: "ben_op_priority",
        label: "Priority Approval Processing",
        status: "unlocked",
        qualificationCondition: "Account maintained in good standing for 90+ days",
      },
      {
        id: "ben_op_sla",
        label: "Faster Service SLAs",
        status: "locked",
        qualificationCondition: "Requires Priority tier for 180+ days",
      },
    ],
  },
];

// ── Benefit History ──

export const BENEFIT_HISTORY: BenefitHistoryEntry[] = [
  {
    id: "hist_001",
    timestamp: "Feb 15, 2026",
    event: "renewed",
    benefitLabel: "Bulk Payment Fee Waiver",
    reason: "Balance condition met for current period",
  },
  {
    id: "hist_002",
    timestamp: "Jan 28, 2026",
    event: "granted",
    benefitLabel: "Priority Approval Processing",
    reason: "Standing condition met",
  },
  {
    id: "hist_003",
    timestamp: "Jan 15, 2026",
    event: "renewed",
    benefitLabel: "Transfer Fee Reduction",
    reason: "Volume condition met for quarter",
  },
  {
    id: "hist_004",
    timestamp: "Dec 22, 2025",
    event: "granted",
    benefitLabel: "Payroll Run Fee Waiver",
    reason: "Consecutive run condition met",
  },
  {
    id: "hist_005",
    timestamp: "Dec 01, 2025",
    event: "expired",
    benefitLabel: "LC Charge Benefit",
    reason: "Trade finance threshold not maintained",
  },
];