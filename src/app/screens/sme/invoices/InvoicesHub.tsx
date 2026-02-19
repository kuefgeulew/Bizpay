import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import InvoiceOverviewScreen from "./InvoiceOverviewScreen";
import InvoiceListScreen from "./InvoiceListScreen";
import InvoiceDetailScreen from "./InvoiceDetailScreen";
import OutstandingTrackerScreen from "./OutstandingTrackerScreen";
import CreateGSTInvoiceScreen from "./CreateGSTInvoiceScreen";

interface InvoicesHubProps {
  onBack: () => void;
}

export type InvoiceView = "overview" | "list" | "detail" | "outstanding" | "create";

export default function InvoicesHub({ onBack }: InvoicesHubProps) {
  const [view, setView] = useState<InvoiceView>("overview");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Route to sub-screens
  switch (view) {
    case "list":
      return (
        <InvoiceListScreen
          onBack={() => setView("overview")}
          onSelectInvoice={(id) => {
            setSelectedInvoiceId(id);
            setView("detail");
          }}
        />
      );

    case "detail":
      return (
        <InvoiceDetailScreen
          invoiceId={selectedInvoiceId || ""}
          onBack={() => {
            setSelectedInvoiceId(null);
            setView("list");
          }}
        />
      );

    case "outstanding":
      return (
        <OutstandingTrackerScreen
          onBack={() => setView("overview")}
          onSelectClient={(clientId) => {
            // Navigate to invoice list filtered by client
            setView("list");
          }}
        />
      );

    case "create":
      return (
        <CreateGSTInvoiceScreen
          onBack={() => setView("overview")}
        />
      );

    default:
      return (
        <InvoiceOverviewScreen
          onBack={onBack}
          onNavigate={(target) => setView(target)}
        />
      );
  }
}