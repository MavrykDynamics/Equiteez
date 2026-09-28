import type {
  NotifierChannelType,
  NotifierConnectionStatusType,
  NotifierEventFrame,
  UserNotification,
} from "~/providers/NotificationsProvider/notifications.types";

export type NotifierChannelHandler = (
  frame: NotifierEventFrame,
  wallet: string
) => void | Promise<void>;

export type NotificationsContextType = {
  notifications: UserNotification[];
  isNotificationsEnabled: boolean;
  isNotificationsLoading: boolean;
  readAllNotification: (before: string) => Promise<void>;
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
