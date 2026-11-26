import type { ReactNode } from "react";
import QRCode from "react-qr-code";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RTokenIcon } from "~/lib/atoms/RTokenIcon";
import { RTooltip } from "~/lib/atoms/RTooltip/RTooltip";
import type {
  IntentsOperationView,
  IntentsReview,
} from "~/hooks/useIntentsDeposit";
import {
  getIntentNetworkIcon,
  getIntentTokenIcon,
} from "~/lib/intents/intentAssetIcon";
import {
  formatBps,
  formatRawAmount,
  fromRawAmount,
} from "~/lib/intents/intentCatalog";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import {
  formatCountdown,
  formatTimeEstimate,
  secondsUntil,
} from "~/lib/intents/intentQuote";
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
  notice?: string | null;
  onConfirm: () => Promise<void> | void;
  onBack: () => void;
  onClose: () => void;
  isBackDisabled?: boolean;
  /** Send actions; shown once the deposit address is published. */
  fundingSlot?: ReactNode;
};

const feeExplanation =
  "1Click's fee is included in the amount you receive. You pay the source network fee; forwarding to the bridge is sponsored.";

/**
 * Review of a 1Click request, then the deposit screen (backend.md §8, §9):
 * network, exact amount, deposit address with QR code, memo, countdown to
 * `fundingExpiresAt` and the refund address, so the user can pay from any
 * wallet or exchange. Every phase renders here: local review → creating →
 * preparing the quote → deposit instructions, with paused/mismatch notices.
 */
export function IntentsQuoteView({
  review,
  record,
  operationView,
  now,
  error,
  notice,
  onConfirm,
  onBack,
  onClose,
  isBackDisabled = false,
  fundingSlot,
}: IntentsQuoteViewProps) {
  const { option, settlement, request, preview } = review;
  const { asset, network } = option;
  const destination = settlement.destination;
  const sourceAmount = (raw: string) =>
    `${formatRawAmount(raw, asset.decimals)} ${asset.symbol}`;
  const settlementAmount = (raw: string) =>
    `${formatRawAmount(raw, settlement.decimals)} ${destination.symbol}`;
  const destinationAmount = (raw: string) =>
    `${formatRawAmount(raw, destination.decimals)} ${destination.symbol}`;
  const instructions =
    operationView?.status === "ready"
      ? record?.backend?.fundingInstructions
      : null;
  const isCreating = review.phase === "creating";
  const sourceIcon = (size: "small" | "xlarge") => (
    <RTokenIcon
      label={asset.symbol}
      size={size}
      src={getIntentTokenIcon(asset.symbol, asset.coingeckoId)}
    />
  );
  const destinationIcon = (
    <RTokenIcon
      label={destination.symbol}
      size="small"
      src={getIntentTokenIcon(destination.symbol)}
    />
  );
  const amountIn = instructions?.amount ?? request.amountIn;
  const expected = instructions
    ? settlementAmount(instructions.bridgeableAmountOut)
    : destinationAmount(preview.destinationAmountOut);
  const minimum = instructions
    ? settlementAmount(instructions.bridgeableMinAmountOut)
    : destinationAmount(preview.destinationMinAmountOut);
  const timeEstimate = formatTimeEstimate(preview.providerTimeEstimateSeconds);

  const warning =
    review.phase !== "operation"
      ? null
      : operationView?.status === "paused"
        ? "Deposits are temporarily unavailable. Do not send anything. Go back and try again later."
        : operationView?.status === "mismatch"
          ? `The deposit service returned instructions that do not match your request (${operationView.detail}). Do not send anything.`
          : null;

  return (
    <div className={styles.screen}>
      <DepositModalHeader
        isBackDisabled={isCreating || isBackDisabled}
        onBack={onBack}
        onClose={onClose}
        title={instructions ? "Send your deposit" : "Review deposit"}
      />

      <TransferSummary
        amount={sourceAmount(amountIn)}
        amountCaption={`on ${network.name}`}
        recipient={request.recipient}
        recipientCaption="Your Equiteez wallet on Mavryk"
        tokenIcon={sourceIcon("xlarge")}
      />

      {instructions && (
        <>
          <div className={styles.qr}>
            <QRCode
              aria-label={`QR code for the ${network.name} deposit address`}
              role="img"
              size={146}
              value={instructions.depositAddress}
            />
          </div>
          <RAlert header={`Send exactly ${sourceAmount(instructions.amount)}`}>
            Send it on {network.name} before the timer runs out. An exchange
            that deducts a withdrawal fee delivers less, and 1Click then refunds
            instead of swapping.
            {instructions.depositMemo &&
              " Include the memo below, or the deposit cannot be credited."}
          </RAlert>
        </>
      )}

      <hr className={styles.divider} />

      <dl aria-label="Deposit route" className={styles.rows}>
        <DetailRow label="Network">
          <ValueWithIcon
            icon={
              <RTokenIcon
                label={network.name}
                size="small"
                src={getIntentNetworkIcon(network.key)}
              />
            }
          >
            {network.name}
          </ValueWithIcon>
        </DetailRow>
        {instructions && (
          <>
            <DetailRow label="Amount to send">
              <CopyableAddress
                address={fromRawAmount(
                  instructions.amount,
                  asset.decimals
                ).toFixed()}
                isFull
                label="exact amount"
              />
            </DetailRow>
            <DetailRow label="Deposit address">
              <CopyableAddress
                address={instructions.depositAddress}
                label="deposit address"
              />
            </DetailRow>
            {instructions.depositMemo && (
              <DetailRow label="Memo (required)">
                <CopyableAddress
                  address={instructions.depositMemo}
                  className={styles.memo}
                  isFull
                  label="memo"
                />
              </DetailRow>
            )}
            <DetailRow label="Send within">
              <span aria-live="off">
                {formatCountdown(
                  secondsUntil(instructions.fundingExpiresAt, now)
                )}
              </span>
            </DetailRow>
          </>
        )}
        <DetailRow label="To">
          {`${shortenHash(request.recipient)} (Equiteez)`}
        </DetailRow>
        <DetailRow label="Refunds go to">
          <CopyableAddress
            address={request.refundAddress}
            label="refund address"
          />
        </DetailRow>
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
          <ValueWithIcon icon={destinationIcon}>≈ {expected}</ValueWithIcon>
        </DetailRow>
        <DetailRow label="Minimum received">
          <ValueWithIcon icon={destinationIcon}>{minimum}</ValueWithIcon>
        </DetailRow>
        <DetailRow label="Fee">
          <RTooltip content={feeExplanation}>
            <span
              aria-label={`Fee. ${feeExplanation}`}
              className={styles.fee}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
            >
              {preview.withdrawFee && preview.withdrawFee !== "0"
                ? `${formatRawAmount(preview.withdrawFee, settlement.decimals)} ${settlement.symbol} included`
                : "Included"}
              <RIcon name="info" size="small" />
            </span>
          </RTooltip>
        </DetailRow>
        {preview.refundFee && preview.refundFee !== "0" && (
          <DetailRow label="Refund fee (only if refunded)">
            {sourceAmount(preview.refundFee)}
          </DetailRow>
        )}
        {timeEstimate && (
          <DetailRow label="Swap time">{timeEstimate}</DetailRow>
        )}
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

      {notice && (
        <RAlert header="Price updated" role="status">
          {notice}
        </RAlert>
      )}
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
              Nothing is sent yet. Next you get a deposit address with the exact
              amount; a price below your minimum is rejected.
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
            Preparing your deposit address…
          </RButton>
        ) : (
          instructions && fundingSlot
        )}
      </div>
    </div>
  );
}
