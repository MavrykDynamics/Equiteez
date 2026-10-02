// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import { usePrimaryPurchase } from "./usePrimaryPurchase";

const mocks = vi.hoisted(() => ({
  read: vi.fn(async () => ({ options: [] })),
  tezos: { rpc: { getRpcUrl: () => "https://basenet.rpc.mavryk.network" } },
}));
vi.mock("~/contracts/primaryPurchase.read", () => ({
  readPrimaryPurchaseConfig: mocks.read,
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ userAddress: "wallet" }),
}));
vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({ dapp: { tezos: () => mocks.tezos } }),
}));
vi.mock("~/lib/apis/rwa/freshness", () => ({
  FreshnessSource: { Chain: "chain" },
  useFreshQueryInvalidation: () => vi.fn(),
}));
vi.mock("~/providers/NotificationsProvider/hooks/useNotifierEvent", () => ({
  useNotifierEvent: vi.fn(),
}));
vi.mock("~/lib/apis/primaryPurchases/primaryPurchases", () => ({
  PRIMARY_HISTORY_QUERY_KEY: "primary-history",
}));
vi.mock("../../hooks/assetLaunch", () => ({
  assetLaunchQueryOptions: (address: string) => ({
    queryKey: ["launch", address],
    queryFn: async () => ({ name: "launch" }),
  }),
}));

it("reads on form entry and explicit refresh without background chain polling", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.useFakeTimers();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const container = document.createElement("div");
  const root = createRoot(container);
  let query: ReturnType<typeof usePrimaryPurchase>;
  function Form() {
    query = usePrimaryPurchase("asset");
    return null;
  }
  try {
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <Form />
        </QueryClientProvider>
      )
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(mocks.read).toHaveBeenCalledOnce();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(mocks.read).toHaveBeenCalledOnce();
    await act(async () => {
      await query!.refetch();
    });
    expect(mocks.read).toHaveBeenCalledTimes(2);
  } finally {
    await act(async () => root.unmount());
    client.clear();
    vi.useRealTimers();
  }
});
