import { beforeEach, describe, expect, it, vi } from "vitest";
import { erc20Abi, UserRejectedRequestError, type Hash } from "viem";
import type { Config } from "wagmi";

import type { IntentsApi } from "~/lib/apis/intents";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import {
  fixtureRecipient,
  fixtureSource,
  memoryStorage,
  operation,
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

const [usdt, eth] = mockIntentRoutes;
const config = {} as Config;
const deposit = "0x2222222222222222222222222222222222222222" as const;
const hash = `0x${"b".repeat(64)}` as Hash;
const api = { env: "mock" } as IntentsApi;
let session: IntentOperations;
let sendHint: ReturnType<typeof vi.fn>;

function prepare(route = usdt) {
  session = new IntentOperations(fixtureRecipient, "mock", () =>
    memoryStorage()
  );
  const funding = {
    chainId: route.source.chainId,
    depositAddress: deposit,
    token: route.source.token.address,
    amount: "2000000000000000000",
  };
  const record = createIntentRecord({
    localId: "local-1",
    account: fixtureRecipient,
    env: "mock",
    route,
    amountIn: funding.amount,
    sourceAddress: fixtureSource,
  });
  session.upsert(record);
  session.upsert({
    ...record,
    operationId: "op-1",
    funding,
    quoteExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    backend: operation({ routeId: route.id, funding }),
    sequence: 1,
  });
}

const fund = (isCurrent = () => true) =>
  executeIntentFunding({
    config,
    api,
    session,
    localId: "local-1",
    isCurrent,
    sendHint: sendHint as never,
  });
const record = () => session.get("local-1")!;

beforeEach(() => {
  vi.clearAllMocks();
  sendHint = vi.fn(async () => undefined);
  prepare();
  actions.getAccount.mockReturnValue({
    isConnected: true,
    address: fixtureSource,
    chainId: usdt.source.chainId,
  });
  actions.readContract.mockResolvedValue(10n ** 20n);
  actions.getBalance.mockResolvedValue({ value: 10n ** 20n });
  actions.writeContract.mockResolvedValue(hash);
  actions.sendTransaction.mockResolvedValue(hash);
  actions.waitForTransactionReceipt.mockResolvedValue({
    status: "success",
    transactionHash: hash,
  });
});

describe("funding call shapes", () => {
  it("transfers the exact ERC-20 amount to the 1Click deposit address", async () => {
    expect(await fund()).toBe("confirmed");
    expect(actions.writeContract).toHaveBeenCalledOnce();
    expect(actions.writeContract.mock.calls[0][1]).toMatchObject({
      chainId: usdt.source.chainId,
      address: usdt.source.token.address,
      abi: erc20Abi,
      functionName: "transfer",
      args: [deposit, 2000000000000000000n],
    });
    expect(actions.sendTransaction).not.toHaveBeenCalled();
    expect(record().sourceHashes).toEqual([hash]);
    expect(sendHint).toHaveBeenCalledOnce();
  });

  it("sends native value on the route's chain, switching networks first", async () => {
    prepare(eth);
    actions.getAccount.mockReturnValue({
      isConnected: true,
      address: fixtureSource,
      chainId: usdt.source.chainId,
    });
    actions.switchChain.mockImplementation(async () => {
      actions.getAccount.mockReturnValue({
        isConnected: true,
        address: fixtureSource,
        chainId: eth.source.chainId,
      });
    });
    expect(await fund()).toBe("confirmed");
    expect(actions.switchChain).toHaveBeenCalledWith(config, {
      chainId: eth.source.chainId,
    });
    expect(actions.sendTransaction.mock.calls[0][1]).toMatchObject({
      chainId: eth.source.chainId,
      to: deposit,
      value: 2000000000000000000n,
    });
    expect(actions.writeContract).not.toHaveBeenCalled();
  });
});

describe("persistence and no-resend guarantees", () => {
  it("persists the prompt before the wallet is asked", async () => {
    actions.writeContract.mockImplementation(async () => {
      expect(record().fundingState).toBe("prompted");
      return hash;
    });
    await fund();
  });

  it("allows a retry only after an explicit wallet rejection", async () => {
    actions.writeContract.mockRejectedValueOnce(
      new UserRejectedRequestError(new Error("declined"))
    );
    expect(await fund()).toBe("rejected");
    expect(record().sourceHashes).toEqual([]);
    expect(await fund()).toBe("confirmed");
    expect(actions.writeContract).toHaveBeenCalledTimes(2);
  });

  it("never resends after an unknown wallet result", async () => {
    actions.writeContract.mockRejectedValueOnce(new Error("RPC timeout"));
    expect(await fund()).toBe("unknown");
    await expect(fund()).rejects.toBeInstanceOf(IntentFundingBlockedError);
    expect(actions.writeContract).toHaveBeenCalledOnce();
  });

  it.each([
    "broadcast",
    "confirmed",
    "prompted",
    "unknown",
    "reverted",
  ] as const)("refuses to prompt again in state %s", async (fundingState) => {
    session.upsert({
      ...record(),
      fundingState,
      sequence: record().sequence + 1,
    });
    await expect(fund()).rejects.toBeInstanceOf(IntentFundingBlockedError);
    expect(actions.writeContract).not.toHaveBeenCalled();
  });

  it("keeps the source hash when the receipt cannot be checked", async () => {
    actions.waitForTransactionReceipt.mockRejectedValueOnce(
      new Error("timeout")
    );
    expect(await fund()).toBe("unknown");
    expect(record().sourceHashes).toEqual([hash]);
    expect(record().fundingError).toMatch(/Do not send it again/);
  });

  it("records a late wallet response after the account changed, in its own scope", async () => {
    let current = true;
    actions.writeContract.mockImplementation(async () => {
      current = false; // user switched Equiteez account while signing
      return hash;
    });
    await fund(() => current);
    expect(record().sourceHashes).toEqual([hash]);
    expect(record().fundingState).toBe("confirmed");
  });

  it("does not ask the wallet once the Equiteez account changed", async () => {
    await expect(fund(() => false)).rejects.toBeInstanceOf(
      IntentFundingBlockedError
    );
    expect(actions.writeContract).not.toHaveBeenCalled();
    expect(record().fundingState).toBe("not_started");
  });

  it.each([
    [
      "a different source wallet",
      { address: "0x9999999999999999999999999999999999999999" },
    ],
    ["a disconnected wallet", { isConnected: false }],
  ])("blocks %s before prompting", async (_name, account) => {
    actions.getAccount.mockReturnValue({
      isConnected: true,
      address: fixtureSource,
      chainId: usdt.source.chainId,
      ...account,
    });
    await expect(fund()).rejects.toBeInstanceOf(IntentFundingBlockedError);
    expect(actions.writeContract).not.toHaveBeenCalled();
  });

  it("checks the balance before prompting", async () => {
    actions.readContract.mockResolvedValue(1n);
    await expect(fund()).rejects.toThrow(/Insufficient USDT/);
    expect(actions.writeContract).not.toHaveBeenCalled();
  });

  it("refuses an expired quote", async () => {
    session.upsert({
      ...record(),
      quoteExpiresAt: new Date(Date.now() - 1).toISOString(),
      sequence: record().sequence + 1,
    });
    await expect(fund()).rejects.toThrow(/expired/);
  });

  it("marks a cancelled replacement as unknown and a repriced one as the same transfer", async () => {
    const replaced = `0x${"c".repeat(64)}` as Hash;
    actions.waitForTransactionReceipt.mockImplementationOnce(
      async (_config, { onReplaced }) => {
        onReplaced({ reason: "cancelled", transaction: { hash: replaced } });
        return { status: "success", transactionHash: replaced };
      }
    );
    expect(await fund()).toBe("unknown");
    expect(record().sourceHashes).toEqual([hash]);

    prepare();
    actions.waitForTransactionReceipt.mockImplementationOnce(
      async (_config, { onReplaced }) => {
        onReplaced({ reason: "repriced", transaction: { hash: replaced } });
        return { status: "success", transactionHash: replaced };
      }
    );
    expect(await fund()).toBe("confirmed");
    expect(record().sourceHashes).toEqual([hash, replaced]);
  });

  it("reports a reverted transfer", async () => {
    actions.waitForTransactionReceipt.mockResolvedValue({
      status: "reverted",
      transactionHash: hash,
    });
    expect(await fund()).toBe("reverted");
  });
});

describe("mock simulation", () => {
  it("records a fake hash once and only with the mock API", () => {
    simulateIntentFunding(api, session, "local-1", sendHint as never);
    simulateIntentFunding(api, session, "local-1", sendHint as never);
    expect(record().sourceHashes).toHaveLength(1);
    expect(record().fundingState).toBe("confirmed");
    expect(() =>
      simulateIntentFunding(
        { env: "https://x" } as IntentsApi,
        session,
        "local-1"
      )
    ).toThrow(/mock mode/);
  });
});
