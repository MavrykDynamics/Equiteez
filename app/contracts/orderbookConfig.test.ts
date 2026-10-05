import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
const { executeView, at } = vi.hoisted(() => ({
  executeView: vi.fn(),
  at: vi.fn(),
}));
vi.mock("@mavrykdynamics/taquito", () => ({
  MavrykToolkit: class {
    contract = { at };
  },
}));
import { readOrderbookConfig } from "./orderbookConfig";

beforeEach(() => {
  vi.clearAllMocks();
  at.mockResolvedValue({
    contractViews: { getConfig: () => ({ executeView }) },
  });
  executeView.mockResolvedValue({
    tickSize: new BigNumber("100000"),
    minBuyOrderAmount: new BigNumber(0),
    minBuyOrderValue: new BigNumber(1),
    minSellOrderAmount: new BigNumber(0),
    minSellOrderValue: new BigNumber(1),
  });
});
describe("read-only selected contract configuration", () => {
  it("validates verified view fields without losing atom precision", async () => {
    expect(await readOrderbookConfig("book")).toEqual({
      tickSize: "100000",
      minBuyOrderAmount: "0",
      minBuyOrderValue: "1",
      minSellOrderAmount: "0",
      minSellOrderValue: "1",
    });
    expect(at).toHaveBeenCalledWith("book");
    expect(executeView).toHaveBeenCalledWith({ viewCaller: "book" });
  });
  it("does not turn missing or invalid view fields into zeros", async () => {
    executeView.mockResolvedValueOnce({ tickSize: new BigNumber(0) });
    await expect(readOrderbookConfig("book")).rejects.toThrow("tickSize");
    executeView.mockResolvedValueOnce({ tickSize: new BigNumber(10) });
    await expect(readOrderbookConfig("book")).rejects.toThrow(
      "minBuyOrderAmount"
    );
  });
  it("isolates cached books, exposes failures, and permits explicit retry", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    const options = (address: string) => ({
      queryKey: ["orderbook-contract-config", "network", address],
      queryFn: () => readOrderbookConfig(address),
    });
    executeView.mockRejectedValueOnce(new Error("RPC unavailable"));
    await expect(client.fetchQuery(options("book-a"))).rejects.toThrow(
      "RPC unavailable"
    );
    expect(client.getQueryState(options("book-a").queryKey)?.status).toBe(
      "error"
    );
    await client.fetchQuery(options("book-b"));
    await client.fetchQuery(options("book-b"));
    expect(at).toHaveBeenCalledTimes(2);
    await client.fetchQuery(options("book-a"));
    expect(client.getQueryState(options("book-a").queryKey)?.status).toBe(
      "success"
    );
    client.clear();
  });
});
