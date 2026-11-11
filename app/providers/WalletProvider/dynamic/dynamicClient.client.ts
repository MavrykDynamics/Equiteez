/**
 * Dynamic embedded wallet: SDK loading, email OTP, wallet selection/creation
 * and the single digest-signing transport. Browser-only.
 *
 * Every function takes the client explicitly, so the provider owns the
 * lifecycle and tests can pass a fake. See docs/dynamic-wallet.md §3 and §15.
 */
import {
  base58SignatureToSig64,
  bytesToHex,
  deriveMavrykKeys,
  DIGEST_LENGTH,
  InvalidKeyMaterialError,
  type MavrykKeys,
  verifyDigestSignature,
} from "~/lib/mavryk/keys";

import {
  getDynamicEnvironmentId,
  isDynamicAutoCreateEnabled,
} from "./dynamic.config";
import {
  DynamicIdentityChangedError,
  DynamicInitError,
  DynamicNotAuthenticatedError,
  DynamicNotConfiguredError,
  DynamicWalletNotFoundError,
  LocalSignatureVerificationError,
  MultipleDynamicWalletsError,
} from "./dynamic.errors";
import type { DynamicClient, DynamicWallet } from "./dynamicSdk.client";
import {
  getSavedDynamicWalletId,
  saveDynamicWalletId,
} from "./dynamicWalletStorage";

export type { DynamicClient, DynamicWallet };

/** The selected wallet, frozen: signing checks the live wallet against it. */
export type DynamicWalletIdentity = MavrykKeys & {
  walletId: string;
  /** Solana-style base58 key – internal only, never shown as an address */
  solAddress: string;
};

// The SDK does not always report a failed start (e.g. an origin missing from
// the allowlist): give up after this and say the service is unavailable
const SDK_READY_TIMEOUT_MS = 12_000;
// How long to wait for a restored session's wallet list before deciding the
// wallet is missing. An empty list while restoring is not "no wallet".
const WALLETS_RESTORE_TIMEOUT_MS = 5_000;
// With auto-create on, Dynamic creates the wallet right after sign-up; wait
// this long for it before asking the user to try again
const AUTO_CREATED_WALLET_TIMEOUT_MS = 30_000;
const CREATE_WALLET_LOCK = "equiteez:dynamic-create-wallet";
// Dynamic's chain id for the embedded ed25519 wallet
const SOL_CHAIN = "SOL";
// Connector keys of Dynamic's embedded wallets (current WaaS and legacy);
// anything else is an external wallet such as Phantom
const EMBEDDED_WALLET_KEY = /^(dynamicwaas|turnkey)/i;

// ---------------------------------------------------------------------------
// SDK loading
// ---------------------------------------------------------------------------

let clientPromise: Promise<DynamicClient> | null = null;

/**
 * One client per page: StrictMode double effects and remounts get the same
 * instance and iframe. A failed load can be retried.
 */
export function loadDynamicClient(): Promise<DynamicClient> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new DynamicInitError("Email wallets are only available in the browser.")
    );
  }

  const environmentId = getDynamicEnvironmentId();

  if (!environmentId) {
    return Promise.reject(new DynamicNotConfiguredError());
  }

  clientPromise ??= import("./dynamicSdk.client")
    .then(({ createDynamicClient }) => createDynamicClient(environmentId))
    .catch((error: unknown) => {
      clientPromise = null;
      throw new DynamicInitError(undefined, error);
    });

  return clientPromise;
}

export async function waitForDynamicReady(
  client: DynamicClient,
  timeoutMs = SDK_READY_TIMEOUT_MS
) {
  if (client.sdk.error) throw new DynamicInitError(undefined, client.sdk.error);
  if (client.sdk.loaded) return;

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      client.sdk.off("error", onError);
    };
    const onError = (error: Error | null) => {
      if (!error) return;
      cleanup();
      reject(new DynamicInitError(undefined, error));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(
        new DynamicInitError(
          "Email wallet service did not respond. Check your connection and try again."
        )
      );
    }, timeoutMs);

    client.sdk.on("error", onError);
    client.sdk.waitForReady().then(
      () => {
        cleanup();
        resolve();
      },
      (error: unknown) => {
        cleanup();
        reject(new DynamicInitError(undefined, error));
      }
    );
  });
}

// ---------------------------------------------------------------------------
// Email OTP
// ---------------------------------------------------------------------------

/**
 * Sends a code to `email`. Signing in with a different email ends the current
 * Dynamic session first: otherwise verifyOTP would link the new email to the
 * signed-in user instead of switching users.
 */
export async function sendEmailOtp(
  client: DynamicClient,
  email: string
): Promise<"sent" | "already-authenticated"> {
  const normalizedEmail = email.trim().toLowerCase();
  const currentEmail = client.auth.authenticatedUser?.email?.toLowerCase();

  if (client.auth.authenticatedUser) {
    if (currentEmail === normalizedEmail) return "already-authenticated";
    await client.auth.logout();
  }

  await client.auth.email.sendOTP(normalizedEmail);
  return "sent";
}

export async function verifyEmailOtp(client: DynamicClient, code: string) {
  await client.auth.email.verifyOTP(code.trim());
}

export async function resendEmailOtp(client: DynamicClient) {
  await client.auth.email.resendOTP();
}

/** Ends the Dynamic session. Never throws: local cleanup must always run. */
export async function logoutDynamic(
  client: DynamicClient
): Promise<unknown | null> {
  try {
    await client.auth.logout();
    return null;
  } catch (error) {
    return error;
  }
}

// ---------------------------------------------------------------------------
// Wallet selection and creation
// ---------------------------------------------------------------------------

export function getEmbeddedSolWallets(client: DynamicClient): DynamicWallet[] {
  return client.wallets.userWallets.filter(
    (wallet) =>
      wallet.chain === SOL_CHAIN && EMBEDDED_WALLET_KEY.test(wallet.key)
  );
}

function getDynamicUserId(client: DynamicClient): string {
  const user = client.auth.authenticatedUser;
  const userId = user?.userId ?? user?.sessionId;

  if (!userId) throw new DynamicNotAuthenticatedError();
  return userId;
}

/** Resolves once the embedded SOL wallets are known, or after the timeout. */
function waitForEmbeddedSolWallets(
  client: DynamicClient,
  timeoutMs: number,
  // false while Dynamic may still be creating the wallet: "none yet" is then
  // not an answer
  stopWhenMissing = true
): Promise<DynamicWallet[]> {
  const current = getEmbeddedSolWallets(client);

  if (current.length > 0) return Promise.resolve(current);

  return new Promise((resolve) => {
    let isDone = false;
    const finish = () => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timer);
      client.wallets.off("userWalletsChanged", onWalletsChanged);
      resolve(getEmbeddedSolWallets(client));
    };
    const onWalletsChanged = () => {
      if (getEmbeddedSolWallets(client).length > 0) finish();
    };
    const timer = setTimeout(finish, timeoutMs);

    client.wallets.on("userWalletsChanged", onWalletsChanged);

    if (!stopWhenMissing) return;

    // Dynamic answering "no embedded wallet" ends the wait early
    client.wallets.embedded.getWallet().then(
      (wallet) => {
        if (!wallet) finish();
      },
      () => undefined
    );
  });
}

/**
 * The embedded SOL wallet of the signed-in Dynamic user, or null when the
 * user has none. Never picks one of several wallets on its own.
 */
export async function resolveDynamicWallet(
  client: DynamicClient,
  timeoutMs = WALLETS_RESTORE_TIMEOUT_MS,
  stopWhenMissing = true
): Promise<DynamicWallet | null> {
  const userId = getDynamicUserId(client);
  const wallets = await waitForEmbeddedSolWallets(
    client,
    timeoutMs,
    stopWhenMissing
  );
  const savedWalletId = getSavedDynamicWalletId(userId);
  const savedWallet = savedWalletId
    ? wallets.find((wallet) => wallet.id === savedWalletId)
    : undefined;

  if (savedWallet) return savedWallet;
  if (wallets.length > 1) {
    throw new MultipleDynamicWalletsError(
      wallets.map((wallet) => ({
        walletId: wallet.id,
        address: deriveMavrykKeys(wallet.address).address,
      }))
    );
  }
  if (wallets.length === 0) return null;

  saveDynamicWalletId(userId, wallets[0].id);
  return wallets[0];
}

/** Selects one of several wallets explicitly (after MultipleDynamicWalletsError). */
export function selectDynamicWallet(client: DynamicClient, walletId: string) {
  const wallet = getEmbeddedSolWallets(client).find(
    (candidate) => candidate.id === walletId
  );

  if (!wallet) throw new DynamicWalletNotFoundError();
  saveDynamicWalletId(getDynamicUserId(client), wallet.id);
  return wallet;
}

/** Runs `task` under a lock shared by this app's tabs, where supported. */
function withCrossTabLock<T>(name: string, task: () => Promise<T>) {
  const locks =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { locks?: LockManager }).locks
      : undefined;

  return locks?.request ? locks.request(name, task) : task();
}

let ensureWalletPromise: Promise<DynamicWallet> | null = null;

/**
 * Returns the user's embedded SOL wallet, creating it only when Dynamic
 * confirms it is missing. Single-flight within the page and locked across
 * tabs; after a lost create response the list is re-read rather than
 * creating a second key.
 */
export function ensureDynamicWallet(
  client: DynamicClient,
  { autoCreate = isDynamicAutoCreateEnabled() }: { autoCreate?: boolean } = {}
): Promise<DynamicWallet> {
  ensureWalletPromise ??= withCrossTabLock(CREATE_WALLET_LOCK, async () => {
    if (autoCreate) {
      // Dynamic creates the wallet on sign-up. Creating one here as well
      // would make a second key with another mv1: only wait for it.
      const autoCreated = await resolveDynamicWallet(
        client,
        AUTO_CREATED_WALLET_TIMEOUT_MS,
        false
      );

      if (!autoCreated) {
        throw new DynamicWalletNotFoundError(
          "Your email wallet is still being set up. Please try again in a moment."
        );
      }

      return autoCreated;
    }

    const existing = await resolveDynamicWallet(client);

    if (existing) return existing;

    await client.wallets.embedded.createWallet({ chain: "Sol" });

    // The new wallet arrives through userWallets; trust that over the
    // create response shape
    const created = await resolveDynamicWallet(client);

    if (!created) throw new DynamicWalletNotFoundError();
    return created;
  }).finally(() => {
    ensureWalletPromise = null;
  });

  return ensureWalletPromise;
}

export function toDynamicWalletIdentity(
  wallet: DynamicWallet
): DynamicWalletIdentity {
  return {
    walletId: wallet.id,
    solAddress: wallet.address,
    ...deriveMavrykKeys(wallet.address),
  };
}

// ---------------------------------------------------------------------------
// Signing
// ---------------------------------------------------------------------------

type SignDigestParams = {
  client: DynamicClient;
  identity: DynamicWalletIdentity;
  digest: Uint8Array;
  /** True once the app moved on (sign-out, account switch) */
  isStale?: () => boolean;
};

/**
 * Signs a 32-byte digest with the selected wallet and returns the raw
 * 64-byte ed25519 signature, verified locally against the digest and the
 * wallet's key. Callers build the digest (packed payload or 03 || operation);
 * this never hashes again.
 */
export async function signDigest32({
  client,
  identity,
  digest,
  isStale,
}: SignDigestParams): Promise<Uint8Array> {
  if (digest.length !== DIGEST_LENGTH) {
    throw new InvalidKeyMaterialError(
      `Digest must be ${DIGEST_LENGTH} bytes, got ${digest.length}`
    );
  }

  const getSelectedWallet = () => {
    const wallet = client.wallets.userWallets.find(
      (candidate) => candidate.id === identity.walletId
    );

    if (!wallet || wallet.address !== identity.solAddress || isStale?.()) {
      throw new DynamicIdentityChangedError();
    }

    return wallet;
  };

  const { signedMessage } = await client.wallets.signMessage({
    wallet: getSelectedWallet(),
    message: bytesToHex(digest),
  });

  getSelectedWallet();

  const sig64 = base58SignatureToSig64(signedMessage);

  if (!verifyDigestSignature(sig64, digest, identity.pk32)) {
    throw new LocalSignatureVerificationError();
  }

  return sig64;
}
