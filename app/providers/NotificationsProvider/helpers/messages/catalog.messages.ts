import { NotifierCatalogEvent } from "~/providers/NotificationsProvider/notifications.const";
import type { NotifierEventFrame } from "~/providers/NotificationsProvider/notifications.types";
import type { NotifierToastMessage } from "~/providers/NotificationsProvider/helpers/messages/notifications.message.types";

const getBooleanPayloadField = (
  payload: Record<string, unknown>,
  field: string
) => {
  const value = payload[field];

  return typeof value === "boolean" ? value : null;
};

const getTokenContractCreatedMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage | null => {
  const inAllowlist = getBooleanPayloadField(
    frame.payload ?? {},
    "in_allowlist"
  );

  if (inAllowlist !== true) {
    return null;
  }

  return {
    tone: "info",
    title: "New asset listed",
    message: "A new asset is now available in the marketplace.",
  };
};

const getOrderbookContractCreatedMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage | null => {
  const inAllowlist = getBooleanPayloadField(
    frame.payload ?? {},
    "in_allowlist"
  );

  if (inAllowlist !== true) {
    return null;
  }

  return {
    tone: "info",
    title: "New market listed",
    message: "A new orderbook market is now available.",
  };
};

const getLaunchpadContractCreatedMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage | null => {
  const inAllowlist = getBooleanPayloadField(
    frame.payload ?? {},
    "in_allowlist"
  );

  if (inAllowlist !== true) {
    return null;
  }

  return {
    tone: "info",
    title: "New launchpad listed",
    message: "A new launchpad sale is now available.",
  };
};

export const getCatalogNotificationMessage = (
  frame: NotifierEventFrame
): NotifierToastMessage | null => {
  switch (frame.event_type) {
    case NotifierCatalogEvent.TokenContractCreated:
      return getTokenContractCreatedMessage(frame);
    case NotifierCatalogEvent.OrderbookContractCreated:
      return getOrderbookContractCreatedMessage(frame);
    case NotifierCatalogEvent.LaunchpadContractCreated:
      return getLaunchpadContractCreatedMessage(frame);
    default:
      return null;
  }
};
