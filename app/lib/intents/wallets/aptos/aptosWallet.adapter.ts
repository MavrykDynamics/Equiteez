import { getWallets } from "@wallet-standard/app";
import type { Wallet } from "@wallet-standard/base";

import { INTENTS_APTOS_API_URL } from "~/consts/intents";
import {
  classifyIntentWalletError,
  IntentWalletError,
  type IntentWalletAdapter,
  type IntentWalletAsset,
  type IntentWalletOption,
  type IntentWalletTransfer,
} from "../intentWallet.types";

/**
 * AIP-62 Wallet Standard features this adapter uses. Typed locally:
 * `@aptos-labs/wallet-standard` would bundle the Aptos SDK for the account
 * classes, and entry-function payloads are plain data.
 */
type UserResponse<T> = { status: "Approved"; args: T } | { status: "Rejected" };
type AptosAccountInfo = { address: { toString(): string } | string };
type AptosWallet = Wallet & {
  features: {
    "aptos:connect": {
      connect(silent?: boolean): Promise<UserResponse<AptosAccountInfo>>;
    };
    "aptos:disconnect"?: { disconnect(): Promise<void> };
    "aptos:account"?: { account(): Promise<AptosAccountInfo> };
    "aptos:network"?: { network(): Promise<{ name: string }> };
    "aptos:signAndSubmitTransaction": {
      version: string;
      signAndSubmitTransaction(input: {
        payload: AptosEntryFunctionPayload;
      }): Promise<UserResponse<{ hash: string }>>;
    };
  };
};

export type AptosEntryFunctionPayload = {
  function: `${string}::${string}::${string}`;
  typeArguments: string[];
  functionArguments: string[];
};

const isAptosWallet = (wallet: Wallet): wallet is AptosWallet =>
  "aptos:connect" in wallet.features &&
  "aptos:signAndSubmitTransaction" in wallet.features;

const KNOWN_WALLETS: readonly Omit<IntentWalletOption, "isInstalled">[] = [
  { id: "Petra", name: "Petra", installUrl: "https://petra.app" },
  {
    id: "Nightly",
    name: "Nightly",
    installUrl: "https://nightly.app/download",
  },
  {
    id: "Pontem Wallet",
    name: "Pontem Wallet",
    installUrl: "https://pontem.network/pontem-wallet",
  },
];

/** Full `0x` + 64 hex, as the backend requires for refund addresses (§7). */
export const toLongAptosAddress = (value: { toString(): string } | string) => {
  const hex = String(value).toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{1,64}$/.test(hex))
    throw new Error("The wallet returned an invalid Aptos address.");
  return `0x${hex.padStart(64, "0")}`;
};

/** A coin type (`0x1::aptos_coin::AptosCoin`) rather than an FA address. */
const isCoinType = (contract: string) => contract.includes("::");

/**
 * The exact transfer as an entry function: native APT through
 * `aptos_account::transfer`, legacy coins through `transfer_coins`, and
 * fungible assets through `primary_fungible_store::transfer` (which creates
 * the recipient's store).
 */
export function buildAptosTransfer({
  asset,
  to,
  amount,
}: IntentWalletTransfer): AptosEntryFunctionPayload {
  const recipient = toLongAptosAddress(to);
  if (asset.kind === "native")
    return {
      function: "0x1::aptos_account::transfer",
      typeArguments: [],
      functionArguments: [recipient, amount.toString()],
    };
  const contract = asset.contractAddress;
  if (!contract)
    throw new IntentWalletError("not_sent", "The Aptos token is unknown.");
  return isCoinType(contract)
    ? {
        function: "0x1::aptos_account::transfer_coins",
        typeArguments: [contract],
        functionArguments: [recipient, amount.toString()],
      }
    : {
        function: "0x1::primary_fungible_store::transfer",
        typeArguments: ["0x1::fungible_asset::Metadata"],
        functionArguments: [
          toLongAptosAddress(contract),
          recipient,
          amount.toString(),
        ],
      };
}

/** The one fetch call shape used here (global `fetch` satisfies it). */
type Fetch = (url: string, init: RequestInit) => Promise<Response>;

/** Balance through the fullnode view API. */
export async function getAptosBalance(
  asset: IntentWalletAsset,
  owner: string,
  {
    apiUrl = INTENTS_APTOS_API_URL,
    fetcher = fetch,
  }: { apiUrl?: string; fetcher?: Fetch } = {}
): Promise<bigint> {
  const contract = asset.contractAddress;
  const body =
    asset.kind === "native" || (contract && isCoinType(contract))
      ? {
          function: "0x1::coin::balance",
          type_arguments: [
            asset.kind === "native" ? "0x1::aptos_coin::AptosCoin" : contract,
          ],
          arguments: [toLongAptosAddress(owner)],
        }
      : {
          function: "0x1::primary_fungible_store::balance",
          type_arguments: ["0x1::object::ObjectCore"],
          arguments: [toLongAptosAddress(owner), toLongAptosAddress(contract!)],
        };
  const response = await fetcher(`${apiUrl.replace(/\/$/, "")}/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(`The Aptos API answered ${response.status}.`);
  const [value] = (await response.json()) as unknown[];
  if (typeof value !== "string" || !/^\d+$/.test(value))
    throw new Error("The Aptos API returned an unexpected balance.");
  return BigInt(value);
}

/** Aptos wallets through AIP-62 Wallet Standard (Petra, Nightly, Pontem, …). */
export function createAptosWalletAdapter(
  options: { apiUrl?: string; fetcher?: Fetch } = {}
): IntentWalletAdapter {
  const registry = getWallets();
  const listWallets = () => registry.get().filter(isAptosWallet);
  const find = (walletId: string) => {
    const wallet = listWallets().find((item) => item.name === walletId);
    if (!wallet)
      throw new IntentWalletError(
        "not_sent",
        "This Aptos wallet is not available. Unlock it or reload the page."
      );
    return wallet;
  };
  const connected = new Map<string, string>();
  const assertMainnet = async (wallet: AptosWallet) => {
    const network = await wallet.features["aptos:network"]?.network();
    if (network && network.name.toLowerCase() !== "mainnet")
      throw new IntentWalletError(
        "not_sent",
        `Switch ${wallet.name} to Aptos mainnet and try again.`
      );
  };

  return {
    family: "aptos",
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
      const response = await wallet.features["aptos:connect"].connect();
      if (response.status !== "Approved")
        throw new Error("The connection was declined in the wallet.");
      await assertMainnet(wallet);
      const address = toLongAptosAddress(response.args.address);
      connected.set(wallet.name, address);
      return { walletId: wallet.name, walletName: wallet.name, address };
    },
    async disconnect(walletId) {
      connected.delete(walletId);
      await listWallets()
        .find((wallet) => wallet.name === walletId)
        ?.features["aptos:disconnect"]?.disconnect();
    },
    async getAccount(walletId) {
      const wallet = listWallets().find((item) => item.name === walletId);
      const address = connected.get(walletId);
      if (!wallet || !address) return null;
      const current = await wallet.features["aptos:account"]?.account();
      // A wallet that switched accounts no longer matches the reviewed one.
      return current ? toLongAptosAddress(current.address) : address;
    },
    getBalance: (asset, owner) => getAptosBalance(asset, owner, options),
    async send(walletId, transfer) {
      const wallet = find(walletId);
      if (connected.get(walletId) !== toLongAptosAddress(transfer.from))
        throw new IntentWalletError(
          "not_sent",
          "Reconnect the Aptos wallet you reviewed the deposit with."
        );
      const feature = wallet.features["aptos:signAndSubmitTransaction"];
      // 1.0.0 needs a raw transaction built with the Aptos SDK.
      if (!/^1\.[1-9]/.test(feature.version))
        throw new IntentWalletError(
          "not_sent",
          `${wallet.name} is too old to send from here. Update it, or send to the deposit address from any wallet.`
        );
      await assertMainnet(wallet);
      const payload = buildAptosTransfer(transfer);
      let response: UserResponse<{ hash: string }>;
      try {
        response = await feature.signAndSubmitTransaction({ payload });
      } catch (error) {
        throw new IntentWalletError(
          classifyIntentWalletError(error),
          error instanceof Error ? error.message : "The wallet did not send."
        );
      }
      if (response.status !== "Approved")
        throw new IntentWalletError(
          "rejected",
          "The transfer was declined in your wallet."
        );
      if (!/^0x[0-9a-fA-F]{1,64}$/.test(response.args.hash))
        throw new IntentWalletError(
          "unknown",
          "The wallet did not return a transaction hash."
        );
      return response.args.hash.toLowerCase();
    },
  };
}
