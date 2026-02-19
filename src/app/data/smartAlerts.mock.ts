// Smart Behavioral Alerts Data
// Purpose: Read-only behavioral intelligence explaining past cash behavior impact

export interface BehavioralInsight {
  id: string;
  headline: string;
  explanation: string;
  impact: string; // Numeric impact in ৳ or %
  category: "payment" | "collection" | "idle" | "volatility";
}

// CANONICAL COPY FROM SPEC (DO NOT MODIFY)
export const BEHAVIORAL_INSIGHTS: BehavioralInsight[] = [
  {
    id: "insight_001",
    headline: "Early Vendor Payments",
    explanation: "Paying vendors before due dates reduced your average balance by 22% last month.",
    impact: "22%",
    category: "payment",
  },
  {
    id: "insight_002",
    headline: "Delay Opportunity",
    explanation:
      "Delaying the last scheduled payment by 3 days would have retained ৳18.4L in usable cash.",
    impact: "৳18.4L",
    category: "payment",
  },
  {
    id: "insight_003",
    headline: "Idle Cash",
    explanation: "You held ৳2.1L idle for 9 days without yield.",
    impact: "৳2.1L",
    category: "idle",
  },
  {
    id: "insight_004",
    headline: "Receivables Pattern",
    explanation: "Late customer follow-ups increased your average collection cycle by 6 days.",
    impact: "6 days",
    category: "collection",
  },
  {
    id: "insight_005",
    headline: "Balance Volatility",
    explanation:
      "Your balance dipped below the safe threshold 4 times due to clustered payments.",
    impact: "4 times",
    category: "volatility",
  },
];