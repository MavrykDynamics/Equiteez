import React from "react";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";
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
        <Heading level="4">Confirm Withdrawal</Heading>
      </div>
      <div className="flex flex-col gap-[8px]">
        {withdrawAddress && (
          <div className="flex items-center justify-between">
            <Text size="smallBody" weight="bold" color="lightBlue">
              Address
            </Text>
            <Text size="smallBody" weight="bold">
              {withdrawAddress}
            </Text>
          </div>
        )}
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
          Confirm
        </ButtonV2>
      </div>
    </>
  );
}
