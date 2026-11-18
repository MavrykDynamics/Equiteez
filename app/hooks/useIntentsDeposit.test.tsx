// @vitest-environment jsdom
import { BigNumber } from "bignumber.js";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  IntentsApiError,
  type IntentCredentials,
  type IntentOperationRequest,
  type IntentsApi,
} from "~/lib/apis/intents";
import {
  createIntentsMockApi,
  type IntentsMockScenario,
} from "~/lib/apis/intents/intents.mock";
import { isOperationCapability } from "~/lib/intents/intentCapability";
import { fixtureOption, memoryStorage } from "~/lib/intents/intents.fixtures";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import { useIntentsDeposit } from "./useIntentsDeposit";

const accountA = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const accountB = `mv1${"2".repeat(33)}`;
const sourceA = "0x1111111111111111111111111111111111111111" as const;
const sourceB = "0x4444444444444444444444444444444444444444" as const;
const ONE = "1000000000000000000";

const mocks = vi.hoisted(() => ({
  api: null as unknown as IntentsApi,
  ctx: {
    account: null as string | null,
    intentSession: null as unknown,
    refreshIntent: (() => {}) as (localId?: string) => void,
  },
  wallet: null as unknown as EthereumContext,
  result: null as unknown as ReturnType<typeof useIntentsDeposit>,
  fund: vi.fn(),
}));

vi.mock("~/lib/apis/intents", async (original) => ({
  ...(await original<typeof import("~/lib/apis/intents")>()),
  getIntentsApi: () => mocks.api,
}));
vi.mock("~/hooks/useIntentsRoutes", async () => {
  const fixtures = await import("~/lib/intents/intents.fixtures");
  return {
    useIntentsRoutes: () => ({
      status: "ready",
      options: [fixtures.fixtureOption],
      refetch: () => {},
    }),
  };
});
vi.mock("~/providers/EthereumProvider/hooks/useIntentSourceBalance", () => ({
  useIntentSourceBalance: () => ({
    balance: new BigNumber(100),
    status: "ready",
    refetch: vi.fn(),
  }),
}));
vi.mock("~/providers/EthereumProvider/hooks/useIntentsFunding", () => ({
  useIntentsFunding: () => ({
    fund: mocks.fund,
    busyId: null,
    error: null,
    clearError: vi.fn(),
  }),
}));
vi.mock("wagmi", () => ({
  useSwitchChain: () => ({ switchChainAsync: vi.fn(), isPending: false }),
}));
vi.mock("~/providers/TransactionsProvider/TransactionsProvider", () => ({
  useTransactionsContext: () => mocks.ctx,
}));

function Harness() {
  mocks.result = useIntentsDeposit({
    recipient: mocks.ctx.account,
    ethereumWallet: mocks.wallet,
  });
  return null;
}

let root: Root;
let clock = 0;
let scenario: IntentsMockScenario | null = null;
const render = () => act(async () => root.render(<Harness />));
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => (resolve = res));
  return { promise, resolve };
};
type Created = Awaited<ReturnType<IntentsApi["createOperation"]>>;

function signIn(account: string, source: `0x${string}` = sourceA) {
  mocks.ctx = {
    account,
    intentSession: new IntentOperations(account, "mock", () => memoryStorage()),
    refreshIntent: vi.fn(),
  };
  mocks.wallet = {
    userAddress: source,
    isConnected: true,
    chainId: 421614,
  } as unknown as EthereumContext;
}
const store = () => mocks.ctx.intentSession as IntentOperations;
const records = () => [...store().getSnapshot().records.values()];

async function reachReview(amount = 1) {
  await act(async () => mocks.result.setAmount(new BigNumber(amount)));
  await act(async () => mocks.result.startReview());
  expect(mocks.result.review.phase).toBe("review");
}
/** Plays the tracker: lets the mock prepare the quote and applies the GET. */
async function publishQuote(advanceMs = 1_500) {
  clock += advanceMs;
  const record = records().find((item) => item.operationId)!;
  const operation = await mocks.api.getOperation(
    record.capability,
    record.operationId!
  );
  await act(async () => {
    store().applyBackend(record.localId, operation);
  });
  return store().get(record.localId)!;
}
async function reachReady() {
  await render();
  await reachReview();
  await act(async () => mocks.result.confirmRequest());
  expect(mocks.result.review.phase).toBe("operation");
  const record = await publishQuote();
  expect(mocks.result.operationView).toEqual({ status: "ready" });
  return record;
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  clock = Date.now();
  scenario = null;
  mocks.fund.mockReset();
  mocks.api = createIntentsMockApi({
    storage: () => memoryStorage(),
    now: () => clock,
    latencyMs: 0,
    depositAddress: "0x2222222222222222222222222222222222222222",
    getScenario: () => scenario,
  });
  signIn(accountA);
  root = createRoot(document.createElement("div"));
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

describe("form and local review", () => {
  it("prefills the fixed amount and clamps slippage to the route maximum", async () => {
    await render();
    // basenet-rehearsal-style route: exactly 1 token, 0 slippage.
    expect(mocks.result.isAmountFixed).toBe(true);
    expect(mocks.result.isSlippageFixed).toBe(true);
    expect(mocks.result.amount?.toFixed()).toBe("1");
    expect(mocks.result.slippageBps).toBe(0);
    expect(mocks.result.estimate).toEqual({ expected: ONE, minimum: ONE });
    expect(mocks.result.canReview).toBe(true);
    await act(async () => mocks.result.setAmount(new BigNumber(2)));
    expect(mocks.result.amount?.toFixed()).toBe("1");
  });

  it("builds the exact request with an accepted minimum and the source wallet as refund address", async () => {
    await render();
    await act(async () => mocks.result.startReview());
    const review = mocks.result.review as Extract<
      typeof mocks.result.review,
      { phase: "review" | "creating" }
    >;
    expect(review.request).toEqual({
      routeId: fixtureOption.route.id,
      routeVersion: 1,
      sourceAddress: sourceA,
      recipient: accountA,
      refundAddress: sourceA,
      amountIn: ONE,
      slippageBps: 0,
      acceptedMinAmountOut: ONE,
    });
    // Nothing was persisted or sent yet.
    expect(records()).toHaveLength(0);
  });

  it("clears the review when the source wallet changes", async () => {
    await render();
    await reachReview();
    const current = mocks.ctx.intentSession;
    signIn(accountA, sourceB);
    mocks.ctx.intentSession = current;
    await render();
    expect(mocks.result.review.phase).toBe("form");
  });

  it("only allows mv1 recipients", async () => {
    signIn(`mv2${"2".repeat(33)}`);
    await render();
    await act(async () => mocks.result.setAmount(new BigNumber(2)));
    expect(mocks.result.canReview).toBe(false);
    expect(mocks.result.sessionError).toMatch(/only deliver to mv1/);
  });

  it("blocks review without an authenticated tracking session", async () => {
    mocks.ctx = { account: null, intentSession: null, refreshIntent: vi.fn() };
    await act(async () =>
      root.render(<HarnessWithRecipient recipient={accountA} />)
    );
    expect(mocks.result.canReview).toBe(false);
    expect(mocks.result.sessionError).toMatch(/session is not ready/);
  });
});

describe("persisted operation", () => {
  it("persists capability, key and request before the POST; funding needs published instructions", async () => {
    const pending = deferred<Created>();
    const create = mocks.api.createOperation.bind(mocks.api);
    let created!: Promise<Created>;
    mocks.api.createOperation = (credentials, body) => {
      created = create(credentials, body);
      return pending.promise;
    };
    await render();
    await reachReview();
    let confirm!: Promise<void>;
    await act(async () => {
      confirm = mocks.result.confirmRequest();
    });
    expect(mocks.result.review.phase).toBe("creating");
    const [local] = records();
    expect(isOperationCapability(local.capability)).toBe(true);
    expect(local.idempotencyKey).toMatch(/^[!-~]{8,128}$/);
    expect(local.request.amountIn).toBe(ONE);
    expect(local.operationId).toBeUndefined();
    await act(async () => {
      pending.resolve(await created);
      await confirm;
    });
    expect(mocks.result.review.phase).toBe("operation");
    expect(mocks.result.operationView).toEqual({ status: "preparing" });
    expect(mocks.ctx.refreshIntent).toHaveBeenCalledWith(local.localId);
    const ready = await publishQuote();
    expect(mocks.result.operationView).toEqual({ status: "ready" });
    expect(ready.backend?.fundingInstructions?.depositAddress).toBe(
      "0x2222222222222222222222222222222222222222"
    );
  });

  it("reuses the same capability, key and body across double clicks and lost responses", async () => {
    const create = mocks.api.createOperation.bind(mocks.api);
    const calls: [IntentCredentials, IntentOperationRequest][] = [];
    mocks.api.createOperation = async (credentials, body) => {
      calls.push([credentials, body]);
      // Committed, but the response is lost.
      const result = await create(credentials, body);
      if (calls.length === 1) throw new IntentsApiError("NETWORK", "offline");
      return result;
    };
    await render();
    await reachReview();
    await act(async () => {
      void mocks.result.confirmRequest();
      void mocks.result.confirmRequest();
    });
    expect(calls).toHaveLength(1);
    expect(mocks.result.review.phase).toBe("review");
    expect(mocks.result.reviewError).toMatch(/will not be duplicated/);
    await act(async () => mocks.result.confirmRequest());
    expect(calls).toHaveLength(2);
    expect(calls[1]).toEqual(calls[0]);
    expect(records()).toHaveLength(1);
    expect(mocks.result.review.phase).toBe("operation");
  });

  it("uses a fresh scope after a definitive rejection", async () => {
    const create = mocks.api.createOperation.bind(mocks.api);
    const scopes: IntentCredentials[] = [];
    mocks.api.createOperation = async (credentials, body) => {
      scopes.push(credentials);
      if (scopes.length === 1)
        throw new IntentsApiError("ROUTE_UNAVAILABLE", "paused", 409, "req-9");
      return create(credentials, body);
    };
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmRequest());
    expect(mocks.result.reviewError).toMatch(/route is unavailable.*req-9/);
    expect(records()[0].fundingState).toBe("abandoned");
    await act(async () => mocks.result.confirmRequest());
    expect(scopes[1].capability).not.toBe(scopes[0].capability);
    expect(scopes[1].idempotencyKey).not.toBe(scopes[0].idempotencyKey);
    expect(mocks.result.review.phase).toBe("operation");
  });

  it("drops a late response after the Equiteez account changes", async () => {
    const pending = deferred<Created>();
    const create = mocks.api.createOperation.bind(mocks.api);
    let created!: Promise<Created>;
    mocks.api.createOperation = (credentials, body) => {
      created = create(credentials, body);
      return pending.promise;
    };
    await render();
    await reachReview();
    const oldSession = store();
    let confirm!: Promise<void>;
    await act(async () => {
      confirm = mocks.result.confirmRequest();
    });
    signIn(accountB);
    await render();
    await act(async () => {
      pending.resolve(await created);
      await confirm;
    });
    expect(mocks.result.review.phase).toBe("form");
    const [old] = oldSession.getSnapshot().records.values();
    expect(old.fundingState).toBe("abandoned");
    expect(records()).toHaveLength(0);
  });

  it("refuses to continue with an operation that differs from the request", async () => {
    const create = mocks.api.createOperation.bind(mocks.api);
    mocks.api.createOperation = async (credentials, body) => {
      const result = await create(credentials, body);
      return {
        ...result,
        operation: { ...result.operation, recipient: accountB },
      };
    };
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmRequest());
    expect(mocks.result.review.phase).toBe("form");
    expect(mocks.result.reviewError).toMatch(/does not match/);
    expect(records()[0].fundingState).toBe("abandoned");
  });

  it("returns to the form when no quote meets the accepted minimum", async () => {
    scenario = "reject";
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmRequest());
    await publishQuote();
    expect(mocks.result.review.phase).toBe("form");
    expect(mocks.result.reviewError).toMatch(/No quote met your minimum/);
  });

  it("returns to the form when instructions expire before funding", async () => {
    scenario = "expire";
    await reachReady();
    await publishQuote(21_000);
    expect(mocks.result.review.phase).toBe("form");
    expect(mocks.result.reviewError).toMatch(/expired before funding/);
  });

  it("shows paused funding without a send action", async () => {
    scenario = "paused";
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmRequest());
    await publishQuote();
    expect(mocks.result.operationView).toEqual({ status: "paused" });
  });

  it("abandons an unfunded operation when the review is cancelled", async () => {
    await reachReady();
    await act(async () => mocks.result.cancelReview());
    expect(records()[0].fundingState).toBe("abandoned");
    expect(mocks.result.review.phase).toBe("form");
  });

  it("generates a fresh capability and idempotency key for every operation", async () => {
    await reachReady();
    await act(async () => mocks.result.cancelReview());
    await reachReview();
    await act(async () => mocks.result.confirmRequest());
    const [first, second] = records();
    expect(records()).toHaveLength(2);
    expect(isOperationCapability(second.capability)).toBe(true);
    expect(second.capability).not.toBe(first.capability);
    expect(second.idempotencyKey).not.toBe(first.idempotencyKey);
  });
});

describe("funding hand-off", () => {
  it("funds the captured session with the reviewed quote and reports staleness", async () => {
    const record = await reachReady();
    const session = store();
    await act(async () => mocks.result.fund());
    expect(mocks.fund).toHaveBeenCalledWith(
      session,
      record.localId,
      record.backend!.fundingInstructions!.quoteId,
      expect.any(Function)
    );
    const isCurrent = mocks.fund.mock.calls[0][3] as () => boolean;
    expect(isCurrent()).toBe(true);
    signIn(accountB);
    await render();
    expect(isCurrent()).toBe(false);
    expect(mocks.result.review.phase).toBe("form");
  });

  it("keeps a funded operation when inputs change, but not across accounts", async () => {
    const record = await reachReady();
    const session = store();
    session.upsert({
      ...session.get(record.localId)!,
      fundingState: "broadcast",
      sourceHashes: [`0x${"a".repeat(64)}`],
      sequence: session.get(record.localId)!.sequence + 1,
    });
    await render();
    expect(mocks.result.hasFundingStarted).toBe(true);
    expect(mocks.result.review.phase).toBe("tracking");
    signIn(accountA, sourceB);
    mocks.ctx.intentSession = session;
    await render();
    expect(mocks.result.review.phase).toBe("tracking");
    signIn(accountB);
    await render();
    expect(mocks.result.review.phase).toBe("form");
    expect(mocks.result.reviewError).toBeNull();
    expect(session.get(record.localId)?.fundingState).toBe("broadcast");
  });

  it("follows the operation when the backend saw funds", async () => {
    const record = await reachReady();
    const hash = `0x${"a".repeat(64)}` as const;
    // The mock answers REHEARSAL_RECEIPT_PENDING once, then accepts.
    await expect(
      mocks.api.registerDeposit(record.capability, record.operationId!, hash)
    ).rejects.toMatchObject({ code: "REHEARSAL_RECEIPT_PENDING" });
    await mocks.api.registerDeposit(
      record.capability,
      record.operationId!,
      hash
    );
    await publishQuote(0);
    expect(mocks.result.review).toMatchObject({
      phase: "tracking",
      localId: record.localId,
    });
  });
});

describe("resume", () => {
  it("resumes the newest unfinished committed operation, never an unfunded one", async () => {
    const unfunded = await reachReady();
    await act(async () => mocks.result.cancelReview());
    let found = false;
    await act(async () => {
      found = mocks.result.resumeActive();
    });
    expect(found).toBe(false);

    await reachReview();
    await act(async () => mocks.result.confirmRequest());
    const funded = records().find((item) => item.localId !== unfunded.localId)!;
    store().upsert({
      ...store().get(funded.localId)!,
      fundingState: "unknown",
      sourceHashes: [`0x${"a".repeat(64)}`],
      sequence: store().get(funded.localId)!.sequence + 1,
    });
    await render();
    await act(async () => mocks.result.cancelReview());
    await act(async () => {
      found = mocks.result.resumeActive();
    });
    expect(found).toBe(true);
    expect(mocks.result.review).toMatchObject({
      phase: "tracking",
      localId: funded.localId,
    });
  });
});

function HarnessWithRecipient({ recipient }: { recipient: string }) {
  mocks.result = useIntentsDeposit({ recipient, ethereumWallet: mocks.wallet });
  return null;
}
