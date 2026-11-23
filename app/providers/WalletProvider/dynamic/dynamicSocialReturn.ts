/**
 * "Continue with Google" leaves the page: Dynamic's JavaScript SDK sends the
 * browser to Google and back, so the sign-in finishes after a reload. Before
 * leaving we note it in sessionStorage; on return the sign-in modal reopens
 * and finishes it. No SDK import: the app reads this on start without loading
 * Dynamic.
 */
const GOOGLE_SIGN_IN_KEY = "equiteez:dynamic-google-sign-in";
// A trip to Google takes a minute or two; a note older than this is left
// over from a trip that never finished and is ignored
const GOOGLE_SIGN_IN_TTL_MS = 10 * 60_000;
// Dynamic's return parameters (removeDynamicOauthParamsFromUrl in the SDK)
const OAUTH_RETURN_PARAMS = ["dynamicOauthState", "dynamicOauthCode"];

function getSessionStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    // Blocked storage (privacy settings): the return is then not finished
    return null;
  }
}

export function rememberGoogleSignIn() {
  getSessionStorage()?.setItem(GOOGLE_SIGN_IN_KEY, String(Date.now()));
}

export function forgetGoogleSignIn() {
  getSessionStorage()?.removeItem(GOOGLE_SIGN_IN_KEY);
}

/**
 * True when this tab left for Google in the last few minutes and has not
 * finished the sign-in. A stale note is removed.
 */
export function hasPendingGoogleSignIn(now = Date.now()) {
  const storage = getSessionStorage();
  const leftAt = Number(storage?.getItem(GOOGLE_SIGN_IN_KEY));

  if (!leftAt) return false;
  if (now - leftAt <= GOOGLE_SIGN_IN_TTL_MS) return true;

  storage?.removeItem(GOOGLE_SIGN_IN_KEY);
  return false;
}

/** True when the page URL carries Dynamic's return from Google. */
export function hasOAuthReturnParams(href = window.location.href) {
  const params = new URL(href).searchParams;

  return OAUTH_RETURN_PARAMS.every((name) => params.has(name));
}

/** The app's own address without the one-time return parameters. */
export function getSocialRedirectUrl() {
  const url = new URL(window.location.href);

  OAUTH_RETURN_PARAMS.forEach((name) => url.searchParams.delete(name));
  return url.toString();
}
