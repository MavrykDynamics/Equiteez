/** The header wallet button's content, the same for every wallet. */
import { HashShortView } from "~/lib/atoms/HashShortView";
import { RText } from "~/lib/atoms/RTypography/RText";
import IdentIcon from "~/lib/organisms/IdenIcon";

import styles from "../ConnectWallet.module.css";

export function WalletFace({ address }: { address: string }) {
  return (
    <>
      <IdentIcon
        className={styles.identIcon}
        hash={address}
        size={24}
        type="bottts"
      />
      <RText size="body-sm" className={styles.address}>
        <HashShortView hash={address} />
      </RText>
    </>
  );
}
