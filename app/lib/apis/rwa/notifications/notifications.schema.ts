import { z } from "zod";

export const NotificationItemSchema = z.object({
  id: z.string(),
  event_id: z.string().nullable(),
  event_type: z.string(),
  kind: z.string(),
  entity_key: z.string(),
  payload: z.record(z.unknown()),
  occurred_at: z.string(),
  created_at: z.string(),
  read_at: z.string().nullable(),
  superseded_at: z.string().nullable(),
});

export const NotificationsSchema = z.object({
  items: z.array(NotificationItemSchema),
  next_cursor: z.string().nullable(),
  unread_count: z.number(),
  unread_capped: z.boolean(),
});

export const NotificationsSummarySchema = z.object({
  unread_count: z.number(),
  unread_capped: z.boolean(),
  latest_created_at: z.string().nullable(),
});

export const NotificationsReadSchema = z.object({
  updated: z.number(),
  unread_count: z.number().optional(),
  unread_capped: z.boolean().optional(),
});
