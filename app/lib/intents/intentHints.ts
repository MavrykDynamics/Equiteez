import { INTENTS_HINT_RETRY_MS } from "~/consts/intents";
import { isIntentsApiError, type IntentsApi } from "~/lib/apis/intents";
import type { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";

const inFlight = new Map<string, Promise<void>>();
const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Tells the backend which source transaction funded the operation. It is only
 * a reconciliation hint: backend workers detect the deposit on their own, so a
 * failure never blocks the flow and never causes a second transfer.
 * One request loop per operation at a time; safe to call repeatedly.
 */
export function sendIntentHint(
  api: IntentsApi,
  session: IntentOperations,
  localId: string,
  {
    delays = INTENTS_HINT_RETRY_MS,
    sleep = defaultSleep,
  }: { delays?: readonly number[]; sleep?: (ms: number) => Promise<void> } = {}
) {
  const key = `${session.key}:${localId}`;
  const running = inFlight.get(key);
  if (running) return running;
  const run = (async () => {
    let restarts = 0;
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      const record = session.get(localId);
      const hash = record?.sourceHashes.at(-1);
      if (!record?.operationId || !hash || record.hintState === "sent") return;
      if (attempt === 0 && record.hintState !== "pending")
        session.patch(localId, { hintState: "pending" });
      try {
        const operation = await api.submitDeposit(record.operationId, hash);
        session.applyBackend(localId, operation);
        // A replacement hash may have arrived while this request was in flight.
        if (session.get(localId)?.sourceHashes.at(-1) === hash) {
          session.patch(localId, { hintState: "sent" });
          return;
        }
        if (++restarts > 3) break;
        attempt = -1;
        continue;
      } catch (error) {
        const isFinal =
          isIntentsApiError(error) &&
          (error.code === "not_found" || error.code === "unauthorized");
        if (isFinal || attempt === delays.length) break;
        await sleep(delays[attempt]);
      }
    }
    session.patch(localId, { hintState: "failed" });
  })().finally(() => inFlight.delete(key));
  inFlight.set(key, run);
  return run;
}
