import { useCallback } from "react";

import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";
import { NotifierChannel } from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierChannel } from "~/providers/NotificationsProvider/hooks/useNotifierChannel";

export const NotificationsDataNotifierListener = () => {
  const { refetchNotifications } = useNotificationsContext();

  const handleWalletEvent = useCallback(() => {
    void refetchNotifications();
  }, [refetchNotifications]);

  useNotifierChannel(NotifierChannel.Wallet, handleWalletEvent);

  return null;
};
