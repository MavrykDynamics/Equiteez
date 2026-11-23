/** The email wallet's passkeys from Dynamic, with add and remove. */
import { useCallback, useEffect, useState } from "react";

import {
  DynamicSessionExpiredError,
  IdentityCheckCancelledError,
  IdentityCheckUnavailableError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";
import type { DynamicPasskey } from "~/providers/WalletProvider/dynamic/dynamicClient.client";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

export type { DynamicPasskey };

/** "2 Nov 2026" */
export const formatPasskeyDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** The browser's passkey prompt closed or timed out: not an error to show */
const isPromptDismissed = (error: unknown) =>
  error instanceof Error &&
  /NotAllowedError|AbortError|not allowed|cancel|timed out/i.test(
    `${error.name} ${error.message}`
  );

/** Dynamic's answer while passkeys are off in its dashboard */
const isPasskeysDisabled = (error: unknown) =>
  error instanceof Error &&
  /passkey authenticator is not enabled/i.test(error.message);

/** Closing the prompt or "Confirm it's you" changes nothing: no error */
const isCancelled = (error: unknown) =>
  error instanceof IdentityCheckCancelledError || isPromptDismissed(error);

const toMessage = (error: unknown, fallback: string) => {
  if (
    error instanceof DynamicSessionExpiredError ||
    error instanceof IdentityCheckUnavailableError
  ) {
    return error.message;
  }
  if (isPasskeysDisabled(error)) {
    return "Passkeys aren't turned on for Equiteez yet.";
  }

  return fallback;
};

export function usePasskeys() {
  const { dynamic } = useWalletContext();
  const [passkeys, setPasskeys] = useState<DynamicPasskey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!dynamic) return;

    try {
      setPasskeys(await dynamic.getPasskeys());
      setError(null);
    } catch (loadError) {
      setError(toMessage(loadError, "We couldn't load your passkeys."));
    }
  }, [dynamic]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const add = useCallback(async () => {
    if (!dynamic) return;

    setIsAdding(true);
    setError(null);

    try {
      await dynamic.addPasskey();
      await reload();
    } catch (addError) {
      if (!isCancelled(addError)) {
        setError(toMessage(addError, "We couldn't add the passkey."));
      }
    } finally {
      setIsAdding(false);
    }
  }, [dynamic, reload]);

  const remove = useCallback(
    async (passkeyId: string) => {
      if (!dynamic) return;

      setRemovingId(passkeyId);
      setError(null);

      try {
        await dynamic.removePasskey(passkeyId);
        await reload();
      } catch (removeError) {
        if (!isCancelled(removeError)) {
          setError(toMessage(removeError, "We couldn't remove the passkey."));
        }
      } finally {
        setRemovingId(null);
      }
    },
    [dynamic, reload]
  );

  return {
    /** null until the first load */
    passkeys,
    error,
    isAdding,
    removingId,
    add,
    remove,
  };
}

/** The Security row's line: "1 passkey: iCloud Keychain, added 2 Nov 2026" */
export function describePasskeys(
  passkeys: DynamicPasskey[] | null,
  hasError = false
) {
  if (!passkeys) return hasError ? "Couldn't load your passkeys" : "Checking…";
  if (!passkeys.length) return "No passkeys yet";

  const latest = passkeys.reduce((last, passkey) =>
    passkey.createdAt > last.createdAt ? passkey : last
  );
  const added = formatPasskeyDate(latest.createdAt);

  return passkeys.length === 1
    ? `1 passkey: ${latest.name ?? "Passkey"}, added ${added}`
    : `${passkeys.length} passkeys, the latest added ${added}`;
}
