import { useState, useEffect } from "react";
import ApprovalQueueScreen from "./ApprovalQueueScreen";
import ApprovalDetailScreen from "./ApprovalDetailScreen";
import type { MockApproval } from "../../../mock";

interface ApprovalHubProps {
  onBack: () => void;
  currentUser: {
    userId: string;
    name: string;
    role: "maker" | "checker" | "approver" | "admin" | "viewer";
  };
}

type View = "queue" | "detail";

export default function ApprovalHub({ onBack, currentUser }: ApprovalHubProps) {
  const [view, setView] = useState<View>("queue");
  const [selectedItem, setSelectedItem] = useState<MockApproval | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleItemClick = (item: MockApproval) => {
    setSelectedItem(item);
    setView("detail");
  };

  const handleBackToQueue = () => {
    setView("queue");
    setSelectedItem(null);
    // Trigger refresh when going back
    setRefreshKey(prev => prev + 1);
  };

  switch (view) {
    case "detail":
      if (!selectedItem) {
        setView("queue");
        return null;
      }
      return (
        <ApprovalDetailScreen
          item={selectedItem}
          onBack={handleBackToQueue}
          currentUser={currentUser}
        />
      );

    case "queue":
    default:
      return (
        <ApprovalQueueScreen
          key={refreshKey}
          onBack={onBack}
          currentUserId={currentUser.userId}
          currentUserRole={currentUser.role}
          onItemClick={handleItemClick}
        />
      );
  }
}