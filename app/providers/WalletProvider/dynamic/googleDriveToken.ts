/**
 * Google Drive access token for the wallet backup, fetched straight from
 * Google with Equiteez's own OAuth client (Google Identity Services token
 * flow), as in the backend's Dynamic demo. Nothing here touches Dynamic: the
 * Google account is not linked to the Dynamic user, the token only goes to
 * the backup call. Used when the user signed in with email, or when the
 * Google account they signed in with has not granted Drive access.
 */
import { getGoogleClientId } from "./dynamic.config";

const GIS_SRC = "https://accounts.google.com/gsi/client";

/** Scopes Google must grant for the Drive upload to succeed */
export const GOOGLE_DRIVE_BACKUP_SCOPES = [
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.file",
] as const;

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type TokenClient = {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
};

type GoogleOAuth2 = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: { type: string; message?: string }) => void;
  }) => TokenClient;
  hasGrantedAllScopes: (
    response: TokenResponse,
    ...scopes: string[]
  ) => boolean;
};

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth2 } };
  }
}

/** Google closed the popup or did not grant both Drive permissions */
export class GoogleDriveAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleDriveAccessError";
  }
}

let gisPromise: Promise<GoogleOAuth2> | null = null;

/**
 * Loads Google Identity Services once. Call it before the click (e.g. when
 * the backup window opens) so the popup opens inside the click handler;
 * otherwise the browser's popup blocker stops it.
 */
export function loadGoogleIdentity(): Promise<GoogleOAuth2> {
  gisPromise ??= new Promise<GoogleOAuth2>((resolve, reject) => {
    const script = document.createElement("script");

    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => {
      const oauth2 = window.google?.accounts?.oauth2;

      if (oauth2) resolve(oauth2);
      else reject(new Error("Google Identity Services loaded without OAuth."));
    };
    script.onerror = () => {
      gisPromise = null;
      reject(new Error("Couldn't load Google sign-in."));
    };
    document.head.appendChild(script);
  });

  return gisPromise;
}

/**
 * Opens Google's consent popup and resolves with a Drive access token. Must
 * run inside a click, with loadGoogleIdentity already finished. Rejects when
 * the user closes the popup or leaves a Drive checkbox unticked.
 */
export function requestGoogleDriveAccessToken(): Promise<string> {
  const clientId = getGoogleClientId();
  const oauth2 = window.google?.accounts?.oauth2;

  if (!clientId) {
    return Promise.reject(
      new GoogleDriveAccessError("Google Drive backup isn't set up yet.")
    );
  }
  if (!oauth2) {
    return Promise.reject(
      new GoogleDriveAccessError("Google is still loading. Please try again.")
    );
  }

  return new Promise<string>((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_DRIVE_BACKUP_SCOPES.join(" "),
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new GoogleDriveAccessError(
              "Google didn't give access to your Drive. Please try again."
            )
          );
          return;
        }
        if (
          !oauth2.hasGrantedAllScopes(response, ...GOOGLE_DRIVE_BACKUP_SCOPES)
        ) {
          reject(
            new GoogleDriveAccessError(
              "Tick both Google Drive boxes on Google's screen, then try again."
            )
          );
          return;
        }
        resolve(response.access_token);
      },
      error_callback: () =>
        reject(
          new GoogleDriveAccessError(
            "The Google window was closed before access was given."
          )
        ),
    });

    // Always show the consent screen so the user can tick the Drive boxes
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}
