import { useState } from "react";

import styles from "./styles.module.css";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RIcon } from "~/lib/atoms/RIcon";
import { RDepositFundsModal } from "./RDepositFundsModal";

export function DepositFunds() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <RButton
        className={styles.depositButton}
        onClick={() => setIsDepositModalOpen(true)}
        variant="secondary"
      >
        <RText size="body-sm" weight="medium">
          Deposit Funds
        </RText>
        <RText size="body-s">
          <RIcon name="arrow-long-up-right" />
        </RText>
      </RButton>
      <RDepositFundsModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
}
