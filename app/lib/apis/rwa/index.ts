export const rwaApiUrl = new URL(process.env.RWA_API ?? "").href;
export const rwaPricesApiUrl = new URL(process.env.RWA_SERVICES_API ?? "").href;

export { rwaApi } from "~/lib/apis/rwa/client";
export {
  fetchAssets,
  fetchAssetsHighlights,
} from "~/lib/apis/rwa/assets/assets";
export {
  fetchWalletOpenOrders,
  fetchWalletOrderHistory,
} from "~/lib/apis/rwa/orders/orders";
export {
  fetchWallet,
  fetchWalletPortfolio,
} from "~/lib/apis/rwa/wallet/wallet";
export {
  DEFAULT_ORDERBOOK_DEPTH_LIMIT,
  MAX_ORDERBOOK_DEPTH_LIMIT,
  ORDERBOOK_DEPTH_REFETCH_INTERVAL,
  fetchOrderbookDepth,
  orderbookDepthQueryKeys,
} from "~/lib/apis/rwa/orderbookDepth/orderbookDepth";
export { useOrderbookDepth } from "~/lib/apis/rwa/orderbookDepth/useOrderbookDepth";
export { fetchPrices, fetchPriceSeries } from "~/lib/apis/rwa/prices/prices";
