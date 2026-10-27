import clsx from "clsx";
import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { CreditsBalanceStatus } from "./credits.utils";
import styles from "./CreditsWalletDropdown.module.css";

const STATUS_ICONS: Record<CreditsBalanceStatus, RIconName> = {
  ready: "credit-card",
  unknown: "credit-card",
  loading: "dots",
  error: "warning-triangle",
  free: "gift",
};
const STATUS_TEXT: Record<CreditsBalanceStatus, string> = {
  ready: "Credits",
  unknown: "Credits unavailable",
  loading: "Credits loading…",
  error: "Credits unavailable",
  free: "Gas sponsored",
};

export function CreditsBalanceBadge({
  status,
  progress,
}: {
  status: CreditsBalanceStatus;
  progress: "pending" | "updating" | null;
}) {
  return (
    <div className={styles.badge} role="status">
      <RIcon
        aria-hidden
        className={clsx(styles.statusIcon, styles[status])}
        name={progress ? "dots" : STATUS_ICONS[status]}
        size="medium"
      />
      <RText size="body-s">
        {progress === "pending"
          ? "Top-up pending"
          : progress === "updating"
            ? "Credits updating"
            : STATUS_TEXT[status]}
      </RText>
    </div>
  );
}
