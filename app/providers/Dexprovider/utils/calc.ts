import BigNumber from "bignumber.js";
import { DodoStorageType } from "../dex.provider.types";

export const calculateTotalLiquidity = (storage: DodoStorageType) => {
  const feeDecimals = new BigNumber(10).pow(storage.config.feeDecimals);

  const baseBalance = new BigNumber(storage.baseBalance).div(feeDecimals);

  const quoteBalance = new BigNumber(storage.quoteBalance).div(feeDecimals);

  const totalLiquidity = baseBalance.plus(quoteBalance); // Total liquidity is the sum of the base and quote liquidity

  return { totalLiquidity, baseBalance, quoteBalance };
};

export const calculateTotalLiquidityInUSD = (
  storage: DodoStorageType,
  baseTokenPriceInUSDT: BigNumber
) => {
  const feeDecimals = new BigNumber(10).pow(storage.config.feeDecimals);
  const baseBalanceInUSD = new BigNumber(storage.baseBalance).times(
    baseTokenPriceInUSDT.div(feeDecimals)
  );

  const quoteBalanceInUSD = new BigNumber(storage.quoteBalance).times(
    baseTokenPriceInUSDT.div(feeDecimals)
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

export const getDodoMavLpFee = (storage: DodoStorageType) => {
  const feeDecimals = new BigNumber(10).pow(storage.config.feeDecimals);
  return new BigNumber(storage.config.lpFee).div(feeDecimals);
};

export const calculateEstFee = (
  tokensAmount: BigNumber | undefined,
  tokenPriceInUSDT: BigNumber.Value,
  lpFee: BigNumber.Value,
  decimals: number,
  isBuying: boolean
) => {
  if (!tokensAmount) return "0";
  const feeRate = lpFee;

  if (isBuying) {
    // Fee in token X
    const estFee = tokensAmount.times(feeRate);
    return estFee.times(new BigNumber(10).pow(decimals)).toFixed(0); // Return in raw storage units
  } else {
    // Fee in USDT
    const tokenValueInUSDT = new BigNumber(tokensAmount).times(
      tokenPriceInUSDT
    );
    const estFee = tokenValueInUSDT.times(feeRate);
    return estFee.times(new BigNumber(10).pow(decimals)).toFixed(0); // USDT has 6 decimals
  }
};

export const calculateMinMaxQuote = (storage: DodoStorageType) => {
  const feeDecimals = new BigNumber(10).pow(storage.config.feeDecimals);

  // Guide price (already scaled with feeDecimals)
  const guidePrice = new BigNumber(storage.guidePrice).div(feeDecimals);

  // Slippage factor
  const slippageFactor = new BigNumber(storage.slippageFactor).div(feeDecimals);

  // Fixed price and orderbook price percentages
  const fixedPricePercent = new BigNumber(storage.config.fixedPricePercent).div(
    feeDecimals
  );
  const orderbookPricePercent = new BigNumber(
    storage.config.orderbookPricePercent
  ).div(feeDecimals);

  // Min quote = GuidePrice × (1 - slippageFactor - fixedPricePercent)
  const minQuote = guidePrice.times(
    new BigNumber(1).minus(slippageFactor).minus(fixedPricePercent)
  );

  // Max quote = GuidePrice × (1 + slippageFactor + orderbookPricePercent)
  const maxQuote = guidePrice.times(
    new BigNumber(1).plus(slippageFactor).plus(orderbookPricePercent)
  );

  return {
    minQuote: minQuote.toFixed(6), // Keep 6 decimals for readability
    maxQuote: maxQuote.toFixed(6), // Keep 6 decimals for readability
  };
};
