import { BigNumber } from "bignumber.js";
import type { ReactNode } from "react";

import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import EthereumLogo from "~/icons/ethereum-logo.svg";
import MavenIcon from "~/icons/maven-icon.svg";
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
import { useUsdtBridgeEstimate } from "~/providers/EthereumProvider/hooks/useUsdtBridgeEstimate";

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
  amount,
  amountInputDisabled,
  balanceSuffix,
  label,
  onChange,
  balance,
  assetIconSrc = UsdtToken,
  secondaryAssetIconSrc,
  metadata = USDT_BRIDGE.destinationToken,
  assetSlug = USDT_BRIDGE_DESTINATION_SLUG,
}: {
  additionalTopRightBlock: ReactNode;
  additionalBottomLeftBlock?: ReactNode;
  amount: BigNumber | undefined;
  amountInputDisabled: boolean;
  balanceSuffix?: ReactNode;
  label: string;
  onChange: (value?: BigNumber) => void;
  balance: BigNumber;
  assetIconSrc?: string | null;
  secondaryAssetIconSrc?: string;
  metadata?: AssetMetadataBase;
  assetSlug?: string;
}) {
  return (
    <BalanceInputWithTotal
      additionalTopRightBlock={additionalTopRightBlock}
      additionalBottomLeftBlock={additionalBottomLeftBlock}
      amount={amount}
      amountInputDisabled={amountInputDisabled}
      assetIconSrc={assetIconSrc ?? undefined}
      secondaryAssetIconSrc={secondaryAssetIconSrc}
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
  const estimate = useUsdtBridgeEstimate(
    ethereumWallet.userAddress,
    depositAmount,
    mavrykAddress,
    isConnected && !isWrongNetwork && Boolean(canDeposit)
  );
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
            <REthereumWalletDropdown triggerClassName={styles.addressButton} />
          }
          additionalBottomLeftBlock={unavailableBalance}
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
          secondaryAssetIconSrc={isConnected ? EthereumLogo : undefined}
          metadata={tokenMetadata}
          assetSlug={ETHEREUM_DEPOSIT_ASSET_SLUG}
        />
        <DepositAmountField
          additionalTopRightBlock={addressButton}
          amount={receivedAmount}
          amountInputDisabled
          label="Receive on Mavryk · Basenet"
          onChange={onDepositAmountChange}
          balance={usdtBalance}
          metadata={destinationMetadata}
          secondaryAssetIconSrc={mavrykAddress ? MavenIcon : undefined}
        />
      </div>
      <div className={styles.exchangeDetails}>
        <RText color="neutral-700" size="body-s">
          1 USDT = 1 wUSDT
        </RText>
        <div className={styles.networkDetails}>
          <RText color="neutral-700" size="body-s">
            <span
              className="flex gap-3 items-center"
              title="Time estimates Ethereum confirmations only, assuming 1–3 blocks per transaction. Wallet signing and delivery to Mavryk take additional time. Fee estimates Sepolia network costs including required approvals; the final wallet fee may differ. Unavailable means the RPC could not provide a reliable estimate."
            >
              <span>
                {" "}
                Time:{" "}
                {estimate.isLoading
                  ? "Estimating…"
                  : estimate.time
                    ? `≈ ${estimate.time}`
                    : "Unavailable"}{" "}
              </span>
              <span>
                Fee:{" "}
                {estimate.isLoading
                  ? "Estimating…"
                  : estimate.fee
                    ? `${estimate.fee} ${estimate.symbol}`
                    : "Unavailable"}
              </span>
            </span>
          </RText>
        </div>
      </div>

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
