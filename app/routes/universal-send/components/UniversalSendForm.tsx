import { BigNumber } from "bignumber.js";
import clsx from "clsx";
import type { ReactNode } from "react";

import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import EthereumLogo from "~/icons/ethereum-logo.svg";
import MavrykLogo from "~/icons/mavrykLogo.svg";
import WalletIcon from "~/icons/wallet.svg?react";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { HashChip } from "~/lib/molecules/HashChip";
import { AssetField } from "~/lib/organisms/AssetField";
import { REthereumWalletDropdown } from "~/lib/organisms/REthereumWalletDropdown";
import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import {
  formatBps,
  formatRawAmount,
  getIntentRouteLabel,
  getIntentSlippageChoices,
} from "~/lib/intents/intentRoute";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";

import styles from "./UniversalSendForm.module.css";

type UniversalSendFormProps = {
  deposit: IntentsDepositController;
  ethereumWallet: EthereumContext;
  isMavrykBusy: boolean;
  onConnectMavryk: () => Promise<void> | void;
  onReview: () => Promise<void> | void;
  reviewError?: string | null;
};

function FieldCard({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.fieldCard}>
      <span aria-hidden="true" className={styles.fieldIcon}>
        {icon}
      </span>
      <div className={styles.fieldCopy}>
        <RText color="neutral-700" size="body-s">
          {label}
        </RText>
        {children}
      </div>
    </div>
  );
}

export function UniversalSendForm({
  deposit,
  ethereumWallet,
  isMavrykBusy,
  onConnectMavryk,
  onReview,
  reviewError,
}: UniversalSendFormProps) {
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
    selectRoute,
    switchToSource,
  } = deposit;

  if (catalog.status === "loading")
    return (
      <div className={styles.message} role="status">
        <RText color="neutral-700" size="body-sm">
          Loading routes…
        </RText>
      </div>
    );

  if (catalog.status !== "ready" || !route || !selected)
    return (
      <div className={styles.message}>
        <div className={styles.notice} role="alert">
          <RText color="neutral-700" size="body-sm">
            {catalog.status === "error"
              ? "The 1Click service is unavailable right now."
              : "No 1Click routes are available right now (GET /v1/routes returned none)."}
          </RText>
        </div>
        {catalog.status === "error" && (
          <RButton
            onClick={() => void catalog.refetch()}
            size="medium"
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
  const chainName = source?.chainName ?? `chain ${route.sourceChainId}`;
  const isBusy =
    ethereumWallet.isConnecting ||
    ethereumWallet.isReconnecting ||
    isMavrykBusy;
  const isInputDisabled = isBusy || Boolean(routeError);
  const slippageChoices = getIntentSlippageChoices(route.maxSlippageBps);
  const sourceIcon = source?.token === "native" ? EthereumLogo : UsdtToken;
  const balanceText =
    sourceBalance.status === "ready"
      ? (sourceBalance.balance?.toFormat() ?? "0")
      : sourceBalance.status === "disconnected"
        ? "Connect wallet"
        : sourceBalance.status === "loading"
          ? "Loading…"
          : "Unavailable";

  const primaryLabel = !ethereumWallet.isConnected
    ? "Connect Ethereum Wallet"
    : !recipient
      ? "Connect Mavryk Wallet"
      : !amount || amount.isZero()
        ? "Enter amount"
        : "Review Send";

  const handlePrimaryAction = async () => {
    if (!ethereumWallet.isConnected) return ethereumWallet.connect();
    if (!recipient) return onConnectMavryk();
    if (canReview && !isBusy) await onReview();
  };

  const handleUseMax = () =>
    setAmount(
      sourceBalance.balance?.decimalPlaces(
        Math.min(route.sourceDecimals, 8),
        BigNumber.ROUND_DOWN
      )
    );

  return (
    <div aria-label="Universal send" className={styles.form}>
      <FieldCard
        icon={<img alt="" className={styles.fieldImage} src={UsdtToken} />}
        label="Token"
      >
        <RText size="body-m" weight="medium">
          {destination?.symbol ?? "—"}
        </RText>
      </FieldCard>

      <FieldCard
        icon={<img alt="" className={styles.fieldImage} src={MavrykLogo} />}
        label="Network"
      >
        <RText size="body-m" weight="medium">
          Mavryk • Basenet
        </RText>
      </FieldCard>

      <FieldCard icon={<WalletIcon height={18} width={18} />} label="Recipient">
        {recipient ? (
          <HashChip
            aria-label={`Copy recipient address ${recipient}`}
            className={styles.address}
            firstCharsCount={8}
            hash={recipient}
            lastCharsCount={6}
            type="link"
          />
        ) : (
          <button
            className={styles.inlineAction}
            disabled={isBusy}
            onClick={() => void onConnectMavryk()}
            type="button"
          >
            Connect Mavryk Wallet
          </button>
        )}
      </FieldCard>

      <div className={styles.amountCard}>
        <div className={styles.amountTop}>
          <RText color="neutral-700" size="body-s">
            From
          </RText>
          <REthereumWalletDropdown />
        </div>

        <div className={styles.amountCenter}>
          <label className={styles.amountRow}>
            <span className={styles.visuallyHidden}>Amount in {symbol}</span>
            <AssetField
              assetDecimals={route.sourceDecimals}
              className={styles.amountInput}
              containerClassName={styles.amountInputContainer}
              disabled={isInputDisabled}
              inputMode="decimal"
              onChange={(value) =>
                setAmount(value ? new BigNumber(value) : undefined)
              }
              placeholder="0"
              readOnly={isAmountFixed}
              size={Math.max(amount?.toFixed().length ?? 1, 1)}
              style={{ padding: 0, border: 0, borderRadius: 0 }}
              value={amount?.toFixed()}
            />
            <span className={styles.amountSymbol}>{symbol}</span>
          </label>
          <RText color="neutral-700" size="body-sm">
            {estimate && !amountError && destination
              ? `Minimum you accept: ${formatRawAmount(
                  estimate.minimum,
                  route.settlementDecimals
                )} ${destination.symbol}`
              : `You receive ${destination?.symbol ?? "tokens"} on Mavryk`}
          </RText>
          {isAmountFixed && (
            <RText color="neutral-500" size="body-xs">
              Fixed by this route
            </RText>
          )}
        </div>

        <div className={styles.divider}>
          <RText color="neutral-500" size="body-xs">
            Pay with
          </RText>
        </div>

        <div className={styles.payRow}>
          <label className={styles.routePill}>
            <img alt="" className={styles.routeIcon} src={sourceIcon} />
            <span className={styles.visuallyHidden}>Pay with</span>
            <select
              className={styles.routeSelect}
              disabled={isBusy}
              onChange={(event) => selectRoute(event.target.value)}
              value={route.id}
            >
              {catalog.options.map((option) => (
                <option key={option.route.id} value={option.route.id}>
                  {`${getIntentRouteLabel(option)}${
                    option.availability === "available" ? "" : " (unavailable)"
                  }`}
                </option>
              ))}
            </select>
            <RIcon aria-hidden="true" name="arrow-short-down" size="small" />
          </label>

          <div className={styles.balance}>
            <RText color="neutral-700" size="body-s">
              Balance
            </RText>
            <RText size="body-sm">{balanceText}</RText>
          </div>

          {sourceBalance.status === "error" ? (
            <button
              className={styles.maxButton}
              onClick={() => void sourceBalance.refetch()}
              type="button"
            >
              Retry
            </button>
          ) : isAmountFixed ? null : (
            <button
              aria-label={`Use maximum ${symbol} balance`}
              className={styles.maxButton}
              disabled={sourceBalance.status !== "ready" || isInputDisabled}
              onClick={handleUseMax}
              type="button"
            >
              Use max
            </button>
          )}
        </div>
      </div>

      {isSlippageFixed ? (
        <div className={styles.slippageRow}>
          <RText color="neutral-700" size="body-s">
            Slippage tolerance
          </RText>
          <RText size="body-s">{`${formatBps(slippageBps)} (fixed)`}</RText>
        </div>
      ) : (
        <div
          aria-label="Slippage tolerance"
          className={styles.slippageRow}
          role="radiogroup"
        >
          <RText color="neutral-700" size="body-s">
            Slippage tolerance
          </RText>
          <div className={styles.slippageOptions}>
            {slippageChoices.map((bps) => (
              <button
                aria-checked={slippageBps === bps}
                className={styles.slippageOption}
                data-active={slippageBps === bps}
                disabled={isInputDisabled}
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

      <div className={clsx(styles.notice, styles.warning)}>
        <RIcon aria-hidden="true" name="info" size="small" />
        <RText size="body-s">
          Test page for 1Click (NEAR Intents). The exact quote is shown before
          your wallet signs one transaction on {chainName}.
          {sourceAddress ? " Refunds go to the sending wallet." : ""}
        </RText>
      </div>

      {routeError && (
        <RText color="red-500" role="alert" size="body-s">
          {routeError}
        </RText>
      )}
      {!routeError && amount && amountError && (
        <RText color="red-500" role="alert" size="body-s">
          {amountError}
        </RText>
      )}
      {!routeError && slippageError && (
        <RText color="red-500" role="alert" size="body-s">
          {slippageError}
        </RText>
      )}
      {isWrongNetwork && !routeError && (
        <div className={styles.walletNotice}>
          <RText size="body-s">
            Your wallet is on another network. Switch to {chainName} to send{" "}
            {symbol}.
          </RText>
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
        <RText color="red-500" role="alert" size="body-s">
          {reviewError ?? networkError ?? ethereumWallet.error}
        </RText>
      )}

      <RButton
        className={styles.submitButton}
        disabled={
          Boolean(routeError) ||
          (ethereumWallet.isConnected && Boolean(recipient) && !canReview)
        }
        isLoading={isBusy}
        onClick={handlePrimaryAction}
        size="large"
        tone="black"
      >
        {primaryLabel}
      </RButton>
    </div>
  );
}
