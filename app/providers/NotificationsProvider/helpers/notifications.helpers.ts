import type { NotificationItemType } from "~/lib/apis/rwa/notifications/notifications.types";
import type { UserNotification } from "~/providers/NotificationsProvider/notifications.types";

const getNotificationDescription = (notification: NotificationItemType) =>
  [notification.event_type, notification.entity_key]
    .filter((value) => value.trim())
    .join(" · ");

export const mapNotificationItemToUserNotification = (
  notification: NotificationItemType
): UserNotification => ({
  id: notification.id,
  title: notification.kind,
  description:
    getNotificationDescription(notification) || notification.kind,
  date: notification.occurred_at,
  createdAt: notification.created_at,
  isRead: Boolean(notification.read_at),
  kind: notification.kind,
});
