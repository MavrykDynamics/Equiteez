import { describe, expect, it, vi } from "vitest";
import { executeRun, RefundFailure, type RefundPorts } from "./runner";
import { restoreRun, type RefundRun } from "./model";

function run(): RefundRun {
  return {
    version: 1,
    wallet: "owner",
    chain: "network",
    asset: "asset",
    mode: "credits",
    items: [],
    feePerChunk: "0",
    feeToken: "",
    feeDecimals: 0,
    chunks: ["1", "2"].map((id) => ({
      book: "book",
      orders: [{ orderId: id, orderType: "BUY" }],
      state: "ready",
    })),
  };
}
function ports(): RefundPorts {
  return {
    assertScope: vi.fn().mockResolvedValue(undefined),
    sign: vi.fn().mockImplementation(async (c) => ({
      idempotencyKey: c.orders[0].orderId,
    })),
    submit: vi
      .fn()
      .mockImplementation(async (r) => ({ operationId: r.idempotencyKey })),
    send: vi.fn().mockResolvedValue("hash"),
    relay: vi.fn().mockResolvedValue({ status: "confirmed", opHash: "hash" }),
    chain: vi.fn().mockResolvedValue({ state: "applied", level: 42 }),
    indexed: vi.fn().mockResolvedValue(true),
    persist: vi.fn(),
    pause: vi.fn().mockResolvedValue(undefined),
  };
}
describe("refund chunk execution", () => {
  it("tracks submitted parts while the flag is off without starting the next one", async () => {
    const r = run(),
      p = ports();
    r.chunks[0].state = "submitted";
    r.chunks[0].operationId = "already-sent";
    await expect(executeRun(r, p, false)).rejects.toThrow("paused");
    expect(r.chunks[0].state).toBe("confirmed");
    expect(r.chunks[1].state).toBe("ready");
    expect(p.sign).not.toHaveBeenCalled();
    expect(p.submit).not.toHaveBeenCalled();
  });
  it("preserves the first payout when the next part fails and never re-signs it", async () => {
    const r = run(),
      p = ports();
    p.relay = vi
      .fn()
      .mockResolvedValueOnce({ status: "confirmed", opHash: "first" })
      .mockResolvedValueOnce({
        status: "failed",
        error: { code: "OPERATION_RESOURCE_LIMIT", message: "Too large" },
      });
    await expect(executeRun(r, p)).rejects.toThrow("Too large");
    expect(r.chunks.map((c) => c.state)).toEqual(["confirmed", "failed"]);
    const signs = vi.mocked(p.sign).mock.calls.length;
    await expect(
      executeRun(restoreRun(JSON.stringify(r), "owner", "network", "asset"), p)
    ).rejects.toThrow();
    expect(p.sign).toHaveBeenCalledTimes(signs);
  });
  it("reuses identical signed bytes and key after a lost submit response", async () => {
    const r = run();
    r.chunks = r.chunks.slice(0, 1);
    const p = ports();
    p.submit = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce({ operationId: "same" });
    await expect(executeRun(r, p)).rejects.toThrow("timeout");
    expect(r.chunks[0].state).toBe("submitting");
    const restored = restoreRun(JSON.stringify(r), "owner", "network", "asset");
    await executeRun(restored, p);
    expect(p.sign).toHaveBeenCalledTimes(1);
    expect(vi.mocked(p.submit).mock.calls[0]).toEqual(
      vi.mocked(p.submit).mock.calls[1]
    );
  });
  it("blocks new signing for ambiguous direct sends and scopes every step", async () => {
    const r = run();
    r.mode = "mvrk";
    const p = ports();
    p.send = vi.fn().mockRejectedValue(new Error("lost wallet response"));
    await expect(executeRun(r, p)).rejects.toThrow();
    expect(r.chunks[0].state).toBe("unknown");
    await expect(executeRun(r, p)).rejects.toThrow("unknown");
    expect(p.send).toHaveBeenCalledTimes(1);
    const next = run();
    p.assertScope = vi
      .fn()
      .mockRejectedValue(new RefundFailure("SCOPE_CHANGED", "account changed"));
    await expect(executeRun(next, p)).rejects.toThrow("account changed");
    expect(p.sign).not.toHaveBeenCalled();
  });
  it("waits for applied execution and indexer catch-up before signing the next part", async () => {
    const r = run(),
      p = ports();
    let secondSigned = false;
    p.sign = vi.fn().mockImplementation(async (c) => {
      if (c.orders[0].orderId === "2") secondSigned = true;
      return { idempotencyKey: c.orders[0].orderId };
    });
    p.indexed = vi
      .fn()
      .mockImplementationOnce(async () => {
        expect(secondSigned).toBe(false);
        return false;
      })
      .mockResolvedValue(true);
    await executeRun(r, p);
    expect(p.pause).toHaveBeenCalledTimes(1);
    expect(r.chunks.every((c) => c.state === "confirmed")).toBe(true);
  });
  it("rechecks a restored applied receipt before accepting the indexer level", async () => {
    const r = run();
    r.mode = "mvrk";
    r.chunks = [{ ...r.chunks[0], state: "applied", hash: "hash", level: 42 }];
    const p = ports();
    p.chain = vi
      .fn()
      .mockResolvedValueOnce({ state: "pending" })
      .mockResolvedValue({ state: "applied", level: 44 });
    await executeRun(r, p);
    expect(p.chain).toHaveBeenCalledTimes(2);
    expect(p.indexed).toHaveBeenCalledTimes(1);
    expect(p.indexed).toHaveBeenCalledWith(44);
    expect(p.send).not.toHaveBeenCalled();
  });
  it("keeps legacy relay lost-result verdicts unresolved", async () => {
    const r = run(),
      p = ports();
    p.relay = vi.fn().mockResolvedValue({
      status: "failed",
      error: { code: "RELAY_SUBMIT_FAILED", message: "unknown" },
    });
    await expect(executeRun(r, p)).rejects.toThrow();
    expect(r.chunks[0].state).toBe("unknown");
    expect(p.sign).toHaveBeenCalledTimes(1);
  });
});
