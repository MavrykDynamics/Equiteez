import { Link } from "@remix-run/react";

import { ROUTES } from "~/consts/routes";
import { RButton } from "~/lib/atoms/RButton";
import { HashShortView } from "~/lib/atoms/HashShortView";
import IdentIcon from "~/lib/organisms/IdenIcon";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { useConnectWallet } from "~/templates/ConnectWalletModal/connectWalletModal.context";
import { CustomSuspense } from "~/templates/CustomSuspense";

import styles from "./ConnectWallet.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";

export const ConnectWallet = () => {
  const { changeUser, isLoading, signOut, userAddress } = useUserContext();
  const { identity } = useWalletContext();
  const openConnectWallet = useConnectWallet();
  const isEmailWallet = identity?.provider === "dynamic";

  // Opens the sign-in modal (or Mavryk Wallet directly without email wallets)
  const handleConnect = () => openConnectWallet();

  const handleChangeAccount = async () => {
    if (!isEmailWallet) {
      await changeUser();
      return;
    }

    // Email wallet: sign out of this account, keep the Dynamic session, and
    // let the user pick how to sign in again
    await signOut({ keepProviderSession: true });
    openConnectWallet();
  };

  return (
    <CustomSuspense loading={isLoading}>
      {userAddress ? (
        <RCustomDropdown className={styles.dropdown}>
          <RDropdownFaceContent className={styles.trigger}>
            <IdentIcon
              className={styles.identIcon}
              hash={userAddress}
              size={24}
              type="bottts"
            />
            <RText size="body-sm" className={styles.address}>
              <HashShortView hash={userAddress} />
            </RText>
          </RDropdownFaceContent>

          <RDropdownBodyContent align="right" className={styles.menu}>
            <Link className={styles.profileLink} to={ROUTES.portfolio}>
              Portfolio
            </Link>
            <RDropdownBodyContentItem
              onClick={() => void handleChangeAccount()}
            >
              Change account
            </RDropdownBodyContentItem>
            <RDropdownBodyContentItem onClick={() => void signOut()}>
              Sign out
            </RDropdownBodyContentItem>
          </RDropdownBodyContent>
        </RCustomDropdown>
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
