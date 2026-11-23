/**
 * Dynamic embedded wallet: SDK loading, email OTP, wallet selection/creation,
 * the single digest-signing transport and the actions behind a fresh identity
 * check (private key export, passkeys). Browser-only.
 *
 * Every function takes the client explicitly, so the provider owns the
 * lifecycle and tests can pass a fake. See docs/dynamic-wallet.md §3 and §15.
 */
import {
  base58SignatureToSig64,
  bytesToHex,
  decodeHex,
  deriveMavrykKeys,
  DIGEST_LENGTH,
  ED25519_SIGNATURE_LENGTH,
  InvalidKeyMaterialError,
  type MavrykKeys,
  verifyDigestSignature,
} from "~/lib/mavryk/keys";

import { getDynamicEnvironmentId } from "./dynamic.config";
import {
  DynamicIdentityChangedError,
  DynamicInitError,
  DynamicNotAuthenticatedError,
  DynamicNotConfiguredError,
  DynamicSessionExpiredError,
  DynamicWalletNotFoundError,
  IdentityCheckUnavailableError,
  LocalSignatureVerificationError,
  MultipleDynamicWalletsError,
} from "./dynamic.errors";
import type {
  DynamicClient,
  DynamicWallet,
  OTPVerification,
  StepUpScope,
} from "./dynamicSdk.client";
import {
  getSavedDynamicWalletId,
  saveDynamicWalletId,
} from "./dynamicWalletStorage";
import { askToConfirmIdentity, type IdentityMethod } from "./identityCheck";

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
// How long to wait for a new wallet to reach the wallet list
const CREATED_WALLET_TIMEOUT_MS = 10_000;
// verifyOTP resolves before the signed-in user may reach the client's state:
// wait this long for it
const AUTHENTICATED_USER_TIMEOUT_MS = 10_000;
// Dynamic's logout can hang; a new sign-in waits at most this
const LOGOUT_TIMEOUT_MS = 10_000;
const CREATE_WALLET_LOCK = "equiteez:dynamic-create-wallet";
// Dynamic's chain id for the embedded ed25519 wallet
const SOL_CHAIN = "SOL";

// ---------------------------------------------------------------------------
// SDK loading
// ---------------------------------------------------------------------------

let clientPromise: Promise<DynamicClient> | null = null;

/**
 * One client per page: StrictMode double effects and remounts get the same
 * instance. A failed load can be retried.
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
  if (client.initStatus === "failed") {
    throw new DynamicInitError(undefined, client.initError);
  }
  if (client.initStatus === "finished") return;

  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      client.waitForInit(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new DynamicInitError(
                "Email wallet service did not respond. Check your connection and try again."
              )
            ),
          timeoutMs
        );
      }),
    ]);
  } catch (error) {
    if (error instanceof DynamicInitError) throw error;
    throw new DynamicInitError(undefined, error);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/**
 * True when Dynamic has a signed-in user whose session is still valid. The
 * SDK signs the user out when the session expires; the time is checked too,
 * so a page that slept past it never counts as signed in.
 */
export function hasLiveDynamicSession(client: DynamicClient): boolean {
  const expiresAt = client.sessionExpiresAt;

  return (
    Boolean(client.user) && !!expiresAt && expiresAt.getTime() > Date.now()
  );
}

/** Throws DynamicSessionExpiredError unless the session is valid. */
function assertDynamicSession(client: DynamicClient) {
  if (!hasLiveDynamicSession(client)) throw new DynamicSessionExpiredError();
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
  const currentEmail = client.user?.email?.toLowerCase();

  if (client.user) {
    if (hasLiveDynamicSession(client)) {
      if (currentEmail === normalizedEmail) return "already-authenticated";
      await client.logout();
    } else {
      // Expired: signed in only on paper. Its logout may fail; the new code
      // signs in afresh either way
      await logoutDynamic(client);
    }
  }

  await client.sendEmailOtp(normalizedEmail);
  return "sent";
}

export async function verifyEmailOtp(client: DynamicClient, code: string) {
  await client.verifyEmailOtp(code.trim());
}

/**
 * Resolves once the client knows the signed-in user. Opening the wallet
 * before that would find no session.
 */
export function waitForAuthenticatedUser(
  client: DynamicClient,
  timeoutMs = AUTHENTICATED_USER_TIMEOUT_MS
): Promise<void> {
  if (client.user) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      unsubscribe();
    };
    const unsubscribe = client.onUserChanged(() => {
      if (!client.user) return;
      cleanup();
      resolve();
    });
    const timer = setTimeout(() => {
      cleanup();
      reject(new DynamicNotAuthenticatedError());
    }, timeoutMs);
  });
}

export async function resendEmailOtp(client: DynamicClient) {
  await client.resendEmailOtp();
}

/** Ends the Dynamic session. Never throws: local cleanup must always run. */
export async function logoutDynamic(
  client: DynamicClient,
  timeoutMs = LOGOUT_TIMEOUT_MS
): Promise<unknown | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      client.logout(),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Dynamic logout timed out")),
          timeoutMs
        );
      }),
    ]);
    return null;
  } catch (error) {
    return error;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Wallet selection and creation
// ---------------------------------------------------------------------------

/** Dynamic's embedded SOL wallets; external wallets such as Phantom are not */
export function getEmbeddedSolWallets(client: DynamicClient): DynamicWallet[] {
  return client
    .getWalletAccounts()
    .filter(
      (wallet) => wallet.chain === SOL_CHAIN && client.isEmbeddedWallet(wallet)
    );
}

function getDynamicUserId(client: DynamicClient): string {
  const userId = client.user?.id;

  if (!userId) throw new DynamicNotAuthenticatedError();
  return userId;
}

/** Resolves once an embedded SOL wallet is listed, or after the timeout. */
function waitForEmbeddedSolWallets(
  client: DynamicClient,
  timeoutMs: number
): Promise<DynamicWallet[]> {
  const current = getEmbeddedSolWallets(client);

  if (current.length > 0) return Promise.resolve(current);

  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      unsubscribe();
      resolve(getEmbeddedSolWallets(client));
    };
    const unsubscribe = client.onWalletAccountsChanged(() => {
      if (getEmbeddedSolWallets(client).length > 0) finish();
    });
    const timer = setTimeout(finish, timeoutMs);
  });
}

/** Picks the saved wallet, the only one, or asks the user to choose. */
function pickDynamicWallet(
  client: DynamicClient,
  wallets: DynamicWallet[]
): DynamicWallet | null {
  const userId = getDynamicUserId(client);
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

/**
 * The embedded SOL wallet of the signed-in Dynamic user, or null when the
 * user has none. The wallet list comes with the signed-in user, so it is
 * complete once the SDK is ready. Never picks one of several wallets on its
 * own.
 */
export async function resolveDynamicWallet(
  client: DynamicClient
): Promise<DynamicWallet | null> {
  return pickDynamicWallet(client, getEmbeddedSolWallets(client));
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
 * Returns the user's embedded SOL wallet, creating it when the user has none.
 * The JavaScript SDK never creates one on its own (the dashboard's
 * auto-create applies to Dynamic's widgets), so the app does it, right after
 * sign-up. Single-flight within the page and locked across tabs, and the list
 * is re-read under the lock, so a second key with another mv1 is never made.
 */
export function ensureDynamicWallet(
  client: DynamicClient
): Promise<DynamicWallet> {
  ensureWalletPromise ??= withCrossTabLock(CREATE_WALLET_LOCK, async () => {
    const existing = await resolveDynamicWallet(client);

    if (existing) return existing;

    await client.createSolWallet();

    // The new wallet arrives through the wallet list; trust that over the
    // create call
    const created = pickDynamicWallet(
      client,
      await waitForEmbeddedSolWallets(client, CREATED_WALLET_TIMEOUT_MS)
    );

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

/** The raw 64-byte signature from Dynamic's base58 (or hex) answer */
function decodeDynamicSignature(signature: string): Uint8Array {
  const hex = signature.startsWith("0x") ? signature.slice(2) : signature;

  if (new RegExp(`^[0-9a-fA-F]{${ED25519_SIGNATURE_LENGTH * 2}}$`).test(hex)) {
    return decodeHex(hex, "Signature");
  }

  return base58SignatureToSig64(signature);
}

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
    const wallet = client
      .getWalletAccounts()
      .find((candidate) => candidate.id === identity.walletId);

    if (!wallet || wallet.address !== identity.solAddress || isStale?.()) {
      throw new DynamicIdentityChangedError();
    }

    return wallet;
  };

  const signature = await client.signMessage(
    getSelectedWallet(),
    bytesToHex(digest)
  );

  getSelectedWallet();

  const sig64 = decodeDynamicSignature(signature);

  if (!verifyDigestSignature(sig64, digest, identity.pk32)) {
    throw new LocalSignatureVerificationError();
  }

  return sig64;
}

// ---------------------------------------------------------------------------
// Identity check (step-up)
// ---------------------------------------------------------------------------

/** The ways the dialog can offer for the credentials Dynamic accepts */
function toIdentityMethods(
  client: DynamicClient,
  check: Awaited<ReturnType<DynamicClient["checkStepUp"]>>,
  scope: StepUpScope
): IdentityMethod[] {
  const credentialsById = new Map(
    (client.user?.verifiedCredentials ?? []).map((credential) => [
      credential.id,
      credential,
    ])
  );
  // Dynamic's recommendation first: the second factor, or the sign-in email
  const credentials = [...check.credentials].sort(
    (a, b) =>
      Number(b.id === check.defaultCredentialId) -
      Number(a.id === check.defaultCredentialId)
  );
  const methods: IdentityMethod[] = [];

  for (const credential of credentials) {
    switch (`${credential.format}`) {
      case "passkey":
        if (methods.some((method) => method.kind === "passkey")) break;
        methods.push({
          kind: "passkey",
          id: "passkey",
          label: "Use a passkey",
          run: () => client.confirmWithPasskey(scope),
        });
        break;

      case "totp":
        methods.push({
          kind: "code",
          id: `totp:${credential.id}`,
          label: "Use my authenticator app",
          sentTo: null,
          verify: (code) =>
            client.confirmWithAuthenticator(credential.id, code.trim(), scope),
        });
        break;

      case "email": {
        const email =
          credentialsById.get(credential.id)?.email ?? client.user?.email;

        if (!email) break;

        let sent: OTPVerification | null = null;

        methods.push({
          kind: "code",
          id: `email:${email}`,
          label: "Email me a code",
          sentTo: null,
          send: async () => {
            sent = await client.sendStepUpEmailCode(email, scope);
            return email;
          },
          verify: async (code) => {
            if (!sent) throw new Error("Ask for a code first.");
            await client.verifyStepUpEmailCode(sent, code.trim(), scope);
          },
        });
        break;
      }

      default:
        // Social accounts, SMS and external wallets are not offered yet
        break;
    }
  }

  return methods;
}

/**
 * Makes sure the user has freshly proven who they are for `scope`. Does
 * nothing when Dynamic doesn't require it (a recent check is still valid);
 * otherwise opens "Confirm it's you" with the ways Dynamic accepts. Rejects
 * with IdentityCheckCancelledError when the user closes it.
 */
export async function verifyDynamicIdentity(
  client: DynamicClient,
  scope: StepUpScope
) {
  assertDynamicSession(client);

  const check = await client.checkStepUp(scope);

  if (!check.isRequired) return;

  const methods = toIdentityMethods(client, check, scope);
  const first = methods[0];

  if (!first) throw new IdentityCheckUnavailableError();
  // A code by email as the first choice: send it before asking
  if (first.kind === "code" && first.send) first.sentTo = await first.send();

  await askToConfirmIdentity(methods);
}

/**
 * Shows the private key of `walletId` in an isolated frame Dynamic injects
 * into `displayContainer`, after "Confirm it's you". The key never reaches
 * the app. Dynamic shows it in Solana format (64-byte base58).
 */
export async function revealDynamicPrivateKey(
  client: DynamicClient,
  walletId: string,
  displayContainer: HTMLElement
): Promise<void> {
  assertDynamicSession(client);

  const wallet = getEmbeddedSolWallets(client).find(
    (candidate) => candidate.id === walletId
  );

  if (!wallet) throw new DynamicWalletNotFoundError();

  await verifyDynamicIdentity(client, "wallet:export");
  await client.exportPrivateKey(wallet, displayContainer);
}

// ---------------------------------------------------------------------------
// Passkeys
// ---------------------------------------------------------------------------

/** A passkey on the user's Dynamic account, as the Wallet page lists it. */
export type DynamicPasskey = {
  id: string;
  /** The user's alias, else the passkey manager (e.g. "iCloud Keychain") */
  name: string | null;
  createdAt: Date;
};

export async function getDynamicPasskeys(
  client: DynamicClient
): Promise<DynamicPasskey[]> {
  assertDynamicSession(client);

  const passkeys = await client.getPasskeys();

  return passkeys.map((passkey) => ({
    id: passkey.id,
    name: passkey.alias || passkey.storage?.name || null,
    createdAt: new Date(passkey.createdAt),
  }));
}

/**
 * After "Confirm it's you", runs the browser's passkey prompt (Touch ID,
 * Face ID…) and registers the passkey.
 */
export async function addDynamicPasskey(client: DynamicClient) {
  await verifyDynamicIdentity(client, "credential:link");
  await client.registerPasskey();
}

export async function removeDynamicPasskey(
  client: DynamicClient,
  passkeyId: string
) {
  await verifyDynamicIdentity(client, "credential:unlink");
  await client.deletePasskey(passkeyId);
}
