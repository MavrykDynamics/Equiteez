import { SECONDARY_MARKET } from "../market.const";
import { EstateType } from "../market.types";

export * from "./marketTokenNormalizer";
export * from "./markets.utils";
export * from "./marketPickers";

export function pickMarketByIdentifier(
  identifier: string | undefined,
  markets: Map<string, EstateType>
): EstateType | null {
  return (
    Array.from(markets.values()).find(
      (es) => es.assetDetails.blockchain[0].identifier === identifier
    ) ?? null
  );
}

export const detectIfAssetIsSecondaryMarket = (estate: EstateType | null) => {
  if (estate === null) return false;
  return estate.assetDetails.type === SECONDARY_MARKET;
};
