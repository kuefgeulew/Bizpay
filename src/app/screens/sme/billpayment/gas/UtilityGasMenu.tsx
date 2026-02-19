import FeatureOverviewScreen from "../../../../components/FeatureOverviewScreen";
import { Flame } from "lucide-react";

interface UtilityGasMenuProps {
  onBack: () => void;
}

export default function UtilityGasMenu({ onBack }: UtilityGasMenuProps) {
  return (
    <FeatureOverviewScreen
      title="Utility Gas Payments"
      subtitle="Natural Resources"
      purpose="This module enables gas utility bill payments, supporting multiple gas distribution companies with configurable payment options."
      features={[
        "Multi-provider gas bill processing",
        "Customer number validation",
        "Prepaid and postpaid payment options",
        "Payment receipt generation",
      ]}
      icon={Flame}
      onBack={onBack}
    />
  );
}