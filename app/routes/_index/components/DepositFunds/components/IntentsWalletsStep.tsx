import type { ReactNode } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { REthereumWalletDropdown } from "~/lib/organisms/REthereumWalletDropdown";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";

import {
  AccountAvatar,
  ConnectedStatus,
  shortenHash,
  WalletGlyph,
} from "./DepositParts";
import styles from "./IntentsView.module.css";

type IntentsWalletsStepProps = {
  ethereumWallet: EthereumContext;
  /** Connector name of the external wallet, e.g. "MetaMask". */
  walletName: string | undefined;
  recipient: string | null;
  isMavrykBusy: boolean;
  onConnectMavryk: () => Promise<void> | void;
  onContinue: () => void;
};

function WalletCard({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.walletCard}>
      {icon}
      <div className={styles.walletCopy}>
        <span className={styles.walletTitle}>{title}</span>
        <span className={styles.walletSubtitle}>{subtitle}</span>
      </div>
      {action}
    </div>
  );
}

const walletIcon = (
  <span aria-hidden="true" className={styles.walletIcon}>
    <WalletGlyph />
  </span>
);

/**
 * Step 1: the Equiteez account (required) and, optionally, an EVM wallet to
 * send from in one click. Any other wallet or exchange can pay the deposit
 * address instead.
 */
export function IntentsWalletsStep({
  ethereumWallet,
  walletName,
  recipient,
  isMavrykBusy,
  onConnectMavryk,
  onContinue,
}: IntentsWalletsStepProps) {
  const { userAddress, isConnecting, isReconnecting, signOut } = ethereumWallet;
  const isWalletBusy = isConnecting || isReconnecting;
  const isReady = Boolean(recipient);
  const hint = !recipient
    ? "Connect your Equiteez wallet to receive the deposit."
    : userAddress
      ? "Ready. Next, choose what to send."
      : "Optional: connect an EVM wallet to send in one click. You can also pay from any wallet or exchange (Solana, Bitcoin, NEAR, Aptos and EVM networks).";

  return (
    <div className={styles.step}>
      <section aria-label="Send from" className={styles.walletSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Send from</span>
          <span className={styles.sectionHint}>Optional · EVM wallet</span>
        </div>
        {userAddress ? (
          <WalletCard
            action={
              <RButton
                disabled={isWalletBusy}
                onClick={signOut}
                size="medium"
                tone="black"
                variant="secondary"
              >
                Disconnect
              </RButton>
            }
            icon={walletIcon}
            subtitle={
              <>
                {walletName ?? "External wallet"} · <ConnectedStatus />
              </>
            }
            title={shortenHash(userAddress)}
          />
        ) : (
          <WalletCard
            action={
              <REthereumWalletDropdown
                className={styles.connectDropdown}
                triggerClassName={styles.connectTrigger}
              />
            }
            icon={walletIcon}
            subtitle="Or pay from any wallet later"
            title={isWalletBusy ? "Connecting…" : "Not connected"}
          />
        )}
      </section>

      <section aria-label="Receive to" className={styles.walletSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Receive to</span>
          <span className={styles.sectionHint}>Your account</span>
        </div>
        {recipient ? (
          <WalletCard
            icon={<AccountAvatar />}
            subtitle={
              <>
                Equiteez wallet · Mavryk · <ConnectedStatus />
              </>
            }
            title={shortenHash(recipient)}
          />
        ) : (
          <WalletCard
            action={
              <RButton
                isLoading={isMavrykBusy}
                onClick={onConnectMavryk}
                size="medium"
                tone="black"
              >
                Connect
              </RButton>
            }
            icon={walletIcon}
            subtitle="Equiteez wallet · Mavryk"
            title="Not connected"
          />
        )}
      </section>

      <p className={styles.hint}>{hint}</p>

      <RButton
        className={styles.primaryAction}
        disabled={!isReady}
        onClick={onContinue}
        size="large"
        tone="black"
      >
        Continue
      </RButton>
    </div>
  );
}
