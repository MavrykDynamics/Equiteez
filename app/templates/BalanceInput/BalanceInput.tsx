import BigNumber from "bignumber.js";
import { isDefined } from "app/lib/utils";
import React, { FC, forwardRef, useCallback, useState } from "react";
import { AssetField } from "~/lib/organisms/AssetField";
import clsx from "clsx";
import { toLocalFormat } from "~/lib/formaters/formaters";
import { AssetDropdown } from "../AssetDropdown";
import { AssetMetadataBase } from "~/lib/metadata";
import { CryptoBalance } from "../Balance";
import { Icon } from "~/lib/atoms/Icon";
import { AssetView } from "~/templates/BalanceInput/AssetView";

type BalanceInputProps = {
  label?: React.ReactNode;
  onChange?: (value?: BigNumber) => void;
  amount: BigNumber | undefined;
  amountInputDisabled: boolean;
  selectedAssetSlug: string;
  children?: React.ReactNode;
  additionalTopRightBlock?: React.ReactNode;
  additionalBottomRightBlock?: React.ReactNode;
  additionalBottomLeftBlock?: React.ReactNode;
  errorCaption?: string;
  selectedAssetMetadata: AssetMetadataBase;
  onNext?: () => void;
  onPrev?: () => void;
};

export const BalanceInput = forwardRef<HTMLInputElement, BalanceInputProps>(
  (
    {
      label,
      onChange,
      amount,
      amountInputDisabled,
      additionalTopRightBlock,
      additionalBottomLeftBlock,
      additionalBottomRightBlock,
      errorCaption,
      selectedAssetSlug,
      selectedAssetMetadata,
      onNext,
      onPrev,
    },
    inputRef
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleAmountChange = (newAmount?: string) =>
      onChange?.(
        Boolean(newAmount) && isDefined(newAmount)
          ? new BigNumber(newAmount)
          : undefined
      );

    const onFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const onBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        onNext?.();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        onPrev?.();
      }

      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        onNext?.();
      }

      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        onPrev?.();
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <section
          className={clsx(
            "transition duration-250 linear",
            "p-4 bg-gray-50 flex flex-col gap-1 rounded-2xl border",

            isFocused && !errorCaption && "border-dark-green-100",
            errorCaption && "border-red-500",
            !errorCaption &&
              !isFocused &&
              "border-transparent hover:border-dark-green-50"
          )}
        >
          <div className="flex justify-between items-center">
            <div className="text-left text-xs text-sand-600 leading-[18px]">
              {label}
            </div>
            {additionalTopRightBlock}
          </div>
          <div className="flex justify-between overflow-y-hidden">
            <AssetView selectedAssetSlug={selectedAssetSlug} />
            <AssetField
              ref={inputRef}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={handleKeyDown}
              value={amount
                ?.toFixed(selectedAssetMetadata?.decimals ?? 6)
                .toString()}
              className={clsx(
                "text-asset-input text-right text-sand-900 border-none bg-opacity-0 pl-0 focus:shadow-none overflow-y-hidden"
              )}
              containerClassName="overflow-y-hidden"
              style={{ padding: 0, borderRadius: 0, height: 32 }}
              placeholder={toLocalFormat(0, { decimalPlaces: 2 })}
              min={0}
              max={9999999999999}
              disabled={amountInputDisabled}
              assetDecimals={selectedAssetMetadata?.decimals ?? 6}
              onChange={handleAmountChange}
            />
          </div>
          <div className="flex justify-between items-center">
            <div>{additionalBottomLeftBlock}</div>

            <div>{additionalBottomRightBlock}</div>
          </div>
        </section>
        {errorCaption && (
          <div className="text-red-500 text-body-xs">{errorCaption}</div>
        )}
      </div>
    );
  }
);

BalanceInput.displayName = "BalanceInput";

// ---------------------------------------------------

type BalanceTotalBlockProps = {
  balanceTotal: BigNumber | undefined;
  decimals: number | undefined;
};
const BalanceTotalBlock: FC<BalanceTotalBlockProps> = ({
  balanceTotal,
  decimals,
}) => {
  return (
    <>
      {" "}
      {!balanceTotal || balanceTotal?.isZero() ? (
        <div className="flex items-center">
          <span>$</span>
          0.00
        </div>
      ) : (
        <div className="flex items-center">
          <span>$</span>
          <CryptoBalance value={balanceTotal} cryptoDecimals={decimals} />
        </div>
      )}
    </>
  );
};

export const BalanceInputWithTotal = forwardRef<
  HTMLInputElement,
  BalanceInputProps &
    BalanceTotalBlockProps & {
      cryptoValue: number | BigNumber;
      cryptoDecimals: number;
    }
>((props, inputRef) => {
  const {
    balanceTotal,
    decimals,
    selectedAssetMetadata,
    cryptoValue,
    cryptoDecimals,
    additionalBottomLeftBlock,
    additionalTopRightBlock,
    additionalBottomRightBlock,
    ...balanceInputProps
  } = props;

  return (
    <>
      <BalanceInput
        ref={inputRef}
        {...balanceInputProps}
        selectedAssetMetadata={selectedAssetMetadata}
        additionalTopRightBlock={
          additionalTopRightBlock || (
            <div className="text-xs text-sand-600 flex items-center gap-[4px] font-semibold">
              <Icon icon="wallet-secondary" className="size-4" />
              <CryptoBalance
                value={new BigNumber(cryptoValue)}
                cryptoDecimals={cryptoDecimals}
              />
              {selectedAssetMetadata.symbol}
            </div>
          )
        }
        additionalBottomLeftBlock={additionalBottomLeftBlock}
        additionalBottomRightBlock={
          additionalBottomRightBlock || (
            <div className="text-xs text-sand-600 flex items-center justify-between font-semibold">
              <BalanceTotalBlock
                balanceTotal={balanceTotal}
                decimals={decimals}
              />
            </div>
          )
        }
      ></BalanceInput>
    </>
  );
});

BalanceInputWithTotal.displayName = "BalanceInputWithTotal";
