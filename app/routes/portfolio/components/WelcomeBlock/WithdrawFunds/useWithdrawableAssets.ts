import { useMemo } from "react";
import BigNumber from "bignumber.js";

import { toTokenSlug } from "~/lib/assets";
import type { TokenMetadata } from "~/lib/metadata";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { useCurrencyContext } from "~/providers/CurrencyProvider/currency.provider";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";

export type WithdrawableAsset = {
  availableBalance: BigNumber;
  availableBalanceUsd: BigNumber | null;
  metadata: TokenMetadata;
  priceUsd: BigNumber | null;
  tokenSlug: string;
};

export function useWithdrawableAssets() {
  const { wallet, portfolio, isLoading: isPortfolioLoading } =
    usePortfolioContext();
  const { usdToTokenRates } = useCurrencyContext();
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

        const walletAsset = wallet?.rwa_assets[metadata.address];
        const availableBalance = walletAsset
          ? new BigNumber(walletAsset.available_balance)
          : Number.isFinite(portfolioAsset.balance)
            ? new BigNumber(portfolioAsset.balance)
            : new BigNumber(0);
        const portfolioValue = Number.isFinite(portfolioAsset.value)
          ? new BigNumber(portfolioAsset.value)
          : null;
        const portfolioPrice = Number.isFinite(portfolioAsset.price)
          ? new BigNumber(portfolioAsset.price)
          : null;
        const currencyPrice = new BigNumber(usdToTokenRates[tokenSlug] ?? 0);
        const usdPrice =
          portfolioPrice?.isFinite() && portfolioPrice.gt(0)
            ? portfolioPrice
            : availableBalance.isFinite() &&
                availableBalance.gt(0) &&
                portfolioValue
              ? portfolioValue.div(availableBalance)
              : currencyPrice.isFinite() && currencyPrice.gt(0)
                ? currencyPrice
                : null;

        if (!availableBalance.isFinite() || availableBalance.lte(0)) {
          return result;
        }

        result.push({
          availableBalance,
          availableBalanceUsd:
            portfolioValue ?? usdPrice?.times(availableBalance) ?? null,
          metadata,
          priceUsd: usdPrice,
          tokenSlug,
        });

        return result;
      }, [])
      .sort((left, right) => {
        const leftValue = left.availableBalanceUsd ?? new BigNumber(0);
        const rightValue = right.availableBalanceUsd ?? new BigNumber(0);

        return rightValue.comparedTo(leftValue);
      });
  }, [portfolio?.assets, tokensMetadata, usdToTokenRates, wallet?.rwa_assets]);

  return {
    assets,
    isLoading: isPortfolioLoading || isTokensLoading,
  };
}
