import { BigNumber } from "bignumber.js";
import clsx from "clsx";

import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import { INTENTS_SLIPPAGE_OPTIONS_BPS } from "~/consts/intents";
import EthereumLogo from "~/icons/ethereum-logo.svg";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { HashChip } from "~/lib/molecules/HashChip";
import { REthereumWalletDropdown } from "~/lib/organisms/REthereumWalletDropdown";
import { ZERO } from "~/lib/utils/numbers";
import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import {
  formatBps,
  formatRawAmount,
  getIntentRouteLabel,
} from "~/lib/intents/intentRoute";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";

import styles from "../RDepositFundsModal.module.css";
import intentsStyles from "./IntentsView.module.css";
import { DepositAmountField } from "./BridgeView";

type IntentsViewProps = {
  deposit: IntentsDepositController;
  ethereumWallet: EthereumContext;
  isMavrykBusy: boolean;
  onConnectMavryk: () => Promise<void> | void;
  onReview: () => Promise<void> | void;
  reviewError?: string | null;
};

export function IntentsView({
  deposit,
  ethereumWallet,
  isMavrykBusy,
  onConnectMavryk,
  onReview,
  reviewError,
}: IntentsViewProps) {
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
    amountError,
    slippageBps,
    setSlippageBps,
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
      <div className={styles.bridgePanel} role="tabpanel">
        <RText color="neutral-700" role="status" size="body-sm">
          Loading deposit routes…
        </RText>
      </div>
    );

  if (catalog.status !== "ready" || !route || !selected)
    return (
      <div className={styles.bridgePanel} role="tabpanel">
        <div className={clsx(styles.notice, styles.warning)} role="alert">
          <RText color="neutral-700" size="body-sm">
            {catalog.status === "error"
              ? "The cross-chain deposit service is unavailable right now. Bridge From Ethereum and Receive On Mavryk still work."
              : "No cross-chain deposit routes are available right now. Bridge From Ethereum and Receive On Mavryk still work."}
          </RText>
        </div>
        {catalog.status === "error" && (
          <RButton
            className={styles.connectButton}
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
  // Choices above the route's maximum are hidden; a route stricter than the
  // smallest choice offers its own maximum.
  const allowedChoices = INTENTS_SLIPPAGE_OPTIONS_BPS.filter(
    (bps) => bps <= route.maxSlippageBps
  );
  const slippageChoices: number[] = allowedChoices.length
    ? allowedChoices
    : [route.maxSlippageBps];
  const settlementAmount = (raw: string) =>
    `${formatRawAmount(raw, route.settlementDecimals)} ${destination?.symbol ?? ""}`.trim();
  const balanceNotice =
    sourceBalance.status === "ready" ? undefined : (
      <span role="status">
        {sourceBalance.status === "disconnected"
          ? "Connect wallet to view balance"
          : sourceBalance.status === "unsupported"
            ? "Balance unavailable for this route"
            : sourceBalance.status === "loading"
              ? "Loading balance…"
              : "Balance unavailable"}
        {sourceBalance.status === "error" && (
          <>
            {" "}
            <button
              className={styles.maxButton}
              onClick={() => void sourceBalance.refetch()}
              type="button"
            >
              Retry
            </button>
          </>
        )}
      </span>
    );

  const handlePrimaryAction = async () => {
    if (!ethereumWallet.isConnected) return ethereumWallet.connect();
    if (!recipient) return onConnectMavryk();
    if (canReview && !isBusy) await onReview();
  };

  return (
    <div
      aria-label="Swap from any chain"
      className={styles.bridgePanel}
      role="tabpanel"
    >
      <label className={intentsStyles.routeField}>
        <RText color="neutral-700" size="body-s">
          Pay with
        </RText>
        <select
          className={intentsStyles.routeSelect}
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
      </label>

      <div className={styles.amountFields}>
        <DepositAmountField
          additionalTopRightBlock={
            <REthereumWalletDropdown triggerClassName={styles.addressButton} />
          }
          additionalBottomLeftBlock={balanceNotice}
          amount={amount}
          amountInputDisabled={isBusy || Boolean(routeError)}
          balanceSuffix={
            <button
              aria-label={`Use maximum ${symbol} balance`}
              className={styles.maxButton}
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
          }
          label={`Send from ${chainName}`}
          onChange={setAmount}
          balance={sourceBalance.balance ?? ZERO}
          assetIconSrc={source?.token === "native" ? EthereumLogo : UsdtToken}
          secondaryAssetIconSrc={
            ethereumWallet.isConnected ? EthereumLogo : undefined
          }
          metadata={{
            name: source?.name ?? symbol,
            symbol,
            decimals: route.sourceDecimals,
          }}
          assetSlug={`eip155:${route.sourceChainId}:${source?.token ?? route.originAsset}`}
        />
      </div>

      <div
        aria-label="Slippage tolerance"
        className={intentsStyles.slippageRow}
        role="radiogroup"
      >
        <RText color="neutral-700" size="body-s">
          Slippage tolerance
        </RText>
        <div className={intentsStyles.slippageOptions}>
          {slippageChoices.map((bps) => (
            <button
              aria-checked={slippageBps === bps}
              className={intentsStyles.slippageOption}
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

      <div className={intentsStyles.recipientRow}>
        <div className={intentsStyles.recipientCopy}>
          <RText color="neutral-700" size="body-s">
            Recipient: your Equiteez account
          </RText>
          <RText size="body-s">
            Receive {destination?.symbol ?? "tokens"} on Mavryk • Basenet
          </RText>
        </div>
        {recipient ? (
          <HashChip
            aria-label={`Copy recipient address ${recipient}`}
            className={intentsStyles.recipientAddress}
            firstCharsCount={8}
            hash={recipient}
            lastCharsCount={4}
            type="link"
          />
        ) : (
          <RButton
            disabled={isBusy}
            onClick={onConnectMavryk}
            size="small"
            tone="black"
            variant="secondary"
          >
            Connect Mavryk Wallet
          </RButton>
        )}
      </div>

      {estimate && !amountError && destination && (
        <dl className={intentsStyles.quoteList} aria-label="Estimate">
          <div className={intentsStyles.quoteRow}>
            <dt>
              <RText color="neutral-700" size="body-s">
                Minimum you accept
              </RText>
            </dt>
            <dd>
              <RText size="body-s">{settlementAmount(estimate.minimum)}</RText>
            </dd>
          </div>
          {sourceAddress && (
            <div className={intentsStyles.quoteRow}>
              <dt>
                <RText color="neutral-700" size="body-s">
                  Refunds go to
                </RText>
              </dt>
              <dd>
                <HashChip
                  aria-label={`Copy refund address ${sourceAddress}`}
                  firstCharsCount={6}
                  hash={sourceAddress}
                  lastCharsCount={4}
                  type="link"
                />
              </dd>
            </div>
          )}
        </dl>
      )}

      <RText color="neutral-700" size="body-s">
        After you confirm, the exact quote is prepared and shown before your
        wallet is asked to sign. Forwarding to the bridge is sponsored: you sign
        one transaction on {chainName}.
      </RText>

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
        className={styles.connectButton}
        disabled={
          Boolean(routeError) ||
          (ethereumWallet.isConnected && Boolean(recipient) && !canReview)
        }
        isLoading={isBusy}
        onClick={handlePrimaryAction}
        size="medium"
        tone="black"
      >
        {!ethereumWallet.isConnected
          ? "Connect Ethereum Wallet"
          : !recipient
            ? "Connect Mavryk Wallet"
            : "Review Deposit"}
      </RButton>
    </div>
  );
}
