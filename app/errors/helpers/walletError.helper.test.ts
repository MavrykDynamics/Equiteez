import { Estimate, type MavrykToolkit } from "@mavrykdynamics/taquito";
import { describe, expect, it, vi } from "vitest";

import { estimateBatchOperation } from "./walletError.helper";

describe("batch fee estimation", () => {
  it("keeps the suggested operation fee separate from storage-inclusive total cost", async () => {
    const estimates = [
      new Estimate(10_001, 3, 120, 250),
      new Estimate(20_000, 0, 80, 250),
    ];
    const toolkit = {
      estimate: { batch: vi.fn().mockResolvedValue(estimates) },
    } as unknown as MavrykToolkit;
    const result = await estimateBatchOperation(toolkit, []);

    expect(result.error).toBeUndefined();
    expect(result.totalSuggestedFeeMutez).toBe(444);
    expect(result.totalCost).toBe(1154);
    expect(result.totalCost).toBe(
      estimates.reduce((total, estimate) => total + estimate.totalCost, 0)
    );
  });
});
