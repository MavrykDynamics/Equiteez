export const rwaApiUrl = new URL(process.env.RWA_API ?? "").href;
export const rwaPricesApiUrl = new URL(process.env.RWA_SERVICES_API ?? "").href;

export { rwaApi } from "~/lib/apis/rwa/client";
export { fetchAssets } from "~/lib/apis/rwa/assets/assets";
export {
  fetchWalletOpenOrders,
  fetchWalletOrderHistory,
} from "~/lib/apis/rwa/orders/orders";
export { fetchPrices, fetchPriceSeries } from "~/lib/apis/rwa/prices/prices";
