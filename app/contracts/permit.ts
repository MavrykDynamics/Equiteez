import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { Schema } from "@mavrykdynamics/taquito-michelson-encoder";
import type { BeaconWallet } from "@mavrykdynamics/taquito-beacon-wallet";
import type { SigningType } from "@mavrykdynamics/beacon-dapp";
import type { MichelsonType } from "@mavrykdynamics/taquito-michel-codec";
import { BigNumber } from "bignumber.js";
import {
  relayConfigSchema,
  relaySubmitSchema,
  relayTopUpSchema,
} from "~/lib/apis/rwa/relay/relay.schema";
import type { RelayConfig } from "~/lib/apis/rwa/relay/relay.types";
import { toNatString } from "~/lib/utils/formaters";
import {
  assertPermitSigner,
  encodePermit,
  findAnnotation,
  fingerprint,
  hashBytes,
  scriptFingerprint,
  toPermitDeadline,
  verifyPermitSignature,
} from "./permitCodec";
import { permitGeneration } from "./permitGeneration";
import { buildPermitAction, type PermitRequest } from "./orderbookPermit";

export type PermitScope = {
  wallet: string;
  authenticatedWallet: string;
  network: string;
  rpcUrl: string;
  chainId: string;
  apiUrl: string;
  // Increment on wallet/auth/network changes, including away-and-back during a prompt.
  revision: number;
};
export type PermitRuntime = {
  tezos: MavrykToolkit;
  client: Pick<
    BeaconWallet["client"],
    "getActiveAccount" | "requestSignPayload"
  >;
  getScope: () => PermitScope;
  refreshConfig: () => Promise<RelayConfig>;
};
type Contract = Awaited<ReturnType<MavrykToolkit["contract"]["at"]>>;
type NatValue = string | BigNumber;
type BookStorage = {
  lambdaLedger: { get(key: string): Promise<string | undefined> };
  rwaTokenAddress: string;
  rwaTokenDecimals: NatValue;
  config: Record<string, NatValue>;
  currencyLedger: {
    get(
      key: string
    ): Promise<
      | { tokenContractAddress: string; tokenId: NatValue; decimals: NatValue }
      | undefined
    >;
  };
};

function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const scopeKey = (scope: PermitScope) =>
  JSON.stringify([
    scope.wallet,
    scope.authenticatedWallet,
    scope.network,
    scope.rpcUrl,
    scope.chainId,
    scope.apiUrl,
    scope.revision,
  ]);

async function assertScope(
  runtime: PermitRuntime,
  scope: PermitScope,
  publicKey?: string
) {
  const same = () => {
    if (
      !scope.wallet ||
      scope.wallet !== scope.authenticatedWallet ||
      !scope.chainId ||
      !scope.apiUrl ||
      !scope.network ||
      !Number.isSafeInteger(scope.revision) ||
      scopeKey(runtime.getScope()) !== scopeKey(scope) ||
      runtime.tezos.rpc.getRpcUrl() !== scope.rpcUrl
    ) {
      throw new Error(
        "Wallet, network or sign-in changed. Review the action again."
      );
    }
  };
  same();
  const account = await runtime.client.getActiveAccount();
  same();
  if (
    !account ||
    account.address !== scope.wallet ||
    account.network.type !== scope.network ||
    (account.network.rpcUrl && account.network.rpcUrl !== scope.rpcUrl) ||
    !account.publicKey ||
    (publicKey && publicKey !== account.publicKey)
  ) {
    throw new Error(
      "The active wallet account changed. Review the action again."
    );
  }
  assertPermitSigner(account.publicKey, scope.wallet);
  const wallet = await runtime.tezos.wallet.pkh();
  same();
  const chain = await runtime.tezos.rpc.getChainId();
  same();
  if (wallet !== scope.wallet || chain !== scope.chainId)
    throw new Error("Wallet or chain does not match the permit review");
  return account.publicKey;
}

function checkGeneration(
  contract: Contract,
  kind: "orderbook" | "quote_token" | "rwa_token"
) {
  if (scriptFingerprint(contract.script.code) !== permitGeneration[kind])
    throw new Error(
      "Unsupported permit contract generation. Refresh the deployment evidence."
    );
  const parameter = contract.script.code.find(
    (node) => "prim" in node && node.prim === "parameter"
  );
  const entrypoint = findAnnotation(parameter, "%permitAndExecute");
  if (
    Array.isArray(entrypoint) ||
    entrypoint.prim !== "list" ||
    Array.isArray(entrypoint.args[0]) ||
    entrypoint.args[0].prim !== "pair"
  )
    throw new Error("Unsupported permit envelope");
  const fields = entrypoint.args[0].args;
  if (
    fields.length !== 4 ||
    fields
      .map((field) => (Array.isArray(field) ? undefined : field.annots?.[0]))
      .join() !== "%userPublicKey,%userSignature,%action,%deadline"
  )
    throw new Error("Unsupported permit envelope");
  return findAnnotation(entrypoint, "%action");
}

async function checkBook(
  runtime: PermitRuntime,
  request: PermitRequest,
  checked: <T>(task: Promise<T>) => Promise<T>
) {
  if (!("book" in request)) return;
  const { book } = request;
  const contract = await checked(runtime.tezos.contract.at(book.address));
  checkGeneration(contract, "orderbook");
  const storage = await checked(contract.storage<BookStorage>());
  const currency = await checked(storage.currencyLedger.get(book.currencyKey));
  if (
    request.kind === "place_sell_order" ||
    (request.kind === "update_operators" && request.side === "sell")
  ) {
    const lambda = await checked(
      storage.lambdaLedger.get("lambdaPlaceSellOrder")
    );
    if (
      !lambda ||
      hashBytes(lambda) !== permitGeneration.orderbookSellLambda ||
      book.rwaTokenId !== permitGeneration.rwaTokenId
    )
      throw new Error("Unsupported RWA token ID or sell execution generation");
  }

  if (
    storage.rwaTokenAddress !== book.baseTokenAddress ||
    !currency ||
    currency.tokenContractAddress !== book.quoteTokenAddress ||
    toNatString(currency.tokenId) !== book.quoteTokenId
  )
    throw new Error(
      "The selected book/token relationship changed. Review again."
    );
  if (
    "order" in request &&
    request.order.baseTokenDecimals !==
      Number(toNatString(storage.rwaTokenDecimals))
  )
    throw new Error("Base token decimals changed");
  const settings = {
    tickSize: "priceTickSize",
    quantityTickSize: "quantityTickSize",
    minBuyOrderAmount: "minBuyOrderAmount",
    minBuyOrderValue: "minBuyOrderValue",
    minSellOrderAmount: "minSellOrderAmount",
    minSellOrderValue: "minSellOrderValue",
  } as const;
  for (const [key, field] of Object.entries(settings)) {
    if (
      toNatString(storage.config[field]) !== book[key as keyof typeof settings]
    )
      throw new Error("Orderbook settings changed. Refresh and review again.");
  }
  return {
    baseDecimals: Number(toNatString(storage.rwaTokenDecimals)),
    quoteDecimals: Number(toNatString(currency.decimals)),
  };
}

export type PermitReviewField = { label: string; value: string };
function reviewFields(
  scope: PermitScope,
  request: PermitRequest,
  built: ReturnType<typeof buildPermitAction>,
  config: RelayConfig,
  deadline: string,
  decimals?: { baseDecimals: number; quoteDecimals: number }
): PermitReviewField[] {
  const rows: PermitReviewField[] = [
    { label: "Network", value: `${scope.network} · ${scope.chainId}` },
    { label: "Payment method", value: "Credits · sponsored network gas" },
    { label: "Wallet", value: scope.wallet },
    {
      label: "Action",
      value: {
        place_buy_order: "Place buy order",
        place_sell_order: "Place sell order",
        cancel_orders: "Cancel orders",
        process_refund: "Claim refund",
        update_operators: "Grant token permission",
        fee_top_up: "Top up Credits",
      }[request.kind],
    },
    { label: "Contract", value: built.contract },
    {
      label: "Permit expires",
      value: new Date(Number(deadline) * 1000).toISOString(),
    },
  ];
  const intent = built.intent;
  if (
    intent?.kind === "place_buy_order" ||
    intent?.kind === "place_sell_order"
  ) {
    if (decimals)
      rows.push(
        {
          label: "RWA amount",
          value: new BigNumber(intent.rwaTokenAmount)
            .shiftedBy(-decimals.baseDecimals)
            .toFixed(),
        },
        {
          label: `Price per RWA (${intent.currency})`,
          value: new BigNumber(intent.pricePerRwaToken)
            .shiftedBy(-decimals.quoteDecimals)
            .toFixed(),
        }
      );
    rows.push(
      {
        label: "Order",
        value: `${intent.kind === "place_buy_order" ? "Buy" : "Sell"} · ${intent.isMarketOrder ? "Market" : "Limit"}`,
      },
      { label: "RWA amount (raw units)", value: intent.rwaTokenAmount },
      {
        label: `Price (${intent.currency}, raw units)`,
        value: intent.pricePerRwaToken,
      },
      { label: "Order expiry", value: intent.orderExpiry ?? "No expiry" }
    );
  } else if (intent?.kind === "cancel_orders") {
    rows.push({
      label: "Cancel orders",
      value: intent.orders
        .map((o) => `${o.orderType} #${o.orderId}`)
        .join(", "),
    });
  } else if (intent?.kind === "process_refund") {
    const orders = intent.orders ?? [
      { orderId: intent.orderId!, orderType: intent.orderType! },
    ];
    rows.push({
      label: orders.length > 1 ? "Refund orders" : "Refund order",
      value: orders.map((o) => `${o.orderType} #${o.orderId}`).join(", "),
    });
  } else if (intent?.kind === "update_operators") {
    rows.push(
      { label: "Operator", value: intent.operator },
      { label: "Token ID", value: intent.tokenId },
      {
        label: "Permission",
        value:
          "Persistent operator permission for this token ID. It remains until revoked; it is not limited to this order.",
      }
    );
  }
  if (request.kind === "fee_top_up" && config.fee.enabled) {
    rows.push(
      {
        label: "Payment (token units)",
        value: new BigNumber(built.topUpAmount!)
          .shiftedBy(-config.fee.decimals)
          .toFixed(),
      },
      { label: "Payment (raw units)", value: built.topUpAmount! },
      { label: "Token ID", value: String(config.fee.tokenId) },
      { label: "Collector", value: config.fee.collector },
      {
        label: "Credits",
        value:
          "Prepaid credit cannot be withdrawn. Confirmation is required before it is available.",
      }
    );
  }
  rows.push({
    label: "Service fee schedule (raw token units)",
    value: config.fee.enabled
      ? (config.fee.feeSchedule[built.variant] ?? "0")
      : "0 · fees disabled",
  });
  if (config.fee.enabled)
    rows.push(
      {
        label: "Fee token",
        value: `${config.fee.tokenContract} · ID ${config.fee.tokenId}`,
      },
      {
        label: "Fee review",
        value:
          "Scheduled rate before any free allowance. Existing orderbook protocol fees still apply.",
      }
    );
  return rows;
}

export async function preparePermit(
  runtime: PermitRuntime,
  input: PermitRequest,
  deadline?: string
) {
  const request = freeze(JSON.parse(JSON.stringify(input)) as PermitRequest);
  const scope = freeze({ ...runtime.getScope() });
  const publicKey = await assertScope(runtime, scope);
  const checked = async <T>(task: Promise<T>): Promise<T> => {
    const value = await task;
    await assertScope(runtime, scope, publicKey);
    return value;
  };
  const config = relayConfigSchema.parse(
    await checked(runtime.refreshConfig())
  );
  const built = buildPermitAction(request, config, scope.wallet);
  const decimals = await checked(checkBook(runtime, request, checked));
  const contract = await checked(runtime.tezos.contract.at(built.contract));
  const actionType = checkGeneration(
    contract,
    built.contractKind
  ) as MichelsonType;
  if (built.contractKind === "orderbook") {
    const storage = await checked(
      contract.storage<{
        lambdaLedger: { get(key: string): Promise<string | undefined> };
      }>()
    );
    const lambda = await checked(
      storage.lambdaLedger.get("lambdaPermitAndExecute")
    );
    if (!lambda || hashBytes(lambda) !== permitGeneration.orderbookLambda)
      throw new Error("Unsupported orderbook permit execution lambda");
  }
  const header = await checked(runtime.tezos.rpc.getBlockHeader());
  const now = Math.max(
    Math.floor(Date.now() / 1000),
    Math.floor(Date.parse(header.timestamp) / 1000)
  );
  if (!Number.isSafeInteger(now))
    throw new Error("Unable to establish permit time");
  const expires =
    deadline === undefined ? String(now + 900) : toNatString(deadline);
  if (BigInt(expires) <= BigInt(now) || BigInt(expires) > BigInt(now + 900))
    throw new Error(
      "Permit expired or deadline is outside the 15-minute review window"
    );
  // Read from the actual view; absent counters resolve to zero inside this verified generation.
  const rawCounter = await checked(
    contract.contractViews
      .getPermitCounter(scope.wallet)
      .executeView({ viewCaller: scope.wallet })
  );
  const counter = toNatString(rawCounter as NatValue, "Permit counter");
  const encoded = encodePermit({
    actionType,
    action: built.action,
    chainId: scope.chainId,
    contract: built.contract,
    counter,
    deadline: expires,
  });
  const fields = reviewFields(scope, request, built, config, expires, decimals);
  return freeze({
    request,
    scope,
    publicKey,
    built,
    counter,
    deadline: expires,
    ...encoded,
    fields,
    configFingerprint: fingerprint(config),
  });
}
export type PreparedPermit = Awaited<ReturnType<typeof preparePermit>>;

const usedReviews = new WeakSet<PreparedPermit>();
export async function assertPermitCurrent(
  runtime: PermitRuntime,
  prepared: PreparedPermit
) {
  await assertScope(runtime, prepared.scope, prepared.publicKey);
  const current = await preparePermit(
    runtime,
    prepared.request,
    prepared.deadline
  );
  if (
    scopeKey(current.scope) !== scopeKey(prepared.scope) ||
    current.publicKey !== prepared.publicKey ||
    current.payload !== prepared.payload ||
    current.configFingerprint !== prepared.configFingerprint ||
    fingerprint(current.built) !== fingerprint(prepared.built)
  ) {
    throw new Error(
      "The counter, configuration or action changed. Review and sign again."
    );
  }
}

/** Called only after the readable review is accepted. No wallet submission or HTTP mutation. */
export async function signPreparedPermit(
  runtime: PermitRuntime,
  prepared: PreparedPermit
) {
  if (usedReviews.has(prepared))
    throw new Error(
      "Review this action again before requesting another signature"
    );
  usedReviews.add(prepared);
  await assertPermitCurrent(runtime, prepared);
  const response = await runtime.client.requestSignPayload({
    signingType: "micheline" as SigningType,
    payload: prepared.payload,
    sourceAddress: prepared.scope.wallet,
  });
  await assertScope(runtime, prepared.scope, prepared.publicKey);
  verifyPermitSignature(
    prepared.payload,
    prepared.publicKey,
    response.signature,
    prepared.scope.wallet
  );
  await assertPermitCurrent(runtime, prepared);
  const contract = await runtime.tezos.contract.at(prepared.built.contract);
  await assertScope(runtime, prepared.scope, prepared.publicKey);
  checkGeneration(contract, prepared.built.contractKind);
  const item = {
    userPublicKey: prepared.publicKey,
    userSignature: response.signature,
    action: prepared.built.action,
    deadline: new Date(Number(prepared.deadline) * 1000).toISOString(),
  };
  const transfer = contract.methodsObject
    .permitAndExecute([item])
    .toTransferParams({ amount: 0 });
  const parameter = contract.script.code.find(
    (node) => "prim" in node && node.prim === "parameter"
  );
  const expectedValue: unknown = new Schema(
    findAnnotation(parameter, "%permitAndExecute")
  ).Encode([item]);
  if (
    transfer.to !== prepared.built.contract ||
    transfer.amount !== 0 ||
    transfer.parameter?.entrypoint !== "permitAndExecute" ||
    !Array.isArray(transfer.parameter.value) ||
    transfer.parameter.value.length !== 1 ||
    fingerprint(transfer.parameter.value) !== fingerprint(expectedValue)
  )
    throw new Error("Invalid permit transfer parameters");
  // Require the exact reviewed envelope, including signer, action and deadline.
  const operation = {
    to: transfer.to,
    amount: 0 as const,
    parameter: {
      entrypoint: "permitAndExecute" as const,
      value: transfer.parameter.value,
    },
  };
  const ordinary = prepared.built.intent
    ? relaySubmitSchema.parse({
        intent: prepared.built.intent,
        operation,
        permitCounter: prepared.counter,
      })
    : null;
  const topUp = prepared.built.topUpAmount
    ? relayTopUpSchema.parse({
        publicKey: prepared.publicKey,
        signature: response.signature,
        amountUnits: prepared.built.topUpAmount,
        // Never regenerated after signing: the same instant that was signed.
        deadline: toPermitDeadline(prepared.deadline),
      })
    : null;
  await assertPermitCurrent(runtime, prepared);
  return freeze({ prepared, operation, ordinary, topUp });
}
