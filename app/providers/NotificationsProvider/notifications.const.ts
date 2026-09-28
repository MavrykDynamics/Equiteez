export const NOTIFIER_WS_PATH = "/ws";

export enum NotifierClientFrameType {
  Auth = "auth",
  Subscribe = "subscribe",
  Unsubscribe = "unsubscribe",
  Ping = "ping",
}

export enum NotifierServerFrameType {
  AuthOk = "auth_ok",
  Subscribed = "subscribed",
  Event = "event",
  Error = "error",
  Pong = "pong",
}

export enum NotifierErrorCode {
  Unauthorized = "unauthorized",
  BadFrame = "bad_frame",
  BadChannel = "bad_channel",
  Forbidden = "forbidden",
}

export enum NotifierConnectionStatus {
  Idle = "idle",
  Connecting = "connecting",
  Authenticating = "authenticating",
  Connected = "connected",
  Reconnecting = "reconnecting",
  Closed = "closed",
  Error = "error",
}

export enum NotifierChannel {
  Wallet = "wallet",
  Catalog = "catalog",
}

export enum NotifierWalletEvent {
  BridgeDepositUpdated = "BRIDGE_DEPOSIT_UPDATED",
  OrderbookOrderUpdated = "ORDERBOOK_ORDER_UPDATED",
  TokenLedgerTransfer = "TOKEN_LEDGER_TRANSFER",
  LaunchpadPurchase = "LAUNCHPAD_PURCHASE",
  LaunchpadTokensDistributed = "LAUNCHPAD_TOKENS_DISTRIBUTED",
  KycSetMember = "KYC_SET_MEMBER",
}

export enum NotifierLaunchEvent {
  LaunchpadLaunchUpdated = "LAUNCHPAD_LAUNCH_UPDATED",
  LaunchpadSaleStartingSoon = "LAUNCHPAD_SALE_STARTING_SOON",
  LaunchpadSaleStarted = "LAUNCHPAD_SALE_STARTED",
}

export enum NotifierCatalogEvent {
  TokenContractCreated = "TOKEN_CONTRACT_CREATED",
  OrderbookContractCreated = "ORDERBOOK_CONTRACT_CREATED",
  LaunchpadContractCreated = "LAUNCHPAD_CONTRACT_CREATED",
}

export enum NotifierAdminEvent {
  SuperAdminActionUpdated = "SUPER_ADMIN_ACTION_UPDATED",
  KycContractCreated = "KYC_CONTRACT_CREATED",
  SuperAdminCreated = "SUPER_ADMIN_CREATED",
}

export const NOTIFIER_CLOSE_GOING_AWAY = 1001;
export const NOTIFIER_CLOSE_UNAUTHORIZED = 4001;
export const NOTIFIER_CLOSE_BAD_FRAME = 4003;

export const RECONNECT_BASE_DELAY_MS = 1000;
export const RECONNECT_MAX_DELAY_MS = 30000;
export const SEEN_EVENT_IDS_LIMIT = 500;
export const MAX_NOTIFIER_SUBSCRIPTIONS = 50;
