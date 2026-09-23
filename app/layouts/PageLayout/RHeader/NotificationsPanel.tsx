import { useEffect, useRef } from "react";
import clsx from "clsx";
import { Link } from "@remix-run/react";

import { ROUTES } from "~/consts";
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

export function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const { isNotificationsLoading, notifications } = useNotificationsContext();
  const panelRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node) || panelRef.current?.contains(target)) {
        return;
      }

      onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-label="Notifications"
      className={styles.panel}
      ref={panelRef}
      role="dialog"
    >
      <div className={styles.header}>
        <RText size="body-sm" weight="medium">
          Notifications
        </RText>
        <Link
          className={styles.viewAll}
          onClick={onClose}
          to={ROUTES.portfolioNotifications}
        >
          <RText color="neutral-700" size="body-s">
            View All
          </RText>
        </Link>
      </div>

      <div className={styles.list}>
        {isNotificationsLoading ? (
          <div className={styles.empty}>
            <RText color="neutral-700" size="body-sm">
              Loading notifications...
            </RText>
          </div>
        ) : notifications.length ? (
          notifications.map((notification) => (
            <Link
              className={clsx(
                styles.notification,
                !notification.isRead && styles.unread
              )}
              key={notification.id}
              onClick={onClose}
              to={ROUTES.portfolioNotifications}
            >
              <span className={styles.notificationContent}>
                <span className={styles.titleLine}>
                  <RText size="body-sm" weight="medium">
                    {notification.title}
                  </RText>
                  {!notification.isRead ? (
                    <span
                      aria-label="Unread"
                      className={styles.unreadIndicator}
                    />
                  ) : null}
                </span>
                <RText
                  className={styles.description}
                  color="neutral-500"
                  size="body-sm"
                >
                  {notification.description}
                </RText>
              </span>
              <RText className={styles.date} color="neutral-500" size="body-sm">
                {formatNotificationDate(notification.date)}
              </RText>
            </Link>
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
