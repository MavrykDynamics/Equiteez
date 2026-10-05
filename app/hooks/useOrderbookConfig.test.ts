import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
const { query, fallback } = vi.hoisted(() => ({
  query: vi.fn(),
  fallback: vi.fn(),
}));
vi.mock("~/providers/ApolloProvider/hooks/useQueryWithRefetch", () => ({
  useQueryWithRefetch: query,
}));
vi.mock("~/providers/ApolloProvider/apollo.provider", () => ({
  useApolloContext: () => ({ handleApolloError: vi.fn() }),
}));
vi.mock("@tanstack/react-query", () => ({ useQuery: fallback }));
import { useOrderbookConfig } from "./useOrderbookConfig";
const asset = {
  address: "base",
  orderbook: {
    address: "book",
    quote_token: { address: "quote", token_id: 7 },
  },
} as AssetType;
const row = {
  address: "book",
  rwa_token: { address: "base", token_id: 19 },
  currencies: [
    { currency_name: "KEY", token: { address: "quote", token_id: 7 } },
  ],
  tick_size: "25",
  min_buy_order_amount: "0",
  min_buy_order_value: "0",
  min_sell_order_amount: "0",
  min_sell_order_value: "0",
};
const refetchQuery = vi.fn();
const refetchContract = vi.fn();
function renderConfig(selected = asset) {
  let result: ReturnType<typeof useOrderbookConfig> | undefined;
  function Probe() {
    result = useOrderbookConfig(selected);
    return null;
  }
  renderToString(createElement(Probe));
  return result!;
}
beforeEach(() => {
  vi.clearAllMocks();
  query.mockReturnValue({
    data: { orderbook: [row] },
    loading: false,
    refetch: refetchQuery,
  });
  fallback.mockReturnValue({ isPending: true, refetch: refetchContract });
});
describe("selected orderbook readiness", () => {
  it("avoids contract requests for complete API data and stays ready during polling", () => {
    query.mockReturnValue({
      data: { orderbook: [row] },
      loading: true,
      refetch: refetchQuery,
    });
    expect(renderConfig().status).toBe("ready");
    expect(fallback.mock.calls[0][0].enabled).toBe(false);
    expect(query.mock.calls[0][2].refetchInterval).toBe(30000);
  });
  it("exposes initial query failures and retry", async () => {
    query.mockReturnValue({
      error: new Error("Query failed"),
      refetch: refetchQuery,
    });
    const result = renderConfig();
    expect(result.status).toBe("error");
    expect(result.config).toBeUndefined();
    await result.retry();
    expect(refetchQuery).toHaveBeenCalledOnce();
  });
  it("retains resolved config during query errors so the form can display the error without resetting", () => {
    query.mockReturnValue({
      data: { orderbook: [row] },
      error: new Error("Polling failed"),
      refetch: refetchQuery,
    });
    const result = renderConfig();
    expect(result.status).toBe("error");
    expect(result.config?.address).toBe("book");
  });
  it("blocks unresolved fallback and exposes RPC errors and retry", async () => {
    query.mockReturnValue({
      data: { orderbook: [{ ...row, tick_size: null }] },
      refetch: refetchQuery,
    });
    expect(renderConfig().status).toBe("loading");
    fallback.mockReturnValue({
      isPending: false,
      error: new Error("RPC failed"),
      refetch: refetchContract,
    });
    const result = renderConfig();
    expect(result.status).toBe("error");
    expect(result.config).toBeUndefined();
    await result.retry();
    expect(refetchContract).toHaveBeenCalledOnce();
    expect(fallback.mock.calls[0][0]).toMatchObject({
      enabled: true,
      retry: false,
      retryOnMount: false,
    });
  });
  it("rejects previous-asset responses and assets without orderbooks", () => {
    expect(
      renderConfig({
        ...asset,
        orderbook: { ...asset.orderbook!, address: "next-book" },
      }).config
    ).toBeUndefined();
    expect(
      renderConfig({ ...asset, address: "next-base" }).config
    ).toBeUndefined();
    expect(renderConfig({ ...asset, orderbook: undefined }).status).toBe(
      "unavailable"
    );
  });
});
