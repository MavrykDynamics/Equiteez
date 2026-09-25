import { beforeEach, describe, expect, it } from "vitest";
import {
  BridgeTransactions,
  bridgeNetwork,
  withBridgeProgress,
} from "./bridgeTransactions";
import { bridgeDepositsSchema } from "~/lib/apis/rwa/bridge/bridge.schema";
import { hasBridgeDeploymentBinding } from "~/lib/apis/rwa/bridge/bridge.config";
import { USDT_BRIDGE } from "~/consts/usdtBridge";

import {
  hash,
  replacementHash,
  localRecord,
  deposit,
} from "./bridgeTransactions.fixtures";

let memory: Map<string, string>;
let store: BridgeTransactions;
const storage = () => ({
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, value);
  },
});
beforeEach(() => {
  memory = new Map();
  store = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
});

describe("canonical bridge transactions", () => {
  it("ignores duplicate and out-of-order local progress and persists before returning", () => {
    store.update(localRecord());
    expect(memory.size).toBe(1);
    const snapshot = store.getSnapshot();
    store.update(localRecord());
    store.update({ ...localRecord(), sequence: 0 });
    expect(store.getSnapshot()).toBe(snapshot);
  });
  it("retains concurrent deposits and matches replacement hashes", () => {
    store.update(localRecord());
    store.update({
      ...localRecord("operation-2"),
      sourceHashes: [replacementHash],
    });
    store.reconcile([
      deposit(),
      deposit({ evm_tx_hash: replacementHash, status: "signing" }),
    ]);
    expect(store.getSnapshot().transactions.size).toBe(2);
    expect(
      store.getSnapshot().transactions.get("operation-2")?.settlement
    ).toBe("signing");
  });
  it("correlates replacement hashes without erasing the original", () => {
    store.update(localRecord());
    store.update(
      withBridgeProgress(localRecord(), {
        step: "lock",
        status: "confirming",
        hash: replacementHash,
      })
    );
    store.reconcile([
      deposit({ evm_tx_hash: replacementHash, status: "executed" }),
    ]);
    expect(store.getSnapshot().transactions.size).toBe(1);
    expect(
      store.getSnapshot().transactions.get("operation-1")?.sourceHashes
    ).toEqual([hash, replacementHash]);
  });
  it("merges backend discovery arriving before the local broadcast callback", () => {
    store.reconcile([deposit()]);
    store.update(localRecord());
    expect(store.getSnapshot().transactions.size).toBe(1);
    expect(
      store.getSnapshot().transactions.get("operation-1")?.settlement
    ).toBe("confirming");
  });
  it("adopts a re-inclusion log index by source hash", () => {
    store.update(localRecord());
    store.reconcile([deposit()]);
    store.reconcile([
      deposit({ log_index: 4, updated_at: "2026-09-23T12:01:00Z" }),
    ]);
    expect(store.getSnapshot().transactions.size).toBe(1);
    expect(
      store.getSnapshot().transactions.get("operation-1")?.backend?.log_index
    ).toBe(4);
  });
  it("does not collapse two deposits in one source transaction", () => {
    store.reconcile([deposit(), deposit({ log_index: 2 })]);
    expect(store.getSnapshot().transactions.size).toBe(2);
  });
  it("rejects older snapshots and conflicting equal timestamps", () => {
    store.update(localRecord());
    store.reconcile([deposit({ status: "signing" })]);
    store.reconcile([deposit({ updated_at: "2026-09-23T11:00:00Z" })]);
    store.reconcile([deposit()]);
    const record = store.getSnapshot().transactions.get("operation-1");
    expect(record?.settlement).toBe("signing");
    expect(record?.verification).toBe("stale");
  });
  it("announces executed once and never regresses it", () => {
    store.update(localRecord());
    expect(store.reconcile([deposit({ status: "executed" })])).toHaveLength(1);
    expect(store.reconcile([deposit({ status: "executed" })])).toHaveLength(0);
    store.reconcile([
      deposit({ status: "stalled", updated_at: "2026-09-23T13:00:00Z" }),
    ]);
    expect(
      store.getSnapshot().transactions.get("operation-1")?.settlement
    ).toBe("executed");
    expect(store.hasPending()).toBe(false);
  });
  it("stops polling stalled deposits but accepts later execution", () => {
    store.update(localRecord());
    store.reconcile([deposit({ status: "stalled" })]);
    expect(store.hasPending()).toBe(false);
    expect(store.reconcile([deposit({ status: "executed" })])).toHaveLength(1);
  });
  it("keeps source confirmation separate from backend settlement", () => {
    store.update(localRecord());
    store.reconcile([deposit({ status: "signing" })]);
    store.update(
      withBridgeProgress(localRecord(), {
        step: "lock",
        status: "confirmed",
        hash,
      })
    );
    const record = store.getSnapshot().transactions.get("operation-1");
    expect(record?.settlement).toBe("signing");
    expect(record?.progress?.status).toBe("confirmed");
  });
  it("restores as unverified, reconciles a disconnect completion, and avoids repeat toasts on reload", () => {
    store.update(localRecord());
    const restored = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
    restored.restore();
    expect(
      restored.getSnapshot().transactions.get("operation-1")?.verification
    ).toBe("unverified");
    expect(restored.reconcile([deposit({ status: "executed" })])).toHaveLength(
      1
    );
    const again = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
    again.restore();
    expect(again.reconcile([deposit({ status: "executed" })])).toHaveLength(0);
    expect(
      again.getSnapshot().transactions.get("operation-1")?.verification
    ).toBe("verified");
  });
  it("discovers external deposits without toasting historical completions", () => {
    expect(store.reconcile([deposit({ status: "executed" })])).toEqual([
      expect.objectContaining({ shouldNotify: false }),
    ]);
    expect(store.getSnapshot().transactions.size).toBe(1);
  });
  it("does not infer failure or delete records missing from the bounded list", () => {
    store.update(localRecord());
    store.reconcile([deposit()]);
    store.reconcile([]);
    expect(
      store.getSnapshot().transactions.get("operation-1")?.verification
    ).toBe("stale");
    expect(
      store.getSnapshot().transactions.get("operation-1")?.settlement
    ).toBe("confirming");
  });
  it("isolates account and network storage and ignores foreign progress", () => {
    store.update(localRecord());
    const otherAccount = new BridgeTransactions(
      "wallet-b",
      bridgeNetwork,
      storage
    );
    const otherNetwork = new BridgeTransactions(
      "wallet-a",
      "other-network",
      storage
    );
    for (const other of [otherAccount, otherNetwork]) {
      other.restore();
      other.update(localRecord());
      expect(other.getSnapshot().transactions.size).toBe(0);
    }
  });
  it("reports storage failures and preserves unreadable recovery data", () => {
    store.update(localRecord());
    const key = [...memory.keys()][0];
    memory.set(key, "broken");
    const restored = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
    restored.update(localRecord());
    expect(restored.getSnapshot().storageError).toBeTruthy();
    expect(memory.get(key)).toBe("broken");
    const denied = new BridgeTransactions("wallet-a", bridgeNetwork, () => ({
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    }));
    denied.update(localRecord());
    expect(denied.getSnapshot().storageError).toContain("could not be saved");
    expect(denied.getSnapshot().transactions.size).toBe(1);
  });
  it("rejects malformed status, hash, timestamp and confirmation counts", () => {
    for (const invalid of [
      { status: "COMPLETED" },
      { evm_tx_hash: "bad" },
      { updated_at: "yesterday" },
      { signer_count: -1 },
    ])
      expect(
        bridgeDepositsSchema.safeParse({
          deposits: [{ ...deposit(), ...invalid }],
        }).success
      ).toBe(false);
  });
});

it("requires an explicit binding to the exact API deployment and bridge pair", () => {
  const binding = {
    apiUrl: "https://api.example/api/v1/",
    sourceChainId: USDT_BRIDGE.chainId,
    destinationNetwork: USDT_BRIDGE.destinationNetwork,
    sourceBridge: USDT_BRIDGE.address,
  };
  expect(hasBridgeDeploymentBinding(undefined, binding.apiUrl)).toBe(false);
  expect(
    hasBridgeDeploymentBinding(JSON.stringify(binding), binding.apiUrl)
  ).toBe(true);
  expect(
    hasBridgeDeploymentBinding(
      JSON.stringify(binding),
      "https://other.example/api/v1/"
    )
  ).toBe(false);
  expect(
    hasBridgeDeploymentBinding(
      JSON.stringify({ ...binding, sourceChainId: 1 }),
      binding.apiUrl
    )
  ).toBe(false);
  expect(
    hasBridgeDeploymentBinding(
      JSON.stringify({ ...binding, destinationNetwork: "mainnet" }),
      binding.apiUrl
    )
  ).toBe(false);
});

it("preserves a broadcast added by another tab after this store restored", () => {
  store.restore();
  const other = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
  other.update({
    ...localRecord("operation-2"),
    sourceHashes: [replacementHash],
  });
  store.update(localRecord());
  const restored = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
  restored.restore();
  expect(restored.getSnapshot().transactions.size).toBe(2);
});

it("accepts authoritative execution even if the last signer transition predates a stalled snapshot", () => {
  store.update(localRecord());
  store.reconcile([
    deposit({ status: "stalled", updated_at: "2026-09-23T13:00:00Z" }),
  ]);
  store.reconcile([deposit({ status: "executed" })]);
  expect(store.getSnapshot().transactions.get("operation-1")?.settlement).toBe(
    "executed"
  );
});

it("recovers equal-timestamp read metadata repeatedly and after reload without settlement effects", () => {
  store.update(localRecord());
  store.reconcile([deposit({ status: "signing" })]);
  store.markStale("Temporary read failure");
  const recovered = deposit({
    status: "signing",
    signatory_threshold: 2,
    required_confirmations: null,
    amount: "1.234",
    decimals: 3,
    token: "wrapped-token",
  });
  for (let i = 0; i < 2; i++) {
    expect(store.reconcile([recovered])).toEqual([]);
    expect(store.getSnapshot().transactions.get("operation-1")).toMatchObject({
      verification: "verified",
      backend: recovered,
    });
    expect(store.getSnapshot().reconciliationError).toBeNull();
  }
  const restored = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
  restored.restore();
  expect(restored.reconcile([recovered])).toEqual([]);
  expect(
    restored.getSnapshot().transactions.get("operation-1")?.verification
  ).toBe("verified");
});
it("still rejects equal-time lifecycle/identity conflicts and older metadata", () => {
  const original = deposit({ status: "signing" });
  store.update(localRecord());
  store.reconcile([original]);
  for (const conflict of [
    { status: "confirming" as const },
    { signer_count: 1 },
    { log_index: 4 },
    { amount_raw: "99" },
    { token_evm: `0x${"2".repeat(40)}` },
    { signatory_threshold: 2, updated_at: "2026-09-23T11:00:00Z" },
  ]) {
    store.reconcile([{ ...original, ...conflict }]);
    expect(store.getSnapshot().transactions.get("operation-1")).toMatchObject({
      verification: "stale",
      backend: original,
    });
  }
  store.reconcile([deposit({ status: "executed" })]);
  store.reconcile([deposit({ status: "signing", signatory_threshold: 2 })]);
  expect(store.getSnapshot().transactions.get("operation-1")).toMatchObject({
    settlement: "executed",
    verification: "verified",
  });
});
