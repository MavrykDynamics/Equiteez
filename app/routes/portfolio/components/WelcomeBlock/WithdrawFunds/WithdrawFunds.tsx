import { useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";

import { WithdrawFundsModal } from "./WithdrawFundsModal";
import styles from "./WithdrawFunds.module.css";

export function WithdrawFunds() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  return (
    <>
      {/* Always opens: when the wallet may not withdraw, the modal's submit
          button is disabled and says why */}
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
