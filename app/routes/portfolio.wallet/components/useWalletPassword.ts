/** Whether the email wallet has a password, with set and change. */
import { useCallback, useEffect, useState } from "react";

import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

export function useWalletPassword() {
  const { dynamic } = useWalletContext();
  const { success } = useToasterContext();
  /** null until known */
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);

  const reload = useCallback(async () => {
    if (!dynamic) return;

    try {
      setHasPassword(await dynamic.hasWalletPassword());
      setHasError(false);
    } catch {
      setHasError(true);
    }
  }, [dynamic]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(
    async ({
      currentPassword,
      newPassword,
    }: {
      /** Present when changing an existing password */
      currentPassword?: string;
      newPassword: string;
    }) => {
      if (!dynamic) return;

      if (currentPassword === undefined) {
        await dynamic.setWalletPassword(newPassword);
        success(
          "Password set",
          "You'll need it to restore your wallet on a new device."
        );
      } else {
        await dynamic.changeWalletPassword(currentPassword, newPassword);
        success(
          "Password changed",
          "Use the new password to restore your wallet from now on."
        );
      }

      setHasPassword(true);
    },
    [dynamic, success]
  );

  /** Dynamic found a password the status check missed: switch to "change" */
  const markPasswordSet = useCallback(() => setHasPassword(true), []);

  return { hasPassword, hasError, save, markPasswordSet };
}

/** The Security row's line for the wallet password */
export function describeWalletPassword(
  hasPassword: boolean | null,
  hasError: boolean
): { status: string; tone?: "success" | "warning" } {
  if (hasPassword === null) {
    return {
      status: hasError ? "Couldn't check your wallet password" : "Checking…",
    };
  }

  return hasPassword
    ? {
        status: "Set. You need it to restore your wallet on a new device.",
        tone: "success",
      }
    : {
        status: "Not set. Add one to protect your wallet on new devices.",
        tone: "warning",
      };
}
