import clsx from "clsx";

import { HashShortView } from "~/lib/atoms/HashShortView";
import { RText } from "~/lib/atoms/RTypography/RText";
import IdentIcon from "~/lib/organisms/IdenIcon";
import { RDropdownFaceContent } from "~/lib/organisms/RCustomDropdown/RCustomDropdown";

import styles from "./WalletDropdown.module.css";

type WalletAccountFaceProps = {
  className?: string;
  userAddress: string;
};

export function WalletAccountFace({
  className,
  userAddress,
}: WalletAccountFaceProps) {
  return (
    <RDropdownFaceContent className={clsx(styles.trigger, className)}>
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
  );
}
