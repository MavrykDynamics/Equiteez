import { NotificationsDataNotifierListener } from "~/providers/NotificationsProvider/listeners/NotificationsDataNotifierListener";
import { NotificationsListener } from "~/providers/NotificationsProvider/listeners/NotificationsListener";
import { UserAccountStatusNotifierListener } from "~/providers/NotificationsProvider/listeners/UserAccountStatusNotifierListener";

export const NotificationsProviderListeners = () => (
  <>
    <NotificationsListener />
    <NotificationsDataNotifierListener />
    <UserAccountStatusNotifierListener />
  </>
);
