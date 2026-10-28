import clsx from "clsx";
import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  formatCredits,
  formatUsdt,
  type CreditsBalanceStatus,
  type CreditsSummary,
  type CreditsTone,
} from "./credits.utils";
import styles from "./CreditsWalletDropdown.module.css";

type BadgeTone = CreditsTone | "pending" | "neutral";

const STATUS_ICONS: Record<CreditsBalanceStatus, RIconName> = {
  ready: "credit-card",
  unknown: "credit-card",
  loading: "dots",
  error: "warning-triangle",
  free: "gift",
};
const STATUS_TONES: Record<CreditsBalanceStatus, BadgeTone> = {
  ready: "healthy",
  unknown: "neutral",
  loading: "pending",
  error: "empty",
  free: "free",
};
const STATUS_TEXT: Record<CreditsBalanceStatus, string> = {
  ready: "Gas Credits",
  unknown: "Gas Credits unavailable",
  loading: "Gas Credits loading…",
  error: "Gas Credits unavailable",
  free: "Gas sponsored",
};
const TONE_ICONS: Record<CreditsTone, RIconName> = {
  healthy: "credit-card",
  low: "warning-circle",
  empty: "warning-triangle",
  free: "gift",
};

export function CreditsBalanceBadge({
  status,
  progress,
  summary,
  onAddCredits,
}: {
  status: CreditsBalanceStatus;
  progress: "pending" | "updating" | null;
  summary?: CreditsSummary | null;
  onAddCredits?: () => void;
}) {
  const countTone = status === "ready" ? (summary?.tone ?? null) : null;

  let tone: BadgeTone = STATUS_TONES[status];
  let icon = STATUS_ICONS[status];
  let text = STATUS_TEXT[status];
  if (progress) {
    tone = "pending";
    icon = "dots";
    text =
      progress === "pending" ? "Adding Gas Credits" : "Updating Gas Credits";
  } else if (summary && countTone) {
    tone = countTone;
    icon = TONE_ICONS[countTone];
    text =
      countTone === "free"
        ? `${summary.free} Free Gas ${summary.free === 1 ? "Credit" : "Credits"}`
        : formatCredits(summary.available!);
  } else if (status === "ready" && summary) {
    // Buy and sell prices differ: no single Credit count exists.
    text = `${formatUsdt(summary.balance)} USDT`;
  }

  return (
    <div className={styles.badge} role="status">
      <RIcon
        aria-hidden
        className={clsx(styles.statusIcon, styles[tone])}
        name={icon}
        size="small"
      />
      <RText size="body-s">{text}</RText>
      {!progress && countTone === "empty" && onAddCredits && (
        <>
          <span aria-hidden className={styles.dot} />
          <button
            className={styles.addCreditsLink}
            onClick={onAddCredits}
            type="button"
          >
            Add Credits
          </button>
        </>
      )}
    </div>
  );
}
