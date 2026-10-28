import { useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  RCustomDropdown,
  RDropdownBodyContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";

import { AddCreditsModal } from "../AddCreditsModal/AddCreditsModal";
import { useAddCredits } from "../AddCreditsModal/useAddCredits";
import { WalletAccountFace } from "../WalletAccountFace";
import { WalletMenuLinks } from "../WalletMenuLinks";
import { CreditsBalanceBadge } from "./CreditsBalanceBadge";
import { formatCredits, getCreditsCount } from "./credits.utils";
import { useCreditTokenWalletBalance, useCredits } from "./useCredits";
import styles from "./CreditsWalletDropdown.module.css";

type CreditsWalletDropdownProps = {
  userAddress: string;
};

export function CreditsWalletDropdown({
  userAddress,
}: CreditsWalletDropdownProps) {
  const { credits, config, status, progress, canTopUp } = useCredits();
  const walletBalance = useCreditTokenWalletBalance(config);
  const addCredits = useAddCredits();
  const creditsCount = credits?.enabled
    ? getCreditsCount(credits.balanceUnits, credits.decimals)
    : null;
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
          credits={credits}
          onAddCredits={canTopUp ? openAddCredits : undefined}
          progress={progress}
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
              Gas Credits Balance
            </RText>
            <div className={styles.balanceValue} role="status">
              {status === "ready" && credits?.enabled ? (
                <>
                  <RText size="body-m" weight="medium">
                    {creditsCount && formatCredits(creditsCount)}
                  </RText>
                  {credits.freeAllowanceRemaining > 0 && (
                    <RText color="neutral-700" size="body-s">
                      + {credits.freeAllowanceRemaining} Free Gas Credits
                    </RText>
                  )}
                </>
              ) : (
                <RText color="neutral-700" size="body-s">
                  {status === "free"
                    ? "Network gas paid by Equiteez. No relay service fee."
                    : status === "loading"
                      ? "Loading Gas Credits…"
                      : status === "error"
                        ? "Unable to read Gas Credits. Retry the current balance."
                        : "Connect and sign in to an eligible wallet to view Gas Credits."}
                </RText>
              )}
              {progress && (
                <RText color="neutral-700" size="body-s">
                  {progress === "pending"
                    ? "Adding Gas Credits. The balance above excludes the pending top-up."
                    : "Top-up confirmed; updating the balance."}
                </RText>
              )}
            </div>
            {canTopUp && (
              <RButton
                className={styles.addCreditsButton}
                iconLeft={<RIcon name="plus" size="small" />}
                onClick={openAddCredits}
                size="small"
                tone="black"
              >
                Add Gas Credits
              </RButton>
            )}
          </div>
          <WalletMenuLinks />
        </RDropdownBodyContent>
      </RCustomDropdown>

      <AddCreditsModal
        isOpen={isAddCreditsOpen && canTopUp}
        onAddCredits={addCredits}
        onClose={() => setIsAddCreditsOpen(false)}
        walletBalance={walletBalance}
      />
    </>
  );
}
