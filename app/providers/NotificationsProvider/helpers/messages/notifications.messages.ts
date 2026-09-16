import { NotifierChannel } from "~/providers/NotificationsProvider/notifications.const";
import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import { getCatalogNotificationMessage } from "~/providers/NotificationsProvider/helpers/messages/catalog.messages";
import { getLaunchNotificationMessage } from "~/providers/NotificationsProvider/helpers/messages/launch.messages";
import { getWalletNotificationMessage } from "~/providers/NotificationsProvider/helpers/messages/wallet.messages";
import type { NotifierToastMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.message.types";

export type {
  NotifierToastMessage,
  NotifierToastTone,
} from "~/providers/NotificationsProvider/helpers/messages/notifications.message.types";

const isLaunchChannel = (channel: string) => channel.startsWith("launch:");

export const getNotificationMessage = (
  frame: NotifierEventFrame,
  wallet?: string
): NotifierToastMessage | null => {
  if (isLaunchChannel(frame.channel)) {
    return getLaunchNotificationMessage(frame);
  }

  switch (frame.channel) {
    case NotifierChannel.Wallet:
      return getWalletNotificationMessage(frame, wallet);
    case NotifierChannel.Catalog:
      return getCatalogNotificationMessage(frame);
    default:
      return null;
  }
};
