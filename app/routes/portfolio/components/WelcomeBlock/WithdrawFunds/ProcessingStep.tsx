import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./WithdrawFundsModal.module.css";

type ProcessingStepProps = {
  amount: string;
  asset: string;
  onClose: () => void;
};

export function ProcessingStep({
  amount,
  asset,
  onClose,
}: ProcessingStepProps) {
  return (
    <div className={styles.statusContent}>
      <div className={styles.processingHeader}>
        <RHeading
          className={styles.processingAmount}
          size="h6"
          weight="medium"
        >
          {amount} {asset}
        </RHeading>
        <RText className={styles.description} color="neutral-700" size="body-sm">
          Transfering funds from one Mavryk Wallet to another.
        </RText>
      </div>

      <div className={styles.progressList}>
        <div className={styles.progressRow}>
          <div className={styles.progressDot} data-active="true">
            <RIcon
              aria-hidden="true"
              name="loading-progress"
              size="medium"
            />
          </div>
          <RText className={styles.progressCopy} size="body-sm">
            Waiting for confimations
          </RText>
          <RText
            className={styles.progressStatus}
            color="neutral-700"
            size="body-xs"
          >
            In progress
          </RText>
        </div>
      </div>

      <div className={styles.processingNotice}>
        <RIcon aria-hidden="true" name="info" size="medium" />
        <RText className={styles.noticeText} size="body-sm">
          You can close this window. The transfer will continue processing, and
          the funds will appear in the recipient’s wallet once the transaction
          is complete.
        </RText>
      </div>

      <RButton className={styles.closeAction} onClick={onClose} tone="black">
        Close and Go to Portfolio
      </RButton>
    </div>
  );
}
