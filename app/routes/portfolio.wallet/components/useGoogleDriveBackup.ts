/**
 * Google Drive backup of the email wallet: its status and the backup itself.
 * The Drive access comes from the user's Google sign-in when it already has
 * it, otherwise from Google's consent popup, which must open inside the
 * click: prepare() loads Google's script beforehand.
 */
import { useCallback, useState } from "react";

import { getGoogleClientId } from "~/providers/WalletProvider/dynamic/dynamic.config";
import {
  loadGoogleIdentity,
  requestGoogleDriveAccessToken,
} from "~/providers/WalletProvider/dynamic/googleDriveToken";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

export type DriveAccessSource = "stored" | "popup";

export function useGoogleDriveBackup() {
  const { dynamic } = useWalletContext();
  const { success } = useToasterContext();
  const [isBackedUp, setIsBackedUp] = useState(
    () => dynamic?.isWalletBackedUp() ?? false
  );
  /** null until prepare() has asked Dynamic */
  const [accessSource, setAccessSource] = useState<DriveAccessSource | null>(
    null
  );

  /** Call when the backup window opens */
  const prepare = useCallback(async () => {
    if (!dynamic) return;

    setAccessSource(null);

    const source = await dynamic.getGoogleDriveAccessSource();

    if (source === "popup" && getGoogleClientId()) {
      // Ready before the click, or the popup blocker stops the popup
      await loadGoogleIdentity().catch(() => undefined);
    }
    setAccessSource(source);
  }, [dynamic]);

  /**
   * Runs the backup. Call straight from the click: the popup, when needed,
   * opens before anything else is awaited.
   */
  const backUp = useCallback(
    async ({ password }: { password?: string }) => {
      if (!dynamic) return;

      const googleDriveAccessToken =
        accessSource === "popup"
          ? await requestGoogleDriveAccessToken()
          : undefined;

      await dynamic.backupToGoogleDrive({ googleDriveAccessToken, password });
      setIsBackedUp(true);
      success(
        "Backed up to Google Drive",
        "You can restore access to your wallet on a new device."
      );
    },
    [accessSource, dynamic, success]
  );

  return {
    isBackedUp,
    accessSource,
    /** An email sign-in needs Equiteez's Google client for the popup */
    isAvailable: accessSource !== "popup" || getGoogleClientId() !== null,
    prepare,
    backUp,
  };
}
