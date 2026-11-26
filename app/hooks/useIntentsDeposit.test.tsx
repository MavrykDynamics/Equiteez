// @vitest-environment jsdom
import { BigNumber } from "bignumber.js";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  IntentsApiError,
  type IntentCredentials,
  type IntentOperationRequest,
  type IntentPreviewRequest,
  type IntentsApi,
} from "~/lib/apis/intents";
import {
  createIntentsMockApi,
  type IntentsMockScenario,
} from "~/lib/apis/intents/intents.mock";
import { isOperationCapability } from "~/lib/intents/intentCapability";
import {
  fixtureOption,
  fixtureSolanaOption,
  fixtureSolanaRefund,
  memoryStorage,
} from "~/lib/intents/intents.fixtures";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import { useIntentsDeposit } from "./useIntentsDeposit";

const accountA = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const accountB = `mv1${"2".repeat(33)}`;
const sourceA = "0x1111111111111111111111111111111111111111" as const;
const sourceB = "0x4444444444444444444444444444444444444444" as const;
/** 25 USDC on Base (6 decimals). */
const AMOUNT = "25000000";

const mocks = vi.hoisted(() => ({
  api: null as unknown as IntentsMockApi,
  ctx: {
    account: null as string | null,
    intentSession: null as unknown,
    refreshIntent: (() => {}) as (localId?: string) => void,
  },
  wallet: null as unknown as EthereumContext,
  result: null as unknown as ReturnType<typeof useIntentsDeposit>,
  fund: vi.fn(),
  previewCalls: 0,
}));
type IntentsMockApi = IntentsApi & {
  simulateDeposit(capability: string, operationId: string): void;
};

vi.mock("~/lib/apis/intents", async (original) => ({
  ...(await original<typeof import("~/lib/apis/intents")>()),
  getIntentsApi: () => mocks.api,
}));
vi.mock("~/hooks/useIntentsCatalog", async () => {
  const fixtures = await import("~/lib/intents/intents.fixtures");
  return {
    useIntentsCatalog: () => ({
      catalog: fixtures.fixtureCatalog,
      status: "ready",
      error: null,
      refetch: async () => ({ error: null }),
    }),
  };
});
// The live preview is the fixture; the review refreshes it from the mock API.
vi.mock("~/hooks/useIntentsPreview", async () => {
  const fixtures = await import("~/lib/intents/intents.fixtures");
  return {
    useIntentsPreview: (request: IntentPreviewRequest | null) => ({
      preview: request ? fixtures.preview() : undefined,
      status: request ? "ready" : "idle",
      error: null,
      refetch: vi.fn(),
      fetchFresh: (input: IntentPreviewRequest) => {
        mocks.previewCalls += 1;
        return mocks.api.previewQuote(input);
      },
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
  useConfig: () => ({ chains: [{ id: 1 }, { id: 8453 }, { id: 42161 }] }),
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
let hasSelected = false;
/** Renders; the first render of a test selects USDC on Base (EVM token). */
const render = async () => {
  await act(async () => root.render(<Harness />));
  if (hasSelected) return;
  hasSelected = true;
  await act(async () => mocks.result.selectAsset(fixtureOption.assetId));
};
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => (resolve = res));
  return { promise, resolve };
};
type Created = Awaited<ReturnType<IntentsApi["createOperation"]>>;

function signIn(account: string, source: `0x${string}` | null = sourceA) {
  mocks.ctx = {
    account,
    intentSession: new IntentOperations(account, "mock", () => memoryStorage()),
    refreshIntent: vi.fn(),
  };
  mocks.wallet = {
    userAddress: source,
    isConnected: Boolean(source),
    chainId: 8453,
  } as unknown as EthereumContext;
}
const store = () => mocks.ctx.intentSession as IntentOperations;
const records = () => [...store().getSnapshot().records.values()];

async function reachReview(amount = 25) {
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
const reviewOf = () =>
  mocks.result.review as Extract<
    typeof mocks.result.review,
    { phase: "review" | "creating" | "operation" }
  >;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  clock = Date.now();
  scenario = null;
  mocks.previewCalls = 0;
  hasSelected = false;
  mocks.fund.mockReset();
  // A non-mock env: wallet sends are disabled against the "mock" env.
  mocks.api = {
    ...createIntentsMockApi({
      storage: () => memoryStorage(),
      now: () => clock,
      latencyMs: 0,
      getScenario: () => scenario,
    }),
    env: "test",
  };
  signIn(accountA);
  root = createRoot(document.createElement("div"));
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

describe("form and local review", () => {
  it("builds the exact request from a fresh preview with the wallet as refund address", async () => {
    await render();
    expect(mocks.result.canWalletSend).toBe(true);
    expect(mocks.result.isRefundFromWallet).toBe(true);
    await reachReview();
    expect(mocks.previewCalls).toBe(1);
    const review = reviewOf();
    expect(review.request).toEqual({
      sourceAssetId: fixtureOption.assetId,
      settlementTokenId: "usdt0-arbitrum",
      settlementTokenVersion: 1,
      recipient: accountA,
      refundAddress: sourceA,
      amountIn: AMOUNT,
      slippageBps: 100,
      acceptedMinAmountOut: review.preview.bridgeableMinAmountOut,
    });
    expect(review.sourceWallet).toBe(sourceA);
    // Nothing was persisted or sent yet.
    expect(records()).toHaveLength(0);
  });

  it("needs a confirmed, valid refund address for non-EVM assets", async () => {
    await render();
    await act(async () =>
      mocks.result.selectAsset(fixtureSolanaOption.assetId)
    );
    await act(async () => mocks.result.setAmount(new BigNumber(1)));
    expect(mocks.result.canWalletSend).toBe(false);
    expect(mocks.result.canReview).toBe(false);
    await act(async () => mocks.result.setRefundInput(sourceA));
    expect(mocks.result.refundError).toMatch(/not a valid Solana address/);
    await act(async () => mocks.result.setRefundInput(fixtureSolanaRefund));
    expect(mocks.result.refundError).toBeNull();
    expect(mocks.result.canReview).toBe(false);
    await act(async () => mocks.result.setIsRefundConfirmed(true));
    expect(mocks.result.canReview).toBe(true);
    await act(async () => mocks.result.startReview());
    expect(reviewOf().request).toMatchObject({
      sourceAssetId: fixtureSolanaOption.assetId,
      refundAddress: fixtureSolanaRefund,
      amountIn: "1000000000",
    });
    expect(reviewOf().sourceWallet).toBeUndefined();
    // Editing the address needs a new confirmation.
    await act(async () =>
      mocks.result.setRefundInput(`${fixtureSolanaRefund} `)
    );
    expect(mocks.result.isRefundConfirmed).toBe(false);
  });

  it("asks for a refund address when no EVM wallet is connected", async () => {
    signIn(accountA, null);
    await render();
    expect(mocks.result.canWalletSend).toBe(false);
    expect(mocks.result.isRefundFromWallet).toBe(false);
    await act(async () => mocks.result.setAmount(new BigNumber(25)));
    expect(mocks.result.canReview).toBe(false);
  });

  it("never sends from a wallet against the mock API", async () => {
    mocks.api = { ...mocks.api, env: "mock" };
    await render();
    expect(mocks.result.canWalletSend).toBe(false);
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
    expect(mocks.result.sessionError).toMatch(/only go to mv1/);
  });

  it("blocks review without an authenticated tracking session", async () => {
    mocks.ctx = { account: null, intentSession: null, refreshIntent: vi.fn() };
    await act(async () =>
      root.render(<HarnessWithRecipient recipient={accountA} />)
    );
    expect(mocks.result.canReview).toBe(false);
    expect(mocks.result.sessionError).toMatch(/session is not ready/);
  });

  it("re-prices an expired preview on confirm and asks again when the minimum changed", async () => {
    // Previews from the mock clock are already past their 30s freshness.
    clock = Date.now() - 60_000;
    const preview = mocks.api.previewQuote.bind(mocks.api);
    let calls = 0;
    mocks.api.previewQuote = async (input, options) => {
      const quote = await preview(input, options);
      calls += 1;
      return calls === 1
        ? quote
        : { ...quote, bridgeableMinAmountOut: "24000000" };
    };
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmRequest());
    expect(mocks.result.review.phase).toBe("review");
    expect(mocks.result.reviewError).toBeNull();
    expect(mocks.result.reviewNotice).toMatch(/price changed/);
    expect(reviewOf().request.acceptedMinAmountOut).toBe("24000000");
    // Nothing was persisted for the outdated price.
    expect(records()).toHaveLength(0);
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
    expect(local.request.amountIn).toBe(AMOUNT);
    expect(local.sourceWallet).toBe(sourceA);
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
    expect(ready.backend?.fundingInstructions?.depositAddress).toMatch(
      /^0x[0-9a-f]{40}$/
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
        throw new IntentsApiError(
          "PROVIDER_REJECTED",
          "no quote",
          409,
          "req-9"
        );
      return create(credentials, body);
    };
    await render();
    await reachReview();
    await act(async () => mocks.result.confirmRequest());
    expect(mocks.result.reviewError).toMatch(/No price is available.*req-9/);
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
    expect(mocks.result.reviewError).toMatch(/couldn't get a price/);
  });

  it("returns to the form when instructions expire before funding", async () => {
    scenario = "expire";
    await reachReady();
    await publishQuote(21_000);
    expect(mocks.result.review.phase).toBe("form");
    expect(mocks.result.reviewError).toMatch(/deposit window closed/);
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
    mocks.api.simulateDeposit(record.capability, record.operationId!);
    await publishQuote(0);
    expect(mocks.result.review).toMatchObject({
      phase: "tracking",
      localId: record.localId,
    });
  });
});

describe("manual deposit", () => {
  it("follows the operation once the user reports sending from another wallet", async () => {
    const record = await reachReady();
    await act(async () => mocks.result.markSent());
    expect(store().get(record.localId)?.fundingState).toBe("external");
    expect(mocks.ctx.refreshIntent).toHaveBeenCalledWith(record.localId);
    expect(mocks.result.review).toMatchObject({
      phase: "tracking",
      localId: record.localId,
    });
    expect(mocks.fund).not.toHaveBeenCalled();
  });

  it("keeps a published address on screen when the inputs change", async () => {
    await reachReady();
    await act(async () => mocks.result.setAmount(new BigNumber(30)));
    expect(mocks.result.review.phase).toBe("operation");
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
