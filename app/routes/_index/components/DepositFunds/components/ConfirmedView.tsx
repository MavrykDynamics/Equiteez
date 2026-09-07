import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { toLocalFormat } from "~/lib/formaters/formaters";
import { HashChip } from "~/lib/molecules/HashChip";

import styles from "./ConfirmedView.module.css";

type ConfirmedViewProps = {
  amount: string;
  tokenSymbol: string;
  transactionHash: string;
  explorer?: { name: string; url: string };
  onClose: () => void;
};

export function ConfirmedView({
  amount,
  tokenSymbol,
  transactionHash,
  explorer,
  onClose,
}: ConfirmedViewProps) {
  const amountLabel = `${toLocalFormat(amount, {})} ${tokenSymbol}`;

  return (
    <div className={styles.content}>
      <div className={styles.successIcon}>
        <RIcon name="ok" size="medium" />
      </div>
      <div className={styles.copy} role="status">
        <RHeading size="h6" weight="medium">
          Transaction Confirmed
        </RHeading>
        <RText color="neutral-700" size="body-sm">
          Your transaction has been successfully submitted.
          <br />
          <RText size="body-sm">{amountLabel}</RText> is awaiting arrival.
        </RText>
      </div>
      <div className={styles.transaction}>
        <RText className={styles.status} size="body-sm">
          <span className={styles.statusDot} aria-hidden="true" />
          Submitted on-chain
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
          View Portfolio
        </RButton>
      </div>
    </div>
  );
}
