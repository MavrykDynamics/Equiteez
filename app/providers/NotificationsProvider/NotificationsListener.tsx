import { useCallback } from "react";

import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { NotifierChannel } from "~/providers/NotificationsProvider/notifications.const";
import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import { getNotificationMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.messages";
import type { NotifierToastMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.message.types";
import { useNotifierChannel } from "~/providers/NotificationsProvider/hooks/useNotifierChannel";

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

export const NotificationsListener = () => {
  const toaster = useToasterContext();

  const handleNotificationEvent = useCallback(
    (frame: NotifierEventFrame, wallet: string) => {
      const notification = getNotificationMessage(frame, wallet);

      if (!notification) {
        return;
      }

      showNotificationToast(toaster, notification);
    },
    [toaster]
  );

  useNotifierChannel(NotifierChannel.Wallet, handleNotificationEvent);
  useNotifierChannel(NotifierChannel.Catalog, handleNotificationEvent);

  return null;
};

export default NotificationsListener;
