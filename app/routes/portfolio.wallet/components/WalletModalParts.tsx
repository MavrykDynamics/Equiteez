/**
 * Shared pieces of the Wallet page's Security modals (Figma 8131:518,
 * "Security – …"): the popup, the warning and notice boxes, the
 * acknowledgment checkbox, the password field and the green-check success
 * screen. The header is the shared RPopupHeader.
 */
import clsx from "clsx";
import { useId, useSyncExternalStore, type ReactNode } from "react";

import CheckboxChecked from "app/icons/checkbox-checked.svg?react";
import CheckboxUnchecked from "app/icons/checkbox-unchecked.svg?react";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RPopupHeader } from "~/lib/molecules/RPopupHeader";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import {
  getPendingIdentityCheck,
  subscribeToIdentityCheck,
} from "~/providers/WalletProvider/dynamic/identityCheck";

import styles from "./WalletModal.module.css";

const isIdentityCheckPending = () => getPendingIdentityCheck() !== null;
const getServerSnapshot = () => false;

export function WalletModal({
  isOpen,
  label,
  onRequestClose,
  isIdentityCheck = false,
  children,
}: {
  isOpen: boolean;
  label: string;
  onRequestClose: () => void;
  /** The "Verify Your Identity" window itself */
  isIdentityCheck?: boolean;
  children: ReactNode;
}) {
  // While "Verify Your Identity" is up, this window steps aside instead of
  // showing under it. It stays mounted, so its step and its pending action
  // (e.g. the key export waiting for the check) carry on afterwards.
  const isCheckPending = useSyncExternalStore(
    subscribeToIdentityCheck,
    isIdentityCheckPending,
    getServerSnapshot
  );
  const isHidden = !isIdentityCheck && isCheckPending;

  return (
    <CustomPopup
      className={styles.modal}
      contentLabel={label}
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName={clsx(styles.overlay, isHidden && styles.overlayHidden)}
    >
      {children}
    </CustomPopup>
  );
}

/** Yellow box: a medium first line, then the details */
export function WalletModalWarning({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={styles.warning}>
      <RIcon
        aria-hidden="true"
        className={styles.boxIcon}
        name="warning"
        size="small"
      />
      <div className={styles.boxText}>
        {/* A one-line warning is regular, a heading over details medium */}
        <RText size="body-sm" weight={children ? "medium" : "regular"}>
          {title}
        </RText>
        {children ? (
          <RText color="neutral-700" size="body-sm">
            {children}
          </RText>
        ) : null}
      </div>
    </div>
  );
}

/** Grey box with an info icon */
export function WalletModalNotice({ children }: { children: ReactNode }) {
  return (
    <div className={styles.notice}>
      <RIcon
        aria-hidden="true"
        className={styles.boxIcon}
        name="info-circle"
        size="small"
      />
      <RText size="body-sm">{children}</RText>
    </div>
  );
}

export function WalletModalCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className={styles.confirm}>
      <input
        checked={checked}
        className={styles.confirmInput}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {checked ? (
        <CheckboxChecked aria-hidden="true" className={styles.checkbox} />
      ) : (
        <CheckboxUnchecked aria-hidden="true" className={styles.checkbox} />
      )}
      <RText size="body-sm">{children}</RText>
    </label>
  );
}

export function PasswordField({
  label,
  placeholder,
  value,
  autoComplete,
  hint,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  autoComplete: "current-password" | "new-password";
  /** Shown under the field as an error */
  hint?: string;
  onChange: (value: string) => void;
}) {
  const id = useId();

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
        placeholder={placeholder}
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

export function WalletModalError({ message }: { message: string | null }) {
  return message ? (
    <RText className={styles.error} role="alert" size="body-sm">
      {message}
    </RText>
  ) : null;
}

/** Cancel (secondary) and the main action, side by side */
export function WalletModalActions({
  cancelLabel = "Cancel",
  confirmLabel,
  isConfirmDisabled = false,
  isWorking = false,
  isSubmit = false,
  onCancel,
  onConfirm,
}: {
  cancelLabel?: string;
  confirmLabel: ReactNode;
  isConfirmDisabled?: boolean;
  isWorking?: boolean;
  /** The main button submits the surrounding form */
  isSubmit?: boolean;
  onCancel: () => void;
  onConfirm?: () => void;
}) {
  return (
    <div className={styles.actions}>
      <RButton
        className={styles.action}
        disabled={isWorking}
        onClick={onCancel}
        size="medium"
        tone="black"
        type="button"
        variant="secondary"
      >
        {cancelLabel}
      </RButton>
      <RButton
        className={styles.action}
        disabled={isConfirmDisabled || isWorking}
        isLoading={isWorking}
        onClick={onConfirm}
        size="medium"
        tone="black"
        type={isSubmit ? "submit" : "button"}
      >
        {confirmLabel}
      </RButton>
    </div>
  );
}

/** Header B with the green check, then extra content and the buttons */
export function WalletModalSuccess({
  title,
  description,
  onClose,
  children,
  actions,
}: {
  title: string;
  description: ReactNode;
  onClose: () => void;
  /** Between the text and the buttons, e.g. the added passkey */
  children?: ReactNode;
  /** Defaults to a single OK */
  actions?: ReactNode;
}) {
  return (
    <div className={styles.content}>
      <RPopupHeader
        description={description}
        icon="check"
        iconTone="green"
        onClose={onClose}
        title={title}
      />
      {children}
      {actions ?? (
        <RButton
          className={styles.fullAction}
          onClick={onClose}
          size="medium"
          tone="black"
        >
          OK
        </RButton>
      )}
    </div>
  );
}
