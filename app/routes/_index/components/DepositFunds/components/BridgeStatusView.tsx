import type { BigNumber } from "bignumber.js";
import clsx from "clsx";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { toLocalFormat } from "~/lib/formaters/formaters";
import { ZERO } from "~/lib/utils/numbers";

import styles from "../RDepositFundsModal.module.css";

export type BridgeProcessStatus = "loading" | "success" | "error";
type BridgeStepStatus = BridgeProcessStatus | "pending";

export type BridgeStatusStep = {
  description: string;
  status: BridgeStepStatus;
  title: string;
};

type BridgeStatusViewProps = {
  amount: BigNumber | undefined;
  assetSymbol: string;
  onClose: () => void;
  steps?: BridgeStatusStep[];
};

const defaultBridgeStatusSteps: BridgeStatusStep[] = [
  {
    description: "Waiting for confirmations (1/3)",
    status: "loading",
    title: "Lock on Ethereum",
  },
  {
    description: "Waiting on the lock",
    status: "pending",
    title: "Validators Sign",
  },
  {
    description: "Pending validator signatures",
    status: "pending",
    title: "Mint on Mavryk",
  },
  {
    description: "Almost there",
    status: "pending",
    title: "Funds available",
  },
];

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

function formatBridgeAmount(amount: BigNumber | undefined) {
  return toLocalFormat(amount ?? ZERO, {
    decimalPlaces: 2,
  });
}

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
  amount,
  assetSymbol,
  onClose,
  steps = defaultBridgeStatusSteps,
}: BridgeStatusViewProps) {
  const formattedAmount = formatBridgeAmount(amount);

  return (
    <div className={styles.statusContent}>
      <div className={styles.statusHeader}>
        <RHeading className={styles.statusAmount} size="h6" weight="medium">
          {formattedAmount} {assetSymbol}
        </RHeading>
        <RText
          className={styles.statusDescription}
          color="neutral-700"
          size="body-sm"
        >
          Bridging from Ethereum to your Mavryk wallet
        </RText>
      </div>
      <ol className={styles.statusList}>
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
          You can close this window. The bridge keeps running and the funds will
          appear in your portfolio once process completes.
        </RText>
      </div>
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
