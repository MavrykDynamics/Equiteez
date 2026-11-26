import { useEffect } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RSelectField } from "~/lib/molecules/RSelectField";
import type { IntentNetwork } from "~/lib/intents/intentNetworks";
import { useIntentWalletsContext } from "~/providers/IntentWalletsProvider/IntentWalletsProvider";

import { ConnectedStatus, shortenHash, WalletGlyph } from "./DepositParts";
import styles from "./IntentsView.module.css";

type IntentsSourceWalletFieldProps = {
  network: IntentNetwork;
  disabled?: boolean;
  onChooseWallet: () => void;
};

/**
 * "Send from" for Solana, NEAR, Aptos and Bitcoin: the network's own wallet,
 * optional (the deposit address can be paid from any wallet or exchange).
 * The EVM wallet is connected in the wallets step instead.
 */
export function IntentsSourceWalletField({
  network,
  disabled = false,
  onChooseWallet,
}: IntentsSourceWalletFieldProps) {
  const wallets = useIntentWalletsContext();
  const { family } = network;
  const isSupported = family !== "evm" && wallets.isSupported(family);
  const account = isSupported ? wallets.accounts[family] : undefined;
  const load = wallets.load;
  useEffect(() => {
    // Detect installed wallets as soon as the network is chosen.
    if (isSupported) load(family);
  }, [family, isSupported, load]);
  if (!isSupported) return null;

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>Send from</span>
      {account ? (
        <div className={styles.walletCard}>
          <span aria-hidden="true" className={styles.walletIcon}>
            <WalletGlyph />
          </span>
          <div className={styles.walletCopy}>
            <span className={styles.walletTitle}>
              {shortenHash(account.address)}
            </span>
            <span className={styles.walletSubtitle}>
              {account.walletName} · <ConnectedStatus />
            </span>
          </div>
          <RButton
            disabled={disabled}
            onClick={() => void wallets.disconnect(family)}
            size="medium"
            tone="black"
            variant="secondary"
          >
            Disconnect
          </RButton>
        </div>
      ) : (
        <RSelectField
          aria-label={`Connect a ${network.name} wallet`}
          disabled={disabled}
          icon={
            <span aria-hidden="true" className={styles.walletIcon}>
              <WalletGlyph />
            </span>
          }
          isPlaceholder
          onClick={onChooseWallet}
          subtitle="Optional · or pay from any wallet or exchange"
          title={`Connect a ${network.name} wallet`}
        />
      )}
    </div>
  );
}
