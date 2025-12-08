import BigNumber from "bignumber.js";

export const calculateTotalLiquidity = (
  aggregatedOrdersBuyPrice: BigNumber,
  aggregatedOrdersSellPrice: BigNumber
) => {
  return aggregatedOrdersBuyPrice.plus(aggregatedOrdersSellPrice);
};

export const calculateTotalLiquidityInUSD = (
  storage: any | undefined,
  baseTokenPriceInUSDT: BigNumber
) => {
  if (!storage)
    return {
      totalLiquidityInUSD: "0",
      baseBalanceInUSD: "0",
      quoteBalanceInUSD: "0",
    };

  const feeDecimals = new BigNumber(10).pow(storage.config.feeDecimals);

  // Convert baseBalance to human-readable format
  const baseBalance = new BigNumber(storage.baseBalance).div(feeDecimals);

  // Convert quoteBalance to human-readable format (already in USD)
  const quoteBalance = new BigNumber(storage.quoteBalance).div(feeDecimals);

  // Calculate USD value of base token in the pool
  const baseBalanceInUSD = baseBalance.times(baseTokenPriceInUSDT);

  // Since quote token is USDT, its balance is already in USD
  const quoteBalanceInUSD = quoteBalance;

  // Calculate total liquidity in USD
  const totalLiquidityInUSD = baseBalanceInUSD.plus(quoteBalanceInUSD);

  return {
    totalLiquidityInUSD: totalLiquidityInUSD.toFixed(2),
    baseBalanceInUSD: baseBalanceInUSD.toFixed(2),
    quoteBalanceInUSD: quoteBalanceInUSD.toFixed(2),
  };
};

export const calculateLiquidityPercentages = (
  aggregatedOrdersBuyPrice: BigNumber,
  aggregatedOrdersSellPrice: BigNumber
) => {
  const totalLiquidity = aggregatedOrdersBuyPrice.plus(
    aggregatedOrdersSellPrice
  );

  if (totalLiquidity.isZero()) {
    return {
      buyPercentage: "0.00",
      sellPercentage: "0.00",
    };
  }

  const buyPercentage = aggregatedOrdersBuyPrice
    .div(totalLiquidity)
    .times(100)
    .toFixed(2);

  const sellPercentage = aggregatedOrdersSellPrice
    .div(totalLiquidity)
    .times(100)
    .toFixed(2);

  return {
    buyPercentage,
    sellPercentage,
  };
};

export const calculateEstFee = ({
  amount,
  price,
  fee,
  tokenDecimals,
  isFeeInTokens = false,
}: {
  amount: BigNumber;
  price: BigNumber;
  fee: number;
  tokenDecimals: number;
  isFeeInTokens?: boolean;
}) => {
  const totalFeeRate = new BigNumber(fee).div(
    new BigNumber(10).pow(tokenDecimals)
  );

  if (isFeeInTokens) {
    // Fee in base token
    console.log(isFeeInTokens, "isFeeInTokens");
    const estFee = amount.times(totalFeeRate);
    return estFee.decimalPlaces(tokenDecimals, BigNumber.ROUND_DOWN).toString();
  } else {
    // Fee in USDT
    const tokenValueInUSDT = new BigNumber(amount).times(price);
    const estFee = tokenValueInUSDT.times(totalFeeRate);

    return estFee.decimalPlaces(tokenDecimals, BigNumber.ROUND_DOWN).toString();
  }
};

export const calculateMaxBuySell = (
  tokensBalance: BigNumber.Value,
  usdBalance: BigNumber.Value,
  tokenPriceInUSDT: BigNumber.Value,
  decimals: number,
  isBuying: boolean
): BigNumber => {
  const price = new BigNumber(tokenPriceInUSDT);
  const usd = new BigNumber(usdBalance);

  if (isBuying) {
    if (price.isZero()) return new BigNumber(0);
    return usd.div(price).decimalPlaces(decimals, BigNumber.ROUND_DOWN);
  } else {
    const tokenBal = new BigNumber(tokensBalance);
    return tokenBal
      .times(tokenPriceInUSDT)
      .decimalPlaces(decimals, BigNumber.ROUND_DOWN);
  }
};
