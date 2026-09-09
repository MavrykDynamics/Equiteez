import { useCallback, useEffect, useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { PopupWithIcon } from "~/templates/PopupWIthIcon/PopupWithIcon";

import styles from "./TradeConfirmationPopup.module.css";

type TradeConfirmationPopupProps = {
  isOpen: boolean;
  onCancel: () => void;
  onContinue: () => Promise<void> | void;
};

export function TradeConfirmationPopup({
  isOpen,
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
      contentLabel="Before Your First Investment"
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
              Before Your First Investment
            </RHeading>
            <RText
              className={styles.description}
              color="neutral-700"
              size="body-sm"
            >
              To continue with your first investment, please review and accept
              the agreements below. This confirmation is only required once.
            </RText>
          </div>

          <div className={styles.agreements}>
            <RText className={styles.agreementText} size="body-sm">
              Lorem ipsum dolor sit amet consectetur. Scelerisque habitant diam
              vitae eleifend et in ridiculus hac.
            </RText>
            <RText className={styles.agreementText} size="body-sm">
              Lorem ipsum dolor sit amet consectetur. Eget mauris nibh at
              habitasse ornare aliquet. Diam eu lectus fermentum nunc commodo in
              sed magna tellus. Mauris tincidunt faucibus gravida blandit
              feugiat etiam posuere. Sapien convallis volutpat et pellentesque
              dolor tellus.
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
            size="large"
            tone="black"
            variant="secondary"
          >
            Cancel
          </RButton>
          <RButton
            className={styles.actionButton}
            disabled={!isAccepted}
            onClick={handleContinue}
            size="large"
            tone="black"
          >
            Confirm
          </RButton>
        </div>
      </div>
    </PopupWithIcon>
  );
}
