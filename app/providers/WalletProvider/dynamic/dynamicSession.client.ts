/**
 * Turns a signed-in Dynamic user into a ready Mavryk wallet: selected
 * embedded wallet, toolkit with the Dynamic signer and the guarded injector,
 * and auth-payload signing (docs/dynamic-wallet.md §3.3, §5, DYN-FE-02/03).
 */
import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { verifySignature } from "@mavrykdynamics/taquito-utils";

import { packedDigest, sig64ToEdsig } from "~/lib/mavryk/keys";
import type { AttemptStore } from "~/services/direct/attemptStore";
import {
  attachGuardedInjector,
  type ActiveAttemptSlot,
} from "~/services/direct/guardedInjector";

import { LocalSignatureVerificationError } from "./dynamic.errors";
import {
  ensureDynamicWallet,
  resolveDynamicWallet,
  selectDynamicWallet,
  signDigest32,
  toDynamicWalletIdentity,
  waitForDynamicReady,
  type DynamicClient,
  type DynamicWalletIdentity,
} from "./dynamicClient.client";
import { createDynamicToolkit } from "./dynamicToolkit.client";

export type DynamicSession = {
  client: DynamicClient;
  wallet: DynamicWalletIdentity;
  toolkit: MavrykToolkit;
};

type SessionContext = {
  rpcUrl: string;
  expectedChainId: string;
  store: AttemptStore;
  slot: ActiveAttemptSlot;
  /** True once the app moved on from this session */
  isStale: () => boolean;
};

export type WalletChoice =
  /** Use the wallet the user already has; never create one */
  | { mode: "restore" }
  /** Use the existing wallet or create it if Dynamic confirms none */
  | { mode: "ensure" }
  | { mode: "select"; walletId: string };

async function pickWallet(client: DynamicClient, choice: WalletChoice) {
  switch (choice.mode) {
    case "restore":
      return resolveDynamicWallet(client);
    case "ensure":
      return ensureDynamicWallet(client);
    case "select":
      return selectDynamicWallet(client, choice.walletId);
  }
}

/**
 * The ready session for the signed-in Dynamic user, or null when there is no
 * session or (when restoring) no wallet yet.
 */
export async function openDynamicSession(
  client: DynamicClient,
  choice: WalletChoice,
  context: SessionContext
): Promise<DynamicSession | null> {
  await waitForDynamicReady(client);

  if (!client.auth.authenticatedUser) return null;

  const selected = await pickWallet(client, choice);

  if (!selected) return null;

  const wallet = toDynamicWalletIdentity(selected);
  const toolkit = await createDynamicToolkit({
    client,
    identity: wallet,
    rpcUrl: context.rpcUrl,
    expectedChainId: context.expectedChainId,
    isStale: context.isStale,
  });

  attachGuardedInjector(toolkit, {
    store: context.store,
    slot: context.slot,
    assertCurrent: () => {
      if (context.isStale()) {
        throw new Error("Your wallet changed. Nothing was sent.");
      }
    },
  });

  return { client, wallet, toolkit };
}

/**
 * Signs complete PACK bytes (e.g. the RWA login challenge) and checks the
 * result independently before it is used: taquito's verifySignature hashes
 * the packed bytes itself.
 */
export async function signDynamicAuthPayload(
  session: DynamicSession,
  packedHex: string,
  isStale: () => boolean
) {
  const sig64 = await signDigest32({
    client: session.client,
    identity: session.wallet,
    digest: packedDigest(packedHex),
    isStale,
  });
  const signature = sig64ToEdsig(sig64);

  if (!verifySignature(packedHex, session.wallet.publicKey, signature)) {
    throw new LocalSignatureVerificationError();
  }

  return {
    publicKey: session.wallet.publicKey,
    signature,
    walletProvider: "dynamic" as const,
  };
}
