/* eslint-disable react/prop-types */
import { memo } from 'react';

import BigNumber from 'bignumber.js';
import Money from '~/lib/atoms/Money';
import InFiat from '~/lib/molecules/InFiat';
import { twMerge } from '~/lib/utils/tw-merge';

interface CryptoBalanceProps {
  value: BigNumber;
  cryptoDecimals?: number;
}

export const CryptoBalance = memo<CryptoBalanceProps>(
  ({ value, cryptoDecimals }) => (
    <div className="truncate inline-block items-center align-middle">
      <Money smallFractionFont={false} cryptoDecimals={cryptoDecimals}>
        {value}
      </Money>
    </div>
  )
);

CryptoBalance.displayName = 'CryptoBalance';

interface FiatBalanceProps {
  assetSlug: string;
  className?: string;
  showEqualSymbol?: boolean;
  customSymbol?: string;
  value: BigNumber | string | number;
  roundingMode?: BigNumber.RoundingMode;
  tooltip?: boolean;
}
export const FiatBalance = memo<FiatBalanceProps>(
  ({
    assetSlug,
    tooltip,
    value,
    className,
    roundingMode,
    customSymbol,
    showEqualSymbol = true,
  }) => (
    <InFiat
      assetSlug={assetSlug}
      volume={value}
      smallFractionFont={false}
      roundingMode={roundingMode}
      tooltip={tooltip}
    >
      {({ balance, symbol }) => (
        <div
          className={twMerge(
            'font-normal text-current flex items-center truncate',
            className
          )}
        >
          {showEqualSymbol && <span className="mr-1">≈</span>}
          {customSymbol && <span>{customSymbol}</span>}
          <span>{symbol}</span>
          {balance}
        </div>
      )}
    </InFiat>
  )
);

FiatBalance.displayName = 'FiatBalance';
