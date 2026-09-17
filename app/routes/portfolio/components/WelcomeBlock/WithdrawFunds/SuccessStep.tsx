import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./WithdrawFundsModal.module.css";

type SuccessStepProps = {
  amount: string;
  asset: string;
  onClose: () => void;
  onCopy: () => void;
  transactionHash: string;
};

export function SuccessStep({
  amount,
  asset,
  onClose,
  onCopy,
  transactionHash,
}: SuccessStepProps) {
  return (
    <div className={styles.statusContent}>
      <div className={styles.successIcon}>
        <RIcon aria-hidden="true" name="check" size="medium" />
      </div>
      <div className={styles.successHeader}>
        <RHeading className={styles.title} size="h6" weight="medium">
          Withdraw Confirmed
        </RHeading>
        <RText
          className={styles.description}
          color="neutral-700"
          size="body-sm"
        >
          Your funds have been successfully transferred.
          <br />
          <strong>
            {amount} {asset}
          </strong>{" "}
          is now available in your wallet and ready to use.
        </RText>
      </div>
      <div className={styles.transactionPill}>
        <span className={styles.confirmed}>
          <span className={styles.confirmedDot} />
          Confirmed on-chain
        </span>
        <span className={styles.transactionDivider} />
        <span className={styles.transaction}>
          Txn{" "}
          <button
            aria-label="Copy transaction hash"
            onClick={onCopy}
            type="button"
          >
            {formatTransactionHash(transactionHash)}
            <RIcon aria-hidden="true" name="copy" size="small" />
          </button>
        </span>
      </div>
      <div className={styles.successDivider} />
      <RButton className={styles.submitButton} onClick={onClose} tone="black">
        OK
      </RButton>
    </div>
  );
}

function formatTransactionHash(hash: string) {
  const prefixLength = 10;
  const suffixLength = 4;

  if (hash.length <= prefixLength + suffixLength) return hash;

  return `${hash.slice(0, prefixLength)}...${hash.slice(-suffixLength)}`;
}
