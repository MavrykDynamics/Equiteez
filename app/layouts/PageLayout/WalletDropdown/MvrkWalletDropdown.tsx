import {
  RCustomDropdown,
  RDropdownBodyContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";

import { WalletAccountFace } from "./WalletAccountFace";
import { WalletMenuLinks } from "./WalletMenuLinks";
import styles from "./WalletDropdown.module.css";

type MvrkWalletDropdownProps = {
  userAddress: string;
};

export function MvrkWalletDropdown({ userAddress }: MvrkWalletDropdownProps) {
  return (
    <RCustomDropdown className={styles.dropdown}>
      <WalletAccountFace userAddress={userAddress} />

      <RDropdownBodyContent align="right" className={styles.menu}>
        <WalletMenuLinks />
      </RDropdownBodyContent>
    </RCustomDropdown>
  );
}
