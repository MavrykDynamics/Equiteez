import { beforeEach, describe, expect, it, vi } from "vitest";
import { erc20Abi, UserRejectedRequestError, type Hash } from "viem";
import type { Config } from "wagmi";

import type { IntentOperation, IntentsApi } from "~/lib/apis/intents";
import {
  fixtureCapability,
  fixtureDeposit,
  fixtureNativeRoute,
  fixtureOperationId,
  fixtureQuoteId,
  fixtureRecipient,
  fixtureSource,
  instructions,
  memoryStorage,
  operation,
  record,
  request,
  resolveOption,
} from "~/lib/intents/intents.fixtures";
import { createIntentRecord } from "~/lib/intents/intentOperation";
import { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import {
  executeIntentFunding,
  IntentFundingBlockedError,
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
let api: IntentsApi & {
  getOperation: ReturnType<typeof vi.fn>;
  simulateDeposit: ReturnType<typeof vi.fn>;
};

const nativeOption = resolveOption(fixtureNativeRoute);
const nativeRequest = request({
  routeId: fixtureNativeRoute.id,
  amountIn: "10000000000000000",
});
const nativeInstructions = instructions({
  sourceChainId: fixtureNativeRoute.sourceChainId,
  originAsset: fixtureNativeRoute.originAsset,
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
          option: nativeOption,
          request: nativeRequest,
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
    chainId: base.source.chainId,
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
    getRoutes: vi.fn(),
    createOperation: vi.fn(),
    getOperation: vi.fn(async () => snapshot),
    simulateDeposit: vi.fn(async () => {}),
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
      chainId: 421614,
      address: "0x5C05e82bE66B19476bAcb558E62e7d449b98635F",
      abi: erc20Abi,
      functionName: "transfer",
      // depositAddress, never forwarderAddress.
      args: [fixtureDeposit, 2000000000000000000n],
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

  it("sends native value on the route's chain", async () => {
    prepare("native");
    let chainId = 421614;
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
      chainId: 11155111,
    });
    expect(actions.sendTransaction).toHaveBeenCalledWith(config, {
      account: fixtureSource,
      chainId: 11155111,
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
      chainId: 421614,
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

  it("tells only the mock backend about the deposit", async () => {
    await fund();
    expect(api.simulateDeposit).toHaveBeenCalledWith(
      fixtureCapability,
      fixtureOperationId
    );
  });
});

describe("simulateIntentFunding", () => {
  it("is refused outside mock mode", () => {
    expect(() => simulateIntentFunding(api, session, "local-1")).toThrow(
      /mock mode/
    );
  });

  it("records a fake hash and notifies the mock when funding is available", () => {
    const mock = { ...api, env: "mock" };
    simulateIntentFunding(mock, session, "local-1");
    expect(current()).toMatchObject({ fundingState: "confirmed" });
    expect(current().sourceHashes).toHaveLength(1);
    expect(api.simulateDeposit).toHaveBeenCalledTimes(1);
    simulateIntentFunding(mock, session, "local-1");
    expect(api.simulateDeposit).toHaveBeenCalledTimes(1);
  });
});
