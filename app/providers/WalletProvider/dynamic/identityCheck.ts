/**
 * The "Confirm it's you" request between the Dynamic flow and its dialog.
 *
 * Dynamic asks the user to prove who they are again before sensitive actions
 * (export the private key, add or remove a passkey) and the JavaScript SDK has
 * no screens: verifyDynamicIdentity publishes the ways Dynamic accepts here,
 * the dialog (ConfirmIdentityModal on the Wallet page) shows them and settles
 * the request. No SDK import: safe to load anywhere.
 */
import { IdentityCheckCancelledError } from "./dynamic.errors";

/** One way to prove it's you, the recommended one first. */
export type IdentityMethod =
  | {
      /** The user types a 6-digit code: from an email or an authenticator app */
      kind: "code";
      id: string;
      /** Text of the button that switches to this way */
      label: string;
      /** Where the code was emailed; null until sent or for an authenticator app */
      sentTo: string | null;
      /** Emails a fresh code and returns where it went; absent for an app */
      send?: () => Promise<string>;
      /** Rejects when the code is not accepted */
      verify: (code: string) => Promise<void>;
    }
  | {
      /** One button; the browser's passkey prompt does the rest */
      kind: "passkey";
      id: string;
      label: string;
      run: () => Promise<void>;
    };

export type PendingIdentityCheck = {
  methods: IdentityMethod[];
  done: () => void;
  cancel: () => void;
};

let pending: PendingIdentityCheck | null = null;
const listeners = new Set<() => void>();

function setPending(next: PendingIdentityCheck | null) {
  pending = next;
  listeners.forEach((notify) => notify());
}

export function subscribeToIdentityCheck(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getPendingIdentityCheck() {
  return pending;
}

/**
 * Opens the dialog with these ways to confirm. Resolves once one of them
 * succeeds; rejects with IdentityCheckCancelledError when the user closes it.
 */
export function askToConfirmIdentity(methods: IdentityMethod[]) {
  if (pending) {
    return Promise.reject(
      new Error("Finish the check that is already open first.")
    );
  }

  return new Promise<void>((resolve, reject) => {
    setPending({
      methods,
      done: () => {
        setPending(null);
        resolve();
      },
      cancel: () => {
        setPending(null);
        reject(new IdentityCheckCancelledError());
      },
    });
  });
}
