export type PortfolioAsset = {
  amount: number;
  averagePrice: number;
  changePercentage: number;
  iconUrl?: string;
  id: string;
  name: string;
  price: number;
  profit: number | null;
  quantity: number;
  symbol: string;
  value: number;
  yield: number | null;
};
