/**
 * Backup → "Back up to Google Drive" (Figma 8574:82442 "Security – Google
 * Drive"). Asks for the wallet password when the wallet has one, explains
 * where the Drive access comes from, runs the backup and ends on a success
 * screen.
 */
import { useEffect, useState, type FormEvent } from "react";

import {
  DynamicSessionExpiredError,
  DynamicWrongPasswordError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";
import { GoogleDriveAccessError } from "~/providers/WalletProvider/dynamic/googleDriveToken";

import type { useGoogleDriveBackup } from "./useGoogleDriveBackup";
import styles from "./WalletModal.module.css";
import {
  PasswordField,
  WalletModal,
  WalletModalActions,
  WalletModalError,
  WalletModalHeader,
  WalletModalNotice,
  WalletModalSuccess,
} from "./WalletModalParts";

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
    <WalletModal
      isOpen={isOpen}
      label="Google Drive backup"
      onRequestClose={onClose}
    >
      {/* Mounted only while open: every opening checks the access again */}
      <GoogleDriveBackupContent {...props} onClose={onClose} />
    </WalletModal>
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
  const [password, setPassword] = useState("");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isDone, setIsDone] = useState(false);
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
      setIsDone(true);
    } catch (backupError) {
      setError(toMessage(backupError));
    } finally {
      setIsBackingUp(false);
    }
  };

  if (isDone) {
    return (
      <WalletModalSuccess
        description="Your Google Account is connected. Your account data can now be backed up to Google Drive."
        onClose={onClose}
        title="Backup Enabled"
      />
    );
  }

  return (
    <form className={styles.content} noValidate onSubmit={handleSubmit}>
      <WalletModalHeader
        description="Back up your account data securely to Google Drive so you can restore access when needed."
        isDisabled={isBackingUp}
        onClose={onClose}
        title="Google Drive Backup"
      />

      {hasPassword ? (
        <PasswordField
          autoComplete="current-password"
          label="Wallet Password"
          onChange={setPassword}
          placeholder="Enter Wallet Password"
          value={password}
        />
      ) : null}

      <WalletModalNotice>
        {accessSource === null
          ? "Checking your Google access…"
          : !isAvailable
            ? "Google Drive backup isn't available for email sign-in yet."
            : accessSource === "stored"
              ? "We'll use the Google account you signed in with."
              : "Google will open a new window asking you to grant access to Google Drive. Please enable both requested permissions to allow Equiteez to save your backup file."}
      </WalletModalNotice>

      <WalletModalError message={error} />

      <WalletModalActions
        confirmLabel="Continue"
        isConfirmDisabled={!canBackUp}
        isSubmit
        isWorking={isBackingUp}
        onCancel={onClose}
      />
    </form>
  );
}
