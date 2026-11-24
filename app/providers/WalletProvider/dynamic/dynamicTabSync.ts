/**
 * Keeps this app's tabs from working with an outdated Dynamic session.
 *
 * Dynamic keeps the session's signing key in a keychain shared by every tab
 * of the origin, but each tab's SDK reads its session only when it starts.
 * Starting without a session or signing out replaces that key, so another tab
 * still holding the old session (or the old key, while signed out) fails every
 * signed request: "Forbidden", or the SDK ends its sign-in midway.
 *
 * Each tab whose SDK is loaded tells the others which session it has:
 * - another tab has a different live session: this tab is outdated and
 *   reloads to pick it up (unseen, or at once when a sign-in starts here);
 * - another tab has none (it signed out or started without one): the key this
 *   tab holds is stale, and a new sign-in here first gets a fresh one. No
 *   reload: a reloaded tab without a session would replace the key again.
 */
const CHANNEL_NAME = "equiteez:dynamic-session";

/** Logouts after which the SDK keeps the shared key (another tab owns it) */
const SHARED_KEY_LOGOUT_REASONS = new Set(["keychain-session-key-mismatch"]);

type SessionMessage = {
  tabId: string;
  /** Expiry of the announcing tab's session; null when it has none */
  sessionExpiresAt: number | null;
};

const TAB_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

let isOutdated = false;
let areKeysStale = false;

/** Another tab has a live session this tab does not: reload to use it. */
export const isDynamicTabOutdated = () => isOutdated;

/** Another tab replaced the signing key: sign-ins here need a fresh one. */
export const areDynamicKeysStale = () => areKeysStale;

/** This tab got a fresh key (its SDK signed out and made one). */
export const markDynamicKeysFresh = () => {
  areKeysStale = false;
};

/** Reloads now: used when the user starts a sign-in in an outdated tab */
export const reloadOutdatedTab = () => window.location.reload();

const openChannel = () =>
  typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel(CHANNEL_NAME);

const isSessionMessage = (data: unknown): data is SessionMessage => {
  if (!data || typeof data !== "object") return false;

  const { tabId, sessionExpiresAt } = data as Record<string, unknown>;

  return (
    typeof tabId === "string" &&
    (sessionExpiresAt === null || typeof sessionExpiresAt === "number")
  );
};

/** Tells the other tabs which Dynamic session this tab now has. */
export function announceDynamicSession(sessionExpiresAt: number | null) {
  const channel = openChannel();

  if (!channel) return;

  channel.postMessage({
    tabId: TAB_ID,
    sessionExpiresAt,
  } satisfies SessionMessage);
  channel.close();
}

/** Whether a logout replaced the shared key, so other tabs must hear of it */
export const doesLogoutReplaceSharedKey = (reason: string | null) =>
  !reason || !SHARED_KEY_LOGOUT_REASONS.has(reason);

/**
 * Follows the other tabs' announcements. `onOutdated` runs once, when this
 * tab first becomes outdated. Returns the unsubscribe function.
 */
export function watchOtherTabsDynamicSessions({
  getOwnSessionExpiresAt,
  isReady,
  onOutdated,
}: {
  getOwnSessionExpiresAt: () => number | null;
  /** False while this tab's SDK is still reading its own session */
  isReady: () => boolean;
  onOutdated: () => void;
}): () => void {
  const channel = openChannel();

  if (!channel) return () => undefined;

  channel.onmessage = (event: MessageEvent<unknown>) => {
    const message = event.data;

    if (!isSessionMessage(message) || message.tabId === TAB_ID) return;
    if (!isReady()) return;

    const own = getOwnSessionExpiresAt();

    if (own !== null && own === message.sessionExpiresAt) return;

    if (message.sessionExpiresAt === null) {
      areKeysStale = true;
      return;
    }

    if (isOutdated) return;
    isOutdated = true;
    onOutdated();
  };

  return () => channel.close();
}

export function resetDynamicTabSyncForTests() {
  isOutdated = false;
  areKeysStale = false;
}
