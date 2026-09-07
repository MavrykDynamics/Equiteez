import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";

import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import { CopyButton } from "~/lib/atoms/CopyButton";
import { HashShortView } from "~/lib/atoms/HashShortView";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  STABLECOIN_ASSET_SLUG,
  STABLECOIN_METADATA,
} from "~/lib/metadata";
import { ZERO } from "~/lib/utils/numbers";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { BalanceInputWithTotal } from "~/templates/BalanceInput";

import styles from "./RDepositFundsModal.module.css";
import { Icon } from "~/lib/atoms/Icon";

type DepositTab = "bridge" | "receive";

type RDepositFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function RDepositFundsModal({
  isOpen,
  onClose,
}: RDepositFundsModalProps) {
  const [activeTab, setActiveTab] = useState<DepositTab>("bridge");
  const [depositAmount, setDepositAmount] = useState<BigNumber | undefined>();
  const { userAddress, userTokensBalances } = useUserContext();
  const mavrykAddress = userAddress ?? "";
  const usdtBalance = useMemo(
    () =>
      userTokensBalances[STABLECOIN_ASSET_SLUG] ??
      userTokensBalances[STABLECOIN_METADATA.address] ??
      ZERO,
    [userTokensBalances]
  );
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
  const addressButton = (
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

  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Deposit funds"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close deposit funds"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <RHeading className={styles.title} size="h6" weight="medium">
            Deposit Funds
          </RHeading>
          <div
            aria-label="Deposit method"
            className={styles.tabs}
            role="tablist"
          >
            <button
              aria-selected={activeTab === "bridge"}
              className={styles.tab}
              data-active={activeTab === "bridge"}
              onClick={() => setActiveTab("bridge")}
              role="tab"
              type="button"
            >
              Bridge From Ethereum
            </button>
            <button
              aria-selected={activeTab === "receive"}
              className={styles.tab}
              data-active={activeTab === "receive"}
              onClick={() => setActiveTab("receive")}
              role="tab"
              type="button"
            >
              Receive On Mavryk
            </button>
          </div>
        </div>

        {activeTab === "bridge" ? (
          <div className={styles.bridgePanel} role="tabpanel">
            <div className={styles.amountFields}>
              <BalanceInputWithTotal
                additionalTopRightBlock={addressButton}
                amount={depositAmount}
                amountInputDisabled={false}
                assetIconSrc={UsdtToken}
                balanceSuffix={
                  <button
                    aria-label="Use maximum USDT balance"
                    className={styles.maxButton}
                    onClick={() => setDepositAmount(usdtBalance)}
                    type="button"
                  >
                    Max
                  </button>
                }
                balanceTotal={depositAmount ?? ZERO}
                cryptoDecimals={STABLECOIN_METADATA.decimals}
                cryptoValue={usdtBalance}
                decimals={STABLECOIN_METADATA.decimals}
                label="Send from Ethereum"
                onChange={setDepositAmount}
                {...depositInputClassNames}
              />
              <BalanceInputWithTotal
                additionalTopRightBlock={addressButton}
                amount={depositAmount}
                amountInputDisabled
                assetIconSrc={UsdtToken}
                balanceTotal={depositAmount ?? ZERO}
                cryptoDecimals={STABLECOIN_METADATA.decimals}
                cryptoValue={usdtBalance}
                decimals={STABLECOIN_METADATA.decimals}
                label="Receive on MVRK"
                onChange={setDepositAmount}
                {...depositInputClassNames}
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
            <RButton className={styles.connectButton} tone="black">
              Connect Ethereum Wallet
            </RButton>
          </div>
        ) : (
          <div className={styles.receivePanel} role="tabpanel">
            <RText
              className={styles.receiveDescription}
              color="neutral-600"
              size="body-sm"
            >
              Send USDT from another Mavryk Wallet straight to this address.
              This is for assets already on Mavryk. To move funds from Ethereum,
              use the Bridge tab.
            </RText>
            <div className={styles.addressBlock}>
              <div className={styles.qrCode}>
                <QRCode
                  aria-label="QR code for the Mavryk deposit address"
                  role="img"
                  value={mavrykAddress}
                  size={146}
                />
              </div>
              <CopyButton
                aria-label="Copy Mavryk deposit address"
                className={styles.addressField}
                mode="reverse"
                text={mavrykAddress}
                type="block"
              >
                <RText size="body-sm">{mavrykAddress}</RText>
                <RIcon
                  aria-hidden="true"
                  className={styles.copyIcon}
                  name="copy"
                  size="medium"
                />
              </CopyButton>
            </div>
            <div className={styles.warning}>
              <div className="flex items-start justify-center mt-1">
                <Icon className="w-4 h-4" icon="warning" />
              </div>
              <RText color="neutral-600" size="body-sm">
                <strong>Send only Mavryk assets to this address.</strong>
                <br />
                Sending assets straight from Ethereum or another chain to this
                address will lose them. Use the bridge for anything on Ethereum.
              </RText>
            </div>
          </div>
        )}
      </div>
    </CustomPopup>
  );
}
