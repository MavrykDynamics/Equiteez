import { useId, useState } from "react";
import { BigNumber } from "bignumber.js";

import { INTENTS_SLIPPAGE_OPTIONS_BPS } from "~/consts/intents";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RTokenIcon } from "~/lib/atoms/RTokenIcon";
import { RTooltip } from "~/lib/atoms/RTooltip/RTooltip";
import { RAmountInput } from "~/lib/molecules/RAmountInput";
import { RSelectField } from "~/lib/molecules/RSelectField";
import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import {
  getIntentNetworkIcon,
  getIntentTokenIcon,
} from "~/lib/intents/intentAssetIcon";
import { formatBps, formatRawAmount } from "~/lib/intents/intentCatalog";
import { formatTimeEstimate } from "~/lib/intents/intentQuote";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { RAlert } from "~/templates/Alert/RAlert";

import { AccountAvatar, shortenHash, WalletGlyph } from "./DepositParts";
import type { IntentsPickerKind } from "./IntentsPickerView";
import { formatTokenBalance } from "./IntentsPickerView";
import styles from "./IntentsView.module.css";

type IntentsDetailsStepProps = {
  deposit: IntentsDepositController;
  ethereumWallet: EthereumContext;
  isMavrykBusy: boolean;
  /** Returns to the wallets step when the Equiteez wallet disconnected. */
  onConnectWallets: () => void;
  onReview: () => Promise<void> | void;
  onOpenPicker: (kind: IntentsPickerKind) => void;
  reviewError?: string | null;
};

const feeExplanation =
  "1Click's fee is included in the amount you receive. You pay the source network fee; forwarding to the bridge is sponsored.";

/** Step 2: the source network/token, amount, refund address and price. */
export function IntentsDetailsStep({
  deposit,
  ethereumWallet,
  isMavrykBusy,
  onConnectWallets,
  onReview,
  onOpenPicker,
  reviewError,
}: IntentsDetailsStepProps) {
  const [isSlippageOpen, setIsSlippageOpen] = useState(false);
  const refundId = useId();
  const {
    catalog,
    catalogError,
    selected,
    network,
    recipient,
    canWalletSend,
    sourceBalance,
    amount,
    setAmount,
    amountError,
    slippageBps,
    setSlippageBps,
    slippageError,
    refundInput,
    setRefundInput,
    refundError,
    refundAddress,
    isRefundFromWallet,
    isRefundConfirmed,
    setIsRefundConfirmed,
    preview,
    previewStatus,
    previewError,
    refetchPreview,
    canReview,
    isPreparingReview,
    isWrongNetwork,
    isSwitching,
    networkError,
    switchToSource,
  } = deposit;

  if (catalog.status === "loading")
    return (
      <div className={styles.step}>
        <p className={styles.hint} role="status">
          Loading supported assets…
        </p>
      </div>
    );

  if (catalog.status === "error" || catalogError || !selected || !network)
    return (
      <div className={styles.step}>
        <RAlert header="Deposits are unavailable" role="alert">
          {catalog.status === "error"
            ? `${
                catalog.error?.code === "METADATA_DISABLED"
                  ? "Cross-chain deposits are turned off on this deployment."
                  : "The cross-chain deposit service is unavailable right now."
              } Receive On Mavryk still works.${
                catalog.error?.requestId
                  ? ` (Request ID: ${catalog.error.requestId})`
                  : ""
              }`
            : `${catalogError ?? "No source assets are available right now."} Receive On Mavryk still works.`}
        </RAlert>
        {catalog.status === "error" && (
          <RButton
            className={styles.primaryAction}
            onClick={() => void catalog.refetch()}
            size="large"
            tone="black"
            variant="secondary"
          >
            Try Again
          </RButton>
        )}
      </div>
    );

  const destination = catalog.settlement?.destination;
  const { asset } = selected;
  const symbol = asset.symbol;
  const isBusy =
    ethereumWallet.isConnecting ||
    ethereumWallet.isReconnecting ||
    isMavrykBusy ||
    isPreparingReview;
  const destinationAmount = (raw: string) =>
    `${formatRawAmount(raw, destination?.decimals ?? 6)} ${destination?.symbol ?? ""}`.trim();
  const destinationIcon = (size: "small" | "medium" | "large") => (
    <RTokenIcon
      label={destination?.symbol ?? "?"}
      size={size}
      src={getIntentTokenIcon(destination?.symbol)}
    />
  );
  const sourceIcon = (
    <RTokenIcon
      label={symbol}
      size="medium"
      src={getIntentTokenIcon(symbol, asset.coingeckoId)}
    />
  );
  const balanceText = !canWalletSend
    ? "—"
    : sourceBalance.status === "ready" && sourceBalance.balance
      ? formatTokenBalance(sourceBalance.balance)
      : sourceBalance.status === "loading"
        ? "Loading…"
        : sourceBalance.status === "error"
          ? "Unavailable"
          : "—";
  const timeEstimate = formatTimeEstimate(preview?.providerTimeEstimateSeconds);
  const settlementDecimals = catalog.settlement?.decimals ?? 6;

  const hasRecipient = Boolean(recipient);
  const handlePrimaryAction = async () => {
    if (!hasRecipient) return onConnectWallets();
    if (canReview && !isBusy) await onReview();
  };

  return (
    <div className={styles.step}>
      <div className={styles.routeCard}>
        <div className={styles.routeParty}>
          <span aria-hidden="true" className={styles.walletIcon}>
            <WalletGlyph />
          </span>
          <span className={styles.routePartyCopy}>
            <span className={styles.routeLabel}>From</span>
            <span className={styles.routeValue}>
              {canWalletSend && ethereumWallet.userAddress
                ? shortenHash(ethereumWallet.userAddress)
                : `Any ${network.name} wallet`}
            </span>
          </span>
        </div>
        <RIcon
          aria-hidden="true"
          className={styles.routeArrow}
          name="arrow-short-right"
          size="small"
        />
        <div className={styles.routeParty}>
          <AccountAvatar />
          <span className={styles.routePartyCopy}>
            <span className={styles.routeLabel}>To</span>
            <span className={styles.routeValue}>
              {recipient ? shortenHash(recipient) : "Not connected"}
            </span>
          </span>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Token to receive</span>
        <RSelectField
          aria-label="Token to receive"
          icon={destinationIcon("large")}
          subtitle="On Mavryk"
          title={destination?.symbol ?? "Unavailable"}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Network</span>
        <RSelectField
          aria-label={`Network, ${network.name}`}
          disabled={isBusy}
          icon={
            <RTokenIcon
              label={network.name}
              size="large"
              src={getIntentNetworkIcon(network.key)}
            />
          }
          onClick={() => onOpenPicker("network")}
          subtitle={
            canWalletSend
              ? "Send from your connected wallet"
              : "Send from any wallet or exchange"
          }
          title={network.name}
        />
      </div>

      <div className={styles.field}>
        <RAmountInput
          amount={amount}
          balance={
            <>
              <WalletGlyph label="Balance" />
              <span
                role={
                  !canWalletSend || sourceBalance.status === "ready"
                    ? undefined
                    : "status"
                }
              >
                {balanceText}
              </span>
              {canWalletSend && sourceBalance.status === "error" && (
                <button
                  className={styles.inlineAction}
                  onClick={() => void sourceBalance.refetch()}
                  type="button"
                >
                  Retry
                </button>
              )}
              {canWalletSend && (
                <button
                  aria-label={`Use maximum ${symbol} balance`}
                  className={styles.inlineAction}
                  disabled={sourceBalance.status !== "ready" || isBusy}
                  onClick={() =>
                    setAmount(
                      sourceBalance.balance?.decimalPlaces(
                        Math.min(asset.decimals, 8),
                        BigNumber.ROUND_DOWN
                      )
                    )
                  }
                  type="button"
                >
                  Max
                </button>
              )}
            </>
          }
          decimals={asset.decimals}
          disabled={isBusy}
          label="Amount to send"
          onChange={setAmount}
          onTokenClick={() => onOpenPicker("token")}
          token={{ symbol, icon: sourceIcon }}
        />
        {!amount && (
          <span className={styles.hint}>
            Enter the amount of {symbol} to send
          </span>
        )}
        {amount && amountError && (
          <span className={styles.error} role="alert">
            {amountError}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={refundId}>
          Refund address on {network.name}
        </label>
        {isRefundFromWallet ? (
          <span className={styles.hint}>
            Refunds go back to your connected wallet{" "}
            {shortenHash(refundAddress)} if the swap cannot complete.
          </span>
        ) : (
          <>
            <RInput
              aria-describedby={`${refundId}-hint`}
              aria-invalid={Boolean(refundError) || undefined}
              autoComplete="off"
              disabled={isBusy}
              id={refundId}
              onChange={(event) => setRefundInput(event.target.value)}
              placeholder={network.addressPlaceholder}
              spellCheck={false}
              value={refundInput}
            />
            {refundError ? (
              <span className={styles.error} role="alert">
                {refundError}
              </span>
            ) : (
              <span className={styles.hint} id={`${refundId}-hint`}>
                If the swap cannot complete, 1Click refunds here. Use your own
                wallet: a refund to an exchange address may never reach you.
              </span>
            )}
            {refundInput.trim() && !refundError && (
              <label className={styles.hint}>
                <input
                  checked={isRefundConfirmed}
                  disabled={isBusy}
                  onChange={(event) =>
                    setIsRefundConfirmed(event.target.checked)
                  }
                  type="checkbox"
                />{" "}
                I control this {network.name} address
                {network.hasChecksum
                  ? "."
                  : ". It has no checksum, so I checked it character by character."}
              </label>
            )}
          </>
        )}
      </div>

      {previewStatus === "loading" && (
        <p className={styles.hint} role="status">
          Getting a price…
        </p>
      )}
      {previewStatus === "error" && previewError && (
        <div className={styles.networkNotice} role="alert">
          <span>{previewError}</span>
          <RButton
            onClick={() => void refetchPreview()}
            size="small"
            tone="black"
            variant="secondary"
          >
            Retry
          </RButton>
        </div>
      )}

      {preview && previewStatus === "ready" && (
        <div className={styles.quote}>
          <div className={styles.quoteReceive}>
            <span className={styles.quoteLabel}>You receive</span>
            <span className={styles.quoteReceiveValue}>
              {destinationIcon("medium")}≈{" "}
              {destinationAmount(preview.destinationAmountOut)}
            </span>
          </div>
          <dl aria-label="Estimate" className={styles.quoteRows}>
            <div className={styles.quoteRow}>
              <dt>Minimum received</dt>
              <dd>
                {destinationAmount(preview.destinationMinAmountOut)}
                {destinationIcon("small")}
              </dd>
            </div>
            <div className={styles.quoteRow}>
              <dt>Fee</dt>
              <dd>
                <RTooltip content={feeExplanation}>
                  <span
                    aria-label={`Fee. ${feeExplanation}`}
                    className={styles.fee}
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                    tabIndex={0}
                  >
                    {preview.withdrawFee && preview.withdrawFee !== "0"
                      ? `${formatRawAmount(preview.withdrawFee, settlementDecimals)} ${catalog.settlement?.symbol ?? ""} included`
                      : "Included"}
                    <RIcon name="info" size="small" />
                  </span>
                </RTooltip>
              </dd>
            </div>
            {timeEstimate && (
              <div className={styles.quoteRow}>
                <dt>Swap time</dt>
                <dd>{timeEstimate} after your deposit confirms</dd>
              </div>
            )}
            <div className={styles.quoteRow}>
              <dt>Max slippage</dt>
              <dd>
                <button
                  aria-controls="intents-slippage"
                  aria-expanded={isSlippageOpen}
                  className={styles.slippageToggle}
                  data-open={isSlippageOpen || undefined}
                  disabled={isBusy}
                  onClick={() => setIsSlippageOpen((isOpen) => !isOpen)}
                  type="button"
                >
                  {formatBps(slippageBps)}
                  <RIcon
                    name={
                      isSlippageOpen ? "arrow-short-up" : "arrow-short-down"
                    }
                    size="small"
                  />
                </button>
              </dd>
            </div>
          </dl>
          {isSlippageOpen && (
            <div className={styles.slippagePanel} id="intents-slippage">
              <p className={styles.slippageText}>
                If the final price moves more than this, no deposit address is
                issued and nothing is sent.
              </p>
              <div
                aria-label="Slippage tolerance"
                className={styles.slippageOptions}
                role="radiogroup"
              >
                {INTENTS_SLIPPAGE_OPTIONS_BPS.map((bps) => (
                  <button
                    aria-checked={slippageBps === bps}
                    className={styles.slippageOption}
                    data-active={slippageBps === bps}
                    disabled={isBusy}
                    key={bps}
                    onClick={() => setSlippageBps(bps)}
                    role="radio"
                    type="button"
                  >
                    {formatBps(bps)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {slippageError && (
        <span className={styles.error} role="alert">
          {slippageError}
        </span>
      )}
      {isWrongNetwork && (
        <div className={styles.networkNotice}>
          <span>
            Your wallet is on another network. Switch to {network.name} to send{" "}
            {symbol}.
          </span>
          <RButton
            isLoading={isSwitching}
            onClick={switchToSource}
            size="small"
            tone="black"
            variant="secondary"
          >
            Switch to {network.name}
          </RButton>
        </div>
      )}
      {(networkError || reviewError || ethereumWallet.error) && (
        <RAlert header="Something went wrong" role="alert" type="error">
          {reviewError ?? networkError ?? ethereumWallet.error}
        </RAlert>
      )}

      <RButton
        className={styles.primaryAction}
        disabled={hasRecipient && !canReview}
        isLoading={isBusy}
        onClick={handlePrimaryAction}
        size="large"
        tone="black"
      >
        {hasRecipient ? "Review deposit" : "Connect Equiteez wallet"}
      </RButton>
    </div>
  );
}
