/** The email wallet's authenticator app (TOTP): status, set up and remove. */
import { useCallback, useEffect, useState } from "react";

import type { DynamicAuthenticator } from "~/providers/WalletProvider/dynamic/dynamicClient.client";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

/** "2 Nov 2026" */
const formatAddedDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function useAuthenticator() {
  const { dynamic } = useWalletContext();
  const { success } = useToasterContext();
  /** undefined until known; null when not set up */
  const [authenticator, setAuthenticator] = useState<
    DynamicAuthenticator | null | undefined
  >(undefined);
  const [hasError, setHasError] = useState(false);

  const reload = useCallback(async () => {
    if (!dynamic) return;

    // "Checking…" again while a retry runs
    setHasError(false);

    try {
      setAuthenticator(await dynamic.getAuthenticator());
    } catch {
      setHasError(true);
    }
  }, [dynamic]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** "Confirm it's you", then the QR code data */
  const startSetup = useCallback(async () => {
    if (!dynamic) throw new Error("Email wallet is not available.");
    return dynamic.startAuthenticatorSetup();
  }, [dynamic]);

  /** Turns the app on */
  const verifySetup = useCallback(
    async (deviceId: string, code: string) => {
      if (!dynamic) return;

      await dynamic.verifyAuthenticatorSetup(deviceId, code);
      await reload();
      success(
        "Authenticator app is on",
        "We'll ask for a code from it to confirm it's you."
      );
    },
    [dynamic, reload, success]
  );

  /** The recovery codes to save; rejects when they can't be loaded */
  const getRecoveryCodes = useCallback(async () => {
    if (!dynamic) throw new Error("Email wallet is not available.");
    return dynamic.getRecoveryCodes();
  }, [dynamic]);

  const acknowledgeRecoveryCodes = useCallback(async () => {
    await dynamic?.acknowledgeRecoveryCodes();
  }, [dynamic]);

  const remove = useCallback(
    async (code: string) => {
      if (!dynamic || !authenticator) return;

      await dynamic.removeAuthenticator(authenticator.id, code);
      setAuthenticator(null);
      success("Authenticator app removed", "You can set it up again anytime.");
    },
    [authenticator, dynamic, success]
  );

  return {
    authenticator,
    hasError,
    reload,
    startSetup,
    verifySetup,
    getRecoveryCodes,
    acknowledgeRecoveryCodes,
    remove,
  };
}

/** The Security row's line for the authenticator app */
export function describeAuthenticator(
  authenticator: DynamicAuthenticator | null | undefined,
  hasError: boolean
): { status: string; tone?: "success" | "warning" } {
  if (authenticator === undefined) {
    return {
      status: hasError ? "Couldn't check your authenticator app" : "Checking…",
    };
  }
  if (!authenticator) return { status: "Not set up", tone: "warning" };

  return {
    status: authenticator.addedAt
      ? `Set up, added ${formatAddedDate(authenticator.addedAt)}`
      : "Set up",
    tone: "success",
  };
}
