import { describe, expect, it, vi } from "vitest";
import { OpKind } from "@mavrykdynamics/taquito";
import { LocalForger } from "@mavrykdynamics/taquito-local-forging";
import {
  b58cencode,
  encodeOpHash,
  Prefix,
  prefix,
} from "@mavrykdynamics/taquito-utils";

import { ed25519 } from "@noble/curves/ed25519.js";
import bs58 from "bs58";

import { deriveMavrykKeys } from "~/lib/mavryk/keys";

import type { AttemptIdentity, DirectAttempt } from "./attempt.types";
import {
  AttemptPersistenceError,
  createAttemptStore,
  TERMINAL_RETENTION_MS,
} from "./attemptStore";
import { fingerprintIntent } from "./fingerprint";
import {
  BroadcastOutcomeUnknownError,
  GuardedInjector,
  isDefiniteNodeRejection,
  UntrackedBroadcastError,
  type ActiveAttemptSlot,
} from "./guardedInjector";
import { ActionInProgressError, withLock, withLockIfAvailable } from "./locks";
import {
  inspectReceipt,
  rebroadcastAttempt,
  reconcileAttempts,
} from "./reconcile";
import { runDirectAttempt, UnresolvedAttemptError } from "./runDirectAttempt";

// --- fixtures ---------------------------------------------------------------

// Valid mv1 addresses of public test keys
const addressOf = (fill: number) =>
  deriveMavrykKeys(
    bs58.encode(ed25519.getPublicKey(new Uint8Array(32).fill(fill)))
  ).address;
const SOURCE = addressOf(1);
const IDENTITY: AttemptIdentity = {
  environment: "dev",
  chainId: "NetXJMfAoC7pZSW",
  address: SOURCE,
  provider: "dynamic",
  walletId: "w1",
  epoch: 1,
};
const OTHER_ACCOUNT: AttemptIdentity = {
  ...IDENTITY,
  address: addressOf(2),
};
const FINGERPRINT = fingerprintIntent({ action: "buy", amount: "10" });

function memoryStorage() {
  const map = new Map<string, string>();

  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

function createStore(now = () => 1_000_000) {
  const local = memoryStorage();
  const session = memoryStorage();

  return {
    local,
    session,
    store: createAttemptStore({ local, session, now }),
  };
}

const newAttempt = (
  overrides: Partial<DirectAttempt> = {}
): Omit<DirectAttempt, "createdAt" | "updatedAt"> => ({
  attemptId: "a1",
  action: "orderbook.buy",
  intentFingerprint: FINGERPRINT,
  identity: IDENTITY,
  phase: "prepared",
  ...overrides,
});

const BRANCH = b58cencode("11".repeat(32), prefix[Prefix.B]);

async function signedOperationBytes() {
  const forged = await new LocalForger().forge({
    branch: BRANCH,
    contents: [
      {
        kind: OpKind.TRANSACTION,
        source: SOURCE,
        fee: "1000",
        counter: "41",
        gas_limit: "2000",
        storage_limit: "0",
        amount: "1",
        destination: OTHER_ACCOUNT.address,
      },
      {
        kind: OpKind.TRANSACTION,
        source: SOURCE,
        fee: "1000",
        counter: "42",
        gas_limit: "2000",
        storage_limit: "0",
        amount: "2",
        destination: OTHER_ACCOUNT.address,
      },
    ],
  } as Parameters<LocalForger["forge"]>[0]);

  return forged + "ab".repeat(64);
}

const httpError = (status: number, body = "") =>
  Object.assign(new Error(`HTTP ${status}`), { status, body });

// --- attempt store ----------------------------------------------------------

describe("attemptStore", () => {
  it("keeps attempts per account and network", () => {
    const { store } = createStore();

    store.create(newAttempt());
    store.create(newAttempt({ attemptId: "a2", identity: OTHER_ACCOUNT }));

    expect(store.list(IDENTITY).map((attempt) => attempt.attemptId)).toEqual([
      "a1",
    ]);
    expect(store.list({ ...IDENTITY, chainId: "other" })).toEqual([]);
  });

  it("drops the signed bytes once an attempt is terminal", () => {
    const { store } = createStore();

    store.create(newAttempt());
    store.setRetryBytes("a1", "deadbeef");
    store.update("a1", { phase: "unknown" });
    expect(store.getRetryBytes("a1")).toBe("deadbeef");

    store.update("a1", { phase: "applied" });
    expect(store.getRetryBytes("a1")).toBeNull();
  });

  it("never stores signed bytes in localStorage", () => {
    const { store, local } = createStore();

    store.create(newAttempt());
    store.setRetryBytes("a1", "deadbeef");

    expect([...local.map.values()].join()).not.toContain("deadbeef");
  });

  it("prunes old terminal attempts but never unresolved ones", () => {
    let time = 0;
    const { store } = createStore(() => time);

    store.create(newAttempt({ attemptId: "done", phase: "applied" }));
    store.create(newAttempt({ attemptId: "lost", phase: "unknown" }));
    time = TERMINAL_RETENTION_MS + 1;
    store.prune();

    expect(store.list(IDENTITY).map((attempt) => attempt.attemptId)).toEqual([
      "lost",
    ]);
  });

  it("throws when the attempt cannot be persisted", () => {
    const failing = createAttemptStore({
      local: {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
        removeItem: () => undefined,
      },
      session: null,
    });

    expect(() => failing.create(newAttempt())).toThrow(AttemptPersistenceError);
    expect(() =>
      createAttemptStore({ local: null, session: null }).create(newAttempt())
    ).toThrow(AttemptPersistenceError);
  });
});

// --- guarded injector -------------------------------------------------------

describe("GuardedInjector", () => {
  async function setup(injectOperation: (bytes: string) => Promise<string>) {
    const { store } = createStore();
    const attempt = store.create(newAttempt());
    const slot: ActiveAttemptSlot = { current: attempt };
    const signedBytes = await signedOperationBytes();
    const opHash = encodeOpHash(signedBytes);
    const injector = new GuardedInjector({ injectOperation, store, slot });

    return { store, slot, injector, signedBytes, opHash };
  }

  it("persists the hash before the operation reaches the node", async () => {
    let phaseAtSend: string | undefined;
    let hashAtSend: string | undefined;
    const { store, injector, signedBytes, opHash } = await setup(async () => {
      phaseAtSend = store.get("a1")?.phase;
      hashAtSend = store.get("a1")?.ref?.opHash;
      return opHash;
    });

    await expect(injector.inject(signedBytes)).resolves.toBe(opHash);
    expect(phaseAtSend).toBe("broadcasting");
    expect(hashAtSend).toBe(opHash);
    expect(store.get("a1")).toMatchObject({
      phase: "injected",
      ref: { mode: "mvrk", opHash },
      branch: BRANCH,
      counterRange: ["41", "42"],
    });
  });

  it("keeps a lost response unknown, with its hash and retry bytes", async () => {
    const { store, injector, signedBytes, opHash } = await setup(() =>
      Promise.reject(new TypeError("Failed to fetch"))
    );

    await expect(injector.inject(signedBytes)).rejects.toBeInstanceOf(
      BroadcastOutcomeUnknownError
    );
    expect(store.get("a1")).toMatchObject({
      phase: "unknown",
      ref: { opHash },
    });
    expect(store.getRetryBytes("a1")).toBe(signedBytes);
  });

  it("treats a gateway failure as unknown, not as a rejection", async () => {
    const { store, injector, signedBytes } = await setup(() =>
      Promise.reject(httpError(502))
    );

    await expect(injector.inject(signedBytes)).rejects.toBeInstanceOf(
      BroadcastOutcomeUnknownError
    );
    expect(store.get("a1")?.phase).toBe("unknown");
  });

  it("records a node error as a proven rejection", async () => {
    const nodeError = httpError(
      500,
      JSON.stringify([{ kind: "temporary", id: "proto.counter_in_the_past" }])
    );
    const { store, injector, signedBytes } = await setup(() =>
      Promise.reject(nodeError)
    );

    await expect(injector.inject(signedBytes)).rejects.toBe(nodeError);
    expect(store.get("a1")).toMatchObject({
      phase: "rejected",
      rejectReason: "node",
    });
    expect(store.getRetryBytes("a1")).toBeNull();
  });

  it("keeps an attempt unknown when the node returns another hash", async () => {
    const { store, injector, signedBytes } = await setup(async () => "ooWrong");

    await expect(injector.inject(signedBytes)).rejects.toBeInstanceOf(
      BroadcastOutcomeUnknownError
    );
    expect(store.get("a1")?.phase).toBe("unknown");
  });

  it("refuses to broadcast outside a tracked attempt or after the wallet changed", async () => {
    const injectOperation = vi.fn(async () => "oo");
    const { store, slot, signedBytes } = await setup(injectOperation);

    await expect(
      new GuardedInjector({
        injectOperation,
        store,
        slot: { current: null },
      }).inject(signedBytes)
    ).rejects.toBeInstanceOf(UntrackedBroadcastError);

    await expect(
      new GuardedInjector({
        injectOperation,
        store,
        slot,
        assertCurrent: () => {
          throw new Error("wallet changed");
        },
      }).inject(signedBytes)
    ).rejects.toThrow("wallet changed");

    expect(injectOperation).not.toHaveBeenCalled();
    expect(store.get("a1")?.phase).toBe("prepared");
  });

  it.each([
    [httpError(400), true],
    [httpError(429), true],
    [httpError(408), false],
    [httpError(502), false],
    [httpError(500, "Internal Server Error"), false],
    [httpError(500, JSON.stringify([{ id: "proto.balance_too_low" }])), true],
    [new TypeError("Failed to fetch"), false],
  ])("classifies %s as a definite rejection: %s", (error, expected) => {
    expect(isDefiniteNodeRejection(error)).toBe(expected);
  });
});

// --- locks -----------------------------------------------------------------

describe("locks (in-tab fallback)", () => {
  it("rejects a second holder instead of queueing it", async () => {
    let release!: () => void;
    const first = withLockIfAvailable(
      "lock",
      () => new Promise<void>((resolve) => (release = resolve)),
      null
    );

    await expect(
      withLockIfAvailable("lock", async () => "second", null)
    ).rejects.toBeInstanceOf(ActionInProgressError);

    release();
    await first;
    await expect(
      withLockIfAvailable("lock", async () => "third", null)
    ).resolves.toBe("third");
  });

  it("maps a busy Web Lock to ActionInProgressError", async () => {
    const busyLocks = {
      request: vi.fn(
        async (
          _name: string,
          _options: LockOptions,
          callback: (lock: Lock | null) => Promise<unknown>
        ) => callback(null)
      ),
    } as unknown as LockManager;
    const task = vi.fn(async () => "never");

    await expect(
      withLockIfAvailable("lock", task, busyLocks)
    ).rejects.toBeInstanceOf(ActionInProgressError);
    expect(task).not.toHaveBeenCalled();
    expect(busyLocks.request).toHaveBeenCalledWith(
      "lock",
      { ifAvailable: true },
      expect.any(Function)
    );
  });

  it("serializes waiting holders", async () => {
    const order: string[] = [];
    const task = (label: string) => async () => {
      order.push(`${label}:start`);
      await Promise.resolve();
      order.push(`${label}:end`);
    };

    await Promise.all([
      withLock("queue", task("a"), null),
      withLock("queue", task("b"), null),
    ]);

    expect(order).toEqual(["a:start", "a:end", "b:start", "b:end"]);
  });
});

// --- runDirectAttempt -------------------------------------------------------

describe("runDirectAttempt", () => {
  const setup = () => {
    const { store } = createStore();
    const slot: ActiveAttemptSlot = { current: null };
    let id = 0;

    const run = (
      execute: Parameters<typeof runDirectAttempt>[0]["execute"],
      overrides: Partial<Parameters<typeof runDirectAttempt>[0]> = {}
    ) =>
      runDirectAttempt({
        identity: IDENTITY,
        action: "orderbook.buy",
        intentFingerprint: FINGERPRINT,
        store,
        slot,
        execute,
        createId: () => `attempt-${++id}`,
        ...overrides,
      });

    // What the guarded injector does during execute
    const inject = (attemptId: string) => {
      store.update(attemptId, {
        phase: "injected",
        ref: { mode: "mvrk", opHash: `oo-${attemptId}` },
      });
    };

    return { store, slot, run, inject };
  };

  it("records an applied attempt and exposes it to the injector while running", async () => {
    const { store, slot, run, inject } = setup();

    const { attempt } = await run(async ({ attempt, resolve }) => {
      expect(slot.current?.attemptId).toBe(attempt.attemptId);
      inject(attempt.attemptId);
      resolve("applied");
    });

    expect(attempt.phase).toBe("applied");
    expect(store.get(attempt.attemptId)?.phase).toBe("applied");
    expect(slot.current).toBeNull();
  });

  it("lets only one of two simultaneous submissions of the same intent through", async () => {
    const { run, inject } = setup();
    let release!: () => void;

    const first = run(async ({ attempt, resolve }) => {
      await new Promise<void>((resolve) => (release = resolve));
      inject(attempt.attemptId);
      resolve("applied");
    });

    await expect(run(async () => undefined)).rejects.toBeInstanceOf(
      ActionInProgressError
    );

    release();
    await first;
  });

  it("blocks the same intent while a previous attempt is unresolved", async () => {
    const { store, run } = setup();
    store.create(newAttempt({ attemptId: "lost", phase: "unknown" }));

    const execute = vi.fn();
    await expect(run(execute)).rejects.toBeInstanceOf(UnresolvedAttemptError);
    expect(execute).not.toHaveBeenCalled();

    // A different intent of the same account is not blocked
    await expect(
      run(async () => undefined, {
        intentFingerprint: fingerprintIntent({ action: "buy", amount: "11" }),
      })
    ).resolves.toBeDefined();
  });

  it("records why an attempt never reached the network", async () => {
    const { store, run } = setup();
    const preapply = Object.assign(new Error("simulation failed"), {
      name: "MavrykOperationError",
    });
    const declined = new Error("User rejected");

    await expect(
      run(async () => {
        throw preapply;
      })
    ).rejects.toBe(preapply);
    await expect(
      run(
        async () => {
          throw declined;
        },
        { isUserRejection: (error) => error === declined }
      )
    ).rejects.toBe(declined);

    expect(store.get("attempt-1")).toMatchObject({
      phase: "rejected",
      rejectReason: "preapply",
    });
    expect(store.get("attempt-2")).toMatchObject({
      phase: "rejected",
      rejectReason: "user",
    });
  });

  it("never calls a sent attempt done without a receipt", async () => {
    const { store, run, inject } = setup();

    await expect(
      run(async ({ attempt }) => {
        inject(attempt.attemptId);
        throw new Error("confirmation timed out");
      })
    ).rejects.toThrow("confirmation timed out");
    expect(store.get("attempt-1")?.phase).toBe("unknown");

    const { attempt } = await run(
      async ({ attempt }) => inject(attempt.attemptId),
      { intentFingerprint: "another-intent" }
    );
    expect(attempt.phase).toBe("unknown");
  });

  it("runs different actions of one account one at a time", async () => {
    const { run } = setup();
    const order: string[] = [];
    const action =
      (label: string) =>
      async ({ resolve }: { resolve: (outcome: "applied") => unknown }) => {
        order.push(`${label}:start`);
        await Promise.resolve();
        order.push(`${label}:end`);
        resolve("applied");
      };

    await Promise.all([
      run(action("a"), { intentFingerprint: "intent-a" }),
      run(action("b"), { intentFingerprint: "intent-b" }),
    ]);

    expect(order).toEqual(["a:start", "a:end", "b:start", "b:end"]);
  });
});

// --- reconciliation ---------------------------------------------------------

describe("reconcileAttempts", () => {
  const sent = (attemptId: string, phase: DirectAttempt["phase"]) =>
    newAttempt({
      attemptId,
      phase,
      intentFingerprint: attemptId,
      ref: { mode: "mvrk", opHash: `oo-${attemptId}` },
    });

  it("resolves sent attempts only from receipts", async () => {
    const { store } = createStore();
    store.create(sent("applied", "unknown"));
    store.create(sent("backtracked", "injected"));
    store.create(sent("missing", "unknown"));
    store.create(sent("indexer-down", "broadcasting"));

    const receipts: Record<string, { status: string }[]> = {
      "oo-applied": [{ status: "applied" }, { status: "applied" }],
      "oo-backtracked": [{ status: "backtracked" }, { status: "failed" }],
      "oo-missing": [],
    };

    await reconcileAttempts({
      scope: IDENTITY,
      store,
      fetchOperationsByHash: async (_, opHash) => {
        if (opHash === "oo-indexer-down") throw new Error("503");
        return receipts[opHash];
      },
      isLockFree: async () => true,
    });

    expect(store.get("applied")?.phase).toBe("applied");
    expect(store.get("backtracked")?.phase).toBe("failed");
    expect(store.get("missing")?.phase).toBe("unknown");
    expect(store.get("indexer-down")?.phase).toBe("broadcasting");
  });

  it("marks a prepared attempt abandoned only when no tab is working on it", async () => {
    const { store } = createStore();
    store.create(newAttempt({ attemptId: "closed-tab" }));
    store.create(
      newAttempt({ attemptId: "signing-now", intentFingerprint: "busy" })
    );

    await reconcileAttempts({
      scope: IDENTITY,
      store,
      fetchOperationsByHash: async () => [],
      isLockFree: async (name) => !name.endsWith(":busy"),
    });

    expect(store.get("closed-tab")).toMatchObject({
      phase: "rejected",
      rejectReason: "abandoned",
    });
    expect(store.get("signing-now")?.phase).toBe("prepared");
  });
});

describe("inspectReceipt", () => {
  it("requires every manager and internal result to be applied", () => {
    expect(inspectReceipt([])).toBe("not-found");
    expect(inspectReceipt([{ status: "applied" }])).toBe("applied");
    expect(
      inspectReceipt([
        { status: "applied" },
        { status: "applied" },
        { status: "failed" },
      ])
    ).toBe("failed");
    expect(inspectReceipt([{ status: "skipped" }])).toBe("failed");
  });
});

describe("rebroadcastAttempt", () => {
  it("resends the exact same bytes and keeps the same hash", async () => {
    const { store } = createStore();
    const signedBytes = await signedOperationBytes();
    const opHash = encodeOpHash(signedBytes);
    store.create(
      newAttempt({ phase: "unknown", ref: { mode: "mvrk", opHash } })
    );
    store.setRetryBytes("a1", signedBytes);
    const injectOperation = vi.fn(async () => opHash);

    await expect(
      rebroadcastAttempt({ attemptId: "a1", store, injectOperation })
    ).resolves.toBe(true);
    expect(injectOperation).toHaveBeenCalledWith(signedBytes);
    expect(store.get("a1")?.phase).toBe("injected");
  });

  it("does nothing without the original bytes", async () => {
    const { store } = createStore();
    store.create(
      newAttempt({ phase: "unknown", ref: { mode: "mvrk", opHash: "oo" } })
    );
    const injectOperation = vi.fn();

    await expect(
      rebroadcastAttempt({ attemptId: "a1", store, injectOperation })
    ).resolves.toBe(false);
    expect(injectOperation).not.toHaveBeenCalled();
  });
});

describe("fingerprintIntent", () => {
  it("ignores key order and changes with any value", () => {
    expect(fingerprintIntent({ a: "1", b: { c: "2", d: "3" } })).toBe(
      fingerprintIntent({ b: { d: "3", c: "2" }, a: "1" })
    );
    expect(fingerprintIntent({ amount: "10" })).not.toBe(
      fingerprintIntent({ amount: "10.0" })
    );
  });
});
