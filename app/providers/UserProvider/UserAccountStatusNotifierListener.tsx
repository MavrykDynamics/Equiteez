import { useCallback } from "react";

import { useUserContext } from "~/providers/UserProvider/user.provider";
import {
  NotifierChannel,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";

export const UserAccountStatusNotifierListener = () => {
  const { refetchUserAccountStatus } = useUserContext();

  const handleKycSetMember = useCallback(() => {
    void refetchUserAccountStatus();
  }, [refetchUserAccountStatus]);

  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.KycSetMember,
    handleKycSetMember
  );

  return null;
};
