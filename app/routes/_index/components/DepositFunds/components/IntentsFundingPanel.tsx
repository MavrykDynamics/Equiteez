import clsx from "clsx";

import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import { formatRawAmount } from "~/lib/intents/intentRoute";

import styles from "../RDepositFundsModal.module.css";

type IntentsFundingPanelProps = {
  record: IntentRecord | undefined;
  isFunding: boolean;
  error: string | null;
  isWrongNetwork: boolean;
  explorerUrl?: string;
  onFund: () => Promise<void> | void;
  /** Mock mode only. */
  onSimulate?: () => void;
};

const explorerLink = (base: string | undefined, path: string) =>
  base ? `${base.replace(/\/$/, "")}/${path}` : undefined;

/**
 * The only wallet action in the 1Click flow. Once the wallet was asked, this
 * panel never offers to send the same operation again.
 */
export function IntentsFundingPanel({
  record,
  isFunding,
  error,
  isWrongNetwork,
  explorerUrl,
  onFund,
  onSimulate,
}: IntentsFundingPanelProps) {
  if (!record?.funding) return null;
  const amount = `${formatRawAmount(record.funding.amount, record.source.decimals)} ${record.source.symbol}`;
  const hash = record.sourceHashes.at(-1);
  const txUrl = hash ? explorerLink(explorerUrl, `tx/${hash}`) : undefined;
  const depositUrl = explorerLink(
    explorerUrl,
    `address/${record.funding.depositAddress}`
  );
  const message = (text: string, tone: "info" | "warning" = "info") => (
    <div
      className={clsx(styles.notice, tone === "warning" && styles.warning)}
      role={tone === "warning" ? "alert" : "status"}
    >
      <RText color="neutral-700" size="body-sm">
        {text}{" "}
        {txUrl ? (
          <a href={txUrl} rel="noopener noreferrer" target="_blank">
            View transaction
          </a>
        ) : depositUrl && tone === "warning" ? (
          <a href={depositUrl} rel="noopener noreferrer" target="_blank">
            View deposit address
          </a>
        ) : null}
      </RText>
    </div>
  );

  switch (record.fundingState) {
    case "not_started":
    case "rejected":
      return (
        <>
          {(error || record.fundingError) && (
            <RText color="red-500" role="alert" size="body-s">
              {error ?? record.fundingError}
            </RText>
          )}
          {isWrongNetwork && (
            <RText color="neutral-700" size="body-s">
              Your wallet will be asked to switch to {record.source.chainName}.
            </RText>
          )}
          <RButton
            className={styles.statusCloseButton}
            isLoading={isFunding}
            onClick={onFund}
            size="medium"
            tone="black"
          >
            Send {amount}
          </RButton>
          {onSimulate && (
            <RButton
              className={styles.statusCloseButton}
              disabled={isFunding}
              onClick={onSimulate}
              size="medium"
              tone="black"
              variant="secondary"
            >
              Simulate Funding (mock API)
            </RButton>
          )}
        </>
      );
    case "prompted":
      return isFunding
        ? message(`Confirm the ${amount} transfer in your wallet.`)
        : message(
            "Check your wallet: this transfer was already requested. Do not send it again; if you sent it, tracking picks it up automatically.",
            "warning"
          );
    case "broadcast":
      return message(
        `Transfer of ${amount} sent. Waiting for ${record.source.chainName} confirmation.`
      );
    case "confirmed":
      return message(
        `Transfer of ${amount} confirmed on ${record.source.chainName}.`
      );
    case "unknown":
      return message(
        record.fundingError ??
          "The transfer outcome is unknown. Check your wallet before doing anything else.",
        "warning"
      );
    case "reverted":
      return message(
        record.fundingError ?? "The transfer failed. Start a new deposit.",
        "warning"
      );
    default:
      return null;
  }
}
