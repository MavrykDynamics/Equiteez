// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PortfolioProvider, usePortfolioContext } from "./portfolio.provider";

const mocks = vi.hoisted(() => ({ authenticated: true, address: "wallet-a" as string | null, queries: [] as Array<Record<string, unknown>> }));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({ useAuthContext: () => ({ isAuthenticated: mocks.authenticated }) }));
vi.mock("~/providers/UserProvider/user.provider", () => ({ useUserContext: () => ({ userAddress: mocks.address }) }));
vi.mock("@tanstack/react-query", () => ({ useQuery: (options: { queryKey: string[] }) => options.queryKey[0] === "rwa-wallet" ? mocks.queries[0] : mocks.queries[1] }));
vi.mock("~/lib/apis/rwa", () => ({ fetchWallet: vi.fn(), fetchWalletPortfolio: vi.fn() }));
let root: ReturnType<typeof createRoot>; let value: ReturnType<typeof usePortfolioContext>;
function Probe() { value = usePortfolioContext(); return null; }
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); mocks.authenticated = true; mocks.address = "wallet-a"; mocks.queries = [{ data: { id: "wallet" }, isLoading: false, isFetching: false, isPending: false }, { data: { total: "10" }, isLoading: false, isFetching: false, isPending: false }]; root = createRoot(document.createElement("div")); });
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
it("exposes wallet and portfolio data with combined loading state", async () => { await act(async () => root.render(createElement(PortfolioProvider, null, createElement(Probe)))); expect(value).toMatchObject({ userAddress: "wallet-a", wallet: { id: "wallet" }, portfolio: { total: "10" }, isLoading: false }); });
it("disables both queries without an authenticated address", async () => { mocks.authenticated = false; mocks.address = null; await act(async () => root.render(createElement(PortfolioProvider, null, createElement(Probe)))); expect(value.userAddress).toBeNull(); });
