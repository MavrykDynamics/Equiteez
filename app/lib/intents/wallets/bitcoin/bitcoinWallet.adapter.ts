import {
  AddressPurpose,
  defaultAdapters,
  getProviders,
  getSupportedWallets,
  request,
  RpcErrorCode,
  type Provider,
  type RpcResult,
} from "@sats-connect/core";

import { INTENTS_BITCOIN_API_URL } from "~/consts/intents";
import {
  getIntentNetwork,
  getRefundAddressError,
  isSameNetworkAddress,
} from "~/lib/intents/intentNetworks";
import {
  classifyIntentWalletError,
  IntentWalletError,
  type IntentWalletAdapter,
  type IntentWalletAsset,
  type IntentWalletFailure,
  type IntentWalletOption,
} from "../intentWallet.types";

const bitcoin = getIntentNetwork("btc")!;
type Method = "getAccounts" | "sendTransfer";
/** The provider call per wallet: built-in adapters or the sats-connect RPC. */
type Call = <M extends Method>(
  method: M,
  params: Parameters<typeof request<M>>[1]
) => Promise<RpcResult<M>>;

const callerOf = (providerId: string): Call => {
  const Adapter = defaultAdapters[providerId];
  if (Adapter) {
    const adapter = new Adapter();
    return (method, params) => adapter.request(method, params);
  }
  return (method, params) => request(method, params, providerId);
};

/** Installed providers first, then the well-known ones to install. */
function listProviders(): IntentWalletOption[] {
  const supported = getSupportedWallets();
  const injected = getProviders().filter(
    (provider: Provider) => !supported.some((item) => item.id === provider.id)
  );
  return [
    ...supported
      .filter((wallet) => wallet.isInstalled)
      .map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        icon: wallet.icon,
        isInstalled: true,
      })),
    ...injected.map((provider: Provider) => ({
      id: provider.id,
      name: provider.name,
      icon: provider.icon,
      isInstalled: true,
    })),
    ...supported
      .filter((wallet) => !wallet.isInstalled)
      .map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        icon: wallet.icon,
        isInstalled: false,
        installUrl: wallet.chromeWebStoreUrl ?? wallet.webUrl,
      })),
  ];
}

const failureOf = (code: number): IntentWalletFailure =>
  code === RpcErrorCode.USER_REJECTION || code === 4001
    ? "rejected"
    : code === RpcErrorCode.METHOD_NOT_FOUND ||
        code === RpcErrorCode.INVALID_PARAMS ||
        code === RpcErrorCode.METHOD_NOT_SUPPORTED ||
        code === RpcErrorCode.ACCESS_DENIED
      ? "not_sent"
      : "unknown";

type Fetch = (url: string) => Promise<Response>;

/** Confirmed plus mempool balance in satoshis (Esplora `/address`). */
export async function getBitcoinBalance(
  asset: IntentWalletAsset,
  owner: string,
  {
    apiUrl = INTENTS_BITCOIN_API_URL,
    fetcher = fetch,
  }: { apiUrl?: string; fetcher?: Fetch } = {}
): Promise<bigint> {
  if (asset.kind !== "native")
    throw new Error("Only BTC can be sent from a Bitcoin wallet.");
  const response = await fetcher(
    `${apiUrl.replace(/\/$/, "")}/address/${encodeURIComponent(owner)}`
  );
  if (!response.ok)
    throw new Error(`The Bitcoin API answered ${response.status}.`);
  const { chain_stats: chain, mempool_stats: mempool } =
    (await response.json()) as Record<
      "chain_stats" | "mempool_stats",
      { funded_txo_sum: number; spent_txo_sum: number }
    >;
  return BigInt(
    chain.funded_txo_sum -
      chain.spent_txo_sum +
      mempool.funded_txo_sum -
      mempool.spent_txo_sum
  );
}

/**
 * Bitcoin wallets through sats-connect (Xverse, Unisat, Fordefi, and any
 * provider in `window.btc_providers` such as Leather or Magic Eden). The
 * wallet picks the inputs and the fee; the payment address is the sender and
 * the refund address.
 */
export function createBitcoinWalletAdapter(
  options: { apiUrl?: string; fetcher?: Fetch } = {},
  call: (providerId: string) => Call = callerOf
): IntentWalletAdapter {
  const connected = new Map<string, string>();
  const nameOf = (walletId: string) =>
    listProviders().find((wallet) => wallet.id === walletId)?.name ??
    "Bitcoin wallet";

  return {
    family: "bitcoin",
    getWallets: listProviders,
    // Providers inject on load; the picker re-reads on open.
    onWalletsChange: () => () => {},
    async connect(walletId) {
      const result = await call(walletId)("getAccounts", {
        purposes: [AddressPurpose.Payment],
        message:
          "Equiteez uses this address to send your deposit and receive refunds.",
      });
      if (result.status === "error")
        throw new Error(
          failureOf(result.error.code) === "rejected"
            ? "The connection was declined in the wallet."
            : result.error.message
        );
      const payment = result.result.find(
        (item) => item.purpose === AddressPurpose.Payment
      );
      if (!payment) throw new Error("The wallet shared no payment address.");
      // Testnet/signet addresses are refused: deposits are mainnet only.
      if (getRefundAddressError(bitcoin, payment.address))
        throw new Error(
          "Switch the wallet to Bitcoin mainnet and connect again."
        );
      connected.set(walletId, payment.address);
      return {
        walletId,
        walletName: nameOf(walletId),
        address: payment.address,
      };
    },
    async disconnect(walletId) {
      connected.delete(walletId);
    },
    // Reading accounts prompts in some wallets: the connected one is kept.
    getAccount: async (walletId) => connected.get(walletId) ?? null,
    getBalance: (asset, owner) => getBitcoinBalance(asset, owner, options),
    async send(walletId, { asset, from, to, amount }) {
      const address = connected.get(walletId);
      if (!address || !isSameNetworkAddress(bitcoin, address, from))
        throw new IntentWalletError(
          "not_sent",
          "Reconnect the Bitcoin wallet you reviewed the deposit with."
        );
      if (asset.kind !== "native")
        throw new IntentWalletError(
          "not_sent",
          "Only BTC can be sent from a Bitcoin wallet."
        );
      if (amount > BigInt(Number.MAX_SAFE_INTEGER))
        throw new IntentWalletError("not_sent", "The amount is too large.");
      let result: RpcResult<"sendTransfer">;
      try {
        result = await call(walletId)("sendTransfer", {
          recipients: [{ address: to, amount: Number(amount) }],
        });
      } catch (error) {
        throw new IntentWalletError(
          classifyIntentWalletError(error),
          error instanceof Error ? error.message : "The wallet did not send."
        );
      }
      if (result.status === "error")
        throw new IntentWalletError(
          failureOf(result.error.code),
          result.error.message
        );
      if (!/^[0-9a-fA-F]{64}$/.test(result.result.txid))
        throw new IntentWalletError(
          "unknown",
          "The wallet did not return a transaction ID."
        );
      return result.result.txid.toLowerCase();
    },
  };
}
