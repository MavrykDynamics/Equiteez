/**
 * Wallet password → Set up / Change. No Figma for this window yet: it follows
 * the Wallet page modals ("Before You Export Your Key"). The password protects
 * the wallet's key share in this browser; Dynamic never sees it and cannot
 * reset it, so setting one needs an explicit acknowledgment.
 */
import { useId, useState, type FormEvent } from "react";

import CheckboxChecked from "app/icons/checkbox-checked.svg?react";
import CheckboxUnchecked from "app/icons/checkbox-unchecked.svg?react";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import {
  DynamicPasswordAlreadySetError,
  DynamicSessionExpiredError,
  DynamicWrongPasswordError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";

import type { useWalletPassword } from "./useWalletPassword";
import styles from "./WalletModal.module.css";

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
    <CustomPopup
      className={styles.modal}
      contentLabel={title}
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      {/* Mounted only while open: every opening starts with empty fields */}
      <WalletPasswordContent
        {...actions}
        hasPassword={hasPassword}
        onClose={onClose}
        title={title}
      />
    </CustomPopup>
  );
}

function WalletPasswordContent({
  hasPassword,
  onClose,
  save,
  markPasswordSet,
  title,
}: Omit<WalletPasswordModalProps, "isOpen"> & { title: string }) {
  const currentId = useId();
  const newId = useId();
  const confirmId = useId();
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
    <>
      <div className={styles.closeRow}>
        <button
          aria-label="Close"
          className={styles.closeButton}
          disabled={isSaving}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <form className={styles.content} noValidate onSubmit={handleSubmit}>
        <header className={styles.header}>
          <span className={styles.heroIcon}>
            <RIcon aria-hidden name="lock" size="medium" />
          </span>
          <div className={styles.headerText}>
            <RHeading className={styles.title} size="h6" weight="medium">
              {title}
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              You&apos;ll enter it to restore your wallet on a new device or
              after a long break.
            </RText>
          </div>
        </header>

        <div className={styles.warning}>
          <RIcon
            aria-hidden="true"
            className={styles.warningIcon}
            name="warning"
            size="small"
          />
          <div className={styles.warningText}>
            <RText size="body-sm">
              Nobody can reset this password, including Equiteez and Dynamic.
            </RText>
            <RText color="neutral-700" size="body-sm">
              If you lose it, you won&apos;t be able to restore your wallet on a
              new device.
            </RText>
          </div>
        </div>

        <div className={styles.fields}>
          {hasPassword ? (
            <PasswordField
              autoComplete="current-password"
              id={currentId}
              label="Current Password"
              onChange={setCurrentPassword}
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
            id={newId}
            label="New Password"
            onChange={setNewPassword}
            value={newPassword}
          />
          <PasswordField
            autoComplete="new-password"
            hint={isMismatch ? "The passwords don't match." : undefined}
            id={confirmId}
            label="Confirm New Password"
            onChange={setConfirmPassword}
            value={confirmPassword}
          />
        </div>

        {hasPassword ? null : (
          <label className={styles.confirm}>
            <input
              checked={isAcknowledged}
              className={styles.confirmInput}
              onChange={(event) => setIsAcknowledged(event.target.checked)}
              type="checkbox"
            />
            {isAcknowledged ? (
              <CheckboxChecked aria-hidden="true" className={styles.checkbox} />
            ) : (
              <CheckboxUnchecked
                aria-hidden="true"
                className={styles.checkbox}
              />
            )}
            <RText size="body-sm">
              I&apos;ve saved this password somewhere safe.
            </RText>
          </label>
        )}

        {error ? (
          <RText className={styles.error} role="alert" size="body-sm">
            {error}
          </RText>
        ) : null}

        <div className={styles.actions}>
          <RButton
            className={styles.action}
            disabled={isSaving}
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
            disabled={!canSave}
            isLoading={isSaving}
            size="medium"
            tone="black"
            type="submit"
          >
            {hasPassword ? "Change Password" : "Set Password"}
          </RButton>
        </div>
      </form>
    </>
  );
}

function PasswordField({
  id,
  label,
  value,
  autoComplete,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  autoComplete: string;
  /** Shown under the field as an error */
  hint?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <RInput
        aria-invalid={Boolean(hint)}
        autoComplete={autoComplete}
        className={styles.fieldInput}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        type="password"
        value={value}
      />
      {hint ? (
        <RText className={styles.error} size="body-s">
          {hint}
        </RText>
      ) : null}
    </div>
  );
}
