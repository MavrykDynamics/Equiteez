import { getWallets } from "@wallet-standard/app";
import type { Wallet } from "@wallet-standard/base";
import { describe, expect, it, vi } from "vitest";

import {
  buildAptosTransfer,
  createAptosWalletAdapter,
  getAptosBalance,
  toLongAptosAddress,
} from "./aptosWallet.adapter";

const owner = `0x${"a".repeat(64)}`;
const deposit = `0x${"b".repeat(64)}`;
const apt = {
  kind: "native",
  contractAddress: null,
  symbol: "APT",
  decimals: 8,
} as const;
const usdt = {
  kind: "token",
  contractAddress:
    "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
  symbol: "USDt",
  decimals: 6,
} as const;
const coin = {
  kind: "token",
  contractAddress:
    "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
  symbol: "lzUSDC",
  decimals: 6,
} as const;

describe("buildAptosTransfer", () => {
  it("builds the entry function per asset type", () => {
    expect(
      buildAptosTransfer({ asset: apt, from: owner, to: deposit, amount: 5n })
    ).toEqual({
      function: "0x1::aptos_account::transfer",
      typeArguments: [],
      functionArguments: [deposit, "5"],
    });
    expect(
      buildAptosTransfer({ asset: usdt, from: owner, to: deposit, amount: 7n })
    ).toEqual({
      function: "0x1::primary_fungible_store::transfer",
      typeArguments: ["0x1::fungible_asset::Metadata"],
      functionArguments: [usdt.contractAddress, deposit, "7"],
    });
    expect(
      buildAptosTransfer({ asset: coin, from: owner, to: deposit, amount: 9n })
    ).toMatchObject({
      function: "0x1::aptos_account::transfer_coins",
      typeArguments: [coin.contractAddress],
    });
  });

  it("pads short addresses to the full form", () => {
    expect(toLongAptosAddress("0x1")).toBe(`0x${"0".repeat(63)}1`);
    expect(() => toLongAptosAddress("0xzz")).toThrow();
  });
});

describe("getAptosBalance", () => {
  it("reads coin and fungible-asset balances through the view API", async () => {
    const fetcher = vi.fn<
      (url: string, init: RequestInit) => Promise<Response>
    >(async () => new Response(JSON.stringify(["123"])));
    await expect(
      getAptosBalance(apt, owner, { apiUrl: "https://aptos.test/v1/", fetcher })
    ).resolves.toBe(123n);
    expect(fetcher).toHaveBeenLastCalledWith(
      "https://aptos.test/v1/view",
      expect.objectContaining({ method: "POST" })
    );
    expect(JSON.parse(String(fetcher.mock.calls[0][1].body))).toEqual({
      function: "0x1::coin::balance",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [owner],
    });
    await getAptosBalance(usdt, owner, { fetcher });
    expect(JSON.parse(String(fetcher.mock.calls[1][1].body))).toMatchObject({
      function: "0x1::primary_fungible_store::balance",
      arguments: [owner, usdt.contractAddress],
    });
    await expect(
      getAptosBalance(apt, owner, {
        fetcher: async () => new Response("", { status: 429 }),
      })
    ).rejects.toThrow(/429/);
  });
});

describe("createAptosWalletAdapter", () => {
  function registerWallet({
    network = "mainnet",
    version = "1.1.0",
    submit = async () => ({
      status: "Approved" as const,
      args: { hash: `0x${"c".repeat(64)}` },
    }),
  }: {
    network?: string;
    version?: string;
    submit?: (input: unknown) => Promise<unknown>;
  } = {}) {
    const current = { address: owner };
    const wallet = {
      version: "1.0.0",
      name: "Test Petra",
      icon: "data:image/svg+xml;base64,AA==",
      chains: ["aptos:mainnet"],
      accounts: [],
      features: {
        "aptos:connect": {
          version: "1.0.0",
          connect: async () => ({
            status: "Approved",
            // An AccountAddress-like object in the short form.
            args: { address: { toString: () => `0x${"a".repeat(64)}` } },
          }),
        },
        "aptos:account": { version: "1.0.0", account: async () => current },
        "aptos:network": {
          version: "1.0.0",
          network: async () => ({ name: network }),
        },
        "aptos:signAndSubmitTransaction": {
          version,
          signAndSubmitTransaction: vi.fn(submit),
        },
      },
    };
    const unregister = getWallets().register(wallet as unknown as Wallet);
    return { wallet, current, unregister };
  }

  it("connects and sends the payload through the wallet", async () => {
    const { wallet, unregister } = registerWallet();
    const adapter = createAptosWalletAdapter({
      fetcher: async () => new Response(JSON.stringify(["1"])),
    });
    expect(adapter.getWallets()[0]).toMatchObject({
      id: "Test Petra",
      isInstalled: true,
    });
    await expect(adapter.connect("Test Petra")).resolves.toMatchObject({
      address: owner,
    });
    expect(await adapter.getAccount("Test Petra")).toBe(owner);
    const hash = await adapter.send("Test Petra", {
      asset: apt,
      from: owner,
      to: deposit,
      amount: 100n,
    });
    expect(hash).toBe(`0x${"c".repeat(64)}`);
    expect(
      wallet.features["aptos:signAndSubmitTransaction"].signAndSubmitTransaction
    ).toHaveBeenCalledWith({
      payload: {
        function: "0x1::aptos_account::transfer",
        typeArguments: [],
        functionArguments: [deposit, "100"],
      },
    });
    unregister();
  });

  it("maps a rejection and refuses testnet or an outdated wallet", async () => {
    const rejected = registerWallet({
      submit: async () => ({ status: "Rejected" }),
    });
    const adapter = createAptosWalletAdapter();
    await adapter.connect("Test Petra");
    await expect(
      adapter.send("Test Petra", {
        asset: apt,
        from: owner,
        to: deposit,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "rejected" });
    rejected.unregister();

    const testnet = registerWallet({ network: "testnet" });
    await expect(
      createAptosWalletAdapter().connect("Test Petra")
    ).rejects.toMatchObject({ failure: "not_sent" });
    testnet.unregister();

    const old = registerWallet({ version: "1.0.0" });
    const oldAdapter = createAptosWalletAdapter();
    await oldAdapter.connect("Test Petra");
    await expect(
      oldAdapter.send("Test Petra", {
        asset: apt,
        from: owner,
        to: deposit,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "not_sent" });
    old.unregister();
  });

  it("reports a switched account", async () => {
    const { current, unregister } = registerWallet();
    const adapter = createAptosWalletAdapter();
    await adapter.connect("Test Petra");
    current.address = deposit;
    expect(await adapter.getAccount("Test Petra")).toBe(deposit);
    unregister();
  });
});
