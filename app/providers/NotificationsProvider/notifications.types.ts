import {
  NotifierChannel,
  NotifierClientFrameType,
  NotifierCatalogEvent,
  NotifierConnectionStatus,
  NotifierErrorCode,
  NotifierServerFrameType,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";

export type NotifierChannelType = NotifierChannel;
export type NotifierConnectionStatusType = NotifierConnectionStatus;
export type NotifierWalletEventType = NotifierWalletEvent;
export type NotifierCatalogEventType = NotifierCatalogEvent;
export type NotifierEventType =
  | NotifierWalletEventType
  | NotifierCatalogEventType;

export type NotifierAuthFrame = {
  type: NotifierClientFrameType.Auth;
  token: string;
};

export type NotifierSubscribeFrame = {
  type: NotifierClientFrameType.Subscribe;
  channels: string[];
};

export type NotifierUnsubscribeFrame = {
  type: NotifierClientFrameType.Unsubscribe;
  channels: string[];
};

export type NotifierPingFrame = {
  type: NotifierClientFrameType.Ping;
};

export type NotifierClientFrame =
  | NotifierAuthFrame
  | NotifierSubscribeFrame
  | NotifierUnsubscribeFrame
  | NotifierPingFrame;

export type NotifierAuthOkFrame = {
  type: NotifierServerFrameType.AuthOk;
  wallet: string;
};

export type NotifierSubscribedFrame = {
  type: NotifierServerFrameType.Subscribed;
  channels?: string[];
};

export type NotifierEventFrame = {
  type: NotifierServerFrameType.Event;
  event_id: string;
  event_type: NotifierEventType | string;
  occurred_at: string;
  channel: string;
  payload?: Record<string, unknown>;
};

export type NotifierErrorFrame = {
  type: NotifierServerFrameType.Error;
  code: NotifierErrorCode | string;
  message: string;
};

export type NotifierPongFrame = {
  type: NotifierServerFrameType.Pong;
};

export type NotifierServerFrame =
  | NotifierAuthOkFrame
  | NotifierSubscribedFrame
  | NotifierEventFrame
  | NotifierErrorFrame
  | NotifierPongFrame;
