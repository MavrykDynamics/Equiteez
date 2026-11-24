// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WalletContextValue } from "./wallet.types";

const mocks = vi.hoisted(() => {
  type Account = {
    address: string;
    publicKey: string;
    network?: { type: string };
  } | null;

  const beacon = {
    account: null as Account,
    listener: null as ((account: Account) => void) | null,
    toolkit: { kind: "beacon-toolkit" },
    signed: { address: "", publicKey: "", signature: "edsigBeacon" },
  };

  const dapp = {
    listenToActiveAccount: vi.fn(async (listener: (a: Account) => void) => {
      beacon.listener = listener;
      listener(beacon.account);
    }),
    connectAccount: vi.fn(async () => undefined),
    getDAppClient: () => ({ getActiveAccount: async () => beacon.account }),
    tezos: vi.fn(() => beacon.toolkit),
    signMichelinePayload: vi.fn(async () => beacon.signed),
    disconnectWallet: vi.fn(async () => {
      beacon.account = null;
      beacon.listener?.(null);
    }),
  };

  const logoutListeners = new Set<(reason: string | null) => void>();
  const dynamicClient = {
    user: null as { email: string } | null,
    onLogout: vi.fn((listener: (reason: string | null) => void) => {
      logoutListeners.add(listener);
      return () => {
        logoutListeners.delete(listener);
      };
    }),
    /** The SDK logging out by itself, e.g. at session expiry */
    emitLogout: (reason: string | null) => {
      dynamicClient.user = null;
      logoutListeners.forEach((listener) => listener(reason));
    },
  };
  const dynamicSession = {
    client: dynamicClient,
    wallet: {
      walletId: "dyn-wallet",
      address: "mv1Dynamic",
      publicKey: "edpkDynamic",
    },
    toolkit: { kind: "dynamic-toolkit" },
  };

  return {
    beacon,
    dapp,
    dynamicClient,
    logoutListeners,
    dynamicSession,
    dynamicEnabled: true,
    isTabOutdated: false,
    isKeyStale: false,
    reloadOutdatedTab: vi.fn(),
    markDynamicKeyFresh: vi.fn(),
    passDynamicSecondFactor: vi.fn(async () => undefined),
    openDynamicSession: vi.fn(),
    logoutDynamic: vi.fn(async () => null),
    verifyEmailOtp: vi.fn(async () => undefined),
    signDynamicAuthPayload: vi.fn(async () => ({
      publicKey: "edpkDynamic",
      signature: "edsigDynamic",
      walletProvider: "dynamic",
    })),
  };
});

vi.mock("./WalletCore.client", () => ({
  dappClient: () => mocks.dapp,
  getRpcNode: () => "https://basenet.rpc.mavryk.network",
}));
vi.mock("./dynamic/dynamic.config", () => ({
  isDynamicWalletEnabled: () => mocks.dynamicEnabled,
}));
vi.mock("./dynamic/dynamicClient.client", () => ({
  loadDynamicClient: async () => mocks.dynamicClient,
  waitForDynamicReady: async () => undefined,
  hasLiveDynamicSession: (client: typeof mocks.dynamicClient) => !!client.user,
  logoutDynamic: mocks.logoutDynamic,
  sendEmailOtp: vi.fn(async () => "sent"),
  resendEmailOtp: vi.fn(async () => undefined),
  verifyEmailOtp: mocks.verifyEmailOtp,
  waitForAuthenticatedUser: async () => undefined,
  passDynamicSecondFactor: mocks.passDynamicSecondFactor,
}));
vi.mock("./dynamic/dynamicTabSync", () => ({
  isDynamicTabOutdated: () => mocks.isTabOutdated,
  isDynamicKeyStale: () => mocks.isKeyStale,
  markDynamicKeyFresh: mocks.markDynamicKeyFresh,
  reloadOutdatedTab: mocks.reloadOutdatedTab,
  doesLogoutReplaceSharedKey: (reason: string | null) =>
    reason !== "keychain-session-key-mismatch",
}));
vi.mock("./dynamic/dynamicSession.client", () => ({
  openDynamicSession: mocks.openDynamicSession,
  signDynamicAuthPayload: mocks.signDynamicAuthPayload,
}));
vi.mock("~/services/direct/reconcile", () => ({
  reconcileAttempts: vi.fn(async () => []),
}));

import { WalletProvider, useWalletContext } from "./wallet.provider";

const BEACON_ACCOUNT = {
  address: "mv1Beacon",
  publicKey: "edpkBeacon",
  network: { type: "basenet" },
};
const STORAGE_KEY = "equiteez:wallet-provider";

let container: HTMLDivElement;
let root: Root;
let wallet: WalletContextValue;

function Probe() {
  wallet = useWalletContext();
  return null;
}

async function renderProvider() {
  await act(async () => {
    root.render(
      <WalletProvider>
        <Probe />
      </WalletProvider>
    );
  });
  // Let the restore effect settle
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  window.localStorage.clear();
  mocks.beacon.account = null;
  mocks.beacon.listener = null;
  mocks.beacon.signed = {
    ...BEACON_ACCOUNT,
    signature: "edsigBeacon",
  };
  mocks.dynamicEnabled = true;
  mocks.isTabOutdated = false;
  mocks.isKeyStale = false;
  mocks.dynamicClient.user = null;
  mocks.logoutListeners.clear();
  mocks.openDynamicSession.mockReset();
  mocks.openDynamicSession.mockImplementation(async () =>
    mocks.dynamicClient.user ? mocks.dynamicSession : null
  );
  vi.clearAllMocks();
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("WalletProvider: Mavryk Wallet", () => {
  it("restores the active Beacon account as before", async () => {
    mocks.beacon.account = BEACON_ACCOUNT;
    await renderProvider();

    expect(wallet.isLoading).toBe(false);
    expect(wallet.phase).toBe("wallet-ready");
    expect(wallet.identity).toMatchObject({
      provider: "mavryk_extension",
      address: "mv1Beacon",
      publicKey: "edpkBeacon",
      chainId: "NetXmtMsNf69w1w",
    });
    expect(wallet.getToolkit()).toBe(mocks.beacon.toolkit);
    // Extension wallets review fees themselves
    expect(wallet.directExecution?.options.checkNativeBudget).toBe(false);
  });

  it("is disconnected without an account", async () => {
    await renderProvider();

    expect(wallet.phase).toBe("disconnected");
    expect(wallet.identity).toBeNull();
    expect(wallet.getToolkit()).toBeNull();
    expect(wallet.directExecution).toBeUndefined();
  });

  it("says another tab took the wallet when Beacon's shared account is cleared", async () => {
    mocks.beacon.account = BEACON_ACCOUNT;
    await renderProvider();

    await act(async () => {
      mocks.beacon.listener?.(null);
    });

    expect(wallet.identity).toBeNull();
    expect(wallet.noWalletReason).toBe("other-tab");
  });

  it("starts a new epoch when the account changes in the extension", async () => {
    mocks.beacon.account = BEACON_ACCOUNT;
    await renderProvider();
    const firstEpoch = wallet.identity!.epoch;

    await act(async () => {
      mocks.beacon.listener?.({ address: "mv1Other", publicKey: "edpkOther" });
    });

    expect(wallet.identity?.address).toBe("mv1Other");
    expect(wallet.identity!.epoch).toBeGreaterThan(firstEpoch);
  });

  it("tracks the network the extension is set to", async () => {
    mocks.beacon.account = BEACON_ACCOUNT;
    await renderProvider();
    const firstEpoch = wallet.identity!.epoch;

    expect(wallet.identity?.walletNetwork).toBe("basenet");

    await act(async () => {
      mocks.beacon.listener?.({
        ...BEACON_ACCOUNT,
        network: { type: "mainnet" },
      });
    });
    expect(wallet.identity?.walletNetwork).toBe("mainnet");
    expect(wallet.identity!.epoch).toBeGreaterThan(firstEpoch);
  });

  it("has the account right after connect, before the Beacon event", async () => {
    await renderProvider();
    mocks.beacon.account = BEACON_ACCOUNT;

    await act(async () => {
      await wallet.connectMavrykWallet();
      // What login() reads right after connect
      expect(wallet.getIdentity()?.address).toBe("mv1Beacon");
    });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("mavryk_extension");
  });

  it("refuses a signature from another account than the connected one", async () => {
    mocks.beacon.account = BEACON_ACCOUNT;
    await renderProvider();

    await expect(wallet.signAuthPayload("05aa")).resolves.toEqual({
      publicKey: "edpkBeacon",
      signature: "edsigBeacon",
      walletProvider: "mavryk_extension",
    });

    mocks.beacon.signed = {
      address: "mv1Other",
      publicKey: "edpkOther",
      signature: "edsigOther",
    };
    await expect(wallet.signAuthPayload("05aa")).rejects.toMatchObject({
      name: "WalletChangedError",
    });
  });
});

describe("WalletProvider: email wallet (Dynamic)", () => {
  it("restores a live Dynamic session and ignores Beacon", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    mocks.beacon.account = BEACON_ACCOUNT;
    await renderProvider();

    expect(mocks.openDynamicSession).toHaveBeenCalledWith(
      mocks.dynamicClient,
      { mode: "restore" },
      expect.anything()
    );
    expect(wallet.identity).toMatchObject({
      provider: "dynamic",
      providerWalletId: "dyn-wallet",
      address: "mv1Dynamic",
    });
    expect(wallet.getToolkit()).toBe(mocks.dynamicSession.toolkit);
    expect(wallet.directExecution?.options.checkNativeBudget).toBe(true);

    await act(async () => {
      mocks.beacon.listener?.({ address: "mv1Other", publicKey: "edpkOther" });
    });
    expect(wallet.identity?.provider).toBe("dynamic");
  });

  it("signs out when the Dynamic session ends while the tab is open", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    await renderProvider();
    expect(wallet.identity?.provider).toBe("dynamic");

    await act(async () => {
      mocks.dynamicClient.emitLogout("token-expired");
    });

    expect(wallet.identity).toBeNull();
    expect(wallet.phase).toBe("disconnected");
    expect(wallet.getToolkit()).toBeNull();
    // The SDK has already ended its session: no second logout
    expect(mocks.logoutDynamic).not.toHaveBeenCalled();
    expect(mocks.logoutListeners.size).toBe(0);
  });

  it("stops listening for Dynamic's logout after Sign out", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    await renderProvider();

    await act(async () => {
      await wallet.disconnect();
    });

    expect(mocks.logoutListeners.size).toBe(0);
  });

  it("says the session ended when the email wallet's session is gone on load", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    await renderProvider();

    expect(wallet.identity).toBeNull();
    expect(wallet.noWalletReason).toBe("signed-out");
  });

  it("cannot tell when a live email wallet session does not reopen on load", async () => {
    // E.g. the wallet needs unlocking or a second factor here
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    mocks.openDynamicSession.mockImplementationOnce(async () => null);
    await renderProvider();

    expect(wallet.identity).toBeNull();
    expect(wallet.noWalletReason).toBe("unknown");
  });

  it("cannot tell when the email wallet's restore fails", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    mocks.openDynamicSession.mockRejectedValueOnce(new Error("timeout"));
    await renderProvider();

    expect(wallet.noWalletReason).toBe("unknown");
  });

  it("leaves the shared state to the tab that took over the email wallet's key", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    await renderProvider();

    await act(async () => {
      mocks.dynamicClient.emitLogout("keychain-session-key-mismatch");
    });

    expect(wallet.identity).toBeNull();
    expect(wallet.noWalletReason).toBe("other-tab");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dynamic");
  });

  it("says the session ended when Dynamic signs out at expiry", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    await renderProvider();

    await act(async () => {
      mocks.dynamicClient.emitLogout("token-expired");
    });

    expect(wallet.noWalletReason).toBe("signed-out");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("reloads when another tab signs in during a sign-in step", async () => {
    await renderProvider();
    mocks.dynamicClient.user = { email: "a@b.co" };
    mocks.openDynamicSession.mockImplementationOnce(async () => {
      mocks.isTabOutdated = true;
      throw new Error("Forbidden");
    });

    await act(async () => {
      await expect(
        wallet.dynamic!.passSecondFactor({
          kind: "authenticator",
          code: "123456",
        })
      ).rejects.toMatchObject({ name: "DynamicTabOutdatedError" });
    });
    expect(mocks.reloadOutdatedTab).toHaveBeenCalled();
  });

  it("does not fall back to a leftover Beacon account when Dynamic cannot be restored", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.beacon.account = BEACON_ACCOUNT;
    await renderProvider();

    expect(wallet.phase).toBe("disconnected");
    expect(wallet.identity).toBeNull();
  });

  it("returns to Mavryk Wallet when email wallets are switched off", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicEnabled = false;
    mocks.beacon.account = BEACON_ACCOUNT;
    await renderProvider();

    expect(mocks.openDynamicSession).not.toHaveBeenCalled();
    expect(wallet.identity?.provider).toBe("mavryk_extension");
    expect(wallet.dynamic).toBeNull();
  });

  it("signs in with a code, replacing a connected Mavryk Wallet", async () => {
    mocks.beacon.account = BEACON_ACCOUNT;
    await renderProvider();

    await act(async () => {
      expect(await wallet.dynamic!.start()).toBe("needs-email");
      mocks.dynamicClient.user = { email: "a@b.co" };
      await wallet.dynamic!.verifyOtp("123456");
    });

    expect(mocks.verifyEmailOtp).toHaveBeenCalledWith(
      mocks.dynamicClient,
      "123456"
    );
    expect(mocks.openDynamicSession).toHaveBeenCalledWith(
      mocks.dynamicClient,
      { mode: "ensure" },
      expect.anything()
    );
    expect(mocks.dapp.disconnectWallet).toHaveBeenCalled();
    expect(wallet.identity?.provider).toBe("dynamic");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dynamic");
  });

  it("reloads instead of signing in when another tab signed in", async () => {
    await renderProvider();
    mocks.isTabOutdated = true;

    await expect(wallet.dynamic!.start()).rejects.toMatchObject({
      name: "DynamicTabOutdatedError",
    });
    // Reloading picks up the other tab's session
    expect(mocks.reloadOutdatedTab).toHaveBeenCalled();
    expect(mocks.openDynamicSession).not.toHaveBeenCalled();
  });

  it("gets a fresh key before a new sign-in when another tab replaced it", async () => {
    await renderProvider();
    // Another tab signed out: this tab still "has" the session it killed
    mocks.dynamicClient.user = { email: "a@b.co" };
    mocks.isKeyStale = true;
    mocks.logoutDynamic.mockImplementationOnce(async () => {
      mocks.dynamicClient.user = null;
      return null;
    });

    await act(async () => {
      expect(await wallet.dynamic!.start()).toBe("needs-email");
    });

    expect(mocks.logoutDynamic).toHaveBeenCalledWith(mocks.dynamicClient);
    expect(mocks.markDynamicKeyFresh).toHaveBeenCalled();
    expect(mocks.openDynamicSession).not.toHaveBeenCalled();
  });

  it("keeps the key when no other tab replaced it", async () => {
    await renderProvider();

    await act(async () => {
      await wallet.dynamic!.sendOtp("a@b.co");
    });

    expect(mocks.logoutDynamic).not.toHaveBeenCalled();
  });

  it("reports a sign-in that Dynamic ended midway instead of its bare error", async () => {
    await renderProvider();
    mocks.dynamicClient.user = { email: "a@b.co" };
    // Another tab replaced the key: the SDK signs out and the step fails
    mocks.openDynamicSession.mockImplementationOnce(async () => {
      mocks.dynamicClient.user = null;
      throw Object.assign(new Error("Forbidden"), { name: "WalletApiError" });
    });

    await act(async () => {
      await expect(
        wallet.dynamic!.passSecondFactor({
          kind: "authenticator",
          code: "123456",
        })
      ).rejects.toMatchObject({ name: "DynamicSignInInterruptedError" });
    });
    expect(wallet.identity).toBeNull();
  });

  it("passes on a failed step's own error while the session is intact", async () => {
    await renderProvider();
    mocks.dynamicClient.user = { email: "a@b.co" };
    mocks.passDynamicSecondFactor.mockRejectedValueOnce(
      Object.assign(new Error("Wrong code"), { name: "DynamicWrongCodeError" })
    );

    await expect(
      wallet.dynamic!.passSecondFactor({ kind: "authenticator", code: "1" })
    ).rejects.toMatchObject({ name: "DynamicWrongCodeError" });
  });

  it("signs auth payloads with the Dynamic session", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    await renderProvider();

    await expect(wallet.signAuthPayload("05aa")).resolves.toMatchObject({
      walletProvider: "dynamic",
    });
    expect(mocks.signDynamicAuthPayload).toHaveBeenCalledWith(
      mocks.dynamicSession,
      "05aa",
      expect.any(Function)
    );
    expect(mocks.dapp.signMichelinePayload).not.toHaveBeenCalled();
  });

  it("switches accounts without ending the Dynamic session, signs out fully otherwise", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    await renderProvider();
    const epoch = wallet.identity!.epoch;

    await act(async () => {
      await wallet.disconnect({ keepProviderSession: true });
    });
    expect(wallet.identity).toBeNull();
    expect(wallet.getToolkit()).toBeNull();
    expect(mocks.logoutDynamic).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    await act(async () => {
      await wallet.dynamic!.start();
    });
    expect(wallet.identity!.epoch).toBeGreaterThan(epoch);

    await act(async () => {
      await wallet.disconnect();
    });
    expect(mocks.logoutDynamic).toHaveBeenCalledWith(mocks.dynamicClient);
  });

  it("keeps the connected wallet usable when another connect attempt fails", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    await renderProvider();
    const before = wallet.identity;

    mocks.openDynamicSession.mockRejectedValueOnce(
      Object.assign(new Error("several wallets"), {
        name: "MultipleDynamicWalletsError",
      })
    );
    await act(async () => {
      await expect(wallet.dynamic!.selectWallet("other")).rejects.toThrow(
        "several wallets"
      );
    });

    expect(wallet.identity).toBe(before);
    expect(wallet.phase).toBe("wallet-ready");

    // Signing still works: the session is not considered stale
    await wallet.signAuthPayload("05aa");
    const [, , isStale] = mocks.signDynamicAuthPayload.mock.calls.at(
      -1
    ) as unknown as [unknown, unknown, () => boolean];
    expect(isStale()).toBe(false);
  });

  it("drops a pending connect when the user signs out meanwhile", async () => {
    await renderProvider();
    mocks.dynamicClient.user = { email: "a@b.co" };
    let finishOpen!: (session: unknown) => void;
    mocks.openDynamicSession.mockImplementationOnce(
      () => new Promise((resolve) => (finishOpen = resolve))
    );

    let pending!: Promise<unknown>;
    await act(async () => {
      pending = wallet.dynamic!.start().catch((error: Error) => error);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await act(async () => {
      await wallet.disconnect();
      finishOpen(mocks.dynamicSession);
      await pending;
    });

    expect(wallet.identity).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("signs out at once while Dynamic's logout is still running, and connects only after it", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    await renderProvider();

    let finishLogout!: () => void;
    mocks.logoutDynamic.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishLogout = () => resolve(null);
        })
    );

    await act(async () => {
      await wallet.disconnect();
    });
    expect(wallet.identity).toBeNull();
    expect(wallet.phase).toBe("disconnected");

    const calls = mocks.openDynamicSession.mock.calls.length;
    let started = false;
    let starting!: Promise<unknown>;
    act(() => {
      starting = wallet.dynamic!.start().then(() => {
        started = true;
      });
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(started).toBe(false);
    expect(mocks.openDynamicSession.mock.calls.length).toBe(calls);

    await act(async () => {
      finishLogout();
      await starting;
    });
    expect(started).toBe(true);
  });

  it("leaves the shared wallet state to the tab that signed in elsewhere", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    await renderProvider();
    // The other tab chose Mavryk Wallet and owns its active account
    window.localStorage.setItem(STORAGE_KEY, "mavryk_extension");

    await act(async () => {
      await wallet.disconnect({
        keepProviderSession: true,
        keepSharedState: true,
      });
    });

    expect(wallet.identity).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("mavryk_extension");
    expect(mocks.dapp.disconnectWallet).not.toHaveBeenCalled();
    expect(mocks.logoutDynamic).not.toHaveBeenCalled();
  });

  it("clears the wallet locally even when the remote logout fails", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.user = { email: "a@b.co" };
    mocks.logoutDynamic.mockResolvedValueOnce(new Error("network") as never);
    await renderProvider();

    await act(async () => {
      await wallet.disconnect();
    });

    expect(wallet.identity).toBeNull();
    expect(wallet.phase).toBe("disconnected");
  });
});
