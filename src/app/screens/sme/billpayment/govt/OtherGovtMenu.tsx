import FeatureOverviewScreen from "../../../../components/FeatureOverviewScreen";
import { Landmark } from "lucide-react";

interface OtherGovtMenuProps {
  onBack: () => void;
}

export default function OtherGovtMenu({ onBack }: OtherGovtMenuProps) {
  return (
    <FeatureOverviewScreen
      title="Government Services"
      subtitle="Public Fees & Levies"
      purpose="This module enables payments for government services, fees, and levies including challan payments and regulatory compliance submissions."
      features={[
        "Government challan payment processing",
        "Regulatory fee submissions",
        "Tax and levy payment tracking",
        "Payment receipt and acknowledgement generation",
      ]}
      icon={Landmark}
      onBack={onBack}
    />
  );
}