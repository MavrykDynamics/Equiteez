import BigNumber from "bignumber.js";

const fake_storage = {
  config: {
    lpFee: "2000000000000000",
    priceModel: "fixed",
    feeDecimals: "18",
    maintainerFee: "1000000000000000",
    appraisalPrice: "100000000000000000000",
    fixedPricePercent: "400000000000000000",
    orderbookPricePercent: "600000000000000000",
  },
  rStatus: "0",
  metadata: 2729,
  baseToken: {
    tokenId: "0",
    tokenContractAddress: "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ9",
  },
  guidePrice: "100000000000000000000",
  quoteToken: {
    tokenId: "0",
    tokenContractAddress: "KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf",
  },
  superAdmin: "KT1A8ee6yBDDfEtac5k798zCW5bBgmuw1AEe",
  baseBalance: "24962899000000000000", // B
  baseLpToken: {
    tokenId: "0",
    tokenContractAddress: "KT1N2ZotYaE4YLA4MzoqjKi75eYLLf58f25a",
  },
  pauseLedger: 2730,
  lambdaLedger: 2731,
  quoteBalance: "18686908406481673146", // Q
  quoteLpToken: {
    tokenId: "0",
    tokenContractAddress: "KT1V3DZT7xgXS1MY7SxZncrMVHeKmhuZDf5N",
  },
  newSuperAdmin: null,
  slippageFactor: "100000000000000000",
  baseBalanceLimit: "10000000000000000000000",
  quoteBalanceLimit: "10000000000000000000000",
  rwaOrderbookAddress: "KT1EYj4pMLFaBXHzxLZKRLKd65ve3qgpz3Xf",
  targetBaseTokenAmount: "20841095231349768374", // B_0
  targetQuoteTokenAmount: "218089835184100656365", // Q_0
};

export const getPMMTokenPrice = (storage = fake_storage) => {
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

  return i.times(R).toNumber(); // result 133
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
  } else if (B.isGreaterThan(B_0)) {
    R = one.div(one.minus(k).plus(Q_0.div(Q).exponentiatedBy(2).times(k)));
  }

  return R;
}
