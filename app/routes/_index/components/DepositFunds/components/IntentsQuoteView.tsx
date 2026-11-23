import type { ReactNode } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RTokenIcon } from "~/lib/atoms/RTokenIcon";
import { RTooltip } from "~/lib/atoms/RTooltip/RTooltip";
import type {
  IntentsOperationView,
  IntentsReview,
} from "~/hooks/useIntentsDeposit";
import {
  getIntentChainIcon,
  getIntentTokenIcon,
} from "~/lib/intents/intentAssetIcon";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import { secondsUntil } from "~/lib/intents/intentQuote";
import { formatBps, formatRawAmount } from "~/lib/intents/intentRoute";
import { RAlert } from "~/templates/Alert/RAlert";

import {
  CopyableAddress,
  DepositModalHeader,
  DetailRow,
  DotsLoader,
  shortenHash,
  TransferSummary,
  ValueWithIcon,
} from "./DepositParts";
import styles from "./IntentsQuoteView.module.css";

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
  onClose: () => void;
  isBackDisabled?: boolean;
  /** Funding action (EQ-FE-03); shown once instructions are available. */
  fundingSlot?: ReactNode;
};

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const feeExplanation = (chainName: string) =>
  `Your wallet pays the ${chainName} network fee. Forwarding to the bridge is sponsored.`;

/**
 * Review of a 1Click request, then of the executable quote. Every phase of
 * the existing flow renders here: local review → creating → preparing the
 * quote → funding instructions, with paused/mismatch notices.
 */
export function IntentsQuoteView({
  review,
  record,
  operationView,
  now,
  error,
  onConfirm,
  onBack,
  onClose,
  isBackDisabled = false,
  fundingSlot,
}: IntentsQuoteViewProps) {
  const { option, request } = review;
  const { route, source, destination } = option;
  const sourceSymbol = source?.symbol ?? "";
  const destinationSymbol = destination?.symbol ?? "";
  const chainName = source?.chainName ?? `chain ${route.sourceChainId}`;
  const sourceAmount = (raw: string) =>
    `${formatRawAmount(raw, route.sourceDecimals)} ${sourceSymbol}`.trim();
  // Settlement ERC-20 units shown as the destination token (1:1 bridge pair).
  const outAmount = (raw: string) =>
    `${formatRawAmount(raw, route.settlementDecimals)} ${destinationSymbol}`.trim();
  const instructions =
    operationView?.status === "ready"
      ? record?.backend?.fundingInstructions
      : null;
  const isCreating = review.phase === "creating";
  const sourceIcon = (size: "small" | "xlarge") => (
    <RTokenIcon
      label={sourceSymbol || "?"}
      size={size}
      src={getIntentTokenIcon(sourceSymbol)}
    />
  );
  const destinationIcon = (
    <RTokenIcon
      label={destinationSymbol || "?"}
      size="small"
      src={getIntentTokenIcon(destinationSymbol)}
    />
  );
  const amountIn = instructions?.amount ?? request.amountIn;
  const expected =
    instructions?.bridgeableAmountOut ?? review.expectedAmountOut;
  const minimum =
    instructions?.bridgeableMinAmountOut ?? request.acceptedMinAmountOut;

  const warning =
    review.phase !== "operation"
      ? null
      : operationView?.status === "paused"
        ? "Funding is paused for this route right now. Nothing was sent. Go back and try again later."
        : operationView?.status === "mismatch"
          ? `The deposit service returned instructions that do not match your request (${operationView.detail}). Nothing will be sent.`
          : null;

  return (
    <div className={styles.screen}>
      <DepositModalHeader
        isBackDisabled={isCreating || isBackDisabled}
        onBack={onBack}
        onClose={onClose}
        title="Review deposit"
      />

      <TransferSummary
        amount={sourceAmount(amountIn)}
        amountCaption={`on ${chainName}`}
        recipient={request.recipient}
        recipientCaption="Your Equiteez wallet on Mavryk"
        tokenIcon={sourceIcon("xlarge")}
      />

      <hr className={styles.divider} />

      <dl aria-label="Deposit route" className={styles.rows}>
        <DetailRow label="From">{shortenHash(request.refundAddress)}</DetailRow>
        <DetailRow label="Network">
          <ValueWithIcon
            icon={
              <RTokenIcon
                label={chainName}
                size="small"
                src={getIntentChainIcon(route.sourceChainId)}
              />
            }
          >
            {chainName}
          </ValueWithIcon>
        </DetailRow>
        <DetailRow label="To">
          {`${shortenHash(request.recipient)} (Equiteez)`}
        </DetailRow>
        <DetailRow label="Refunds go to">
          <CopyableAddress
            address={request.refundAddress}
            label="refund address"
          />
        </DetailRow>
        {instructions && (
          <>
            <DetailRow label="1Click deposit address">
              <CopyableAddress
                address={instructions.depositAddress}
                label="deposit address"
              />
            </DetailRow>
            <DetailRow label="Send within">
              <span aria-live="off">
                {formatCountdown(
                  secondsUntil(instructions.fundingExpiresAt, now)
                )}
              </span>
            </DetailRow>
          </>
        )}
      </dl>

      <hr className={styles.divider} />

      <dl
        aria-label={instructions ? "Executable quote" : "Deposit request"}
        className={styles.rows}
      >
        <DetailRow label={instructions ? "You send exactly" : "You send"}>
          <ValueWithIcon icon={sourceIcon("small")}>
            {sourceAmount(amountIn)}
          </ValueWithIcon>
        </DetailRow>
        <DetailRow label="You receive">
          <ValueWithIcon icon={destinationIcon}>
            ≈ {outAmount(expected)}
          </ValueWithIcon>
        </DetailRow>
        <DetailRow label="Minimum received">
          <ValueWithIcon icon={destinationIcon}>
            {outAmount(minimum)}
          </ValueWithIcon>
        </DetailRow>
        <DetailRow label="Fee">
          <RTooltip content={feeExplanation(chainName)}>
            <span
              aria-label={`Network fee only. ${feeExplanation(chainName)}`}
              className={styles.fee}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
            >
              Network fee only
              <RIcon name="info" size="small" />
            </span>
          </RTooltip>
        </DetailRow>
        <DetailRow label="Max slippage">
          {formatBps(request.slippageBps)}
        </DetailRow>
        {record?.operationId && (
          <DetailRow label="Operation ID">
            <CopyableAddress
              address={record.operationId}
              label="operation ID"
            />
          </DetailRow>
        )}
      </dl>

      {warning && (
        <RAlert header="Nothing was sent" role="alert">
          {warning}
        </RAlert>
      )}
      {error && (
        <RAlert header="Something went wrong" role="alert" type="error">
          {error}
        </RAlert>
      )}

      <div className={styles.actions}>
        {review.phase !== "operation" ? (
          <>
            <RButton
              className={styles.action}
              isLoading={isCreating}
              onClick={onConfirm}
              size="large"
              tone="black"
            >
              Confirm deposit
            </RButton>
            <p className={styles.caption}>
              Nothing is sent until the exact quote is ready. A quote below your
              minimum is rejected.
            </p>
          </>
        ) : operationView?.status === "preparing" ? (
          <RButton
            aria-busy="true"
            className={styles.action}
            disabled
            iconLeft={<DotsLoader />}
            size="large"
            tone="black"
          >
            Preparing your quote…
          </RButton>
        ) : (
          instructions && fundingSlot
        )}
      </div>
    </div>
  );
}
