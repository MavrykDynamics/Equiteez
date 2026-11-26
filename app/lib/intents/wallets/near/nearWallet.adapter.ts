import { actionCreators, type Action } from "@near-js/transactions";
import {
  setupWalletSelector,
  type InjectedWallet,
  type WalletSelector,
} from "@near-wallet-selector/core";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";

import { INTENTS_NEAR_RPC_URL } from "~/consts/intents";
import {
  getIntentNetwork,
  getRefundAddressError,
} from "~/lib/intents/intentNetworks";
import {
  classifyIntentWalletError,
  IntentWalletError,
  type IntentWalletAdapter,
  type IntentWalletAsset,
  type IntentWalletOption,
  type IntentWalletTransfer,
} from "../intentWallet.types";

const near = getIntentNetwork("near")!;
const TGAS = 10n ** 12n;
const FT_TRANSFER_GAS = 30n * TGAS;
const STORAGE_DEPOSIT_GAS = 30n * TGAS;
/** NEP-145 minimum when a token does not report its bounds (0.00125 NEAR). */
const DEFAULT_STORAGE_DEPOSIT = 1_250_000_000_000_000_000_000n;

type Fetch = (url: string, init: RequestInit) => Promise<Response>;

/** Minimal NEAR JSON-RPC client for view calls. */
export function createNearReader({
  rpcUrl = INTENTS_NEAR_RPC_URL,
  fetcher = fetch,
}: { rpcUrl?: string; fetcher?: Fetch } = {}) {
  const query = async (params: Record<string, unknown>) => {
    const response = await fetcher(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "equiteez",
        method: "query",
        params: { finality: "final", ...params },
      }),
    });
    if (!response.ok)
      throw new Error(`The NEAR RPC answered ${response.status}.`);
    const body = (await response.json()) as {
      result?: Record<string, unknown>;
      error?: { message?: string; cause?: { name?: string } };
    };
    if (body.error)
      throw Object.assign(new Error(body.error.message ?? "NEAR RPC error"), {
        cause: body.error.cause?.name,
      });
    return body.result!;
  };
  const view = async <T>(contract: string, method: string, args: object) => {
    const result = await query({
      request_type: "call_function",
      account_id: contract,
      method_name: method,
      args_base64: btoa(JSON.stringify(args)),
    });
    const bytes = new Uint8Array(result.result as number[]);
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  };
  return {
    async getBalance(asset: IntentWalletAsset, owner: string) {
      if (asset.kind === "native") {
        const account = await query({
          request_type: "view_account",
          account_id: owner,
        });
        return BigInt(account.amount as string);
      }
      const balance = await view<string>(
        asset.contractAddress!,
        "ft_balance_of",
        {
          account_id: owner,
        }
      );
      return BigInt(balance);
    },
    /** NEP-145: whether the account can receive the token, and the deposit if not. */
    async getStorageDeposit(token: string, account: string) {
      const balance = await view<unknown>(token, "storage_balance_of", {
        account_id: account,
      });
      if (balance) return null;
      try {
        const bounds = await view<{ min?: string }>(
          token,
          "storage_balance_bounds",
          {}
        );
        return bounds.min ? BigInt(bounds.min) : DEFAULT_STORAGE_DEPOSIT;
      } catch {
        return DEFAULT_STORAGE_DEPOSIT;
      }
    },
  };
}
export type NearReader = ReturnType<typeof createNearReader>;

/**
 * The exact deposit transaction: a Transfer of native NEAR to the deposit
 * account, or `ft_transfer` (1 yoctoNEAR attached) on the token contract,
 * preceded by `storage_deposit` when the deposit account is not registered.
 */
export async function buildNearTransfer(
  reader: NearReader,
  { asset, to, amount }: IntentWalletTransfer
): Promise<{ receiverId: string; actions: Action[] }> {
  if (asset.kind === "native")
    return { receiverId: to, actions: [actionCreators.transfer(amount)] };
  const token = asset.contractAddress;
  if (!token)
    throw new IntentWalletError("not_sent", "The NEAR token is unknown.");
  const storage = await reader.getStorageDeposit(token, to);
  const actions: Action[] = [];
  if (storage !== null)
    actions.push(
      actionCreators.functionCall(
        "storage_deposit",
        { account_id: to, registration_only: true },
        STORAGE_DEPOSIT_GAS,
        storage
      )
    );
  actions.push(
    actionCreators.functionCall(
      "ft_transfer",
      { receiver_id: to, amount: amount.toString() },
      FT_TRANSFER_GAS,
      1n
    )
  );
  return { receiverId: token, actions };
}

/** Transaction hash from whatever the wallet returns. */
const hashOf = (outcome: unknown): string | undefined => {
  const value = outcome as {
    transaction?: { hash?: string };
    transaction_outcome?: { id?: string };
  } | null;
  return value?.transaction?.hash ?? value?.transaction_outcome?.id;
};

/**
 * NEAR wallets through near-wallet-selector. Only wallets that sign without
 * leaving the page (Meteor, HERE) are offered: a redirect would interrupt the
 * deposit screen.
 */
export async function createNearWalletAdapter({
  selector: selectorPromise = setupWalletSelector({
    network: "mainnet",
    modules: [setupMeteorWallet(), setupHereWallet()],
  }),
  reader = createNearReader(),
}: {
  selector?: Promise<WalletSelector>;
  reader?: NearReader;
} = {}): Promise<IntentWalletAdapter> {
  const selector = await selectorPromise;
  const connected = new Map<string, string>();
  const modules = () => selector.store.getState().modules;
  const nameOf = (walletId: string) =>
    modules().find((module) => module.id === walletId)?.metadata.name ??
    "NEAR wallet";

  return {
    family: "near",
    getWallets(): IntentWalletOption[] {
      return modules()
        .filter((module) => !module.metadata.deprecated)
        .map((module) => {
          const downloadUrl = (module.metadata as { downloadUrl?: string })
            .downloadUrl;
          return {
            id: module.id,
            name: module.metadata.name,
            icon: module.metadata.iconUrl,
            isInstalled: module.metadata.available,
            installUrl: downloadUrl,
          };
        });
    },
    onWalletsChange(listener) {
      const subscription = selector.store.observable.subscribe(() =>
        listener()
      );
      return () => subscription.unsubscribe();
    },
    async connect(walletId) {
      // Meteor and HERE are injected wallets: no page redirect.
      const wallet = await selector.wallet<InjectedWallet>(walletId);
      const accounts = await wallet.signIn({});
      const accountId = accounts[0]?.accountId;
      if (!accountId) throw new Error("The wallet shared no NEAR account.");
      if (getRefundAddressError(near, accountId))
        throw new Error("The wallet shared an unsupported NEAR account.");
      connected.set(walletId, accountId);
      return { walletId, walletName: nameOf(walletId), address: accountId };
    },
    async disconnect(walletId) {
      connected.delete(walletId);
      try {
        await (await selector.wallet(walletId)).signOut();
      } catch {
        // Already signed out in the wallet.
      }
    },
    async getAccount(walletId) {
      const accountId = connected.get(walletId);
      if (!accountId) return null;
      const wallet = await selector.wallet(walletId);
      const accounts = await wallet.getAccounts();
      return accounts.some((account) => account.accountId === accountId)
        ? accountId
        : (accounts[0]?.accountId ?? null);
    },
    getBalance: (asset, owner) => reader.getBalance(asset, owner),
    async send(walletId, transfer) {
      if (connected.get(walletId) !== transfer.from)
        throw new IntentWalletError(
          "not_sent",
          "Reconnect the NEAR wallet you reviewed the deposit with."
        );
      let transaction: Awaited<ReturnType<typeof buildNearTransfer>>;
      try {
        transaction = await buildNearTransfer(reader, transfer);
      } catch (error) {
        if (error instanceof IntentWalletError) throw error;
        throw new IntentWalletError(
          "not_sent",
          `The NEAR network could not be reached: ${error instanceof Error ? error.message : "unknown error"}.`
        );
      }
      let outcome: unknown;
      try {
        const wallet = await selector.wallet(walletId);
        outcome = await wallet.signAndSendTransaction({
          signerId: transfer.from,
          ...transaction,
        });
      } catch (error) {
        throw new IntentWalletError(
          classifyIntentWalletError(error),
          error instanceof Error ? error.message : "The wallet did not send."
        );
      }
      const hash = hashOf(outcome);
      if (!hash)
        throw new IntentWalletError(
          "unknown",
          "The wallet did not return a transaction hash. Check it before sending anything else."
        );
      return hash;
    },
  };
}
