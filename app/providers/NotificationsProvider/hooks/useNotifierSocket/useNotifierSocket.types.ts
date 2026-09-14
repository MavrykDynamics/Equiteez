import type {
  NotifierConnectionStatusType,
  NotifierEventFrame,
} from "~/providers/NotificationsProvider/notifications.types";

export type UseNotifierSocketParams = {
  enabled: boolean;
  onEvent: (frame: NotifierEventFrame, wallet: string) => void;
  onStatus?: (status: NotifierConnectionStatusType) => void;
  webSocketFactory?: (url: string) => WebSocket;
};

export type UseNotifierSocketResult = {
  status: NotifierConnectionStatusType;
  wallet: string | null;
};

export type ConnectOptions = {
  force?: boolean;
  nextStatus?: NotifierConnectionStatusType;
};
