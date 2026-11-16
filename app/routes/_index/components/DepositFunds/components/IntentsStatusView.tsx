import clsx from "clsx";

import { INTENTS_SOURCE_CHAINS } from "~/consts/intents";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { HashChip } from "~/lib/molecules/HashChip";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import { formatRawAmount } from "~/lib/intents/intentRoute";
import type { TransactionWidgetModel } from "~/providers/TransactionsProvider/transactionWidget.helpers";

import styles from "../RDepositFundsModal.module.css";
import { BridgeStatusListItem, getDepositSteps } from "./BridgeStatusView";
import intentsStyles from "./IntentsView.module.css";

type IntentsStatusViewProps = {
  record: IntentRecord;
  /** Same model the global widget renders for this operation. */
  model: TransactionWidgetModel | null;
  onClose: () => void;
  onStartNew: () => void;
};

function Identity({
  label,
  hash,
  href,
}: {
  label: string;
  hash: string;
  href?: string;
}) {
  return (
    <div className={intentsStyles.quoteRow}>
      <dt>
        <RText color="neutral-700" size="body-s">
          {label}
        </RText>
      </dt>
      <dd>
        {href ? (
          <a href={href} rel="noopener noreferrer" target="_blank">
            <RText size="body-s">
              {hash.slice(0, 10)}…{hash.slice(-6)}
            </RText>
          </a>
        ) : (
          <HashChip
            aria-label={`Copy ${label}`}
            firstCharsCount={10}
            hash={hash}
            lastCharsCount={6}
            type="link"
          />
        )}
      </dd>
    </div>
  );
}

/**
 * Details of one 1Click operation; shares its model with the widget card so
 * minimize/reopen show the same progress. The identifiers stay separate: the
 * funding hash, the 1Click delivery transfers, the sponsored forward and its
 * ERC20WrapAsked events, and the Mavryk mint are different transactions.
 */
export function IntentsStatusView({
  record,
  model,
  onClose,
  onStartNew,
}: IntentsStatusViewProps) {
  const explorer = INTENTS_SOURCE_CHAINS.find(
    (chain) => chain.id === record.source.chainId
  )?.blockExplorers?.default.url;
  const txUrl = (hash: string) =>
    explorer ? `${explorer.replace(/\/$/, "")}/tx/${hash}` : undefined;
  const steps = model ? getDepositSteps(model, "Pending") : [];
  const state = model?.state;
  const backend = record.backend;
  const isFinished = !model || model.isTerminal;

  return (
    <div className={styles.statusContent}>
      <div className={styles.statusHeader}>
        <RHeading className={styles.statusAmount} size="h6" weight="medium">
          {formatRawAmount(record.request.amountIn, record.source.decimals)}{" "}
          {record.source.symbol}
        </RHeading>
        <RText
          className={styles.statusDescription}
          color="neutral-700"
          size="body-sm"
        >
          Depositing from {record.source.chainName} to your Mavryk account
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
      <div
        className={clsx(
          styles.notice,
          styles.statusNotice,
          state?.status === "warning" && styles.warning
        )}
        role="status"
      >
        <div className={styles.statusNoticeIcon}>
          <RIcon aria-hidden="true" name="info" size="small" />
        </div>
        <RText className={styles.statusNoticeText} size="body-sm">
          {state?.status === "success"
            ? (state.description ?? "Arrived in your Mavryk account.")
            : state &&
                "title" in state &&
                state.title &&
                state.status !== "progress"
              ? `${state.title}. ${state.description}`
              : (state?.description ??
                "You can close this window. Tracking continues in the background.")}
        </RText>
      </div>

      <dl className={intentsStyles.quoteList} aria-label="Deposit identifiers">
        {record.operationId && (
          <Identity hash={record.operationId} label="Operation ID" />
        )}
        {record.sourceHashes.length > 0 && (
          <Identity
            hash={record.sourceHashes.at(-1)!}
            href={txUrl(record.sourceHashes.at(-1)!)}
            label={`${record.source.chainName} funding`}
          />
        )}
        {backend?.delivery.transactionHashes.map((hash) => (
          <Identity hash={hash} key={hash} label="1Click delivery" />
        ))}
        {backend?.forwarding.transactionHash && (
          <Identity
            hash={backend.forwarding.transactionHash}
            label="Sponsored forward"
          />
        )}
        {backend?.forwarding.bridgeEvents.map((event) => (
          <Identity
            hash={`${event.transactionHash}:${event.logIndex}`}
            key={`${event.transactionHash}:${event.logIndex}`}
            label="Bridge wrap event"
          />
        ))}
        {backend?.settlement.mints.map((mint) => (
          <Identity
            hash={mint.operationHash}
            key={mint.operationHash}
            label="Mavryk mint"
          />
        ))}
      </dl>

      {isFinished && (
        <RButton
          className={styles.statusCloseButton}
          onClick={onStartNew}
          size="medium"
          tone="black"
        >
          Start New Deposit
        </RButton>
      )}
      <RButton
        className={styles.statusCloseButton}
        onClick={onClose}
        size="medium"
        tone="black"
        variant={isFinished ? "secondary" : "primary"}
      >
        {isFinished ? "Close" : "Minimize And Continue Browsing"}
      </RButton>
    </div>
  );
}
