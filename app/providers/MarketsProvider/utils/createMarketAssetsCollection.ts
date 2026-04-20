import { toTokenSlug } from "~/lib/assets";
import {
  AssetData,
  EstateType,
  OrderbookConfigType,
} from "~/providers/MarketsProvider/market.types";
import { transformAssetData } from "~/providers/MarketsProvider/utils/transformAssetData";

type MarketAssetsCollection = {
  markets: Map<string, EstateType>;
  marketsArr: EstateType[];
  orderbook: Map<string, OrderbookConfigType>;
  sortedMarketAddresses: string[];
};

export const EMPTY_MARKET_ASSETS_COLLECTION: MarketAssetsCollection = {
  markets: new Map(),
  marketsArr: [],
  orderbook: new Map(),
  sortedMarketAddresses: [],
};

const createMarketAsset = (asset: AssetData): EstateType => {
  const slug = toTokenSlug(asset.asset.token.address, 0);

  return {
    ...transformAssetData(asset),
    slug,
  } as unknown as EstateType;
};

export const createMarketAssetsCollection = (
  assets: AssetData[]
): MarketAssetsCollection => {
  const markets = new Map<string, EstateType>();
  const orderbook = new Map<string, OrderbookConfigType>();
  const marketsArr: EstateType[] = [];
  const sortedMarketAddresses: string[] = [];

  assets.forEach((asset) => {
    const marketAsset = createMarketAsset(asset);

    markets.set(marketAsset.slug, marketAsset);
    marketsArr.push(marketAsset);
    sortedMarketAddresses.push(marketAsset.slug);

    orderbook.set(asset.orderbook.address, {
      address: asset.orderbook.address,
      rwaTokenAddress: asset.asset.token.address,
      currencies: [
        {
          token: {
            address: asset.orderbook.quote_token.address,
            token_id: asset.orderbook.quote_token.token_id,
          },
        },
      ],
    });
  });

  return {
    markets,
    marketsArr,
    orderbook,
    sortedMarketAddresses,
  };
};
