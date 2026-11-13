/** KYC status of the signed-in wallet and, when enabled, "Start KYC". */
import clsx from "clsx";
import type { ReactNode } from "react";

import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { isKycSelfServiceEnabled } from "~/lib/kyc/kyc.config";
import { useKycRegistration } from "~/lib/kyc/useKycRegistration";
import { useKycStatus } from "~/lib/kyc/useKycStatus";

import styles from "../styles.module.css";

/** "2026-11-13T10:00:00Z" → "13.11.2026" */
export const formatKycDate = (value: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}.${month}.${date.getFullYear()}`;
};

export function KycInfo() {
  const status = useKycStatus();
  const { state, start } = useKycRegistration();

  if (status.hasError) {
    return (
      <Message icon="info" tone="neutral">
        We couldn&apos;t load your verification status. Refresh the page to try
        again.
      </Message>
    );
  }

  if (!status.isLoaded) {
    return (
      <Message icon="loading" tone="neutral">
        Checking your verification status…
      </Message>
    );
  }

  if (status.isKyced) {
    const verifiedAt = formatKycDate(status.verifiedAt);
    const expiresAt = formatKycDate(status.expiresAt);

    return (
      <Message icon="check" tone="success">
        <p>
          You successfully completed KYC verification
          {verifiedAt ? ` on ${verifiedAt}` : ""}. Thank you for verifying your
          identity, and welcome to the platform!
        </p>
        {expiresAt && (
          <p>Your KYC verification will need to be renewed on {expiresAt}.</p>
        )}
      </Message>
    );
  }

  if (state.name === "submitting" || state.name === "confirming") {
    return (
      <Message icon="loading" tone="warning">
        Verifying your wallet… This usually takes under a minute.
      </Message>
    );
  }

  if (state.name === "processing") {
    return (
      <Message icon="info" tone="warning">
        Verification is still processing. Check back in a minute.
      </Message>
    );
  }

  if (!isKycSelfServiceEnabled()) {
    return (
      <Message icon="info" tone="warning">
        Complete verification to unlock all platform features. Upgrade to Mavryk
        Pro inside your Mavryk Wallet.
      </Message>
    );
  }

  return (
    <div className={styles.kyc}>
      <Message icon="info" tone="warning">
        Complete verification to unlock all platform features. It&apos;s quick
        and secure.{" "}
        <button
          className={styles.link}
          onClick={() => void start()}
          type="button"
        >
          {state.name === "failed" ? "Try again" : "Start KYC"}
        </button>
      </Message>
      {state.name === "failed" && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}

function Message({
  icon,
  tone,
  children,
}: {
  icon: RIconName;
  tone: "warning" | "success" | "neutral";
  children: ReactNode;
}) {
  return (
    <div aria-live="polite" className={clsx(styles.message, styles[tone])}>
      <RIcon className={styles.messageIcon} name={icon} size="small" />
      <div className={styles.messageText}>{children}</div>
    </div>
  );
}
