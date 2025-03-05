import BigNumber from "bignumber.js";
import { DodoStorageType } from "../dex.provider.types";
import { ZERO } from "~/lib/utils/numbers";

export const calculateTotalLiquidity = (
  storage: DodoStorageType | undefined
) => {
  if (!storage)
    return { totalLiquidity: ZERO, baseBalance: ZERO, quoteBalance: ZERO };
  const feeDecimals = new BigNumber(10).pow(storage.config.feeDecimals);

  const baseBalance = new BigNumber(storage.baseBalance).div(feeDecimals);

  const quoteBalance = new BigNumber(storage.quoteBalance).div(feeDecimals);

  const totalLiquidity = baseBalance.plus(quoteBalance); // Total liquidity is the sum of the base and quote liquidity

  return { totalLiquidity, baseBalance, quoteBalance };
};

export const calculateTotalLiquidityInUSD = (
  storage: DodoStorageType | undefined,
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

const DEFAULT_PERCENTAGES_DATA = {
  basePercentage: "0",
  quotePercentage: "0",
};

export const calculateLiquidityPercentages = (
  storage: DodoStorageType | undefined
) => {
  if (!storage) return DEFAULT_PERCENTAGES_DATA;
  const { baseBalance, quoteBalance, totalLiquidity } =
    calculateTotalLiquidity(storage);

  if (totalLiquidity.isZero()) return DEFAULT_PERCENTAGES_DATA;
  // Calculate percentages
  const basePercentage = baseBalance.div(totalLiquidity).times(100); // Base token percentage
  const quotePercentage = quoteBalance.div(totalLiquidity).times(100); // Quote token percentage

  return {
    basePercentage: basePercentage.toFixed(2), // Fixed to 2 decimal places
    quotePercentage: quotePercentage.toFixed(2), // Fixed to 2 decimal places
  };
};

export const getTokenAmountFromLiquidity = (
  storage: DodoStorageType | undefined,
  baseTokenPriceInUSDT: BigNumber
) => {
  if (!storage || baseTokenPriceInUSDT.isZero()) return new BigNumber(0);

  const feeDecimals = new BigNumber(10).pow(storage.config.feeDecimals);

  // Convert baseBalance to human-readable format
  const baseBalance = new BigNumber(storage.baseBalance).div(feeDecimals);

  return baseBalance; // This already represents the token amount in the pool
};

export const getDodoMavLpFee = (storage: DodoStorageType | undefined) => {
  if (!storage) return ZERO;
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
    return estFee.toFixed(decimals);
  } else {
    // Fee in USDT
    const tokenValueInUSDT = new BigNumber(tokensAmount).times(
      tokenPriceInUSDT
    );
    const estFee = tokenValueInUSDT.times(feeRate);
    return estFee.toFixed(decimals);
  }
};

export const calculateMinReceived = (
  tokensAmount: BigNumber.Value,
  tokenPriceInUSDT: BigNumber.Value,
  slippagePercentage: string,
  decimals: number,
  isBuying: boolean
) => {
  // Parse slippage percentage and convert to factor (e.g., 1% slippage -> 0.99)
  const slippageFactor = new BigNumber(1).minus(
    new BigNumber(slippagePercentage).dividedBy(100)
  );

  // const minMaxQuote = new BigNumber(tokensAmount).times(slippageFactor);
  // console.log(tokensToAtoms(minMaxQuote, 3).toNumber(), "------");

  // For buying, calculate how much you receive in tokens
  const totalValueInUSDT = new BigNumber(tokensAmount).times(tokenPriceInUSDT);
  if (isBuying) {
    const minReceivedInTokens = totalValueInUSDT.div(tokenPriceInUSDT); // Tokens you receive for your USDT

    return minReceivedInTokens.times(slippageFactor).toFixed(decimals); // Apply slippage and return
  }

  // Apply slippage on the value in USDT
  const minReceivedInUSDT = totalValueInUSDT.times(slippageFactor);

  return minReceivedInUSDT.toFixed(decimals); // USDT has 6 decimals
};
