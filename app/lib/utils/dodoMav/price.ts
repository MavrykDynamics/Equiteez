import BigNumber from "bignumber.js";
import { DodoStorageType } from "~/providers/Dexprovider/dex.provider.types";

export const getPMMTokenPrice = (storage: DodoStorageType) => {
  const { feeDecimals } = storage.config;
  // Guide price
  const i = new BigNumber(storage.guidePrice);

  // Curve Slippage Factor
  const k = new BigNumber(storage.slippageFactor).div(feeDecimals);
  const B = new BigNumber(storage.baseBalance).div(3); // 3 mars token decimals
  const B_0 = new BigNumber(storage.targetBaseTokenAmount).div(3);
  const Q = new BigNumber(storage.quoteBalance).div(6); // 6 quote token decimals
  const Q_0 = new BigNumber(storage.targetQuoteTokenAmount).div(6);

  const R = calculateRFromStorage(B, B_0, Q, Q_0, k);

  console.log(R.toNumber(), "R");
  console.log(i.toNumber(), "i");

  console.log(i.times(R), "i.times(R)");

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
    R = one.minus(k).plus(B_0.div(B).exponentiatedBy(2).times(k));
  }

  if (Q.isLessThan(Q_0)) {
    R = one.div(one.minus(k).plus(Q_0.div(Q).exponentiatedBy(2).times(k)));
  }

  return R;
}
