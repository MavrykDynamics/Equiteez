import type {
  NotifierClientFrame,
  NotifierConnectionStatusType,
  NotifierEventFrame,
  NotifierSubscribedFrame,
} from "~/providers/NotificationsProvider/notifications.types";

export type UseNotifierSocketParams = {
  enabled: boolean;
  onEvent: (frame: NotifierEventFrame, wallet: string) => void;
  onConnected?: (wallet: string) => void;
  onSubscribed?: (frame: NotifierSubscribedFrame) => void;
  onStatus?: (status: NotifierConnectionStatusType) => void;
  webSocketFactory?: (url: string) => WebSocket;
};

export type UseNotifierSocketResult = {
  status: NotifierConnectionStatusType;
  wallet: string | null;
  sendFrame: (frame: NotifierClientFrame) => boolean;
};

export type ConnectOptions = {
  force?: boolean;
  nextStatus?: NotifierConnectionStatusType;
};
