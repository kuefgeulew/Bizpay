import FeatureOverviewScreen from "../../../../components/FeatureOverviewScreen";
import { Receipt } from "lucide-react";

interface BillPaymentReportsMenuProps {
  onBack: () => void;
}

export default function BillPaymentReportsMenu({ onBack }: BillPaymentReportsMenuProps) {
  return (
    <FeatureOverviewScreen
      title="Bill Payment Reports"
      subtitle="Payment Analytics"
      purpose="This module provides comprehensive reporting for all bill payment transactions, including utility payments, government fees, and recurring obligations."
      features={[
        "Transaction history by provider and period",
        "Payment status tracking and reconciliation",
        "Exportable reports in multiple formats",
        "Scheduled payment audit trails",
      ]}
      icon={Receipt}
      onBack={onBack}
    />
  );
}