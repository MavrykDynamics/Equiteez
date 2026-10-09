import { useCallback } from "react";

import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import {
  NotifierChannel,
  NotifierLaunchEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";

const getStringPayloadField = (
  payload: Record<string, unknown>,
  field: string
) => {
  const value = payload[field];

  return typeof value === "string" && value.trim() ? value : null;
};

export const LaunchAssetQueriesNotifierListener = () => {
  const { invalidateLaunchAssetQueries } = useAssetsContext();

  const handleSaleStarted = useCallback(
    (frame: NotifierEventFrame) => {
      const tokenAddress = getStringPayloadField(
        frame.payload ?? {},
        "token_address"
      );

      void invalidateLaunchAssetQueries(tokenAddress);
    },
    [invalidateLaunchAssetQueries]
  );

  useNotifierEvent(
    NotifierChannel.Launches,
    NotifierLaunchEvent.LaunchpadSaleStarted,
    handleSaleStarted
  );

  return null;
};
