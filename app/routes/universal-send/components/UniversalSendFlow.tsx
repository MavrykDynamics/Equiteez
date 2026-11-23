import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useConfig } from "wagmi";

import { ROUTES } from "~/consts/routes";
import { useIntentsDeposit } from "~/hooks/useIntentsDeposit";
import { useEthereumContext } from "~/providers/EthereumProvider/ethereum.provider";
import { useTransactionWidget } from "~/providers/TransactionsProvider/TransactionWidgetProvider";
import { getIntentWidgetId } from "~/providers/TransactionsProvider/intentWidget";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { IntentsFundingPanel } from "~/routes/_index/components/DepositFunds/components/IntentsFundingPanel";
import { IntentsQuoteView } from "~/routes/_index/components/DepositFunds/components/IntentsQuoteView";
import { IntentsStatusView } from "~/routes/_index/components/DepositFunds/components/IntentsStatusView";

import { UniversalSendForm } from "./UniversalSendForm";
import styles from "./UniversalSendForm.module.css";

/**
 * Runs the 1Click deposit on a page: form → review/quote → funding → status.
 * Mirrors the intents branch of `RDepositFundsModal`.
 */
export function UniversalSendFlow() {
  const navigate = useNavigate();
  const { userAddress, connect, isLoading } = useUserContext();
  const ethereumWallet = useEthereumContext();
  const intents = useIntentsDeposit({
    recipient: userAddress,
    ethereumWallet,
  });
  const { holdDeposit } = useTransactionWidget();
  const { chains } = useConfig();
  const { review, resumeActive } = intents;

  // Opening the page shows the newest unfinished operation, like the modal.
  useEffect(() => {
    resumeActive();
  }, [resumeActive]);

  // While the page shows a committed operation, its widget card is held.
  const heldIntentId =
    "localId" in review &&
    (review.phase === "tracking" || intents.hasFundingStarted)
      ? getIntentWidgetId(review)
      : null;
  useEffect(
    () => (heldIntentId ? holdDeposit(heldIntentId) : undefined),
    [heldIntentId, holdDeposit]
  );

  if (review.phase === "tracking" && intents.activeRecord)
    return (
      <div className={styles.stepCard}>
        <IntentsStatusView
          record={intents.activeRecord}
          model={intents.trackedModel}
          onClose={() => navigate(ROUTES.home)}
          onStartNew={() => intents.cancelReview()}
        />
      </div>
    );

  if (review.phase !== "form" && review.phase !== "tracking")
    return (
      <div className={styles.stepCard}>
        <IntentsQuoteView
          review={review}
          record={intents.activeRecord}
          operationView={intents.operationView}
          now={intents.now}
          error={intents.reviewError}
          onConfirm={intents.confirmRequest}
          onBack={() => intents.cancelReview()}
          onClose={() => navigate(ROUTES.home)}
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
      </div>
    );

  return (
    <UniversalSendForm
      deposit={intents}
      ethereumWallet={ethereumWallet}
      isMavrykBusy={isLoading}
      onConnectMavryk={connect}
      onReview={intents.startReview}
      reviewError={intents.reviewError ?? intents.sessionError}
    />
  );
}
