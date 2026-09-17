import type { PriceAssetType } from "~/lib/apis/rwa/prices/prices.types";

export function mapPricesByTokenAddress(prices: PriceAssetType[]) {
  return prices.reduce<Record<string, PriceAssetType>>(
    (accumulator, priceAsset) => {
      accumulator[priceAsset.token_address] = priceAsset;

      return accumulator;
    },
    {}
  );
}
