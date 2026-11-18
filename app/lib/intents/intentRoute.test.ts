import { BigNumber } from "bignumber.js";
import { describe, expect, it } from "vitest";
import { arbitrumSepolia, sepolia } from "wagmi/chains";

import {
  INTENTS_BRIDGE_PAIRS,
  MOCK_INTENT_SOURCE_ASSETS,
} from "~/consts/intents";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
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
    sourceAssets: MOCK_INTENT_SOURCE_ASSETS,
    bridgePairs: INTENTS_BRIDGE_PAIRS,
    chains: [arbitrumSepolia, sepolia],
    ...extra,
  });

describe("resolveIntentRoute", () => {
  it("joins the catalog with approved source assets and the bridge pair", () => {
    expect(fixtureOption.availability).toBe("available");
    expect(fixtureOption.source).toMatchObject({
      symbol: "USDT",
      token: "0x5C05e82bE66B19476bAcb558E62e7d449b98635F",
      chainName: "Arbitrum Sepolia",
    });
    expect(fixtureOption.destination).toMatchObject({
      tokenAddress: "KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE",
      tokenId: "0",
      symbol: "wUSDT",
      decimals: 6,
    });
    expect(getIntentRouteLabel(fixtureOption)).toBe("USDT on Arbitrum Sepolia");
  });

  it("never guesses a source asset that is not approved", () => {
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
  it("validates in raw units against inclusive bounds", () => {
    expect(getIntentAmountError(fixtureOption, new BigNumber(1))).toBeNull();
    expect(
      getIntentAmountError(fixtureOption, new BigNumber(10_000))
    ).toBeNull();
    expect(getIntentAmountError(fixtureOption, new BigNumber(0.5))).toMatch(
      /Minimum deposit is 1 USDT/
    );
    expect(
      getIntentAmountError(
        fixtureOption,
        new BigNumber("10000.000000000000000001")
      )
    ).toMatch(/Maximum deposit/);
    expect(
      getIntentAmountError(fixtureOption, new BigNumber(5), new BigNumber(4))
    ).toBe("Insufficient USDT balance.");
    expect(
      getIntentAmountError(
        fixtureOption,
        new BigNumber("1.0000000000000000001")
      )
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
    expect(getIntentSlippageError(fixtureOption, 300)).toBeNull();
    expect(getIntentSlippageError(fixtureOption, 301)).toMatch(/at most 3%/);
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
