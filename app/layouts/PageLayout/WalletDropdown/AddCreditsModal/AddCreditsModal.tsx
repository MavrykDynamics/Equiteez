import { RButton } from "~/lib/atoms/RButton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import styles from "./AddCreditsModal.module.css";

type AddCreditsModalProps = {
  isOpen: boolean;
  blockedReason?: string;
  onClose: () => void;
  // Retained for existing consumers; blocked presentation never invokes these.
  onAddCredits?: (amount: number) => Promise<void>;
  walletBalanceUsd?: number;
};

export function AddCreditsModal({
  isOpen,
  blockedReason,
  onClose,
}: AddCreditsModalProps) {
  return (
    <CustomPopup
      isOpen={isOpen}
      contentPosition="center"
      className={styles.modal}
      overlayClassName={styles.overlay}
      contentLabel="Top Up unavailable"
      onRequestClose={onClose}
    >
      <div className={styles.content}>
        <RHeading size="h6">Top Up unavailable</RHeading>
        <RText size="body-sm">
          {blockedReason ??
            "Credit pricing and safe top-up processing are not yet available. Your existing balance is unchanged."}
        </RText>
        <RText size="body-sm">
          Credits are prepaid and cannot be withdrawn. Any existing top-up
          continues in Relay activity; reopening this window does not send
          another payment.
        </RText>
        <RButton onClick={onClose}>Close</RButton>
      </div>
    </CustomPopup>
  );
}
