/**
 * AUTO-RECONCILIATION RULES HUB — Phase B3
 * Sub-view router for deterministic rule engine
 * // GOVERNANCE_ENFORCEMENT — Rule lifecycle governed via enforceServiceRequestGate
 */

import { useState } from "react";
import AutoReconRulesOverview from "./AutoReconRulesOverview";
import RuleDetailScreen from "./RuleDetailScreen";
import MatchSimulationScreen from "./MatchSimulationScreen";
import ExceptionRoutingPreview from "./ExceptionRoutingPreview";
import CreateRuleScreen from "./CreateRuleScreen";

interface AutoReconRulesHubProps {
  onBack: () => void;
}

export type AutoReconView =
  | "overview"
  | "rule-detail"
  | "simulation"
  | "exceptions"
  | "create";

export default function AutoReconRulesHub({ onBack }: AutoReconRulesHubProps) {
  const [view, setView] = useState<AutoReconView>("overview");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  switch (view) {
    case "rule-detail":
      return (
        <RuleDetailScreen
          ruleId={selectedRuleId || ""}
          onBack={() => {
            setSelectedRuleId(null);
            setView("overview");
          }}
        />
      );

    case "simulation":
      return <MatchSimulationScreen onBack={() => setView("overview")} />;

    case "exceptions":
      return <ExceptionRoutingPreview onBack={() => setView("overview")} />;

    case "create":
      return (
        <CreateRuleScreen
          onBack={() => setView("overview")}
          onCreated={() => setView("overview")}
        />
      );

    default:
      return (
        <AutoReconRulesOverview
          onBack={onBack}
          onNavigate={(target, ruleId) => {
            if (ruleId) setSelectedRuleId(ruleId);
            setView(target);
          }}
        />
      );
  }
}
