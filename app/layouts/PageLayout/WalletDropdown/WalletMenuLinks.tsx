import { Link } from "@remix-run/react";

import { ROUTES } from "~/consts/routes";
import { RDropdownBodyContentItem } from "~/lib/organisms/RCustomDropdown/RCustomDropdown";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import styles from "./WalletDropdown.module.css";

export function WalletMenuLinks() {
  const { changeUser, signOut } = useUserContext();

  return (
    <>
      <Link className={styles.profileLink} to={ROUTES.portfolio}>
        Portfolio
      </Link>
      <RDropdownBodyContentItem onClick={changeUser}>
        Change Account
      </RDropdownBodyContentItem>
      <RDropdownBodyContentItem onClick={signOut}>
        Sign Out
      </RDropdownBodyContentItem>
    </>
  );
}
