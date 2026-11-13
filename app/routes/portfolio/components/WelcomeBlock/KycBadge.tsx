import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";
import type { KycStatus } from "~/lib/kyc/useKycStatus";

import styles from "./KycBadge.module.css";

/** VERIFIED / NOT VERIFIED next to the welcome title; nothing until known. */
export function KycBadge({ status }: { status: KycStatus }) {
  if (!status.isLoaded) return null;

  return (
    <span
      className={clsx(
        styles.badge,
        status.isKyced ? styles.verified : styles.notVerified
      )}
    >
      <RIcon name={status.isKyced ? "check" : "info"} size="small" />
      {status.isKyced ? "Verified" : "Not verified"}
    </span>
  );
}

/** The mark on the Profile tab while KYC is missing. */
export function KycTabMark() {
  return (
    <span aria-label="Not verified" className={styles.tabMark} role="img">
      <RIcon name="info" size="small" />
    </span>
  );
}
