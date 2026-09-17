import { NotifierWalletEvent } from "~/providers/NotificationsProvider/notifications.const";
import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import type { NotifierToastMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.message.types";

type OrderStatus =
  | "open"
  | "partial"
  | "fulfilled"
  | "canceled"
  | "expired"
  | "refunded";

const getStringPayloadField = (
  payload: Record<string, unknown>,
  field: string
) => {
  const value = payload[field];

  return typeof value === "string" && value.trim() ? value : null;
};

const getBooleanPayloadField = (
  payload: Record<string, unknown>,
  field: string
) => {
  const value = payload[field];

  return typeof value === "boolean" ? value : null;
};

const isOrderStatus = (value: string | null): value is OrderStatus =>
  value === "open" ||
  value === "partial" ||
  value === "fulfilled" ||
  value === "canceled" ||
  value === "expired" ||
  value === "refunded";

const getOrderStatusToastMessage = (
  status: OrderStatus
): NotifierToastMessage => {
  switch (status) {
    case "open":
      return {
        tone: "success",
        title: "Order opened",
        message: "Your order is now live.",
      };
    case "partial":
      return {
        tone: "info",
        title: "Order partially filled",
        message: "Part of your order has been matched.",
      };
    case "fulfilled":
      return {
        tone: "success",
        title: "Order fulfilled",
        message: "Your order has been fully matched.",
      };
    case "canceled":
      return {
        tone: "warning",
        title: "Order canceled",
        message: "Your order was canceled.",
      };
    case "expired":
      return {
        tone: "warning",
        title: "Order expired",
        message: "Your order expired. Any claimable funds will be refreshed.",
      };
    case "refunded":
      return {
        tone: "success",
        title: "Funds returned",
        message: "Funds from your order operation were returned.",
      };
  }
};

const getOrderbookOrderUpdatedMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage | null => {
  const status = getStringPayloadField(frame.payload ?? {}, "status");

  if (!isOrderStatus(status)) {
    return null;
  }

  return getOrderStatusToastMessage(status);
};

const areAddressesEqual = (left: string | null, right?: string) =>
  !!left && !!right && left.toLowerCase() === right.toLowerCase();

const getTokenLedgerTransferMessage = (
  frame: NotifierEventFrame,
  wallet?: string
): NotifierToastMessage => {
  const payload = frame.payload ?? {};
  const from = getStringPayloadField(payload, "from");
  const to = getStringPayloadField(payload, "to");
  const tokenSymbol = getStringPayloadField(payload, "token_symbol");

  if (areAddressesEqual(to, wallet)) {
    return {
      tone: "success",
      title: "Tokens received",
      message: tokenSymbol
        ? `${tokenSymbol} tokens were received in your wallet.`
        : "Tokens were received in your wallet.",
    };
  }

  if (areAddressesEqual(from, wallet)) {
    return {
      tone: "info",
      title: "Tokens sent",
      message: tokenSymbol
        ? `${tokenSymbol} tokens were sent from your wallet.`
        : "Tokens were sent from your wallet.",
    };
  }

  return {
    tone: "info",
    title: "Token transfer",
    message: "A token transfer related to your wallet was confirmed.",
  };
};

const getLaunchpadPurchaseMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage => {
  const launchName = getStringPayloadField(frame.payload ?? {}, "launch_name");

  return {
    tone: "success",
    title: "Launchpad purchase confirmed",
    message: launchName
      ? `Your ${launchName} purchase was confirmed.`
      : "Your launchpad purchase was confirmed.",
  };
};

const getLaunchpadTokensDistributedMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage => {
  const tokenSymbol = getStringPayloadField(
    frame.payload ?? {},
    "token_symbol"
  );

  return {
    tone: "success",
    title: "Launchpad tokens distributed",
    message: tokenSymbol
      ? `${tokenSymbol} tokens were distributed to your wallet.`
      : "Launchpad tokens were distributed to your wallet.",
  };
};

const getKycSetMemberMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage => {
  const frozen = getBooleanPayloadField(frame.payload ?? {}, "frozen");

  if (frozen === true) {
    return {
      tone: "warning",
      title: "KYC status changed",
      message: "Your KYC access is currently frozen.",
    };
  }

  return {
    tone: "info",
    title: "KYC status updated",
    message: "Your KYC status was updated.",
  };
};

export const getWalletNotificationMessage = (
  frame: NotifierEventFrame,
  wallet?: string
): NotifierToastMessage | null => {
  switch (frame.event_type) {
    case NotifierWalletEvent.OrderbookOrderUpdated:
      return getOrderbookOrderUpdatedMessage(frame);
    case NotifierWalletEvent.TokenLedgerTransfer:
      return getTokenLedgerTransferMessage(frame, wallet);
    case NotifierWalletEvent.LaunchpadPurchase:
      return getLaunchpadPurchaseMessage(frame);
    case NotifierWalletEvent.LaunchpadTokensDistributed:
      return getLaunchpadTokensDistributedMessage(frame);
    case NotifierWalletEvent.KycSetMember:
      return getKycSetMemberMessage(frame);
    default:
      return null;
  }
};
