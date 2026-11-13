// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthContext } from "./auth.provider.types";
import type { WalletIdentity } from "~/providers/WalletProvider/wallet.types";

const mocks = vi.hoisted(() => ({
  identity: null as WalletIdentity | null,
  signAuthPayload: vi.fn(),
  post: vi.fn(),
  tokens: { accessToken: null, refreshToken: null } as {
    accessToken: string | null;
    refreshToken: string | null;
  },
}));

vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({
    getIdentity: () => mocks.identity,
    signAuthPayload: mocks.signAuthPayload,
  }),
}));
vi.mock("../AppProvider/AppProvider", () => ({
  useAppContext: () => ({ IS_WEB: true }),
}));
vi.mock("~/lib/apis/rwa/client", () => ({
  rwaApi: { post: mocks.post },
}));
vi.mock("~/lib/apis/rwa/freshness", () => ({ clearFreshQueries: vi.fn() }));
vi.mock("~/providers/AuthProvider/helpers/auth.jwt", () => ({
  getAuthJwtWalletAddress: (token?: string | null) =>
    token ? token.replace("jwt-for-", "") : null,
}));
vi.mock("~/providers/AuthProvider/helpers/storage", () => ({
  getAuthTokensFromStorage: async () => ({ ...mocks.tokens }),
  setAuthTokensToStorage: async (tokens: typeof mocks.tokens) => {
    mocks.tokens = { ...tokens };
  },
  setLastChallengeToStorage: async () => undefined,
  getLastNonceFromStorage: async () => null,
}));
vi.mock("~/providers/AuthProvider/helpers/auth.service", () => ({
  clearAuthSession: async () => {
    mocks.tokens = { accessToken: null, refreshToken: null };
  },
}));
vi.mock("~/providers/AuthProvider/helpers/auth-sync.helpers", () => ({
  AUTH_LOGOUT_EVENT: "LOGOUT",
  AUTH_TOKENS_UPDATED_EVENT: "TOKENS_UPDATED",
  emitAuthSyncEvent: vi.fn(),
  subscribeToAuthSyncEvents: () => () => undefined,
}));

import { AuthProvider, useAuthContext } from "./auth.provider";
import { buildAuthPayloadHex } from "./helpers/utils";

const DYNAMIC_IDENTITY: WalletIdentity = {
  provider: "dynamic",
  providerWalletId: "dyn-wallet",
  address: "mv1Dynamic",
  publicKey: "edpkDynamic",
  chainId: "NetXmtMsNf69w1w",
  environment: "dev",
  epoch: 3,
};
const CHALLENGE = "Sign in to Equiteez: nonce n-1";

let root: Root;
let auth: AuthContext;

function Probe() {
  auth = useAuthContext();
  return null;
}

async function renderAuth() {
  await act(async () => {
    root.render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
  });
}

const verifyCalls = () =>
  mocks.post.mock.calls.filter(([url]) => url === "/auth/verify");

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  mocks.identity = DYNAMIC_IDENTITY;
  mocks.tokens = { accessToken: null, refreshToken: null };
  mocks.post.mockReset();
  mocks.post.mockImplementation(async (url: string, body: unknown) => {
    if (url === "/auth/challenge") {
      return {
        data: { challenge: CHALLENGE, nonce: "n-1", expiresAt: "2026-11-10" },
      };
    }
    if (url === "/auth/verify") {
      const { walletAddress } = body as { walletAddress: string };
      return {
        data: {
          accessToken: `jwt-for-${walletAddress}`,
          refreshToken: "refresh",
        },
      };
    }
    return { data: {} };
  });
  mocks.signAuthPayload.mockReset();
  mocks.signAuthPayload.mockImplementation(async () => ({
    publicKey: "edpkDynamic",
    signature: "edsigDynamic",
    walletProvider: mocks.identity?.provider,
  }));
  root = createRoot(document.createElement("div"));
});

afterEach(() => {
  act(() => root.unmount());
});

describe("AuthProvider login", () => {
  it("signs the RWA challenge with the email wallet and verifies it", async () => {
    await renderAuth();

    await act(async () => {
      await auth.login();
    });

    expect(mocks.post).toHaveBeenCalledWith("/auth/challenge", {
      walletAddress: "mv1Dynamic",
    });
    // The double-encoded challenge, not the raw text
    expect(mocks.signAuthPayload).toHaveBeenCalledWith(
      buildAuthPayloadHex(CHALLENGE)
    );
    expect(verifyCalls()).toEqual([
      [
        "/auth/verify",
        {
          walletAddress: "mv1Dynamic",
          publicKey: "edpkDynamic",
          nonce: "n-1",
          signature: "edsigDynamic",
          format: "micheline_string",
          walletProvider: "dynamic",
          deviceInfo: undefined,
        },
      ],
    ]);
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.authenticatedWalletAddress).toBe("mv1Dynamic");
  });

  it("keeps the Mavryk Wallet request unchanged", async () => {
    mocks.identity = {
      ...DYNAMIC_IDENTITY,
      provider: "mavryk_extension",
      providerWalletId: "mv1Beacon",
      address: "mv1Beacon",
    };
    await renderAuth();

    await act(async () => {
      await auth.login();
    });

    expect(verifyCalls()[0][1]).toMatchObject({
      walletAddress: "mv1Beacon",
      format: "micheline_string",
      walletProvider: "mavryk_extension",
    });
  });

  it("does not send a signature after the wallet changed while signing", async () => {
    mocks.signAuthPayload.mockImplementation(async () => {
      mocks.identity = { ...DYNAMIC_IDENTITY, epoch: 4 };
      return {
        publicKey: "edpkDynamic",
        signature: "edsigDynamic",
        walletProvider: "dynamic",
      };
    });
    await renderAuth();

    await act(async () => {
      await expect(auth.login()).rejects.toThrow("wallet changed");
    });

    expect(verifyCalls()).toHaveLength(0);
    expect(auth.isAuthenticated).toBe(false);
  });

  it("does not send a signature that failed local verification", async () => {
    mocks.signAuthPayload.mockRejectedValue(
      Object.assign(new Error("invalid signature"), {
        name: "LocalSignatureVerificationError",
      })
    );
    await renderAuth();

    await act(async () => {
      await expect(auth.login()).rejects.toThrow("invalid signature");
    });

    expect(verifyCalls()).toHaveLength(0);
    expect(mocks.tokens.accessToken).toBeNull();
  });

  it("asks for a fresh challenge on every attempt after a failed verify", async () => {
    await renderAuth();
    mocks.post.mockImplementationOnce(async () => ({
      data: { challenge: CHALLENGE, nonce: "n-1", expiresAt: "x" },
    }));
    mocks.post.mockImplementationOnce(async () => {
      throw new Error("verify response lost");
    });

    await act(async () => {
      await expect(auth.login()).rejects.toThrow("verify response lost");
    });
    await act(async () => {
      await auth.login();
    });

    const challenges = mocks.post.mock.calls.filter(
      ([url]) => url === "/auth/challenge"
    );
    expect(challenges).toHaveLength(2);
    expect(auth.isAuthenticated).toBe(true);
  });

  it("clears the session without a connected wallet", async () => {
    mocks.identity = null;
    mocks.tokens = { accessToken: "jwt-for-mv1Old", refreshToken: "r" };
    await renderAuth();

    await act(async () => {
      await auth.login();
    });

    expect(mocks.post).not.toHaveBeenCalled();
    expect(auth.isAuthenticated).toBe(false);
    expect(mocks.tokens.accessToken).toBeNull();
  });
});

describe("AuthProvider logout", () => {
  it("clears the local session even when the server logout fails", async () => {
    mocks.tokens = { accessToken: "jwt-for-mv1Dynamic", refreshToken: "r" };
    await renderAuth();
    expect(auth.isAuthenticated).toBe(true);
    mocks.post.mockRejectedValueOnce(new Error("network"));

    await act(async () => {
      await expect(auth.logout()).rejects.toThrow("network");
    });

    expect(auth.isAuthenticated).toBe(false);
    expect(mocks.tokens.accessToken).toBeNull();
  });
});
