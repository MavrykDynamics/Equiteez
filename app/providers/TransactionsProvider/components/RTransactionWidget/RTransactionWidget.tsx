import type { ComponentProps } from "react";
import clsx from "clsx";

import Money from "~/lib/atoms/Money";
import { HashChip } from "~/lib/molecules/HashChip";

import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RTransactionWidget.module.css";

const stepLabels = [
  "Lock on Ethereum",
  "Validators Sign",
  "Mint on Mavryk",
  "Transferring",
] as const;

export type RTransactionWidgetState =
  | {
      status: "progress";
      step: 1 | 2 | 3 | 4;
      title?: string;
      description?: string;
    }
  | { status: "success"; description?: string }
  | {
      status: "error" | "warning" | "waiting";
      title?: string;
      description: string;
    };

export type RTransactionWidgetProps = {
  /** Raw value; null means unavailable. Fiat formatting remains the default. */
  amount: ComponentProps<typeof Money>["children"] | null;
  amountMode?: "fiat" | "token";
  symbol?: string;
  /** Full destination address, shortened and copied by HashChip. */
  recipient: string;
  state: RTransactionWidgetState;
  sourceExplorerUrl?: string;
  className?: string;
};

const messageIcons: Record<
  "success" | "error" | "warning" | "waiting",
  RIconName
> = {
  success: "ok",
  error: "cross",
  warning: "info",
  waiting: "info",
};

/** Presentation only: callers supply the state, raw amount, and full address. */
export function RTransactionWidget({
  amount,
  symbol = "USD",
  amountMode = "fiat",
  recipient,
  state,
  className,
  sourceExplorerUrl,
}: RTransactionWidgetProps) {
  return (
    <section
      aria-label="Bridge transaction"
      className={clsx(styles.widget, className)}
      data-status={state.status}
    >
      <div className={styles.header}>
        <RText className={styles.amount} size="body-sm" weight="medium">
          {amount === null ? (
            "Amount unavailable"
          ) : (
            <>
              {amountMode === "token" ? (
                amount.toString()
              ) : (
                <Money fiat tooltip={false}>
                  {amount}
                </Money>
              )}{" "}
              {symbol}
            </>
          )}
        </RText>
        <RText className={styles.recipient} size="body-s">
          <RText color="neutral-700" size="body-s">
            To:
          </RText>
          <HashChip
            aria-label={`Copy recipient address ${recipient}`}
            className={styles.address}
            firstCharsCount={9}
            lastCharsCount={3}
            hash={recipient}
            type="link"
          />
        </RText>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        {state.status === "progress" ? (
          <ol className={styles.steps} aria-label="Bridge progress">
            {stepLabels.map((defaultLabel, index) => {
              const step = index + 1;
              const isCurrent = step === state.step;
              const label = isCurrent
                ? (state.title ?? defaultLabel)
                : defaultLabel;
              const status = isCurrent
                ? "loading"
                : step < state.step
                  ? "success"
                  : "pending";
              return (
                <li
                  key={defaultLabel}
                  className={styles.step}
                  data-current={isCurrent || undefined}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${label}: ${isCurrent ? "in progress" : step < state.step ? "complete" : "pending"}`}
                  title={label}
                >
                  <span
                    className={styles.indicator}
                    data-status={status}
                    aria-hidden="true"
                  >
                    {status === "pending" ? (
                      step
                    ) : (
                      <RIcon
                        className={styles.statusIcon}
                        name={isCurrent ? "loading" : "ok"}
                        size="small"
                      />
                    )}
                  </span>
                  <RText
                    className={styles.stepLabel}
                    size="body-s"
                    aria-hidden="true"
                  >
                    {label}
                  </RText>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className={styles.message}>
            <span className={styles.indicator} data-status={state.status}>
              <RIcon
                className={styles.statusIcon}
                name={messageIcons[state.status]}
                size="small"
                viewBox={
                  messageIcons[state.status] === "info"
                    ? "0 0 13 13"
                    : "0 0 24 24"
                }
                strokeWidth={messageIcons[state.status] === "info" ? 1 : 1.5}
              />
            </span>
            <div className={styles.messageCopy}>
              <RText size="body-s">
                {state.status === "success"
                  ? "Successfully transferred"
                  : (state.title ??
                    (state.status === "error"
                      ? "Transfer failed"
                      : "Confirmation pending"))}
              </RText>
              <RText color="neutral-700" size="body-s">
                {state.description ??
                  "Your funds are now available in your Mavryk wallet."}
              </RText>
            </div>
          </div>
        )}
        {state.status === "progress" && state.description && (
          <RText className={styles.details} color="neutral-700" size="body-s">
            {state.description}
          </RText>
        )}
      </div>
      {sourceExplorerUrl && (
        <a
          className={styles.explorer}
          href={sourceExplorerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View source transaction
        </a>
      )}
    </section>
  );
}
