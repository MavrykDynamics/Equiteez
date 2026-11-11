import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ed25519 } from "@noble/curves/ed25519.js";
import { InMemorySigner } from "@mavrykdynamics/taquito-signer";
import { b58cencode, Prefix, prefix } from "@mavrykdynamics/taquito-utils";
import bs58 from "bs58";

import { decodeHex, operationDigest } from "~/lib/mavryk/keys";
import {
  ensureDynamicWallet,
  getEmbeddedSolWallets,
  logoutDynamic,
  resolveDynamicWallet,
  selectDynamicWallet,
  sendEmailOtp,
  signDigest32,
  toDynamicWalletIdentity,
  waitForAuthenticatedUser,
  waitForDynamicReady,
  type DynamicClient,
  type DynamicWallet,
} from "./dynamicClient.client";
import {
  DynamicIdentityChangedError,
  DynamicInitError,
  LocalSignatureVerificationError,
  MultipleDynamicWalletsError,
} from "./dynamic.errors";

// Public test keys: never hold funds
const SEED = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
const OTHER_SEED = new Uint8Array(32).fill(9);
const solAddressOf = (seed: Uint8Array) =>
  bs58.encode(ed25519.getPublicKey(seed));

const embeddedWallet = (
  id: string,
  seed = SEED,
  key = "dynamicwaas"
): DynamicWallet =>
  ({
    id,
    key,
    chain: "SOL",
    address: solAddressOf(seed),
    additionalAddresses: [],
    isAuthenticated: true,
  }) as DynamicWallet;

type Listener = (...args: unknown[]) => void;

/** Just enough of the Dynamic client for the wallet flow. */
function createFakeClient({
  wallets = [] as DynamicWallet[],
  user = { userId: "user-1", email: "a@b.co" } as {
    userId?: string;
    email?: string;
  } | null,
  embeddedWalletFromDynamic = null as DynamicWallet | null,
  seedsByWalletId = { w1: SEED, w2: OTHER_SEED } as Record<string, Uint8Array>,
} = {}) {
  const listeners = new Map<string, Set<Listener>>();
  const emit = (name: string, ...args: unknown[]) =>
    listeners.get(name)?.forEach((listener) => listener(...args));
  const on = (name: string, listener: Listener) => {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name)!.add(listener);
  };
  const off = (name: string, listener: Listener) =>
    listeners.get(name)?.delete(listener);

  const state = { wallets, user, loaded: true, error: null as Error | null };

  const client = {
    sdk: {
      get loaded() {
        return state.loaded;
      },
      get error() {
        return state.error;
      },
      on,
      off,
      waitForReady: vi.fn(() => Promise.resolve()),
    },
    auth: {
      get authenticatedUser() {
        return state.user;
      },
      on,
      off,
      logout: vi.fn(async () => {
        state.user = null;
      }),
      email: {
        sendOTP: vi.fn(async () => undefined),
        verifyOTP: vi.fn(async () => undefined),
        resendOTP: vi.fn(async () => undefined),
      },
    },
    wallets: {
      get userWallets() {
        return state.wallets;
      },
      on,
      off,
      embedded: {
        getWallet: vi.fn(async () => embeddedWalletFromDynamic),
        createWallet: vi.fn(async () => {
          const created = embeddedWallet("created");
          seedsByWalletId.created = SEED;
          state.wallets = [...state.wallets, created];
          emit("userWalletsChanged", state.wallets);
          return created;
        }),
      },
      signMessage: vi.fn(
        async ({
          wallet,
          message,
        }: {
          wallet: DynamicWallet;
          message: string;
        }) => ({
          signedMessage: bs58.encode(
            ed25519.sign(decodeHex(message), seedsByWalletId[wallet.id])
          ),
        })
      ),
    },
  };

  return {
    client: client as unknown as DynamicClient,
    fake: client,
    state,
    emit,
  };
}

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Embedded wallet discovery", () => {
  it("keeps only Dynamic's embedded SOL wallets", () => {
    const { client } = createFakeClient({
      wallets: [
        embeddedWallet("w1"),
        embeddedWallet("legacy", SEED, "turnkeyhd"),
        embeddedWallet("phantom", SEED, "phantom"),
        { ...embeddedWallet("evm"), chain: "EVM" } as DynamicWallet,
      ],
    });

    expect(getEmbeddedSolWallets(client).map((wallet) => wallet.id)).toEqual([
      "w1",
      "legacy",
    ]);
  });

  it("selects the only wallet and remembers it", async () => {
    const { client } = createFakeClient({ wallets: [embeddedWallet("w1")] });

    expect((await resolveDynamicWallet(client))?.id).toBe("w1");
  });

  it("never picks one of several wallets on its own", async () => {
    const { client } = createFakeClient({
      wallets: [embeddedWallet("w1"), embeddedWallet("w2", OTHER_SEED)],
    });

    await expect(resolveDynamicWallet(client)).rejects.toBeInstanceOf(
      MultipleDynamicWalletsError
    );

    selectDynamicWallet(client, "w2");
    expect((await resolveDynamicWallet(client))?.id).toBe("w2");
  });

  it("waits for a restoring wallet list instead of reporting it missing", async () => {
    const wallet = embeddedWallet("w1");
    const { client, state, emit } = createFakeClient({
      embeddedWalletFromDynamic: wallet,
    });

    const resolved = resolveDynamicWallet(client, 5_000);
    state.wallets = [wallet];
    emit("userWalletsChanged", state.wallets);

    expect((await resolved)?.id).toBe("w1");
  });
});

describe("ensureDynamicWallet", () => {
  it("creates one wallet when Dynamic confirms there is none, even on double click", async () => {
    const { client, fake } = createFakeClient();

    const [first, second] = await Promise.all([
      ensureDynamicWallet(client),
      ensureDynamicWallet(client),
    ]);

    expect(first.id).toBe("created");
    expect(second.id).toBe("created");
    expect(fake.wallets.embedded.createWallet).toHaveBeenCalledTimes(1);
    expect(fake.wallets.embedded.createWallet).toHaveBeenCalledWith({
      chain: "Sol",
    });
  });

  it("reuses an existing wallet", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });

    expect((await ensureDynamicWallet(client)).id).toBe("w1");
    expect(fake.wallets.embedded.createWallet).not.toHaveBeenCalled();
  });
});

describe("ensureDynamicWallet with auto-create on sign-up", () => {
  it("waits for the wallet Dynamic creates and never creates a second one", async () => {
    // Right after sign-up Dynamic reports no wallet yet, then adds it
    const { client, fake, state, emit } = createFakeClient();

    const pending = ensureDynamicWallet(client, { autoCreate: true });
    await Promise.resolve();
    state.wallets = [embeddedWallet("w1")];
    emit("userWalletsChanged", state.wallets);

    expect((await pending).id).toBe("w1");
    expect(fake.wallets.embedded.createWallet).not.toHaveBeenCalled();
  });

  it("asks to try again when the wallet does not show up, still without creating one", async () => {
    vi.useFakeTimers();
    const { client, fake } = createFakeClient();

    const pending = ensureDynamicWallet(client, { autoCreate: true });
    const assertion = expect(pending).rejects.toThrow(
      "Your email wallet is still being set up"
    );
    await vi.advanceTimersByTimeAsync(30_000);

    await assertion;
    expect(fake.wallets.embedded.createWallet).not.toHaveBeenCalled();
  });
});

describe("signDigest32", () => {
  const signer = () =>
    new InMemorySigner(b58cencode(SEED, prefix[Prefix.EDSK2]));
  const forgedHex = "ab".repeat(40);

  it("signs the digest bytes and matches InMemorySigner", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    const identity = toDynamicWalletIdentity(embeddedWallet("w1"));
    const digest = operationDigest(forgedHex);

    const sig64 = await signDigest32({ client, identity, digest });
    const reference = await signer().sign(forgedHex, new Uint8Array([3]));

    expect(identity.address).toBe(await signer().publicKeyHash());
    expect(b58cencode(sig64, prefix[Prefix.EDSIG])).toBe(reference.prefixSig);
    // The digest goes to Dynamic as hex of the 32 bytes, hashed nowhere else
    expect(fake.wallets.signMessage).toHaveBeenCalledWith(
      expect.objectContaining({ message: Buffer.from(digest).toString("hex") })
    );
  });

  it("refuses a digest that is not 32 bytes without calling the SDK", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });

    await expect(
      signDigest32({
        client,
        identity: toDynamicWalletIdentity(embeddedWallet("w1")),
        digest: new Uint8Array(31),
      })
    ).rejects.toThrow();
    expect(fake.wallets.signMessage).not.toHaveBeenCalled();
  });

  it("rejects a signature made by another key", async () => {
    const { client } = createFakeClient({
      wallets: [embeddedWallet("w1")],
      seedsByWalletId: { w1: OTHER_SEED },
    });

    await expect(
      signDigest32({
        client,
        identity: toDynamicWalletIdentity(embeddedWallet("w1")),
        digest: operationDigest(forgedHex),
      })
    ).rejects.toBeInstanceOf(LocalSignatureVerificationError);
  });

  it("drops the result when the wallet or session changed while signing", async () => {
    const { client, fake, state } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    const original = fake.wallets.signMessage.getMockImplementation()!;
    fake.wallets.signMessage.mockImplementationOnce(async (params) => {
      const result = await original(params);
      state.wallets = [];
      return result;
    });

    await expect(
      signDigest32({
        client,
        identity: toDynamicWalletIdentity(embeddedWallet("w1")),
        digest: operationDigest(forgedHex),
      })
    ).rejects.toBeInstanceOf(DynamicIdentityChangedError);

    state.wallets = [embeddedWallet("w1")];
    await expect(
      signDigest32({
        client,
        identity: toDynamicWalletIdentity(embeddedWallet("w1")),
        digest: operationDigest(forgedHex),
        isStale: () => true,
      })
    ).rejects.toBeInstanceOf(DynamicIdentityChangedError);
  });
});

describe("Session", () => {
  it("logs out before sending a code to a different email", async () => {
    const { client, fake } = createFakeClient();

    expect(await sendEmailOtp(client, "  OTHER@b.co ")).toBe("sent");
    expect(fake.auth.logout).toHaveBeenCalledTimes(1);
    expect(fake.auth.email.sendOTP).toHaveBeenCalledWith("other@b.co");
  });

  it("does not send a code to the email that is already signed in", async () => {
    const { client, fake } = createFakeClient();

    expect(await sendEmailOtp(client, "A@b.co")).toBe("already-authenticated");
    expect(fake.auth.email.sendOTP).not.toHaveBeenCalled();
  });

  it("reports a failed remote logout instead of throwing", async () => {
    const { client, fake } = createFakeClient();
    fake.auth.logout.mockRejectedValueOnce(new Error("network"));

    expect(await logoutDynamic(client)).toBeInstanceOf(Error);
  });

  it("waits for the signed-in user that arrives after the code is verified", async () => {
    const { client, state, emit } = createFakeClient({ user: null });

    const pending = waitForAuthenticatedUser(client, 5_000);
    state.user = { userId: "user-1", email: "a@b.co" };
    emit("authenticatedUserChanged", state.user);

    await expect(pending).resolves.toBeUndefined();
  });

  it("says to sign in again when the user never arrives", async () => {
    vi.useFakeTimers();
    const { client } = createFakeClient({ user: null });

    const assertion = expect(
      waitForAuthenticatedUser(client, 1_000)
    ).rejects.toThrow("Sign in with your email first.");
    await vi.advanceTimersByTimeAsync(1_000);

    await assertion;
  });

  it("surfaces an SDK load error as an init error", async () => {
    const { client, state } = createFakeClient();
    state.loaded = false;
    state.error = new Error("frame blocked");

    await expect(waitForDynamicReady(client)).rejects.toBeInstanceOf(
      DynamicInitError
    );
  });
});
