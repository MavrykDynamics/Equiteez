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
import { CustomSuspense } from "~/templates/CustomSuspense";

import styles from "./ConnectWallet.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";

export const ConnectWallet = () => {
  const { changeUser, connect, isLoading, signOut, userAddress } =
    useUserContext();

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
            <Link className={styles.profileLink} to={ROUTES.wallet}>
              Profile dashboard
            </Link>
            <RDropdownBodyContentItem onClick={changeUser}>
              Change account
            </RDropdownBodyContentItem>
            <RDropdownBodyContentItem onClick={signOut}>
              Sign out
            </RDropdownBodyContentItem>
          </RDropdownBodyContent>
        </RCustomDropdown>
      ) : (
        <RButton
          onClick={connect}
          className={styles.connectWalletBtn}
          size="medium"
          tone="black"
          variant="secondary"
        >
          <RText size="body-s" weight="medium">
            Connect Wallet
          </RText>
        </RButton>
      )}
    </CustomSuspense>
  );
};
