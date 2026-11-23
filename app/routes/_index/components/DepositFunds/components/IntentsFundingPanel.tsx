import type { ReactNode } from "react";

import { RButton } from "~/lib/atoms/RButton";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import { formatRawAmount } from "~/lib/intents/intentRoute";
import { RAlert } from "~/templates/Alert/RAlert";

import { DotsLoader } from "./DepositParts";
import styles from "./IntentsQuoteView.module.css";

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
  if (!record?.operationId) return null;
  const amount = `${formatRawAmount(record.request.amountIn, record.source.decimals)} ${record.source.symbol}`;
  const hash = record.sourceHashes.at(-1);
  const txUrl = hash ? explorerLink(explorerUrl, `tx/${hash}`) : undefined;
  // Historical instructions: display/support only, never permission to send.
  const depositAddress = (
    record.backend?.fundingInstructions ?? record.lastInstructions
  )?.depositAddress;
  const depositUrl = depositAddress
    ? explorerLink(explorerUrl, `address/${depositAddress}`)
    : undefined;
  const link = (isWarning: boolean): ReactNode =>
    txUrl ? (
      <a href={txUrl} rel="noopener noreferrer" target="_blank">
        View transaction
      </a>
    ) : depositUrl && isWarning ? (
      <a href={depositUrl} rel="noopener noreferrer" target="_blank">
        View deposit address
      </a>
    ) : null;
  const waiting = (label: ReactNode, caption: ReactNode) => (
    <>
      <RButton
        aria-busy="true"
        className={styles.action}
        disabled
        iconLeft={<DotsLoader />}
        size="large"
        tone="black"
      >
        {label}
      </RButton>
      <p className={styles.caption} role="status">
        {caption}
      </p>
    </>
  );
  const warning = (header: string, text: string) => (
    <RAlert header={header} role="alert">
      {text} {link(true)}
    </RAlert>
  );

  switch (record.fundingState) {
    case "not_started":
    case "rejected":
      return (
        <>
          {(error || record.fundingError) && (
            <RAlert header="Transfer not sent" role="alert" type="error">
              {error ?? record.fundingError}
            </RAlert>
          )}
          <RButton
            aria-label={`Send ${amount}`}
            className={styles.action}
            isLoading={isFunding}
            onClick={onFund}
            size="large"
            tone="black"
          >
            Send
          </RButton>
          {onSimulate && (
            <RButton
              className={styles.action}
              disabled={isFunding}
              onClick={onSimulate}
              size="large"
              tone="black"
              variant="secondary"
            >
              Simulate Funding (mock API)
            </RButton>
          )}
          <p className={styles.caption}>
            {isWrongNetwork && (
              <>
                Your wallet will be asked to switch to {record.source.chainName}
                .
                <br />
              </>
            )}
            Transfers are irreversible.
            <br />
            Tokens arrive in your Equiteez wallet automatically.
          </p>
        </>
      );
    case "prompted":
      return isFunding
        ? waiting(
            "Confirm in your wallet",
            `Approve the ${amount} transfer in your wallet.`
          )
        : warning(
            "Check your wallet",
            "This transfer was already requested. Do not send it again; if you sent it, tracking picks it up automatically."
          );
    case "broadcast":
      return waiting(
        "Sending",
        <>
          Transfer of {amount} sent. Waiting for {record.source.chainName}{" "}
          confirmation. {link(false)}
        </>
      );
    case "confirmed":
      return waiting(
        "Sending",
        <>
          Transfer of {amount} confirmed on {record.source.chainName}.{" "}
          {link(false)}
        </>
      );
    case "unknown":
      return warning(
        "Transfer outcome unknown",
        record.fundingError ??
          "The transfer outcome is unknown. Check your wallet before doing anything else."
      );
    case "reverted":
      return warning(
        "Transfer failed",
        record.fundingError ?? "The transfer failed. Start a new deposit."
      );
    default:
      return null;
  }
}
