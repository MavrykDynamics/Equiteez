import { useCallback, useEffect, useRef, useState } from "react";

import { AuthService } from "~/providers/AuthProvider/helpers/auth.service";
import { getAuthTokensFromStorage } from "~/providers/AuthProvider/helpers/storage";
import {
  AUTH_LOGOUT_EVENT,
  AUTH_TOKENS_UPDATED_EVENT,
  subscribeToAuthSyncEvents,
} from "~/providers/AuthProvider/helpers/auth-sync.helpers";
import {
  NOTIFIER_CLOSE_BAD_FRAME,
  NOTIFIER_CLOSE_GOING_AWAY,
  NOTIFIER_CLOSE_UNAUTHORIZED,
  NotifierClientFrameType,
  NotifierConnectionStatus,
  NotifierServerFrameType,
  SEEN_EVENT_IDS_LIMIT,
} from "~/providers/NotificationsProvider/notifications.const";
import type {
  NotifierAuthFrame,
  NotifierClientFrame,
  NotifierConnectionStatusType,
} from "~/providers/NotificationsProvider/notifications.types";
import {
  getNotifierJwtWalletAddress,
  isNotifierAccessTokenExpired,
} from "~/providers/NotificationsProvider/helpers/notifier.jwt";
import { resolveNotifierUrl } from "~/providers/NotificationsProvider/helpers/notifier.url";
import {
  getReconnectDelay,
  isOnline,
  isSocketAlive,
  isSocketDead,
  parseNotifierServerFrame,
} from "~/providers/NotificationsProvider/hooks/useNotifierSocket/useNotifierSocket.helpers";
import { SOCKET_OPEN } from "~/providers/NotificationsProvider/hooks/useNotifierSocket/useNotifierSocket.const";
import type {
  ConnectOptions,
  UseNotifierSocketParams,
  UseNotifierSocketResult,
} from "~/providers/NotificationsProvider/hooks/useNotifierSocket/useNotifierSocket.types";

export const useNotifierSocket = ({
  enabled,
  onEvent,
  onConnected,
  onSubscribed,
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
  const onConnectedRef = useRef(onConnected);
  const onSubscribedRef = useRef(onSubscribed);
  const onStatusRef = useRef(onStatus);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reconnectAttemptRef = useRef(0);
  const consecutiveGoingAwayRef = useRef(0);
  const triedUnauthorizedRefreshRef = useRef(false);
  const waitsForTokenUpdateRef = useRef(false);
  const connectRef = useRef<((options?: ConnectOptions) => void) | null>(null);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    onConnectedRef.current = onConnected;
  }, [onConnected]);

  useEffect(() => {
    onSubscribedRef.current = onSubscribed;
  }, [onSubscribed]);

  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  const sendFrame = useCallback((frame: NotifierClientFrame) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== SOCKET_OPEN) {
      return false;
    }

    socket.send(JSON.stringify(frame));
    return true;
  }, []);

  const updateStatus = useCallback(
    (nextStatus: NotifierConnectionStatusType) => {
      setStatus(nextStatus);
      onStatusRef.current?.(nextStatus);
    },
    []
  );

  const clearReconnectTimer = useCallback(() => {
    if (!reconnectTimeoutRef.current) {
      return;
    }

    clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = null;
  }, []);

  const closeSocket = useCallback(() => {
    clearReconnectTimer();
    generationRef.current += 1;
    socketRef.current?.close();
    socketRef.current = null;
    walletRef.current = null;
    triedUnauthorizedRefreshRef.current = false;
    waitsForTokenUpdateRef.current = false;
    reconnectAttemptRef.current = 0;
    consecutiveGoingAwayRef.current = 0;
    setWallet(null);
    updateStatus(NotifierConnectionStatus.Closed);
  }, [clearReconnectTimer, updateStatus]);

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

    const connect = async ({
      force = false,
      nextStatus = NotifierConnectionStatus.Connecting,
    }: ConnectOptions = {}) => {
      if (isDisposed) {
        return;
      }

      clearReconnectTimer();

      if (!isOnline()) {
        updateStatus(NotifierConnectionStatus.Reconnecting);
        return;
      }

      if (!force && isSocketAlive(socketRef.current)) {
        return;
      }

      if (force && socketRef.current) {
        generationRef.current += 1;
        socketRef.current.close();
        socketRef.current = null;
        walletRef.current = null;
        setWallet(null);
      }

      const generation = generationRef.current + 1;
      generationRef.current = generation;

      const isCurrentGeneration = () =>
        !isDisposed && generationRef.current === generation;
      const notifierUrl = resolveNotifierUrl();

      if (!notifierUrl) {
        updateStatus(NotifierConnectionStatus.Closed);
        return;
      }

      updateStatus(nextStatus);

      try {
        const { accessToken: storedAccessToken } =
          await getAuthTokensFromStorage();
        const accessToken = isNotifierAccessTokenExpired(storedAccessToken)
          ? await AuthService.refreshAccessToken()
          : storedAccessToken;

        if (!isCurrentGeneration()) {
          return;
        }

        if (!accessToken) {
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

              if (!confirmedWallet) {
                console.warn("Notifier authenticated without wallet");
                socket.close();
                return;
              }

              reconnectAttemptRef.current = 0;
              consecutiveGoingAwayRef.current = 0;
              triedUnauthorizedRefreshRef.current = false;
              waitsForTokenUpdateRef.current = false;
              walletRef.current = confirmedWallet;
              setWallet(confirmedWallet);
              updateStatus(NotifierConnectionStatus.Connected);
              onConnectedRef.current?.(confirmedWallet);
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
              onSubscribedRef.current?.(frame);
              return;
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

        socket.onclose = (event) => {
          if (isCurrentGeneration()) {
            socketRef.current = null;
            walletRef.current = null;
            setWallet(null);
            scheduleReconnect(generation, event.code);
          }
        };
      } catch {
        if (isCurrentGeneration()) {
          socketRef.current = null;
          walletRef.current = null;
          setWallet(null);
          scheduleReconnect(generation);
        }
      }
    };

    const reconnectImmediately = () => {
      void connect({
        force: true,
        nextStatus: NotifierConnectionStatus.Reconnecting,
      });
    };

    const scheduleReconnect = async (
      generation: number,
      closeCode?: number
    ) => {
      if (isDisposed || generationRef.current !== generation) {
        return;
      }

      if (closeCode === NOTIFIER_CLOSE_BAD_FRAME) {
        updateStatus(NotifierConnectionStatus.Closed);
        return;
      }

      if (closeCode === NOTIFIER_CLOSE_UNAUTHORIZED) {
        if (triedUnauthorizedRefreshRef.current) {
          waitsForTokenUpdateRef.current = true;
          updateStatus(NotifierConnectionStatus.Closed);
          return;
        }

        triedUnauthorizedRefreshRef.current = true;
        updateStatus(NotifierConnectionStatus.Reconnecting);

        try {
          await AuthService.refreshAccessToken();
        } catch {
          if (!isDisposed && generationRef.current === generation) {
            updateStatus(NotifierConnectionStatus.Closed);
          }

          return;
        }

        if (!isDisposed && generationRef.current === generation) {
          reconnectImmediately();
        }

        return;
      }

      if (closeCode === NOTIFIER_CLOSE_GOING_AWAY) {
        consecutiveGoingAwayRef.current += 1;

        if (consecutiveGoingAwayRef.current === 1) {
          reconnectImmediately();
          return;
        }
      } else {
        consecutiveGoingAwayRef.current = 0;
      }

      if (!isOnline()) {
        updateStatus(NotifierConnectionStatus.Reconnecting);
        return;
      }

      updateStatus(NotifierConnectionStatus.Reconnecting);

      const delay = getReconnectDelay(reconnectAttemptRef.current);
      reconnectAttemptRef.current += 1;

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        void connect({
          force: true,
          nextStatus: NotifierConnectionStatus.Reconnecting,
        });
      }, delay);
    };

    connectRef.current = connect;
    void connect();

    return () => {
      isDisposed = true;
      clearReconnectTimer();
      connectRef.current = null;
      socketRef.current?.close();
      socketRef.current = null;
      walletRef.current = null;
    };
  }, [
    clearReconnectTimer,
    closeSocket,
    enabled,
    rememberEventId,
    updateStatus,
    webSocketFactory,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    return subscribeToAuthSyncEvents(async (type) => {
      if (type === AUTH_LOGOUT_EVENT) {
        closeSocket();
        return;
      }

      if (type !== AUTH_TOKENS_UPDATED_EVENT) {
        return;
      }

      const { accessToken } = await getAuthTokensFromStorage();
      const nextWallet = getNotifierJwtWalletAddress(accessToken);
      const currentWallet = walletRef.current;

      if (currentWallet && nextWallet && currentWallet !== nextWallet) {
        triedUnauthorizedRefreshRef.current = false;
        waitsForTokenUpdateRef.current = false;
        connectRef.current?.({
          force: true,
          nextStatus: NotifierConnectionStatus.Reconnecting,
        });
        return;
      }

      if (waitsForTokenUpdateRef.current || isSocketDead(socketRef.current)) {
        triedUnauthorizedRefreshRef.current = false;
        waitsForTokenUpdateRef.current = false;
        connectRef.current?.({
          force: true,
          nextStatus: NotifierConnectionStatus.Reconnecting,
        });
      }
    });
  }, [closeSocket]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const reconnectIfDead = () => {
      if (!enabled || !isOnline() || !isSocketDead(socketRef.current)) {
        return;
      }

      connectRef.current?.({
        force: true,
        nextStatus: NotifierConnectionStatus.Reconnecting,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reconnectIfDead();
      }
    };

    window.addEventListener("online", reconnectIfDead);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", reconnectIfDead);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  return {
    sendFrame,
    status,
    wallet,
  };
};
