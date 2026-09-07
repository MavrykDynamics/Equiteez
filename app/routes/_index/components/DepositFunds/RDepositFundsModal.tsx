import { useMemo, useState } from "react";
import type { BigNumber } from "bignumber.js";

import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { STABLECOIN_ASSET_SLUG, STABLECOIN_METADATA } from "~/lib/metadata";
import { ZERO } from "~/lib/utils/numbers";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useEthereumContext } from "~/providers/EthereumProvider/ethereum.provider";

import { BridgeStatusView } from "./components/BridgeStatusView";
import { BridgeView } from "./components/BridgeView";
import { ReceiveView } from "./components/ReceiveView";
import styles from "./RDepositFundsModal.module.css";

type DepositTab = "bridge" | "receive";
type DepositView = "deposit" | "bridgeStatus";

type RDepositFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function RDepositFundsModal({
  isOpen,
  onClose,
}: RDepositFundsModalProps) {
  const [activeTab, setActiveTab] = useState<DepositTab>("bridge");
  const [activeView, setActiveView] = useState<DepositView>("deposit");
  const [depositAmount, setDepositAmount] = useState<BigNumber | undefined>();
  const { userAddress, userTokensBalances } = useUserContext();
  const ethereumWallet = useEthereumContext();
  const mavrykAddress = userAddress ?? "";
  const usdtBalance = useMemo(
    () =>
      userTokensBalances[STABLECOIN_ASSET_SLUG] ??
      userTokensBalances[STABLECOIN_METADATA.address] ??
      ZERO,
    [userTokensBalances]
  );
  const handleClose = () => {
    setActiveView("deposit");
    onClose();
  };

  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Deposit funds"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={handleClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close deposit funds"
          className={styles.closeButton}
          onClick={handleClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      {activeView === "bridgeStatus" ? (
        <BridgeStatusView
          amount={depositAmount}
          assetSymbol={STABLECOIN_METADATA.symbol}
          onClose={handleClose}
        />
      ) : (
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
            <BridgeView
              depositAmount={depositAmount}
              mavrykAddress={mavrykAddress}
              ethereumWallet={ethereumWallet}
              onDeposit={() => setActiveView("bridgeStatus")}
              onDepositAmountChange={setDepositAmount}
              usdtBalance={usdtBalance}
            />
          ) : (
            <ReceiveView mavrykAddress={mavrykAddress} />
          )}
        </div>
      )}
    </CustomPopup>
  );
}
