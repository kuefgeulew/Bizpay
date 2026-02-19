/**
 * TRANSACTION DATA — Mock Data for Risk Analysis
 */

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  beneficiary: string;
  type: "INTERNAL" | "THIRD_PARTY" | "SALARY" | "VENDOR";
  status: "COMPLETED" | "PENDING" | "FAILED";
  createdAt: string;
}

export const TRANSACTIONS: Transaction[] = [
  // Recent transactions (last 7 days)
  {
    id: "txn_001",
    date: "2026-02-17",
    amount: 250000,
    beneficiary: "Acme Corporation",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-17T10:30:00Z",
  },
  {
    id: "txn_002",
    date: "2026-02-16",
    amount: 150000,
    beneficiary: "Beta Industries Ltd",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-16T14:20:00Z",
  },
  {
    id: "txn_003",
    date: "2026-02-15",
    amount: 320000,
    beneficiary: "Gamma Trading Co",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-15T09:15:00Z",
  },
  {
    id: "txn_004",
    date: "2026-02-14",
    amount: 180000,
    beneficiary: "Delta Enterprises",
    type: "VENDOR",
    status: "COMPLETED",
    createdAt: "2026-02-14T11:00:00Z",
  },
  {
    id: "txn_005",
    date: "2026-02-13",
    amount: 275000,
    beneficiary: "Epsilon Solutions",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-13T16:45:00Z",
  },

  // Last 2 weeks
  {
    id: "txn_006",
    date: "2026-02-10",
    amount: 450000,
    beneficiary: "Zeta Corporation",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "txn_007",
    date: "2026-02-08",
    amount: 195000,
    beneficiary: "Acme Corporation",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-08T13:30:00Z",
  },
  {
    id: "txn_008",
    date: "2026-02-06",
    amount: 280000,
    beneficiary: "Beta Industries Ltd",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-06T09:45:00Z",
  },

  // Last 3 weeks
  {
    id: "txn_009",
    date: "2026-02-01",
    amount: 210000,
    beneficiary: "Gamma Trading Co",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-01T14:15:00Z",
  },
  {
    id: "txn_010",
    date: "2026-01-28",
    amount: 165000,
    beneficiary: "Delta Enterprises",
    type: "VENDOR",
    status: "COMPLETED",
    createdAt: "2026-01-28T11:20:00Z",
  },

  // Amount spike example (>3x average)
  {
    id: "txn_011",
    date: "2026-02-12",
    amount: 1500000,
    beneficiary: "Omega Mega Corp",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-12T15:00:00Z",
  },

  // New beneficiary with high amount
  {
    id: "txn_012",
    date: "2026-02-11",
    amount: 850000,
    beneficiary: "New Supplier XYZ",
    type: "THIRD_PARTY",
    status: "COMPLETED",
    createdAt: "2026-02-11T10:30:00Z",
  },

  // Salary disbursements
  {
    id: "txn_013",
    date: "2026-01-18",
    amount: 3500000,
    beneficiary: "Employee Salary - January",
    type: "SALARY",
    status: "COMPLETED",
    createdAt: "2026-01-18T09:00:00Z",
  },

  // Vendor payments
  {
    id: "txn_014",
    date: "2026-02-05",
    amount: 125000,
    beneficiary: "ABC Suppliers",
    type: "VENDOR",
    status: "COMPLETED",
    createdAt: "2026-02-05T14:30:00Z",
  },
  {
    id: "txn_015",
    date: "2026-02-03",
    amount: 95000,
    beneficiary: "XYZ Services",
    type: "VENDOR",
    status: "COMPLETED",
    createdAt: "2026-02-03T11:15:00Z",
  },
];