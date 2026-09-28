import { useEffect, useRef } from "react";

import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";
import type { NotifierChannelHandler } from "~/providers/NotificationsProvider/notifications.provider.types";
import type { NotifierChannelType } from "~/providers/NotificationsProvider/notifications.types";

export const useNotifierChannel = (
  channel: NotifierChannelType | null,
  handler: NotifierChannelHandler
) => {
  const { registerChannelHandler } = useNotificationsContext();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!channel) {
      return;
    }

    return registerChannelHandler(channel, (frame, wallet) => {
      return handlerRef.current(frame, wallet);
    });
  }, [channel, registerChannelHandler]);
};
