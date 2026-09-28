import { rwaApi } from "~/lib/apis/rwa/client";
import { bridgeDepositsSchema } from "./bridge.schema";

export async function fetchBridgeDeposits(
  wallet: string,
  signal: AbortSignal,
  fresh: boolean
) {
  const { data } = await rwaApi.get(
    `/wallets/${encodeURIComponent(wallet)}/bridge/deposits`,
    { signal, timeout: 15_000, params: fresh ? { fresh: 1 } : undefined }
  );
  return bridgeDepositsSchema.parse(data).deposits;
}
