import clsx from "clsx";
import type { ReactNode } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { HashChip } from "~/lib/molecules/HashChip";
import type {
  IntentsOperationView,
  IntentsReview,
} from "~/hooks/useIntentsDeposit";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import { secondsUntil } from "~/lib/intents/intentQuote";
import { formatBps, formatRawAmount } from "~/lib/intents/intentRoute";

import styles from "../RDepositFundsModal.module.css";
import intentsStyles from "./IntentsView.module.css";

type QuoteReview = Extract<
  IntentsReview,
  { phase: "review" | "creating" | "operation" }
>;

type IntentsQuoteViewProps = {
  review: QuoteReview;
  /** Persisted record of this request, once confirmed. */
  record: IntentRecord | undefined;
  operationView: IntentsOperationView | null;
  now: number;
  error: string | null;
  onConfirm: () => Promise<void> | void;
  onBack: () => void;
  isBackDisabled?: boolean;
  /** Funding action (EQ-FE-03); shown once instructions are available. */
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

function Address({ label, value }: { label: string; value: string }) {
  return (
    <HashChip
      aria-label={`Copy ${label} ${value}`}
      firstCharsCount={8}
      hash={value}
      lastCharsCount={6}
      type="link"
    />
  );
}

export function IntentsQuoteView({
  review,
  record,
  operationView,
  now,
  error,
  onConfirm,
  onBack,
  isBackDisabled = false,
  fundingSlot,
}: IntentsQuoteViewProps) {
  const { option, request } = review;
  const { route, source, destination } = option;
  const sourceSymbol = source?.symbol ?? "";
  const chainName = source?.chainName ?? `chain ${route.sourceChainId}`;
  const sourceAmount = (raw: string) =>
    `${formatRawAmount(raw, route.sourceDecimals)} ${sourceSymbol}`.trim();
  // Settlement ERC-20 units shown as the destination token (1:1 bridge pair).
  const outAmount = (raw: string) =>
    `${formatRawAmount(raw, route.settlementDecimals)} ${destination?.symbol ?? ""}`.trim();
  const instructions =
    operationView?.status === "ready"
      ? record?.backend?.fundingInstructions
      : null;
  const isCreating = review.phase === "creating";

  const notice = (text: ReactNode, tone: "info" | "warning" = "info") => (
    <div
      className={clsx(styles.notice, tone === "warning" && styles.warning)}
      role={tone === "warning" ? "alert" : "status"}
    >
      <RText color="neutral-700" size="body-sm">
        {text}
      </RText>
    </div>
  );

  return (
    <div className={styles.statusContent}>
      <div className={styles.statusHeader}>
        <RHeading className={styles.statusAmount} size="h6" weight="medium">
          {instructions ? "Send Funds" : "Review Deposit"}
        </RHeading>
        <RText
          className={styles.statusDescription}
          color="neutral-700"
          size="body-sm"
        >
          Swap on {chainName} and deliver to your Mavryk account
        </RText>
      </div>

      {instructions ? (
        <dl className={intentsStyles.quoteList} aria-label="Executable quote">
          <Row label="You send exactly">
            {sourceAmount(instructions.amount)} on {chainName}
          </Row>
          <Row label="To 1Click deposit address">
            <Address
              label="deposit address"
              value={instructions.depositAddress}
            />
          </Row>
          <Row label="Expected to receive">
            {outAmount(instructions.bridgeableAmountOut)}
          </Row>
          <Row label="Minimum to receive">
            {outAmount(instructions.bridgeableMinAmountOut)}
          </Row>
          <Row label="Recipient">
            <Address label="recipient address" value={request.recipient} />
          </Row>
          <Row label="Fees">
            Your wallet pays the {chainName} network fee. Forwarding to the
            bridge is sponsored.
          </Row>
          <Row label="Send funds within">
            <span aria-live="off">
              {formatCountdown(
                secondsUntil(instructions.fundingExpiresAt, now)
              )}
            </span>
          </Row>
          {record?.operationId && (
            <Row label="Operation ID">
              <Address label="operation ID" value={record.operationId} />
            </Row>
          )}
        </dl>
      ) : (
        <dl className={intentsStyles.quoteList} aria-label="Deposit request">
          <Row label="You send">
            {sourceAmount(request.amountIn)} on {chainName}
          </Row>
          <Row label="Minimum you accept">
            {outAmount(request.acceptedMinAmountOut)}
          </Row>
          <Row label="Slippage tolerance">{formatBps(request.slippageBps)}</Row>
          <Row label="Recipient">
            <Address label="recipient address" value={request.recipient} />
          </Row>
          <Row label="Refunds go to">
            <Address label="refund address" value={request.refundAddress} />
          </Row>
          <Row label="Fees">
            Your wallet pays the {chainName} network fee. Forwarding to the
            bridge is sponsored.
          </Row>
        </dl>
      )}

      {review.phase !== "operation"
        ? notice(
            "Confirming registers this deposit with the service. Your wallet is asked to sign only after the exact quote is ready; a quote below your minimum is rejected and nothing is sent."
          )
        : operationView?.status === "preparing"
          ? notice("Preparing your quote…")
          : operationView?.status === "paused"
            ? notice(
                "Funding is paused for this route right now. Nothing was sent. Go back and try again later.",
                "warning"
              )
            : operationView?.status === "mismatch"
              ? notice(
                  `The deposit service returned instructions that do not match your request (${operationView.detail}). Nothing will be sent.`,
                  "warning"
                )
              : null}

      {error && (
        <RText color="red-500" role="alert" size="body-s">
          {error}
        </RText>
      )}

      {review.phase !== "operation" ? (
        <RButton
          className={styles.statusCloseButton}
          isLoading={isCreating}
          onClick={onConfirm}
          size="medium"
          tone="black"
        >
          Confirm Deposit
        </RButton>
      ) : (
        instructions && fundingSlot
      )}

      <RButton
        className={styles.statusCloseButton}
        disabled={isCreating || isBackDisabled}
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
