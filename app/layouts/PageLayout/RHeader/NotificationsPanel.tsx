import { useEffect } from "react";
import clsx from "clsx";

import { RText } from "~/lib/atoms/RTypography/RText";
import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";

import styles from "./NotificationsPanel.module.css";

type NotificationsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function formatNotificationDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications } = useNotificationsContext();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <section aria-label="Notifications" className={styles.panel} role="dialog">
      <div className={styles.header}>
        <RText size="body-m" weight="medium">
          Notifications
        </RText>
      </div>

      <div className={styles.list}>
        {notifications.length ? (
          notifications.map((notification) => (
            <div
              className={clsx(styles.notification, !notification.isRead && styles.unread)}
              key={`${notification.date}-${notification.title}`}
            >
              <span className={styles.notificationContent}>
                <RText size="body-sm" weight="medium">
                  {notification.title}
                </RText>
                <RText className={styles.description} color="neutral-700" size="body-s">
                  {notification.description}
                </RText>
                <RText className={styles.date} color="neutral-700" size="body-s">
                  {formatNotificationDate(notification.date)}
                </RText>
              </span>
              {!notification.isRead ? <span aria-label="Unread" className={styles.unreadIndicator} /> : null}
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <RText color="neutral-700" size="body-sm">
              No notifications yet
            </RText>
          </div>
        )}
      </div>
    </section>
  );
}
