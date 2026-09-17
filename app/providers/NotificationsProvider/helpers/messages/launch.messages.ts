import { NotifierLaunchEvent } from "~/providers/NotificationsProvider/notifications.const";
import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import type { NotifierToastMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.message.types";

const getStringPayloadField = (
  payload: Record<string, unknown>,
  field: string
) => {
  const value = payload[field];

  return typeof value === "string" && value.trim() ? value : null;
};

const getLaunchName = (frame: NotifierEventFrame) =>
  getStringPayloadField(frame.payload ?? {}, "launch_name");

export const getLaunchNotificationMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage | null => {
  const launchName = getLaunchName(frame);

  switch (frame.event_type) {
    case NotifierLaunchEvent.LaunchpadLaunchUpdated:
      return {
        tone: "info",
        title: "Launchpad sale updated",
        message: launchName
          ? `${launchName} sale progress was updated.`
          : "Launchpad sale progress was updated.",
      };
    case NotifierLaunchEvent.LaunchpadSaleStartingSoon:
      return {
        tone: "warning",
        title: "Launchpad sale starting soon",
        message: launchName
          ? `${launchName} sale is starting soon.`
          : "Launchpad sale is starting soon.",
      };
    case NotifierLaunchEvent.LaunchpadSaleStarted:
      return {
        tone: "success",
        title: "Launchpad sale started",
        message: launchName
          ? `${launchName} sale has started.`
          : "Launchpad sale has started.",
      };
    default:
      return null;
  }
};
