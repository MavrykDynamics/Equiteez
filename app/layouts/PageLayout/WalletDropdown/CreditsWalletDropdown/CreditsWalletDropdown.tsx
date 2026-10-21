import { useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  RCustomDropdown,
  RDropdownBodyContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";

import { AddCreditsModal } from "../AddCreditsModal/AddCreditsModal";
import { WalletAccountFace } from "../WalletAccountFace";
import { WalletMenuLinks } from "../WalletMenuLinks";
import { CreditsBalanceBadge } from "./CreditsBalanceBadge";
import { formatCredits, formatCreditsUsd } from "./credits.utils";
import { useCredits } from "./useCredits";
import styles from "./CreditsWalletDropdown.module.css";

type CreditsWalletDropdownProps = {
  userAddress: string;
};

export function CreditsWalletDropdown({
  userAddress,
}: CreditsWalletDropdownProps) {
  const {
    balance,
    freeCredits,
    pendingAmount,
    status,
    walletBalanceUsd,
    addCredits,
  } = useCredits();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);

  const openAddCredits = () => {
    setIsDropdownOpen(false);
    setIsAddCreditsOpen(true);
  };

  return (
    <>
      <RCustomDropdown
        className={styles.dropdown}
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
      >
        <CreditsBalanceBadge
          balance={balance}
          freeCredits={freeCredits}
          onAddCredits={openAddCredits}
          pendingAmount={pendingAmount}
          status={status}
        />
        <span aria-hidden className={styles.divider} />
        <WalletAccountFace
          className={styles.accountTrigger}
          userAddress={userAddress}
        />

        <RDropdownBodyContent align="right" className={styles.menu}>
          <div className={styles.balanceSection}>
            <RText color="neutral-700" size="body-s">
              Credits Balance
            </RText>
            <div className={styles.balanceValue}>
              <RText size="body-m" weight="medium">
                {formatCredits(balance)}
              </RText>
              <RText color="neutral-700" size="body-sm">
                {formatCreditsUsd(balance)}
              </RText>
            </div>
            <RButton
              className={styles.addCreditsButton}
              iconLeft={<RIcon name="plus" size="small" />}
              onClick={openAddCredits}
              size="small"
              tone="black"
            >
              Add Credits
            </RButton>
          </div>
          <WalletMenuLinks />
        </RDropdownBodyContent>
      </RCustomDropdown>

      <AddCreditsModal
        isOpen={isAddCreditsOpen}
        onAddCredits={addCredits}
        onClose={() => setIsAddCreditsOpen(false)}
        walletBalanceUsd={walletBalanceUsd}
      />
    </>
  );
}
