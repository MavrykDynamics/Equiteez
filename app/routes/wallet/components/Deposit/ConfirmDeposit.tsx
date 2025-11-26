import React from "react";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";
import styles from './styles.module.css';

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
        <Heading level="4">Confirm Deposit</Heading>
      </div>
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center justify-between">
          <Text size="smallBody" weight="bold" color="lightBlue">
            Network
          </Text>
          <Text size="smallBody" weight="bold">
            {network}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text size="smallBody" weight="bold" color="lightBlue">
            Amount
          </Text>
          <Text size="smallBody" weight="bold">
            <Money fiat>{amount}</Money> {tokenSymbol}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text size="smallBody" weight="bold" color="lightBlue">
            Fees
          </Text>
          <Text size="smallBody" weight="bold">
            <Money fiat>{fee}</Money> MVRK
          </Text>
        </div>
        <ButtonV2
          className={styles.confirmBtn}
          onClick={confirm}
          variant="yellowPrimary"
        >
          Deposit
        </ButtonV2>
      </div>
    </>
  );
}
