import { useId, type ReactNode } from "react";
import { BigNumber } from "bignumber.js";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";
import { AssetField } from "~/lib/organisms/AssetField";

import styles from "./RAmountInput.module.css";

export type RAmountInputProps = {
  label: ReactNode;
  amount: BigNumber | undefined;
  /** Maximum fractional digits accepted by the input. */
  decimals: number;
  onChange: (value?: BigNumber) => void;
  /** Selected token; `null` shows the "Select" placeholder pill. */
  token: { symbol: string; icon: ReactNode } | null;
  /** Opens the token picker; without it the pill is display-only. */
  onTokenClick?: () => void;
  /** Top-right content, e.g. the wallet balance and a Max action. */
  balance?: ReactNode;
  /** Optional bottom row. */
  footer?: ReactNode;
  /** Dims the whole card and disables every control. */
  disabled?: boolean;
  /** Disables typing only (e.g. a fixed amount). */
  isAmountDisabled?: boolean;
  placeholder?: string;
  className?: string;
};

/** Redesign token amount input: label, balance, token pill and amount. */
export function RAmountInput({
  label,
  amount,
  decimals,
  onChange,
  token,
  onTokenClick,
  balance,
  footer,
  disabled = false,
  isAmountDisabled = false,
  placeholder = "0.00",
  className,
}: RAmountInputProps) {
  const labelId = useId();
  const pill = (
    <>
      {token ? token.icon : <span className={styles.emptyIcon} />}
      <span className={styles.pillLabel}>{token?.symbol ?? "Select"}</span>
      {onTokenClick && (
        <RIcon
          className={styles.pillChevron}
          name="arrow-short-down"
          size="small"
        />
      )}
    </>
  );

  return (
    <div
      aria-disabled={disabled || undefined}
      className={clsx(styles.card, disabled && styles.disabled, className)}
      role="group"
      aria-labelledby={labelId}
    >
      <div className={styles.header}>
        <span className={styles.label} id={labelId}>
          {label}
        </span>
        {balance && <span className={styles.balance}>{balance}</span>}
      </div>
      <div className={styles.body}>
        {onTokenClick ? (
          <button
            aria-haspopup="listbox"
            aria-label={token ? `Change token, ${token.symbol}` : "Select token"}
            className={clsx(styles.pill, styles.pillButton)}
            disabled={disabled}
            onClick={onTokenClick}
            type="button"
          >
            {pill}
          </button>
        ) : (
          <span className={styles.pill}>{pill}</span>
        )}
        <AssetField
          aria-labelledby={labelId}
          assetDecimals={decimals}
          className={styles.input}
          containerClassName={styles.inputContainer}
          disabled={disabled || isAmountDisabled}
          inputMode="decimal"
          max={9999999999999}
          min={0}
          onChange={(value) =>
            onChange(value ? new BigNumber(value) : undefined)
          }
          placeholder={placeholder}
          style={{ padding: 0, borderRadius: 0, height: "auto" }}
          value={amount?.toFixed()}
        />
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
