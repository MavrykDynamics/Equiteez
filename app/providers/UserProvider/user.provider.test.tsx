// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { UserProvider, useUserContext } from "./user.provider";
import type { UserContext } from "./user.provider.types";

const mocks = vi.hoisted(() => ({
  authenticatedWalletAddress: null as string | null,
  isAuthenticated: false,
  isAuthLoading: false,
  appIsWeb: true,
  accountListener: null as ((account: { address: string } | null) => void) | null,
  connect: vi.fn(),
  signOut: vi.fn(),
  changeUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  loadTokens: vi.fn(),
  refetchStatus: vi.fn(),
  query: {
    data: undefined as unknown,
    loading: false,
    error: undefined as unknown,
    refetch: vi.fn(),
  },
}));

vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({
    dapp: {
      listenToActiveAccount: (listener: typeof mocks.accountListener) => {
        mocks.accountListener = listener;
        return Promise.resolve();
      },
    },
  }),
}));
vi.mock("~/providers/AppProvider/AppProvider", () => ({
  useAppContext: () => ({ IS_WEB: mocks.appIsWeb }),
}));
vi.mock("~/providers/TokensProvider/tokens.provider", () => ({
  useTokensContext: () => ({ tokensMetadata: {} }),
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({
    authenticatedWalletAddress: mocks.authenticatedWalletAddress,
    isAuthenticated: mocks.isAuthenticated,
    isAuthLoading: mocks.isAuthLoading,
    login: () => mocks.login(),
    logout: () => mocks.logout(),
  }),
}));
vi.mock("./hooks/useUserApi", () => ({
  useUserApi: () => ({
    connect: () => mocks.connect(),
    signOut: () => mocks.signOut(),
    changeUser: () => mocks.changeUser(),
  }),
}));
vi.mock("./helpers/sockets", () => ({
  useUserSockets: () => ({
    loadInitialTzktTokensForNewlyConnectedUser: (...args: unknown[]) =>
      mocks.loadTokens(...args),
    tzktSocket: null,
    setTzktSocket: vi.fn(),
  }),
}));
vi.mock("@apollo/client/index", () => ({
  useQuery: () => mocks.query,
}));
vi.mock("./queries/user.query", () => ({ USER_ACCOUNT_STATUS_QUERY: {} }));

let root: Root;
let element: HTMLDivElement;
let context: UserContext;

function Probe() {
  context = useUserContext();
  return null;
}

async function render() {
  await act(async () => {
    root.render(createElement(UserProvider, null, createElement(Probe)));
  });
}

async function rerender() {
  await render();
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  Object.values(mocks).forEach((value) => {
    if (typeof value === "function" && "mockReset" in value) value.mockReset();
  });
  mocks.authenticatedWalletAddress = null;
  mocks.isAuthenticated = false;
  mocks.isAuthLoading = false;
  mocks.appIsWeb = true;
  mocks.accountListener = null;
  mocks.connect.mockResolvedValue(undefined);
  mocks.signOut.mockResolvedValue(undefined);
  mocks.changeUser.mockResolvedValue(undefined);
  mocks.login.mockResolvedValue(undefined);
  mocks.logout.mockResolvedValue(undefined);
  mocks.loadTokens.mockResolvedValue(undefined);
  mocks.refetchStatus.mockResolvedValue({ data: undefined });
  mocks.query = {
    data: undefined,
    loading: false,
    error: undefined,
    refetch: (...args: unknown[]) => mocks.refetchStatus(...args),
  };
  element = document.createElement("div");
  root = createRoot(element);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

it("derives the user address, status and initial balances from the authenticated wallet", async () => {
  mocks.isAuthenticated = true;
  mocks.authenticatedWalletAddress = "wallet-a";
  mocks.query.data = {
    kyc_member: [
      {
        user: {
          address: "wallet-a",
          orderbook_order_events: [{ counter: "1" }],
        },
      },
    ],
  };

  await render();

  expect(context).toMatchObject({
    userAddress: "wallet-a",
    isKyced: true,
    hasOrders: true,
    isLoading: false,
  });
  expect(mocks.loadTokens).toHaveBeenCalledWith({
    userAddress: "wallet-a",
    tokensMetadata: {},
    isUsingLoader: false,
  });
});

it("resets user state when authentication is removed", async () => {
  mocks.isAuthenticated = true;
  mocks.authenticatedWalletAddress = "wallet-a";
  await render();
  expect(context.userAddress).toBe("wallet-a");

  mocks.isAuthenticated = false;
  mocks.authenticatedWalletAddress = null;
  await rerender();

  expect(context).toMatchObject({
    userAddress: null,
    isKyced: false,
    hasOrders: false,
    userTokensBalances: {},
  });
});

it("refreshes account status for the authenticated address", async () => {
  mocks.isAuthenticated = true;
  mocks.authenticatedWalletAddress = "wallet-a";
  mocks.refetchStatus.mockResolvedValue({
    data: {
      kyc_member: [
        {
          user: {
            address: "wallet-a",
            orderbook_order_events: [],
          },
        },
      ],
    },
  });
  await render();

  await act(async () => context.refetchUserAccountStatus());

  expect(mocks.refetchStatus).toHaveBeenCalledWith({ address: "wallet-a" });
  expect(context).toMatchObject({ isKyced: true, hasOrders: false });
});

it("connects or changes account before authenticating", async () => {
  await render();

  await act(async () => context.connect());
  await act(async () => context.changeUser());

  expect(mocks.connect).toHaveBeenCalledOnce();
  expect(mocks.changeUser).toHaveBeenCalledOnce();
  expect(mocks.login).toHaveBeenCalledTimes(2);
});

it("signs out the wallet before logging out", async () => {
  await render();

  await act(async () => context.signOut());

  expect(mocks.signOut).toHaveBeenCalledOnce();
  expect(mocks.logout).toHaveBeenCalledOnce();
  expect(mocks.signOut.mock.invocationCallOrder[0]).toBeLessThan(
    mocks.logout.mock.invocationCallOrder[0]
  );
});

it("signs out when auth expires or an unauthenticated wallet remains connected", async () => {
  await render();

  await act(async () => {
    window.dispatchEvent(new Event("rwa-auth-expired"));
  });
  expect(mocks.signOut).toHaveBeenCalledOnce();

  await act(async () => mocks.accountListener?.({ address: "wallet-a" }));
  expect(mocks.signOut).toHaveBeenCalledTimes(2);
});

it("logs out if the active wallet differs from the authenticated wallet", async () => {
  mocks.isAuthenticated = true;
  mocks.authenticatedWalletAddress = "wallet-a";
  await render();

  await act(async () => mocks.accountListener?.({ address: "wallet-b" }));

  expect(mocks.logout).toHaveBeenCalledOnce();
});

it("does not attach wallet listeners outside the browser", async () => {
  mocks.appIsWeb = false;
  await render();

  expect(mocks.accountListener).toBeNull();
});
