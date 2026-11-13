// @vitest-environment jsdom
import { BigNumber } from "bignumber.js";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  IntentsApiError,
  type IntentOperationRequest,
  type IntentsApi,
} from "~/lib/apis/intents";
import {
  createIntentsMockApi,
  mockIntentRoutes,
} from "~/lib/apis/intents/intents.mock";
import { memoryStorage } from "~/lib/intents/intents.fixtures";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import { useIntentsDeposit } from "./useIntentsDeposit";

const accountA = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const accountB = "mv1Fy1xTnD9s3xK3Uz2rNMhKgG5Jt5AKE8vj";
const sourceA = "0x1111111111111111111111111111111111111111" as const;
const sourceB = "0x4444444444444444444444444444444444444444" as const;

const mocks = vi.hoisted(() => ({
  api: null as unknown as IntentsApi,
  ctx: { account: null as string | null, intentSession: null as unknown },
  wallet: null as unknown as EthereumContext,
  result: null as unknown as ReturnType<typeof useIntentsDeposit>,
}));

vi.mock("~/lib/apis/intents", async (original) => ({
  ...(await original<typeof import("~/lib/apis/intents")>()),
  getIntentsApi: () => mocks.api,
}));
vi.mock("~/hooks/useIntentsRoutes", () => ({
  useIntentsRoutes: () => ({
    status: "ready",
    options: [{ route: mockIntentRoutes[0], availability: "available" }],
    refetch: vi.fn(),
  }),
}));
vi.mock("~/providers/EthereumProvider/hooks/useIntentSourceBalance", () => ({
  useIntentSourceBalance: () => ({
    balance: new BigNumber(100),
    status: "ready",
    refetch: vi.fn(),
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
const render = () => act(async () => root.render(<Harness />));
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

function session(account: string) {
  return new IntentOperations(account, "mock", () => memoryStorage());
}
function signIn(account: string, source: `0x${string}` = sourceA) {
  mocks.ctx = { account, intentSession: session(account) };
  mocks.wallet = {
    userAddress: source,
    isConnected: true,
    chainId: 421614,
  } as unknown as EthereumContext;
}
const store = () => mocks.ctx.intentSession as IntentOperations;

async function reachReview() {
  await act(async () => mocks.result.setAmount(new BigNumber(2)));
  await act(async () => mocks.result.requestPreview());
  expect(mocks.result.review.phase).toBe("review");
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.api = createIntentsMockApi({
    storage: () => memoryStorage(),
    latencyMs: 0,
    depositAddress: "0x2222222222222222222222222222222222222222",
    getScenario: () => null,
  });
  signIn(accountA);
  root = createRoot(document.createElement("div"));
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

describe("quote review and persisted operation", () => {
  it("reuses one idempotency key across double clicks and transport retries", async () => {
    const create = mocks.api.createOperation.bind(mocks.api);
    const calls: IntentOperationRequest[] = [];
    let attempt = 0;
    mocks.api.createOperation = async (request) => {
      calls.push(request);
      if (attempt++ === 0) throw new IntentsApiError("network", "offline");
      return create(request);
    };
    await render();
    await reachReview();
    await act(async () => {
      void mocks.result.confirmQuote();
      void mocks.result.confirmQuote();
    });
    expect(calls).toHaveLength(1);
    expect(mocks.result.review.phase).toBe("review");
    expect(mocks.result.reviewError).toMatch(/unreachable/);
    await act(async () => mocks.result.confirmQuote());
    expect(calls).toHaveLength(2);
    expect(calls[1].idempotencyKey).toBe(calls[0].idempotencyKey);
    expect(mocks.result.review.phase).toBe("ready");
  });

  it("persists locally before the request and offers funding only after the backend operation", async () => {
    const pending =
      deferred<Awaited<ReturnType<IntentsApi["createOperation"]>>>();
    const create = mocks.api.createOperation.bind(mocks.api);
    let created!: Promise<Awaited<ReturnType<IntentsApi["createOperation"]>>>;
    mocks.api.createOperation = (request) => {
      created = create(request);
      return pending.promise;
    };
    const release = async () => pending.resolve(await created);
    await render();
    await reachReview();
    let confirm!: Promise<void>;
    await act(async () => {
      confirm = mocks.result.confirmQuote();
    });
    expect(mocks.result.review.phase).toBe("creating");
    const [local] = store().getSnapshot().records.values();
    expect(local.operationId).toBeUndefined();
    expect(local.fundingState).toBe("not_started");
    await act(async () => {
      await release();
      await confirm;
    });
    expect(mocks.result.review.phase).toBe("ready");
    const saved = store().get(local.localId)!;
    expect(saved.operationId).toMatch(/^mock-/);
    expect(saved.funding?.depositAddress).toBe(
      "0x2222222222222222222222222222222222222222"
    );
  });

  it("drops a late response after the Equiteez account changes", async () => {
    const pending =
      deferred<Awaited<ReturnType<IntentsApi["createOperation"]>>>();
    const create = mocks.api.createOperation.bind(mocks.api);
    let created!: Promise<Awaited<ReturnType<IntentsApi["createOperation"]>>>;
    mocks.api.createOperation = (request) => {
      created = create(request);
      return pending.promise;
    };
    const release = async () => pending.resolve(await created);
    await render();
    await reachReview();
    const oldSession = store();
    let confirm!: Promise<void>;
    await act(async () => {
      confirm = mocks.result.confirmQuote();
    });
    expect(mocks.result.review.phase).toBe("creating");
    signIn(accountB);
    await render();
    await act(async () => {
      await release();
      await confirm;
    });
    expect(mocks.result.review.phase).toBe("form");
    const [old] = oldSession.getSnapshot().records.values();
    expect(old.fundingState).toBe("abandoned");
    expect(store().getSnapshot().records.size).toBe(0);
  });

  it("clears the quote when the source wallet changes", async () => {
    await render();
    await reachReview();
    const current = mocks.ctx.intentSession;
    signIn(accountA, sourceB);
    mocks.ctx.intentSession = current; // same session, different source wallet
    await render();
    expect(mocks.result.review.phase).toBe("form");
    expect(mocks.result.reviewError).toMatch(/quote was cleared/);
  });

  it("asks again when the executable quote is worse than the preview", async () => {
    const create = mocks.api.createOperation.bind(mocks.api);
    mocks.api.createOperation = async (request) => ({
      ...(await create(request)),
      amountOut: "1",
      minAmountOut: "1",
    });
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmQuote());
    expect(mocks.result.review.phase).toBe("reconfirm");
    await act(async () => mocks.result.acceptUpdatedQuote());
    expect(mocks.result.review.phase).toBe("ready");
  });

  it("uses a new key after a definitive rejection such as a busy destination", async () => {
    const create = mocks.api.createOperation.bind(mocks.api);
    const keys: string[] = [];
    mocks.api.createOperation = async (request) => {
      keys.push(request.idempotencyKey);
      if (keys.length === 1)
        throw new IntentsApiError("destination_busy", "busy");
      return create(request);
    };
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmQuote());
    expect(mocks.result.reviewError).toMatch(/still being forwarded/);
    expect(store().get(keys[0])?.fundingState).toBe("abandoned");
    await act(async () => mocks.result.confirmQuote());
    expect(keys[1]).not.toBe(keys[0]);
    expect(mocks.result.review.phase).toBe("ready");
  });

  it("refuses to fund an operation that differs from the request", async () => {
    const create = mocks.api.createOperation.bind(mocks.api);
    mocks.api.createOperation = async (request) => ({
      ...(await create(request)),
      recipient: accountB,
    });
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmQuote());
    expect(mocks.result.review.phase).toBe("form");
    expect(mocks.result.reviewError).toMatch(/does not match/);
    const [record] = store().getSnapshot().records.values();
    expect(record.fundingState).toBe("abandoned");
  });

  it("abandons an unfunded operation when the review is cancelled", async () => {
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmQuote());
    await act(async () => mocks.result.cancelReview());
    const [record] = store().getSnapshot().records.values();
    expect(record.fundingState).toBe("abandoned");
    expect(mocks.result.review.phase).toBe("form");
  });

  it("blocks review without an authenticated tracking session", async () => {
    mocks.ctx = { account: null, intentSession: null };
    await act(async () =>
      root.render(<HarnessWithRecipient recipient={accountA} />)
    );
    expect(mocks.result.canReview).toBe(false);
    expect(mocks.result.sessionError).toMatch(/session is not ready/);
  });
});

function HarnessWithRecipient({ recipient }: { recipient: string }) {
  mocks.result = useIntentsDeposit({ recipient, ethereumWallet: mocks.wallet });
  return null;
}
