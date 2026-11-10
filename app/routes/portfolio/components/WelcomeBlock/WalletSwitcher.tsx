/**
 * Shows which wallet is signed in and switches to the other one: sign out of
 * the current wallet (keeping the email wallet's session) and sign in with
 * the chosen one. One wallet is active at a time; they are separate accounts.
 */
import clsx from "clsx";
import { useState } from "react";

import { RText } from "~/lib/atoms/RTypography/RText";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import {
  useWalletContext,
  type WalletProviderKind,
} from "~/providers/WalletProvider/wallet.provider";
import { useConnectWallet } from "~/templates/ConnectWalletModal/connectWalletModal.context";

import styles from "./WalletSwitcher.module.css";

const OPTIONS: { provider: WalletProviderKind; label: string }[] = [
  { provider: "mavryk_extension", label: "Mavryk Wallet" },
  { provider: "dynamic", label: "Email" },
];

export function WalletSwitcher() {
  const { identity, dynamic } = useWalletContext();
  const { connect, signOut } = useUserContext();
  const openConnectWallet = useConnectWallet();
  const [isSwitching, setIsSwitching] = useState(false);

  // Only when email wallets are offered and a wallet is signed in
  if (!dynamic || !identity) return null;

  const switchTo = async (provider: WalletProviderKind) => {
    if (provider === identity.provider || isSwitching) return;

    setIsSwitching(true);

    try {
      await signOut({ keepProviderSession: true });

      if (provider === "dynamic") openConnectWallet({ method: "email" });
      else connect();
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className={styles.switcher}>
      <RText color="neutral-700" size="body-s">
        Wallet
      </RText>
      <div aria-label="Wallet" className={styles.options} role="group">
        {OPTIONS.map(({ provider, label }) => {
          const isActive = provider === identity.provider;

          return (
            <button
              aria-pressed={isActive}
              className={clsx(styles.option, isActive && styles.active)}
              disabled={isSwitching}
              key={provider}
              onClick={() => void switchTo(provider)}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
