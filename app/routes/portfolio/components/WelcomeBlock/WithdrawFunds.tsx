import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";

import styles from "./WithdrawFunds.module.css";

export function WithdrawFunds() {
  return (
    <RButton
      className={styles.withdrawButton}
      iconLeft={<RIcon aria-hidden="true" name="arrow-long-up" />}
      size="medium"
      tone="black"
      type="button"
      variant="secondary"
    >
      Withdraw
    </RButton>
  );
}
