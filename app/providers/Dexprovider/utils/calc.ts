import BigNumber from "bignumber.js";
import { DodoStorageType } from "../dex.provider.types";

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
