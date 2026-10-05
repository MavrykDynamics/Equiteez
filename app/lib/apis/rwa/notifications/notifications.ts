import { rwaApi } from "~/lib/apis/rwa/client";
import {
  NotificationsReadSchema,
  NotificationsSchema,
  NotificationsSummarySchema,
} from "~/lib/apis/rwa/notifications/notifications.schema";
import {
  FetchWalletNotificationsParams,
  FetchWalletNotificationsSummaryParams,
  NotificationsReadResponseType,
  NotificationsResponseType,
  NotificationsSummaryResponseType,
  ReadWalletNotificationsParams,
} from "~/lib/apis/rwa/notifications/notifications.types";

export const fetchWalletNotifications = async ({
  walletAddress,
  limit,
  cursor,
  kinds,
  unread,
  includeSuperseded,
}: FetchWalletNotificationsParams): Promise<NotificationsResponseType> => {
  const query = new URLSearchParams();

  if (limit !== undefined) {
    query.set("limit", String(limit));
  }

  if (cursor) {
    query.set("cursor", cursor);
  }

  kinds?.forEach((kind) => {
    query.append("kinds", kind);
  });

  if (unread) {
    query.set("unread", "1");
  }

  if (includeSuperseded) {
    query.set("include_superseded", "1");
  }

  const queryString = query.toString();
  const { data } = await rwaApi.get(
    `/wallets/${walletAddress}/notifications${
      queryString ? `?${queryString}` : ""
    }`
  );

  return NotificationsSchema.parse(data);
};

export const fetchWalletNotificationsSummary = async ({
  walletAddress,
}: FetchWalletNotificationsSummaryParams): Promise<NotificationsSummaryResponseType> => {
  const { data } = await rwaApi.get(
    `/wallets/${walletAddress}/notifications/summary`
  );

  return NotificationsSummarySchema.parse(data);
};

export const readWalletNotifications = async ({
  walletAddress,
  ids,
  before,
}: ReadWalletNotificationsParams): Promise<NotificationsReadResponseType> => {
  const body =
    ids !== undefined
      ? {
          ids,
        }
      : {
          before,
        };

  const { data } = await rwaApi.post(
    `/wallets/${walletAddress}/notifications/read`,
    body
  );

  return NotificationsReadSchema.parse(data);
};
