import { z } from "zod";
import { MavrykChainId } from "~/lib/mavryk/types";
// user can add the custom one from the settings popup

export const basenetNetRpcnode = "https://basenet.rpc.mavryk.network";

export const RPC_NODE = "selectedRpcNode";

export const rpcNodeSchema = z.enum([basenetNetRpcnode]);

export type RPCNodeType = z.infer<typeof rpcNodeSchema>;

// Chain each RPC node must report, so a signer never signs for another network
export const RPC_NODE_CHAIN_IDS: Record<RPCNodeType, MavrykChainId> = {
  [basenetNetRpcnode]: MavrykChainId.Basenet,
};
