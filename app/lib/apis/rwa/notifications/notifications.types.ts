import { z } from "zod";

import {
  NotificationItemSchema,
  NotificationsReadSchema,
  NotificationsSchema,
  NotificationsSummarySchema,
} from "~/lib/apis/rwa/notifications/notifications.schema";

export type NotificationItemType = z.infer<typeof NotificationItemSchema>;
export type NotificationsResponseType = z.infer<typeof NotificationsSchema>;
export type NotificationsSummaryResponseType = z.infer<
  typeof NotificationsSummarySchema
>;
export type NotificationsReadResponseType = z.infer<
  typeof NotificationsReadSchema
>;

export type FetchWalletNotificationsParams = {
  walletAddress: string;
  limit?: number;
  cursor?: string;
  kinds?: string[];
  unread?: boolean;
  includeSuperseded?: boolean;
};

export type FetchWalletNotificationsSummaryParams = {
  walletAddress: string;
};

export type ReadWalletNotificationsParams = { walletAddress: string } & (
  | {
      ids: string[];
      before?: never;
    }
  | {
      ids?: never;
      before: string;
    }
);
