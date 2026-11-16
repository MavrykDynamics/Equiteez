/** Mavryk Wallet (extension): Portfolio, Change account and Sign out. */
import { Link } from "@remix-run/react";

import { ROUTES } from "~/consts/routes";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import styles from "../ConnectWallet.module.css";
import { WalletFace } from "./WalletFace";

export function MavrykWalletMenu({ address }: { address: string }) {
  const { changeUser, signOut } = useUserContext();

  return (
    <RCustomDropdown className={styles.dropdown}>
      <RDropdownFaceContent className={styles.trigger}>
        <WalletFace address={address} />
      </RDropdownFaceContent>

      <RDropdownBodyContent align="right" className={styles.menu}>
        <Link className={styles.profileLink} to={ROUTES.portfolio}>
          Portfolio
        </Link>
        <RDropdownBodyContentItem onClick={() => void changeUser()}>
          Change account
        </RDropdownBodyContentItem>
        <RDropdownBodyContentItem onClick={() => void signOut()}>
          Sign out
        </RDropdownBodyContentItem>
      </RDropdownBodyContent>
    </RCustomDropdown>
  );
}
