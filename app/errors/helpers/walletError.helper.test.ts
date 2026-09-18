import { Estimate, type MavrykToolkit } from "@mavrykdynamics/taquito";
import { describe, expect, it, vi } from "vitest";

import { estimateBatchOperation } from "./walletError.helper";

describe("batch gas fee breakdown", () => {
  it("isolates gas with SDK rounding while retaining base, byte and storage costs", async () => {
    const estimates = [
      new Estimate(10_001, 3, 120, 250),
      new Estimate(20_000, 0, 80, 250),
    ];
    const toolkit = {
      estimate: { batch: vi.fn().mockResolvedValue(estimates) },
    } as unknown as MavrykToolkit;
    const result = await estimateBatchOperation(toolkit, []);

    expect(result.error).toBeUndefined();
    expect(result.totalGasFeeMutez).toBe(4);
    expect(result.totalCost - result.totalGasFeeMutez).toBe(1150);
    expect(result.totalCost).toBe(
      estimates.reduce((total, estimate) => total + estimate.totalCost, 0)
    );
  });
});
