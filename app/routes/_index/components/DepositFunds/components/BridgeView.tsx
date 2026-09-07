import type { BigNumber } from "bignumber.js";
import type { ReactNode } from "react";

import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import { HashShortView } from "~/lib/atoms/HashShortView";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  STABLECOIN_ASSET_SLUG,
  STABLECOIN_METADATA,
  type AssetMetadataBase,
} from "~/lib/metadata";
import { ZERO } from "~/lib/utils/numbers";
import { BalanceInputWithTotal } from "~/templates/BalanceInput";
import { ETHEREUM_DEPOSIT_ASSET_SLUG } from "~/providers/EthereumProvider/ethereum.config";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";

import styles from "../RDepositFundsModal.module.css";

type BridgeViewProps = {
  depositAmount: BigNumber | undefined;
  ethereumWallet: EthereumContext;
  mavrykAddress: string;
  onDeposit: () => void;
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
      <span aria-hidden="true" className={styles.addressStatusDot} />
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
  metadata = STABLECOIN_METADATA,
  assetSlug = STABLECOIN_ASSET_SLUG,
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
  onDeposit,
  onDepositAmountChange,
  usdtBalance,
}: BridgeViewProps) {
  const {
    userAddress,
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
  const addressButton = <AddressButton address={mavrykAddress} />;
  const isBusy = isConnecting || isReconnecting;
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

  const handlePrimaryAction = () => {
    if (!isConnected) {
      connect();
      return;
    }
    if (!isWrongNetwork && !isBusy) onDeposit();
  };

  return (
    <div className={styles.bridgePanel} role="tabpanel">
      <div className={styles.amountFields}>
        <DepositAmountField
          additionalTopRightBlock={
            <AddressButton
              address={userAddress ?? ""}
              disabled={isBusy}
              onClick={connect}
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
              onClick={() => onDepositAmountChange(tokenBalance)}
              type="button"
            >
              Max
            </button>
          }
          label="Send from Ethereum"
          onChange={onDepositAmountChange}
          balance={tokenBalance ?? ZERO}
          assetIconSrc={tokenMetadata.thumbnailUri ?? null}
          metadata={tokenMetadata}
          assetSlug={ETHEREUM_DEPOSIT_ASSET_SLUG}
        />
        <DepositAmountField
          additionalTopRightBlock={addressButton}
          amount={depositAmount}
          amountInputDisabled
          label="Receive on MVRK"
          onChange={onDepositAmountChange}
          balance={usdtBalance}
        />
      </div>
      <div className={styles.exchangeDetails}>
        <RText color="neutral-600" size="body-s">
          1 USDT = 1 USDT
        </RText>
        <div className={styles.networkDetails}>
          <RText color="neutral-600" size="body-s">
            Time: ≈2s
          </RText>
          <RText color="neutral-600" size="body-s">
            Fee: 0.01 MVRK
          </RText>
        </div>
      </div>
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
        disabled={isWrongNetwork}
        isLoading={isBusy}
        onClick={handlePrimaryAction}
        tone="black"
      >
        {isConnected ? "Deposit Funds" : "Connect Ethereum Wallet"}
      </RButton>
    </div>
  );
}
