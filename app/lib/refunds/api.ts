import { z } from "zod";
import { rwaApi } from "~/lib/apis/rwa/client";
import { refundPageSchema } from "./model";

export async function readRefundPage(
  wallet: string,
  asset: string,
  cursor?: string
) {
  // Retry the SAME cursor after the owner scan budget recovers; never turn a
  // throttled page into an empty result or restart the entire scan.
  for (let attempt = 0; ; attempt++) {
    try {
      const { data } = await rwaApi.get(`/wallets/${wallet}/refunds`, {
        params: { token_address: asset, cursor, limit: 100 },
        timeout: 15_000,
      });
      return refundPageSchema.parse(data);
    } catch (error) {
      const response = (
        error as {
          response?: { status: number; headers?: Record<string, unknown> };
        }
      ).response;
      if (response?.status !== 429 || attempt >= 3) throw error;
      const seconds = Number(response.headers?.["retry-after"] ?? 60);
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.max(1, Math.min(120, Number.isFinite(seconds) ? seconds : 60)) *
            1000
        )
      );
    }
  }
}
export const relayConfigSchema = z.object({
  enabled: z.boolean(),
  contracts: z.array(
    z.object({ address: z.string(), permitActions: z.array(z.string()) })
  ),
  fee: z.object({
    enabled: z.boolean(),
    feeSchedule: z.record(z.string()).optional(),
    defaultFeeUnits: z.string().optional(),
    decimals: z.number().int().min(0).max(38).optional(),
    tokenContract: z.string().optional(),
  }),
});
export type RelayConfig = z.infer<typeof relayConfigSchema>;
export async function readRelayConfig() {
  return relayConfigSchema.parse(
    (await rwaApi.get("/relay/config", { timeout: 10_000 })).data
  );
}

export const relayOperationSchema = z.object({
  operationId: z.string(),
  status: z.string(),
  opHash: z.string().nullable().optional(),
  contractAddress: z.string().optional(),
  error: z
    .object({ code: z.string(), message: z.string() })
    .nullable()
    .optional(),
});

export function serviceFee(config: RelayConfig) {
  if (config.fee.enabled && !config.fee.feeSchedule)
    throw new Error("Refund fee is unavailable");
  // The schedule is resolved by Gas Station; absent variants are free.
  const units = config.fee.enabled
    ? (config.fee.feeSchedule?.permitProcessRefund ?? "0")
    : "0";
  if (units === undefined || !/^(0|[1-9][0-9]*)$/.test(units))
    throw new Error("Refund fee is unavailable");
  return units;
}
