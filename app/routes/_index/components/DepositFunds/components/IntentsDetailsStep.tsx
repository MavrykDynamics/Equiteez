import { useState } from "react";
import { BigNumber } from "bignumber.js";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RTokenIcon } from "~/lib/atoms/RTokenIcon";
import { RTooltip } from "~/lib/atoms/RTooltip/RTooltip";
import { RAmountInput } from "~/lib/molecules/RAmountInput";
import { RSelectField } from "~/lib/molecules/RSelectField";
import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import {
  getIntentChainIcon,
  getIntentTokenIcon,
} from "~/lib/intents/intentAssetIcon";
import {
  formatBps,
  formatRawAmount,
  getIntentSlippageChoices,
} from "~/lib/intents/intentRoute";
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
  /** Returns to the wallets step when either wallet disconnected. */
  onConnectWallets: () => void;
  onReview: () => Promise<void> | void;
  onOpenPicker: (kind: IntentsPickerKind) => void;
  reviewError?: string | null;
};

const feeExplanation = (chainName: string) =>
  `Your wallet pays the ${chainName} network fee. Forwarding to the bridge is sponsored.`;

/** Step 2: what to receive, the source network/token, amount and quote. */
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
  const {
    catalog,
    selected,
    route,
    source,
    routeError,
    recipient,
    sourceAddress,
    sourceBalance,
    amount,
    setAmount,
    isAmountFixed,
    amountError,
    slippageBps,
    setSlippageBps,
    isSlippageFixed,
    slippageError,
    estimate,
    canReview,
    isWrongNetwork,
    isSwitching,
    networkError,
    switchToSource,
  } = deposit;

  if (catalog.status === "loading")
    return (
      <div className={styles.step}>
        <p className={styles.hint} role="status">
          Loading deposit routes…
        </p>
      </div>
    );

  if (catalog.status !== "ready" || !route || !selected)
    return (
      <div className={styles.step}>
        <RAlert header="Deposits are unavailable" role="alert">
          {catalog.status === "error"
            ? "The cross-chain deposit service is unavailable right now. Receive On Mavryk still works."
            : "No cross-chain deposit routes are available right now. Receive On Mavryk still works."}
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

  const destination = selected.destination;
  const symbol = source?.symbol ?? "Token";
  const chainName = source?.chainName ?? `Chain ${route.sourceChainId}`;
  const isBusy =
    ethereumWallet.isConnecting ||
    ethereumWallet.isReconnecting ||
    isMavrykBusy;
  const slippageChoices = getIntentSlippageChoices(route.maxSlippageBps);
  const settlementAmount = (raw: string) =>
    `${formatRawAmount(raw, route.settlementDecimals)} ${destination?.symbol ?? ""}`.trim();
  const destinationIcon = (size: "small" | "medium" | "large") => (
    <RTokenIcon
      label={destination?.symbol ?? "?"}
      size={size}
      src={getIntentTokenIcon(destination?.symbol)}
    />
  );
  const sourceIcon = (size: "small" | "medium") => (
    <RTokenIcon label={symbol} size={size} src={getIntentTokenIcon(symbol)} />
  );
  const showQuote = Boolean(estimate && !amountError && destination);
  const balanceText =
    sourceBalance.status === "ready" && sourceBalance.balance
      ? formatTokenBalance(sourceBalance.balance)
      : sourceBalance.status === "loading"
        ? "Loading…"
        : sourceBalance.status === "error"
          ? "Unavailable"
          : "—";
  const hint = routeError
    ? null
    : !source
      ? "Choose a network first"
      : isAmountFixed
        ? "The amount is fixed by this route."
        : !amount
          ? `Enter the amount of ${symbol} to send`
          : null;

  const hasWallets = ethereumWallet.isConnected && Boolean(recipient);
  const handlePrimaryAction = async () => {
    if (!hasWallets) return onConnectWallets();
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
              {sourceAddress ? shortenHash(sourceAddress) : "Not connected"}
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
          aria-label={source ? `Network, ${chainName}` : "Select network"}
          disabled={isBusy}
          icon={
            source ? (
              <RTokenIcon
                label={chainName}
                size="large"
                src={getIntentChainIcon(route.sourceChainId)}
              />
            ) : (
              <span aria-hidden="true" className={styles.walletIcon}>
                <RIcon name="arrow-long-up-right" size="small" />
              </span>
            )
          }
          isPlaceholder={!source}
          onClick={() => onOpenPicker("network")}
          subtitle={
            source ? "In your external wallet" : "Networks your wallet supports"
          }
          title={source ? chainName : "Select network"}
        />
      </div>

      <div className={styles.field}>
        <RAmountInput
          amount={amount}
          balance={
            !source ? (
              <>
                <WalletGlyph label="Balance" />
                <span>—</span>
              </>
            ) : (
              <>
                <WalletGlyph label="Balance" />
                <span
                  role={sourceBalance.status === "ready" ? undefined : "status"}
                >
                  {balanceText}
                </span>
                {sourceBalance.status === "error" && (
                  <button
                    className={styles.inlineAction}
                    onClick={() => void sourceBalance.refetch()}
                    type="button"
                  >
                    Retry
                  </button>
                )}
                {!isAmountFixed && (
                  <button
                    aria-label={`Use maximum ${symbol} balance`}
                    className={styles.inlineAction}
                    disabled={sourceBalance.status !== "ready" || isBusy}
                    onClick={() =>
                      setAmount(
                        sourceBalance.balance?.decimalPlaces(
                          Math.min(route.sourceDecimals, 8),
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
            )
          }
          decimals={route.sourceDecimals}
          disabled={!source || isBusy}
          isAmountDisabled={Boolean(routeError) || isAmountFixed}
          label="Amount to send"
          onChange={setAmount}
          onTokenClick={() => onOpenPicker("token")}
          token={source ? { symbol, icon: sourceIcon("medium") } : null}
        />
        {hint && <span className={styles.hint}>{hint}</span>}
        {!routeError && amount && amountError && (
          <span className={styles.error} role="alert">
            {amountError}
          </span>
        )}
      </div>

      {showQuote && estimate && (
        <div className={styles.quote}>
          <div className={styles.quoteReceive}>
            <span className={styles.quoteLabel}>You receive</span>
            <span className={styles.quoteReceiveValue}>
              {destinationIcon("medium")}≈ {settlementAmount(estimate.expected)}
            </span>
          </div>
          <dl aria-label="Estimate" className={styles.quoteRows}>
            <div className={styles.quoteRow}>
              <dt>Minimum received</dt>
              <dd>
                {settlementAmount(estimate.minimum)}
                {destinationIcon("small")}
              </dd>
            </div>
            <div className={styles.quoteRow}>
              <dt>Fee</dt>
              <dd>
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
              </dd>
            </div>
            <div className={styles.quoteRow}>
              <dt>Max slippage</dt>
              <dd>
                {isSlippageFixed ? (
                  `${formatBps(slippageBps)} (fixed)`
                ) : (
                  <button
                    aria-controls="intents-slippage"
                    aria-expanded={isSlippageOpen}
                    className={styles.slippageToggle}
                    data-open={isSlippageOpen || undefined}
                    disabled={isBusy || Boolean(routeError)}
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
                )}
              </dd>
            </div>
          </dl>
          {!isSlippageFixed && isSlippageOpen && (
            <div className={styles.slippagePanel} id="intents-slippage">
              <p className={styles.slippageText}>
                If the final price moves more than this, the deposit is
                cancelled and nothing is sent.
              </p>
              <div
                aria-label="Slippage tolerance"
                className={styles.slippageOptions}
                role="radiogroup"
              >
                {slippageChoices.map((bps) => (
                  <button
                    aria-checked={slippageBps === bps}
                    className={styles.slippageOption}
                    data-active={slippageBps === bps}
                    disabled={isBusy || Boolean(routeError)}
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

      {routeError && (
        <RAlert header="Route unavailable" role="alert">
          {routeError}
        </RAlert>
      )}
      {!routeError && slippageError && (
        <span className={styles.error} role="alert">
          {slippageError}
        </span>
      )}
      {isWrongNetwork && !routeError && (
        <div className={styles.networkNotice}>
          <span>
            Your wallet is on another network. Switch to {chainName} to send{" "}
            {symbol}.
          </span>
          <RButton
            isLoading={isSwitching}
            onClick={switchToSource}
            size="small"
            tone="black"
            variant="secondary"
          >
            Switch to {chainName}
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
        disabled={hasWallets && (Boolean(routeError) || !canReview)}
        isLoading={isBusy}
        onClick={handlePrimaryAction}
        size="large"
        tone="black"
      >
        {hasWallets ? "Review deposit" : "Connect wallets"}
      </RButton>
    </div>
  );
}
