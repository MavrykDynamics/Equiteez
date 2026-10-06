import type { QueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { fetchWalletNotifications } from "~/lib/apis/rwa/notifications/notifications";
import { NotificationsSchema } from "~/lib/apis/rwa/notifications/notifications.schema";
import { bridgeHashSchema } from "~/lib/apis/rwa/bridge/bridge.schema";
import type { BridgeTransactions } from "./bridgeTransactions";

const completionSchema = z.object({
  kind: z.literal("bridge_deposit_completed"),
  payload: z.object({
    initial_tx_hash: bridgeHashSchema.transform((hash) => hash.toLowerCase()),
    initial_log_index: z.number().int().nonnegative(),
    mavryk_address: z.string().min(1),
    direction: z.literal("in"),
  }),
});
const cachedPagesSchema = z.union([
  NotificationsSchema.transform((page) => [page]),
  z
    .object({ pages: z.array(NotificationsSchema) })
    .transform(({ pages }) => pages),
]);

/** Recover presentation from durable outcomes, never synthesize signer progress. */
export async function recoverBridgeWidgets(
  store: BridgeTransactions,
  queryClient: QueryClient,
  signal: AbortSignal,
  isCurrent: () => boolean
) {
  const current = () => !signal.aborted && isCurrent();
  const pending = () =>
    current() &&
    store
      .getWidgetRecoveryRecords()
      .some((record) => record.signerEvents?.length || record.backend);
  if (!pending()) return;

  const consume = (data: unknown) => {
    if (!current()) return;
    const parsed = cachedPagesSchema.safeParse(data);
    if (!parsed.success) return;
    const completed = new Set<string>();
    for (const page of parsed.data) {
      for (const item of page.items) {
        const result = completionSchema.safeParse(item);
        if (
          !result.success ||
          result.data.payload.mavryk_address !== store.account
        )
          continue;
        const { initial_tx_hash, initial_log_index } = result.data.payload;
        completed.add(`${initial_tx_hash}:${initial_log_index}`);
      }
    }
    store.resolveWidgetRecovery(completed, false);
  };
  const queries = queryClient.getQueryCache().findAll({
    predicate: ({ queryKey }) =>
      queryKey[1] === store.account &&
      (queryKey[2] !== "bridge-recovery" || queryKey[3] === store.network) &&
      (queryKey[0] === "rwa-wallet-notifications" ||
        queryKey[0] === "walletNotificationsPage"),
  });
  for (const query of queries) consume(query.state.data);
  if (!pending()) return;

  // Join the existing inbox requests before asking for any additional history.
  await Promise.allSettled(queries.map((query) => query.promise));
  for (const query of queries) consume(query.state.data);
  if (!pending()) return;

  const cursors = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await queryClient.fetchQuery({
      queryKey: [
        "rwa-wallet-notifications",
        store.account,
        "bridge-recovery",
        store.network,
        cursor,
      ],
      queryFn: () =>
        fetchWalletNotifications({
          walletAddress: store.account,
          kinds: ["bridge_deposit_completed"],
          limit: 100,
          cursor,
          signal,
        }),
      retry: false,
    });
    if (!current()) return;
    consume(page);
    if (!pending()) return;
    if (page.next_cursor === null) {
      store.resolveWidgetRecovery(new Set(), true);
      return;
    }
    if (cursors.has(page.next_cursor))
      throw new Error("Bridge notification history cursor repeated");
    cursors.add(page.next_cursor);
    cursor = page.next_cursor;
  } while (pending());
}
