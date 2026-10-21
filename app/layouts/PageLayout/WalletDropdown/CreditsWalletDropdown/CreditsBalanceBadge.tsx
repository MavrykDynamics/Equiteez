import clsx from "clsx";

import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import {
  type CreditsBalanceStatus,
  formatCredits,
  formatCreditsUsd,
} from "./credits.utils";
import styles from "./CreditsWalletDropdown.module.css";

const STATUS_ICONS: Record<CreditsBalanceStatus, RIconName> = {
  healthy: "credit-card",
  low: "warning-circle",
  empty: "warning-triangle",
  pending: "dots",
  free: "gift",
};

type CreditsBalanceBadgeProps = {
  balance: number;
  freeCredits: number;
  onAddCredits: () => void;
  pendingAmount: number | null;
  status: CreditsBalanceStatus;
};

export function CreditsBalanceBadge({
  balance,
  freeCredits,
  onAddCredits,
  pendingAmount,
  status,
}: CreditsBalanceBadgeProps) {
  return (
    <div className={styles.badge}>
      <RIcon
        className={clsx(styles.statusIcon, styles[status])}
        name={STATUS_ICONS[status]}
        size="medium"
      />

      {status === "pending" ? (
        <RText size="body-s">Adding {formatCredits(pendingAmount ?? 0)}</RText>
      ) : status === "free" ? (
        <RText size="body-s">{freeCredits} Free Credits</RText>
      ) : (
        <>
          <RText size="body-s">{formatCredits(balance)}</RText>
          <span aria-hidden className={styles.dot} />
          {status === "empty" ? (
            <button
              className={styles.addCreditsLink}
              onClick={onAddCredits}
              type="button"
            >
              Add Credits
            </button>
          ) : (
            <RText color="neutral-500" size="body-s">
              {formatCreditsUsd(balance)}
            </RText>
          )}
        </>
      )}
    </div>
  );
}
