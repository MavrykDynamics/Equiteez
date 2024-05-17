import { z } from 'zod';
// user can add the custom one from the settings popup

export const atlasNetRpcnode = 'https://atlasnet.rpc.mavryk.network';

export const RPC_NODE = 'selectedRpcNode';

export const rpcNodeSchema = z.enum([atlasNetRpcnode]);

export type RPCNodeType = z.infer<typeof rpcNodeSchema>;
