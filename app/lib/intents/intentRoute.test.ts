import { BigNumber } from "bignumber.js";
import { describe, expect, it } from "vitest";
import { arbitrumSepolia, sepolia } from "wagmi/chains";

import { INTENTS_BRIDGE_PAIRS } from "~/consts/intents";
import {
  mockIntentMetadata,
  mockIntentRoutes,
} from "~/lib/apis/intents/intents.mock";
import { fixtureOption, fixtureRoute } from "./intents.fixtures";
import {
  getIntentAmountError,
  getIntentRouteLabel,
  getIntentSlippageChoices,
  getIntentSlippageError,
  isIntentRecipient,
  resolveIntentRoute,
  toRawAmount,
} from "./intentRoute";

const resolve = (
  route = fixtureRoute,
  extra: Partial<Parameters<typeof resolveIntentRoute>[1]> = {}
) =>
  resolveIntentRoute(route, {
    metadata: mockIntentMetadata,
    bridgePairs: INTENTS_BRIDGE_PAIRS,
    chains: [arbitrumSepolia, sepolia],
    ...extra,
  });

describe("resolveIntentRoute", () => {
  it("joins the catalog with its metadata source asset and the bridge pair", () => {
    expect(fixtureOption.availability).toBe("available");
    expect(fixtureOption.hasDepositRegistration).toBe(true);
    expect(fixtureOption.source).toMatchObject({
      symbol: "Mock USDT",
      token: "0x5C05e82bE66B19476bAcb558E62e7d449b98635F",
      chainName: "Arbitrum Sepolia",
    });
    expect(fixtureOption.destination).toMatchObject({
      tokenAddress: "KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE",
      tokenId: "0",
      symbol: "wUSDT",
      decimals: 6,
    });
    expect(getIntentRouteLabel(fixtureOption)).toBe(
      "Mock USDT on Arbitrum Sepolia"
    );
  });

  it("never guesses a source asset without metadata", () => {
    const option = resolve(mockIntentRoutes[2]);
    expect(option.availability).toBe("not_configured");
    expect(option.source).toBeUndefined();
    expect(getIntentRouteLabel(option)).toBe("Route mock-base-sepolia-usdc");
  });

  it.each([
    ["disabled", { enabled: false }],
    [
      "unsupported_destination",
      { bridgeAddress: "0x9999999999999999999999999999999999999999" },
    ],
    ["unsupported_destination", { settlementChainId: "1" }],
    ["token_mismatch", { settlementDecimals: 6 }],
    ["token_mismatch", { sourceDecimals: 6 }],
  ] as const)("is %s for %o", (availability, patch) => {
    expect(
      resolve({ ...fixtureRoute, ...(patch as object) }).availability
    ).toBe(availability);
  });

  it("disables every route without metadata", () => {
    expect(resolve(fixtureRoute, { metadata: null }).availability).toBe(
      "not_configured"
    );
  });

  it("pauses new transfers while admission is paused", () => {
    expect(
      resolve(fixtureRoute, {
        metadata: { ...mockIntentMetadata, admissionPaused: true },
      }).availability
    ).toBe("paused");
  });

  it("needs a quote preview for provider routes", () => {
    expect(resolve(mockIntentRoutes[1]).availability).toBe("preview_required");
  });

  const withMeta = (
    patch: Partial<(typeof mockIntentMetadata.routes)[number]>
  ) => ({
    metadata: {
      ...mockIntentMetadata,
      routes: [{ ...mockIntentMetadata.routes[0], ...patch }],
    },
  });

  it("requires connected-wallet registration on rehearsal routes", () => {
    expect(
      resolve(fixtureRoute, withMeta({ depositRegistrationSupported: false }))
        .availability
    ).toBe("registration_unsupported");
  });

  it.each([
    [
      "token_mismatch",
      {
        destinationAsset: {
          ...mockIntentMetadata.routes[0].destinationAsset,
          contractAddress: "KT1Other",
        },
      },
    ],
    [
      "token_mismatch",
      {
        settlementAsset: {
          ...mockIntentMetadata.routes[0].settlementAsset,
          decimals: 6,
        },
      },
    ],
    [
      "not_configured",
      {
        sourceAsset: {
          ...mockIntentMetadata.routes[0].sourceAsset,
          assetId: "other",
        },
      },
    ],
    [
      "not_configured",
      {
        sourceAsset: {
          ...mockIntentMetadata.routes[0].sourceAsset,
          kind: "UNKNOWN" as const,
        },
      },
    ],
    ["not_configured", { routeVersion: 2 }],
  ] as const)("is %s when metadata disagrees (%#)", (availability, patch) => {
    expect(resolve(fixtureRoute, withMeta(patch)).availability).toBe(
      availability
    );
  });

  it("is unsupported without a funding adapter for the chain", () => {
    expect(resolve(fixtureRoute, { chains: [sepolia] }).availability).toBe(
      "unsupported_chain"
    );
  });

  it("is disabled when Equiteez token metadata disagrees on decimals", () => {
    expect(
      resolve(fixtureRoute, {
        getDestinationMetadata: () => ({ decimals: 18 }),
      }).availability
    ).toBe("token_mismatch");
  });
});

describe("amounts and inputs", () => {
  // A route with a range, to exercise the bounds (the mock route is fixed).
  const wideOption = {
    ...fixtureOption,
    route: {
      ...fixtureRoute,
      maxAmountIn: "10000000000000000000000",
      maxSlippageBps: 300,
    },
  };

  it("validates in raw units against inclusive bounds", () => {
    expect(getIntentAmountError(wideOption, new BigNumber(1))).toBeNull();
    expect(getIntentAmountError(wideOption, new BigNumber(10_000))).toBeNull();
    expect(getIntentAmountError(wideOption, new BigNumber(0.5))).toMatch(
      /Minimum deposit is 1 Mock USDT/
    );
    expect(
      getIntentAmountError(
        wideOption,
        new BigNumber("10000.000000000000000001")
      )
    ).toMatch(/Maximum deposit/);
    expect(
      getIntentAmountError(wideOption, new BigNumber(5), new BigNumber(4))
    ).toBe("Insufficient Mock USDT balance.");
    expect(
      getIntentAmountError(wideOption, new BigNumber("1.0000000000000000001"))
    ).toMatch(/18 decimal places/);
  });

  it("converts without floating point", () => {
    expect(toRawAmount(new BigNumber("1.000000000000000001"), 18)).toBe(
      "1000000000000000001"
    );
  });

  it("accepts only canonical mv1 recipients", () => {
    expect(isIntentRecipient("mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt")).toBe(
      true
    );
    expect(isIntentRecipient("mv29MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt")).toBe(
      false
    );
    expect(isIntentRecipient("mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGW0")).toBe(
      false
    );
    expect(isIntentRecipient(null)).toBe(false);
  });

  it("limits slippage to the route maximum", () => {
    expect(getIntentSlippageError(wideOption, 300)).toBeNull();
    expect(getIntentSlippageError(wideOption, 301)).toMatch(/at most 3%/);
    expect(getIntentSlippageError(fixtureOption, 0)).toBeNull();
    expect(getIntentSlippageError(fixtureOption, 10)).toMatch(/at most 0%/);
  });
});

describe("getIntentSlippageChoices", () => {
  it("hides choices above the route maximum", () => {
    expect(getIntentSlippageChoices(100)).toEqual([10, 50, 100]);
    expect(getIntentSlippageChoices(50)).toEqual([10, 50]);
  });

  it("offers the route maximum when it is below every choice", () => {
    expect(getIntentSlippageChoices(5)).toEqual([5]);
  });
});
