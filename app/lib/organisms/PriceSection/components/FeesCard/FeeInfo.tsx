import { renderToStaticMarkup } from "react-dom/server";

import GasCreditInfoIcon from "~/icons/gas-credit-info.svg?react";
import { RTooltip } from "~/lib/atoms/RTooltip";
import styles from "./styles.module.css";

// Presentational only: keep wallet/relay providers out of this module so the
// primary purchase panel can share it without loading them.

/** Static tooltip markup listing fee components; "-" while one is unknown. */
export function feeBreakdownTooltip(rows: { label: string; value: string }[]) {
  return renderToStaticMarkup(
    <div className={styles.feeTooltip}>
      {rows.map(({ label, value }) => (
        <div className={styles.feeTooltipRow} key={label}>
          <span>{label}</span>
          <span className={styles.feeTooltipValue}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export function InfoButton({
  content,
  allowHTML,
  label,
}: {
  content: string;
  allowHTML?: boolean;
  label: string;
}) {
  return (
    <RTooltip
      allowHTML={allowHTML}
      className={styles.gasCreditTooltip}
      content={content}
      maxWidth={315}
    >
      <button aria-label={label} className={styles.gasCreditInfo} type="button">
        <GasCreditInfoIcon aria-hidden />
      </button>
    </RTooltip>
  );
}
