import { BigNumber } from "bignumber.js";
import clsx from "clsx";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { toLocalFormat } from "~/lib/formaters/formaters";
import type { UsdtBridgeState } from "~/providers/EthereumProvider/hooks/useUsdtBridge";

import styles from "../RDepositFundsModal.module.css";

export type BridgeProcessStatus = "loading" | "success" | "error";
type BridgeStepStatus = BridgeProcessStatus | "pending";

export type BridgeStatusStep = {
  description: string;
  status: BridgeStepStatus;
  title: string;
};

type BridgeStatusViewProps = {
  state: UsdtBridgeState;
  onClose: () => void;
  onReset: () => void;
  onCheckConfirmation: () => Promise<void>;
};

function getBridgeStatusSteps(state: UsdtBridgeState): BridgeStatusStep[] {
  const { progress, error } = state;
  const isLockStep = progress?.step === "lock";
  const isLocked = isLockStep && progress.status === "confirmed";
  const currentStatus = error
    ? "error"
    : progress?.status === "confirmed"
      ? "success"
      : "loading";
  return [
    {
      title: "Lock on Ethereum",
      status: isLockStep ? "success" : currentStatus,
      description: isLockStep
        ? "Confirmed"
        : (error ??
          (!progress
            ? "Checking wallets and USDT balance"
            : progress.status === "signature"
              ? "Approve spending in your Ethereum wallet"
              : progress.status === "confirmed"
                ? "Confirmed"
                : "Waiting for confirmations")),
    },
    {
      title: "Validators Sign",
      status: isLockStep ? currentStatus : "pending",
      description: !isLockStep
        ? "Waiting on the lock"
        : (error ?? (isLocked ? "Signed" : "Waiting on the lock")),
    },
    {
      title: "Mint on Mavryk",
      status: isLocked ? "success" : "pending",
      description: isLocked ? "Minted" : "Pending validator signatures",
    },
  ];
}

const statusIcons: Record<BridgeProcessStatus, RIconName> = {
  error: "cross",
  loading: "loading",
  success: "ok",
};

const statusLabels: Record<BridgeProcessStatus, string> = {
  error: "Error",
  loading: "In progress",
  success: "Complete",
};

function BridgeStatusIndicator({
  index,
  status,
}: {
  index: number;
  status: BridgeStepStatus;
}) {
  return (
    <div className={styles.statusIndicator} data-status={status}>
      {status === "pending" ? (
        <span className={styles.statusStepNumber}>{index}</span>
      ) : (
        <RIcon
          aria-hidden="true"
          className={styles.statusIndicatorIcon}
          name={statusIcons[status]}
          size="small"
        />
      )}
    </div>
  );
}

function BridgeStatusListItem({
  index,
  step,
}: {
  index: number;
  step: BridgeStatusStep;
}) {
  const stateLabel =
    step.status === "pending" ? null : statusLabels[step.status];

  return (
    <li className={styles.statusStep} data-status={step.status}>
      <div className={styles.statusStepMain}>
        <BridgeStatusIndicator index={index} status={step.status} />
        <div className={styles.statusStepCopy}>
          <RText
            className={styles.statusStepTitle}
            size="body-sm"
            weight="medium"
          >
            {step.title}
          </RText>
          <RText
            className={styles.statusStepDescription}
            data-status={step.status}
            size="body-s"
          >
            {step.description}
          </RText>
        </div>
      </div>
      {stateLabel ? (
        <RText
          className={styles.statusState}
          data-status={step.status}
          size="body-s"
        >
          {stateLabel}
        </RText>
      ) : null}
    </li>
  );
}

export function BridgeStatusView({
  state,
  onClose,
  onReset,
  onCheckConfirmation,
}: BridgeStatusViewProps) {
  const formattedAmount = toLocalFormat(new BigNumber(state.amount), {
    decimalPlaces: 6,
  });
  const steps = getBridgeStatusSteps(state);
  const isLocked =
    state.progress?.step === "lock" && state.progress.status === "confirmed";

  return (
    <div className={styles.statusContent}>
      <div className={styles.statusHeader}>
        <RHeading className={styles.statusAmount} size="h6" weight="medium">
          {formattedAmount} USDT
        </RHeading>
        <RText
          className={styles.statusDescription}
          color="neutral-700"
          size="body-sm"
        >
          Bridging from Ethereum to your Mavryk wallet
        </RText>
      </div>
      <ol aria-live="polite" className={styles.statusList}>
        {steps.map((step, index) => (
          <BridgeStatusListItem
            index={index + 1}
            key={step.title}
            step={step}
          />
        ))}
      </ol>
      <div className={clsx(styles.notice, styles.statusNotice)}>
        <div className={styles.statusNoticeIcon}>
          <RIcon aria-hidden="true" name="info" size="small" />
        </div>
        <RText className={styles.statusNoticeText} size="body-sm">
          {isLocked
            ? "Your Ethereum lock is confirmed. Delivery to your Mavryk wallet is pending; check your wUSDT balance for arrival."
            : state.isConfirmationUnknown
              ? "The transaction has been sent. Check its confirmation before starting another deposit."
              : state.error
                ? "The deposit has not completed. Review the message above before trying again."
                : "Continue in your Ethereum wallet. You may need to confirm both an approval and a deposit transaction."}
        </RText>
      </div>
      {state.isConfirmationUnknown && (
        <RButton
          className={styles.statusCloseButton}
          isLoading={state.isBusy}
          onClick={onCheckConfirmation}
          size="medium"
          tone="black"
        >
          Check Confirmation
        </RButton>
      )}
      {!isLocked && !state.isBusy && !state.isConfirmationUnknown && (
        <RButton
          className={styles.statusCloseButton}
          onClick={onReset}
          size="medium"
          tone="black"
        >
          Back To Deposit
        </RButton>
      )}
      <RButton
        className={styles.statusCloseButton}
        onClick={onClose}
        size="medium"
        tone="black"
        variant="secondary"
      >
        Close And Continue Trading
      </RButton>
    </div>
  );
}

// Retained for future transaction-link UI; intentionally not rendered in the status view.
export function BridgeTransactionLink({ state }: { state: UsdtBridgeState }) {
  return state.progress?.hash ? (
    <RButton
      as="a"
      href={`https://sepolia.etherscan.io/tx/${state.progress.hash}`}
      target="_blank"
      rel="noopener noreferrer"
      size="small"
      tone="black"
      variant="secondary"
    >
      View Ethereum Transaction
    </RButton>
  ) : null;
}
