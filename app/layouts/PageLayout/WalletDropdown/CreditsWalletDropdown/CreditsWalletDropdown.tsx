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
import { formatCreditTokenUnits, getCreditTokenLabel } from "./credits.utils";
import { useCredits } from "./useCredits";
import styles from "./CreditsWalletDropdown.module.css";

type CreditsWalletDropdownProps = {
  userAddress: string;
};

export function CreditsWalletDropdown({
  userAddress,
}: CreditsWalletDropdownProps) {
  const { credits, config, status, progress, canTopUp, refresh, isRefreshing } =
    useCredits();
  const balance = credits?.enabled
    ? formatCreditTokenUnits(credits.balanceUnits, credits.decimals)
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
        <CreditsBalanceBadge status={status} progress={progress} />
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
            <div className={styles.balanceValue} role="status">
              <RText size="body-sm">
                {status === "free"
                  ? "Network gas paid by Equiteez. No relay service fee."
                  : status === "loading"
                    ? "Loading Credits…"
                    : status === "error"
                      ? "Unable to read Credits. Retry the current balance."
                      : status === "unknown"
                        ? "Connect and sign in to an eligible wallet to view Credits."
                        : `${balance} prepaid quote tokens`}
              </RText>
              {status === "ready" && credits?.enabled && (
                <>
                  <RText color="neutral-700" size="body-sm">
                    {config && getCreditTokenLabel(config.config)}
                  </RText>
                  <RText size="body-sm">
                    Free allowance reported: {credits.freeAllowanceRemaining}.
                    Applicability by action is unconfirmed.
                  </RText>
                  {Object.entries(credits.actionsRemaining).map(
                    ([variant, count]) => (
                      <RText key={variant} size="body-sm">
                        {variant}: {count} actions reported
                      </RText>
                    )
                  )}
                  <RText color="neutral-700" size="body-sm">
                    Action counts are shown separately. Credit conversion and
                    USD value are unavailable.
                  </RText>
                </>
              )}
              {progress && (
                <RText size="body-sm">
                  {progress === "pending"
                    ? "Top-up pending. The balance above excludes any local increase."
                    : "Top-up confirmed; updating Credits. The API does not yet prove that this top-up is included in the displayed balance."}{" "}
                  See Relay activity for details.
                </RText>
              )}
              {isRefreshing && status === "ready" && (
                <RText size="body-sm">Refreshing balance…</RText>
              )}
            </div>
            {status !== "free" && (
              <RButton size="small" variant="secondary" onClick={refresh}>
                Refresh Credits
              </RButton>
            )}
            {canTopUp && (
              <RButton
                className={styles.addCreditsButton}
                iconLeft={<RIcon name="plus" size="small" />}
                onClick={openAddCredits}
                size="small"
                tone="black"
              >
                Add Credits
              </RButton>
            )}
          </div>
          <WalletMenuLinks />
        </RDropdownBodyContent>
      </RCustomDropdown>

      <AddCreditsModal
        isOpen={isAddCreditsOpen && canTopUp}
        onClose={() => setIsAddCreditsOpen(false)}
      />
    </>
  );
}
