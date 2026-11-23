import { describe, expect, it } from "vitest";

import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import { fixtureOption, resolveOption } from "~/lib/intents/intents.fixtures";
import {
  getIntentTokenTitle,
  getNetworkDefaultOption,
  groupIntentNetworks,
} from "./intentPickers";

const eth = resolveOption(mockIntentRoutes[1]);
const usdc = resolveOption(mockIntentRoutes[2]);

describe("groupIntentNetworks", () => {
  it("groups routes by source chain in catalog order", () => {
    const networks = groupIntentNetworks([fixtureOption, eth, usdc]);
    expect(networks.map((network) => network.chainId)).toEqual([
      "421614",
      "11155111",
      "84532",
    ]);
    expect(networks[0]).toMatchObject({
      name: "Arbitrum Sepolia",
      isAvailable: true,
      symbols: [fixtureOption.source!.symbol],
    });
  });

  it("marks networks without a usable route with the route's reason", () => {
    const [, sepolia, base] = groupIntentNetworks([fixtureOption, eth, usdc]);
    expect(sepolia.isAvailable).toBe(false);
    expect(sepolia.symbols).toEqual([]);
    expect(sepolia.unavailableReason).toContain("Quotes for this route");
    // No metadata: never named after a guessed ticker or chain.
    expect(base.name).toBe("Chain 84532");
    expect(base.unavailableReason).toContain("not enabled in Equiteez");
  });

  it("merges routes on the same chain and prefers an available default", () => {
    const blocked = { ...fixtureOption, availability: "paused" as const };
    const [network] = groupIntentNetworks([blocked, fixtureOption]);
    expect(network.options).toHaveLength(2);
    expect(network.isAvailable).toBe(true);
    expect(getNetworkDefaultOption(network)).toBe(fixtureOption);
  });
});

describe("getIntentTokenTitle", () => {
  it("uses the metadata symbol or the route id", () => {
    expect(getIntentTokenTitle(fixtureOption)).toBe(
      fixtureOption.source!.symbol
    );
    expect(getIntentTokenTitle(usdc)).toBe("Route mock-base-sepolia-usdc");
  });
});
