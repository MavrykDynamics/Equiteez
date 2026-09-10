import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { HashChip } from "~/lib/molecules/HashChip";

import styles from "./ConfirmedView.module.css";

type ConfirmedViewProps = {
  transactionHash: string;
  explorer?: { name: string; url: string };
  onClose: () => void;
};

export function ConfirmedView({
  transactionHash,
  explorer,
  onClose,
}: ConfirmedViewProps) {
  return (
    <div className={styles.content}>
      <div className={styles.successIcon}>
        <RIcon name="ok" size="medium" />
      </div>
      <div className={styles.copy} role="status">
        <RHeading size="h6" weight="medium">
          Transaction Submitted
        </RHeading>
        <RText color="neutral-700" size="body-sm">
          Your transaction has been submitted.
          <br />
          Your funds are being transferred to your wallet. You’ll be notified
          once they’re available.
        </RText>
      </div>
      <div className={styles.transaction}>
        <RText className={styles.status} size="body-sm">
          <span className={styles.statusDot} aria-hidden="true" />
          Confirmed on-chain
        </RText>
        <div className={styles.transactionDetails}>
          <RText color="neutral-700" size="body-sm">
            Txn
          </RText>
          <HashChip
            aria-label={`Copy transaction hash ${transactionHash}`}
            className={styles.hash}
            firstCharsCount={10}
            lastCharsCount={4}
            hash={transactionHash}
            type="link"
          />
          {explorer && (
            <a
              aria-label={`View transaction on ${explorer.name}`}
              className={styles.explorerLink}
              href={explorer.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <RIcon name="link" size="small" />
            </a>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <RButton
          onClick={onClose}
          size="medium"
          tone="black"
          variant="secondary"
        >
          Close And Continue Browsing
        </RButton>
        <RButton
          as="link"
          to="/portfolio"
          onClick={onClose}
          size="medium"
          tone="black"
        >
          View Details
        </RButton>
      </div>
    </div>
  );
}
