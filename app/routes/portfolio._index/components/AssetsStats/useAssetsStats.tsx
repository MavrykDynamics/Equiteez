import { useMemo } from "react";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { PortfolioAsset } from "~/routes/portfolio._index/components/AssetsStats/types";
import {
  WalletRwaAssetType,
  WalletTokenType,
} from "~/lib/apis/rwa/wallet/wallet.types";

function getTokenAssets(
  tokens?: Record<string, WalletTokenType>
): PortfolioAsset[] {
  const tokenEntries = Object.entries(tokens ?? {});

  if (!tokenEntries.length) {
    return [];
  }

  return tokenEntries.map(([symbol, token]) => {
    return {
      amount: token.total_value,
      averagePrice: token.price_per_token,
      changePercentage: 2, // TODO remove mock data
      iconUrl: "", // TODO remove mock data
      id: symbol, // TODO remove mock data
      name: symbol, // TODO remove mock data
      price: token.price_per_token, // TODO need to check it
      profit: null, // TODO remove mock data
      quantity: token.total_balance,
      symbol: symbol,
      value: token.total_value,
      yield: null,
    };
  });
}

function getRwaAssets(
  rwaAssets: Record<string, WalletRwaAssetType> | undefined,
  assetsByAddress: Map<string, { icon?: string; name: string; symbol: string }>
): PortfolioAsset[] {
  return Object.values(rwaAssets ?? {}).map((walletAsset) => {
    const assetDetails = assetsByAddress.get(walletAsset.address);

    return {
      amount: walletAsset.total_value,
      averagePrice: walletAsset.price_per_token,
      changePercentage: 12, // TODO remove mock data
      iconUrl: assetDetails?.icon,
      id: walletAsset.address,
      name: assetDetails?.name ?? "",
      price: walletAsset.price_per_token,
      profit: -6.3, // TODO remove mock data
      quantity: walletAsset.total_balance,
      symbol: assetDetails?.symbol ?? "",
      value: walletAsset.total_value,
      yield: 4, // TODO remove mock data
    };
  });
}

export function useAssetsStats() {
  const { assets } = useAssetsContext();
  const { wallet } = usePortfolioContext();

  const assetsByAddress = useMemo(
    () =>
      new Map(
        assets.map((asset) => [
          asset.address,
          {
            icon: asset.metadata.icon ?? asset.profile.image_url,
            name: asset.metadata.name,
            symbol: asset.metadata.symbol,
          },
        ])
      ),
    [assets]
  );

  const portfolioAssets = useMemo(
    () => [
      ...getTokenAssets(wallet?.tokens),
      ...getRwaAssets(wallet?.rwa_assets, assetsByAddress),
    ],
    [assetsByAddress, wallet?.rwa_assets, wallet?.tokens]
  );

  return {
    portfolioAssets,
    assetsByAddress,
  };
}
