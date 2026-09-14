import { useCallback } from "react";
import type {
  NotifierChannelType,
  NotifierEventType,
} from "~/providers/NotificationsProvider/notifications.types";
import type { NotifierChannelHandler } from "~/providers/NotificationsProvider/notifications.provider.types";
import { useNotifierChannel } from "~/providers/NotificationsProvider/hooks/useNotifierChannel";

export function useNotifierEvent(
  channel: NotifierChannelType | null,
  eventType: NotifierEventType | null,
  handler: NotifierChannelHandler
) {
  const handleChannelEvent = useCallback<NotifierChannelHandler>(
    (frame, wallet) => {
      if (!eventType || frame.event_type !== eventType) {
        return;
      }

      handler(frame, wallet);
    },
    [eventType, handler]
  );

  useNotifierChannel(channel, handleChannelEvent);
}
