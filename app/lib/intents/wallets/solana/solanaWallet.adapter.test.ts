import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getWallets } from "@wallet-standard/app";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import { describe, expect, it, vi } from "vitest";

import { base58ByteLength } from "~/lib/intents/intentNetworks";
import {
  buildSolanaTransfer,
  createSolanaWalletAdapter,
  getSolanaBalance,
  type SolanaReader,
} from "./solanaWallet.adapter";

const sender = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm";
const deposit = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
const usdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const blockhash = "4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM";

function reader({
  lamports = 10n ** 9n,
  mintOwner = TOKEN_PROGRAM_ID,
  hasDestination = false,
}: {
  lamports?: bigint;
  mintOwner?: PublicKey;
  hasDestination?: boolean;
} = {}) {
  return {
    getLatestBlockhash: vi.fn(async () => ({
      blockhash,
      lastValidBlockHeight: 100,
    })),
    getBalance: vi.fn(async () => Number(lamports)),
    getMinimumBalanceForRentExemption: vi.fn(async () => 2_039_280),
    getAccountInfo: vi.fn(async (key: PublicKey) =>
      key.toBase58() === usdcMint
        ? { owner: mintOwner }
        : hasDestination
          ? { owner: mintOwner }
          : null
    ),
    getParsedTokenAccountsByOwner: vi.fn(async () => ({
      value: [
        {
          account: {
            data: { parsed: { info: { tokenAmount: { amount: "7" } } } },
          },
        },
        {
          account: {
            data: { parsed: { info: { tokenAmount: { amount: "5" } } } },
          },
        },
      ],
    })),
  } as unknown as SolanaReader;
}

const sol = {
  kind: "native",
  contractAddress: null,
  symbol: "SOL",
  decimals: 9,
} as const;
const usdc = {
  kind: "token",
  contractAddress: usdcMint,
  symbol: "USDC",
  decimals: 6,
} as const;

describe("buildSolanaTransfer", () => {
  it("sends native SOL to the deposit address with the sender paying fees", async () => {
    const tx = await buildSolanaTransfer(reader(), {
      asset: sol,
      from: sender,
      to: deposit,
      amount: 500_000_000n,
    });
    expect(tx.feePayer?.toBase58()).toBe(sender);
    expect(tx.recentBlockhash).toBe(blockhash);
    expect(tx.instructions).toHaveLength(1);
    const [ix] = tx.instructions;
    expect(ix.programId.equals(SystemProgram.programId)).toBe(true);
    expect(ix.keys[1].pubkey.toBase58()).toBe(deposit);
    // Lamports are a little-endian u64 after the 4-byte instruction index.
    expect(ix.data.readBigUInt64LE(4)).toBe(500_000_000n);
  });

  it("transfers SPL tokens into the deposit address's token account, creating it", async () => {
    const tx = await buildSolanaTransfer(reader(), {
      asset: usdc,
      from: sender,
      to: deposit,
      amount: 25_000_000n,
    });
    const destination = getAssociatedTokenAddressSync(
      new PublicKey(usdcMint),
      new PublicKey(deposit),
      true
    );
    expect(tx.instructions).toHaveLength(2);
    const [create, transfer] = tx.instructions;
    expect(create.keys[1].pubkey.equals(destination)).toBe(true);
    expect(transfer.programId.equals(TOKEN_PROGRAM_ID)).toBe(true);
    expect(transfer.keys[2].pubkey.equals(destination)).toBe(true);
    // transferChecked: [12, amount u64, decimals u8]
    expect(transfer.data[0]).toBe(12);
    expect(transfer.data.readBigUInt64LE(1)).toBe(25_000_000n);
    expect(transfer.data[9]).toBe(6);
  });

  it("uses Token-2022 when the mint belongs to it", async () => {
    const tx = await buildSolanaTransfer(
      reader({ mintOwner: TOKEN_2022_PROGRAM_ID, hasDestination: true }),
      { asset: usdc, from: sender, to: deposit, amount: 1n }
    );
    expect(tx.instructions[1].programId.equals(TOKEN_2022_PROGRAM_ID)).toBe(
      true
    );
  });

  it("refuses before the wallet when SOL cannot cover fees or rent", async () => {
    await expect(
      buildSolanaTransfer(reader({ lamports: 500_000_000n }), {
        asset: sol,
        from: sender,
        to: deposit,
        amount: 500_000_000n,
      })
    ).rejects.toMatchObject({ failure: "not_sent" });
    await expect(
      buildSolanaTransfer(reader({ lamports: 1_000_000n }), {
        asset: usdc,
        from: sender,
        to: deposit,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "not_sent" });
  });

  it("reads native and token balances", async () => {
    const connection = reader({ lamports: 42n });
    expect(await getSolanaBalance(connection, sol, sender)).toBe(42n);
    expect(await getSolanaBalance(connection, usdc, sender)).toBe(12n);
  });
});

describe("createSolanaWalletAdapter", () => {
  function registerWallet(sign: (tx: Uint8Array) => Promise<Uint8Array>) {
    const account: WalletAccount = {
      address: sender,
      publicKey: new PublicKey(sender).toBytes(),
      chains: ["solana:mainnet"],
      features: ["solana:signAndSendTransaction"],
    };
    const wallet = {
      version: "1.0.0",
      name: "Test Phantom",
      icon: "data:image/svg+xml;base64,AA==",
      chains: ["solana:mainnet"],
      accounts: [] as WalletAccount[],
      features: {
        "standard:connect": {
          version: "1.0.0",
          connect: async () => {
            wallet.accounts = [account];
            return { accounts: wallet.accounts };
          },
        },
        "solana:signAndSendTransaction": {
          version: "1.0.0",
          signAndSendTransaction: async (input: {
            transaction: Uint8Array;
          }) => [{ signature: await sign(input.transaction) }],
        },
      },
    };
    const unregister = getWallets().register(wallet as unknown as Wallet);
    return { wallet, unregister };
  }

  it("discovers, connects and sends through the wallet, returning a base58 signature", async () => {
    let sent: Transaction | undefined;
    const { unregister } = registerWallet(async (bytes) => {
      sent = Transaction.from(bytes);
      return new Uint8Array(64).fill(7);
    });
    const adapter = createSolanaWalletAdapter(reader());
    const wallets = adapter.getWallets();
    expect(wallets[0]).toMatchObject({ id: "Test Phantom", isInstalled: true });
    expect(wallets.some((w) => w.id === "Phantom" && !w.isInstalled)).toBe(
      true
    );
    expect(await adapter.getAccount("Test Phantom")).toBeNull();
    await expect(adapter.connect("Test Phantom")).resolves.toEqual({
      walletId: "Test Phantom",
      walletName: "Test Phantom",
      address: sender,
    });
    expect(await adapter.getAccount("Test Phantom")).toBe(sender);
    const signature = await adapter.send("Test Phantom", {
      asset: sol,
      from: sender,
      to: deposit,
      amount: 1_000n,
    });
    expect(base58ByteLength(signature)).toBe(64);
    expect(sent?.instructions[0].keys[1].pubkey.toBase58()).toBe(deposit);
    unregister();
  });

  it("classifies a declined signature as rejected and refuses another account", async () => {
    const { unregister } = registerWallet(async () => {
      throw Object.assign(new Error("User rejected the request."), {
        code: 4001,
      });
    });
    const adapter = createSolanaWalletAdapter(reader());
    await adapter.connect("Test Phantom");
    await expect(
      adapter.send("Test Phantom", {
        asset: sol,
        from: sender,
        to: deposit,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "rejected" });
    await expect(
      adapter.send("Test Phantom", {
        asset: sol,
        from: deposit,
        to: sender,
        amount: 1n,
      })
    ).rejects.toMatchObject({ failure: "not_sent" });
    unregister();
  });
});
