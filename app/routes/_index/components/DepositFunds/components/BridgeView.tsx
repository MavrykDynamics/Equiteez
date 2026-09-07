import { BigNumber } from "bignumber.js";
import type { ReactNode } from "react";

import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import { HashShortView } from "~/lib/atoms/HashShortView";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { AssetMetadataBase } from "~/lib/metadata";
import { USDT_BRIDGE, USDT_BRIDGE_DESTINATION_SLUG } from "~/consts/usdtBridge";
import { getUsdtBridgeAmountError } from "~/contracts/usdtBridge.contract";
import { ZERO } from "~/lib/utils/numbers";
import { BalanceInputWithTotal } from "~/templates/BalanceInput";
import { REthereumWalletDropdown } from "~/lib/organisms/REthereumWalletDropdown";
import { ETHEREUM_DEPOSIT_ASSET_SLUG } from "~/providers/EthereumProvider/ethereum.config";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";

import styles from "../RDepositFundsModal.module.css";

type BridgeViewProps = {
  depositAmount: BigNumber | undefined;
  ethereumWallet: EthereumContext;
  mavrykAddress: string;
  destinationMetadata: AssetMetadataBase;
  isMavrykBusy: boolean;
  onConnectMavryk: () => Promise<void> | void;
  onDeposit: () => Promise<void>;
  onDepositAmountChange: (value?: BigNumber) => void;
  usdtBalance: BigNumber;
};

const depositInputClassNames = {
  amountInputClassName: styles.depositAmountInput,
  amountInputContainerClassName: styles.depositAmountInputContainer,
  assetViewClassName: styles.depositAssetPill,
  balanceClassName: styles.depositBalanceText,
  balanceLabel: "Bal.",
  balancePlacement: "bottom-left" as const,
  bodyClassName: styles.depositInputBody,
  bottomLeftClassName: styles.depositFooterLeft,
  bottomRightClassName: styles.depositFooterValue,
  className: styles.depositInput,
  footerClassName: styles.depositInputFooter,
  headerClassName: styles.depositInputHeader,
  sectionClassName: styles.depositInputCard,
  showBalanceIcon: false,
};

function AddressButton({
  address,
  disabled,
  onClick,
}: {
  address: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      {address && (
        <span aria-hidden="true" className={styles.addressStatusDot} />
      )}
      <span className={styles.addressButtonText}>
        {address ? (
          <HashShortView
            firstCharsCount={8}
            hash={address}
            lastCharsCount={3}
            trimAfter={14}
          />
        ) : (
          "Connect Wallet"
        )}
      </span>
    </>
  );

  return onClick ? (
    <button
      className={styles.addressButton}
      data-connected={Boolean(address)}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  ) : (
    <span className={styles.addressButton}>{content}</span>
  );
}

function DepositAmountField({
  additionalTopRightBlock,
  additionalBottomLeftBlock,
  additionalBottomRightBlock,
  amount,
  amountInputDisabled,
  balanceSuffix,
  label,
  onChange,
  balance,
  assetIconSrc = UsdtToken,
  metadata = USDT_BRIDGE.destinationToken,
  assetSlug = USDT_BRIDGE_DESTINATION_SLUG,
}: {
  additionalTopRightBlock: ReactNode;
  additionalBottomLeftBlock?: ReactNode;
  additionalBottomRightBlock?: ReactNode;
  amount: BigNumber | undefined;
  amountInputDisabled: boolean;
  balanceSuffix?: ReactNode;
  label: string;
  onChange: (value?: BigNumber) => void;
  balance: BigNumber;
  assetIconSrc?: string | null;
  metadata?: AssetMetadataBase;
  assetSlug?: string;
}) {
  return (
    <BalanceInputWithTotal
      additionalTopRightBlock={additionalTopRightBlock}
      additionalBottomLeftBlock={additionalBottomLeftBlock}
      additionalBottomRightBlock={additionalBottomRightBlock}
      amount={amount}
      amountInputDisabled={amountInputDisabled}
      assetIconSrc={assetIconSrc ?? undefined}
      balanceSuffix={balanceSuffix}
      balanceTotal={amount ?? ZERO}
      cryptoDecimals={metadata.decimals}
      cryptoValue={balance}
      decimals={metadata.decimals}
      label={label}
      onChange={onChange}
      selectedAssetMetadata={metadata}
      selectedAssetSlug={assetSlug}
      {...depositInputClassNames}
    />
  );
}

export function BridgeView({
  depositAmount,
  ethereumWallet,
  mavrykAddress,
  destinationMetadata,
  isMavrykBusy,
  onConnectMavryk,
  onDeposit,
  onDepositAmountChange,
  usdtBalance,
}: BridgeViewProps) {
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    isWrongNetwork,
    connect,
    switchNetwork,
    tokenBalance,
    tokenMetadata,
    balanceStatus,
    refreshBalance,
    error,
  } = ethereumWallet;
  const isBusy = isConnecting || isReconnecting || isMavrykBusy;
  const amountError = getUsdtBridgeAmountError(depositAmount);
  const hasInsufficientBalance =
    depositAmount && tokenBalance && depositAmount.gt(tokenBalance);
  const canDeposit =
    !amountError && !hasInsufficientBalance && balanceStatus === "ready";
  const receivedAmount = amountError ? undefined : depositAmount;
  const addressButton = (
    <AddressButton
      address={mavrykAddress}
      disabled={isBusy}
      onClick={mavrykAddress ? undefined : onConnectMavryk}
    />
  );
  const unavailableBalance =
    balanceStatus === "ready" ? undefined : (
      <span role="status">
        {balanceStatus === "disconnected"
          ? "Connect wallet to view balance"
          : balanceStatus === "wrongNetwork"
            ? "Switch to Sepolia to view balance"
            : balanceStatus === "loading"
              ? "Loading balance…"
              : "Balance unavailable"}
        {balanceStatus === "error" && (
          <>
            {" "}
            <button
              className={styles.maxButton}
              onClick={refreshBalance}
              type="button"
            >
              Retry
            </button>
          </>
        )}
      </span>
    );

  const handlePrimaryAction = async () => {
    if (!isConnected) {
      connect();
      return;
    }
    if (!mavrykAddress) {
      await onConnectMavryk();
      return;
    }
    if (!isWrongNetwork && !isBusy && canDeposit) await onDeposit();
  };

  return (
    <div className={styles.bridgePanel} role="tabpanel">
      <div className={styles.amountFields}>
        <DepositAmountField
          additionalTopRightBlock={
            <REthereumWalletDropdown
              triggerClassName={!isConnected ? styles.addressButton : undefined}
            />
          }
          additionalBottomLeftBlock={unavailableBalance}
          additionalBottomRightBlock={
            <span title="Fiat value unavailable">—</span>
          }
          amount={depositAmount}
          amountInputDisabled={false}
          balanceSuffix={
            <button
              aria-label={`Use maximum ${tokenMetadata.symbol} balance`}
              className={styles.maxButton}
              disabled={balanceStatus !== "ready" || isBusy}
              onClick={() =>
                onDepositAmountChange(
                  tokenBalance?.decimalPlaces(
                    USDT_BRIDGE.destinationToken.decimals,
                    BigNumber.ROUND_DOWN
                  )
                )
              }
              type="button"
            >
              Max
            </button>
          }
          label="Send from Ethereum · Sepolia"
          onChange={onDepositAmountChange}
          balance={tokenBalance ?? ZERO}
          assetIconSrc={UsdtToken}
          metadata={tokenMetadata}
          assetSlug={ETHEREUM_DEPOSIT_ASSET_SLUG}
        />
        <DepositAmountField
          additionalTopRightBlock={addressButton}
          additionalBottomRightBlock={
            <span title="Fiat value unavailable">—</span>
          }
          amount={receivedAmount}
          amountInputDisabled
          label="Receive on Mavryk · Basenet"
          onChange={onDepositAmountChange}
          balance={usdtBalance}
          metadata={destinationMetadata}
        />
      </div>
      <div className={styles.exchangeDetails}>
        <RText color="neutral-600" size="body-s">
          Estimated: 1 USDT = 1 wUSDT
        </RText>
        <div className={styles.networkDetails}>
          <RText color="neutral-600" size="body-s">
            Gas confirmed in wallet
          </RText>
        </div>
      </div>
      <RText color="neutral-600" size="body-s">
        USDT arrives as wUSDT on Mavryk. Both wallets must be connected.
      </RText>
      {depositAmount && (amountError || hasInsufficientBalance) && (
        <RText role="alert" color="red-500" size="body-s">
          {amountError ?? "Insufficient USDT balance."}
        </RText>
      )}
      {isWrongNetwork && (
        <div className={styles.walletNotice}>
          <RText size="body-s">
            Switch your Ethereum wallet to Sepolia to continue.
          </RText>
          <RButton
            isLoading={isBusy}
            onClick={switchNetwork}
            size="small"
            tone="black"
            variant="secondary"
          >
            Switch to Sepolia
          </RButton>
        </div>
      )}
      {error && (
        <RText role="alert" color="red-500" size="body-s">
          {error}
        </RText>
      )}
      <RButton
        className={styles.connectButton}
        disabled={
          isWrongNetwork ||
          (isConnected && Boolean(mavrykAddress) && !canDeposit)
        }
        isLoading={isBusy}
        onClick={handlePrimaryAction}
        tone="black"
      >
        {!isConnected
          ? "Connect Ethereum Wallet"
          : !mavrykAddress
            ? "Connect Mavryk Wallet"
            : "Deposit Funds"}
      </RButton>
    </div>
  );
}
