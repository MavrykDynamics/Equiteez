import { useMemo } from "react";
import BigNumber from "bignumber.js";

import { toTokenSlug } from "~/lib/assets";
import type { TokenMetadata } from "~/lib/metadata";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { useCurrencyContext } from "~/providers/CurrencyProvider/currency.provider";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

export type WithdrawableAsset = {
  availableBalance: BigNumber;
  availableBalanceUsd: BigNumber | null;
  metadata: TokenMetadata;
  tokenSlug: string;
};

export function useWithdrawableAssets() {
  const { wallet, isLoading: isWalletLoading } = usePortfolioContext();
  const { usdToTokenRates } = useCurrencyContext();
  const { isLoading: isTokensLoading, tokensMetadata } = useTokensContext();
  const { isLoading: isUserLoading, userTokensBalances } = useUserContext();

  const assets = useMemo<WithdrawableAsset[]>(() => {
    const seenAssets = new Set<string>();

    return Object.values(tokensMetadata)
      .reduce<WithdrawableAsset[]>((result, metadata) => {
        const tokenSlug = toTokenSlug(metadata.address, metadata.id);

        if (seenAssets.has(tokenSlug)) return result;
        seenAssets.add(tokenSlug);

        const onChainBalance =
          userTokensBalances[tokenSlug] ??
          userTokensBalances[metadata.address] ??
          new BigNumber(0);
        const portfolioAsset = wallet?.rwa_assets[metadata.address];
        const availableBalance = portfolioAsset
          ? new BigNumber(portfolioAsset.available_balance)
          : onChainBalance;
        const portfolioPrice = portfolioAsset
          ? new BigNumber(portfolioAsset.price_per_token)
          : null;
        const currencyPrice = new BigNumber(usdToTokenRates[tokenSlug] ?? 0);
        const usdPrice = portfolioPrice?.isFinite() && portfolioPrice.gt(0)
          ? portfolioPrice
          : currencyPrice.isFinite() && currencyPrice.gt(0)
            ? currencyPrice
            : null;

        if (!availableBalance.isFinite() || availableBalance.lte(0)) {
          return result;
        }

        result.push({
          availableBalance,
          availableBalanceUsd: usdPrice?.times(availableBalance) ?? null,
          metadata,
          tokenSlug,
        });

        return result;
      }, [])
      .sort((left, right) => {
        const leftValue = left.availableBalanceUsd ?? new BigNumber(0);
        const rightValue = right.availableBalanceUsd ?? new BigNumber(0);

        return rightValue.comparedTo(leftValue);
      });
  }, [tokensMetadata, usdToTokenRates, userTokensBalances, wallet?.rwa_assets]);

  return {
    assets,
    isLoading: isWalletLoading || isTokensLoading || isUserLoading,
  };
}
