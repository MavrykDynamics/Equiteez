export const rwaApiUrl = new URL(process.env.RWA_API ?? "").href;
export const rwaPricesApiUrl = "https://services.api.mavryk.network/v1/rwa";

export { fetchAssets } from "~/lib/apis/rwa/assets/assets";
export { fetchPrices } from "~/lib/apis/rwa/prices/prices";
