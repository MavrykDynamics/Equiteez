import { INTENTS_SOURCE_CHAINS } from "~/consts/intents";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RTokenIcon } from "~/lib/atoms/RTokenIcon";
import { HashChip } from "~/lib/molecules/HashChip";
import { getIntentTokenIcon } from "~/lib/intents/intentAssetIcon";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import { formatRawAmount } from "~/lib/intents/intentRoute";
import { RAlert } from "~/templates/Alert/RAlert";
import type { TransactionWidgetModel } from "~/providers/TransactionsProvider/transactionWidget.helpers";

import { getDepositSteps, type BridgeStatusStep } from "./depositSteps";
import {
  DepositModalHeader,
  DetailRow,
  DotsLoader,
  TransferSummary,
} from "./DepositParts";
import styles from "./IntentsStatusView.module.css";

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
    <DetailRow label={label}>
      {href ? (
        <a
          className={styles.link}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {hash.slice(0, 10)}…{hash.slice(-6)}
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
    </DetailRow>
  );
}

function StepIndicator({ status }: { status: BridgeStatusStep["status"] }) {
  return (
    <span className={styles.indicator} data-status={status}>
      {status === "success" ? (
        <RIcon name="check" size="small" />
      ) : status === "loading" ? (
        <DotsLoader />
      ) : status === "error" ? (
        <RIcon name="cross" size="small" />
      ) : null}
    </span>
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
  const fundingHash = record.sourceHashes.at(-1);
  const fundingUrl = fundingHash ? txUrl(fundingHash) : undefined;
  const { destination } = record;
  const confirmedAmount = backend?.settlement.confirmedAmount;
  const recipientCaption =
    confirmedAmount && confirmedAmount !== "0"
      ? `Received ${formatRawAmount(confirmedAmount, destination.decimals)} ${destination.symbol}`
      : record.expectedAmountOut
        ? `Your Equiteez wallet · ≈ ${formatRawAmount(record.expectedAmountOut, record.settlementDecimals)} ${destination.symbol}`
        : "Your Equiteez wallet";
  const alert =
    state && (state.status === "warning" || state.status === "error")
      ? state
      : null;
  const notice =
    state?.status === "success"
      ? (state.description ?? "Arrived in your Mavryk account.")
      : null;
  const hasIdentifiers = Boolean(
    record.operationId ||
      fundingHash ||
      backend?.delivery.transactionHashes.length ||
      backend?.forwarding.transactionHash ||
      backend?.forwarding.bridgeEvents.length ||
      backend?.settlement.mints.length
  );

  return (
    <div className={styles.screen}>
      <DepositModalHeader onClose={onClose} title="Deposit Funds" />

      <section className={styles.card}>
        <TransferSummary
          amount={`${formatRawAmount(record.request.amountIn, record.source.decimals)} ${record.source.symbol}`}
          amountCaption={`on ${record.source.chainName}`}
          recipient={record.request.recipient}
          recipientCaption={recipientCaption}
          tokenIcon={
            <RTokenIcon
              label={record.source.symbol}
              size="xlarge"
              src={getIntentTokenIcon(record.source.symbol)}
            />
          }
        />
        <hr className={styles.divider} />
        <ol aria-live="polite" className={styles.steps}>
          {steps.map((step, index) => (
            <li
              aria-current={step.status === "loading" ? "step" : undefined}
              className={styles.step}
              data-status={step.status}
              key={`${index}-${steps.length}`}
            >
              <StepIndicator status={step.status} />
              <span className={styles.stepCopy}>
                <span className={styles.stepTitle}>{step.title}</span>
                {step.status === "loading" && (
                  <span className={styles.stepDescription}>
                    {step.description}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
        {alert && (
          <RAlert
            header={alert.title ?? "Check your deposit"}
            role="alert"
            type={alert.status === "error" ? "error" : "warning"}
          >
            {alert.description}
          </RAlert>
        )}
        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
      </section>

      {hasIdentifiers && (
        <details className={styles.details}>
          <summary className={styles.detailsSummary}>
            Transaction details
            <RIcon name="arrow-short-down" size="small" />
          </summary>
          <dl aria-label="Deposit identifiers" className={styles.detailsList}>
            {record.operationId && (
              <Identity hash={record.operationId} label="Operation ID" />
            )}
            {fundingHash && (
              <Identity
                hash={fundingHash}
                href={fundingUrl}
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
        </details>
      )}

      <div className={styles.actions}>
        {fundingUrl && (
          <RButton
            as="a"
            className={styles.action}
            href={fundingUrl}
            rel="noopener noreferrer"
            size="large"
            target="_blank"
            tone="black"
            variant="secondary"
          >
            View on explorer
          </RButton>
        )}
        {isFinished ? (
          <RButton
            className={styles.action}
            onClick={onClose}
            size="large"
            tone="black"
          >
            Done
          </RButton>
        ) : (
          <RButton
            className={styles.action}
            onClick={onStartNew}
            size="large"
            tone="black"
            variant="secondary"
          >
            New deposit
          </RButton>
        )}
      </div>

      {!isFinished && (
        <p className={styles.caption}>
          You can close this window — your deposit continues.
        </p>
      )}
    </div>
  );
}
