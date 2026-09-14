import { useCallback, useEffect, useRef, useState } from "react";

import { AuthService } from "~/providers/AuthProvider/helpers/auth.service";
import { getAuthTokensFromStorage } from "~/providers/AuthProvider/helpers/storage";
import {
  AUTH_LOGOUT_EVENT,
  subscribeToAuthSyncEvents,
} from "~/providers/AuthProvider/helpers/auth-sync.helpers";
import {
  NotifierClientFrameType,
  NotifierConnectionStatus,
  NotifierServerFrameType,
  SEEN_EVENT_IDS_LIMIT,
} from "~/providers/NotificationsProvider/notifications.const";
import type {
  NotifierAuthFrame,
  NotifierConnectionStatusType,
  NotifierEventFrame,
  NotifierServerFrame,
} from "~/providers/NotificationsProvider/notifications.types";
import {
  getNotifierJwtWalletAddress,
  isNotifierAccessTokenExpired,
} from "~/providers/NotificationsProvider/helpers/notifier.jwt";
import { resolveNotifierUrl } from "~/providers/NotificationsProvider/helpers/notifier.url";

type UseNotifierSocketParams = {
  enabled: boolean;
  onEvent: (frame: NotifierEventFrame, wallet: string) => void;
  onStatus?: (status: NotifierConnectionStatusType) => void;
  webSocketFactory?: (url: string) => WebSocket;
};

type UseNotifierSocketResult = {
  status: NotifierConnectionStatusType;
  wallet: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseNotifierServerFrame = (
  data: unknown
): NotifierServerFrame | null => {
  if (typeof data !== "string") {
    return null;
  }

  try {
    const frame = JSON.parse(data);

    if (!isRecord(frame) || typeof frame.type !== "string") {
      return null;
    }

    return frame as NotifierServerFrame;
  } catch {
    return null;
  }
};

export const useNotifierSocket = ({
  enabled,
  onEvent,
  onStatus,
  webSocketFactory,
}: UseNotifierSocketParams): UseNotifierSocketResult => {
  const [status, setStatus] = useState<NotifierConnectionStatusType>(
    NotifierConnectionStatus.Idle
  );
  const [wallet, setWallet] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const walletRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const seenEventIdQueueRef = useRef<string[]>([]);
  const onEventRef = useRef(onEvent);
  const onStatusRef = useRef(onStatus);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  const updateStatus = useCallback(
    (nextStatus: NotifierConnectionStatusType) => {
      setStatus(nextStatus);
      onStatusRef.current?.(nextStatus);
    },
    []
  );

  const closeSocket = useCallback(() => {
    generationRef.current += 1;
    socketRef.current?.close();
    socketRef.current = null;
    walletRef.current = null;
    setWallet(null);
    updateStatus(NotifierConnectionStatus.Closed);
  }, [updateStatus]);

  const rememberEventId = useCallback((eventId: string) => {
    const seenEventIds = seenEventIdsRef.current;

    if (seenEventIds.has(eventId)) {
      return false;
    }

    seenEventIds.add(eventId);
    seenEventIdQueueRef.current.push(eventId);

    while (seenEventIdQueueRef.current.length > SEEN_EVENT_IDS_LIMIT) {
      const oldestEventId = seenEventIdQueueRef.current.shift();

      if (oldestEventId) {
        seenEventIds.delete(oldestEventId);
      }
    }

    return true;
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      closeSocket();
      return;
    }

    let isDisposed = false;
    const generation = generationRef.current + 1;
    generationRef.current = generation;

    const isCurrentGeneration = () =>
      !isDisposed && generationRef.current === generation;

    const connect = async () => {
      const notifierUrl = resolveNotifierUrl();

      if (!notifierUrl) {
        updateStatus(NotifierConnectionStatus.Closed);
        return;
      }

      updateStatus(NotifierConnectionStatus.Connecting);

      try {
        const { accessToken: storedAccessToken } =
          await getAuthTokensFromStorage();
        const accessToken = isNotifierAccessTokenExpired(storedAccessToken)
          ? await AuthService.refreshAccessToken()
          : storedAccessToken;

        if (!accessToken || !isCurrentGeneration()) {
          updateStatus(NotifierConnectionStatus.Closed);
          return;
        }

        const socket = webSocketFactory
          ? webSocketFactory(notifierUrl)
          : new WebSocket(notifierUrl);

        socketRef.current = socket;

        socket.onopen = () => {
          if (!isCurrentGeneration()) {
            socket.close();
            return;
          }

          updateStatus(NotifierConnectionStatus.Authenticating);

          const authFrame: NotifierAuthFrame = {
            type: NotifierClientFrameType.Auth,
            token: accessToken,
          };

          socket.send(JSON.stringify(authFrame));
        };

        socket.onmessage = (event) => {
          if (!isCurrentGeneration()) {
            return;
          }

          const frame = parseNotifierServerFrame(event.data);

          if (!frame) {
            console.warn("Notifier received an invalid frame");
            return;
          }

          switch (frame.type) {
            case NotifierServerFrameType.AuthOk: {
              const confirmedWallet =
                frame.wallet || getNotifierJwtWalletAddress(accessToken);

              walletRef.current = confirmedWallet;
              setWallet(confirmedWallet);
              updateStatus(NotifierConnectionStatus.Connected);
              return;
            }
            case NotifierServerFrameType.Event: {
              const confirmedWallet = walletRef.current;

              if (!confirmedWallet || !rememberEventId(frame.event_id)) {
                return;
              }

              onEventRef.current(frame, confirmedWallet);
              return;
            }
            case NotifierServerFrameType.Error:
              console.warn("Notifier error", {
                code: frame.code,
                message: frame.message,
              });
              return;
            case NotifierServerFrameType.Subscribed:
            case NotifierServerFrameType.Pong:
              return;
            default:
              return;
          }
        };

        socket.onerror = () => {
          if (isCurrentGeneration()) {
            updateStatus(NotifierConnectionStatus.Error);
          }
        };

        socket.onclose = () => {
          if (isCurrentGeneration()) {
            socketRef.current = null;
            walletRef.current = null;
            setWallet(null);
            updateStatus(NotifierConnectionStatus.Closed);
          }
        };
      } catch {
        if (isCurrentGeneration()) {
          socketRef.current = null;
          walletRef.current = null;
          setWallet(null);
          updateStatus(NotifierConnectionStatus.Error);
        }
      }
    };

    void connect();

    return () => {
      isDisposed = true;
      socketRef.current?.close();
      socketRef.current = null;
      walletRef.current = null;
    };
  }, [closeSocket, enabled, rememberEventId, updateStatus, webSocketFactory]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    return subscribeToAuthSyncEvents((type) => {
      if (type === AUTH_LOGOUT_EVENT) {
        closeSocket();
      }
    });
  }, [closeSocket]);

  return {
    status,
    wallet,
  };
};
