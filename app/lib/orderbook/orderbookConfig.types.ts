export type OrderbookExecutionConfig = {
  address: string;
  baseTokenAddress: string;
  rwaTokenId: string;
  quoteTokenAddress: string;
  quoteTokenId: string;
  currencyKey: string;
  tickSize: string;
  quantityTickSize: string;
  minBuyOrderAmount: string;
  minBuyOrderValue: string;
  minSellOrderAmount: string;
  minSellOrderValue: string;
};

export type OrderbookContractConfig = Pick<
  OrderbookExecutionConfig,
  | "tickSize"
  | "quantityTickSize"
  | "minBuyOrderAmount"
  | "minBuyOrderValue"
  | "minSellOrderAmount"
  | "minSellOrderValue"
>;
