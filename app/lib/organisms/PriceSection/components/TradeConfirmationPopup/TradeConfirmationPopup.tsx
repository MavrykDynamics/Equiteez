import { useCallback, useEffect, useState, type ReactNode } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { PopupWithIcon } from "~/templates/PopupWIthIcon/PopupWithIcon";

import styles from "./TradeConfirmationPopup.module.css";

type TradeConfirmationPopupProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
  children?: ReactNode;
  deliveryMessage?: string;
  onCancel: () => void;
  onContinue: () => Promise<void> | void;
};

export function TradeConfirmationPopup({
  isOpen,
  title = "Before Your First Investment",
  description = "To continue with your first investment, please review and accept the agreements below. This confirmation is only required once.",
  children,
  deliveryMessage = "Your tokens will be delivered to your connected wallet,",
  onCancel,
  onContinue,
}: TradeConfirmationPopupProps) {
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsAccepted(false);
    }
  }, [isOpen]);

  const handleCancel = useCallback(() => {
    setIsAccepted(false);
    onCancel();
  }, [onCancel]);

  const handleContinue = useCallback(() => {
    if (!isAccepted) {
      return;
    }

    setIsAccepted(false);
    onCancel();
    return onContinue();
  }, [isAccepted, onCancel, onContinue]);

  return (
    <PopupWithIcon
      className={styles.popup}
      contentClassName={styles.content}
      contentLabel={title}
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={handleCancel}
    >
      <div className={styles.inner}>
        <div className={styles.headingGroup}>
          <div className={styles.headingCopy}>
            <RHeading
              as="h2"
              className={styles.title}
              size="h6"
              weight="medium"
            >
              {title}
            </RHeading>
            <RText
              className={styles.description}
              color="neutral-700"
              size="body-sm"
            >
              {description}
            </RText>
          </div>

          {children}

          <div className={styles.agreements}>
            <RText className={styles.agreementText} size="body-sm">
              Tokenized Real World Assets (RWAs) are digital tokens backed by
              physical or financial assets. Their value can go up or down, and
              returns are not guaranteed. Please invest only what you can afford
              to hold long term.
            </RText>
            <RText className={styles.agreementText} size="body-sm">
              By continuing, you confirm that you have completed identity
              verification (KYC), that the information you provided is accurate,
              and that you have read and agree to our Terms of Service, Risk
              Disclosure, and Token Purchase Agreement. {deliveryMessage} and
              you are solely responsible for keeping your wallet credentials and
              recovery phrase secure.
            </RText>
            <label className={styles.checkboxRow}>
              <span className={styles.checkboxControl}>
                <input
                  checked={isAccepted}
                  className={styles.checkbox}
                  onChange={(event) => setIsAccepted(event.target.checked)}
                  type="checkbox"
                />
              </span>
              <RText className={styles.checkboxText} size="body-sm">
                I understand the risks of investing in tokenized Real World
                Assets and that I am responsible for the self-custody of my
                investments.
              </RText>
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <RButton
            className={`${styles.actionButton} ${styles.cancelButton}`}
            onClick={handleCancel}
            size="medium"
            tone="black"
            variant="secondary"
          >
            Cancel
          </RButton>
          <RButton
            className={styles.actionButton}
            disabled={!isAccepted}
            onClick={handleContinue}
            size="medium"
            tone="black"
          >
            Confirm
          </RButton>
        </div>
      </div>
    </PopupWithIcon>
  );
}
