import { useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";

import { WithdrawFundsModal } from "./WithdrawFundsModal";
import styles from "./WithdrawFunds.module.css";

export function WithdrawFunds() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  return (
    <>
      <RButton
        className={styles.withdrawButton}
        iconLeft={<RIcon aria-hidden="true" name="arrow-long-up" />}
        onClick={() => setIsWithdrawModalOpen(true)}
        size="medium"
        tone="black"
        type="button"
        variant="secondary"
      >
        Withdraw
      </RButton>
      <WithdrawFundsModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </>
  );
}
