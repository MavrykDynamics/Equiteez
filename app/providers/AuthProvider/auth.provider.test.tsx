// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  AuthProvider,
  useAuthContext,
} from "./auth.provider";
import type { AuthContext } from "./auth.provider.types";

const mocks = vi.hoisted(() => ({
  tokens: {
    accessToken: null as string | null,
    refreshToken: null as string | null,
  },
  walletAddress: null as string | null,
  activeAccount: { address: "wallet-a" } as { address: string } | null,
  post: vi.fn(),
  getAuthTokens: vi.fn(),
  getLastNonce: vi.fn(),
  setLastChallenge: vi.fn(),
  setAuthTokens: vi.fn(),
  clearSession: vi.fn(),
  clearFreshQueries: vi.fn(),
  emitExpired: vi.fn(),
  emitSync: vi.fn(),
  subscribe: vi.fn(),
  signChallenge: vi.fn(),
  onSync: null as ((type: "TOKENS_UPDATED" | "LOGOUT") => void) | null,
  isWeb: true,
}));

vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({
    dapp: {
      getDAppClient: () => ({
        getActiveAccount: () => Promise.resolve(mocks.activeAccount),
      }),
    },
  }),
}));
vi.mock("~/providers/AppProvider/AppProvider", () => ({
  useAppContext: () => ({ IS_WEB: mocks.isWeb }),
}));
vi.mock("~/lib/apis/rwa/client", () => ({
  rwaApi: { post: (...args: unknown[]) => mocks.post(...args) },
}));
vi.mock("~/providers/AuthProvider/helpers/storage", () => ({
  getAuthTokensFromStorage: () => mocks.getAuthTokens(),
  getLastNonceFromStorage: () => mocks.getLastNonce(),
  setLastChallengeToStorage: (...args: unknown[]) => mocks.setLastChallenge(...args),
  setAuthTokensToStorage: (...args: unknown[]) => mocks.setAuthTokens(...args),
}));
vi.mock("~/providers/AuthProvider/helpers/utils", () => ({
  signAuthChallenge: (...args: unknown[]) => mocks.signChallenge(...args),
}));
vi.mock("~/providers/AuthProvider/helpers/auth.service", () => ({
  clearAuthSession: () => mocks.clearSession(),
}));
vi.mock("~/lib/apis/rwa/freshness", () => ({
  clearFreshQueries: () => mocks.clearFreshQueries(),
}));
vi.mock("~/providers/AuthProvider/helpers/auth.events", () => ({
  AUTH_EXPIRED_EVENT: "rwa-auth-expired",
  emitAuthExpiredEvent: () => mocks.emitExpired(),
}));
vi.mock("~/providers/AuthProvider/helpers/auth-sync.helpers", () => ({
  AUTH_LOGOUT_EVENT: "LOGOUT",
  AUTH_TOKENS_UPDATED_EVENT: "TOKENS_UPDATED",
  emitAuthSyncEvent: (...args: unknown[]) => mocks.emitSync(...args),
  subscribeToAuthSyncEvents: (callback: typeof mocks.onSync) => {
    mocks.onSync = callback;
    mocks.subscribe();
    return () => {
      mocks.onSync = null;
    };
  },
}));
vi.mock("~/providers/AuthProvider/helpers/auth.jwt", () => ({
  getAuthJwtWalletAddress: () => mocks.walletAddress,
}));

let root: Root;
let element: HTMLDivElement;
let context: AuthContext;

function Probe() {
  context = useAuthContext();
  return null;
}

async function render() {
  await act(async () => {
    root.render(createElement(AuthProvider, null, createElement(Probe)));
  });
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  Object.values(mocks).forEach((value) => {
    if (typeof value === "function" && "mockReset" in value) value.mockReset();
  });
  mocks.tokens = { accessToken: null, refreshToken: null };
  mocks.walletAddress = null;
  mocks.activeAccount = { address: "wallet-a" };
  mocks.isWeb = true;
  mocks.onSync = null;
  mocks.getAuthTokens.mockImplementation(async () => mocks.tokens);
  mocks.getLastNonce.mockResolvedValue(null);
  mocks.setLastChallenge.mockResolvedValue(undefined);
  mocks.setAuthTokens.mockResolvedValue(undefined);
  mocks.clearSession.mockResolvedValue(undefined);
  mocks.signChallenge.mockResolvedValue({
    publicKey: "public-key",
    signature: "signature",
    format: "micheline_string",
    walletProvider: "mavryk_extension",
  });
  element = document.createElement("div");
  root = createRoot(element);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

it("restores an authenticated session and its wallet address from storage", async () => {
  mocks.tokens = { accessToken: "access", refreshToken: "refresh" };
  mocks.walletAddress = "wallet-a";

  await render();

  expect(context).toMatchObject({
    isAuthenticated: true,
    authenticatedWalletAddress: "wallet-a",
    isAuthLoading: false,
  });
  expect(mocks.getAuthTokens).toHaveBeenCalledOnce();
  expect(mocks.subscribe).toHaveBeenCalledOnce();
});

it("finishes initialization without authentication when storage is empty", async () => {
  await render();

  expect(context).toMatchObject({
    isAuthenticated: false,
    authenticatedWalletAddress: null,
    isAuthLoading: false,
  });
});

it("logs in by requesting, signing and verifying an auth challenge", async () => {
  mocks.post
    .mockResolvedValueOnce({
      data: {
        challenge: "Sign me",
        nonce: "nonce-1",
        expiresAt: "2026-10-15T12:00:00Z",
      },
    })
    .mockResolvedValueOnce({
      data: { accessToken: "access", refreshToken: "refresh" },
    });
  mocks.walletAddress = "wallet-a";
  await render();

  await act(async () => context.login());

  expect(mocks.post).toHaveBeenNthCalledWith(1, "/auth/challenge", {
    walletAddress: "wallet-a",
  });
  expect(mocks.setLastChallenge).toHaveBeenCalledWith({
    challenge: "Sign me",
    nonce: "nonce-1",
    expiresAt: "2026-10-15T12:00:00Z",
  });
  expect(mocks.signChallenge).toHaveBeenCalledWith("Sign me");
  expect(mocks.post).toHaveBeenNthCalledWith(2, "/auth/verify", {
    walletAddress: "wallet-a",
    publicKey: "public-key",
    nonce: "nonce-1",
    signature: "signature",
    format: "micheline_string",
    walletProvider: "mavryk_extension",
    deviceInfo: undefined,
  });
  expect(mocks.setAuthTokens).toHaveBeenCalledWith({
    accessToken: "access",
    refreshToken: "refresh",
  });
  expect(mocks.emitSync).toHaveBeenCalledWith("TOKENS_UPDATED");
  expect(context).toMatchObject({
    isAuthenticated: true,
    authenticatedWalletAddress: "wallet-a",
    isAuthLoading: false,
  });
});

it("clears the session when login has no active wallet account", async () => {
  mocks.activeAccount = null;
  await render();

  await act(async () => context.login());

  expect(mocks.post).not.toHaveBeenCalled();
  expect(mocks.clearSession).toHaveBeenCalledOnce();
  expect(context).toMatchObject({
    isAuthenticated: false,
    authenticatedWalletAddress: null,
    isAuthLoading: false,
  });
});

it("does not attempt wallet authentication outside the browser", async () => {
  mocks.isWeb = false;
  await render();

  await act(async () => context.login());

  expect(mocks.post).not.toHaveBeenCalled();
  expect(mocks.clearSession).toHaveBeenCalledOnce();
  expect(context).toMatchObject({
    isAuthenticated: false,
    authenticatedWalletAddress: null,
    isAuthLoading: false,
  });
});

it("clears auth state and propagates a failed login", async () => {
  mocks.post.mockRejectedValueOnce(new Error("challenge unavailable"));
  await render();

  let error: unknown;
  await act(async () => {
    try {
      await context.login();
    } catch (caught) {
      error = caught;
    }
  });

  expect(error).toEqual(new Error("challenge unavailable"));
  expect(mocks.clearSession).toHaveBeenCalledOnce();
  expect(context).toMatchObject({
    isAuthenticated: false,
    authenticatedWalletAddress: null,
    isAuthLoading: false,
  });
});

it("cleans up even if logout fails, then propagates the API error", async () => {
  mocks.tokens = { accessToken: "access", refreshToken: "stored-refresh" };
  mocks.walletAddress = "wallet-a";
  mocks.post.mockRejectedValueOnce(new Error("offline"));
  await render();

  let error: unknown;
  await act(async () => {
    try {
      await context.logout();
    } catch (caught) {
      error = caught;
    }
  });

  expect(mocks.clearFreshQueries).toHaveBeenCalledOnce();
  expect(mocks.clearFreshQueries).toHaveBeenCalledOnce();
  expect(mocks.post).toHaveBeenCalledWith("/auth/logout", {
    refreshToken: "stored-refresh",
  });
  expect(mocks.clearSession).toHaveBeenCalledOnce();
  expect(mocks.emitExpired).toHaveBeenCalledOnce();
  expect(error).toEqual(new Error("offline"));
  expect(context).toMatchObject({
    isAuthenticated: false,
    authenticatedWalletAddress: null,
    isAuthLoading: false,
  });
});

it("uses an explicitly supplied refresh token when logging out", async () => {
  mocks.tokens = { accessToken: "access", refreshToken: "stored-refresh" };
  mocks.post.mockResolvedValueOnce({ data: {} });
  await render();

  await act(async () => context.logout({ refreshToken: "provided-refresh" }));

  expect(mocks.post).toHaveBeenCalledWith("/auth/logout", {
    refreshToken: "provided-refresh",
  });
  expect(mocks.clearSession).toHaveBeenCalledOnce();
  expect(mocks.emitExpired).toHaveBeenCalledOnce();
});

it("responds to auth-expiry and cross-tab logout events", async () => {
  mocks.tokens = { accessToken: "access", refreshToken: "refresh" };
  mocks.walletAddress = "wallet-a";
  await render();

  await act(async () => {
    window.dispatchEvent(new Event("rwa-auth-expired"));
  });
  expect(context.isAuthenticated).toBe(false);

  mocks.tokens = { accessToken: "new-access", refreshToken: "new-refresh" };
  mocks.walletAddress = "wallet-b";
  await act(async () => mocks.onSync?.("TOKENS_UPDATED"));
  expect(context).toMatchObject({
    isAuthenticated: true,
    authenticatedWalletAddress: "wallet-b",
  });

  mocks.tokens = { accessToken: null, refreshToken: null };
  await act(async () => mocks.onSync?.("LOGOUT"));
  expect(context.isAuthenticated).toBe(false);
  expect(mocks.emitExpired).toHaveBeenCalledOnce();
});

it("does not subscribe to browser events during server rendering", async () => {
  mocks.isWeb = false;

  await render();

  expect(mocks.subscribe).not.toHaveBeenCalled();
  window.dispatchEvent(new Event("rwa-auth-expired"));
  expect(context.isAuthenticated).toBe(false);
});
