import FeatureOverviewScreen from "../../../../components/FeatureOverviewScreen";
import { ShieldCheck } from "lucide-react";

interface PositivePayReportsMenuProps {
  onBack: () => void;
}

export default function PositivePayReportsMenu({ onBack }: PositivePayReportsMenuProps) {
  return (
    <FeatureOverviewScreen
      title="Positive Pay Reports"
      subtitle="Fraud Prevention Analytics"
      purpose="This module delivers reporting on positive pay submissions, matching results, and exception handling for cheque-based fraud prevention."
      features={[
        "Submission history and match status",
        "Exception and mismatch reports",
        "Cheque verification audit trails",
        "Period-based analytics and summaries",
      ]}
      icon={ShieldCheck}
      onBack={onBack}
    />
  );
}