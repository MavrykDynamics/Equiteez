import { z } from "zod";
import { USDT_BRIDGE } from "~/consts/usdtBridge";

const deploymentSchema = z.object({
  apiUrl: z.string().url(),
  sourceChainId: z.literal(USDT_BRIDGE.chainId),
  destinationNetwork: z.literal(USDT_BRIDGE.destinationNetwork),
  sourceBridge: z.string(),
});

/** Operator assertion about this exact deployment, never inferred from slugs. */
export function hasBridgeDeploymentBinding(
  raw: string | undefined,
  apiUrl: string | undefined
) {
  try {
    const binding = deploymentSchema.parse(JSON.parse(raw ?? ""));
    return (
      Boolean(apiUrl) &&
      new URL(binding.apiUrl).href === new URL(apiUrl!).href &&
      binding.sourceBridge.toLowerCase() === USDT_BRIDGE.address.toLowerCase()
    );
  } catch {
    return false;
  }
}
