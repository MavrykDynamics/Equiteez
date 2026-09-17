import { fromAssetSlug, toTokenSlug } from "~/lib/assets";
import type { TokenMetadata } from "~/lib/metadata/types";
import type { TokenType } from "~/providers/TokensProvider/tokens.provider.types";
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
  tokens: TokenType[];
  tokensMetadata: StringRecord<TokenMetadata>;
};

export const EMPTY_MARKET_ASSETS_COLLECTION: MarketAssetsCollection = {
  markets: new Map(),
  marketsArr: [],
  orderbook: new Map(),
  sortedMarketAddresses: [],
  tokens: [],
  tokensMetadata: {},
};

const createMarketAsset = (asset: AssetData): EstateType => {
  const slug = toTokenSlug(
    asset.asset.token.address,
    asset.asset.token.token_id ?? asset.orderbook.rwa_token?.token_id ?? 0
  );

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
  const tokens = new Map<string, TokenType>();
  const tokensMetadata: StringRecord<TokenMetadata> = {};

  const registerToken = ({
    address,
    id,
    metadata,
  }: {
    address: string;
    id: number | string;
    metadata: Omit<TokenMetadata, "address" | "id">;
  }) => {
    const tokenId = String(id);
    const slug = toTokenSlug(address, tokenId);

    tokens.set(slug, { contract: address, id: tokenId });
    tokensMetadata[slug] = {
      ...metadata,
      address,
      id: tokenId,
    };
  };

  assets.forEach((asset) => {
    const marketAsset = createMarketAsset(asset);
    const [, rwaTokenId = "0"] = fromAssetSlug(marketAsset.slug);
    const quoteToken = asset.orderbook.quote_token;
    const quoteTokenId = String(quoteToken.token_id);
    const currencyKey = quoteToken.currency_name ?? quoteToken.symbol;

    markets.set(marketAsset.slug, marketAsset);
    marketsArr.push(marketAsset);
    sortedMarketAddresses.push(marketAsset.slug);

    registerToken({
      address: asset.asset.token.address,
      id: rwaTokenId,
      metadata: {
        decimals: asset.asset.token.decimals,
        name: asset.asset.token.name,
        symbol: asset.asset.token.symbol,
        thumbnailUri: asset.asset.token.icon_url,
      },
    });

    registerToken({
      address: quoteToken.address,
      id: quoteTokenId,
      metadata: {
        decimals: quoteToken.decimals,
        name: quoteToken.symbol,
        symbol: quoteToken.symbol,
      },
    });

    orderbook.set(asset.orderbook.address, {
      address: asset.orderbook.address,
      rwaTokenAddress: asset.asset.token.address,
      rwaTokenId,
      rwaTokenDecimals: asset.asset.token.decimals,
      rwaTokenSymbol: asset.asset.token.symbol,
      buyOrderFee: asset.orderbook.buy_order_fee,
      sellOrderFee: asset.orderbook.sell_order_fee,
      minBuyOrderAmount: asset.orderbook.min_buy_order_amount ?? undefined,
      minBuyOrderValue: asset.orderbook.min_buy_order_value ?? undefined,
      minSellOrderAmount: asset.orderbook.min_sell_order_amount ?? undefined,
      minSellOrderValue: asset.orderbook.min_sell_order_value ?? undefined,
      minExpiryTime: asset.orderbook.min_expiry_time ?? undefined,
      currencies: [
        {
          currencyKey,
          token: {
            address: asset.orderbook.quote_token.address,
            token_id: quoteTokenId,
            decimals: quoteToken.decimals,
            symbol: quoteToken.symbol,
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
    tokens: Array.from(tokens.values()),
    tokensMetadata,
  };
};
