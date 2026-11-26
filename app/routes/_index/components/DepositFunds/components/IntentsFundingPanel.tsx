import type { ReactNode } from "react";

import { RButton } from "~/lib/atoms/RButton";
import type { IntentRecord } from "~/lib/intents/intentOperation";
import { formatRawAmount } from "~/lib/intents/intentCatalog";
import { getEvmFundingBlocker } from "~/lib/intents/intentFunding";
import { getIntentNetwork } from "~/lib/intents/intentNetworks";
import { RAlert } from "~/templates/Alert/RAlert";

import { DotsLoader } from "./DepositParts";
import styles from "./IntentsQuoteView.module.css";

type IntentsFundingPanelProps = {
  record: IntentRecord | undefined;
  isFunding: boolean;
  error: string | null;
  isWrongNetwork: boolean;
  onFund: () => Promise<void> | void;
  /** The user paid the deposit address from another wallet or an exchange. */
  onMarkSent: () => void;
  /** Mock mode only. */
  onSimulate?: () => void;
};

/**
 * Send actions of the deposit screen. A connected EVM wallet can send EVM
 * deposits in one click; any deposit can be paid from another wallet or an
 * exchange and confirmed with "I've sent it". Once the wallet was asked or
 * the user reported sending, this panel never offers to send again.
 */
export function IntentsFundingPanel({
  record,
  isFunding,
  error,
  isWrongNetwork,
  onFund,
  onMarkSent,
  onSimulate,
}: IntentsFundingPanelProps) {
  if (!record?.operationId) return null;
  const amount = `${formatRawAmount(record.request.amountIn, record.source.decimals)} ${record.source.symbol}`;
  const explorer = getIntentNetwork(record.source.network)?.explorer;
  const hash = record.sourceHashes.at(-1);
  const txUrl = hash ? explorer?.tx(hash) : undefined;
  // Historical instructions: display/support only, never permission to send.
  const instructions =
    record.backend?.fundingInstructions ?? record.lastInstructions;
  const depositUrl = instructions
    ? explorer?.address(instructions.depositAddress)
    : undefined;
  // A wallet reviewed with the deposit sends it, unless it cannot attach the
  // memo (non-EVM) or the transfer is not a plain EVM one.
  const canWalletSend = Boolean(
    record.sourceWallet &&
      !onSimulate &&
      instructions &&
      (record.source.family === "evm"
        ? !getEvmFundingBlocker(record.source, instructions)
        : Boolean(record.sourceWalletId) && instructions.depositMemo === null)
  );
  const walletLabel = record.sourceWalletName ?? "wallet";
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
          {canWalletSend && (
            <RButton
              aria-label={`Send ${amount} from your wallet`}
              className={styles.action}
              isLoading={isFunding}
              onClick={onFund}
              size="large"
              tone="black"
            >
              Send from {walletLabel}
            </RButton>
          )}
          {onSimulate && (
            <RButton
              className={styles.action}
              disabled={isFunding}
              onClick={onSimulate}
              size="large"
              tone="black"
            >
              Simulate Deposit (mock API)
            </RButton>
          )}
          <RButton
            className={styles.action}
            disabled={isFunding}
            onClick={onMarkSent}
            size="large"
            tone="black"
            variant={canWalletSend || onSimulate ? "secondary" : "primary"}
          >
            I&apos;ve sent the deposit
          </RButton>
          <p className={styles.caption}>
            {canWalletSend && isWrongNetwork && (
              <>
                Your wallet will be asked to switch to{" "}
                {record.source.networkName}.
                <br />
              </>
            )}
            {canWalletSend
              ? "Or send it from any other wallet or exchange."
              : `Send it from any ${record.source.networkName} wallet or exchange.`}{" "}
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
          Transfer of {amount} sent. Waiting for {record.source.networkName}{" "}
          confirmation. {link(false)}
        </>
      );
    case "confirmed":
      return waiting(
        "Sending",
        <>
          Transfer of {amount} confirmed on {record.source.networkName}.{" "}
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
