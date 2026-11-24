/**
 * One wallet interface for Mavryk Wallet (Beacon) and Dynamic email wallets
 * (docs/dynamic-wallet.md §4, DYN-FE-02).
 *
 * - One active wallet at a time; switching means disconnect + connect.
 * - Every connect, disconnect or account change starts a new epoch. Signing
 *   and async continuations check it, so late results of an old account are
 *   dropped.
 * - Contract actions get a toolkit that signs with the active wallet and
 *   attempt tracking scoped to its account and network.
 */
import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AccountInfo } from "@mavrykdynamics/beacon-dapp";

import { isWalletAbortActionError } from "~/contracts/hooks/contractActionError";
import { RPC_NODE_CHAIN_IDS } from "~/consts/rpcNodes";
import { fetchGetOperationsByHash, isKnownChainId } from "~/lib/apis/tzkt/api";
import type { AttemptIdentity } from "~/services/direct/attempt.types";
import { getBrowserAttemptStore } from "~/services/direct/attemptStore";
import type { AttemptTracking } from "~/services/direct/executor";
import {
  describeError,
  type ActiveAttemptSlot,
} from "~/services/direct/guardedInjector";
import { reconcileAttempts } from "~/services/direct/reconcile";

import { dappClient, getRpcNode } from "./WalletCore.client";
import { isDynamicWalletEnabled } from "./dynamic/dynamic.config";
import {
  DynamicNotAuthenticatedError,
  DynamicSignInInterruptedError,
  DynamicTabOutdatedError,
} from "./dynamic/dynamic.errors";
import {
  loadDynamicClient,
  acknowledgeDynamicRecoveryCodes,
  addDynamicPasskey,
  backupDynamicWallet,
  changeDynamicWalletPassword,
  finishGoogleSignIn,
  getDynamicAuthenticator,
  getDynamicPasskeys,
  getDynamicRecoveryCodes,
  getGoogleDriveAccessSource,
  hasDynamicWalletPassword,
  isDynamicWalletBackedUp,
  hasLiveDynamicSession,
  logoutDynamic,
  passDynamicSecondFactor,
  removeDynamicAuthenticator,
  removeDynamicPasskey,
  revealDynamicPrivateKey,
  resendEmailOtp,
  sendEmailOtp,
  setDynamicWalletPassword,
  startDynamicAuthenticatorSetup,
  startGoogleSignIn,
  unlockDynamicWallet,
  verifyDynamicAuthenticatorSetup,
  verifyEmailOtp,
  waitForAuthenticatedUser,
  waitForDynamicReady,
  type DynamicClient,
} from "./dynamic/dynamicClient.client";
import {
  openDynamicSession,
  signDynamicAuthPayload,
  type DynamicSession,
  type WalletChoice,
} from "./dynamic/dynamicSession.client";
import {
  areDynamicKeysStale,
  isDynamicTabOutdated,
  markDynamicKeysFresh,
  reloadOutdatedTab,
} from "./dynamic/dynamicTabSync";
import {
  forgetGoogleSignIn,
  hasPendingGoogleSignIn,
} from "./dynamic/dynamicSocialReturn";
import type {
  DynamicConnectApi,
  WalletContextValue,
  WalletIdentity,
  WalletPhase,
  WalletProviderKind,
} from "./wallet.types";
import { readSavedWalletProvider, saveWalletProvider } from "./walletSelection";

export type { WalletIdentity, WalletPhase, WalletProviderKind };

const ENVIRONMENT = process.env.REACT_APP_ENV || "unknown";

type Dapp = ReturnType<typeof dappClient>;
type ConnectedAccount = Omit<
  WalletIdentity,
  "chainId" | "environment" | "epoch"
>;

/** The wallet changed while a signature was pending: drop the result. */
export class WalletChangedError extends Error {
  constructor() {
    super("Your wallet changed while signing. Please try again.");
    this.name = "WalletChangedError";
  }
}

const expectedChainId = () => RPC_NODE_CHAIN_IDS[getRpcNode()];

const toAttemptIdentity = (identity: WalletIdentity): AttemptIdentity => ({
  environment: identity.environment,
  chainId: identity.chainId,
  address: identity.address,
  provider: identity.provider,
  walletId: identity.providerWalletId,
  epoch: identity.epoch,
});

const fetchReceipt = (chainId: string, opHash: string) =>
  isKnownChainId(chainId)
    ? fetchGetOperationsByHash(chainId, opHash)
    : Promise.reject(new Error(`No indexer for chain ${chainId}`));

export const walletContext = createContext<WalletContextValue>(undefined!);

export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
  const [phase, setPhase] = useState<WalletPhase>("restoring");
  const [identity, setIdentity] = useState<WalletIdentity | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const identityRef = useRef<WalletIdentity | null>(null);
  const epochRef = useRef(0);
  // Bumped by every connect attempt and disconnect: an older pending connect
  // must not take over once it finishes
  const connectSeqRef = useRef(0);
  const dappRef = useRef<Dapp | null>(null);
  const dynamicSessionRef = useRef<DynamicSession | null>(null);
  // Stops listening for the SDK's own logout of the active Dynamic session
  const stopWatchingDynamicLogoutRef = useRef<(() => void) | null>(null);
  // Dynamic logout still running after Sign out; the next connect waits for it
  const pendingLogoutRef = useRef<Promise<void> | null>(null);
  // The wallet the user chose: Beacon events are ignored while it is Dynamic
  const chosenProviderRef = useRef<WalletProviderKind | null>(null);
  // Attempt slot of the current identity; the Dynamic injector reads it
  const slotRef = useRef<ActiveAttemptSlot>({ current: null });

  const startEpoch = useCallback(() => ++epochRef.current, []);

  const commit = useCallback(
    (
      account: ConnectedAccount | null,
      epoch: number,
      slot: ActiveAttemptSlot = { current: null }
    ) => {
      const next = account
        ? {
            ...account,
            chainId: expectedChainId(),
            environment: ENVIRONMENT,
            epoch,
          }
        : null;

      identityRef.current = next;
      slotRef.current = slot;
      setIdentity(next);
      setPhase(next ? "wallet-ready" : "disconnected");
    },
    []
  );

  // --- Mavryk Wallet (Beacon) ----------------------------------------------

  const onBeaconAccount = useCallback(
    (account: AccountInfo | null) => {
      if (chosenProviderRef.current === "dynamic") return;

      const current = identityRef.current;

      if (!account?.address || !account.publicKey) {
        if (current?.provider === "mavryk_extension") {
          commit(null, startEpoch());
        }
        return;
      }

      const walletNetwork = account.network?.type;

      if (
        current?.provider === "mavryk_extension" &&
        current.address === account.address &&
        current.publicKey === account.publicKey &&
        current.walletNetwork === walletNetwork
      ) {
        return;
      }

      commit(
        {
          provider: "mavryk_extension",
          providerWalletId: account.address,
          address: account.address,
          publicKey: account.publicKey,
          walletNetwork,
        },
        startEpoch()
      );
    },
    [commit, startEpoch]
  );

  // --- Sign out ------------------------------------------------------------

  const disconnect = useCallback<WalletContextValue["disconnect"]>(
    async ({ keepProviderSession = false, keepSharedState = false } = {}) => {
      const current = identityRef.current;
      const session = dynamicSessionRef.current;

      connectSeqRef.current += 1;
      stopWatchingDynamicLogoutRef.current?.();
      stopWatchingDynamicLogoutRef.current = null;
      commit(null, startEpoch());
      dynamicSessionRef.current = null;
      chosenProviderRef.current = null;
      if (keepSharedState) return;
      saveWalletProvider(null);

      // Local state is cleared above even if a remote logout fails
      if (current?.provider !== "dynamic") {
        try {
          await dappRef.current?.disconnectWallet();
        } catch (disconnectError) {
          console.log("disconnectWallet error:", disconnectError);
        }
      }

      // Sign out does not wait for Dynamic's own logout (its iframe can be
      // slow): the app is signed out already. A new connect waits for it, so
      // it never finds the old session and skips the code.
      if (session && !keepProviderSession) {
        const pending = logoutDynamic(session.client).then((logoutError) => {
          // Name and message only: an SDK error may carry request details
          if (logoutError) {
            console.warn("Dynamic logout failed:", describeError(logoutError));
          }
          if (pendingLogoutRef.current === pending) {
            pendingLogoutRef.current = null;
          }
        });

        pendingLogoutRef.current = pending;
      }
    },
    [commit, startEpoch]
  );

  // --- Dynamic -------------------------------------------------------------

  /**
   * Opens the Dynamic session and makes it the active wallet. The epoch
   * changes only when it succeeds: a failed or superseded attempt leaves the
   * current wallet untouched and usable.
   */
  const establishDynamic = useCallback(
    async (choice: WalletChoice, client?: DynamicClient) => {
      const attempt = ++connectSeqRef.current;
      // Assigned on commit; until then the new session's signer is stale
      let sessionEpoch = -1;
      const dynamicClient = client ?? (await loadDynamicClient());
      const slot: ActiveAttemptSlot = { current: null };
      const session = await openDynamicSession(dynamicClient, choice, {
        rpcUrl: getRpcNode(),
        expectedChainId: expectedChainId(),
        store: getBrowserAttemptStore(),
        slot,
        isStale: () => epochRef.current !== sessionEpoch,
      });

      // Superseded by a newer connect/disconnect, or nothing to restore
      if (connectSeqRef.current !== attempt || !session) return false;

      sessionEpoch = startEpoch();
      dynamicSessionRef.current = session;
      // The SDK signs out by itself while the tab is open (session expiry, a
      // revoked device): the wallet can no longer sign, so the app signs out
      // too. The Dynamic session is already gone, nothing to log out there.
      stopWatchingDynamicLogoutRef.current?.();
      stopWatchingDynamicLogoutRef.current = session.client.onLogout(
        (reason) => {
          if (dynamicSessionRef.current !== session) return;
          console.warn("Dynamic signed out:", reason ?? "unknown reason");
          void disconnect({ keepProviderSession: true });
        }
      );
      chosenProviderRef.current = "dynamic";
      saveWalletProvider("dynamic");
      commit(
        {
          provider: "dynamic",
          providerWalletId: session.wallet.walletId,
          address: session.wallet.address,
          publicKey: session.wallet.publicKey,
          email: session.client.user?.email ?? undefined,
        },
        sessionEpoch,
        slot
      );

      return true;
    },
    [commit, disconnect, startEpoch]
  );

  /** Runs a connect step, keeping the previous phase if it fails. */
  const connecting = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T> => {
      setPhase("connecting");

      try {
        return await task();
      } finally {
        setPhase(identityRef.current ? "wallet-ready" : "disconnected");
      }
    },
    []
  );

  // --- Restore on load -----------------------------------------------------

  useEffect(
    () => () => {
      stopWatchingDynamicLogoutRef.current?.();
      stopWatchingDynamicLogoutRef.current = null;
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    const dapp = dappClient();
    const saved = readSavedWalletProvider();

    dappRef.current = dapp;
    // Email wallets switched off for this environment: back to Mavryk Wallet
    chosenProviderRef.current =
      saved === "dynamic" && !isDynamicWalletEnabled() ? null : saved;

    (async () => {
      // The user chose the email wallet last time: if it cannot be restored
      // they stay signed out rather than silently getting a leftover Mavryk
      // Wallet account. The choice changes only on an explicit connect or
      // sign-out.
      // Back from Google: the sign-in modal finishes it and opens the wallet
      if (
        saved === "dynamic" &&
        isDynamicWalletEnabled() &&
        !hasPendingGoogleSignIn()
      ) {
        try {
          // Restore only: a missing wallet is created in the connect flow
          await establishDynamic({ mode: "restore" });
        } catch (restoreError) {
          if (!cancelled) setError(restoreError as Error);
        }
      }

      try {
        await dapp.listenToActiveAccount((account) => {
          if (!cancelled) onBeaconAccount(account);
        });
      } catch (listenError) {
        console.log(listenError);
      }

      if (!cancelled && !identityRef.current) setPhase("disconnected");
    })();

    return () => {
      cancelled = true;
    };
  }, [establishDynamic, onBeaconAccount]);

  // --- Actions -------------------------------------------------------------

  const connectMavrykWallet = useCallback(async () => {
    if (identityRef.current?.provider === "dynamic") {
      await disconnect({ keepProviderSession: true });
    }

    chosenProviderRef.current = "mavryk_extension";
    saveWalletProvider("mavryk_extension");

    await connecting(async () => {
      const dapp = dappRef.current;

      await dapp?.connectAccount();
      // login() runs right after connect: do not wait for the Beacon event
      onBeaconAccount((await dapp?.getDAppClient().getActiveAccount()) ?? null);
    });
  }, [connecting, disconnect, onBeaconAccount]);

  const dynamic = useMemo<DynamicConnectApi | null>(() => {
    if (!isDynamicWalletEnabled()) return null;

    const readyClient = async () => {
      // Another tab signed in: this tab's SDK still has the old session and
      // key. Reloading picks up the live session, so the user lands signed in.
      if (isDynamicTabOutdated()) {
        reloadOutdatedTab();
        throw new DynamicTabOutdatedError();
      }
      await pendingLogoutRef.current;
      const client = await loadDynamicClient();
      await waitForDynamicReady(client);
      return client;
    };

    /**
     * Before a new sign-in: if another tab replaced the shared signing key,
     * signing out here makes the SDK create a fresh one (and drops a session
     * that no longer works), so the sign-in is not refused midway.
     */
    const refreshStaleKeys = async (client: DynamicClient) => {
      if (!areDynamicKeysStale()) return;

      const logoutError = await logoutDynamic(client);

      if (logoutError) {
        console.warn("Dynamic logout failed:", describeError(logoutError));
      }
      markDynamicKeysFresh();
    };

    /**
     * Runs a sign-in step. When Dynamic ended the session during the step
     * (another tab replaced its key), its error is usually a bare
     * "Forbidden": say what happened instead.
     */
    const signInStep = async <T,>(
      step: (client: DynamicClient) => Promise<T>
    ) => {
      const client = await readyClient();
      const hadUser = Boolean(client.user);

      try {
        return await step(client);
      } catch (error) {
        if (isDynamicTabOutdated()) throw new DynamicTabOutdatedError(error);
        if (hadUser && !client.user) {
          throw new DynamicSignInInterruptedError(error);
        }
        throw error;
      }
    };

    /** The signed-in email wallet's session */
    const currentDynamicSession = () => {
      const session = dynamicSessionRef.current;

      if (!session) throw new DynamicNotAuthenticatedError();

      return session;
    };
    const currentDynamicClient = () => currentDynamicSession().client;

    const establishOrThrow = async (choice: WalletChoice) => {
      const client = await readyClient();

      if (identityRef.current?.provider === "mavryk_extension") {
        await disconnect();
      }

      const connected = await connecting(() =>
        establishDynamic(choice, client)
      );

      if (!connected) throw new Error("Your email wallet could not be opened.");
    };

    return {
      start: () =>
        signInStep(async (client) => {
          await refreshStaleKeys(client);
          if (!hasLiveDynamicSession(client)) return "needs-email" as const;

          await establishOrThrow({ mode: "ensure" });
          return "connected" as const;
        }),
      sendOtp: async (email) => {
        const client = await readyClient();

        await refreshStaleKeys(client);
        return sendEmailOtp(client, email);
      },
      resendOtp: async () => resendEmailOtp(await readyClient()),
      verifyOtp: (code, onAccepted) =>
        signInStep(async (client) => {
          await verifyEmailOtp(client, code);
          onAccepted?.();
          await waitForAuthenticatedUser(client);
          await establishOrThrow({ mode: "ensure" });
        }),
      selectWallet: (walletId) =>
        signInStep(() => establishOrThrow({ mode: "select", walletId })),
      signInWithGoogle: async () => {
        const client = await readyClient();

        await refreshStaleKeys(client);
        return startGoogleSignIn(client);
      },
      hasPendingGoogleSignIn,
      finishGoogleSignIn: async () => {
        // First: if the SDK fails to load, the note must not keep the tab
        // from restoring sessions and reopening this step on every load
        forgetGoogleSignIn();
        await signInStep(async (client) => {
          await finishGoogleSignIn(client);
          await waitForAuthenticatedUser(client);
          await establishOrThrow({ mode: "ensure" });
        });
      },
      passSecondFactor: (factor) =>
        signInStep(async (client) => {
          await passDynamicSecondFactor(client, factor);
          await establishOrThrow({ mode: "ensure" });
        }),
      unlockWallet: (walletId, password) =>
        signInStep(async (client) => {
          await unlockDynamicWallet(client, walletId, password);
          await establishOrThrow({ mode: "select", walletId });
        }),
      revealPrivateKey: async (displayContainer, password) => {
        const session = dynamicSessionRef.current;

        if (!session) throw new DynamicNotAuthenticatedError();

        await revealDynamicPrivateKey(
          session.client,
          session.wallet.walletId,
          displayContainer,
          password
        );
      },
      hasWalletPassword: async () =>
        hasDynamicWalletPassword(currentDynamicClient()),
      setWalletPassword: async (password) => {
        const session = currentDynamicSession();

        await setDynamicWalletPassword(
          session.client,
          session.wallet.walletId,
          password
        );
      },
      changeWalletPassword: async (currentPassword, newPassword) => {
        const session = currentDynamicSession();

        await changeDynamicWalletPassword(
          session.client,
          session.wallet.walletId,
          currentPassword,
          newPassword
        );
      },
      isWalletBackedUp: () => {
        const session = dynamicSessionRef.current;

        return session
          ? isDynamicWalletBackedUp(session.client, session.wallet.walletId)
          : false;
      },
      getGoogleDriveAccessSource: async () =>
        getGoogleDriveAccessSource(currentDynamicClient()),
      backupToGoogleDrive: async (options) => {
        const session = currentDynamicSession();

        await backupDynamicWallet(
          session.client,
          session.wallet.walletId,
          options
        );
      },
      getAuthenticator: async () =>
        getDynamicAuthenticator(currentDynamicClient()),
      startAuthenticatorSetup: async () =>
        startDynamicAuthenticatorSetup(currentDynamicClient()),
      verifyAuthenticatorSetup: async (deviceId, code) =>
        verifyDynamicAuthenticatorSetup(currentDynamicClient(), deviceId, code),
      getRecoveryCodes: async () =>
        getDynamicRecoveryCodes(currentDynamicClient()),
      acknowledgeRecoveryCodes: async () =>
        acknowledgeDynamicRecoveryCodes(currentDynamicClient()),
      removeAuthenticator: async (deviceId, code) =>
        removeDynamicAuthenticator(currentDynamicClient(), deviceId, code),
      // async: a missing session rejects instead of throwing synchronously
      getPasskeys: async () => getDynamicPasskeys(currentDynamicClient()),
      addPasskey: async () => addDynamicPasskey(currentDynamicClient()),
      removePasskey: async (passkeyId) =>
        removeDynamicPasskey(currentDynamicClient(), passkeyId),
    };
  }, [connecting, disconnect, establishDynamic]);

  const getIdentity = useCallback(() => identityRef.current, []);

  const getToolkit = useCallback(() => {
    const current = identityRef.current;

    if (!current) return null;
    if (current.provider === "dynamic") {
      return dynamicSessionRef.current?.toolkit ?? null;
    }

    return dappRef.current?.tezos() ?? null;
  }, []);

  const signAuthPayload = useCallback<WalletContextValue["signAuthPayload"]>(
    async (packedHex) => {
      const current = identityRef.current;

      if (!current) throw new Error("No active account");

      const isStale = () => epochRef.current !== current.epoch;

      if (current.provider === "dynamic") {
        const session = dynamicSessionRef.current;

        if (!session) throw new Error("No active account");
        return signDynamicAuthPayload(session, packedHex, isStale);
      }

      const dapp = dappRef.current;

      if (!dapp) throw new Error("No active account");

      const signed = await dapp.signMichelinePayload(packedHex);

      if (signed.address !== current.address || isStale()) {
        throw new WalletChangedError();
      }

      return {
        publicKey: signed.publicKey,
        signature: signed.signature,
        walletProvider: "mavryk_extension",
      };
    },
    []
  );

  // --- Direct execution ----------------------------------------------------

  const reconcile = useCallback(async () => {
    const current = identityRef.current;

    if (!current) return;

    await reconcileAttempts({
      scope: current,
      store: getBrowserAttemptStore(),
      fetchOperationsByHash: fetchReceipt,
    });
  }, []);

  // Resolve attempts left by a reload or a lost response when an account
  // becomes active
  useEffect(() => {
    if (!identity) return;
    reconcile().catch((reconcileError) =>
      console.warn(
        "Could not reconcile transactions:",
        describeError(reconcileError)
      )
    );
  }, [identity, reconcile]);

  const directExecution = useMemo(() => {
    if (!identity) return undefined;

    const tracking: AttemptTracking = {
      identity: toAttemptIdentity(identity),
      store: getBrowserAttemptStore(),
      slot: slotRef.current,
      isUserRejection: isWalletAbortActionError,
      reconcile,
    };

    return {
      // Embedded wallets show no fee review of their own
      options: { checkNativeBudget: identity.provider === "dynamic" },
      tracking,
    };
  }, [identity, reconcile]);

  const value = useMemo<WalletContextValue>(
    () => ({
      phase,
      isLoading: phase === "restoring",
      error,
      identity,
      getIdentity,
      connectMavrykWallet,
      disconnect,
      getToolkit,
      signAuthPayload,
      dynamic,
      directExecution,
    }),
    [
      phase,
      error,
      identity,
      getIdentity,
      connectMavrykWallet,
      disconnect,
      getToolkit,
      signAuthPayload,
      dynamic,
      directExecution,
    ]
  );

  return (
    <walletContext.Provider value={value}>{children}</walletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(walletContext);

  if (!context) {
    throw new Error("walletContext should be used within WalletProvider");
  }

  return context;
};
