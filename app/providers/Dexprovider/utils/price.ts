import BigNumber from "bignumber.js";
import { DodoStorageType } from "~/providers/Dexprovider/dex.provider.types";

export const getPMMTokenPrice = (storage: DodoStorageType) => {
  const { feeDecimals } = storage.config;

  // Guide price with feeDecimals adjustment
  const i = new BigNumber(storage.guidePrice).div(
    new BigNumber(10).pow(feeDecimals)
  );

  // Slippage factor adjustment
  const k = new BigNumber(storage.slippageFactor).div(
    new BigNumber(10).pow(feeDecimals)
  );

  // Base token balance (3 decimals)
  const B = new BigNumber(storage.baseBalance).div(
    new BigNumber(10).pow(feeDecimals)
  );

  // Target base token amount (3 decimals)
  const B_0 = new BigNumber(storage.targetBaseTokenAmount).div(
    new BigNumber(10).pow(feeDecimals)
  );

  // Quote token balance (6 decimals)
  const Q = new BigNumber(storage.quoteBalance).div(
    new BigNumber(10).pow(feeDecimals)
  );

  // Target quote token amount (6 decimals)
  const Q_0 = new BigNumber(storage.targetQuoteTokenAmount).div(
    new BigNumber(10).pow(feeDecimals)
  );

  // Calculate R based on the balances and slippage
  const R = calculateRFromStorage(B, B_0, Q, Q_0, k);

  // Calculate final token price
  return i.times(R);
};

export function calculateRFromStorage(
  B: BigNumber,
  B_0: BigNumber,
  Q: BigNumber,
  Q_0: BigNumber,
  k: BigNumber
): BigNumber {
  const one = new BigNumber(1);
  let R = one;

  if (B.isLessThan(B_0)) {
    // Adjust R based on the base token balance
    R = one.minus(k).plus(B_0.div(B).pow(2).times(k));
  }

  if (Q.isLessThan(Q_0)) {
    // Adjust R based on the quote token balance
    R = one.div(one.minus(k).plus(Q_0.div(Q).pow(2).times(k)));
  }

  return R;
}

export const calculateTotalLiquidity = (storage: DodoStorageType) => {
  const baseBalance = new BigNumber(storage.baseBalance).div(
    new BigNumber(10).pow(storage.config.feeDecimals)
  );

  const quoteBalance = new BigNumber(storage.quoteBalance).div(
    new BigNumber(10).pow(storage.config.feeDecimals)
  );

  const totalLiquidity = baseBalance.plus(quoteBalance); // Total liquidity is the sum of the base and quote liquidity

  return { totalLiquidity, baseBalance, quoteBalance };
};

export const calculateTotalLiquidityInUSD = (
  storage: DodoStorageType,
  baseTokenPriceInUSDT: BigNumber
) => {
  const baseBalanceInUSD = new BigNumber(storage.baseBalance).times(
    baseTokenPriceInUSDT.div(new BigNumber(10).pow(storage.config.feeDecimals))
  );

  const quoteBalanceInUSD = new BigNumber(storage.quoteBalance).times(
    baseTokenPriceInUSDT.div(new BigNumber(10).pow(storage.config.feeDecimals))
  );

  // Calculate total liquidity in USD
  const totalLiquidityInUSD = baseBalanceInUSD.plus(quoteBalanceInUSD);

  return {
    totalLiquidityInUSD: totalLiquidityInUSD.toFixed(2),
    baseBalanceInUSD: baseBalanceInUSD.toFixed(2),
    quoteBalanceInUSD: quoteBalanceInUSD.toFixed(2),
  };
};

export const calculateLiquidityPercentages = (storage: DodoStorageType) => {
  const { baseBalance, quoteBalance, totalLiquidity } =
    calculateTotalLiquidity(storage);

  // Calculate percentages
  const basePercentage = baseBalance.div(totalLiquidity).times(100); // Base token percentage
  const quotePercentage = quoteBalance.div(totalLiquidity).times(100); // Quote token percentage

  return {
    basePercentage: basePercentage.toFixed(2), // Fixed to 2 decimal places
    quotePercentage: quotePercentage.toFixed(2), // Fixed to 2 decimal places
  };
};
