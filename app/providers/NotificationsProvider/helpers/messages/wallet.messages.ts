import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import { resolveNotificationText } from "~/providers/NotificationsProvider/helpers/notifications.helpers";
import type { NotifierToastMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.message.types";

const getWalletNotificationKind = (frame: NotifierEventFrame) =>
  typeof frame.kind === "string" && frame.kind.trim() ? frame.kind : null;

export const getWalletNotificationMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage | null => {
  const kind = getWalletNotificationKind(frame);

  if (!kind) {
    return null;
  }

  const text = resolveNotificationText({
    kind,
    payload: frame.payload ?? {},
    occurred_at: frame.occurred_at,
  });

  return {
    tone: text.tone,
    title: text.title,
    message: text.description,
  };
};
