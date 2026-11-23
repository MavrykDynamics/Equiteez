import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useConfig } from "wagmi";

import { useIntentsDeposit } from "~/hooks/useIntentsDeposit";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useEthereumContext } from "~/providers/EthereumProvider/ethereum.provider";
import { useTransactionWidget } from "~/providers/TransactionsProvider/TransactionWidgetProvider";
import { getIntentWidgetId } from "~/providers/TransactionsProvider/intentWidget";

import { DepositModalHeader, shortenHash } from "./components/DepositParts";
import { IntentsFundingPanel } from "./components/IntentsFundingPanel";
import {
  IntentsPickerView,
  type IntentsPickerKind,
} from "./components/IntentsPickerView";
import { IntentsQuoteView } from "./components/IntentsQuoteView";
import { IntentsStatusView } from "./components/IntentsStatusView";
import { IntentsView, type IntentsFormStep } from "./components/IntentsView";
import { ReceiveView } from "./components/ReceiveView";
import styles from "./RDepositFundsModal.module.css";

type DepositTab = "intents" | "receive";

type RDepositFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Deposit Funds: "Send From Any Network" (1Click / NEAR Intents) and
 * "Receive On Mavryk". The direct USDT bridge logic still lives in the
 * Ethereum and transactions providers, but has no UI here.
 */
export function RDepositFundsModal({
  isOpen,
  onClose,
}: RDepositFundsModalProps) {
  const [activeTab, setActiveTab] = useState<DepositTab>("intents");
  const [intentsStep, setIntentsStep] = useState<IntentsFormStep>("wallets");
  const [picker, setPicker] = useState<IntentsPickerKind | null>(null);
  const { connector } = useAccount();
  const { userAddress, connect, isLoading } = useUserContext();
  const ethereumWallet = useEthereumContext();
  const intents = useIntentsDeposit({
    recipient: userAddress,
    ethereumWallet,
  });
  const { holdDeposit } = useTransactionWidget();
  const { chains } = useConfig();
  const mavrykAddress = userAddress ?? "";

  const closeWalletSelection = ethereumWallet.walletSelection.onClose;
  const resetIntentsForm = intents.resetForm;
  const intentsReview = intents.review;
  const isIntentsTab = activeTab === "intents";
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
    resetIntentsForm();
    closeWalletSelection();
    setActiveTab("intents");
    setIntentsStep("wallets");
    setPicker(null);
  }, [resetIntentsForm, closeWalletSelection]);

  const wasOpened = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) resetModal();
    // Reopening shows the active 1Click operation rather than a new form.
    if (isOpen && !wasOpened.current && resumeIntent()) setActiveTab("intents");
    wasOpened.current = isOpen;
    wasOpen.current = isOpen;
  }, [isOpen, resetModal, resumeIntent]);

  const handleTabChange = (tab: DepositTab) => {
    setActiveTab(tab);
    setPicker(null);
  };
  const walletLabel = [
    connector?.name,
    ethereumWallet.userAddress && shortenHash(ethereumWallet.userAddress),
  ]
    .filter(Boolean)
    .join(" ");

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
      {trackedIntent ? (
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
          onClose={handleClose}
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
      ) : isIntentsTab && picker ? (
        <IntentsPickerView
          deposit={intents}
          kind={picker}
          onClose={handleClose}
          onDone={() => setPicker(null)}
          walletLabel={walletLabel}
        />
      ) : (
        <div className={styles.content}>
          <DepositModalHeader
            onBack={
              isIntentsTab && intentsStep === "details"
                ? () => setIntentsStep("wallets")
                : undefined
            }
            onClose={handleClose}
            title="Deposit Funds"
          />
          <div
            aria-label="Deposit method"
            className={styles.tabs}
            role="tablist"
          >
            <button
              aria-selected={activeTab === "intents"}
              className={styles.tab}
              data-active={activeTab === "intents"}
              onClick={() => handleTabChange("intents")}
              role="tab"
              type="button"
            >
              Send From Any Network
            </button>
            <button
              aria-selected={activeTab === "receive"}
              className={styles.tab}
              data-active={activeTab === "receive"}
              onClick={() => handleTabChange("receive")}
              role="tab"
              type="button"
            >
              Receive On Mavryk
            </button>
          </div>

          {activeTab === "intents" ? (
            <IntentsView
              deposit={intents}
              ethereumWallet={ethereumWallet}
              isMavrykBusy={isLoading}
              onConnectMavryk={connect}
              onOpenPicker={setPicker}
              onReview={intents.startReview}
              onStepChange={setIntentsStep}
              reviewError={intents.reviewError ?? intents.sessionError}
              step={intentsStep}
              walletName={connector?.name}
            />
          ) : (
            <ReceiveView mavrykAddress={mavrykAddress} />
          )}
        </div>
      )}
    </CustomPopup>
  );
}
