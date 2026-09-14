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

export const getWalletNotificationMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage | null => {
  switch (frame.event_type) {
    case NotifierWalletEvent.OrderbookOrderUpdated:
      return getOrderbookOrderUpdatedMessage(frame);
    default:
      return null;
  }
};
