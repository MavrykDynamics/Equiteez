import React from "react";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import { Button } from "~/lib/atoms/Button";
import styles from "./styles.module.css";

export function ConfirmDeposit({
  fee,
  amount,
  tokenSymbol,
  confirm,
  network,
}: {
  amount: number;
  network: string;
  tokenSymbol: string;
  fee: number;
  confirm: () => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-[8px]">
        <Text size="largeBody" weight="semibold">
          Confirm Deposit
        </Text>
      </div>
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center justify-between">
          <Text size="smallBody" color="lightSand">
            Network
          </Text>
          <Text size="smallBody" weight="semibold">
            {network}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text size="smallBody" color="lightSand">
            Amount
          </Text>
          <Text size="smallBody" weight="semibold">
            <Money fiat>{amount}</Money> {tokenSymbol}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text size="smallBody" color="lightSand">
            Fees
          </Text>
          <Text size="smallBody" weight="semibold">
            <Money fiat>{fee}</Money> MVRK
          </Text>
        </div>
        <Button className={styles.confirmBtn} onClick={confirm}>
          Deposit
        </Button>
      </div>
    </>
  );
}
