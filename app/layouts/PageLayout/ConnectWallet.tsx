import { RButton } from "~/lib/atoms/RButton";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { RIcon } from "~/lib/atoms/RIcon";
import {
  useConnectWallet,
  useIsSigningIn,
} from "~/templates/ConnectWalletModal/connectWalletModal.context";
import { CustomSuspense } from "~/templates/CustomSuspense";

import styles from "./ConnectWallet.module.css";
import { DynamicWalletMenu } from "./WalletMenu/DynamicWalletMenu/DynamicWalletMenu";
import { MavrykWalletMenu } from "./WalletMenu/MavrykWalletMenu";
import { RText } from "~/lib/atoms/RTypography/RText";

export const ConnectWallet = () => {
  const { isLoading, userAddress } = useUserContext();
  const { identity } = useWalletContext();
  const openConnectWallet = useConnectWallet();
  const isSigningIn = useIsSigningIn();
  const isEmailWallet = identity?.provider === "dynamic";

  // Opens the sign-in modal (or Mavryk Wallet directly without email wallets)
  const handleConnect = () => openConnectWallet();

  return (
    <CustomSuspense loading={isLoading}>
      {userAddress ? (
        isEmailWallet ? (
          <DynamicWalletMenu address={userAddress} />
        ) : (
          <MavrykWalletMenu address={userAddress} />
        )
      ) : (
        <RButton
          onClick={handleConnect}
          className={styles.connectWalletBtn}
          size="medium"
          tone="black"
          variant={isSigningIn ? "secondary" : "primary"}
        >
          {/* Both labels share one grid cell, so the pill keeps the width of
              the wider one and does not jump between the two states */}
          <span className={styles.signInLabels}>
            <span
              aria-hidden={isSigningIn}
              className={styles.signInLabel}
              data-hidden={isSigningIn || undefined}
            >
              <RText color="neutral-white" size="body-s" weight="medium">
                Sign In
              </RText>
            </span>
            <span
              aria-hidden={!isSigningIn}
              className={styles.signInLabel}
              data-hidden={!isSigningIn || undefined}
            >
              <RIcon aria-hidden name="dots" size="small" />
              <RText color="neutral-black" size="body-s" weight="medium">
                Signing in
              </RText>
            </span>
          </span>
        </RButton>
      )}
    </CustomSuspense>
  );
};
