import { NotifierLaunchEvent } from "~/providers/NotificationsProvider/notifications.const";
import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import type { NotifierToastMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.message.types";

export const getLaunchesNotificationMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage | null => {
  switch (frame.event_type) {
    case NotifierLaunchEvent.LaunchpadSaleStartingSoon:
      return {
        tone: "info",
        title: "Token sale starts soon",
        message: "A token sale starts soon.",
      };
    case NotifierLaunchEvent.LaunchpadSaleStarted:
      return {
        tone: "info",
        title: "Token sale has started",
        message: "A token sale has started.",
      };
    default:
      return null;
  }
};
