/** The email wallet's passkeys from Dynamic, with add and remove. */
import { useCallback, useEffect, useState } from "react";

import { formatDayMonthYear } from "~/lib/utils/date";
import {
  DynamicSessionExpiredError,
  IdentityCheckCancelledError,
  IdentityCheckUnavailableError,
  isPasskeyPromptDismissed,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";
import type { DynamicPasskey } from "~/providers/WalletProvider/dynamic/dynamicClient.client";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

export type { DynamicPasskey };

/** Dynamic's answer while passkeys are off in its dashboard */
const isPasskeysDisabled = (error: unknown) =>
  error instanceof Error &&
  /passkey authenticator is not enabled/i.test(error.message);

/** Closing the prompt or "Confirm it's you" changes nothing: no error */
const isCancelled = (error: unknown) =>
  error instanceof IdentityCheckCancelledError ||
  isPasskeyPromptDismissed(error);

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

  /** true once the passkey is added; errors land in `error` */
  const add = useCallback(async () => {
    if (!dynamic) return false;

    setIsAdding(true);
    setError(null);

    try {
      await dynamic.addPasskey();
      await reload();
      return true;
    } catch (addError) {
      if (!isCancelled(addError)) {
        setError(toMessage(addError, "We couldn't add the passkey."));
      }
      return false;
    } finally {
      setIsAdding(false);
    }
  }, [dynamic, reload]);

  const remove = useCallback(
    /** true once the passkey is removed; errors land in `error` */
    async (passkeyId: string) => {
      if (!dynamic) return false;

      setRemovingId(passkeyId);
      setError(null);

      try {
        await dynamic.removePasskey(passkeyId);
        await reload();
        return true;
      } catch (removeError) {
        if (!isCancelled(removeError)) {
          setError(toMessage(removeError, "We couldn't remove the passkey."));
        }
        return false;
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
  const added = formatDayMonthYear(latest.createdAt);

  return passkeys.length === 1
    ? `1 passkey: ${latest.name ?? "Passkey"}, added ${added}`
    : `${passkeys.length} passkeys, the latest added ${added}`;
}
