import { NotifierLaunchEvent } from "~/providers/NotificationsProvider/notifications.const";
import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import { getLaunchesNotificationMessage } from "~/providers/NotificationsProvider/helpers/messages/launches.messages";
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
    case NotifierLaunchEvent.LaunchpadSaleStarted:
      return getLaunchesNotificationMessage(frame);
    default:
      return null;
  }
};
