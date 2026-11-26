import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import { getWallets } from "@wallet-standard/app";
import type { Wallet, WalletAccount } from "@wallet-standard/base";

import { INTENTS_SOLANA_RPC_URL } from "~/consts/intents";
import { base58Encode } from "~/lib/intents/intentNetworks";
import {
  classifyIntentWalletError,
  IntentWalletError,
  type IntentWalletAdapter,
  type IntentWalletAsset,
  type IntentWalletOption,
  type IntentWalletTransfer,
} from "../intentWallet.types";

const SOLANA_MAINNET = "solana:mainnet";
/** Signature fee per transaction, plus headroom for priority fees. */
const FEE_RESERVE_LAMPORTS = 20_000n;
/** Rent of a classic SPL token account (165 bytes). */
const TOKEN_ACCOUNT_SIZE = 165;

/** Wallet Standard features this adapter uses (`@solana/wallet-standard-features`). */
type ConnectFeature = {
  "standard:connect": {
    connect(input?: { silent?: boolean }): Promise<{
      accounts: readonly WalletAccount[];
    }>;
  };
};
type DisconnectFeature = {
  "standard:disconnect"?: { disconnect(): Promise<void> };
};
type EventsFeature = {
  "standard:events"?: {
    on(event: "change", listener: () => void): () => void;
  };
};
type SignAndSendFeature = {
  "solana:signAndSendTransaction": {
    signAndSendTransaction(
      ...inputs: {
        account: WalletAccount;
        transaction: Uint8Array;
        chain: string;
      }[]
    ): Promise<readonly { signature: Uint8Array }[]>;
  };
};
type SolanaWallet = Wallet & {
  features: ConnectFeature &
    DisconnectFeature &
    EventsFeature &
    SignAndSendFeature;
};

const isSolanaWallet = (wallet: Wallet): wallet is SolanaWallet =>
  wallet.chains.includes(SOLANA_MAINNET) &&
  "standard:connect" in wallet.features &&
  "solana:signAndSendTransaction" in wallet.features;

/** Suggested when not installed; installed wallets register themselves. */
const KNOWN_WALLETS: readonly Omit<IntentWalletOption, "isInstalled">[] = [
  {
    id: "Phantom",
    name: "Phantom",
    installUrl: "https://phantom.com/download",
  },
  {
    id: "Solflare",
    name: "Solflare",
    installUrl: "https://solflare.com/download",
  },
  {
    id: "Backpack",
    name: "Backpack",
    installUrl: "https://backpack.app/downloads",
  },
];

/** The subset of `Connection` the transfer builder needs (mockable). */
export type SolanaReader = Pick<
  Connection,
  | "getLatestBlockhash"
  | "getAccountInfo"
  | "getBalance"
  | "getMinimumBalanceForRentExemption"
  | "getParsedTokenAccountsByOwner"
>;

export async function getSolanaBalance(
  connection: SolanaReader,
  asset: IntentWalletAsset,
  owner: string
): Promise<bigint> {
  const ownerKey = new PublicKey(owner);
  if (asset.kind === "native")
    return BigInt(await connection.getBalance(ownerKey, "confirmed"));
  const { value } = await connection.getParsedTokenAccountsByOwner(
    ownerKey,
    { mint: new PublicKey(asset.contractAddress!) },
    "confirmed"
  );
  return value.reduce(
    (total, { account }) =>
      total + BigInt(account.data.parsed.info.tokenAmount.amount as string),
    0n
  );
}

/**
 * The exact deposit transfer, unsigned: a SystemProgram transfer of native
 * SOL, or an SPL `transferChecked` into the deposit address's associated
 * token account (created idempotently, paid by the sender). The token program
 * (classic or Token-2022) comes from the mint account. Checks that the sender
 * can pay the fee and any account rent before the wallet is asked.
 */
export async function buildSolanaTransfer(
  connection: SolanaReader,
  { asset, from, to, amount }: IntentWalletTransfer
): Promise<Transaction> {
  let sender: PublicKey;
  let recipient: PublicKey;
  try {
    sender = new PublicKey(from);
    recipient = new PublicKey(to);
  } catch {
    throw new IntentWalletError("not_sent", "Invalid Solana address.");
  }
  const instructions: TransactionInstruction[] = [];
  let lamportsNeeded = FEE_RESERVE_LAMPORTS;
  if (asset.kind === "native") {
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipient,
        lamports: amount,
      })
    );
    lamportsNeeded += amount;
  } else {
    if (!asset.contractAddress)
      throw new IntentWalletError("not_sent", "The token mint is unknown.");
    const mint = new PublicKey(asset.contractAddress);
    const mintAccount = await connection.getAccountInfo(mint, "confirmed");
    if (!mintAccount)
      throw new IntentWalletError("not_sent", "The token mint was not found.");
    const programId = mintAccount.owner.equals(TOKEN_2022_PROGRAM_ID)
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID;
    const source = getAssociatedTokenAddressSync(
      mint,
      sender,
      false,
      programId
    );
    const destination = getAssociatedTokenAddressSync(
      mint,
      recipient,
      true,
      programId
    );
    if (!(await connection.getAccountInfo(destination, "confirmed")))
      lamportsNeeded += BigInt(
        await connection.getMinimumBalanceForRentExemption(TOKEN_ACCOUNT_SIZE)
      );
    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        sender,
        destination,
        recipient,
        mint,
        programId
      ),
      createTransferCheckedInstruction(
        source,
        mint,
        destination,
        sender,
        amount,
        asset.decimals,
        [],
        programId
      )
    );
  }
  const lamports = BigInt(await connection.getBalance(sender, "confirmed"));
  if (lamports < lamportsNeeded)
    throw new IntentWalletError(
      "not_sent",
      "Not enough SOL to pay the Solana network fee for this transfer."
    );
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  return new Transaction({
    feePayer: sender,
    blockhash,
    lastValidBlockHeight,
  }).add(...instructions);
}

/** Solana wallets through Wallet Standard (Phantom, Solflare, Backpack, …). */
export function createSolanaWalletAdapter(
  connection: SolanaReader = new Connection(INTENTS_SOLANA_RPC_URL, "confirmed")
): IntentWalletAdapter {
  const registry = getWallets();
  const listWallets = () => registry.get().filter(isSolanaWallet);
  const find = (walletId: string) => {
    const wallet = listWallets().find((item) => item.name === walletId);
    if (!wallet)
      throw new IntentWalletError(
        "not_sent",
        "This Solana wallet is not available. Unlock it or reload the page."
      );
    return wallet;
  };
  /** The account the user connected, per wallet. */
  const connected = new Map<string, string>();
  const accountOf = (wallet: SolanaWallet) => {
    const address = connected.get(wallet.name);
    return wallet.accounts.find(
      (account) =>
        account.address === address && account.chains.includes(SOLANA_MAINNET)
    );
  };

  return {
    family: "solana",
    getWallets() {
      const installed = listWallets().map((wallet) => ({
        id: wallet.name,
        name: wallet.name,
        icon: wallet.icon,
        isInstalled: true,
      }));
      const missing = KNOWN_WALLETS.filter(
        (known) => !installed.some((wallet) => wallet.id === known.id)
      ).map((known) => ({ ...known, isInstalled: false }));
      return [...installed, ...missing];
    },
    onWalletsChange(listener) {
      const offRegister = registry.on("register", listener);
      const offUnregister = registry.on("unregister", listener);
      return () => {
        offRegister();
        offUnregister();
      };
    },
    async connect(walletId) {
      const wallet = find(walletId);
      const { accounts } = await wallet.features["standard:connect"].connect();
      const account = accounts.find((item) =>
        item.chains.includes(SOLANA_MAINNET)
      );
      if (!account)
        throw new Error(
          `${wallet.name} did not share a Solana mainnet account.`
        );
      connected.set(wallet.name, account.address);
      return {
        walletId: wallet.name,
        walletName: wallet.name,
        address: account.address,
      };
    },
    async disconnect(walletId) {
      connected.delete(walletId);
      await listWallets()
        .find((wallet) => wallet.name === walletId)
        ?.features["standard:disconnect"]?.disconnect();
    },
    async getAccount(walletId) {
      const wallet = listWallets().find((item) => item.name === walletId);
      return (wallet && accountOf(wallet)?.address) ?? null;
    },
    getBalance: (asset, owner) => getSolanaBalance(connection, asset, owner),
    async send(walletId, transfer) {
      const wallet = find(walletId);
      const account = accountOf(wallet);
      if (!account || account.address !== transfer.from)
        throw new IntentWalletError(
          "not_sent",
          "Reconnect the Solana wallet you reviewed the deposit with."
        );
      let transaction: Uint8Array;
      try {
        transaction = (
          await buildSolanaTransfer(connection, transfer)
        ).serialize({ requireAllSignatures: false, verifySignatures: false });
      } catch (error) {
        if (error instanceof IntentWalletError) throw error;
        throw new IntentWalletError(
          "not_sent",
          `The Solana network could not be reached: ${error instanceof Error ? error.message : "unknown error"}.`
        );
      }
      let signature: Uint8Array | undefined;
      try {
        const [output] = await wallet.features[
          "solana:signAndSendTransaction"
        ].signAndSendTransaction({
          account,
          transaction,
          chain: SOLANA_MAINNET,
        });
        signature = output?.signature;
      } catch (error) {
        throw new IntentWalletError(
          classifyIntentWalletError(error),
          error instanceof Error ? error.message : "The wallet did not send."
        );
      }
      if (!signature)
        throw new IntentWalletError(
          "unknown",
          "The wallet did not return a transaction signature."
        );
      return base58Encode(signature);
    },
  };
}
