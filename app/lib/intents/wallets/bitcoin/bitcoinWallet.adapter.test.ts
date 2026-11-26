// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import {
  createBitcoinWalletAdapter,
  getBitcoinBalance,
} from "./bitcoinWallet.adapter";

const payment = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq";
const deposit = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
const btc = {
  kind: "native",
  contractAddress: null,
  symbol: "BTC",
  decimals: 8,
} as const;
const txid = "a".repeat(64);

function provider(overrides: Partial<Record<string, unknown>> = {}) {
  const calls: { method: string; params: unknown }[] = [];
  const replies: Record<string, unknown> = {
    getAccounts: {
      status: "success",
      result: [
        { address: "bc1pordinals", purpose: "ordinals" },
        { address: payment, purpose: "payment" },
      ],
    },
    sendTransfer: { status: "success", result: { txid } },
    ...overrides,
  };
  const call = vi.fn(() => async (method: string, params: unknown) => {
    calls.push({ method, params });
    const reply = replies[method];
    if (reply instanceof Error) throw reply;
    return reply;
  });
  return { call, calls };
}

describe("createBitcoinWalletAdapter", () => {
  it("connects the payment address and sends the exact amount in satoshis", async () => {
    const { call, calls } = provider();
    const adapter = createBitcoinWalletAdapter({}, call as never);
    await expect(
      adapter.connect("XverseProviders.BitcoinProvider")
    ).resolves.toMatchObject({ address: payment, walletName: "Xverse" });
    expect(await adapter.getAccount("XverseProviders.BitcoinProvider")).toBe(
      payment
    );
    await expect(
      adapter.send("XverseProviders.BitcoinProvider", {
        asset: btc,
        from: payment,
        to: deposit,
        amount: 150_000n,
      })
    ).resolves.toBe(txid);
    expect(calls.at(-1)).toEqual({
      method: "sendTransfer",
      params: { recipients: [{ address: deposit, amount: 150_000 }] },
    });
  });

  it("refuses testnet addresses and maps wallet errors", async () => {
    const testnet = provider({
      getAccounts: {
        status: "success",
        result: [{ address: "tb1qtestnetaddress", purpose: "payment" }],
      },
    });
    await expect(
      createBitcoinWalletAdapter({}, testnet.call as never).connect("unisat")
    ).rejects.toThrow(/mainnet/);

    const rejected = provider({
      sendTransfer: {
        status: "error",
        error: { code: -32000, message: "User rejected" },
      },
    });
    const adapter = createBitcoinWalletAdapter({}, rejected.call as never);
    await adapter.connect("unisat");
    await expect(
      adapter.send("unisat", {
        asset: btc,
        from: payment,
        to: deposit,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "rejected" });

    const failing = provider({ sendTransfer: new Error("socket hang up") });
    const unsure = createBitcoinWalletAdapter({}, failing.call as never);
    await unsure.connect("unisat");
    await expect(
      unsure.send("unisat", {
        asset: btc,
        from: payment,
        to: deposit,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "unknown" });
  });

  it("never sends from another address", async () => {
    const { call, calls } = provider();
    const adapter = createBitcoinWalletAdapter({}, call as never);
    await adapter.connect("unisat");
    await expect(
      adapter.send("unisat", {
        asset: btc,
        from: deposit,
        to: payment,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "not_sent" });
    expect(calls.some((item) => item.method === "sendTransfer")).toBe(false);
  });

  it("lists well-known wallets to install", () => {
    const wallets = createBitcoinWalletAdapter().getWallets();
    expect(wallets.map((wallet) => wallet.name)).toEqual(
      expect.arrayContaining(["Xverse", "Unisat"])
    );
    expect(wallets.every((wallet) => !wallet.isInstalled)).toBe(true);
  });
});

describe("getBitcoinBalance", () => {
  it("adds confirmed and mempool balances", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            chain_stats: { funded_txo_sum: 1000, spent_txo_sum: 300 },
            mempool_stats: { funded_txo_sum: 50, spent_txo_sum: 20 },
          })
        )
    );
    await expect(
      getBitcoinBalance(btc, payment, {
        apiUrl: "https://btc.test/api",
        fetcher,
      })
    ).resolves.toBe(730n);
    expect(fetcher).toHaveBeenCalledWith(
      `https://btc.test/api/address/${payment}`
    );
  });
});
