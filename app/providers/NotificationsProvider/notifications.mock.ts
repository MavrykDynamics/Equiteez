import type { UserNotification } from "~/providers/NotificationsProvider/notifications.types";

export const MOCK_USER_NOTIFICATIONS: UserNotification[] = [
  {
    title: "Deposit completed",
    description: "Your deposit of 1,000 USDT is now available in your wallet.",
    date: "2026-09-21T10:30:00.000Z",
    isRead: false,
  },
  {
    title: "Order filled",
    description: "Your buy order for The Cove has been filled.",
    date: "2026-09-20T14:45:00.000Z",
    isRead: false,
  },
  {
    title: "Portfolio update",
    description: "Your portfolio valuation has been updated.",
    date: "2026-09-19T09:15:00.000Z",
    isRead: true,
  },
];
