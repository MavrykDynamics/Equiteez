/**
 * The only module that imports the Dynamic SDK statically. It is loaded with a
 * dynamic import() from the browser (see dynamicClient.client.ts), so the SDK
 * and its iframe never reach the server bundle or run during SSR.
 *
 * WebExtension mounts Dynamic's hidden iframe and message transport;
 * SolanaExtension enables the embedded ed25519 wallet the Mavryk flow uses
 * (Dynamic lists it under the SOL chain).
 */
import { createClient } from "@dynamic-labs/client";
import { WebExtension } from "@dynamic-labs/web-extension";
import { SolanaExtension } from "@dynamic-labs/solana-extension";

export function createDynamicClient(environmentId: string) {
  return createClient({ environmentId, appName: "Equiteez" })
    .extend(WebExtension())
    .extend(SolanaExtension());
}

export type DynamicClient = ReturnType<typeof createDynamicClient>;
export type DynamicWallet = DynamicClient["wallets"]["userWallets"][number];
