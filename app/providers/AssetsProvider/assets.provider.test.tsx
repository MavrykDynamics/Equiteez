// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AssetsProvider, useAssetsContext } from "./assets.provider";

const mocks = vi.hoisted(() => ({
  assetsQuery: {} as Record<string, unknown>,
  pricesQuery: {} as Record<string, unknown>,
  invalidate: vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: { queryKey: string[] }) =>
    options.queryKey[0] === "rwa-assets" ? mocks.assetsQuery : mocks.pricesQuery,
  useQueryClient: () => ({ invalidateQueries: (...args: unknown[]) => mocks.invalidate(...args) }),
}));
vi.mock("~/lib/apis/rwa/assets/assets", () => ({ fetchAssets: vi.fn() }));
vi.mock("~/lib/apis/rwa/prices/prices", () => ({ fetchPrices: vi.fn() }));

let root: Root;
let element: HTMLDivElement;
let context: ReturnType<typeof useAssetsContext>;
function Probe() { context = useAssetsContext(); return null; }
async function render() { await act(async () => root.render(createElement(AssetsProvider, null, createElement(Probe)))); }
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.invalidate.mockReset().mockResolvedValue(undefined);
  mocks.assetsQuery = { data: { items: [{ metadata: { name: "RWA Token", symbol: "RWA", token_address: "KT1" }, profile: { asset_type: "REAL_ESTATE" } }] }, isLoading: false, isFetching: false, isPending: false, error: null };
  mocks.pricesQuery = { data: { assets: [{ token_address: "KT1", price: "12" }] }, isLoading: false, isFetching: false, isPending: false };
  element = document.createElement("div"); root = createRoot(element);
});
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });

it("normalizes assets, indexes prices and exposes settled loading state", async () => {
  await render();
  expect(context.assets[0].metadata.name).toBe(" ");
  expect(context.prices).toEqual({ KT1: { token_address: "KT1", price: "12" } });
  expect(context.isLoading).toBe(false);
  expect(context.isPricesLoading).toBe(false);
});

it("invalidates launch-related queries, scoped to the supplied token", async () => {
  await render();
  await act(async () => context.invalidateLaunchAssetQueries("KT1"));
  expect(mocks.invalidate).toHaveBeenCalledTimes(4);
  expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["asset-launch", "KT1"] });
});

it("does not add a token-specific invalidation without a token address", async () => {
  await render();
  await act(async () => context.invalidateLaunchAssetQueries());
  expect(mocks.invalidate).toHaveBeenCalledTimes(3);
});
