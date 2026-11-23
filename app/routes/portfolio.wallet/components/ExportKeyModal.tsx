/**
 * "Before You Export Your Key" (Figma 8229:76438). Continue, once the user
 * takes responsibility for the key, runs "Confirm it's you" and then shows the
 * private key in an isolated frame Dynamic injects into this modal: Equiteez
 * never sees it.
 */
import { useId, useRef, useState } from "react";

import CheckboxChecked from "app/icons/checkbox-checked.svg?react";
import CheckboxUnchecked from "app/icons/checkbox-unchecked.svg?react";
import ExportKeyIcon from "app/icons/export-key.svg?react";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import {
  DynamicSessionExpiredError,
  DynamicWrongPasswordError,
  IdentityCheckCancelledError,
  IdentityCheckUnavailableError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";

import styles from "./WalletModal.module.css";

type ExportKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** The wallet has a password: Dynamic needs it to show the key */
  hasPassword?: boolean;
  /** Shows the key in Dynamic's frame inside `displayContainer` */
  onContinue: (
    displayContainer: HTMLElement,
    password?: string
  ) => Promise<void>;
};

export function ExportKeyModal({
  isOpen,
  hasPassword = false,
  onClose,
  onContinue,
}: ExportKeyModalProps) {
  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Before you export your key"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      {/* Mounted only while open: every opening starts unconfirmed */}
      <ExportKeyContent
        hasPassword={hasPassword}
        onClose={onClose}
        onContinue={onContinue}
      />
    </CustomPopup>
  );
}

function ExportKeyContent({
  hasPassword,
  onClose,
  onContinue,
}: Omit<ExportKeyModalProps, "isOpen">) {
  const passwordId = useId();
  const [password, setPassword] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isKeyShown, setIsKeyShown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Dynamic injects the frame with the key here; mounted from the start so
  // the same node is there when the key arrives
  const keyFrameRef = useRef<HTMLDivElement>(null);

  const handleContinue = async () => {
    const keyFrame = keyFrameRef.current;

    if (!keyFrame) return;

    setIsOpening(true);
    setError(null);

    try {
      keyFrame.replaceChildren();
      await onContinue(keyFrame, hasPassword ? password : undefined);
      setPassword("");
      setIsKeyShown(true);
    } catch (openError) {
      keyFrame.replaceChildren();
      // Cancelled "Confirm it's you": stay here, ready to try again
      if (!(openError instanceof IdentityCheckCancelledError)) {
        setError(
          openError instanceof DynamicSessionExpiredError ||
            openError instanceof DynamicWrongPasswordError ||
            openError instanceof IdentityCheckUnavailableError
            ? openError.message
            : "Couldn't show your key. Please try again."
        );
      }
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <>
      <div className={styles.closeRow}>
        <button
          aria-label="Close"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.heroIcon}>
            <ExportKeyIcon aria-hidden="true" />
          </span>
          <div className={styles.headerText}>
            <RHeading className={styles.title} size="h6" weight="medium">
              Before You Export Your Key
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              Your private key is the master copy of this wallet.
            </RText>
          </div>
        </header>

        {isKeyShown ? null : (
          <>
            <div className={styles.warning}>
              <RIcon
                aria-hidden="true"
                className={styles.warningIcon}
                name="warning"
                size="small"
              />
              <div className={styles.warningText}>
                <RText size="body-sm">
                  Anyone with this key controls your Mavryk address and
                  everything in it.
                </RText>
                <RText color="neutral-700" size="body-sm">
                  Equiteez will never ask for it. Anyone who asks is trying to
                  take your funds.
                </RText>
              </div>
            </div>

            <label className={styles.confirm}>
              <input
                checked={isConfirmed}
                className={styles.confirmInput}
                onChange={(event) => setIsConfirmed(event.target.checked)}
                type="checkbox"
              />
              {isConfirmed ? (
                <CheckboxChecked
                  aria-hidden="true"
                  className={styles.checkbox}
                />
              ) : (
                <CheckboxUnchecked
                  aria-hidden="true"
                  className={styles.checkbox}
                />
              )}
              <RText size="body-sm">
                I&apos;m responsible for keeping this key safe and private.
              </RText>
            </label>

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

            <RText color="neutral-700" size="body-sm">
              Next you&apos;ll confirm it&apos;s you. The key then appears here
              in a secure frame from Dynamic; Equiteez never sees it.
            </RText>

            {error ? (
              <RText className={styles.error} role="alert" size="body-sm">
                {error}
              </RText>
            ) : null}

            <div className={styles.actions}>
              <RButton
                className={styles.action}
                onClick={onClose}
                size="medium"
                tone="black"
                variant="secondary"
              >
                Cancel
              </RButton>
              <RButton
                className={styles.action}
                disabled={
                  !isConfirmed || isOpening || (hasPassword && !password)
                }
                onClick={() => void handleContinue()}
                size="medium"
                tone="black"
              >
                Continue
              </RButton>
            </div>
          </>
        )}

        <div
          className={isKeyShown ? styles.keyFrame : undefined}
          hidden={!isKeyShown}
          ref={keyFrameRef}
        />

        {isKeyShown ? (
          <>
            <RText color="neutral-700" size="body-sm">
              This key is in Solana format. Store it somewhere only you can
              reach, then close this window.
            </RText>
            <RButton
              className={styles.action}
              onClick={onClose}
              size="medium"
              tone="black"
            >
              Done
            </RButton>
          </>
        ) : null}
      </div>
    </>
  );
}
