/**
 * NOTIFICATION ENGINE — SPRINT 4 MODULE 3
 * In-app notification center with triggers and read/unread state
 */

export type NotificationType =
  | "APPROVAL_REQUESTED"
  | "APPROVAL_OVERDUE"
  | "APPROVAL_APPROVED"
  | "APPROVAL_REJECTED"
  | "APPROVAL_SENT_BACK"
  | "RECONCILIATION_EXCEPTION"
  | "VAM_OVERDUE_CLIENT"
  | "LIMIT_THRESHOLD_CROSSED"
  | "USER_ROLE_CHANGED"
  | "DELEGATION_RECEIVED"
  | "DELEGATION_EXPIRING"
  | "SYSTEM_ALERT";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  userId: string; // Target user
  actionUrl?: string; // Deep link to relevant screen
  metadata: Record<string, any>;
  expiresAt?: string; // Optional expiry
}

// ============================================
// MOCK NOTIFICATIONS
// ============================================

export const NOTIFICATIONS: Notification[] = [
  // Unread
  {
    id: "notif_001",
    type: "APPROVAL_REQUESTED",
    priority: "HIGH",
    title: "New Approval Request",
    message: "Fatima Khan submitted an MFS transaction (৳250,000) for your approval",
    timestamp: "2026-02-17T14:30:00Z",
    isRead: false,
    userId: "usr_004", // Checker
    actionUrl: "/approvals/apv_001",
    metadata: {
      approvalId: "apv_001",
      submittedBy: "Fatima Khan",
      amount: 250000,
      entityType: "transaction",
    },
  },
  {
    id: "notif_002",
    type: "APPROVAL_OVERDUE",
    priority: "URGENT",
    title: "Approval Overdue",
    message: "Transaction approval apv_003 has been pending for 52 hours (SLA: 48h)",
    timestamp: "2026-02-17T13:00:00Z",
    isRead: false,
    userId: "usr_003", // Approver
    actionUrl: "/approvals/apv_003",
    metadata: {
      approvalId: "apv_003",
      hoursPending: 52,
      slaHours: 48,
    },
  },
  {
    id: "notif_003",
    type: "RECONCILIATION_EXCEPTION",
    priority: "MEDIUM",
    title: "Reconciliation Exception",
    message: "New unmatched transaction detected: ৳125,000 (Bank Ref: TXN456789)",
    timestamp: "2026-02-17T12:00:00Z",
    isRead: false,
    userId: "usr_001", // Admin
    actionUrl: "/collections/reconciliation",
    metadata: {
      exceptionId: "exc_001",
      amount: 125000,
      bankRef: "TXN456789",
    },
  },
  {
    id: "notif_004",
    type: "LIMIT_THRESHOLD_CROSSED",
    priority: "HIGH",
    title: "Daily Limit Warning",
    message: "You have used 85% of your daily transaction limit (৳850k / ৳1M)",
    timestamp: "2026-02-17T11:30:00Z",
    isRead: false,
    userId: "usr_002", // Maker
    actionUrl: "/dashboard",
    metadata: {
      usedAmount: 850000,
      totalLimit: 1000000,
      percentUsed: 85,
    },
  },
  {
    id: "notif_005",
    type: "VAM_OVERDUE_CLIENT",
    priority: "HIGH",
    title: "Client Payment Overdue",
    message: "GreenTech Solutions payment is 15 days overdue (৳450,000)",
    timestamp: "2026-02-17T10:00:00Z",
    isRead: false,
    userId: "usr_001", // Admin
    actionUrl: "/collections/vam",
    metadata: {
      clientName: "GreenTech Solutions",
      amount: 450000,
      overdueDays: 15,
    },
  },

  // Read
  {
    id: "notif_006",
    type: "APPROVAL_APPROVED",
    priority: "MEDIUM",
    title: "Approval Granted",
    message: "Your bill payment request has been approved by Karim Hossain",
    timestamp: "2026-02-16T15:30:00Z",
    isRead: true,
    userId: "usr_002", // Maker
    actionUrl: "/transactions/txn_12340",
    metadata: {
      approvalId: "apv_004",
      approvedBy: "Karim Hossain",
      amount: 15000,
    },
  },
  {
    id: "notif_007",
    type: "APPROVAL_SENT_BACK",
    priority: "MEDIUM",
    title: "Approval Sent Back",
    message: "Beneficiary addition sent back: Beneficiary name mismatch with account details",
    timestamp: "2026-02-16T16:00:00Z",
    isRead: true,
    userId: "usr_002", // Maker
    actionUrl: "/approvals/apv_006",
    metadata: {
      approvalId: "apv_006",
      checkerName: "Nadia Islam",
      reason: "Beneficiary name mismatch with account details",
    },
  },
  {
    id: "notif_008",
    type: "DELEGATION_RECEIVED",
    priority: "HIGH",
    title: "Delegation Received",
    message: "Karim Hossain has delegated approval rights to you (17 Feb - 24 Feb)",
    timestamp: "2026-02-16T15:00:00Z",
    isRead: true,
    userId: "usr_006", // Rashid Ali
    actionUrl: "/approvals",
    metadata: {
      delegatorName: "Karim Hossain",
      startDate: "2026-02-17",
      endDate: "2026-02-24",
      reason: "On business travel",
    },
  },
  {
    id: "notif_009",
    type: "APPROVAL_REJECTED",
    priority: "MEDIUM",
    title: "Approval Rejected",
    message: "Your MFS transaction (৳1,000,000) was rejected: Exceeds policy limit",
    timestamp: "2026-02-15T16:00:00Z",
    isRead: true,
    userId: "usr_002", // Maker
    actionUrl: "/approvals/apv_005",
    metadata: {
      approvalId: "apv_005",
      approverName: "Karim Hossain",
      amount: 1000000,
      reason: "Exceeds policy limit. Requires additional documentation.",
    },
  },
  {
    id: "notif_010",
    type: "USER_ROLE_CHANGED",
    priority: "HIGH",
    title: "Role Changed",
    message: "Your role has been changed from Maker to Checker by Admin",
    timestamp: "2026-02-15T10:00:00Z",
    isRead: true,
    userId: "usr_005", // Nadia Ahmed
    actionUrl: "/dashboard",
    metadata: {
      previousRole: "maker",
      newRole: "checker",
      changedBy: "Admin User",
    },
  },
];

// ============================================
// NOTIFICATION STORAGE (IN-MEMORY)
// ============================================

let notificationStore: Notification[] = [...NOTIFICATIONS];

// ============================================
// NOTIFICATION MANAGEMENT
// ============================================

/**
 * Get all notifications for a user
 */
export function getNotificationsForUser(userId: string): Notification[] {
  return notificationStore
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get unread count for a user
 */
export function getUnreadCount(userId: string): number {
  return notificationStore.filter((n) => n.userId === userId && !n.isRead).length;
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): void {
  const notification = notificationStore.find((n) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
  }
}

/**
 * Mark all notifications as read for a user
 */
export function markAllAsRead(userId: string): void {
  notificationStore.forEach((n) => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });
}

/**
 * Delete notification (mark as expired)
 */
export function deleteNotification(notificationId: string): void {
  notificationStore = notificationStore.filter((n) => n.id !== notificationId);
}

/**
 * Create new notification
 */
export function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = "MEDIUM",
  metadata: Record<string, any> = {},
  actionUrl?: string
): Notification {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    priority,
    title,
    message,
    timestamp: new Date().toISOString(),
    isRead: false,
    userId,
    actionUrl,
    metadata,
  };

  notificationStore.push(notification);
  return notification;
}

// ============================================
// NOTIFICATION TRIGGERS
// ============================================

/**
 * Trigger: Approval Requested
 */
export function triggerApprovalRequested(
  targetUserId: string,
  submitterName: string,
  entityType: string,
  amount?: number,
  approvalId?: string
): void {
  const amountText = amount ? ` (৳${amount.toLocaleString()})` : "";
  createNotification(
    targetUserId,
    "APPROVAL_REQUESTED",
    "New Approval Request",
    `${submitterName} submitted a ${entityType}${amountText} for your approval`,
    "HIGH",
    { submitterName, entityType, amount, approvalId },
    approvalId ? `/approvals/${approvalId}` : "/approvals"
  );
}

/**
 * Trigger: Approval Overdue
 */
export function triggerApprovalOverdue(
  targetUserId: string,
  approvalId: string,
  hoursPending: number,
  slaHours: number
): void {
  createNotification(
    targetUserId,
    "APPROVAL_OVERDUE",
    "Approval Overdue",
    `Approval ${approvalId} has been pending for ${hoursPending} hours (SLA: ${slaHours}h)`,
    "URGENT",
    { approvalId, hoursPending, slaHours },
    `/approvals/${approvalId}`
  );
}

/**
 * Trigger: Approval Approved
 */
export function triggerApprovalApproved(
  targetUserId: string,
  approverName: string,
  entityType: string,
  approvalId: string
): void {
  createNotification(
    targetUserId,
    "APPROVAL_APPROVED",
    "Approval Granted",
    `Your ${entityType} request has been approved by ${approverName}`,
    "MEDIUM",
    { approverName, entityType, approvalId },
    `/approvals/${approvalId}`
  );
}

/**
 * Trigger: Approval Rejected
 */
export function triggerApprovalRejected(
  targetUserId: string,
  approverName: string,
  entityType: string,
  reason: string,
  approvalId: string
): void {
  createNotification(
    targetUserId,
    "APPROVAL_REJECTED",
    "Approval Rejected",
    `Your ${entityType} was rejected by ${approverName}: ${reason}`,
    "MEDIUM",
    { approverName, entityType, reason, approvalId },
    `/approvals/${approvalId}`
  );
}

/**
 * Trigger: Approval Sent Back
 */
export function triggerApprovalSentBack(
  targetUserId: string,
  checkerName: string,
  reason: string,
  approvalId: string
): void {
  createNotification(
    targetUserId,
    "APPROVAL_SENT_BACK",
    "Approval Sent Back",
    `Checker ${checkerName} sent back your request: ${reason}`,
    "MEDIUM",
    { checkerName, reason, approvalId },
    `/approvals/${approvalId}`
  );
}

/**
 * Trigger: Reconciliation Exception
 */
export function triggerReconciliationException(
  targetUserId: string,
  amount: number,
  bankRef: string,
  exceptionId: string
): void {
  createNotification(
    targetUserId,
    "RECONCILIATION_EXCEPTION",
    "Reconciliation Exception",
    `New unmatched transaction detected: ৳${amount.toLocaleString()} (Bank Ref: ${bankRef})`,
    "MEDIUM",
    { amount, bankRef, exceptionId },
    "/collections/reconciliation"
  );
}

/**
 * Trigger: VAM Overdue Client
 */
export function triggerVAMOverdueClient(
  targetUserId: string,
  clientName: string,
  amount: number,
  overdueDays: number
): void {
  createNotification(
    targetUserId,
    "VAM_OVERDUE_CLIENT",
    "Client Payment Overdue",
    `${clientName} payment is ${overdueDays} days overdue (৳${amount.toLocaleString()})`,
    "HIGH",
    { clientName, amount, overdueDays },
    "/collections/vam"
  );
}

/**
 * Trigger: Limit Threshold Crossed
 */
export function triggerLimitThreshold(
  targetUserId: string,
  usedAmount: number,
  totalLimit: number,
  percentUsed: number
): void {
  createNotification(
    targetUserId,
    "LIMIT_THRESHOLD_CROSSED",
    "Daily Limit Warning",
    `You have used ${percentUsed}% of your daily transaction limit (৳${usedAmount.toLocaleString()} / ৳${totalLimit.toLocaleString()})`,
    "HIGH",
    { usedAmount, totalLimit, percentUsed },
    "/dashboard"
  );
}

/**
 * Trigger: User Role Changed
 */
export function triggerUserRoleChanged(
  targetUserId: string,
  previousRole: string,
  newRole: string,
  changedBy: string
): void {
  createNotification(
    targetUserId,
    "USER_ROLE_CHANGED",
    "Role Changed",
    `Your role has been changed from ${previousRole} to ${newRole} by ${changedBy}`,
    "HIGH",
    { previousRole, newRole, changedBy },
    "/dashboard"
  );
}

/**
 * Trigger: Delegation Received
 */
export function triggerDelegationReceived(
  targetUserId: string,
  delegatorName: string,
  startDate: string,
  endDate: string,
  reason: string
): void {
  createNotification(
    targetUserId,
    "DELEGATION_RECEIVED",
    "Delegation Received",
    `${delegatorName} has delegated approval rights to you (${startDate} - ${endDate})`,
    "HIGH",
    { delegatorName, startDate, endDate, reason },
    "/approvals"
  );
}

/**
 * Trigger: Delegation Expiring Soon
 */
export function triggerDelegationExpiring(
  targetUserId: string,
  delegateName: string,
  hoursRemaining: number
): void {
  createNotification(
    targetUserId,
    "DELEGATION_EXPIRING",
    "Delegation Expiring",
    `Your delegation to ${delegateName} expires in ${hoursRemaining} hours`,
    "MEDIUM",
    { delegateName, hoursRemaining },
    "/approvals"
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPriorityColor(priority: NotificationPriority): string {
  switch (priority) {
    case "URGENT":
      return "red";
    case "HIGH":
      return "orange";
    case "MEDIUM":
      return "blue";
    case "LOW":
      return "gray";
  }
}

export function getPriorityBadge(priority: NotificationPriority): string {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-700 border-red-200";
    case "HIGH":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "MEDIUM":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "LOW":
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "APPROVAL_REQUESTED":
      return "⏳";
    case "APPROVAL_OVERDUE":
      return "⚠️";
    case "APPROVAL_APPROVED":
      return "✅";
    case "APPROVAL_REJECTED":
      return "❌";
    case "APPROVAL_SENT_BACK":
      return "↩️";
    case "RECONCILIATION_EXCEPTION":
      return "⚖️";
    case "VAM_OVERDUE_CLIENT":
      return "💰";
    case "LIMIT_THRESHOLD_CROSSED":
      return "📊";
    case "USER_ROLE_CHANGED":
      return "👤";
    case "DELEGATION_RECEIVED":
      return "🤝";
    case "DELEGATION_EXPIRING":
      return "⏰";
    case "SYSTEM_ALERT":
      return "🔔";
  }
}

export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}