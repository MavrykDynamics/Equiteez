import { z } from "zod";
// user can add the custom one from the settings popup

export const basenetNetRpcnode = "https://basenet.rpc.mavryk.network";

export const RPC_NODE = "selectedRpcNode";

export const rpcNodeSchema = z.enum([basenetNetRpcnode]);

export type RPCNodeType = z.infer<typeof rpcNodeSchema>;
