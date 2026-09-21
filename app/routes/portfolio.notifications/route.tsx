import clsx from "clsx";

import { ROUTES } from "~/consts";
import { RText } from "~/lib/atoms/RTypography/RText";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";
import { formatNotificationDate } from "~/layouts/PageLayout/RHeader/NotificationsPanel";

import styles from "./styles.module.css";

export default function PortfolioNotifications() {
  const { notifications } = useNotificationsContext();

  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolioNotifications} userName="Josh" />

      <section
        aria-label="Notification centre"
        className={styles.notifications}
      >
        <div className={styles.header}>
          <RText size="body-m" weight="medium">
            Notifications
          </RText>
        </div>

        <div className={styles.list}>
          {notifications.length ? (
            notifications.map((notification, index) => (
              <div
                className={clsx(
                  styles.notification,
                  !notification.isRead && styles.unread
                )}
                key={`${notification.date}-${notification.title}-${index}`}
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
                  <RText color="neutral-500" size="body-sm">
                    {notification.description}
                  </RText>
                </span>
                <span className={styles.meta}>
                  <RText color="neutral-500" size="body-sm">
                    {formatNotificationDate(notification.date)}
                  </RText>
                </span>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              <RText color="neutral-700" size="body-m">
                No notifications yet
              </RText>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
