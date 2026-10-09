import { useCallback } from "react";

import { NotifierLaunchEvent } from "~/providers/NotificationsProvider/notifications.const";
import type {
  NotifierEventFrame,
  NotifierLaunchChannel,
} from "~/providers/NotificationsProvider/notifications.types";
import { useNotifierChannel } from "~/providers/NotificationsProvider/hooks/useNotifierChannel";

export type LaunchChannelHandlers = {
  onProgress?: (frame: NotifierEventFrame, wallet: string) => void;
  onStartingSoon?: (frame: NotifierEventFrame, wallet: string) => void;
  onStarted?: (frame: NotifierEventFrame, wallet: string) => void;
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
  const channel = getLaunchChannel(launchpadAddress, launchName);

  const handleLaunchEvent = useCallback(
    (frame: NotifierEventFrame, wallet: string) => {
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
    [onProgress, onStarted, onStartingSoon]
  );

  useNotifierChannel(channel, handleLaunchEvent);
};
