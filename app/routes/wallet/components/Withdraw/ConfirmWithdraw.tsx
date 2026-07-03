import React from "react";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import { Button } from "~/lib/atoms/Button";
import styles from "~/routes/wallet/components/Withdraw/styles.module.css";

export function ConfirmWithdraw({
  withdrawAddress,
  fee,
  amount,
  tokenSymbol,
  confirm,
  network,
}: {
  withdrawAddress: string;
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
          Confirm Withdrawal
        </Text>
      </div>
      <div className="flex flex-col gap-[8px]">
        {withdrawAddress && (
          <div className="flex items-center justify-between">
            <Text size="smallBody" color="lightSand">
              Address
            </Text>
            <Text size="smallBody" weight="semibold">
              {withdrawAddress}
            </Text>
          </div>
        )}
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
          Confirm
        </Button>
      </div>
    </>
  );
}
