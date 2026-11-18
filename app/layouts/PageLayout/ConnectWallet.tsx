import { RButton } from "~/lib/atoms/RButton";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { useConnectWallet } from "~/templates/ConnectWalletModal/connectWalletModal.context";
import { CustomSuspense } from "~/templates/CustomSuspense";

import styles from "./ConnectWallet.module.css";
import { DynamicWalletMenu } from "./WalletMenu/DynamicWalletMenu/DynamicWalletMenu";
import { MavrykWalletMenu } from "./WalletMenu/MavrykWalletMenu";
import { RText } from "~/lib/atoms/RTypography/RText";

export const ConnectWallet = () => {
  const { isLoading, userAddress } = useUserContext();
  const { identity } = useWalletContext();
  const openConnectWallet = useConnectWallet();
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
          variant="primary"
        >
          <RText color="neutral-white" size="body-s" weight="medium">
            Connect Wallet
          </RText>
        </RButton>
      )}
    </CustomSuspense>
  );
};
