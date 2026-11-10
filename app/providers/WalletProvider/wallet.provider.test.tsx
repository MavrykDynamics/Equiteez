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

  const dynamicClient = {
    auth: { authenticatedUser: null as { email: string } | null },
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
    dynamicSession,
    dynamicEnabled: true,
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
  logoutDynamic: mocks.logoutDynamic,
  sendEmailOtp: vi.fn(async () => "sent"),
  resendEmailOtp: vi.fn(async () => undefined),
  verifyEmailOtp: mocks.verifyEmailOtp,
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
  mocks.dynamicClient.auth.authenticatedUser = null;
  mocks.openDynamicSession.mockReset();
  mocks.openDynamicSession.mockImplementation(async () =>
    mocks.dynamicClient.auth.authenticatedUser ? mocks.dynamicSession : null
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
      chainId: "NetXJMfAoC7pZSW",
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
    mocks.dynamicClient.auth.authenticatedUser = { email: "a@b.co" };
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
      mocks.dynamicClient.auth.authenticatedUser = { email: "a@b.co" };
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

  it("signs auth payloads with the Dynamic session", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.auth.authenticatedUser = { email: "a@b.co" };
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
    mocks.dynamicClient.auth.authenticatedUser = { email: "a@b.co" };
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
    mocks.dynamicClient.auth.authenticatedUser = { email: "a@b.co" };
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
    mocks.dynamicClient.auth.authenticatedUser = { email: "a@b.co" };
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

  it("clears the wallet locally even when the remote logout fails", async () => {
    window.localStorage.setItem(STORAGE_KEY, "dynamic");
    mocks.dynamicClient.auth.authenticatedUser = { email: "a@b.co" };
    mocks.logoutDynamic.mockResolvedValueOnce(new Error("network") as never);
    await renderProvider();

    await act(async () => {
      await wallet.disconnect();
    });

    expect(wallet.identity).toBeNull();
    expect(wallet.phase).toBe("disconnected");
  });
});
