import type { MavrykToolkit } from "@mavrykdynamics/taquito";

// A node's chain id never changes, yet Taquito and the permit scope checks ask
// for it before almost every read (~25 RPC round trips per Credits action).
const chainIds = new Map<string, Promise<string>>();

/** Memoizes `rpc.getChainId` per RPC URL; a failed lookup is not cached. */
export function withCachedChainId(toolkit: MavrykToolkit) {
  const rpc = toolkit.rpc;
  const fetchChainId = rpc.getChainId.bind(rpc);
  rpc.getChainId = () => {
    const url = rpc.getRpcUrl();
    let chainId = chainIds.get(url);
    if (!chainId) {
      chainId = fetchChainId().catch((error: unknown) => {
        chainIds.delete(url);
        throw error;
      });
      chainIds.set(url, chainId);
    }
    return chainId;
  };
  return toolkit;
}
