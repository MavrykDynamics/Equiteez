import clsx from "clsx";
import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { CreditsBalanceStatus } from "./credits.utils";
import styles from "./CreditsWalletDropdown.module.css";

type BadgeTone = "healthy" | "empty" | "pending" | "free" | "neutral";

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

export function CreditsBalanceBadge({
  status,
  progress,
}: {
  status: CreditsBalanceStatus;
  progress: "pending" | "updating" | null;
}) {
  const tone = progress ? "pending" : STATUS_TONES[status];

  return (
    <div className={styles.badge} role="status">
      <RIcon
        aria-hidden
        className={clsx(styles.statusIcon, styles[tone])}
        name={progress ? "dots" : STATUS_ICONS[status]}
        size="small"
      />
      <RText size="body-s">
        {progress === "pending"
          ? "Adding Gas Credits"
          : progress === "updating"
            ? "Updating Gas Credits"
            : STATUS_TEXT[status]}
      </RText>
    </div>
  );
}
