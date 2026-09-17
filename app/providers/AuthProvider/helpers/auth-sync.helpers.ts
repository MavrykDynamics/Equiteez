import {
  RWA_API_ACCESS_TOKEN_STORAGE_KEY,
  RWA_API_REFRESH_TOKEN_STORAGE_KEY,
} from "~/providers/AuthProvider/helpers/storage";

const AUTH_SYNC_CHANNEL_NAME = "rwa-auth";

export const AUTH_TOKENS_UPDATED_EVENT = "TOKENS_UPDATED";
export const AUTH_LOGOUT_EVENT = "LOGOUT";

type AuthSyncEventType =
  | typeof AUTH_TOKENS_UPDATED_EVENT
  | typeof AUTH_LOGOUT_EVENT;

type AuthSyncMessage = {
  type: AuthSyncEventType;
};

function createAuthSyncChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  return new BroadcastChannel(AUTH_SYNC_CHANNEL_NAME);
}

export function emitAuthSyncEvent(type: AuthSyncEventType) {
  const channel = createAuthSyncChannel();

  if (!channel) return;

  channel.postMessage({ type } satisfies AuthSyncMessage);
  channel.close();
}

export function subscribeToAuthSyncEvents(
  onEvent: (type: AuthSyncEventType) => void
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const channel = createAuthSyncChannel();
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key !== RWA_API_ACCESS_TOKEN_STORAGE_KEY &&
      event.key !== RWA_API_REFRESH_TOKEN_STORAGE_KEY
    ) {
      return;
    }

    onEvent(
      event.newValue === null ? AUTH_LOGOUT_EVENT : AUTH_TOKENS_UPDATED_EVENT
    );
  };
  const handleBroadcast = (event: MessageEvent<AuthSyncMessage>) => {
    if (
      event.data?.type !== AUTH_TOKENS_UPDATED_EVENT &&
      event.data?.type !== AUTH_LOGOUT_EVENT
    ) {
      return;
    }

    onEvent(event.data.type);
  };

  window.addEventListener("storage", handleStorage);
  channel?.addEventListener("message", handleBroadcast);

  return () => {
    window.removeEventListener("storage", handleStorage);
    channel?.removeEventListener("message", handleBroadcast);
    channel?.close();
  };
}
