import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ed25519 } from "@noble/curves/ed25519.js";
import { InMemorySigner } from "@mavrykdynamics/taquito-signer";
import { b58cencode, Prefix, prefix } from "@mavrykdynamics/taquito-utils";
import bs58 from "bs58";

import { decodeHex, operationDigest } from "~/lib/mavryk/keys";
import {
  addDynamicPasskey,
  assertDynamicSecondFactorPassed,
  assertDynamicWalletUnlocked,
  backupDynamicWallet,
  changeDynamicWalletPassword,
  ensureDynamicWallet,
  finishGoogleSignIn,
  getDynamicAuthenticator,
  getDynamicRecoveryCodes,
  passDynamicSecondFactor,
  removeDynamicAuthenticator,
  startDynamicAuthenticatorSetup,
  verifyDynamicAuthenticatorSetup,
  getGoogleDriveAccessSource,
  isDynamicWalletBackedUp,
  getEmbeddedSolWallets,
  hasLiveDynamicSession,
  logoutDynamic,
  removeDynamicPasskey,
  resolveDynamicWallet,
  revealDynamicPrivateKey,
  selectDynamicWallet,
  sendEmailOtp,
  setDynamicWalletPassword,
  signDigest32,
  startGoogleSignIn,
  toDynamicWalletIdentity,
  unlockDynamicWallet,
  verifyDynamicIdentity,
  waitForAuthenticatedUser,
  waitForDynamicReady,
  type DynamicClient,
  type DynamicWallet,
} from "./dynamicClient.client";
import {
  DynamicIdentityChangedError,
  DynamicInitError,
  DynamicPasswordAlreadySetError,
  DynamicSecondFactorRequiredError,
  DynamicSessionExpiredError,
  DynamicWalletLockedError,
  DynamicWrongCodeError,
  DynamicWrongPasswordError,
  GoogleSignInError,
  IdentityCheckCancelledError,
  IdentityCheckUnavailableError,
  LocalSignatureVerificationError,
  MultipleDynamicWalletsError,
} from "./dynamic.errors";
import { hasPendingGoogleSignIn } from "./dynamicSocialReturn";
import { GoogleDriveAccessError } from "./googleDriveToken";
import { getPendingIdentityCheck } from "./identityCheck";

// Public test keys: never hold funds
const SEED = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
const OTHER_SEED = new Uint8Array(32).fill(9);
const solAddressOf = (seed: Uint8Array) =>
  bs58.encode(ed25519.getPublicKey(seed));

const embeddedWallet = (
  id: string,
  seed = SEED,
  walletProviderKey = "dynamicwaas"
): DynamicWallet =>
  ({
    id,
    walletProviderKey,
    chain: "SOL",
    address: solAddressOf(seed),
    lastSelectedAt: null,
    verifiedCredentialId: `vc-${id}`,
  }) as unknown as DynamicWallet;

type Listener = () => void;
type FakeUser = {
  id: string;
  email?: string;
  verifiedCredentials?: {
    id: string;
    format: string;
    email?: string;
    walletProperties?: { keyShares?: { backupLocation: string }[] };
  }[];
};
type StepUpCheck = {
  isRequired: boolean;
  credentials: { id: string; format: string }[];
  defaultCredentialId?: string;
};

const inAnHour = () => new Date(Date.now() + 3_600_000);

/** Just enough of the Dynamic client adapter for the wallet flow. */
function createFakeClient({
  wallets = [] as DynamicWallet[],
  user = { id: "user-1", email: "a@b.co" } as FakeUser | null,
  sessionExpiresAt = inAnHour() as Date | null,
  seedsByWalletId = { w1: SEED, w2: OTHER_SEED } as Record<string, Uint8Array>,
  stepUp = { isRequired: false, credentials: [] } as StepUpCheck,
} = {}) {
  const listeners = new Map<string, Set<Listener>>();
  const emit = (name: string) =>
    listeners.get(name)?.forEach((listener) => listener());
  const on = (name: string) => (listener: Listener) => {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name)!.add(listener);
    return () => {
      listeners.get(name)?.delete(listener);
    };
  };

  const state = {
    wallets,
    user,
    sessionExpiresAt,
    initStatus: "finished",
    initError: null as Error | null,
  };

  const fake = {
    get initStatus() {
      return state.initStatus;
    },
    get initError() {
      return state.initError;
    },
    get user() {
      return state.user;
    },
    get sessionExpiresAt() {
      return state.sessionExpiresAt;
    },
    waitForInit: vi.fn(() => Promise.resolve()),
    onUserChanged: on("userChanged"),
    onWalletAccountsChanged: on("walletAccountsChanged"),
    sendEmailOtp: vi.fn<(email: string) => Promise<void>>(
      async () => undefined
    ),
    resendEmailOtp: vi.fn(async () => undefined),
    verifyEmailOtp: vi.fn<(code: string) => Promise<void>>(
      async () => undefined
    ),
    logout: vi.fn(async () => {
      state.user = null;
    }),
    getWalletAccounts: () => state.wallets,
    isEmbeddedWallet: (wallet: DynamicWallet) =>
      /^dynamicwaas/i.test(wallet.walletProviderKey),
    hasSolWalletOnAccount: vi.fn(() => false),
    createSolWallet: vi.fn(async () => {
      seedsByWalletId.created = SEED;
      state.wallets = [...state.wallets, embeddedWallet("created")];
      emit("walletAccountsChanged");
    }),
    signMessage: vi.fn(async (wallet: DynamicWallet, message: string) =>
      bs58.encode(ed25519.sign(decodeHex(message), seedsByWalletId[wallet.id]))
    ),
    signInWithGoogle: vi.fn<(redirectUrl: string) => Promise<void>>(
      async () => undefined
    ),
    completeGoogleRedirect: vi.fn<(url: URL) => Promise<boolean>>(
      async () => true
    ),
    isWalletLocked: vi.fn<(wallet: DynamicWallet) => Promise<boolean>>(
      async () => false
    ),
    unlockWallet: vi.fn<
      (wallet: DynamicWallet, password: string) => Promise<void>
    >(async () => undefined),
    hasWalletPassword: vi.fn(async () => false),
    getAuthenticators: vi.fn<
      () => Promise<
        {
          id?: string;
          verified?: boolean;
          createdAt?: Date;
          verifiedAt?: Date;
        }[]
      >
    >(async () => []),
    registerAuthenticator: vi.fn(async () => ({
      id: "totp-1",
      type: "totp",
      secret: "JBSWY3DPEHPK3PXP",
      uri: "otpauth://totp/Equiteez:a@b.co?secret=JBSWY3DPEHPK3PXP",
    })),
    verifyAuthenticator: vi.fn<
      (deviceId: string, code: string) => Promise<void>
    >(async () => undefined),
    getRecoveryCodes: vi.fn<() => Promise<string[]>>(async () => [
      "aaaa-1111",
      "bbbb-2222",
    ]),
    acknowledgeRecoveryCodes: vi.fn(async () => undefined),
    removeAuthenticator: vi.fn<
      (deviceId: string, code: string) => Promise<void>
    >(async () => undefined),
    needsSecondFactor: vi.fn(() => false),
    getSecondFactorMethods: vi.fn(async () => ({
      hasAuthenticator: false,
      hasPasskey: false,
    })),
    isInvalidCodeError: (error: unknown) =>
      error instanceof Error && error.name === "MfaInvalidOtpError",
    passSecondFactorWithCode: vi.fn<(code: string) => Promise<void>>(
      async () => undefined
    ),
    passSecondFactorWithRecoveryCode: vi.fn<(code: string) => Promise<void>>(
      async () => undefined
    ),
    passSecondFactorWithPasskey: vi.fn(async () => undefined),
    hasGoogleAccount: vi.fn(() => false),
    isGoogleDriveReady: vi.fn(async () => true),
    backupToGoogleDrive: vi.fn<
      (
        wallet: DynamicWallet,
        options: { googleDriveAccessToken?: string; password?: string }
      ) => Promise<void>
    >(async () => undefined),
    isGoogleDriveAccessError: (error: unknown) =>
      error instanceof Error &&
      error.message.includes("Google Drive access denied"),
    refreshUser: vi.fn(async () => undefined),
    setWalletPassword: vi.fn<
      (wallet: DynamicWallet, password: string) => Promise<void>
    >(async () => undefined),
    changeWalletPassword: vi.fn<
      (wallet: DynamicWallet, current: string, next: string) => Promise<void>
    >(async () => undefined),
    getPasskeys: vi.fn(async () => []),
    registerPasskey: vi.fn(async () => undefined),
    deletePasskey: vi.fn<(passkeyId: string) => Promise<void>>(
      async () => undefined
    ),
    checkStepUp: vi.fn<(scope: string) => Promise<StepUpCheck>>(
      async () => stepUp
    ),
    sendStepUpEmailCode: vi.fn(async (email: string) => ({
      email,
      verificationUUID: "otp-1",
    })),
    verifyStepUpEmailCode: vi.fn<
      (otp: unknown, code: string, scope: string) => Promise<void>
    >(async () => undefined),
    confirmWithPasskey: vi.fn<(scope: string) => Promise<void>>(
      async () => undefined
    ),
    confirmWithAuthenticator: vi.fn<
      (deviceId: string, code: string, scope: string) => Promise<void>
    >(async () => undefined),
    exportPrivateKey: vi.fn<
      (
        wallet: DynamicWallet,
        container: HTMLElement,
        password?: string
      ) => Promise<void>
    >(async () => undefined),
  };

  return {
    client: fake as unknown as DynamicClient,
    fake,
    state,
    emit,
  };
}

/** Lets the pending promise chain reach the dialog */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const memoryStorage = () => {
  const storage = new Map<string, string>();

  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  };
};

const APP_URL = "https://app.equiteez.com/portfolio?tab=wallet";

beforeEach(() => {
  vi.stubGlobal("window", {
    localStorage: memoryStorage(),
    sessionStorage: memoryStorage(),
    location: { href: APP_URL },
  });
});

afterEach(() => {
  getPendingIdentityCheck()?.cancel();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Embedded wallet discovery", () => {
  it("keeps only Dynamic's embedded SOL wallets", () => {
    const { client } = createFakeClient({
      wallets: [
        embeddedWallet("w1"),
        embeddedWallet("phantom", SEED, "phantomsol"),
        {
          ...embeddedWallet("evm"),
          chain: "EVM",
        } as unknown as DynamicWallet,
      ],
    });

    expect(getEmbeddedSolWallets(client).map((wallet) => wallet.id)).toEqual([
      "w1",
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

  it("reports no wallet for a user who has none", async () => {
    const { client } = createFakeClient();

    expect(await resolveDynamicWallet(client)).toBeNull();
  });
});

describe("ensureDynamicWallet", () => {
  it("creates one wallet when the user has none, even on double click", async () => {
    const { client, fake } = createFakeClient();

    const [first, second] = await Promise.all([
      ensureDynamicWallet(client),
      ensureDynamicWallet(client),
    ]);

    expect(first.id).toBe("created");
    expect(second.id).toBe("created");
    expect(fake.createSolWallet).toHaveBeenCalledTimes(1);
  });

  it("reuses an existing wallet", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });

    expect((await ensureDynamicWallet(client)).id).toBe("w1");
    expect(fake.createSolWallet).not.toHaveBeenCalled();
  });

  it("never creates a second wallet when the account has one the list doesn't show yet", async () => {
    const { client, fake, state, emit } = createFakeClient();
    fake.hasSolWalletOnAccount.mockReturnValue(true);

    const pending = ensureDynamicWallet(client);
    setTimeout(() => {
      state.wallets = [embeddedWallet("w1")];
      emit("walletAccountsChanged");
    }, 0);

    expect((await pending).id).toBe("w1");
    expect(fake.createSolWallet).not.toHaveBeenCalled();
  });

  it("asks to try again when that wallet never shows, still without creating one", async () => {
    vi.useFakeTimers();
    const { client, fake } = createFakeClient();
    fake.hasSolWalletOnAccount.mockReturnValue(true);

    const assertion = expect(ensureDynamicWallet(client)).rejects.toThrow(
      "still loading"
    );
    await vi.advanceTimersByTimeAsync(5_000);

    await assertion;
    expect(fake.createSolWallet).not.toHaveBeenCalled();
  });

  it("waits for a created wallet that reaches the list later", async () => {
    const { client, fake, state, emit } = createFakeClient();
    fake.createSolWallet.mockImplementationOnce(async () => {
      setTimeout(() => {
        state.wallets = [embeddedWallet("w1")];
        emit("walletAccountsChanged");
      }, 0);
    });

    expect((await ensureDynamicWallet(client)).id).toBe("w1");
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
    expect(fake.signMessage).toHaveBeenCalledWith(
      expect.objectContaining({ id: "w1" }),
      Buffer.from(digest).toString("hex")
    );
  });

  it("accepts a hex signature as well as base58", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    const digest = operationDigest(forgedHex);
    fake.signMessage.mockResolvedValueOnce(
      Buffer.from(ed25519.sign(digest, SEED)).toString("hex")
    );

    await expect(
      signDigest32({
        client,
        identity: toDynamicWalletIdentity(embeddedWallet("w1")),
        digest,
      })
    ).resolves.toHaveLength(64);
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
    expect(fake.signMessage).not.toHaveBeenCalled();
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
    const original = fake.signMessage.getMockImplementation()!;
    fake.signMessage.mockImplementationOnce(async (wallet, message) => {
      const result = await original(wallet, message);
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
    expect(fake.logout).toHaveBeenCalledTimes(1);
    expect(fake.sendEmailOtp).toHaveBeenCalledWith("other@b.co");
  });

  it("does not send a code to the email that is already signed in", async () => {
    const { client, fake } = createFakeClient();

    expect(await sendEmailOtp(client, "A@b.co")).toBe("already-authenticated");
    expect(fake.sendEmailOtp).not.toHaveBeenCalled();
  });

  it("sends a new code when the signed-in session has expired", async () => {
    const { client, fake } = createFakeClient({
      sessionExpiresAt: new Date(Date.now() - 60_000),
    });

    expect(await sendEmailOtp(client, "A@b.co")).toBe("sent");
    expect(fake.logout).toHaveBeenCalledTimes(1);
    expect(fake.sendEmailOtp).toHaveBeenCalledWith("a@b.co");
  });

  it("treats a remembered user with an expired or missing session as signed out", () => {
    expect(hasLiveDynamicSession(createFakeClient().client)).toBe(true);
    expect(
      hasLiveDynamicSession(
        createFakeClient({ sessionExpiresAt: new Date(Date.now() - 60_000) })
          .client
      )
    ).toBe(false);
    expect(
      hasLiveDynamicSession(createFakeClient({ sessionExpiresAt: null }).client)
    ).toBe(false);
    expect(hasLiveDynamicSession(createFakeClient({ user: null }).client)).toBe(
      false
    );
  });

  it("reports a failed remote logout instead of throwing", async () => {
    const { client, fake } = createFakeClient();
    fake.logout.mockRejectedValueOnce(new Error("network"));

    expect(await logoutDynamic(client)).toBeInstanceOf(Error);
  });

  it("waits for the signed-in user that arrives after the code is verified", async () => {
    const { client, state, emit } = createFakeClient({ user: null });

    const pending = waitForAuthenticatedUser(client, 5_000);
    state.user = { id: "user-1", email: "a@b.co" };
    emit("userChanged");

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

  it("gives up on a logout that never answers", async () => {
    vi.useFakeTimers();
    const { client, fake } = createFakeClient();
    fake.logout.mockImplementationOnce(() => new Promise(() => {}));

    const pending = logoutDynamic(client, 1_000);
    await vi.advanceTimersByTimeAsync(1_000);

    expect(await pending).toBeInstanceOf(Error);
  });

  it("surfaces an SDK start failure as an init error", async () => {
    const { client, state } = createFakeClient();
    state.initStatus = "failed";
    state.initError = new Error("frame blocked");

    await expect(waitForDynamicReady(client)).rejects.toBeInstanceOf(
      DynamicInitError
    );
  });

  it("gives up on an SDK that never starts", async () => {
    vi.useFakeTimers();
    const { client, fake, state } = createFakeClient();
    state.initStatus = "in-progress";
    fake.waitForInit.mockImplementationOnce(() => new Promise(() => {}));

    const assertion = expect(
      waitForDynamicReady(client, 1_000)
    ).rejects.toBeInstanceOf(DynamicInitError);
    await vi.advanceTimersByTimeAsync(1_000);

    await assertion;
  });
});

describe("Confirm it's you", () => {
  const emailUser: FakeUser = {
    id: "user-1",
    email: "a@b.co",
    verifiedCredentials: [{ id: "vc-email", format: "email", email: "a@b.co" }],
  };
  const emailCheck: StepUpCheck = {
    isRequired: true,
    credentials: [{ id: "vc-email", format: "email" }],
  };

  it("goes straight on when Dynamic needs no fresh check", async () => {
    const { client, fake } = createFakeClient();

    await verifyDynamicIdentity(client, "credential:link");

    expect(fake.checkStepUp).toHaveBeenCalledWith("credential:link");
    expect(getPendingIdentityCheck()).toBeNull();
  });

  it("emails a code first, then finishes once the code is accepted", async () => {
    const { client, fake } = createFakeClient({
      user: emailUser,
      stepUp: emailCheck,
    });

    const pending = verifyDynamicIdentity(client, "wallet:export");
    await flush();

    const check = getPendingIdentityCheck()!;
    const [method] = check.methods;

    expect(fake.sendStepUpEmailCode).toHaveBeenCalledWith(
      "a@b.co",
      "wallet:export"
    );
    expect(method).toMatchObject({ kind: "code", sentTo: "a@b.co" });

    if (method.kind !== "code") throw new Error("expected a code method");
    await method.verify(" 123456 ");
    check.done();

    await expect(pending).resolves.toBeUndefined();
    expect(fake.verifyStepUpEmailCode).toHaveBeenCalledWith(
      expect.objectContaining({ verificationUUID: "otp-1" }),
      "123456",
      "wallet:export"
    );
  });

  it("offers the passkey first when Dynamic recommends it", async () => {
    const { client, fake } = createFakeClient({
      user: emailUser,
      stepUp: {
        isRequired: true,
        credentials: [
          { id: "vc-email", format: "email" },
          { id: "vc-passkey", format: "passkey" },
        ],
        defaultCredentialId: "vc-passkey",
      },
    });

    void verifyDynamicIdentity(client, "credential:unlink").catch(
      () => undefined
    );
    await flush();

    const methods = getPendingIdentityCheck()!.methods;

    expect(methods.map((method) => method.kind)).toEqual(["passkey", "code"]);
    // The email is not sent until the user picks it
    expect(fake.sendStepUpEmailCode).not.toHaveBeenCalled();
  });

  it("rejects with a cancelled error when the user closes the dialog", async () => {
    const { client } = createFakeClient({
      user: emailUser,
      stepUp: emailCheck,
    });

    const pending = verifyDynamicIdentity(client, "credential:link");
    await flush();
    getPendingIdentityCheck()!.cancel();

    await expect(pending).rejects.toBeInstanceOf(IdentityCheckCancelledError);
  });

  it("says so when the account has no way the app can confirm with", async () => {
    const { client } = createFakeClient({
      stepUp: {
        isRequired: true,
        credentials: [{ id: "vc-google", format: "oauth" }],
      },
    });

    await expect(
      verifyDynamicIdentity(client, "wallet:export")
    ).rejects.toBeInstanceOf(IdentityCheckUnavailableError);
  });

  it("refuses an expired session before asking anything", async () => {
    const { client, fake } = createFakeClient({
      sessionExpiresAt: new Date(Date.now() - 60_000),
    });

    await expect(
      verifyDynamicIdentity(client, "wallet:export")
    ).rejects.toBeInstanceOf(DynamicSessionExpiredError);
    expect(fake.checkStepUp).not.toHaveBeenCalled();
  });
});

describe("Actions behind the check", () => {
  it("shows the Mavryk wallet's key in the container after the check", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    const container = {} as HTMLElement;

    await revealDynamicPrivateKey(client, "w1", container);

    expect(fake.checkStepUp).toHaveBeenCalledWith("wallet:export");
    expect(fake.exportPrivateKey).toHaveBeenCalledWith(
      expect.objectContaining({ id: "w1" }),
      container,
      undefined
    );
  });

  it("shows no key when the check is cancelled", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
      stepUp: {
        isRequired: true,
        credentials: [{ id: "vc-email", format: "email" }],
      },
    });

    const pending = revealDynamicPrivateKey(client, "w1", {} as HTMLElement);
    await flush();
    getPendingIdentityCheck()!.cancel();

    await expect(pending).rejects.toBeInstanceOf(IdentityCheckCancelledError);
    expect(fake.exportPrivateKey).not.toHaveBeenCalled();
  });

  it("checks for linking before adding and unlinking before removing a passkey", async () => {
    const { client, fake } = createFakeClient();

    await addDynamicPasskey(client);
    await removeDynamicPasskey(client, "pk-1");

    expect(fake.checkStepUp.mock.calls.map(([scope]) => scope)).toEqual([
      "credential:link",
      "credential:unlink",
    ]);
    expect(fake.registerPasskey).toHaveBeenCalledOnce();
    expect(fake.deletePasskey).toHaveBeenCalledWith("pk-1");
  });
});

describe("Google sign-in", () => {
  it("signs out a current user, notes the trip and returns to this page", async () => {
    const { client, fake } = createFakeClient();

    await startGoogleSignIn(client);

    expect(fake.logout).toHaveBeenCalledOnce();
    expect(fake.signInWithGoogle).toHaveBeenCalledWith(APP_URL);
    expect(hasPendingGoogleSignIn()).toBe(true);
  });

  it("forgets the trip when Google cannot be opened", async () => {
    const { client, fake } = createFakeClient({ user: null });
    fake.signInWithGoogle.mockRejectedValueOnce(new Error("network"));

    await expect(startGoogleSignIn(client)).rejects.toBeInstanceOf(
      GoogleSignInError
    );
    expect(hasPendingGoogleSignIn()).toBe(false);
  });

  it("completes the return from Google", async () => {
    const { client, fake } = createFakeClient({ user: null });
    window.location.href = `${APP_URL}&dynamicOauthState=s&dynamicOauthCode=c`;

    await finishGoogleSignIn(client);

    expect(fake.completeGoogleRedirect).toHaveBeenCalledWith(
      new URL(window.location.href)
    );
  });

  it("says the sign-in was cancelled when Google sends the user back empty-handed", async () => {
    const { client, fake } = createFakeClient({ user: null });

    await expect(finishGoogleSignIn(client)).rejects.toThrow(
      "Google sign-in was cancelled"
    );
    expect(fake.completeGoogleRedirect).not.toHaveBeenCalled();
  });

  it("refuses a return this browser did not start", async () => {
    const { client, fake } = createFakeClient({ user: null });
    window.location.href = `${APP_URL}&dynamicOauthState=s&dynamicOauthCode=c`;
    fake.completeGoogleRedirect.mockResolvedValueOnce(false);

    await expect(finishGoogleSignIn(client)).rejects.toThrow("no longer valid");
  });
});

describe("Password-protected wallet", () => {
  it("reports a locked wallet with what the unlock screen shows", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    fake.isWalletLocked.mockResolvedValueOnce(true);

    const error = await assertDynamicWalletUnlocked(
      client,
      embeddedWallet("w1")
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DynamicWalletLockedError);
    expect((error as DynamicWalletLockedError).wallet).toEqual({
      walletId: "w1",
      address: toDynamicWalletIdentity(embeddedWallet("w1")).address,
      lastUsedAt: null,
      email: "a@b.co",
    });
  });

  it("lets an unlocked wallet through", async () => {
    const { client } = createFakeClient();

    await expect(
      assertDynamicWalletUnlocked(client, embeddedWallet("w1"))
    ).resolves.toBeUndefined();
  });

  it("unlocks the wallet with the password", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });

    await unlockDynamicWallet(client, "w1", "secret-pass");

    expect(fake.unlockWallet).toHaveBeenCalledWith(
      expect.objectContaining({ id: "w1" }),
      "secret-pass"
    );
  });

  it("says when the password is wrong, and passes other failures on", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    fake.unlockWallet.mockRejectedValueOnce(
      new Error("Failed to decrypt key share")
    );

    await expect(
      unlockDynamicWallet(client, "w1", "wrong")
    ).rejects.toBeInstanceOf(DynamicWrongPasswordError);

    fake.unlockWallet.mockRejectedValueOnce(new Error("network down"));
    await expect(unlockDynamicWallet(client, "w1", "x")).rejects.toThrow(
      "network down"
    );

    // "Invalid" alone is not about the password
    for (const message of ["Invalid session", "Invalid access token"]) {
      fake.unlockWallet.mockRejectedValueOnce(new Error(message));
      await expect(
        unlockDynamicWallet(client, "w1", "x")
      ).rejects.not.toBeInstanceOf(DynamicWrongPasswordError);
    }

    fake.unlockWallet.mockRejectedValueOnce(new Error("Incorrect password"));
    await expect(unlockDynamicWallet(client, "w1", "x")).rejects.toBeInstanceOf(
      DynamicWrongPasswordError
    );
  });
});

describe("Wallet password settings", () => {
  it("sets the password on the connected wallet", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });

    await setDynamicWalletPassword(client, "w1", "long-enough");

    expect(fake.setWalletPassword).toHaveBeenCalledWith(
      expect.objectContaining({ id: "w1" }),
      "long-enough"
    );
  });

  it("says when a password is already there", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    fake.setWalletPassword.mockRejectedValueOnce(
      new Error("Wallet is already password-encrypted, use updatePassword")
    );

    await expect(
      setDynamicWalletPassword(client, "w1", "long-enough")
    ).rejects.toBeInstanceOf(DynamicPasswordAlreadySetError);
  });

  it("says when the current password is wrong", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    fake.changeWalletPassword.mockRejectedValueOnce(
      new Error("Failed to decrypt key share")
    );

    await expect(
      changeDynamicWalletPassword(client, "w1", "wrong", "new-password")
    ).rejects.toBeInstanceOf(DynamicWrongPasswordError);
  });

  it("passes the wallet password to the key export", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    const container = {} as HTMLElement;

    await revealDynamicPrivateKey(client, "w1", container, "long-enough");

    expect(fake.exportPrivateKey).toHaveBeenCalledWith(
      expect.objectContaining({ id: "w1" }),
      container,
      "long-enough"
    );
  });
});

describe("Google Drive backup", () => {
  const userWithShares = (backupLocations: string[]): FakeUser => ({
    id: "user-1",
    email: "a@b.co",
    verifiedCredentials: [
      {
        id: "vc-w1",
        format: "blockchain",
        walletProperties: {
          keyShares: backupLocations.map((backupLocation) => ({
            backupLocation,
          })),
        },
      },
    ],
  });

  it("reads the backup from the wallet's key shares", () => {
    const wallets = [embeddedWallet("w1")];

    expect(
      isDynamicWalletBackedUp(
        createFakeClient({
          wallets,
          user: userWithShares(["dynamic", "googleDrive"]),
        }).client,
        "w1"
      )
    ).toBe(true);
    expect(
      isDynamicWalletBackedUp(
        createFakeClient({ wallets, user: userWithShares(["dynamic"]) }).client,
        "w1"
      )
    ).toBe(false);
  });

  it("uses the Google sign-in's access when it covers Drive, else Google's popup", async () => {
    const { client, fake } = createFakeClient();

    expect(await getGoogleDriveAccessSource(client)).toBe("popup");

    fake.hasGoogleAccount.mockReturnValue(true);
    expect(await getGoogleDriveAccessSource(client)).toBe("stored");

    fake.isGoogleDriveReady.mockResolvedValueOnce(false);
    expect(await getGoogleDriveAccessSource(client)).toBe("popup");

    fake.isGoogleDriveReady.mockRejectedValueOnce(new Error("network"));
    expect(await getGoogleDriveAccessSource(client)).toBe("popup");
  });

  it("backs up with the token and password, then re-reads the user", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });

    await backupDynamicWallet(client, "w1", {
      googleDriveAccessToken: "drive-token",
      password: "long-enough",
    });

    expect(fake.backupToGoogleDrive).toHaveBeenCalledWith(
      expect.objectContaining({ id: "w1" }),
      { googleDriveAccessToken: "drive-token", password: "long-enough" }
    );
    expect(fake.refreshUser).toHaveBeenCalledOnce();
  });

  it("explains missing Drive access and a wrong password", async () => {
    const { client, fake } = createFakeClient({
      wallets: [embeddedWallet("w1")],
    });
    fake.backupToGoogleDrive.mockRejectedValueOnce(
      new Error("Error: Google Drive access denied (401)")
    );

    await expect(backupDynamicWallet(client, "w1", {})).rejects.toBeInstanceOf(
      GoogleDriveAccessError
    );

    fake.backupToGoogleDrive.mockRejectedValueOnce(
      new Error("Failed to decrypt key share")
    );
    await expect(
      backupDynamicWallet(client, "w1", { password: "wrong" })
    ).rejects.toBeInstanceOf(DynamicWrongPasswordError);
    expect(fake.refreshUser).not.toHaveBeenCalled();
  });
});

describe("Authenticator app", () => {
  it("reports only a turned-on authenticator", async () => {
    const { client, fake } = createFakeClient();
    const addedAt = new Date(2026, 10, 2);

    expect(await getDynamicAuthenticator(client)).toBeNull();

    fake.getAuthenticators.mockResolvedValueOnce([
      { id: "draft", verified: false },
      { id: "totp-1", verified: true, verifiedAt: addedAt },
    ]);
    expect(await getDynamicAuthenticator(client)).toEqual({
      id: "totp-1",
      addedAt,
    });
  });

  it("checks for linking before showing the QR code", async () => {
    const { client, fake } = createFakeClient();

    expect(await startDynamicAuthenticatorSetup(client)).toEqual({
      deviceId: "totp-1",
      uri: expect.stringContaining("otpauth://"),
      secret: "JBSWY3DPEHPK3PXP",
    });
    expect(fake.checkStepUp).toHaveBeenCalledWith("credential:link");
  });

  it("turns it on with the first code", async () => {
    const { client, fake } = createFakeClient();

    await verifyDynamicAuthenticatorSetup(client, "totp-1", " 123456 ");

    expect(fake.verifyAuthenticator).toHaveBeenCalledWith("totp-1", "123456");
  });

  it("hands back the recovery codes, and says when they can't be loaded", async () => {
    const { client, fake } = createFakeClient();

    expect(await getDynamicRecoveryCodes(client)).toEqual([
      "aaaa-1111",
      "bbbb-2222",
    ]);

    fake.getRecoveryCodes.mockRejectedValueOnce(new Error("network"));
    await expect(getDynamicRecoveryCodes(client)).rejects.toThrow("network");
  });

  it("says when a code is wrong, setting up or removing", async () => {
    const { client, fake } = createFakeClient();
    fake.verifyAuthenticator.mockRejectedValueOnce(
      Object.assign(new Error("Invalid code"), { name: "MfaInvalidOtpError" })
    );
    fake.removeAuthenticator.mockRejectedValueOnce(
      Object.assign(new Error("Invalid code"), { name: "MfaInvalidOtpError" })
    );

    await expect(
      verifyDynamicAuthenticatorSetup(client, "totp-1", "000000")
    ).rejects.toBeInstanceOf(DynamicWrongCodeError);
    await expect(
      removeDynamicAuthenticator(client, "totp-1", "000000")
    ).rejects.toBeInstanceOf(DynamicWrongCodeError);
  });

  it("removes it with a current code", async () => {
    const { client, fake } = createFakeClient();

    await removeDynamicAuthenticator(client, "totp-1", "123456");

    expect(fake.removeAuthenticator).toHaveBeenCalledWith("totp-1", "123456");
  });
});

describe("Second factor at sign-in", () => {
  it("asks for the user's second factors from Dynamic's MFA list", async () => {
    const { client, fake } = createFakeClient();

    await expect(
      assertDynamicSecondFactorPassed(client)
    ).resolves.toBeUndefined();

    fake.needsSecondFactor.mockReturnValue(true);
    fake.getSecondFactorMethods.mockResolvedValueOnce({
      hasAuthenticator: true,
      hasPasskey: true,
    });
    const error = await assertDynamicSecondFactorPassed(client).catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(DynamicSecondFactorRequiredError);
    expect((error as DynamicSecondFactorRequiredError).methods).toEqual({
      hasAuthenticator: true,
      hasPasskey: true,
    });
  });

  it("offers the code field when Dynamic names no second factor", async () => {
    const { client, fake } = createFakeClient();
    fake.needsSecondFactor.mockReturnValue(true);

    const error = await assertDynamicSecondFactorPassed(client).catch(
      (caught: unknown) => caught
    );

    expect((error as DynamicSecondFactorRequiredError).methods).toEqual({
      hasAuthenticator: true,
      hasPasskey: false,
    });
  });

  it("falls back to the authenticator app when the MFA list can't be read", async () => {
    const { client, fake } = createFakeClient();
    fake.needsSecondFactor.mockReturnValue(true);
    fake.getSecondFactorMethods.mockRejectedValueOnce(new Error("network"));

    const error = await assertDynamicSecondFactorPassed(client).catch(
      (caught: unknown) => caught
    );

    expect((error as DynamicSecondFactorRequiredError).methods).toEqual({
      hasAuthenticator: true,
      hasPasskey: false,
    });
  });

  it("passes it with the app, a recovery code or a passkey", async () => {
    const { client, fake } = createFakeClient();

    await passDynamicSecondFactor(client, {
      kind: "authenticator",
      code: " 123456 ",
    });
    await passDynamicSecondFactor(client, {
      kind: "recovery-code",
      code: "aaaa-1111",
    });
    await passDynamicSecondFactor(client, { kind: "passkey" });

    expect(fake.passSecondFactorWithCode).toHaveBeenCalledWith("123456");
    expect(fake.passSecondFactorWithRecoveryCode).toHaveBeenCalledWith(
      "aaaa-1111"
    );
    expect(fake.passSecondFactorWithPasskey).toHaveBeenCalledOnce();

    fake.passSecondFactorWithCode.mockRejectedValueOnce(
      Object.assign(new Error("Invalid code"), { name: "MfaInvalidOtpError" })
    );
    await expect(
      passDynamicSecondFactor(client, { kind: "authenticator", code: "000000" })
    ).rejects.toBeInstanceOf(DynamicWrongCodeError);
  });
});
