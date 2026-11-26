import { beforeEach, describe, expect, it, vi } from "vitest";
import { erc20Abi, UserRejectedRequestError, type Hash } from "viem";
import type { Config } from "wagmi";

import type { IntentOperation, IntentsApi } from "~/lib/apis/intents";
import {
  fixtureCapability,
  fixtureDeposit,
  fixtureNativeOption,
  fixtureOperationId,
  fixtureQuoteId,
  fixtureRecipient,
  fixtureSettlement,
  fixtureSolanaOption,
  fixtureSolanaRefund,
  fixtureSource,
  instructions,
  memoryStorage,
  operation,
  record,
  request,
} from "~/lib/intents/intents.fixtures";
import { createIntentRecord } from "~/lib/intents/intentOperation";
import { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import {
  executeIntentFunding,
  IntentFundingBlockedError,
  markIntentSentExternally,
  simulateIntentFunding,
} from "./intentsFunding.contract";

const actions = vi.hoisted(() => ({
  getAccount: vi.fn(),
  getBalance: vi.fn(),
  readContract: vi.fn(),
  sendTransaction: vi.fn(),
  switchChain: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  writeContract: vi.fn(),
}));
vi.mock("wagmi/actions", () => actions);

const config = {} as Config;
const hash = `0x${"b".repeat(64)}` as Hash;
const now = () => Date.parse("2026-11-13T10:00:00Z");
let session: IntentOperations;
let snapshot: IntentOperation;
let api: IntentsApi & { getOperation: ReturnType<typeof vi.fn> };

const nativeRequest = request({
  sourceAssetId: fixtureNativeOption.assetId,
  amountIn: "10000000000000000",
});
const nativeInstructions = instructions({
  sourceNetwork: "eth",
  originAsset: fixtureNativeOption.assetId,
  amount: nativeRequest.amountIn,
});

function prepare(kind: "erc20" | "native" = "erc20") {
  session = new IntentOperations(fixtureRecipient, "mock", () =>
    memoryStorage()
  );
  const base =
    kind === "erc20"
      ? record()
      : createIntentRecord({
          localId: "local-1",
          account: fixtureRecipient,
          env: "mock",
          option: fixtureNativeOption,
          settlement: fixtureSettlement,
          request: nativeRequest,
          sourceWallet: fixtureSource,
          credentials: {
            capability: fixtureCapability,
            idempotencyKey: "idem-key-1",
          },
        });
  snapshot =
    kind === "erc20"
      ? operation()
      : operation({
          ...nativeRequest,
          fundingInstructions: nativeInstructions,
        });
  session.upsert({ ...base, operationId: fixtureOperationId });
  session.applyBackend("local-1", snapshot);
  actions.getAccount.mockReturnValue({
    isConnected: true,
    address: fixtureSource,
    chainId: base.source.evmChainId,
  });
}

const fund = (isCurrent = () => true, reviewedQuoteId = fixtureQuoteId) =>
  executeIntentFunding({
    config,
    api,
    session,
    localId: "local-1",
    reviewedQuoteId,
    isCurrent,
    now,
  });
const current = () => session.get("local-1")!;

beforeEach(() => {
  vi.resetAllMocks();
  api = {
    env: "http",
    createOperation: vi.fn(),
    getMetadata: vi.fn(),
    previewQuote: vi.fn(),
    getOperation: vi.fn(async () => snapshot),
  };
  actions.getBalance.mockResolvedValue({ value: 10n ** 20n });
  actions.readContract.mockResolvedValue(10n ** 20n);
  actions.writeContract.mockResolvedValue(hash);
  actions.sendTransaction.mockResolvedValue(hash);
  actions.waitForTransactionReceipt.mockResolvedValue({ status: "success" });
  prepare();
});

describe("executeIntentFunding", () => {
  it("re-reads the operation, then transfers the exact amount to the 1Click deposit address", async () => {
    let stateAtPrompt: string | undefined;
    actions.writeContract.mockImplementation(async () => {
      stateAtPrompt = current().fundingState;
      return hash;
    });
    await expect(fund()).resolves.toBe("confirmed");
    expect(api.getOperation).toHaveBeenCalledWith(
      fixtureCapability,
      fixtureOperationId
    );
    expect(actions.writeContract).toHaveBeenCalledWith(config, {
      account: fixtureSource,
      chainId: 8453,
      address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      abi: erc20Abi,
      functionName: "transfer",
      // depositAddress, never forwarderAddress.
      args: [fixtureDeposit, 25000000n],
    });
    expect(stateAtPrompt).toBe("prompted");
    expect(current()).toMatchObject({
      fundingState: "confirmed",
      sourceHashes: [hash],
      isWidgetRequested: true,
      lastInstructions: { quoteId: fixtureQuoteId },
    });
    expect(actions.sendTransaction).not.toHaveBeenCalled();
  });

  it("sends native value on the asset's chain", async () => {
    prepare("native");
    let chainId = 8453;
    actions.getAccount.mockImplementation(() => ({
      isConnected: true,
      address: fixtureSource,
      chainId,
    }));
    actions.switchChain.mockImplementation(async (_, target) => {
      chainId = target.chainId;
    });
    await fund();
    expect(actions.switchChain).toHaveBeenCalledWith(config, {
      chainId: 1,
    });
    expect(actions.sendTransaction).toHaveBeenCalledWith(config, {
      account: fixtureSource,
      chainId: 1,
      to: fixtureDeposit,
      value: 10000000000000000n,
    });
  });

  it.each([
    [
      "expired",
      { fundingStatus: "EXPIRED", fundingInstructions: null },
      /expired/,
    ],
    ["paused", { fundingStatus: "PAUSED" }, /paused/],
    [
      "observed",
      { fundingStatus: "OBSERVED", fundingInstructions: null },
      /already observed/,
    ],
    ["rejected", { closure: "QUOTE_REJECTED" }, /rejected/],
    [
      "changed quote",
      {
        fundingInstructions: instructions({
          quoteId: "00000000-0000-4000-8000-000000000000",
        }),
      },
      /quote changed/,
    ],
    [
      "different amount",
      { fundingInstructions: instructions({ amount: "1" }) },
      /amount/,
    ],
    [
      "about to expire",
      {
        fundingInstructions: instructions({
          fundingExpiresAt: "2026-11-13T10:00:10.000Z",
        }),
      },
      /about to expire/,
    ],
    ["changed request", { amountIn: "1" }, /does not match/],
    [
      "a memo deposit",
      { fundingInstructions: instructions({ depositMemo: "42" }) },
      /memo/,
    ],
  ] as const)(
    "never prompts when the fresh operation is %s",
    async (_, patch, message) => {
      snapshot = operation(patch as Partial<IntentOperation>);
      await expect(fund()).rejects.toThrow(message);
      expect(actions.writeContract).not.toHaveBeenCalled();
      expect(current().fundingState).toBe("not_started");
      expect(current().fundingError).toMatch(message);
    }
  );

  it("does not prompt when the operation cannot be re-read", async () => {
    api.getOperation.mockRejectedValue(new Error("offline"));
    await expect(fund()).rejects.toBeInstanceOf(IntentFundingBlockedError);
    expect(actions.writeContract).not.toHaveBeenCalled();
  });

  it("requires the reviewed source wallet", async () => {
    actions.getAccount.mockReturnValue({
      isConnected: true,
      address: "0x9999999999999999999999999999999999999999",
      chainId: 8453,
    });
    await expect(fund()).rejects.toThrow(/source wallet changed/);
    expect(api.getOperation).not.toHaveBeenCalled();
  });

  it("allows another request only after a wallet rejection", async () => {
    actions.writeContract.mockRejectedValueOnce(
      new UserRejectedRequestError(new Error("no"))
    );
    await expect(fund()).resolves.toBe("rejected");
    await expect(fund()).resolves.toBe("confirmed");
    expect(actions.writeContract).toHaveBeenCalledTimes(2);
  });

  it("never sends again after an unknown wallet outcome", async () => {
    actions.writeContract.mockRejectedValueOnce(new Error("RPC died"));
    await expect(fund()).resolves.toBe("unknown");
    await expect(fund()).rejects.toThrow(/already sent/);
    expect(actions.writeContract).toHaveBeenCalledTimes(1);
  });

  it("keeps a late hash after the account changed", async () => {
    let isCurrent = true;
    actions.writeContract.mockImplementation(async () => {
      isCurrent = false;
      return hash;
    });
    await fund(() => isCurrent);
    expect(current().sourceHashes).toEqual([hash]);
  });

  it("marks cancelled replacements and reverts", async () => {
    actions.waitForTransactionReceipt.mockImplementationOnce(
      async (_, { onReplaced }) => {
        onReplaced({ reason: "cancelled", transaction: { hash } });
        return { status: "success" };
      }
    );
    await expect(fund()).resolves.toBe("unknown");
    expect(current().fundingError).toMatch(/replaced or cancelled/);
    prepare();
    actions.waitForTransactionReceipt.mockResolvedValueOnce({
      status: "reverted",
    });
    await expect(fund()).resolves.toBe("reverted");
  });

  it("keeps repriced replacement hashes for support", async () => {
    const replacement = `0x${"e".repeat(64)}` as Hash;
    actions.waitForTransactionReceipt.mockImplementationOnce(
      async (_, { onReplaced }) => {
        onReplaced({ reason: "repriced", transaction: { hash: replacement } });
        return { status: "success" };
      }
    );
    const result = await fund();
    expect(result).toBe("confirmed");
    expect(current().sourceHashes).toEqual([hash, replacement]);
  });

  it("refuses without a reviewed wallet or on a non-EVM network", async () => {
    session.upsert({
      ...current(),
      sourceWallet: undefined,
      sequence: current().sequence + 1,
    });
    await expect(fund()).rejects.toThrow(/Connect an EVM wallet/);
    session = new IntentOperations(fixtureRecipient, "mock", () =>
      memoryStorage()
    );
    const solana = createIntentRecord({
      localId: "local-1",
      account: fixtureRecipient,
      env: "mock",
      option: fixtureSolanaOption,
      settlement: fixtureSettlement,
      request: request({
        sourceAssetId: fixtureSolanaOption.assetId,
        refundAddress: fixtureSolanaRefund,
      }),
      credentials: {
        capability: fixtureCapability,
        idempotencyKey: "k-123456",
      },
    });
    session.upsert({ ...solana, operationId: fixtureOperationId });
    await expect(fund()).rejects.toThrow(/Connect an EVM wallet/);
    expect(actions.sendTransaction).not.toHaveBeenCalled();
  });

  it("is disabled against the mock API", async () => {
    api = { ...api, env: "mock" };
    await expect(fund()).rejects.toThrow(/mock/);
    expect(actions.writeContract).not.toHaveBeenCalled();
  });
});

describe("markIntentSentExternally", () => {
  it("records an external deposit once, only while instructions are published", () => {
    expect(markIntentSentExternally(session, "local-1")).toBe(true);
    expect(current()).toMatchObject({
      fundingState: "external",
      isWidgetRequested: true,
      lastInstructions: { quoteId: fixtureQuoteId },
    });
    expect(markIntentSentExternally(session, "local-1")).toBe(false);
  });

  it("is refused before the address is published", () => {
    session.applyBackend(
      "local-1",
      operation({
        revision: 3,
        fundingStatus: "EXPIRED",
        fundingInstructions: null,
      })
    );
    expect(markIntentSentExternally(session, "local-1")).toBe(false);
    expect(current().fundingState).toBe("not_started");
  });
});

describe("simulateIntentFunding", () => {
  it("is refused outside mock mode", () => {
    expect(() => simulateIntentFunding(api, session, "local-1")).toThrow(
      /mock mode/
    );
  });

  it("reports the deposit to the mock once, without a wallet", () => {
    const simulateDeposit = vi.fn();
    const mock = { ...api, env: "mock", simulateDeposit };
    simulateIntentFunding(mock, session, "local-1");
    expect(current()).toMatchObject({ fundingState: "external" });
    expect(simulateDeposit).toHaveBeenCalledWith(
      fixtureCapability,
      fixtureOperationId
    );
    simulateIntentFunding(mock, session, "local-1");
    expect(simulateDeposit).toHaveBeenCalledTimes(1);
    expect(actions.sendTransaction).not.toHaveBeenCalled();
  });
});
