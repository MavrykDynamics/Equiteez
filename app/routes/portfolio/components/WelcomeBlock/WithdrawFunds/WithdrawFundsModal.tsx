import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import styles from "./WithdrawFundsModal.module.css";
import { WithdrawFlow } from "./WithdrawFlow";

type WithdrawFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function WithdrawFundsModal({
  isOpen,
  onClose,
}: WithdrawFundsModalProps) {
  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Withdraw funds"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close withdraw funds"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      {/* Mounted only while open, so every opening starts a fresh form */}
      <WithdrawFlow
        header={
          <header className={styles.header}>
            <RHeading className={styles.title} size="h6" weight="medium">
              Withdraw Funds
            </RHeading>
            <RText
              className={styles.description}
              color="neutral-700"
              size="body-sm"
            >
              Transfer funds from one Mavryk Wallet to another.
            </RText>
          </header>
        }
        onClose={onClose}
      />
    </CustomPopup>
  );
}
