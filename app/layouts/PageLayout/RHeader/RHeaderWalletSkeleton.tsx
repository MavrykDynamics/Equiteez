import { RSkeleton } from "~/lib/atoms/RSkeleton";

import styles from "./RHeader.module.css";

// Signed-in wallet area while the stored session restores: Deposit button,
// the wallet pill (avatar, address, chevron) and the notifications bell.
export function RHeaderWalletSkeleton() {
  return (
    <div aria-busy="true" className={styles.wallet} role="status">
      <RSkeleton
        className={styles.depositSkeleton}
        radius="pill"
        variant="surface"
      />
      <RSkeleton
        className={styles.walletPillSkeleton}
        radius="pill"
        variant="surface"
      >
        <RSkeleton className={styles.avatarSkeleton} radius="pill" />
        <RSkeleton className={styles.addressSkeleton} radius="xs" />
        <RSkeleton className={styles.chevronSkeleton} radius="xs" />
      </RSkeleton>
      <span className={styles.bellSkeleton}>
        <RSkeleton height={24} radius="pill" width={24} />
      </span>
    </div>
  );
}
