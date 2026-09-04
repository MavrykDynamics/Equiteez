import { useState } from "react";

import styles from "./styles.module.css";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RDepositFundsModal } from "./RDepositFundsModal";

export function DepositFunds() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <RButton
        className={styles.depositButton}
        iconLeft={<RIcon aria-hidden="true" name="arrow-long-down" />}
        onClick={() => setIsDepositModalOpen(true)}
        size="medium"
        tone="black"
      >
        Deposit
      </RButton>
      <RDepositFundsModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
}
