import React, {
  FC,
  HTMLAttributes,
  memo,
  useCallback,
  useMemo,
  useRef,
} from "react";

import BigNumber from "bignumber.js";
import classNames from "clsx";

import {
  getNumberSymbols,
  toLocalFixed,
  toLocalFormat,
  toShortened,
} from "app/lib/formaters/formaters";
import useCopyToClipboard from "../ui/useCopyToClipboard";
import useTippy, { TippyInstance, UseTippyOptions } from "../ui/useTippy";

interface MoneyProps {
  children: number | string | BigNumber;
  fiat?: boolean;
  cryptoDecimals?: number;
  roundingMode?: BigNumber.RoundingMode;
  shortened?: boolean;
  smallFractionFont?: boolean;
  tooltip?: boolean;
}

const DEFAULT_CRYPTO_DECIMALS = 6;
const ENOUGH_INT_LENGTH = 4;

const Money = memo(
  ({
    children,
    fiat,
    cryptoDecimals = DEFAULT_CRYPTO_DECIMALS,
    roundingMode = BigNumber.ROUND_DOWN,
    shortened,
    smallFractionFont = false,
    tooltip = true,
  }: MoneyProps) => {
    const bn = new BigNumber(children);

    const decimalsLength = bn.decimalPlaces() ?? 0;
    const intLength = bn.integerValue().toFixed().length;
    if (intLength >= ENOUGH_INT_LENGTH) {
      cryptoDecimals = Math.max(cryptoDecimals - 2, 1);
    }
    const { decimal } = getNumberSymbols();

    const deciamlsLimit =
      decimalsLength > cryptoDecimals ? cryptoDecimals : decimalsLength;

    const decimals = fiat ? 2 : deciamlsLimit;
    const result = shortened
      ? toShortened(bn)
      : toLocalFormat(bn, { decimalPlaces: decimals, roundingMode });

    const indexOfDecimal =
      result.indexOf(decimal) === -1
        ? result.indexOf(".")
        : result.indexOf(decimal);

    const tippyClassName = classNames(
      "px-px -mr-px rounded truncate",
      tooltip &&
        "cursor-pointer  hover:bg-opacity-5 transition ease-in-out duration-200"
    );

    if (indexOfDecimal === -1) {
      return (
        <JustMoney
          tooltip={tooltip}
          result={result}
          className={tippyClassName}
          bn={bn}
        />
      );
    }

    if (!fiat && !shortened && decimalsLength > cryptoDecimals) {
      return (
        <MoneyWithoutFormat
          tooltip={tooltip}
          className={tippyClassName}
          bn={bn}
          cryptoDecimals={cryptoDecimals}
          roundingMode={roundingMode}
          smallFractionFont={smallFractionFont}
        />
      );
    }

    return (
      <MoneyWithFormat
        tooltip={tooltip}
        result={result}
        className={tippyClassName}
        bn={bn}
        isFiat={fiat}
        indexOfDecimal={indexOfDecimal}
        smallFractionFont={smallFractionFont}
      />
    );
  }
);

Money.displayName = "Money";

export default Money;

interface JustMoneyProps {
  tooltip: boolean;
  bn: BigNumber;
  className: string;
  result: string;
}

const JustMoney: FC<JustMoneyProps> = ({ tooltip, bn, className, result }) => (
  <FullAmountTippy enabled={tooltip} fullAmount={bn} className={className}>
    {result}
  </FullAmountTippy>
);

interface MoneyAnyFormatPropsBase {
  tooltip: boolean;
  bn: BigNumber;
  className: string;
  smallFractionFont: boolean;
}

interface MoneyWithoutFormatProps extends MoneyAnyFormatPropsBase {
  cryptoDecimals: number;
  roundingMode?: BigNumber.RoundingMode;
}

const FORMATTING_THRESHOLD = 1000;
const PRECISION_MULTIPLIER = 100;

const formatAmount = (amount: BigNumber) => {
  const isLessThanThreshold = amount.isLessThanOrEqualTo(FORMATTING_THRESHOLD);

  if (isLessThanThreshold) return { amount, isLessThanThreshold };

  const numberAmount = Number(amount);
  const roundingAccuracy =
    Math.floor(numberAmount * PRECISION_MULTIPLIER) / PRECISION_MULTIPLIER;

  return {
    amount: new BigNumber(roundingAccuracy.toFixed(2)),
    isLessThanThreshold,
  };
};

const MoneyWithoutFormat: FC<MoneyWithoutFormatProps> = ({
  tooltip,
  bn,
  className,
  cryptoDecimals,
  roundingMode,
  smallFractionFont,
}) => {
  const { decimal } = getNumberSymbols();

  const { amount, isLessThanThreshold } = formatAmount(bn);

  const result = toLocalFormat(amount, {
    decimalPlaces: isLessThanThreshold ? Math.max(cryptoDecimals, 0) : 2,
    roundingMode,
  });
  const indexOfDecimal = result.indexOf(decimal);

  return (
    <FullAmountTippy
      enabled={tooltip}
      fullAmount={bn}
      className={className}
      showAmountTooltip
    >
      {result.slice(0, indexOfDecimal + 1)}
      <span style={{ fontSize: smallFractionFont ? "0.9em" : undefined }}>
        {result.slice(indexOfDecimal + 1, result.length)}
      </span>
    </FullAmountTippy>
  );
};

interface MoneyWithFormatProps extends MoneyAnyFormatPropsBase {
  result: string;
  indexOfDecimal: number;
  isFiat?: boolean;
}

const MoneyWithFormat: FC<MoneyWithFormatProps> = ({
  tooltip,
  bn,
  className,
  result,
  indexOfDecimal,
  isFiat,
  smallFractionFont,
}) => {
  const fullAmount = useMemo(() => {
    if (!isFiat) return bn;

    const { amount } = formatAmount(bn);

    return new BigNumber(amount.toFixed(2));
  }, [bn.toString(), isFiat]);

  return (
    <FullAmountTippy
      enabled={tooltip}
      fullAmount={fullAmount}
      className={className}
    >
      {result.slice(0, indexOfDecimal + 1)}
      <span style={{ fontSize: smallFractionFont ? "0.9em" : undefined }}>
        {result.slice(indexOfDecimal + 1, result.length)}
      </span>
    </FullAmountTippy>
  );
};

interface FullAmountTippyProps extends HTMLAttributes<HTMLSpanElement> {
  fullAmount: BigNumber;
  showAmountTooltip?: boolean;
  enabled?: boolean;
}

const FullAmountTippy: FC<FullAmountTippyProps> = ({
  fullAmount,
  onClick,
  showAmountTooltip,
  enabled = true,
  ...rest
}) => {
  const fullAmountStr = useMemo(() => toLocalFixed(fullAmount), [fullAmount]);

  const { fieldRef, copy, copied, setCopied } = useCopyToClipboard();

  const tippyContent = useMemo(() => {
    if (copied) {
      return "Copied!";
    }
    return showAmountTooltip ? fullAmountStr : "copy";
  }, [copied, showAmountTooltip, fullAmountStr]);

  const tippyInstanceRef = useRef<TippyInstance>();
  const tippyProps = useMemo<UseTippyOptions>(
    () => ({
      trigger: "mouseenter",
      hideOnClick: false,
      content: tippyContent,
      animation: "shift-away-subtle",
      onCreate(instance) {
        tippyInstanceRef.current = instance;
        instance.enable();
      },
      onTrigger(instance) {
        !showAmountTooltip && instance.disable();
      },
      onUntrigger(instance) {
        !showAmountTooltip && instance.disable();
      },
      onHidden() {
        setCopied(false);
      },
    }),
    [tippyContent, showAmountTooltip, setCopied]
  );

  const ref = useTippy<HTMLSpanElement>(tippyProps);

  const handleClick = useCallback(
    (evt: React.MouseEvent<HTMLSpanElement>) => {
      evt.preventDefault();
      evt.stopPropagation();

      if (!showAmountTooltip) {
        tippyInstanceRef.current?.enable();
        tippyInstanceRef.current?.show();
      }

      copy();

      onClick?.(evt);
    },
    [copy, onClick, showAmountTooltip]
  );

  return (
    <div className="contents">
      {enabled ? (
        <>
          <span role="presentation" ref={ref} onClick={handleClick} {...rest} />
          <input
            ref={fieldRef}
            value={fullAmountStr}
            readOnly
            className="sr-only"
          />
        </>
      ) : (
        <span {...rest} />
      )}
    </div>
  );
};
