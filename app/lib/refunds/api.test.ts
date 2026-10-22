import { afterEach, describe, expect, it, vi } from "vitest";
import { rwaApi } from "~/lib/apis/rwa/client";
import { readRefundPage, serviceFee, type RelayConfig } from "./api";
vi.mock("~/lib/apis/rwa/client", () => ({ rwaApi: { get: vi.fn() } }));
afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});
describe("refund read and fee contracts", () => {
  it("retries a throttled page using the identical cursor after Retry-After", async () => {
    vi.useFakeTimers();
    const page = {
      items: [],
      next_cursor: null,
      has_more: false,
      as_of: { orderbook: { level: 42, timestamp: "now", realtime: true } },
    };
    vi.mocked(rwaApi.get)
      .mockRejectedValueOnce({
        response: { status: 429, headers: { "retry-after": "2" } },
      })
      .mockResolvedValueOnce({ data: page });
    const result = readRefundPage("owner", "asset", "saved-cursor");
    await vi.advanceTimersByTimeAsync(1999);
    expect(rwaApi.get).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toEqual(page);
    expect(vi.mocked(rwaApi.get).mock.calls[0]).toEqual(
      vi.mocked(rwaApi.get).mock.calls[1]
    );
  });
  it("prices only schedule entries and refuses an unknown schedule", () => {
    const cfg: RelayConfig = {
      enabled: true,
      contracts: [],
      fee: { enabled: true, defaultFeeUnits: "7", feeSchedule: {} },
    };
    expect(serviceFee(cfg)).toBe("0");
    cfg.fee.feeSchedule = { permitProcessRefund: "3" };
    expect(serviceFee(cfg)).toBe("3");
    delete cfg.fee.feeSchedule;
    expect(() => serviceFee(cfg)).toThrow("unavailable");
    cfg.fee.enabled = false;
    expect(serviceFee(cfg)).toBe("0");
  });
});
