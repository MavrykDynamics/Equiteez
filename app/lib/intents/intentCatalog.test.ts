import { BigNumber } from "bignumber.js";
import { describe, expect, it } from "vitest";

import type { IntentMetadata } from "~/lib/apis/intents";
import { mockIntentMetadata } from "~/lib/apis/intents/intents.mock";
import {
  getIntentAmountError,
  getIntentSlippageError,
  isIntentRecipient,
  resolveIntentCatalog,
  toRawAmount,
} from "./intentCatalog";
import { fixtureOption, fixtureRecipient } from "./intents.fixtures";

const resolve = (patch: Partial<IntentMetadata> = {}) =>
  resolveIntentCatalog({ ...mockIntentMetadata, ...patch });

describe("resolveIntentCatalog", () => {
  it("offers the default settlement token and assets on known networks", () => {
    const catalog = resolve();
    expect(catalog.status).toBe("available");
    expect(catalog.settlement).toMatchObject({
      id: "usdt0-arbitrum",
      version: 1,
      symbol: "USDT0",
      decimals: 6,
      destination: {
        tokenAddress: "KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE",
        tokenId: "0",
        symbol: "wUSDT",
        decimals: 6,
      },
    });
    const networks = catalog.options.map((option) => option.network.key);
    expect(networks).toContain("sol");
    expect(networks).toContain("btc");
    expect(networks).toContain("near");
    expect(networks).toContain("aptos");
    // The unknown "tron" network is hidden.
    expect(networks).not.toContain("tron");
  });

  it("marks EVM assets a connected wallet can send", () => {
    const options = resolve().options;
    const byId = (id: string) => options.find((o) => o.assetId === id)!;
    expect(byId("nep141:eth.omft.near").evmToken).toBe("native");
    expect(fixtureOption.evmToken).toBe(
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
    );
    expect(byId("nep141:sol.omft.near").evmToken).toBeUndefined();
    expect(byId("nep141:zec.omft.near").evmToken).toBeUndefined();
  });

  it("hides incoherent assets and the settlement token itself", () => {
    const [sol, , eth] = mockIntentMetadata.sourceAssets;
    const settlementAsset =
      mockIntentMetadata.settlementTokens[0].settlementAsset;
    const catalog = resolve({
      sourceAssets: [
        { ...eth, evmChainId: "137" },
        { ...sol, family: "evm" },
        { ...sol, kind: "UNKNOWN" },
        {
          ...eth,
          assetId: settlementAsset.assetId,
          network: "arb",
          evmChainId: "42161",
        },
      ],
    });
    expect(catalog.options).toHaveLength(0);
    expect(catalog.status).toBe("no_assets");
  });

  it("never falls back to another settlement token", () => {
    expect(resolve({ defaultSettlementToken: null }).status).toBe(
      "no_settlement_token"
    );
    expect(
      resolve({
        defaultSettlementToken: {
          settlementTokenId: "usdt0-arbitrum",
          settlementTokenVersion: 2,
        },
      }).status
    ).toBe("no_settlement_token");
  });

  it("reports pause, stale catalog and disabled previews", () => {
    expect(resolve({ admissionPaused: true }).status).toBe("paused");
    expect(resolve({ catalog: { fetchedAt: null, stale: true } }).status).toBe(
      "stale"
    );
    expect(
      resolve({
        settlementTokens: [
          {
            ...mockIntentMetadata.settlementTokens[0],
            previewSupported: false,
          },
        ],
      }).status
    ).toBe("preview_unavailable");
  });

  it("uses Equiteez token metadata for the destination and checks decimals", () => {
    const named = resolveIntentCatalog(mockIntentMetadata, {
      getDestinationMetadata: () => ({ decimals: 6, symbol: "USDT" }),
    });
    expect(named.settlement?.destination.symbol).toBe("USDT");
    expect(
      resolveIntentCatalog(mockIntentMetadata, {
        getDestinationMetadata: () => ({ decimals: 18 }),
      }).status
    ).toBe("token_mismatch");
  });
});

describe("form checks", () => {
  it("validates amounts in raw units without backend limits", () => {
    expect(getIntentAmountError(fixtureOption, undefined)).toBe(
      "Enter an amount."
    );
    expect(
      getIntentAmountError(fixtureOption, new BigNumber("1.1234567"))
    ).toMatch(/up to 6 decimal places/);
    expect(
      getIntentAmountError(fixtureOption, new BigNumber(10), new BigNumber(5))
    ).toBe("Insufficient USDC balance.");
    expect(
      getIntentAmountError(fixtureOption, new BigNumber(1_000_000))
    ).toBeNull();
    expect(toRawAmount(new BigNumber("1.5"), 9)).toBe("1500000000");
  });

  it("accepts only mv1 recipients and slippage from 0 to 9999 bps", () => {
    expect(isIntentRecipient(fixtureRecipient)).toBe(true);
    expect(isIntentRecipient("KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE")).toBe(
      false
    );
    expect(getIntentSlippageError(0)).toBeNull();
    expect(getIntentSlippageError(10_000)).not.toBeNull();
  });
});
