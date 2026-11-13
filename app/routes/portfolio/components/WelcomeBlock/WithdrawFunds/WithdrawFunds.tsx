import { useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { useActionAvailability } from "~/providers/WalletProvider/useActionAvailability";

import { WithdrawFundsModal } from "./WithdrawFundsModal";
import styles from "./WithdrawFunds.module.css";

export function WithdrawFunds() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const availability = useActionAvailability("withdraw");

  return (
    <>
      {/* Disabled buttons show no tooltip in every browser: the wrapper does */}
      <span title={availability.isAllowed ? undefined : availability.reason}>
        <RButton
          className={styles.withdrawButton}
          disabled={!availability.isAllowed}
          iconLeft={<RIcon aria-hidden="true" name="arrow-long-up" />}
          onClick={() => setIsWithdrawModalOpen(true)}
          size="medium"
          tone="black"
          type="button"
          variant="secondary"
        >
          Withdraw
        </RButton>
      </span>
      <WithdrawFundsModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </>
  );
}
