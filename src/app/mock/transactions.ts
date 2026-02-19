/**
 * TRANSACTIONS DATA
 * Reference transaction records — all amounts are BDT
 */

export type TransactionType = "MFS" | "Bank Transfer" | "Bill Payment";
export type TransactionStatus = "draft" | "pending" | "approved" | "completed" | "rejected" | "failed";

export interface MockTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  recipient: {
    name: string;
    account: string;
    bank?: string;
  };
  purpose: string;
  status: TransactionStatus;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  reference?: string;
  notes?: string;
}

export const TRANSACTION_RECORDS: MockTransaction[] = [
  {
    id: "txn_001",
    type: "Bank Transfer",
    amount: 250000,
    recipient: {
      name: "Acme Corporation",
      account: "1234567890",
      bank: "Dutch-Bangla Bank",
    },
    purpose: "Supplier Payment",
    status: "completed",
    createdBy: "usr_002",
    createdByName: "Rahim Ahmed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    approvedBy: "usr_004",
    approvedByName: "Tariq Hasan",
    approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000),
    reference: "TXN2025021501",
  },
  {
    id: "txn_002",
    type: "MFS",
    amount: 85000,
    recipient: {
      name: "Ali Hasan",
      account: "01711-234567",
    },
    purpose: "Salary Payment",
    status: "completed",
    createdBy: "usr_002",
    createdByName: "Rahim Ahmed",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    approvedBy: "usr_004",
    approvedByName: "Tariq Hasan",
    approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1800000),
    reference: "TXN2025021601",
  },
  {
    id: "txn_003",
    type: "Bank Transfer",
    amount: 480000,
    recipient: {
      name: "Tech Solutions Ltd",
      account: "9876543210",
      bank: "BRAC Bank",
    },
    purpose: "Service Fee",
    status: "pending",
    createdBy: "usr_002",
    createdByName: "Rahim Ahmed",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reference: "TXN2025021701",
  },
  {
    id: "txn_004",
    type: "Bank Transfer",
    amount: 1500000,
    recipient: {
      name: "Bengal Imports Ltd",
      account: "BD1234567890",
      bank: "Sonali Bank",
    },
    purpose: "Raw Material Procurement",
    status: "pending",
    createdBy: "usr_002",
    createdByName: "Rahim Ahmed",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    reference: "TXN2025021702",
  },
];

export function getAllTransactions(): MockTransaction[] {
  return [...TRANSACTION_RECORDS];
}

export function getTransactionById(id: string): MockTransaction | undefined {
  return TRANSACTION_RECORDS.find(t => t.id === id);
}

export function getTransactionsByStatus(status: TransactionStatus): MockTransaction[] {
  return TRANSACTION_RECORDS.filter(t => t.status === status);
}

export function createTransaction(data: Omit<MockTransaction, "id" | "createdAt" | "reference">): MockTransaction {
  const newTxn: MockTransaction = {
    ...data,
    id: `txn_${Date.now()}`,
    createdAt: new Date(),
    reference: `TXN${Date.now()}`,
  };
  TRANSACTION_RECORDS.push(newTxn);
  return newTxn;
}

export function updateTransactionStatus(
  id: string,
  status: TransactionStatus,
  approvedBy?: string,
  approvedByName?: string
): MockTransaction | null {
  const txn = TRANSACTION_RECORDS.find(t => t.id === id);
  if (txn) {
    txn.status = status;
    if (approvedBy && approvedByName) {
      txn.approvedBy = approvedBy;
      txn.approvedByName = approvedByName;
      txn.approvedAt = new Date();
    }
    return txn;
  }
  return null;
}
