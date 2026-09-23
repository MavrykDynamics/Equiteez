import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { isAxiosError } from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchWalletNotifications,
  fetchWalletNotificationsSummary,
  readWalletNotifications,
} from "~/lib/apis/rwa";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import {
  MAX_NOTIFIER_SUBSCRIPTIONS,
  NotifierChannel,
  NotifierClientFrameType,
} from "~/providers/NotificationsProvider/notifications.const";
import type {
  NotifierChannelType,
  NotifierEventFrame,
  NotifierSubscribeFrame,
  NotifierSubscribedFrame,
  NotifierUnsubscribeFrame,
} from "~/providers/NotificationsProvider/notifications.types";
import { useNotifierSocket } from "~/providers/NotificationsProvider/hooks/useNotifierSocket";
import { mapNotificationItemToUserNotification } from "~/providers/NotificationsProvider/helpers/notifications.helpers";
import type {
  NotifierChannelHandler,
  NotificationsContextType,
} from "~/providers/NotificationsProvider/notifications.provider.types";

export const notificationsContext =
  createContext<NotificationsContextType | null>(null);

const NOTIFICATIONS_PREVIEW_LIMIT = 5;
const NOTIFICATIONS_QUERY_KEY = "rwa-wallet-notifications";
const NOTIFICATIONS_SUMMARY_QUERY_KEY = "rwa-wallet-notifications-summary";

const isNotificationsNotFoundError = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 404;

const isImplicitChannel = (channel: NotifierChannelType) =>
  channel === NotifierChannel.Wallet;

const toSortedChannels = (channels: Set<string>) =>
  Array.from(channels).sort((left, right) => left.localeCompare(right));

const areChannelSetsEqual = (left: Set<string>, right: Set<string>) => {
  if (left.size !== right.size) {
    return false;
  }

  for (const channel of left) {
    if (!right.has(channel)) {
      return false;
    }
  }

  return true;
};

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuthContext();
  const { userAddress } = useUserContext();
  const queryClient = useQueryClient();
  const channelHandlersRef = useRef<Map<string, Set<NotifierChannelHandler>>>(
    new Map()
  );
  const channelRefCountsRef = useRef<Map<string, number>>(new Map());
  const desiredChannelsRef = useRef<Set<string>>(new Set());
  const confirmedChannelsRef = useRef<Set<string>>(new Set());
  const quarantinedChannelsRef = useRef<Set<string>>(new Set());

  const getActiveDesiredChannels = useCallback(() => {
    const activeDesiredChannels = new Set<string>();

    desiredChannelsRef.current.forEach((channel) => {
      if (!quarantinedChannelsRef.current.has(channel)) {
        activeDesiredChannels.add(channel);
      }
    });

    return activeDesiredChannels;
  }, []);

  const sendSubscribeFrameRef = useRef<
    ((channels: string[]) => boolean) | null
  >(null);
  const sendUnsubscribeFrameRef = useRef<
    ((channels: string[]) => boolean) | null
  >(null);

  const notificationsSummaryQuery = useQuery({
    queryKey: [NOTIFICATIONS_SUMMARY_QUERY_KEY, userAddress],
    queryFn: () =>
      fetchWalletNotificationsSummary({
        walletAddress: userAddress ?? "",
      }),
    enabled: isAuthenticated && Boolean(userAddress),
    retry: false,
  });

  const notificationsPreviewQuery = useQuery({
    queryKey: [
      NOTIFICATIONS_QUERY_KEY,
      userAddress,
      NOTIFICATIONS_PREVIEW_LIMIT,
    ],
    queryFn: () =>
      fetchWalletNotifications({
        limit: NOTIFICATIONS_PREVIEW_LIMIT,
        walletAddress: userAddress ?? "",
      }),
    enabled: isAuthenticated && Boolean(userAddress),
    retry: false,
  });

  const refetchNotifications = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_SUMMARY_QUERY_KEY],
      }),
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY],
      }),
    ]);
  }, [queryClient]);

  const readAllNotification = useCallback(
    async (before: string) => {
      if (!isAuthenticated || !userAddress) {
        return;
      }

      await readWalletNotifications({
        before,
        walletAddress: userAddress,
      });
      await refetchNotifications();
    },
    [isAuthenticated, refetchNotifications, userAddress]
  );

  const subscribe = useCallback((channel: NotifierChannelType) => {
    const currentRefCount = channelRefCountsRef.current.get(channel) ?? 0;
    const wasDesiredChannel = desiredChannelsRef.current.has(channel);

    channelRefCountsRef.current.set(channel, currentRefCount + 1);

    if (isImplicitChannel(channel)) {
      return;
    }

    if (
      !desiredChannelsRef.current.has(channel) &&
      desiredChannelsRef.current.size >= MAX_NOTIFIER_SUBSCRIPTIONS
    ) {
      console.warn("Notifier subscription limit reached", {
        channel,
        limit: MAX_NOTIFIER_SUBSCRIPTIONS,
      });
      return;
    }

    const shouldRetryQuarantinedChannel =
      currentRefCount > 0 && quarantinedChannelsRef.current.has(channel);

    desiredChannelsRef.current.add(channel);
    quarantinedChannelsRef.current.delete(channel);

    if (
      currentRefCount > 0 &&
      wasDesiredChannel &&
      !shouldRetryQuarantinedChannel
    ) {
      return;
    }

    sendSubscribeFrameRef.current?.([channel]);
  }, []);

  const unsubscribe = useCallback((channel: NotifierChannelType) => {
    const currentRefCount = channelRefCountsRef.current.get(channel) ?? 0;

    if (currentRefCount <= 1) {
      channelRefCountsRef.current.delete(channel);
    } else {
      channelRefCountsRef.current.set(channel, currentRefCount - 1);
      return;
    }

    if (isImplicitChannel(channel)) {
      return;
    }

    desiredChannelsRef.current.delete(channel);
    quarantinedChannelsRef.current.delete(channel);
    sendUnsubscribeFrameRef.current?.([channel]);
  }, []);

  const registerChannelHandler = useCallback(
    (channel: NotifierChannelType, handler: NotifierChannelHandler) => {
      const channelHandlers =
        channelHandlersRef.current.get(channel) ?? new Set();

      channelHandlers.add(handler);
      channelHandlersRef.current.set(channel, channelHandlers);
      subscribe(channel);

      return () => {
        const currentHandlers = channelHandlersRef.current.get(channel);

        currentHandlers?.delete(handler);

        if (currentHandlers?.size === 0) {
          channelHandlersRef.current.delete(channel);
        }

        unsubscribe(channel);
      };
    },
    [subscribe, unsubscribe]
  );

  const handleEvent = useCallback(
    (frame: NotifierEventFrame, wallet: string) => {
      const handlers = channelHandlersRef.current.get(frame.channel);

      handlers?.forEach((handler) => {
        handler(frame, wallet);
      });
    },
    []
  );

  const handleConnected = useCallback(() => {
    const channels = toSortedChannels(getActiveDesiredChannels());

    if (channels.length) {
      sendSubscribeFrameRef.current?.(channels);
    }
  }, [getActiveDesiredChannels]);

  const handleSubscribed = useCallback(
    (frame: NotifierSubscribedFrame) => {
      const confirmedChannels = new Set(frame.channels ?? []);
      const activeDesiredChannels = getActiveDesiredChannels();

      confirmedChannelsRef.current = confirmedChannels;

      activeDesiredChannels.forEach((channel) => {
        if (!confirmedChannels.has(channel)) {
          quarantinedChannelsRef.current.add(channel);
        }
      });

      if (!areChannelSetsEqual(activeDesiredChannels, confirmedChannels)) {
        console.warn("Notifier subscription state diverged", {
          confirmed: toSortedChannels(confirmedChannels),
          desired: toSortedChannels(activeDesiredChannels),
        });
      }
    },
    [getActiveDesiredChannels]
  );

  const socket = useNotifierSocket({
    enabled: isAuthenticated,
    onConnected: handleConnected,
    onEvent: handleEvent,
    onSubscribed: handleSubscribed,
  });

  const notifications = useMemo(
    () =>
      (notificationsPreviewQuery.data?.items ?? []).map(
        mapNotificationItemToUserNotification
      ),
    [notificationsPreviewQuery.data?.items]
  );

  const isNotificationsEnabled =
    !isNotificationsNotFoundError(notificationsSummaryQuery.error) &&
    !isNotificationsNotFoundError(notificationsPreviewQuery.error);
  const isNotificationsLoading =
    notificationsSummaryQuery.isLoading || notificationsPreviewQuery.isLoading;
  const unreadNotificationsCount =
    notificationsSummaryQuery.data?.unread_count ?? 0;

  sendSubscribeFrameRef.current = (channels: string[]) => {
    if (!channels.length) {
      return false;
    }

    const frame: NotifierSubscribeFrame = {
      type: NotifierClientFrameType.Subscribe,
      channels,
    };

    return socket.sendFrame(frame);
  };

  sendUnsubscribeFrameRef.current = (channels: string[]) => {
    if (!channels.length) {
      return false;
    }

    const frame: NotifierUnsubscribeFrame = {
      type: NotifierClientFrameType.Unsubscribe,
      channels,
    };

    return socket.sendFrame(frame);
  };

  const contextValue = useMemo<NotificationsContextType>(
    () => ({
      notifications,
      isNotificationsEnabled,
      isNotificationsLoading,
      readAllNotification,
      refetchNotifications,
      registerChannelHandler,
      status: socket.status,
      subscribe,
      unsubscribe,
      unreadNotificationsCount,
      wallet: socket.wallet,
    }),
    [
      isNotificationsEnabled,
      isNotificationsLoading,
      notifications,
      readAllNotification,
      refetchNotifications,
      registerChannelHandler,
      socket.status,
      socket.wallet,
      subscribe,
      unsubscribe,
      unreadNotificationsCount,
    ]
  );

  return (
    <notificationsContext.Provider value={contextValue}>
      {children}
    </notificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(notificationsContext);

  if (!context) {
    throw new Error(
      "Notifications context should be used within NotificationsProvider"
    );
  }

  return context;
};

export default NotificationsProvider;
