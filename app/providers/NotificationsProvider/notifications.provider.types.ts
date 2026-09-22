import type {
  NotifierChannelType,
  NotifierConnectionStatusType,
  NotifierEventFrame,
  UserNotification,
} from "~/providers/NotificationsProvider/notifications.types";

export type NotifierChannelHandler = (
  frame: NotifierEventFrame,
  wallet: string
) => void;

export type NotificationsContextType = {
  notifications: UserNotification[];
  isNotificationsEnabled: boolean;
  isNotificationsLoading: boolean;
  refetchNotifications: () => Promise<void>;
  unreadNotificationsCount: number;
  registerChannelHandler: (
    channel: NotifierChannelType,
    handler: NotifierChannelHandler
  ) => () => void;
  status: NotifierConnectionStatusType;
  subscribe: (channel: NotifierChannelType) => void;
  unsubscribe: (channel: NotifierChannelType) => void;
  wallet: string | null;
};
