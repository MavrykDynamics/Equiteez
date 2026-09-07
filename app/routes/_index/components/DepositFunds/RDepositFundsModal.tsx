import { useState } from "react";
import type { BigNumber } from "bignumber.js";

import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { USDT_BRIDGE, USDT_BRIDGE_DESTINATION_SLUG } from "~/consts/usdtBridge";
import { ZERO } from "~/lib/utils/numbers";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useEthereumContext } from "~/providers/EthereumProvider/ethereum.provider";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";

import { BridgeStatusView } from "./components/BridgeStatusView";
import { BridgeView } from "./components/BridgeView";
import { ReceiveView } from "./components/ReceiveView";
import styles from "./RDepositFundsModal.module.css";

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
  const { userAddress, userTokensBalances, connect, isLoading } =
    useUserContext();
  const { tokensMetadata } = useTokensContext();
  const ethereumWallet = useEthereumContext();
  const mavrykAddress = userAddress ?? "";
  const usdtBalance = userTokensBalances[USDT_BRIDGE_DESTINATION_SLUG] ?? ZERO;
  const destinationMetadata =
    tokensMetadata[USDT_BRIDGE_DESTINATION_SLUG] ??
    USDT_BRIDGE.destinationToken;
  const handleClose = () => {
    ethereumWallet.bridge.reset();
    ethereumWallet.walletSelection.onClose();
    setDepositAmount(undefined);
    setActiveTab("bridge");
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

      {ethereumWallet.bridge.state ? (
        <BridgeStatusView
          state={ethereumWallet.bridge.state}
          onCheckConfirmation={ethereumWallet.bridge.checkConfirmation}
          onReset={ethereumWallet.bridge.reset}
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
              destinationMetadata={destinationMetadata}
              isMavrykBusy={isLoading}
              onConnectMavryk={connect}
              onDeposit={async () => {
                if (depositAmount)
                  await ethereumWallet.bridge.submit(
                    depositAmount,
                    mavrykAddress
                  );
              }}
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
