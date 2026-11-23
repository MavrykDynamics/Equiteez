import type { ReactNode } from "react";
import clsx from "clsx";

import { CopyButton } from "~/lib/atoms/CopyButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";

import styles from "./DepositParts.module.css";

/** `0x1234…abcd`; short values are returned unchanged. */
export const shortenHash = (hash: string, first = 6, last = 4) =>
  hash.length > first + last + 1
    ? `${hash.slice(0, first)}…${hash.slice(-last)}`
    : hash;

type DepositModalHeaderProps = {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  isBackDisabled?: boolean;
};

/** Back (optional) · centered title · close, as in every deposit screen. */
export function DepositModalHeader({
  title,
  onClose,
  onBack,
  isBackDisabled = false,
}: DepositModalHeaderProps) {
  return (
    <div className={styles.header}>
      {onBack ? (
        <button
          aria-label="Back"
          className={styles.headerButton}
          disabled={isBackDisabled}
          onClick={onBack}
          type="button"
        >
          <RIcon name="arrow-long-left" size="medium" />
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
      <RHeading as="h2" className={styles.headerTitle} size="h6">
        {title}
      </RHeading>
      <button
        aria-label="Close deposit funds"
        className={styles.headerButton}
        onClick={onClose}
        type="button"
      >
        <RIcon name="close" size="medium" />
      </button>
    </div>
  );
}

/** Gradient avatar standing in for the Equiteez (Mavryk) account. */
export function AccountAvatar({
  size = "large",
}: {
  size?: "large" | "xlarge";
}) {
  return (
    <span aria-hidden="true" className={styles.avatar} data-size={size} />
  );
}

/** Green dot + "Connected". */
export function ConnectedStatus() {
  return (
    <span className={styles.connected}>
      <span aria-hidden="true" className={styles.connectedDot} />
      Connected
    </span>
  );
}

/** Copyable full address shown shortened. */
export function CopyableAddress({
  address,
  label,
  className,
}: {
  address: string;
  label: string;
  className?: string;
}) {
  return (
    <span className={clsx(styles.copyable, className)}>
      <span>{shortenHash(address)}</span>
      <CopyButton
        aria-label={`Copy ${label} ${address}`}
        className={styles.copyButton}
        text={address}
        type="block"
      >
        <RIcon name="copy" size="small" />
      </CopyButton>
    </span>
  );
}

type TransferSummaryProps = {
  amount: string;
  amountCaption: ReactNode;
  tokenIcon: ReactNode;
  recipient: string;
  recipientCaption: ReactNode;
};

/** "25.00 USDC ↓ mv1…" hero used by review and status screens. */
export function TransferSummary({
  amount,
  amountCaption,
  tokenIcon,
  recipient,
  recipientCaption,
}: TransferSummaryProps) {
  return (
    <div className={styles.transfer}>
      <div className={styles.transferRow}>
        {tokenIcon}
        <div className={styles.transferCopy}>
          <span className={styles.transferTitle}>{amount}</span>
          <span className={styles.transferCaption}>{amountCaption}</span>
        </div>
      </div>
      <RIcon
        aria-hidden="true"
        className={styles.transferArrow}
        name="arrow-long-down"
        size="small"
      />
      <div className={styles.transferRow}>
        <AccountAvatar size="xlarge" />
        <div className={styles.transferCopy}>
          <CopyableAddress
            address={recipient}
            className={styles.transferTitle}
            label="recipient address"
          />
          <span className={styles.transferCaption}>{recipientCaption}</span>
        </div>
      </div>
    </div>
  );
}

/** Label/value row inside a `<dl>`. */
export function DetailRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.detailRow}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Value with a small trailing token/network icon, as in the summary rows. */
export function ValueWithIcon({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span className={styles.valueWithIcon}>
      {children}
      {icon}
    </span>
  );
}

/** Three animated dots: the design's in-progress indicator. */
export function DotsLoader({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={clsx(styles.dots, className)}>
      <span />
      <span />
      <span />
    </span>
  );
}
