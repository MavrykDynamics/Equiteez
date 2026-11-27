/**
 * Wallet password → Set up / Change (Figma 8554:81385 "Security – Change
 * Password"; Set up follows it with an acknowledgment). The password protects
 * the wallet's key share in this browser; Dynamic never sees it and cannot
 * reset it, so setting one needs an explicit acknowledgment.
 */
import { useState, type FormEvent } from "react";

import {
  DynamicPasswordAlreadySetError,
  DynamicSessionExpiredError,
  DynamicWrongPasswordError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";

import type { useWalletPassword } from "./useWalletPassword";
import styles from "./WalletModal.module.css";
import { RPopupHeader } from "~/lib/molecules/RPopupHeader";

import {
  PasswordField,
  WalletModal,
  WalletModalActions,
  WalletModalCheckbox,
  WalletModalError,
  WalletModalWarning,
} from "./WalletModalParts";

export const MIN_PASSWORD_LENGTH = 8;

type WalletPasswordModalProps = Pick<
  ReturnType<typeof useWalletPassword>,
  "save" | "markPasswordSet"
> & {
  isOpen: boolean;
  /** Changing an existing password: the current one is asked first */
  hasPassword: boolean;
  onClose: () => void;
};

export function WalletPasswordModal({
  isOpen,
  hasPassword,
  onClose,
  ...actions
}: WalletPasswordModalProps) {
  const title = hasPassword ? "Change Wallet Password" : "Set Wallet Password";

  return (
    <WalletModal isOpen={isOpen} label={title} onRequestClose={onClose}>
      {/* Mounted only while open: every opening starts with empty fields */}
      <WalletPasswordContent
        {...actions}
        hasPassword={hasPassword}
        onClose={onClose}
        title={title}
      />
    </WalletModal>
  );
}

function WalletPasswordContent({
  hasPassword,
  onClose,
  save,
  markPasswordSet,
  title,
}: Omit<WalletPasswordModalProps, "isOpen"> & { title: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTooShort =
    newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const isMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSave =
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    newPassword === confirmPassword &&
    (hasPassword ? currentPassword.length > 0 : isAcknowledged) &&
    !isSaving;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;

    setIsSaving(true);
    setError(null);

    try {
      await save({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      onClose();
    } catch (saveError) {
      if (saveError instanceof DynamicPasswordAlreadySetError) {
        // The form turns into "change": the current password is asked next
        markPasswordSet();
      }
      setError(
        saveError instanceof DynamicPasswordAlreadySetError ||
          saveError instanceof DynamicWrongPasswordError ||
          saveError instanceof DynamicSessionExpiredError
          ? saveError.message
          : "We couldn't save your password. Please try again."
      );
      setIsSaving(false);
    }
  };

  return (
    <form className={styles.content} noValidate onSubmit={handleSubmit}>
      <RPopupHeader
        description="You'll enter it to restore your wallet on a new device or after a long break."
        isDisabled={isSaving}
        onClose={onClose}
        title={title}
      />

      <div className={styles.fields}>
        {hasPassword ? (
          <PasswordField
            autoComplete="current-password"
            label="Current Password"
            onChange={setCurrentPassword}
            placeholder="Enter Current Password"
            value={currentPassword}
          />
        ) : null}
        <PasswordField
          autoComplete="new-password"
          hint={
            isTooShort
              ? `Use at least ${MIN_PASSWORD_LENGTH} characters.`
              : undefined
          }
          label="New Password"
          onChange={setNewPassword}
          placeholder="Enter New Password"
          value={newPassword}
        />
        <PasswordField
          autoComplete="new-password"
          hint={isMismatch ? "The passwords don't match." : undefined}
          label="Confirm New Password"
          onChange={setConfirmPassword}
          placeholder="Enter New Password"
          value={confirmPassword}
        />
      </div>

      <div className={styles.group}>
        <WalletModalWarning title="Nobody can reset this password, including Equiteez and Dynamic.">
          If you lose it, you won&apos;t be able to restore your wallet on a new
          device.
        </WalletModalWarning>
        {hasPassword ? null : (
          <WalletModalCheckbox
            checked={isAcknowledged}
            onChange={setIsAcknowledged}
          >
            I&apos;ve saved this password somewhere safe.
          </WalletModalCheckbox>
        )}
      </div>

      <WalletModalError message={error} />

      <WalletModalActions
        confirmLabel={hasPassword ? "Change Password" : "Set Password"}
        isConfirmDisabled={!canSave}
        isSubmit
        isWorking={isSaving}
        onCancel={onClose}
      />
    </form>
  );
}
