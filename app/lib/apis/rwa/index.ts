export const rwaApiUrl = new URL(process.env.RWA_API ?? "").href;
export const rwaPricesApiUrl = new URL(process.env.RWA_SERVICES_API ?? "").href;

export { fetchAssets } from "~/lib/apis/rwa/assets/assets";
export { fetchPrices } from "~/lib/apis/rwa/prices/prices";
