import { useMemo } from "react";
import { toTokenSlug } from "~/lib/assets";
import type { TokenMetadata } from "~/lib/metadata";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";

export type WithdrawableAsset = {
  availableBalance: number;
  metadata: TokenMetadata;
  priceUsd: number;
  tokenSlug: string;
};

export function useWithdrawableAssets() {
  const { portfolio, isLoading: isPortfolioLoading } = usePortfolioContext();
  const { isLoading: isTokensLoading, tokensMetadata } = useTokensContext();

  const assets = useMemo<WithdrawableAsset[]>(() => {
    const seenAssets = new Set<string>();
    const metadataByAddress = Object.values(tokensMetadata).reduce<
      Record<string, TokenMetadata>
    >((result, metadata) => {
      result[metadata.address] = metadata;
      return result;
    }, {});

    const portfolioAssets = portfolio?.assets ?? [];

    return portfolioAssets
      .reduce<WithdrawableAsset[]>((result, portfolioAsset) => {
        const metadata = metadataByAddress[portfolioAsset.token_address];

        if (!metadata) {
          return result;
        }

        const tokenSlug = toTokenSlug(metadata.address, metadata.id);

        if (seenAssets.has(tokenSlug)) return result;
        seenAssets.add(tokenSlug);

        const availableBalance = portfolioAsset.balance ?? 0;
        const priceUsd = portfolioAsset.price;

        if (!availableBalance) {
          return result;
        }

        result.push({
          availableBalance,
          metadata,
          priceUsd,
          tokenSlug,
        });

        return result;
      }, [])
      .sort((left, right) => {
        return left.availableBalance - right.availableBalance;
      });
  }, [portfolio?.assets, tokensMetadata]);

  return {
    assets,
    isLoading: isPortfolioLoading || isTokensLoading,
  };
}
