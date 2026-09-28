import { z } from "zod";
import {
  RECONNECT_BASE_DELAY_MS,
  RECONNECT_MAX_DELAY_MS,
} from "~/providers/NotificationsProvider/notifications.const";
import type { NotifierServerFrame } from "~/providers/NotificationsProvider/notifications.types";
import {
  SOCKET_CLOSED,
  SOCKET_CLOSING,
  SOCKET_CONNECTING,
  SOCKET_OPEN,
} from "~/providers/NotificationsProvider/hooks/useNotifierSocket/useNotifierSocket.const";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

export const isSocketAlive = (socket: WebSocket | null) =>
  Boolean(
    socket &&
      (socket.readyState === SOCKET_CONNECTING ||
        socket.readyState === SOCKET_OPEN)
  );

export const isSocketDead = (socket: WebSocket | null) =>
  !socket ||
  socket.readyState === SOCKET_CLOSING ||
  socket.readyState === SOCKET_CLOSED;

export const getReconnectDelay = (attempt: number) =>
  Math.random() *
  Math.min(RECONNECT_MAX_DELAY_MS, RECONNECT_BASE_DELAY_MS * 2 ** attempt);

const nonEmptyString = z.string().min(1);
const serverFrameSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("auth_ok"), wallet: nonEmptyString }),
  z.object({
    type: z.literal("subscribed"),
    channels: z.array(nonEmptyString).optional(),
  }),
  z.object({
    type: z.literal("event"),
    event_id: nonEmptyString,
    event_type: nonEmptyString,
    occurred_at: z.string().datetime({ offset: true }),
    channel: nonEmptyString,
    payload: z.record(z.unknown()).optional(),
  }),
  z.object({
    type: z.literal("error"),
    code: nonEmptyString,
    message: z.string(),
  }),
  z.object({ type: z.literal("pong") }),
]);

export const parseNotifierServerFrame = (
  data: unknown
): NotifierServerFrame | null => {
  if (typeof data !== "string") return null;
  try {
    const result = serverFrameSchema.safeParse(JSON.parse(data));
    return result.success ? (result.data as NotifierServerFrame) : null;
  } catch {
    return null;
  }
};
