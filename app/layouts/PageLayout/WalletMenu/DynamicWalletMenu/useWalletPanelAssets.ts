/**
 * The assets the email wallet panel lists: the same ones the Portfolio page
 * shows (the RWA portfolio endpoint), grouped as MVRK, EQTZ assets and listed
 * stablecoins.
 */
import { useMemo } from "react";
import BigNumber from "bignumber.js";

import { stablecoinContract } from "~/consts/contracts";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { toTokenSlug } from "~/lib/assets";
import {
  MVRK_ASSET_SLUG,
  MVRK_CONTRACT_ADDRESS,
  MVRK_METADATA,
  type TokenMetadata,
} from "~/lib/metadata";
import { createFallbackTokenMetadata } from "~/lib/metadata/defaults";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";

export type WalletPanelAssetKind = "native" | "eqtz" | "stablecoin";

export type WalletPanelAsset = {
  kind: WalletPanelAssetKind;
  metadata: TokenMetadata;
  /** For AssetIcon: "mav" for MVRK, the token slug otherwise */
  iconSlug: string;
  /** The slug WithdrawFlow uses for this asset */
  tokenSlug: string;
  balance: BigNumber;
  valueUsd: BigNumber | null;
  priceUsd: BigNumber | null;
};

const STABLECOIN_ADDRESSES = new Set([
  stablecoinContract,
  USDT_BRIDGE.destinationToken.address,
]);

const KIND_ORDER: Record<WalletPanelAssetKind, number> = {
  native: 0,
  eqtz: 1,
  stablecoin: 2,
};

const getKind = (address: string): WalletPanelAssetKind =>
  address === MVRK_CONTRACT_ADDRESS
    ? "native"
    : STABLECOIN_ADDRESSES.has(address)
      ? "stablecoin"
      : "eqtz";

const toFiniteOrNull = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value)
    ? new BigNumber(value)
    : null;

export function useWalletPanelAssets() {
  const { portfolio, isPortfolioLoading } = usePortfolioContext();
  const { tokensMetadata } = useTokensContext();

  const assets = useMemo<WalletPanelAsset[]>(() => {
    const metadataByAddress = new Map(
      Object.values(tokensMetadata).map((metadata) => [
        metadata.address,
        metadata,
      ])
    );
    const seen = new Set<string>();

    return (portfolio?.assets ?? [])
      .reduce<WalletPanelAsset[]>((result, asset) => {
        const kind = getKind(asset.token_address);
        const metadata =
          kind === "native"
            ? MVRK_METADATA
            : (metadataByAddress.get(asset.token_address) ??
              createFallbackTokenMetadata({
                address: asset.token_address,
                name: asset.name,
                symbol: asset.symbol,
                thumbnailUri: asset.icon ?? undefined,
              }));
        const tokenSlug = toTokenSlug(metadata.address, metadata.id);

        if (seen.has(tokenSlug)) return result;
        seen.add(tokenSlug);

        result.push({
          kind,
          metadata,
          iconSlug: kind === "native" ? MVRK_ASSET_SLUG : tokenSlug,
          tokenSlug,
          balance: toFiniteOrNull(asset.balance) ?? new BigNumber(0),
          valueUsd: toFiniteOrNull(asset.value),
          priceUsd: toFiniteOrNull(asset.price),
        });

        return result;
      }, [])
      .sort(
        (left, right) =>
          KIND_ORDER[left.kind] - KIND_ORDER[right.kind] ||
          (right.valueUsd ?? new BigNumber(0)).comparedTo(
            left.valueUsd ?? new BigNumber(0)
          )
      );
  }, [portfolio?.assets, tokensMetadata]);

  return { assets, isLoading: isPortfolioLoading };
}
