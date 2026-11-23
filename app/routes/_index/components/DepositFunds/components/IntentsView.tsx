import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";

import { IntentsDetailsStep } from "./IntentsDetailsStep";
import type { IntentsPickerKind } from "./IntentsPickerView";
import styles from "./IntentsView.module.css";
import { IntentsWalletsStep } from "./IntentsWalletsStep";

export type IntentsFormStep = "wallets" | "details";

type IntentsViewProps = {
  deposit: IntentsDepositController;
  ethereumWallet: EthereumContext;
  /** Connector name of the external wallet, e.g. "MetaMask". */
  walletName: string | undefined;
  isMavrykBusy: boolean;
  onConnectMavryk: () => Promise<void> | void;
  onReview: () => Promise<void> | void;
  reviewError?: string | null;
  step: IntentsFormStep;
  onStepChange: (step: IntentsFormStep) => void;
  onOpenPicker: (kind: IntentsPickerKind) => void;
};

const stepLabels: Record<IntentsFormStep, string> = {
  wallets: "Wallets",
  details: "Deposit details",
};

/** "Send From Any Network": wallets, then deposit details. */
export function IntentsView({
  deposit,
  ethereumWallet,
  walletName,
  isMavrykBusy,
  onConnectMavryk,
  onReview,
  reviewError,
  step,
  onStepChange,
  onOpenPicker,
}: IntentsViewProps) {
  return (
    <div
      aria-label="Send from any network"
      className={styles.view}
      role="tabpanel"
    >
      <ol aria-label="Deposit steps" className={styles.steps}>
        {(["wallets", "details"] as const).map((item) => (
          <li
            aria-current={item === step ? "step" : undefined}
            className={styles.stepItem}
            data-active={item === step || step === "details" || undefined}
            data-current={item === step || undefined}
            key={item}
          >
            {stepLabels[item]}
          </li>
        ))}
      </ol>

      {step === "wallets" ? (
        <IntentsWalletsStep
          ethereumWallet={ethereumWallet}
          isMavrykBusy={isMavrykBusy}
          onConnectMavryk={onConnectMavryk}
          onContinue={() => onStepChange("details")}
          recipient={deposit.recipient}
          walletName={walletName}
        />
      ) : (
        <IntentsDetailsStep
          deposit={deposit}
          ethereumWallet={ethereumWallet}
          isMavrykBusy={isMavrykBusy}
          onConnectWallets={() => onStepChange("wallets")}
          onOpenPicker={onOpenPicker}
          onReview={onReview}
          reviewError={reviewError}
        />
      )}
    </div>
  );
}
