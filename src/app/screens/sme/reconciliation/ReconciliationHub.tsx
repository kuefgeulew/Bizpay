import { useState } from "react";
import ReconciliationDashboardScreen from "./ReconciliationDashboardScreen";
import ExceptionManagementScreen from "./ExceptionManagementScreen";
import ManualMatchingScreen from "./ManualMatchingScreen";
import AutoReconRulesHub from "./autorules/AutoReconRulesHub";
import TaxVaultScreen from "../accounts/TaxVaultScreen";

interface ReconciliationHubProps {
  onBack: () => void;
  currentUser: {
    userId: string;
    name: string;
    role: "maker" | "checker" | "approver" | "admin" | "viewer";
  };
}

type View = "dashboard" | "matches" | "exceptions" | "manual" | "auto-rules" | "tax-vault";

export default function ReconciliationHub({
  onBack,
  currentUser,
}: ReconciliationHubProps) {
  const [view, setView] = useState<View>("dashboard");

  const handleViewChange = (newView: "matches" | "exceptions" | "manual" | "auto-rules" | "tax-vault") => {
    setView(newView);
  };

  const handleResolveException = (exceptionId: string) => {
    // Navigate to manual matching to resolve
    setView("manual");
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
  };

  switch (view) {
    case "exceptions":
      return (
        <ExceptionManagementScreen
          onBack={handleBackToDashboard}
          onResolveException={handleResolveException}
        />
      );

    case "manual":
      return (
        <ManualMatchingScreen
          onBack={handleBackToDashboard}
          currentUser={currentUser}
        />
      );

    case "auto-rules":
      return (
        <AutoReconRulesHub onBack={handleBackToDashboard} />
      );

    case "tax-vault":
      return (
        <TaxVaultScreen onBack={handleBackToDashboard} />
      );

    case "matches":
      // TODO: Implement matched items view (Sprint 3 extension)
      return (
        <div className="glass-page">
          <button onClick={handleBackToDashboard} className="glass-back">
            Back
          </button>
          <h1 className="glass-title">Matched Items</h1>
          <p className="text-muted-foreground text-sm">Illustrative workflow with representative data</p>
        </div>
      );

    case "dashboard":
    default:
      return (
        <ReconciliationDashboardScreen
          onBack={onBack}
          onViewDetails={handleViewChange}
        />
      );
  }
}