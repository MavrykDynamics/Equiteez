import { describe, expect, it } from "vitest";

import {
  base58ByteLength,
  getIntentNetwork,
  getRefundAddressError,
  INTENT_NETWORKS,
  isSameNetworkAddress,
  normalizeRefundAddress,
} from "./intentNetworks";

const net = (key: string) => getIntentNetwork(key)!;
const valid = (key: string, address: string) =>
  getRefundAddressError(net(key), address) === null;

describe("intent networks", () => {
  it("covers the twelve backend networks", () => {
    expect(INTENT_NETWORKS.map((network) => network.key).sort()).toEqual(
      [
        "arb",
        "aptos",
        "avax",
        "base",
        "bsc",
        "btc",
        "eth",
        "gnosis",
        "near",
        "op",
        "pol",
        "sol",
      ].sort()
    );
    expect(net("arb")).toMatchObject({ family: "evm", evmChainId: 42161 });
    expect(net("sol")).toMatchObject({ family: "solana", evmChainId: null });
  });

  it("validates EVM refund addresses with EIP-55 for mixed case", () => {
    expect(valid("eth", "0x52908400098527886e0f7030069857d2e4169ee7")).toBe(
      true
    );
    expect(valid("eth", "0x52908400098527886E0F7030069857D2E4169EE7")).toBe(
      true
    );
    expect(valid("eth", "0x52908400098527886E0F7030069857D2E4169Ee7")).toBe(
      false
    );
    expect(valid("eth", `0x${"0".repeat(40)}`)).toBe(false);
    expect(valid("eth", "0x1234")).toBe(false);
  });

  it("validates Solana, NEAR, Aptos and Bitcoin formats", () => {
    expect(valid("sol", "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm")).toBe(
      true
    );
    expect(valid("sol", "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopz")).toBe(false);
    expect(valid("sol", "0OIl")).toBe(false);
    expect(valid("near", "alice.near")).toBe(true);
    expect(valid("near", "a".repeat(64).replace(/a/g, "f"))).toBe(true);
    expect(valid("near", "Alice.near")).toBe(false);
    expect(valid("near", "a")).toBe(false);
    expect(valid("aptos", `0x${"a".repeat(64)}`)).toBe(true);
    expect(valid("aptos", "0x1")).toBe(false);
    expect(valid("btc", "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq")).toBe(
      true
    );
    expect(valid("btc", "BC1QAR0SRRR7XFKVY5L643LYDNW9RE59GTZZWF5MDQ")).toBe(
      true
    );
    expect(valid("btc", "bc1qAR0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq")).toBe(
      false
    );
    expect(valid("btc", "1BoatSLRHtKNngkdXEeobR76b53LETtpyT")).toBe(true);
    expect(valid("btc", "tb1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq")).toBe(
      false
    );
  });

  it("normalizes and compares addresses per family", () => {
    expect(normalizeRefundAddress(net("eth"), " 0xABC ")).toBe("0xabc");
    expect(normalizeRefundAddress(net("btc"), "BC1QXYZ")).toBe("bc1qxyz");
    expect(normalizeRefundAddress(net("sol"), " EKpQ ")).toBe("EKpQ");
    expect(
      isSameNetworkAddress(
        net("eth"),
        "0x52908400098527886E0F7030069857D2E4169EE7",
        "0x52908400098527886e0f7030069857d2e4169ee7"
      )
    ).toBe(true);
    expect(isSameNetworkAddress(net("sol"), "EKpQ", "ekpq")).toBe(false);
  });

  it("decodes base58 byte lengths with leading zeros", () => {
    expect(base58ByteLength("11111111111111111111111111111111")).toBe(32);
    expect(base58ByteLength("0")).toBeNull();
  });

  it("builds explorer links per network", () => {
    expect(net("sol").explorer.tx("sig")).toBe("https://solscan.io/tx/sig");
    expect(net("base").explorer.address("0xabc")).toBe(
      "https://basescan.org/address/0xabc"
    );
  });
});
