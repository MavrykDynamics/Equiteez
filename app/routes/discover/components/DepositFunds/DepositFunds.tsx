import styles from "./styles.module.css";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RIcon } from "~/lib/atoms/RIcon";

export function DepositFunds() {
  return (
    <div className={styles.wrapper}>
      <RButton className={styles.depositButton} variant="secondary">
        <RText size="body-sm" weight="medium">
          Deposit Funds
        </RText>
        <RText size="body-s">
          <RIcon name="arrow-long-up-right" />
        </RText>
      </RButton>
    </div>
  );
}
