/**
 * Toolkit for one selected Dynamic wallet: a fresh MavrykToolkit whose signer
 * is the Dynamic wallet, never Beacon. Taquito's default wallet provider
 * forwards wallet.at/batch/transfer/pkh to this signer, so the existing
 * contract builders run unchanged with gas paid in MVRK.
 *
 * Build one per (wallet, epoch, RPC node) and rebuild on any change:
 * wallet.pkh() caches its address.
 */
import { MavrykToolkit } from "@mavrykdynamics/taquito";
import type { ForgeParams } from "@mavrykdynamics/taquito-local-forging";

import {
  assertMatchesExpectedOperation,
  getExpectedOperation,
  OperationMismatchError,
} from "~/services/direct/expectedOperation";

import { DynamicMavrykSigner } from "./DynamicMavrykSigner";
import {
  signDigest32,
  type DynamicClient,
  type DynamicWalletIdentity,
} from "./dynamicClient.client";

export class WrongNetworkError extends Error {
  constructor(
    public readonly expectedChainId: string,
    public readonly actualChainId: string
  ) {
    super("The Mavryk node is on a different network. Nothing was signed.");
    this.name = "WrongNetworkError";
  }
}

type CreateDynamicToolkitParams = {
  client: DynamicClient;
  identity: DynamicWalletIdentity;
  rpcUrl: string;
  expectedChainId: string;
  /** True once the app moved on (sign-out, account switch) */
  isStale?: () => boolean;
  beforeSign?: (operation: ForgeParams) => void | Promise<void>;
  /** For tests */
  createToolkit?: (rpcUrl: string) => MavrykToolkit;
};

export async function createDynamicToolkit({
  client,
  identity,
  rpcUrl,
  expectedChainId,
  isStale,
  beforeSign,
  createToolkit = (url) => new MavrykToolkit(url),
}: CreateDynamicToolkitParams): Promise<MavrykToolkit> {
  const toolkit = createToolkit(rpcUrl);
  const chainId = await toolkit.rpc.getChainId();

  if (chainId !== expectedChainId) {
    throw new WrongNetworkError(expectedChainId, chainId);
  }

  toolkit.setSignerProvider(
    new DynamicMavrykSigner({
      keys: identity,
      signDigest: (digest) =>
        signDigest32({ client, identity, digest, isStale }),
      // An embedded wallet shows no operation details: sign only what the
      // app prepared and the user reviewed for this toolkit
      beforeSign: async (operation) => {
        const expected = getExpectedOperation(toolkit);

        if (!expected) {
          throw new OperationMismatchError("no reviewed transaction");
        }

        assertMatchesExpectedOperation(operation.contents, expected);
        await beforeSign?.(operation);
      },
    })
  );

  return toolkit;
}
