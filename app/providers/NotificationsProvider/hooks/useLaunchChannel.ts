import { useCallback } from "react";

import { NotifierLaunchEvent } from "~/providers/NotificationsProvider/notifications.const";
import type {
  NotifierEventFrame,
  NotifierLaunchChannel,
} from "~/providers/NotificationsProvider/notifications.types";
import { getNotificationMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.messages";
import type { NotifierToastMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.message.types";
import { useNotifierChannel } from "~/providers/NotificationsProvider/hooks/useNotifierChannel";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";

export type LaunchChannelHandlers = {
  onProgress?: (frame: NotifierEventFrame, wallet: string) => void;
  onStartingSoon?: (frame: NotifierEventFrame, wallet: string) => void;
  onStarted?: (frame: NotifierEventFrame, wallet: string) => void;
};

const showNotificationToast = (
  toaster: ReturnType<typeof useToasterContext>,
  notification: NotifierToastMessage
) => {
  switch (notification.tone) {
    case "success":
      toaster.success(notification.title, notification.message);
      return;
    case "warning":
      toaster.warning(notification.title, notification.message);
      return;
    case "info":
      toaster.info(notification.title, notification.message);
      return;
  }
};

export const getLaunchChannel = (
  launchpadAddress: string | null,
  launchName: string | null
): NotifierLaunchChannel | null => {
  if (!launchpadAddress || !launchName) {
    return null;
  }

  return `launch:${launchpadAddress}/${launchName}`;
};

export const useLaunchChannel = (
  launchpadAddress: string | null,
  launchName: string | null,
  { onProgress, onStartingSoon, onStarted }: LaunchChannelHandlers = {}
) => {
  const toaster = useToasterContext();
  const channel = getLaunchChannel(launchpadAddress, launchName);

  const handleLaunchEvent = useCallback(
    (frame: NotifierEventFrame, wallet: string) => {
      const notification = getNotificationMessage(frame);

      if (notification) {
        showNotificationToast(toaster, notification);
      }

      switch (frame.event_type) {
        case NotifierLaunchEvent.LaunchpadLaunchUpdated:
          onProgress?.(frame, wallet);
          return;
        case NotifierLaunchEvent.LaunchpadSaleStartingSoon:
          onStartingSoon?.(frame, wallet);
          return;
        case NotifierLaunchEvent.LaunchpadSaleStarted:
          onStarted?.(frame, wallet);
          return;
      }
    },
    [onProgress, onStarted, onStartingSoon, toaster]
  );

  useNotifierChannel(channel, handleLaunchEvent);
};
