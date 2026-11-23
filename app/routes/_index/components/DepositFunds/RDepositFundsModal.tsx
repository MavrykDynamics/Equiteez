import { useCallback, useEffect, useRef, useState } from "react";
import { useConfig } from "wagmi";
import type { BigNumber } from "bignumber.js";

import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { INTENTS_DEPOSIT_ENABLED } from "~/consts/intents";
import { USDT_BRIDGE, USDT_BRIDGE_DESTINATION_SLUG } from "~/consts/usdtBridge";
import { useIntentsDeposit } from "~/hooks/useIntentsDeposit";
import { ZERO } from "~/lib/utils/numbers";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useEthereumContext } from "~/providers/EthereumProvider/ethereum.provider";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { useTransactionWidget } from "~/providers/TransactionsProvider/TransactionWidgetProvider";
import { getIntentWidgetId } from "~/providers/TransactionsProvider/intentWidget";

import { BridgeStatusView } from "./components/BridgeStatusView";
import { BridgeView } from "./components/BridgeView";
import { ConfirmedView } from "./components/ConfirmedView";
import { IntentsFundingPanel } from "./components/IntentsFundingPanel";
import { IntentsQuoteView } from "./components/IntentsQuoteView";
import { IntentsStatusView } from "./components/IntentsStatusView";
import { IntentsView } from "./components/IntentsView";
import { ReceiveView } from "./components/ReceiveView";
import styles from "./RDepositFundsModal.module.css";

type DepositTab = "bridge" | "intents" | "receive";

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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const releaseDeposit = useRef<(() => void) | null>(null);
  const { userAddress, userTokensBalances, connect, isLoading } =
    useUserContext();
  const { tokensMetadata } = useTokensContext();
  const ethereumWallet = useEthereumContext();
  const intents = useIntentsDeposit({
    recipient: userAddress,
    ethereumWallet,
  });
  const { transactions, models, holdDeposit } = useTransactionWidget();
  const { chains } = useConfig();
  const explorer = chains.find((chain) => chain.id === USDT_BRIDGE.chainId)
    ?.blockExplorers?.default;
  const mavrykAddress = userAddress ?? "";
  const usdtBalance = userTokensBalances[USDT_BRIDGE_DESTINATION_SLUG] ?? ZERO;
  const destinationMetadata =
    tokensMetadata[USDT_BRIDGE_DESTINATION_SLUG] ??
    USDT_BRIDGE.destinationToken;
  const bridgeState = ethereumWallet.bridge.state;
  const progress = bridgeState?.progress;
  const lockHash =
    progress?.step === "lock" ? progress.hash?.toLowerCase() : undefined;
  const operationId =
    bridgeState?.operationId ??
    transactions.find(
      (record) => lockHash && record.sourceHashes.includes(lockHash)
    )?.operationId;
  const deposit = models.find((model) => model.operationId === operationId);
  const transactionHash =
    progress?.step === "lock" &&
    !bridgeState?.error &&
    !bridgeState?.isConfirmationUnknown
      ? progress.hash
      : undefined;

  const resetBridge = ethereumWallet.bridge.reset;
  const closeWalletSelection = ethereumWallet.walletSelection.onClose;
  const resetIntentsForm = intents.resetForm;
  const intentsReview = intents.review;
  const isIntentsTab = INTENTS_DEPOSIT_ENABLED && activeTab === "intents";
  const isIntentsReviewOpen =
    isIntentsTab &&
    intentsReview.phase !== "form" &&
    intentsReview.phase !== "tracking";
  const trackedIntent =
    isIntentsTab && intentsReview.phase === "tracking"
      ? intents.activeRecord
      : undefined;
  // While the modal shows a committed operation, its widget card is held.
  const heldIntentId =
    isOpen &&
    "localId" in intentsReview &&
    (intentsReview.phase === "tracking" || intents.hasFundingStarted)
      ? getIntentWidgetId(intentsReview)
      : null;
  useEffect(
    () => (heldIntentId ? holdDeposit(heldIntentId) : undefined),
    [heldIntentId, holdDeposit]
  );
  const resumeIntent = intents.resumeActive;
  const wasOpen = useRef(isOpen);
  const resetModal = useCallback(() => {
    releaseDeposit.current?.();
    releaseDeposit.current = null;
    resetBridge();
    resetIntentsForm();
    closeWalletSelection();
    setDepositAmount(undefined);
    setActiveTab("bridge");
    setIsDetailsOpen(false);
  }, [resetBridge, resetIntentsForm, closeWalletSelection]);

  const wasOpened = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) resetModal();
    // Reopening shows the active 1Click operation rather than a new form.
    if (
      isOpen &&
      !wasOpened.current &&
      INTENTS_DEPOSIT_ENABLED &&
      resumeIntent()
    )
      setActiveTab("intents");
    wasOpened.current = isOpen;
    wasOpen.current = isOpen;
  }, [isOpen, resetModal, resumeIntent]);

  useEffect(
    () => () => {
      releaseDeposit.current?.();
      releaseDeposit.current = null;
    },
    []
  );

  const handleClose = () => {
    resetModal();
    wasOpen.current = false;
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
      {!trackedIntent && (
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
      )}

      {transactionHash && ethereumWallet.bridge.state && !isDetailsOpen ? (
        <ConfirmedView
          transactionHash={transactionHash}
          explorer={
            explorer
              ? {
                  name: explorer.name,
                  url: `${explorer.url.replace(/\/$/, "")}/tx/${transactionHash}`,
                }
              : undefined
          }
          onClose={handleClose}
          onViewDetails={() => setIsDetailsOpen(true)}
        />
      ) : ethereumWallet.bridge.state &&
        (isDetailsOpen ||
          bridgeState?.error ||
          bridgeState?.isConfirmationUnknown) ? (
        <BridgeStatusView
          state={ethereumWallet.bridge.state}
          deposit={deposit}
          onCheckConfirmation={ethereumWallet.bridge.checkConfirmation}
          onReset={resetModal}
          onClose={handleClose}
        />
      ) : trackedIntent ? (
        <IntentsStatusView
          record={trackedIntent}
          model={intents.trackedModel}
          onClose={handleClose}
          onStartNew={() => intents.cancelReview()}
        />
      ) : isIntentsReviewOpen ? (
        <IntentsQuoteView
          review={intentsReview}
          record={intents.activeRecord}
          operationView={intents.operationView}
          now={intents.now}
          error={intents.reviewError}
          onConfirm={intents.confirmRequest}
          onBack={() => intents.cancelReview()}
          isBackDisabled={intents.isFunding}
          fundingSlot={
            <IntentsFundingPanel
              record={intents.activeRecord}
              isFunding={intents.isFunding}
              error={intents.fundingError}
              isWrongNetwork={intents.isWrongNetwork}
              explorerUrl={
                chains.find(
                  (chain) => chain.id === intents.activeRecord?.source.chainId
                )?.blockExplorers?.default.url
              }
              onFund={intents.fund}
              onSimulate={intents.simulateFunding}
            />
          }
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
              data-count={INTENTS_DEPOSIT_ENABLED ? 3 : 2}
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
              {INTENTS_DEPOSIT_ENABLED && (
                <button
                  aria-selected={activeTab === "intents"}
                  className={styles.tab}
                  data-active={activeTab === "intents"}
                  onClick={() => setActiveTab("intents")}
                  role="tab"
                  type="button"
                >
                  Swap From Any Chain
                </button>
              )}
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
                    mavrykAddress,
                    (id) => {
                      releaseDeposit.current?.();
                      releaseDeposit.current = holdDeposit(id);
                    }
                  );
              }}
              onDepositAmountChange={setDepositAmount}
              usdtBalance={usdtBalance}
            />
          ) : activeTab === "intents" && INTENTS_DEPOSIT_ENABLED ? (
            <IntentsView
              deposit={intents}
              ethereumWallet={ethereumWallet}
              isMavrykBusy={isLoading}
              onConnectMavryk={connect}
              onReview={intents.startReview}
              reviewError={intents.reviewError ?? intents.sessionError}
            />
          ) : (
            <ReceiveView mavrykAddress={mavrykAddress} />
          )}
        </div>
      )}
    </CustomPopup>
  );
}
