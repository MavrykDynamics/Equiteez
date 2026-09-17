import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

export function useAssetPrice(asset: AssetType) {
  const { prices } = useAssetsContext();

  const assetPrices = prices[asset.address] ?? {};
  const points = assetPrices.series_1d?.points ?? [];

  const pointValues = points
    .map((point) => point.usd ?? point.p)
    .filter((value) => Number.isFinite(value));

  const priceChange = {
    amount: assetPrices.change_24h?.delta_abs ?? 0,
    percentage: assetPrices.change_24h?.change_pct ?? 0,
  };

  const price =
    assetPrices.usd ??
    assetPrices.price ??
    asset.stats?.price.usd ??
    asset.finance.value_per_token;

  const highPrice24h = pointValues.length ? Math.max(...pointValues) : price;
  const lowPrice24H = pointValues.length ? Math.min(...pointValues) : price;
  const isNegative = priceChange?.percentage < 0;

  return {
    assetPrices,
    price,
    priceChange,
    isNegative,
    highPrice24h,
    lowPrice24H,
    points,
  };
}
