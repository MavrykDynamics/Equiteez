/**
 * Backup → "Back up to Google Drive". No Figma for this window yet: it follows
 * the Wallet page modals. Explains where the Drive access comes from, asks
 * for the wallet password when the wallet has one, then runs the backup.
 */
import { useEffect, useId, useState, type FormEvent } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import {
  DynamicSessionExpiredError,
  DynamicWrongPasswordError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";
import { GoogleDriveAccessError } from "~/providers/WalletProvider/dynamic/googleDriveToken";

import type { useGoogleDriveBackup } from "./useGoogleDriveBackup";
import styles from "./WalletModal.module.css";

type GoogleDriveBackupModalProps = Pick<
  ReturnType<typeof useGoogleDriveBackup>,
  "accessSource" | "isAvailable" | "prepare" | "backUp"
> & {
  isOpen: boolean;
  /** The wallet has a password: the backup needs it */
  hasPassword: boolean;
  onClose: () => void;
};

export function GoogleDriveBackupModal({
  isOpen,
  onClose,
  ...props
}: GoogleDriveBackupModalProps) {
  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Back up to Google Drive"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      {/* Mounted only while open: every opening checks the access again */}
      <GoogleDriveBackupContent {...props} onClose={onClose} />
    </CustomPopup>
  );
}

const toMessage = (error: unknown) =>
  error instanceof GoogleDriveAccessError ||
  error instanceof DynamicWrongPasswordError ||
  error instanceof DynamicSessionExpiredError
    ? error.message
    : "We couldn't back up your wallet. Please try again.";

function GoogleDriveBackupContent({
  accessSource,
  isAvailable,
  hasPassword,
  prepare,
  backUp,
  onClose,
}: Omit<GoogleDriveBackupModalProps, "isOpen">) {
  const passwordId = useId();
  const [password, setPassword] = useState("");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    prepare().catch((prepareError: unknown) =>
      setError(toMessage(prepareError))
    );
  }, [prepare]);

  const isReady = accessSource !== null && isAvailable;
  const canBackUp =
    isReady && !isBackingUp && (!hasPassword || password.length > 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canBackUp) return;

    setIsBackingUp(true);
    setError(null);

    try {
      // Straight from the click: Google's popup opens before anything else
      await backUp({ password: hasPassword ? password : undefined });
      onClose();
    } catch (backupError) {
      setError(toMessage(backupError));
      setIsBackingUp(false);
    }
  };

  return (
    <>
      <div className={styles.closeRow}>
        <button
          aria-label="Close"
          className={styles.closeButton}
          disabled={isBackingUp}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <form className={styles.content} noValidate onSubmit={handleSubmit}>
        <header className={styles.header}>
          <span className={styles.heroIcon}>
            <RIcon aria-hidden name="upload" size="medium" />
          </span>
          <div className={styles.headerText}>
            <RHeading className={styles.title} size="h6" weight="medium">
              Back Up To Google Drive
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              We&apos;ll save an encrypted recovery file to your Google Drive so
              you can restore access on a new device.
            </RText>
          </div>
        </header>

        <div className={styles.notice}>
          <RIcon aria-hidden name="info-circle" size="small" />
          <RText size="body-sm">
            {accessSource === null
              ? "Checking your Google access…"
              : !isAvailable
                ? "Google Drive backup isn't available for email sign-in yet."
                : accessSource === "stored"
                  ? "We'll use the Google account you signed in with."
                  : "Google will open a window. Tick both Google Drive boxes so Equiteez can save one file."}
          </RText>
        </div>

        {hasPassword ? (
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={passwordId}>
              Wallet Password
            </label>
            <RInput
              autoComplete="current-password"
              className={styles.fieldInput}
              id={passwordId}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>
        ) : null}

        {error ? (
          <RText className={styles.error} role="alert" size="body-sm">
            {error}
          </RText>
        ) : null}

        <div className={styles.actions}>
          <RButton
            className={styles.action}
            disabled={isBackingUp}
            onClick={onClose}
            size="medium"
            tone="black"
            type="button"
            variant="secondary"
          >
            Cancel
          </RButton>
          <RButton
            className={styles.action}
            disabled={!canBackUp}
            isLoading={isBackingUp}
            size="medium"
            tone="black"
            type="submit"
          >
            Back Up
          </RButton>
        </div>
      </form>
    </>
  );
}
