import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import clsx from "clsx";

import { ROUTES } from "~/consts";
import { fetchWalletNotifications } from "~/lib/apis/rwa";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { formatNotificationDate } from "~/layouts/PageLayout/RHeader/NotificationsPanel";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { NotifierChannel } from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierChannel } from "~/providers/NotificationsProvider/hooks/useNotifierChannel";
import { mapNotificationItemToUserNotification } from "~/providers/NotificationsProvider/helpers/notifications.helpers";
import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";

import styles from "./styles.module.css";

const NOTIFICATIONS_PAGE_SIZE = 10;

const isNotificationsNotFoundError = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 404;

export default function PortfolioNotifications() {
  const { authenticatedWalletAddress, isAuthenticated } = useAuthContext();
  const { readAllNotification } = useNotificationsContext();
  const [listRevision, setListRevision] = useState(0);
  const readAllInFlightBeforeRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasNotificationIdentity =
    isAuthenticated && Boolean(authenticatedWalletAddress);

  const notificationsQuery = useInfiniteQuery({
    queryKey: [
      "walletNotificationsPage",
      authenticatedWalletAddress,
      listRevision,
    ],
    queryFn: ({ pageParam }) =>
      fetchWalletNotifications({
        cursor: pageParam,
        limit: NOTIFICATIONS_PAGE_SIZE,
        walletAddress: authenticatedWalletAddress ?? "",
      }),
    enabled: hasNotificationIdentity,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const resetNotificationsList = useCallback(() => {
    listRef.current?.scrollTo({ top: 0 });
    setListRevision((revision) => revision + 1);
  }, []);

  useNotifierChannel(NotifierChannel.Wallet, resetNotificationsList);

  const { fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    notificationsQuery;

  useEffect(() => {
    readAllInFlightBeforeRef.current = null;
  }, [authenticatedWalletAddress]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { root: listRef.current, rootMargin: "120px" }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const notifications = useMemo(
    () =>
      notificationsQuery.data?.pages.flatMap((page) =>
        page.items.map(mapNotificationItemToUserNotification)
      ) ?? [],
    [notificationsQuery.data?.pages]
  );
  const isDisabled = isNotificationsNotFoundError(notificationsQuery.error);

  useEffect(() => {
    const before = notifications[0]?.createdAt;
    const hasUnreadNotification = notifications.some(
      (notification) => !notification.isRead
    );

    if (
      !notificationsQuery.isSuccess ||
      !before ||
      !hasUnreadNotification ||
      readAllInFlightBeforeRef.current === before
    ) {
      return;
    }

    readAllInFlightBeforeRef.current = before;

    void (async () => {
      try {
        await readAllNotification(before);
        await refetch();
      } catch (error) {
        console.error("Unable to mark notifications as read", error);
      } finally {
        if (readAllInFlightBeforeRef.current === before) {
          readAllInFlightBeforeRef.current = null;
        }
      }
    })();
  }, [
    notifications,
    notificationsQuery.isSuccess,
    readAllNotification,
    refetch,
  ]);

  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolioNotifications} />

      <section
        aria-label="Notification centre"
        className={styles.notifications}
      >
        <div className={styles.header}>
          <RText size="body-m" weight="medium">
            Notifications
          </RText>
        </div>

        <div className={styles.list} ref={listRef}>
          {isDisabled ? (
            <div className={styles.empty}>
              <RText color="neutral-700" size="body-m">
                No notifications yet
              </RText>
            </div>
          ) : notificationsQuery.isError ? (
            <div className={styles.empty}>
              <RText color="neutral-700" size="body-m">
                Unable to load notifications.
              </RText>
            </div>
          ) : notifications.length ? (
            notifications.map((notification, index) => (
              <div
                className={clsx(
                  styles.notification,
                  !notification.isRead && styles.unread
                )}
                key={
                  notification.id ||
                  `${notification.date}-${notification.title}-${index}`
                }
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
          ) : !notificationsQuery.isFetching ? (
            <div className={styles.empty}>
              <RText color="neutral-700" size="body-m">
                No notifications yet
              </RText>
            </div>
          ) : null}
          {notificationsQuery.isFetching ? (
            <div
              aria-label="Loading notifications"
              className={styles.loadingOverlay}
              role="status"
            >
              <RIcon name="loading" size="medium" />
            </div>
          ) : null}
          {notificationsQuery.hasNextPage ? (
            <div className={styles.loadMore} ref={loadMoreRef}>
              <RText color="neutral-500" size="body-sm">
                {notificationsQuery.isFetchingNextPage
                  ? "Loading more..."
                  : "Scroll for more"}
              </RText>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
