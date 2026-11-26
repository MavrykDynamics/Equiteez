import { describe, expect, it } from "vitest";

import {
  fixtureCatalog,
  fixtureNativeOption,
  fixtureOption,
  fixtureSolanaOption,
} from "~/lib/intents/intents.fixtures";
import {
  getIntentTokenSubtitle,
  getIntentTokenTitle,
  groupIntentNetworks,
} from "./intentPickers";

describe("groupIntentNetworks", () => {
  it("groups assets by network in the static table order, EVM first", () => {
    const groups = groupIntentNetworks(fixtureCatalog.options);
    expect(groups.map((group) => group.network.key)).toEqual([
      "eth",
      "arb",
      "base",
      "sol",
      "near",
      "aptos",
      "btc",
    ]);
    const near = groups.find((group) => group.network.key === "near")!;
    expect(near.symbols).toEqual(["NEAR", "ZEC"]);
    expect(near.options).toHaveLength(2);
  });

  it("leaves out networks without assets", () => {
    const groups = groupIntentNetworks([fixtureSolanaOption]);
    expect(groups).toHaveLength(1);
    expect(groups[0].network.name).toBe("Solana");
  });
});

describe("token labels", () => {
  it("tells duplicate symbols on one network apart by contract", () => {
    const twin = {
      ...fixtureOption,
      assetId: "nep141:base-other.omft.near",
      asset: {
        ...fixtureOption.asset,
        assetId: "nep141:base-other.omft.near",
        contractAddress: "0x9999999999999999999999999999999999999999",
      },
    };
    expect(getIntentTokenTitle(fixtureOption, [fixtureOption])).toBe("USDC");
    expect(getIntentTokenTitle(twin, [fixtureOption, twin])).toBe(
      "USDC (0x9999…9999)"
    );
  });

  it("marks native assets", () => {
    expect(getIntentTokenSubtitle(fixtureNativeOption)).toBe(
      "Ethereum · native"
    );
    expect(getIntentTokenSubtitle(fixtureOption)).toBe("Base");
  });
});
