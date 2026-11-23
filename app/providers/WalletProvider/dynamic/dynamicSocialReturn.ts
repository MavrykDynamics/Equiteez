/**
 * "Continue with Google" leaves the page: Dynamic's JavaScript SDK sends the
 * browser to Google and back, so the sign-in finishes after a reload. Before
 * leaving we note it in sessionStorage; on return the sign-in modal reopens
 * and finishes it. No SDK import: the app reads this on start without loading
 * Dynamic.
 */
const GOOGLE_SIGN_IN_KEY = "equiteez:dynamic-google-sign-in";
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

/** True when this tab left for Google and has not finished the sign-in. */
export function hasPendingGoogleSignIn() {
  return getSessionStorage()?.getItem(GOOGLE_SIGN_IN_KEY) != null;
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
