import React, { useCallback } from "react";
import { Text } from "~/lib/atoms/Typography/Text";
import { InputText } from "~/lib/molecules/Input/Input";
import { AssetView } from "~/routes/wallet/components/Withdraw/SelectCoin";
import Money from "~/lib/atoms/Money";

export function EnterTokenAmount({
  setAmount,
  amount,
  tokenAddress,
  availableValue,
  availableSymbol,
  feeText,
  feeValue,
  error,
  availableText,
}: {
  availableValue: number;
  availableSymbol: string;
  availableText: string;
  feeText: string;
  feeValue: number;
  error: boolean;
  tokenAddress: string;
  amount: string;
  setAmount: (value: string) => void;
}) {
  const onChangeAmount = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();

      if (/^\d*\.?\d*$/.test(value) || value === "") {
        setAmount(value);
      }
    },
    [setAmount]
  );

  const errorText = error
    ? `Amount should be in range 0.1 - ${availableValue}`
    : "";

  return (
    <div className="flex w-full flex-col gap-[8px]">
      <Text size="smallBody">Amount</Text>
      <div className="relative flex flex-col gap-[8px]">
        <InputText
          className="h-[45px] pr-[100px]"
          placeholder={tokenAddress ? "Minimum 0.1" : "Enter Amount"}
          value={amount}
          errorCaption={errorText}
          onChange={onChangeAmount}
        />
        {tokenAddress && (
          <>
            <div className="absolute right-[16px] top-[10px]">
              <AssetView tokenAddress={tokenAddress} />
            </div>
            <div
              style={{ marginTop: error ? "20px" : "0" }}
              className="flex items-center justify-between"
            >
              <Text size="smallBody" color="lightSand">
                {availableText}
              </Text>
              <Text size="smallBody" weight="semibold">
                <Money fiat>{availableValue}</Money> {availableSymbol}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text size="smallBody" color="lightSand">
                {feeText}
              </Text>
              <Text size="smallBody" weight="semibold">
                <Money fiat>{feeValue}</Money> MVRK
              </Text>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
