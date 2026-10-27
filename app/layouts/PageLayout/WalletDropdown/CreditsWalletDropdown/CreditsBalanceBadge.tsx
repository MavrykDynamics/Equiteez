import clsx from "clsx";
import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  formatCredits,
  getCreditsCount,
  getCreditsTone,
  type Credits,
  type CreditsBalanceStatus,
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
  credits,
  onAddCredits,
}: {
  status: CreditsBalanceStatus;
  progress: "pending" | "updating" | null;
  credits?: Credits;
  onAddCredits?: () => void;
}) {
  const count =
    status === "ready" && credits?.enabled
      ? getCreditsCount(credits.balanceUnits, credits.decimals)
      : null;
  const countTone =
    count && credits?.enabled
      ? getCreditsTone(count, credits.freeAllowanceRemaining)
      : null;

  let tone: BadgeTone = STATUS_TONES[status];
  let icon = STATUS_ICONS[status];
  let text = STATUS_TEXT[status];
  if (progress) {
    tone = "pending";
    icon = "dots";
    text =
      progress === "pending" ? "Adding Gas Credits" : "Updating Gas Credits";
  } else if (count && countTone && credits?.enabled) {
    tone = countTone;
    icon = TONE_ICONS[countTone];
    text =
      countTone === "free"
        ? `${credits.freeAllowanceRemaining} Free Gas ${credits.freeAllowanceRemaining === 1 ? "Credit" : "Credits"}`
        : formatCredits(count);
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
