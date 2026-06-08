import BigNumber from "bignumber.js";
import { DodoStorageType } from "../dex.provider.types";
import {
  BUY,
  SELL,
} from "~/routes/marketplace.$id/components/PriceSection/consts";

export const detectQuoteTokenLimit = (
  storage: DodoStorageType | undefined,
  amount: BigNumber | undefined,
  actionType: typeof BUY | typeof SELL // New parameter for buying Token A
) => {
  if (!storage) {
    return false;
  }

  const {
    quoteBalanceLimit,
    baseBalanceLimit,
    quoteBalance,
    baseBalance,
    config: { feeDecimals },
  } = storage;

  const decimals = new BigNumber(10).pow(feeDecimals);

  // Convert limits to token amounts
  const quoteTokenLimit = new BigNumber(quoteBalanceLimit).div(decimals);
  const baseTokenLimit = new BigNumber(baseBalanceLimit).div(decimals);

  // Convert balances to readable amounts
  const baseBalanceAmount = new BigNumber(baseBalance).div(decimals);
  const quoteBalanceAmount = new BigNumber(quoteBalance).div(decimals);

  // Convert input amounts
  const sellAmountBN = new BigNumber(amount || "0");
  const buyAmountBN = new BigNumber(amount || "0");

  // Case 1: Selling Token A → baseBalance increases
  if (actionType === SELL) {
    const isSellLimitExceeded = baseBalanceAmount
      .plus(sellAmountBN)
      .gt(baseTokenLimit);

    return isSellLimitExceeded;
  }

  // default for Buy
  // Case 2: Buying Token A → quoteBalance increases
  const isBuyLimitExceeded = quoteBalanceAmount
    .plus(buyAmountBN)
    .gt(quoteTokenLimit);

  return isBuyLimitExceeded;
};
