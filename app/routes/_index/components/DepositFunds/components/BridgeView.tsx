import type { BigNumber } from "bignumber.js";
import type { ReactNode } from "react";

import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import { HashShortView } from "~/lib/atoms/HashShortView";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { STABLECOIN_ASSET_SLUG, STABLECOIN_METADATA } from "~/lib/metadata";
import { ZERO } from "~/lib/utils/numbers";
import { BalanceInputWithTotal } from "~/templates/BalanceInput";

import styles from "../RDepositFundsModal.module.css";

type BridgeViewProps = {
  depositAmount: BigNumber | undefined;
  mavrykAddress: string;
  onConnectEthereumWallet: () => void;
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
  selectedAssetMetadata: STABLECOIN_METADATA,
  selectedAssetSlug: STABLECOIN_ASSET_SLUG,
  showBalanceIcon: false,
};

function AddressButton({ mavrykAddress }: { mavrykAddress: string }) {
  return (
    <span className={styles.addressButton}>
      <span aria-hidden="true" className={styles.addressStatusDot} />
      <span className={styles.addressButtonText}>
        {mavrykAddress ? (
          <HashShortView
            firstCharsCount={8}
            hash={mavrykAddress}
            lastCharsCount={3}
            trimAfter={14}
          />
        ) : (
          "Connect Wallet"
        )}
      </span>
    </span>
  );
}

function DepositAmountField({
  additionalTopRightBlock,
  amount,
  amountInputDisabled,
  balanceSuffix,
  label,
  onChange,
  usdtBalance,
}: {
  additionalTopRightBlock: ReactNode;
  amount: BigNumber | undefined;
  amountInputDisabled: boolean;
  balanceSuffix?: ReactNode;
  label: string;
  onChange: (value?: BigNumber) => void;
  usdtBalance: BigNumber;
}) {
  return (
    <BalanceInputWithTotal
      additionalTopRightBlock={additionalTopRightBlock}
      amount={amount}
      amountInputDisabled={amountInputDisabled}
      assetIconSrc={UsdtToken}
      balanceSuffix={balanceSuffix}
      balanceTotal={amount ?? ZERO}
      cryptoDecimals={STABLECOIN_METADATA.decimals}
      cryptoValue={usdtBalance}
      decimals={STABLECOIN_METADATA.decimals}
      label={label}
      onChange={onChange}
      {...depositInputClassNames}
    />
  );
}

export function BridgeView({
  depositAmount,
  mavrykAddress,
  onConnectEthereumWallet,
  onDepositAmountChange,
  usdtBalance,
}: BridgeViewProps) {
  const addressButton = <AddressButton mavrykAddress={mavrykAddress} />;

  return (
    <div className={styles.bridgePanel} role="tabpanel">
      <div className={styles.amountFields}>
        <DepositAmountField
          additionalTopRightBlock={addressButton}
          amount={depositAmount}
          amountInputDisabled={false}
          balanceSuffix={
            <button
              aria-label="Use maximum USDT balance"
              className={styles.maxButton}
              onClick={() => onDepositAmountChange(usdtBalance)}
              type="button"
            >
              Max
            </button>
          }
          label="Send from Ethereum"
          onChange={onDepositAmountChange}
          usdtBalance={usdtBalance}
        />
        <DepositAmountField
          additionalTopRightBlock={addressButton}
          amount={depositAmount}
          amountInputDisabled
          label="Receive on MVRK"
          onChange={onDepositAmountChange}
          usdtBalance={usdtBalance}
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
      <RButton
        className={styles.connectButton}
        onClick={onConnectEthereumWallet}
        tone="black"
      >
        Connect Ethereum Wallet
      </RButton>
    </div>
  );
}
