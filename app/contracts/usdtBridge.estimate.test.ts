import { describe, expect, it, vi } from "vitest";
import { BigNumber } from "bignumber.js";
import type { PublicClient } from "viem";
import { estimateUsdtBridge } from "./usdtBridge.estimate";

const account = "0x1111111111111111111111111111111111111111";
const recipient = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";

function setup(allowance: bigint) {
  const client = {
    readContract: vi.fn().mockResolvedValue(allowance),
    estimateFeesPerGas: vi
      .fn()
      .mockResolvedValue({ maxFeePerGas: 30n, maxPriorityFeePerGas: 2n }),
    getBlock: vi
      .fn()
      .mockResolvedValueOnce({
        number: 100n,
        timestamp: 1200n,
        baseFeePerGas: 10n,
      })
      .mockResolvedValue({ number: 90n, timestamp: 1080n }),
    estimateContractGas: vi.fn().mockResolvedValue(100n),
    simulateBlocks: vi.fn(),
  };
  const estimate = () =>
    estimateUsdtBridge(
      client as unknown as PublicClient,
      account,
      new BigNumber(1),
      recipient
    );
  return { client, estimate };
}

describe("bridge estimates", () => {
  it("uses effective gas price, not the fee cap, for an already approved lock", async () => {
    const { client, estimate } = setup(10n ** 18n);
    expect(await estimate()).toEqual({
      fee: "1200",
      timeSeconds: { min: 12, max: 36 },
    });
    expect(client.simulateBlocks).not.toHaveBeenCalled();
  });

  it.each([0n, 1n])(
    "simulates the full approval sequence for allowance %s",
    async (allowance) => {
      const { client, estimate } = setup(allowance);
      const count = allowance === 0n ? 2 : 3;
      client.simulateBlocks.mockResolvedValue([
        {
          calls: Array.from({ length: count }, () => ({
            status: "success",
            result: true,
            gasUsed: 100n,
          })),
        },
      ]);
      const result = await estimate();
      expect(result.fee).toBe(String(count * 1200));
      const calls = client.simulateBlocks.mock.calls[0][0].blocks[0].calls;
      expect(
        calls.map((call: { args: readonly unknown[] }) => call.args[1])
      ).toEqual(
        allowance === 0n
          ? [10n ** 18n, 10n ** 18n]
          : [0n, 10n ** 18n, 10n ** 18n]
      );
    }
  );

  it.each(["unsupported", "reverted", "false", "incomplete"])(
    "does not invent a fee when simulation is %s",
    async (failure) => {
      const { client, estimate } = setup(0n);
      if (failure === "unsupported")
        client.simulateBlocks.mockRejectedValue(new Error("Unsupported RPC"));
      else
        client.simulateBlocks.mockResolvedValue([
          {
            calls:
              failure === "incomplete"
                ? []
                : Array.from({ length: 2 }, () =>
                    failure === "reverted"
                      ? { status: "failure", error: new Error("Reverted") }
                      : { status: "success", result: false, gasUsed: 100n }
                  ),
          },
        ]);
      expect(await estimate()).toEqual({
        fee: null,
        timeSeconds: { min: 24, max: 72 },
      });
    }
  );
});
