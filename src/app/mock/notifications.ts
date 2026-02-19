/**
 * NOTIFICATIONS DATA
 * In-memory notification state
 */

export type NotificationType = 
  | "approval_pending"
  | "approval_approved"
  | "approval_rejected"
  | "approval_expiring"
  | "transaction_completed"
  | "transaction_failed"
  | "reconciliation_exception"
  | "security_alert"
  | "system_update";

export interface MockNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const APP_NOTIFICATIONS: MockNotification[] = [
  {
    id: "notif_001",
    type: "approval_pending",
    title: "New Approval Required",
    message: "Bank transfer to Tech Solutions Ltd (৳480,000) requires your approval",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    priority: "high",
    actionUrl: "approvals",
    metadata: {
      approvalId: "apr_001",
    },
  },
  {
    id: "notif_002",
    type: "approval_pending",
    title: "Urgent: High-Value Transfer",
    message: "Bank transfer to Bengal Imports Ltd (৳15,00,000) requires approval",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isRead: false,
    priority: "urgent",
    actionUrl: "approvals",
    metadata: {
      approvalId: "apr_002",
    },
  },
  {
    id: "notif_003",
    type: "reconciliation_exception",
    title: "Reconciliation Exception",
    message: "Manual override required for invoice INV-2024-089 (Amount: ৳125,000)",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    priority: "medium",
    actionUrl: "reconciliation",
    metadata: {
      exceptionId: "exc_089",
    },
  },
  {
    id: "notif_004",
    type: "transaction_completed",
    title: "Transaction Completed",
    message: "MFS payment to Ali Hasan (৳85,000) has been completed successfully",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1800000),
    isRead: true,
    priority: "low",
    actionUrl: "transactions",
    metadata: {
      transactionId: "txn_002",
    },
  },
  {
    id: "notif_005",
    type: "approval_approved",
    title: "Approval Granted",
    message: "Your beneficiary addition request for XYZ Traders has been approved",
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
    isRead: true,
    priority: "low",
    actionUrl: "beneficiaries",
    metadata: {
      approvalId: "apr_004",
    },
  },
];

export function getAllNotifications(): MockNotification[] {
  return [...APP_NOTIFICATIONS].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getUnreadNotifications(): MockNotification[] {
  return APP_NOTIFICATIONS.filter(n => !n.isRead)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getUnreadCount(): number {
  return APP_NOTIFICATIONS.filter(n => !n.isRead).length;
}

export function markAsRead(id: string): MockNotification | null {
  const notification = APP_NOTIFICATIONS.find(n => n.id === id);
  if (notification) {
    notification.isRead = true;
    return notification;
  }
  return null;
}

export function markAllAsRead(): void {
  APP_NOTIFICATIONS.forEach(n => {
    n.isRead = true;
  });
}

export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  priority: "low" | "medium" | "high" | "urgent" = "medium",
  actionUrl?: string,
  metadata?: Record<string, any>
): MockNotification {
  const newNotification: MockNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date(),
    isRead: false,
    priority,
    actionUrl,
    metadata,
  };
  APP_NOTIFICATIONS.unshift(newNotification);
  return newNotification;
}

export function deleteNotification(id: string): boolean {
  const index = APP_NOTIFICATIONS.findIndex(n => n.id === id);
  if (index !== -1) {
    APP_NOTIFICATIONS.splice(index, 1);
    return true;
  }
  return false;
}