/**
 * "Before You Export Your Key" (Figma 8229:76438). Continue, once the user
 * takes responsibility for the key, opens Dynamic's own secure window with
 * the private key: Equiteez never sees it.
 */
import { useState } from "react";

import CheckboxChecked from "app/icons/checkbox-checked.svg?react";
import CheckboxUnchecked from "app/icons/checkbox-unchecked.svg?react";
import ExportKeyIcon from "app/icons/export-key.svg?react";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { DynamicSessionExpiredError } from "~/providers/WalletProvider/dynamic/dynamic.errors";

import styles from "./ExportKeyModal.module.css";

type ExportKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Opens Dynamic's key window; false when the user cancels Dynamic's check */
  onContinue: () => Promise<boolean>;
};

export function ExportKeyModal({
  isOpen,
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
      <ExportKeyContent onClose={onClose} onContinue={onContinue} />
    </CustomPopup>
  );
}

function ExportKeyContent({
  onClose,
  onContinue,
}: Omit<ExportKeyModalProps, "isOpen">) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    setIsOpening(true);
    setError(null);

    try {
      // Cancelled "confirm it's you": stay here, ready to try again
      if (await onContinue()) onClose();
      else setIsOpening(false);
    } catch (openError) {
      setError(
        openError instanceof DynamicSessionExpiredError
          ? openError.message
          : "Couldn't open the secure window. Please try again."
      );
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

        <div className={styles.warning}>
          <RIcon
            aria-hidden="true"
            className={styles.warningIcon}
            name="warning"
            size="small"
          />
          <div className={styles.warningText}>
            <RText size="body-sm">
              Anyone with this key controls your Mavryk address and everything
              in it.
            </RText>
            <RText color="neutral-700" size="body-sm">
              Equiteez will never ask for it. Anyone who asks is trying to take
              your funds.
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
            <CheckboxChecked aria-hidden="true" className={styles.checkbox} />
          ) : (
            <CheckboxUnchecked aria-hidden="true" className={styles.checkbox} />
          )}
          <RText size="body-sm">
            I&apos;m responsible for keeping this key safe and private.
          </RText>
        </label>

        <RText color="neutral-700" size="body-sm">
          Next you&apos;ll confirm it&apos;s you. The key then opens in a secure
          window from Dynamic; Equiteez never sees it.
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
            disabled={!isConfirmed || isOpening}
            onClick={() => void handleContinue()}
            size="medium"
            tone="black"
          >
            Continue
          </RButton>
        </div>
      </div>
    </>
  );
}
