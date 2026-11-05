import { describe, expect, it, vi } from "vitest";
import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { withCachedChainId } from "./chainId";

const toolkit = (url: string, getChainId: () => Promise<string>) =>
  ({ rpc: { getRpcUrl: () => url, getChainId } }) as unknown as MavrykToolkit;

describe("withCachedChainId", () => {
  it("asks each RPC node once, across toolkits", async () => {
    const lookup = vi.fn(async () => "NetA");
    const first = withCachedChainId(toolkit("https://a.test", lookup));
    const second = withCachedChainId(toolkit("https://a.test", lookup));
    await expect(first.rpc.getChainId()).resolves.toBe("NetA");
    await expect(second.rpc.getChainId()).resolves.toBe("NetA");
    expect(lookup).toHaveBeenCalledOnce();
  });
  it("keys by RPC URL", async () => {
    const other = withCachedChainId(
      toolkit("https://b.test", async () => "NetB")
    );
    await expect(other.rpc.getChainId()).resolves.toBe("NetB");
  });
  it("retries after a failed lookup", async () => {
    const lookup = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("502"))
      .mockResolvedValueOnce("NetC");
    const node = withCachedChainId(toolkit("https://c.test", lookup));
    await expect(node.rpc.getChainId()).rejects.toThrow("502");
    await expect(node.rpc.getChainId()).resolves.toBe("NetC");
  });
});
