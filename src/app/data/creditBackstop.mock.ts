// Credit Backstop Data
// Purpose: OD/CC as buffer for CASA protection

export interface CreditBackstopData {
  currentCASABalance: number;
  safeBalanceFloor: number;
  odBufferTotal: number;
  odBufferUsed: number;
  odBufferAvailable: number;
  bufferStatus: "active" | "inactive";
  lastTwoEvents: AuditEvent[];
}

export interface AuditEvent {
  id: string;
  date: string;
  type: "payment_absorbed" | "buffer_restored";
  description: string;
}

// Reference Data
export const CREDIT_BACKSTOP: CreditBackstopData = {
  currentCASABalance: 8750000, // ৳87.5L
  safeBalanceFloor: 3200000, // ৳32L
  odBufferTotal: 5000000, // ৳50L
  odBufferUsed: 450000, // ৳4.5L
  odBufferAvailable: 4550000, // ৳45.5L
  bufferStatus: "active",
  lastTwoEvents: [
    {
      id: "evt_001",
      date: "Feb 17, 2026",
      type: "buffer_restored",
      description: "Buffer restored after inflow",
    },
    {
      id: "evt_002",
      date: "Feb 15, 2026",
      type: "payment_absorbed",
      description: "Payment absorbed by buffer",
    },
  ],
};

// Utility
export const formatCurrency = (amount: number): string => {
  const lakh = amount / 100000;
  return `৳${lakh.toFixed(1)}L`;
};