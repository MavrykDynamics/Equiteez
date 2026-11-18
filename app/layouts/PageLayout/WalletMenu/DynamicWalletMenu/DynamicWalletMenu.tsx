/** Email wallet (Dynamic): the same button, opening the wallet panel. */
import { useState } from "react";

import {
  RCustomDropdown,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import styles from "../../ConnectWallet.module.css";
import { WalletFace } from "../WalletFace";
import { DynamicWalletPanel } from "./DynamicWalletPanel";

export function DynamicWalletMenu({ address }: { address: string }) {
  const { signOut } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    // Outside clicks and Escape close it, as for any RCustomDropdown
    <RCustomDropdown
      className={styles.dropdown}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <RDropdownFaceContent className={styles.trigger}>
        <WalletFace address={address} />
      </RDropdownFaceContent>

      {isOpen ? (
        <DynamicWalletPanel
          address={address}
          onClose={close}
          onSignOut={() => {
            close();
            void signOut();
          }}
        />
      ) : null}
    </RCustomDropdown>
  );
}
