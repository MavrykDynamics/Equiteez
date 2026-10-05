import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderbookExecutionConfig } from "~/lib/orderbook/orderbookConfig.types";
const { useAssetMetadata } = vi.hoisted(() => ({ useAssetMetadata: vi.fn() }));
vi.mock("~/lib/metadata", async (importOriginal) => ({
  ...(await importOriginal<typeof import("~/lib/metadata")>()),
  useAssetMetadata,
}));
import { useOrderbookTokenMetadata } from "./useOrderbookTokenMetadata";
const asset = {
  address: "base",
  metadata: { decimals: 8, name: "Display name", symbol: "BASE" },
  orderbook: {
    quote_token: {
      address: "quote",
      token_id: 7,
      decimals: 2,
      symbol: "QUOTE",
    },
  },
} as AssetType;
const config = {
  baseTokenAddress: "base",
  rwaTokenId: "19",
  quoteTokenAddress: "quote",
  quoteTokenId: "7",
} as OrderbookExecutionConfig;
beforeEach(() => {
  useAssetMetadata.mockReset();
});
describe("selected pair metadata", () => {
  it("uses verified local metadata when lookup is missing and preserves full slugs", () => {
    const data = useOrderbookTokenMetadata(asset, config);
    expect(data.isMetadataLoaded).toBe(true);
    expect(data.baseTokenMetadata.id).toBe("19");
    expect(data.quoteTokenMetadata.id).toBe("7");
    expect(data.quoteTokenDecimals).toBe(2);
    expect(data.baseTokenDecimals).toBe(8);
    expect(useAssetMetadata).toHaveBeenCalledWith(data.baseTokenSlug);
    expect(useAssetMetadata).toHaveBeenCalledWith(data.quoteTokenSlug);
  });
  it("uses token-provider names without treating display differences as mismatches", () => {
    useAssetMetadata.mockReturnValueOnce({
      address: "base",
      id: "19",
      decimals: 8,
      name: "Canonical Token",
      symbol: "BASE",
    });
    expect(useOrderbookTokenMetadata(asset, config).isMetadataLoaded).toBe(
      true
    );
  });
  it.each([
    { id: "0", decimals: 8 },
    { id: "19", decimals: 6 },
  ])("blocks authoritative metadata mismatch %j", (values) => {
    useAssetMetadata.mockReturnValueOnce({
      address: "base",
      name: "Base",
      symbol: "BASE",
      ...values,
    });
    expect(useOrderbookTokenMetadata(asset, config).isMetadataLoaded).toBe(
      false
    );
  });
  it("never authorizes orders using missing or invalid catalog decimals", () => {
    expect(
      useOrderbookTokenMetadata(
        { ...asset, metadata: { ...asset.metadata, decimals: NaN } },
        config
      ).isMetadataLoaded
    ).toBe(false);
  });
});
