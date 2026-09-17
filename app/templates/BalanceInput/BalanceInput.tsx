// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { isDefined } from "app/lib/utils";
import React, { FC, forwardRef, useCallback, useState } from "react";
import { AssetField } from "~/lib/organisms/AssetField";
import clsx from "clsx";
import { toLocalFormat } from "~/lib/formaters/formaters";
import { AssetMetadataBase } from "~/lib/metadata";
import { CryptoBalance } from "../Balance";
import { Icon } from "~/lib/atoms/Icon";
import { AssetView } from "~/templates/BalanceInput/AssetView";
import styles from "./styles.module.css";

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
  assetIconSrc?: string;
  amountInputClassName?: string;
  amountInputContainerClassName?: string;
  amountInputStyle?: React.CSSProperties;
  assetViewClassName?: string;
  bodyClassName?: string;
  bottomLeftClassName?: string;
  bottomRightClassName?: string;
  className?: string;
  errorCaption?: string;
  footerClassName?: string;
  headerClassName?: string;
  isAssetViewSmall?: boolean;
  sectionClassName?: string;
  secondaryAssetIconAlt?: string;
  secondaryAssetIconSrc?: string;
  secondaryAssetSlug?: string;
  selectedAssetMetadata?: AssetMetadataBase;
  shouldRenderFooter?: boolean;
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
      assetIconSrc,
      amountInputClassName,
      amountInputContainerClassName,
      amountInputStyle,
      assetViewClassName,
      bodyClassName,
      bottomLeftClassName,
      bottomRightClassName,
      className,
      errorCaption,
      footerClassName,
      headerClassName,
      isAssetViewSmall,
      sectionClassName,
      secondaryAssetIconAlt,
      secondaryAssetIconSrc,
      secondaryAssetSlug,
      selectedAssetSlug,
      selectedAssetMetadata,
      shouldRenderFooter = true,
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
      <div className={clsx("flex flex-col gap-2", className)}>
        <section
          className={clsx(
            "transition duration-250 linear",
            "p-4 bg-gray-50 flex flex-col gap-1 rounded-2xl border",

            isFocused && !errorCaption && "border-dark-green-100",
            errorCaption && "border-red-500",
            !errorCaption &&
              !isFocused &&
              "border-transparent hover:border-dark-green-50",
            sectionClassName
          )}
        >
          <div
            className={clsx(
              "flex justify-between items-center",
              styles.header,
              headerClassName
            )}
          >
            <div className={styles.label}>
              {label}
            </div>
            {additionalTopRightBlock}
          </div>
          <div
            className={clsx(
              "flex justify-between overflow-y-hidden",
              bodyClassName
            )}
          >
            <AssetView
              className={assetViewClassName}
              assetIconSrc={assetIconSrc}
              isSmallView={isAssetViewSmall}
              secondaryAssetIconAlt={secondaryAssetIconAlt}
              secondaryAssetIconSrc={secondaryAssetIconSrc}
              secondaryAssetSlug={secondaryAssetSlug}
              selectedAssetSlug={selectedAssetSlug}
              selectedAssetMetadata={selectedAssetMetadata}
            />
            <AssetField
              ref={inputRef}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={handleKeyDown}
              value={amount
                ?.toFixed(selectedAssetMetadata?.decimals ?? 6)
                .toString()}
              className={clsx(
                "text-asset-input text-right text-sand-900 border-none bg-opacity-0 pl-0 focus:shadow-none overflow-y-hidden",
                amountInputClassName
              )}
              containerClassName={clsx(
                "overflow-y-hidden",
                amountInputContainerClassName
              )}
              style={{
                padding: 0,
                borderRadius: 0,
                height: 32,
                ...amountInputStyle,
              }}
              placeholder={toLocalFormat(0, { decimalPlaces: 2 })}
              min={0}
              max={9999999999999}
              disabled={amountInputDisabled}
              assetDecimals={selectedAssetMetadata?.decimals ?? 6}
              onChange={handleAmountChange}
            />
          </div>
          {shouldRenderFooter && (
            <div
              className={clsx(
                "flex justify-between items-center",
                footerClassName
              )}
            >
              <div className={bottomLeftClassName}>
                {additionalBottomLeftBlock}
              </div>

              <div className={bottomRightClassName}>
                {additionalBottomRightBlock}
              </div>
            </div>
          )}
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

type BalanceDisplayPlacement = "top-right" | "bottom-left";

type BalanceDisplayBlockProps = {
  balanceClassName?: string;
  balanceLabel?: string;
  balanceSuffix?: React.ReactNode;
  cryptoDecimals?: number;
  cryptoValue: number | BigNumber;
  selectedAssetMetadata?: AssetMetadataBase;
  showBalanceIcon?: boolean;
};

const BalanceDisplayBlock: FC<BalanceDisplayBlockProps> = ({
  balanceClassName,
  balanceLabel,
  balanceSuffix,
  cryptoDecimals,
  cryptoValue,
  selectedAssetMetadata,
  showBalanceIcon = true,
}) => {
  return (
    <div
      className={clsx(
        styles.balanceDisplay,
        balanceClassName
      )}
    >
      {showBalanceIcon && <Icon icon="wallet-secondary" className="size-4" />}
      {balanceLabel && <span>{balanceLabel}</span>}
      <CryptoBalance
        value={new BigNumber(cryptoValue)}
        cryptoDecimals={cryptoDecimals}
      />
      <span>{selectedAssetMetadata?.symbol ?? "???"}</span>
      {balanceSuffix}
    </div>
  );
};

export const BalanceInputWithTotal = forwardRef<
  HTMLInputElement,
  BalanceInputProps &
    BalanceTotalBlockProps & {
      balanceClassName?: string;
      balanceLabel?: string;
      balancePlacement?: BalanceDisplayPlacement;
      balanceSuffix?: React.ReactNode;
      cryptoValue: number | BigNumber;
      cryptoDecimals?: number;
      showBalanceIcon?: boolean;
    }
>((props, inputRef) => {
  const {
    balanceTotal,
    decimals,
    selectedAssetMetadata,
    balanceClassName,
    balanceLabel,
    balancePlacement = "top-right",
    balanceSuffix,
    cryptoValue,
    cryptoDecimals,
    showBalanceIcon = true,
    additionalBottomLeftBlock,
    additionalTopRightBlock,
    additionalBottomRightBlock,
    ...balanceInputProps
  } = props;

  const balanceBlock = (
    <BalanceDisplayBlock
      balanceClassName={balanceClassName}
      balanceLabel={balanceLabel}
      balanceSuffix={balanceSuffix}
      cryptoDecimals={cryptoDecimals}
      cryptoValue={cryptoValue}
      selectedAssetMetadata={selectedAssetMetadata}
      showBalanceIcon={showBalanceIcon}
    />
  );

  return (
    <>
      <BalanceInput
        ref={inputRef}
        {...balanceInputProps}
        selectedAssetMetadata={selectedAssetMetadata}
        additionalTopRightBlock={
          additionalTopRightBlock ||
          (balancePlacement === "top-right" ? balanceBlock : undefined)
        }
        additionalBottomLeftBlock={
          additionalBottomLeftBlock ||
          (balancePlacement === "bottom-left" ? balanceBlock : undefined)
        }
        additionalBottomRightBlock={
          additionalBottomRightBlock || (
            <div className={styles.balanceTotal}>
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
