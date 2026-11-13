import type { IntentOperation } from "~/lib/apis/intents";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";

const [usdt] = mockIntentRoutes;
export const fixtureRecipient = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
export const fixtureSource =
  "0x1111111111111111111111111111111111111111" as const;

export function operation(
  overrides: Partial<IntentOperation> = {}
): IntentOperation {
  return {
    id: "op-1",
    version: 0,
    updatedAt: "2026-11-13T10:00:00.000Z",
    routeId: usdt.id,
    recipient: fixtureRecipient,
    sourceAddress: fixtureSource,
    amountIn: "2000000000000000000",
    amountOut: "1994000",
    minAmountOut: "1974060",
    quoteExpiresAt: "2026-11-13T10:10:00.000Z",
    funding: {
      chainId: usdt.source.chainId,
      depositAddress: "0x2222222222222222222222222222222222222222",
      token: usdt.source.token.address,
      amount: "2000000000000000000",
    },
    status: "awaiting_deposit",
    ...overrides,
  };
}

export function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}
