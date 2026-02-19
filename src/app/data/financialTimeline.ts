/**
 * FINANCIAL TIMELINE — SPRINT 3 MODULE 3
 * Upcoming obligations, pending approvals, reconciliation gaps
 * Read-only view with severity-based color coding
 */

// ============================================
// 1. TYPE DEFINITIONS
// ============================================

export type TimelineItemType =
  | "EMI"
  | "SALARY"
  | "VENDOR_PAYMENT"
  | "TAX_DEADLINE"
  | "APPROVAL_PENDING"
  | "RECONCILIATION_GAP"
  | "RECEIVABLE_DUE"
  | "LICENSE_RENEWAL";

export type TimelineSeverity = "INFO" | "WARNING" | "URGENT" | "CRITICAL";

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  title: string;
  description: string;
  date: string;
  amount?: number;
  severity: TimelineSeverity;
  metadata: Record<string, any>;
  actionable: boolean; // Can user take action?
  actionLabel?: string;
}

export interface TimelineGroup {
  date: string;
  dayLabel: string; // "Today", "Tomorrow", "15 Feb 2026"
  items: TimelineItem[];
}

// ============================================
// 2. MOCK DATA
// ============================================

export const TIMELINE_ITEMS: TimelineItem[] = [
  // Today - Critical
  {
    id: "timeline_001",
    type: "APPROVAL_PENDING",
    title: "Approval Overdue",
    description: "3 transactions awaiting approval for 2+ days",
    date: "2026-02-17",
    amount: 450000,
    severity: "CRITICAL",
    metadata: {
      count: 3,
      oldestDays: 2,
    },
    actionable: true,
    actionLabel: "Review Now",
  },
  {
    id: "timeline_002",
    type: "RECONCILIATION_GAP",
    title: "Critical Reconciliation Gap",
    description: "4 items unmatched for 30+ days",
    date: "2026-02-17",
    amount: 500000,
    severity: "CRITICAL",
    metadata: {
      count: 4,
      ageDays: 38,
    },
    actionable: true,
    actionLabel: "Reconcile",
  },

  // Tomorrow - Urgent
  {
    id: "timeline_003",
    type: "SALARY",
    title: "Salary Processing",
    description: "Monthly salary disbursement - 45 employees",
    date: "2026-02-18",
    amount: 3500000,
    severity: "URGENT",
    metadata: {
      employeeCount: 45,
      cycle: "Monthly",
    },
    actionable: false,
  },
  {
    id: "timeline_004",
    type: "VENDOR_PAYMENT",
    title: "Vendor Payment Due",
    description: "ABC Suppliers Ltd - Invoice #12345",
    date: "2026-02-18",
    amount: 250000,
    severity: "WARNING",
    metadata: {
      vendorName: "ABC Suppliers Ltd",
      invoiceNumber: "INV-12345",
    },
    actionable: false,
  },

  // This week
  {
    id: "timeline_005",
    type: "EMI",
    title: "Term Loan EMI",
    description: "Monthly installment - Term Loan #TL-001",
    date: "2026-02-20",
    amount: 180000,
    severity: "URGENT",
    metadata: {
      loanId: "TL-001",
      installmentNumber: 24,
    },
    actionable: false,
  },
  {
    id: "timeline_006",
    type: "RECEIVABLE_DUE",
    title: "Receivable Due",
    description: "Payment expected from Gamma Trading Co",
    date: "2026-02-20",
    amount: 450000,
    severity: "WARNING",
    metadata: {
      clientName: "Gamma Trading Co",
      invoiceNumber: "INV-2026-003",
    },
    actionable: false,
  },
  {
    id: "timeline_007",
    type: "TAX_DEADLINE",
    title: "VAT Return Filing",
    description: "Monthly VAT return submission deadline",
    date: "2026-02-22",
    severity: "URGENT",
    metadata: {
      taxType: "VAT",
      period: "January 2026",
    },
    actionable: false,
  },

  // Next week
  {
    id: "timeline_008",
    type: "LICENSE_RENEWAL",
    title: "Trade License Renewal",
    description: "Annual trade license expires soon",
    date: "2026-02-25",
    severity: "WARNING",
    metadata: {
      licenseType: "Trade License",
      authority: "City Corporation",
    },
    actionable: false,
  },
  {
    id: "timeline_009",
    type: "VENDOR_PAYMENT",
    title: "Utility Bill Payment",
    description: "Electricity bill payment due",
    date: "2026-02-26",
    amount: 75000,
    severity: "INFO",
    metadata: {
      utilityType: "Electricity",
      billMonth: "January 2026",
    },
    actionable: false,
  },
  {
    id: "timeline_010",
    type: "EMI",
    title: "Working Capital Loan EMI",
    description: "Monthly installment - WC Loan #WC-002",
    date: "2026-02-28",
    amount: 120000,
    severity: "URGENT",
    metadata: {
      loanId: "WC-002",
      installmentNumber: 12,
    },
    actionable: false,
  },

  // Next month
  {
    id: "timeline_011",
    type: "TAX_DEADLINE",
    title: "Income Tax Advance Payment",
    description: "Quarterly income tax advance payment",
    date: "2026-03-01",
    amount: 500000,
    severity: "URGENT",
    metadata: {
      taxType: "Income Tax",
      quarter: "Q1 FY2026",
    },
    actionable: false,
  },
  {
    id: "timeline_012",
    type: "SALARY",
    title: "Salary Processing",
    description: "Monthly salary disbursement - 45 employees",
    date: "2026-03-18",
    amount: 3500000,
    severity: "INFO",
    metadata: {
      employeeCount: 45,
      cycle: "Monthly",
    },
    actionable: false,
  },
];

// ============================================
// 3. GROUPING & SORTING
// ============================================

export function groupTimelineByDate(items: TimelineItem[]): TimelineGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const groups = new Map<string, TimelineGroup>();

  // Sort items by date
  const sortedItems = [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedItems.forEach((item) => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);

    const dateKey = item.date;

    if (!groups.has(dateKey)) {
      let dayLabel: string;

      if (itemDate.getTime() === today.getTime()) {
        dayLabel = "Today";
      } else if (itemDate.getTime() === tomorrow.getTime()) {
        dayLabel = "Tomorrow";
      } else {
        dayLabel = itemDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      groups.set(dateKey, {
        date: dateKey,
        dayLabel,
        items: [],
      });
    }

    groups.get(dateKey)!.items.push(item);
  });

  return Array.from(groups.values());
}

/**
 * Filter timeline by severity
 */
export function filterBySeverity(
  items: TimelineItem[],
  severity: TimelineSeverity | "ALL"
): TimelineItem[] {
  if (severity === "ALL") return items;
  return items.filter((item) => item.severity === severity);
}

/**
 * Get severity count
 */
export function getSeverityCounts(items: TimelineItem[]) {
  return {
    ALL: items.length,
    CRITICAL: items.filter((i) => i.severity === "CRITICAL").length,
    URGENT: items.filter((i) => i.severity === "URGENT").length,
    WARNING: items.filter((i) => i.severity === "WARNING").length,
    INFO: items.filter((i) => i.severity === "INFO").length,
  };
}

// ============================================
// 4. HELPER FUNCTIONS
// ============================================

export function getTypeIcon(type: TimelineItemType): string {
  switch (type) {
    case "EMI":
      return "💳";
    case "SALARY":
      return "👥";
    case "VENDOR_PAYMENT":
      return "🏪";
    case "TAX_DEADLINE":
      return "📋";
    case "APPROVAL_PENDING":
      return "⏳";
    case "RECONCILIATION_GAP":
      return "⚠️";
    case "RECEIVABLE_DUE":
      return "💰";
    case "LICENSE_RENEWAL":
      return "📜";
  }
}

export function getTypeLabel(type: TimelineItemType): string {
  return type.replace(/_/g, " ");
}

export function getSeverityColor(severity: TimelineSeverity): string {
  switch (severity) {
    case "INFO":
      return "blue";
    case "WARNING":
      return "amber";
    case "URGENT":
      return "orange";
    case "CRITICAL":
      return "red";
  }
}

export function getSeverityBadge(severity: TimelineSeverity): string {
  switch (severity) {
    case "INFO":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "WARNING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "URGENT":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "CRITICAL":
      return "bg-red-100 text-red-700 border-red-200";
  }
}

export function getItemBorderColor(severity: TimelineSeverity): string {
  switch (severity) {
    case "INFO":
      return "border-blue-200 bg-blue-50";
    case "WARNING":
      return "border-amber-200 bg-amber-50";
    case "URGENT":
      return "border-orange-200 bg-orange-50";
    case "CRITICAL":
      return "border-red-200 bg-red-50";
  }
}

export function formatAmount(amount: number): string {
  return `৳${amount.toLocaleString()}`;
}

export function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function getDaysLabel(dateStr: string): string {
  const days = getDaysUntil(dateStr);

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days <= 7) return `In ${days} days`;
  if (days <= 30) return `In ${days} days`;
  return `In ${Math.floor(days / 30)} month(s)`;
}