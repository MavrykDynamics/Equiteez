import clsx from "clsx";

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
  | { status: "progress"; step: 1 | 2 | 3 | 4 }
  | { status: "success"; description?: string }
  | { status: "error" | "warning"; title?: string; description: string };

export type RTransactionWidgetProps = {
  /** Display-formatted amount, without the token symbol. */
  amount: string;
  symbol?: string;
  /** Display-formatted destination address. */
  recipient: string;
  state: RTransactionWidgetState;
  className?: string;
};

const messageIcons: Record<"success" | "error" | "warning", RIconName> = {
  success: "ok",
  error: "cross",
  warning: "info",
};

/** Presentation only: callers select the state and format transaction values. */
export function RTransactionWidget({
  amount,
  symbol = "USDT",
  recipient,
  state,
  className,
}: RTransactionWidgetProps) {
  return (
    <section
      aria-label="Bridge transaction"
      className={clsx(styles.widget, className)}
      data-status={state.status}
    >
      <div className={styles.header}>
        <RText className={styles.amount} size="body-sm" weight="medium">
          {amount} {symbol}
        </RText>
        <RText className={styles.recipient} size="body-s">
          <RText color="neutral-700" size="body-s">
            To:
          </RText>
          <span className={styles.address} title={recipient}>
            {recipient}
          </span>
        </RText>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        {state.status === "progress" ? (
          <ol className={styles.steps} aria-label="Bridge progress">
            {stepLabels.map((label, index) => {
              const step = index + 1;
              const isCurrent = step === state.step;
              const status = isCurrent
                ? "loading"
                : step < state.step
                  ? "success"
                  : "pending";
              return (
                <li
                  key={label}
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
                  {isCurrent && (
                    <RText
                      className={styles.stepLabel}
                      size="body-s"
                      aria-hidden="true"
                    >
                      {label}
                    </RText>
                  )}
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
      </div>
    </section>
  );
}
