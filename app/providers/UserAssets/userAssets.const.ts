export type Asset = {
  name: string;
  avlBalance: number;
  avlBalanceUsd: number;
  balanceInOrders: number;
  balanceInOrdersUsd: number;
  totalBalance: number;
  totalBalanceUsd: number;
  tokenSlug: string;
  tokenAddress: string;
  market: AssetMarket;
  tokenSymbol: string;
  pricePerToken: number;
};

export enum AssetMarket {
  secondary,
  primary,
  empty,
}
