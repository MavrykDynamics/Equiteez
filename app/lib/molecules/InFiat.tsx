import { FC, ReactElement, ReactNode, useMemo } from 'react';

import BigNumber from 'bignumber.js';

import Money from 'app/lib/atoms/Money';
// import {
//   useAssetFiatCurrencyPrice,
//   useFiatCurrency,
// } from 'app/lib/fiat-currency';
import { isDefined } from '../utils';

interface OutputProps {
  balance: ReactNode;
  symbol: string;
}

interface InFiatProps {
  volume: BigNumber | number | string;
  assetSlug?: string;
  children: (output: OutputProps) => ReactElement;
  roundingMode?: BigNumber.RoundingMode;
  shortened?: boolean;
  smallFractionFont?: boolean;
  mainnet?: boolean;
  showCents?: boolean;
  tooltip?: boolean;
}

const InFiat: FC<InFiatProps> = ({
  volume,
  // assetSlug,
  children,
  roundingMode,
  shortened,
  smallFractionFont,
  mainnet,
  showCents = true,
  tooltip = true,
}) => {
  const price = 1;
  // const { selectedFiatCurrency } = useFiatCurrency();
  const walletNetwork = { type: 'atlasnet' };

  if (mainnet === undefined) {
    mainnet = walletNetwork.type === 'main';
  }

  const roundedInFiat = useMemo(() => {
    if (!isDefined(price)) return new BigNumber(0);

    const inFiat = new BigNumber(volume).times(price);
    if (showCents) {
      return inFiat;
    }
    return inFiat.integerValue();
  }, [price, showCents, volume]);

  const cryptoDecimals = showCents ? undefined : 0;

  return children({
    balance: (
      <Money
        fiat={showCents}
        cryptoDecimals={cryptoDecimals}
        roundingMode={roundingMode}
        shortened={shortened}
        smallFractionFont={smallFractionFont}
        tooltip={tooltip}
      >
        {roundedInFiat}
      </Money>
    ),
    // symbol: selectedFiatCurrency.symbol,
    symbol: '$',
  });
};

export default InFiat;
