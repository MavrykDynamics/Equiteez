import type { WalletSelector } from "@near-wallet-selector/core";
import { describe, expect, it, vi } from "vitest";

import {
  buildNearTransfer,
  createNearReader,
  createNearWalletAdapter,
  type NearReader,
} from "./nearWallet.adapter";

const sender = "alice.near";
const deposit = "f".repeat(64);
const nearAsset = {
  kind: "native",
  contractAddress: null,
  symbol: "NEAR",
  decimals: 24,
} as const;
const zec = {
  kind: "token",
  contractAddress: "zec.omft.near",
  symbol: "ZEC",
  decimals: 8,
} as const;

const reader = (storage: bigint | null = null): NearReader => ({
  getBalance: vi.fn(async () => 10n ** 30n),
  getStorageDeposit: vi.fn(async () => storage),
});
const decodeArgs = (args: Uint8Array) =>
  JSON.parse(new TextDecoder().decode(args));

describe("buildNearTransfer", () => {
  it("sends native NEAR as a Transfer to the deposit account", async () => {
    const tx = await buildNearTransfer(reader(), {
      asset: nearAsset,
      from: sender,
      to: deposit,
      amount: 5n,
    });
    expect(tx.receiverId).toBe(deposit);
    expect(tx.actions).toHaveLength(1);
    expect(tx.actions[0].transfer?.deposit).toBe(5n);
  });

  it("calls ft_transfer with 1 yocto, registering the account first when needed", async () => {
    const registered = await buildNearTransfer(reader(null), {
      asset: zec,
      from: sender,
      to: deposit,
      amount: 7n,
    });
    expect(registered.receiverId).toBe("zec.omft.near");
    expect(registered.actions).toHaveLength(1);
    const [transfer] = registered.actions;
    expect(transfer.functionCall?.methodName).toBe("ft_transfer");
    expect(transfer.functionCall?.deposit).toBe(1n);
    expect(decodeArgs(transfer.functionCall!.args)).toEqual({
      receiver_id: deposit,
      amount: "7",
    });

    const unregistered = await buildNearTransfer(reader(1_250n), {
      asset: zec,
      from: sender,
      to: deposit,
      amount: 7n,
    });
    const [storage, ft] = unregistered.actions;
    expect(storage.functionCall?.methodName).toBe("storage_deposit");
    expect(storage.functionCall?.deposit).toBe(1_250n);
    expect(decodeArgs(storage.functionCall!.args)).toEqual({
      account_id: deposit,
      registration_only: true,
    });
    expect(ft.functionCall?.methodName).toBe("ft_transfer");
  });
});

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

describe("createNearReader", () => {
  const rpc = (result: unknown) =>
    vi.fn<Fetcher>(
      async () =>
        new Response(JSON.stringify({ jsonrpc: "2.0", id: "x", result }))
    );
  const bytes = (value: unknown) => [
    ...new TextEncoder().encode(JSON.stringify(value)),
  ];

  it("reads native and token balances", async () => {
    const account = rpc({ amount: "123" });
    await expect(
      createNearReader({
        rpcUrl: "https://near.test",
        fetcher: account,
      }).getBalance(nearAsset, sender)
    ).resolves.toBe(123n);
    expect(
      JSON.parse(String(account.mock.calls[0][1].body)).params
    ).toMatchObject({
      request_type: "view_account",
      account_id: sender,
    });
    const token = rpc({ result: bytes("42") });
    await expect(
      createNearReader({ fetcher: token }).getBalance(zec, sender)
    ).resolves.toBe(42n);
    expect(
      JSON.parse(String(token.mock.calls[0][1].body)).params
    ).toMatchObject({
      request_type: "call_function",
      account_id: "zec.omft.near",
      method_name: "ft_balance_of",
    });
  });

  it("reports a missing storage registration with the token's minimum", async () => {
    const replies = [
      { result: bytes(null) },
      { result: bytes({ min: "1250" }) },
    ];
    const fetcher = vi.fn<Fetcher>(
      async () => new Response(JSON.stringify({ result: replies.shift() }))
    );
    await expect(
      createNearReader({ fetcher }).getStorageDeposit("zec.omft.near", deposit)
    ).resolves.toBe(1250n);
    const registered = vi.fn<Fetcher>(
      async () =>
        new Response(
          JSON.stringify({ result: { result: bytes({ total: "1" }) } })
        )
    );
    await expect(
      createNearReader({ fetcher: registered }).getStorageDeposit(
        "zec.omft.near",
        deposit
      )
    ).resolves.toBeNull();
  });
});

describe("createNearWalletAdapter", () => {
  function fakeSelector({
    send = async () => ({ transaction: { hash: "8hashNear" } }),
  }: { send?: (input: unknown) => Promise<unknown> } = {}) {
    let accounts = [{ accountId: sender }];
    const wallet = {
      signIn: vi.fn(async () => accounts),
      signOut: vi.fn(async () => {}),
      getAccounts: vi.fn(async () => accounts),
      signAndSendTransaction: vi.fn(send),
    };
    const selector = {
      store: {
        getState: () => ({
          modules: [
            {
              id: "meteor-wallet",
              metadata: {
                name: "Meteor Wallet",
                iconUrl: "meteor.svg",
                available: true,
                deprecated: false,
              },
            },
            {
              id: "here-wallet",
              metadata: {
                name: "HERE Wallet",
                iconUrl: "here.svg",
                available: false,
                deprecated: false,
                downloadUrl: "https://herewallet.app",
              },
            },
          ],
        }),
        observable: { subscribe: () => ({ unsubscribe: () => {} }) },
      },
      wallet: vi.fn(async () => wallet),
    } as unknown as WalletSelector;
    return {
      selector,
      wallet,
      switchTo: (id: string) => (accounts = [{ accountId: id }]),
    };
  }

  it("lists wallets, connects and sends the built transaction", async () => {
    const { selector, wallet } = fakeSelector();
    const adapter = await createNearWalletAdapter({
      selector: Promise.resolve(selector),
      reader: reader(),
    });
    expect(adapter.getWallets()).toEqual([
      expect.objectContaining({ id: "meteor-wallet", isInstalled: true }),
      expect.objectContaining({
        id: "here-wallet",
        isInstalled: false,
        installUrl: "https://herewallet.app",
      }),
    ]);
    await expect(adapter.connect("meteor-wallet")).resolves.toEqual({
      walletId: "meteor-wallet",
      walletName: "Meteor Wallet",
      address: sender,
    });
    await expect(
      adapter.send("meteor-wallet", {
        asset: nearAsset,
        from: sender,
        to: deposit,
        amount: 3n,
      })
    ).resolves.toBe("8hashNear");
    expect(wallet.signAndSendTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ signerId: sender, receiverId: deposit })
    );
  });

  it("maps a declined transaction and reports a switched account", async () => {
    const { selector, switchTo } = fakeSelector({
      send: async () => {
        throw new Error("User rejected the transaction");
      },
    });
    const adapter = await createNearWalletAdapter({
      selector: Promise.resolve(selector),
      reader: reader(),
    });
    await adapter.connect("meteor-wallet");
    await expect(
      adapter.send("meteor-wallet", {
        asset: nearAsset,
        from: sender,
        to: deposit,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "rejected" });
    switchTo("bob.near");
    expect(await adapter.getAccount("meteor-wallet")).toBe("bob.near");
  });

  it("treats a missing hash as an unknown outcome", async () => {
    const { selector } = fakeSelector({ send: async () => undefined });
    const adapter = await createNearWalletAdapter({
      selector: Promise.resolve(selector),
      reader: reader(),
    });
    await adapter.connect("meteor-wallet");
    await expect(
      adapter.send("meteor-wallet", {
        asset: nearAsset,
        from: sender,
        to: deposit,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "unknown" });
  });
});
