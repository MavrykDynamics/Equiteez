import clsx from "clsx";
import type { ReactNode } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { HashChip } from "~/lib/molecules/HashChip";
import type { IntentsReview } from "~/hooks/useIntentsDeposit";
import { isIntentQuoteExpired, secondsUntil } from "~/lib/intents/intentQuote";
import { formatRawAmount } from "~/lib/intents/intentRoute";

import styles from "../RDepositFundsModal.module.css";
import intentsStyles from "./IntentsView.module.css";

type QuoteReview = Exclude<
  IntentsReview,
  { phase: "form" | "quoting" | "tracking" }
>;

type IntentsQuoteViewProps = {
  review: QuoteReview;
  now: number;
  error: string | null;
  onConfirm: () => Promise<void> | void;
  onRefresh: () => Promise<void> | void;
  onAcceptUpdate: () => void;
  onBack: () => void;
  isBackDisabled?: boolean;
  /** Funding action (EQ-FE-03); shown once the operation is persisted. */
  fundingSlot?: ReactNode;
};

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={intentsStyles.quoteRow}>
      <dt>
        <RText color="neutral-700" size="body-s">
          {label}
        </RText>
      </dt>
      <dd>
        <RText size="body-s">{children}</RText>
      </dd>
    </div>
  );
}

export function IntentsQuoteView({
  review,
  now,
  error,
  onConfirm,
  onRefresh,
  onAcceptUpdate,
  onBack,
  isBackDisabled = false,
  fundingSlot,
}: IntentsQuoteViewProps) {
  const { route, preview } = review;
  const operation = "operation" in review ? review.operation : undefined;
  const quote = operation ?? preview;
  const expiresAt = operation?.quoteExpiresAt ?? preview.expiresAt;
  const isExpired = isIntentQuoteExpired(expiresAt, now);
  const source = route.source.token;
  const destination = route.destination;
  const out = (raw: string) =>
    `${formatRawAmount(raw, destination.decimals)} ${destination.symbol}`;

  return (
    <div className={styles.statusContent}>
      <div className={styles.statusHeader}>
        <RHeading className={styles.statusAmount} size="h6" weight="medium">
          Review Deposit
        </RHeading>
        <RText
          className={styles.statusDescription}
          color="neutral-700"
          size="body-sm"
        >
          Swap on {route.source.chainName} and deliver to your Mavryk account
        </RText>
      </div>

      <dl className={intentsStyles.quoteList}>
        <Row label="You send">
          {formatRawAmount(quote.amountIn, source.decimals)} {source.symbol} on{" "}
          {route.source.chainName}
        </Row>
        <Row label="Expected to receive">{out(quote.amountOut)}</Row>
        <Row label="Minimum to receive">{out(quote.minAmountOut)}</Row>
        <Row label="Recipient">
          <HashChip
            aria-label={`Copy recipient address ${quote.recipient}`}
            firstCharsCount={8}
            hash={quote.recipient}
            lastCharsCount={4}
            type="link"
          />
        </Row>
        <Row label="Fees">
          Your wallet pays the {route.source.chainName} network fee. Forwarding
          to the bridge is sponsored.
        </Row>
        <Row label={operation ? "Send funds within" : "Quote expires in"}>
          <span aria-live="off">
            {isExpired
              ? "Expired"
              : formatCountdown(secondsUntil(expiresAt, now))}
          </span>
        </Row>
      </dl>

      {review.phase === "reconfirm" && (
        <div className={clsx(styles.notice, styles.warning)} role="alert">
          <RText color="neutral-700" size="body-sm">
            <strong>The final quote changed.</strong> Expected{" "}
            {out(preview.amountOut)} → {out(review.operation.amountOut)};
            minimum {out(preview.minAmountOut)} →{" "}
            {out(review.operation.minAmountOut)}. Confirm again to continue.
          </RText>
        </div>
      )}

      {error && (
        <RText color="red-500" role="alert" size="body-s">
          {error}
        </RText>
      )}

      {review.phase === "review" || review.phase === "creating" ? (
        isExpired ? (
          <RButton
            className={styles.statusCloseButton}
            onClick={onRefresh}
            size="medium"
            tone="black"
          >
            Refresh Quote
          </RButton>
        ) : (
          <RButton
            className={styles.statusCloseButton}
            isLoading={review.phase === "creating"}
            onClick={onConfirm}
            size="medium"
            tone="black"
          >
            Confirm Quote
          </RButton>
        )
      ) : review.phase === "reconfirm" ? (
        <RButton
          className={styles.statusCloseButton}
          disabled={isExpired}
          onClick={onAcceptUpdate}
          size="medium"
          tone="black"
        >
          Accept Updated Quote
        </RButton>
      ) : (
        fundingSlot
      )}

      <RButton
        className={styles.statusCloseButton}
        disabled={review.phase === "creating" || isBackDisabled}
        onClick={onBack}
        size="medium"
        tone="black"
        variant="secondary"
      >
        Back
      </RButton>
    </div>
  );
}
