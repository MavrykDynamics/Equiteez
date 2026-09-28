import BigNumberJs from "bignumber.js";

import type { NotificationItemType } from "~/lib/apis/rwa/notifications/notifications.types";
import { getTrimmedHash } from "~/lib/utils";
import type { UserNotification } from "~/providers/NotificationsProvider/notifications.types";
import notificationTextTemplates from "~/providers/NotificationsProvider/helpers/messages/notificationTextTemplates.json";

type NotificationTextTemplate = {
  tone: "success" | "info" | "warning";
  title: string;
  description: string;
  _comment?: string;
};

type NotificationTextSource = {
  kind: string;
  payload: Record<string, unknown>;
  occurred_at?: string;
  [field: string]: unknown;
};

const NOTIFICATION_TEXT_TEMPLATES = notificationTextTemplates as Record<
  string,
  NotificationTextTemplate
>;

const TEMPLATE_VARIABLE_REGEXP = /\{([a-z][a-z0-9_]*)\}/g;

const TOKEN_AMOUNT_FIELDS = new Set([
  "amount",
  "rwa_token_amount",
  "fulfilled_amount",
  "unfulfilled_amount",
]);

const QUOTE_AMOUNT_FIELDS = new Set([
  "price",
  "total",
  "total_paid_out",
  "price_per_rwa_token",
  "total_usd_value_of_rwa_token_amount",
]);

const HASH_FIELDS = new Set([
  "from",
  "to",
  "operation_hash",
  "token_address",
  "orderbook_address",
  "quote_token_address",
]);

const compactNumber = (value: BigNumberJs) =>
  value
    .toFixed()
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "");

export const formatNotificationAmount = (amount: string, decimals?: number) => {
  const value = new BigNumberJs(amount);

  if (!value.isFinite()) {
    return amount;
  }

  if (decimals === undefined || !Number.isInteger(decimals) || decimals < 0) {
    return compactNumber(value);
  }

  return compactNumber(value.div(new BigNumberJs(10).pow(decimals)));
};

const isValidDecimals = (decimals?: number) =>
  decimals !== undefined && Number.isInteger(decimals) && decimals >= 0;

const isMarketOrder = (orderType?: string) =>
  orderType?.toLowerCase().startsWith("market_") ?? false;

const isSellOrder = (orderType?: string) =>
  orderType?.toLowerCase().includes("sell") ?? false;

const getOrderActionSide = (orderType?: string) => {
  if (!orderType) {
    return undefined;
  }

  const normalizedOrderType = orderType.toLowerCase();

  if (normalizedOrderType.includes("buy")) {
    return "Buy";
  }

  if (normalizedOrderType.includes("sell")) {
    return "Sell";
  }

  return orderType;
};

export const getOrderSide = (orderType?: string) => {
  const side = getOrderActionSide(orderType);

  if (!side || side === orderType) {
    return side;
  }

  const normalizedOrderType = orderType?.toLowerCase();

  if (normalizedOrderType?.startsWith("market_")) {
    return `Market ${side}`;
  }

  if (normalizedOrderType?.startsWith("limit_")) {
    return `Limit ${side}`;
  }

  return side;
};

const getOrderSidePastTense = (orderType?: string) => {
  const side = getOrderActionSide(orderType);

  if (side === "Buy") {
    return "Bought";
  }

  if (side === "Sell") {
    return "Sold";
  }

  return side;
};

const getPayloadValue = (
  payload: Record<string, unknown>,
  field: string
): string | undefined => {
  const value = payload[field];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
};

const getPayloadNumber = (
  payload: Record<string, unknown>,
  field: string
): number | undefined => {
  const value = payload[field];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : undefined;
  }

  return undefined;
};

const getPayloadDecimals = (
  payload: Record<string, unknown>,
  field: string
) => {
  const decimals = getPayloadNumber(payload, field);

  return isValidDecimals(decimals) ? decimals : undefined;
};

const getFormattedMarketOrderPrice = (payload: Record<string, unknown>) => {
  const totalPaidOut = getPayloadValue(payload, "total_paid_out");
  const fulfilledAmount = getPayloadValue(payload, "fulfilled_amount");
  const quoteDecimals = getPayloadDecimals(payload, "quote_token_decimals");
  const tokenDecimals = getPayloadDecimals(payload, "token_decimals");

  if (
    !totalPaidOut ||
    !fulfilledAmount ||
    quoteDecimals === undefined ||
    tokenDecimals === undefined
  ) {
    return undefined;
  }

  const fulfilledAtoms = new BigNumberJs(fulfilledAmount);
  const paidAtoms = new BigNumberJs(totalPaidOut);

  if (
    !fulfilledAtoms.isFinite() ||
    fulfilledAtoms.isZero() ||
    !paidAtoms.isFinite()
  ) {
    return undefined;
  }

  const fulfilledTokens = fulfilledAtoms.div(
    new BigNumberJs(10).pow(tokenDecimals)
  );
  const paidQuote = paidAtoms.div(new BigNumberJs(10).pow(quoteDecimals));
  const price = paidQuote.div(fulfilledTokens);

  if (!price.isFinite()) {
    return undefined;
  }

  return compactNumber(
    price.decimalPlaces(quoteDecimals, BigNumberJs.ROUND_HALF_UP)
  );
};

const getFormattedOrderPrice = (payload: Record<string, unknown>) => {
  const orderType = getPayloadValue(payload, "order_type");

  if (isMarketOrder(orderType)) {
    return getFormattedMarketOrderPrice(payload);
  }

  const price = getPayloadValue(payload, "price_per_rwa_token");

  return price
    ? formatNotificationAmount(
        price,
        getPayloadDecimals(payload, "quote_token_decimals")
      )
    : undefined;
};

const getOrderPriceSegment = (payload: Record<string, unknown>) => {
  const orderType = getPayloadValue(payload, "order_type");

  if (isMarketOrder(orderType)) {
    const marketOrderPrice = getFormattedMarketOrderPrice(payload);
    const quoteTokenSymbol = getPayloadValue(payload, "quote_token_symbol");

    return marketOrderPrice && quoteTokenSymbol
      ? ` at ${marketOrderPrice} ${quoteTokenSymbol}`
      : "";
  }

  const orderPrice = getFormattedOrderPrice(payload);
  const quoteTokenSymbol = getPayloadValue(payload, "quote_token_symbol");

  return orderPrice && quoteTokenSymbol
    ? ` at ${orderPrice} ${quoteTokenSymbol}`
    : undefined;
};

const getEscrowAmount = (payload: Record<string, unknown>) => {
  const orderType = getPayloadValue(payload, "order_type");

  if (isSellOrder(orderType)) {
    const rwaTokenAmount = getPayloadValue(payload, "rwa_token_amount");

    return rwaTokenAmount
      ? formatNotificationAmount(
          rwaTokenAmount,
          getPayloadDecimals(payload, "token_decimals")
        )
      : undefined;
  }

  const totalUsdValue = getPayloadValue(
    payload,
    "total_usd_value_of_rwa_token_amount"
  );

  return totalUsdValue
    ? formatNotificationAmount(
        totalUsdValue,
        getPayloadDecimals(payload, "quote_token_decimals")
      )
    : undefined;
};

const getOrderTokenSymbol = (
  payload: Record<string, unknown>,
  orderType?: string
) =>
  getPayloadValue(
    payload,
    isSellOrder(orderType) ? "token_symbol" : "quote_token_symbol"
  );

const getNotificationDescription = (notification: NotificationTextSource) =>
  notification.kind.split("_").join(" ");

const formatTemplateValue = (
  variableName: string,
  rawValue: string,
  payload: Record<string, unknown>
) => {
  if (variableName === "order_type") {
    return getOrderSide(rawValue);
  }

  if (variableName === "order_type_past_tense") {
    return getOrderSidePastTense(rawValue);
  }

  if (variableName === "price_per_rwa_token") {
    return getFormattedOrderPrice(payload);
  }

  if (variableName === "refunded_amount") {
    const orderType = getPayloadValue(payload, "order_type");

    return formatNotificationAmount(
      rawValue,
      getPayloadDecimals(
        payload,
        isSellOrder(orderType) ? "token_decimals" : "quote_token_decimals"
      )
    );
  }

  if (TOKEN_AMOUNT_FIELDS.has(variableName)) {
    return formatNotificationAmount(
      rawValue,
      getPayloadDecimals(payload, "token_decimals")
    );
  }

  if (QUOTE_AMOUNT_FIELDS.has(variableName)) {
    return formatNotificationAmount(
      rawValue,
      getPayloadDecimals(payload, "quote_token_decimals")
    );
  }

  if (HASH_FIELDS.has(variableName)) {
    return getTrimmedHash(rawValue);
  }

  return rawValue;
};

const getNotificationVariableValue = (
  notification: NotificationTextSource,
  variableName: string
) => {
  const orderType = getPayloadValue(notification.payload, "order_type");

  if (variableName === "order_type_past_tense") {
    return getOrderSidePastTense(orderType);
  }

  if (variableName === "order_price_segment") {
    return getOrderPriceSegment(notification.payload);
  }

  if (variableName === "escrow_amount") {
    return getEscrowAmount(notification.payload);
  }

  if (variableName === "escrow_symbol") {
    return getOrderTokenSymbol(notification.payload, orderType);
  }

  if (variableName === "refunded_symbol") {
    return getOrderTokenSymbol(notification.payload, orderType);
  }

  const payloadValue = getPayloadValue(notification.payload, variableName);

  if (payloadValue !== undefined) {
    return formatTemplateValue(
      variableName,
      payloadValue,
      notification.payload
    );
  }

  const notificationValue = notification[variableName];

  return typeof notificationValue === "string" ? notificationValue : undefined;
};

export const fillNotificationTextTemplate = (
  template: string,
  notification: NotificationTextSource
) => {
  const missingVariables: string[] = [];
  const text = template.replace(
    TEMPLATE_VARIABLE_REGEXP,
    (match, variableName: string) => {
      const value = getNotificationVariableValue(notification, variableName);

      if (value === undefined) {
        missingVariables.push(variableName);

        return match;
      }

      return value;
    }
  );

  return missingVariables.length ? null : text;
};

export const resolveNotificationText = (
  notification: NotificationTextSource
) => {
  const template = NOTIFICATION_TEXT_TEMPLATES[notification.kind];

  if (!template) {
    return {
      tone: "info" as const,
      title: notification.kind,
      description:
        getNotificationDescription(notification) || notification.kind,
    };
  }

  const title = fillNotificationTextTemplate(template.title, notification);
  const description =
    template.description &&
    fillNotificationTextTemplate(template.description, notification);

  return {
    tone: template.tone,
    title: title || notification.kind.split("_").join(" "),
    description:
      description ||
      getNotificationDescription(notification) ||
      notification.kind,
  };
};

export const mapNotificationItemToUserNotification = (
  notification: NotificationItemType
): UserNotification => {
  const text = resolveNotificationText(notification);

  return {
    id: notification.id,
    title: text.title,
    description: text.description,
    date: notification.occurred_at,
    createdAt: notification.created_at,
    isRead: Boolean(notification.read_at),
    kind: notification.kind,
  };
};
