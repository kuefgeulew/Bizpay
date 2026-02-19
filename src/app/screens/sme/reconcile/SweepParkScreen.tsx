import FeatureOverviewScreen from "../../../components/FeatureOverviewScreen";
import { RefreshCw } from "lucide-react";

interface SweepParkScreenProps {
  onBack: () => void;
}

export default function SweepParkScreen({ onBack }: SweepParkScreenProps) {
  return (
    <FeatureOverviewScreen
      title="Sweep & Park"
      subtitle="Auto-Sweep Rules"
      purpose="Automatically move idle cash to interest-bearing accounts or keep it accessible for operations."
      icon={RefreshCw}
      features={[
        "Auto-Sweep Rules - Trigger-based cash movement to savings/FD",
        "Reverse Sweep - Pull cash back when operating balance drops",
        "Idle Balance Detection - Identify cash sitting unused for X days",
        "Multi-Account Sweeping - Consolidate balances from multiple accounts",
        "Threshold Configuration - Set min/max balance triggers",
        "Sweep History & Analytics - Track interest earned vs liquidity trade-offs",
      ]}
      onBack={onBack}
    />
  );
}