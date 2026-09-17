export const AUTH_EXPIRED_EVENT = "rwa-auth-expired";

export function emitAuthExpiredEvent() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}
