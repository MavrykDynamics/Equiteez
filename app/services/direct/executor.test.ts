import { describe, expect, it, vi } from "vitest";
import { BigNumber } from "bignumber.js";

import type { AttemptIdentity } from "./attempt.types";
import { createAttemptStore } from "./attemptStore";
import { executeTrackedAction, intentFingerprintFor } from "./executor";
import { OperationFailedOnChainError } from "./operationResults";
import { UnresolvedAttemptError } from "./runDirectAttempt";

const identity: AttemptIdentity = {
  environment: "dev",
  chainId: "NetXJMfAoC7pZSW",
  address: "mv1source",
  provider: "mavryk_extension",
  walletId: "beacon",
  epoch: 1,
};

function memoryStorage() {
  const map = new Map<string, string>();

  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

const setup = () => {
  const store = createAttemptStore({
    local: memoryStorage(),
    session: memoryStorage(),
  });
  let id = 0;

  return {
    store,
    tracking: { identity, store, slot: { current: null } },
    nextId: () => `attempt-${++id}`,
  };
};

const intent = { orderbook: "KT1", amount: new BigNumber("10") };

describe("executeTrackedAction", () => {
  it("runs untracked until a wallet identity exists", async () => {
    const run = vi.fn(async () => "done");

    await expect(
      executeTrackedAction({ tracking: null, action: "buy", intent, run })
    ).resolves.toBe("done");
  });

  it("records an extension wallet's hash and the applied outcome", async () => {
    const { store, tracking } = setup();

    await executeTrackedAction({
      tracking,
      action: "orderbook.buy",
      intent,
      run: async ({ onSubmitted, onApplied }) => {
        onSubmitted("ooHash");
        onApplied();
      },
    });

    expect(store.list(identity)).toEqual([
      expect.objectContaining({
        action: "orderbook.buy",
        phase: "applied",
        ref: { mode: "mvrk", opHash: "ooHash" },
      }),
    ]);
  });

  it("records an on-chain failure as failed, not unknown", async () => {
    const { store, tracking } = setup();

    await expect(
      executeTrackedAction({
        tracking,
        action: "orderbook.buy",
        intent,
        run: async ({ onSubmitted }) => {
          onSubmitted("ooHash");
          throw new OperationFailedOnChainError("ooHash", "script_rejected");
        },
      })
    ).rejects.toBeInstanceOf(OperationFailedOnChainError);
    expect(store.list(identity)[0].phase).toBe("failed");
  });

  it("blocks resubmitting the same intent while its result is unknown", async () => {
    const { tracking } = setup();

    await expect(
      executeTrackedAction({
        tracking,
        action: "orderbook.buy",
        intent,
        run: async ({ onSubmitted }) => {
          onSubmitted("ooHash");
          throw new Error("confirmation timed out");
        },
      })
    ).rejects.toThrow("confirmation timed out");

    const run = vi.fn();
    await expect(
      executeTrackedAction({
        tracking,
        action: "orderbook.buy",
        // Same values, different object/BigNumber instances
        intent: { amount: new BigNumber(10), orderbook: "KT1" },
        run,
      })
    ).rejects.toBeInstanceOf(UnresolvedAttemptError);
    expect(run).not.toHaveBeenCalled();
  });

  it("fingerprints the action and its plain values only", () => {
    const toolkit = new (class Toolkit {})();

    expect(
      intentFingerprintFor("orderbook.buy", {
        ...intent,
        tezos: toolkit,
        onTransactionSubmitted: () => undefined,
      })
    ).toBe(intentFingerprintFor("orderbook.buy", intent));
    expect(intentFingerprintFor("orderbook.sell", intent)).not.toBe(
      intentFingerprintFor("orderbook.buy", intent)
    );
  });
});
