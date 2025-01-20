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
