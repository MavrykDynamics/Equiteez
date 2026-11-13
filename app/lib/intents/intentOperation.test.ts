import { describe, expect, it } from "vitest";

import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import {
  createIntentRecord,
  getOperationMismatch,
  mergeIntentSnapshot,
} from "./intentOperation";
import {
  getIntentQuoteKey,
  hasMaterialQuoteChange,
  isDefinitiveIntentRejection,
  isIntentQuoteExpired,
  secondsUntil,
} from "./intentQuote";
import { IntentsApiError } from "~/lib/apis/intents";
import { operation } from "./intents.fixtures";

const [usdt, eth] = mockIntentRoutes;
const recipient = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const source = "0x1111111111111111111111111111111111111111" as const;

describe("monotonic backend merge", () => {
  const at = (minute: number) =>
    `2026-11-13T10:${String(minute).padStart(2, "0")}:00.000Z`;

  it("accepts newer versions and keeps identity fields", () => {
    const delivered = operation({
      version: 3,
      updatedAt: at(3),
      status: "delivered",
      deliveryTxHash: `0x${"d".repeat(64)}`,
    });
    const forwarding = operation({
      version: 4,
      updatedAt: at(4),
      status: "forwarding",
    });
    expect(mergeIntentSnapshot(delivered, forwarding)).toMatchObject({
      status: "forwarding",
      deliveryTxHash: `0x${"d".repeat(64)}`,
    });
  });

  it.each([
    [
      "older version",
      operation({ version: 1, updatedAt: at(9), status: "swapping" }),
    ],
    [
      "same version, not newer",
      operation({ version: 3, updatedAt: at(3), status: "forwarding" }),
    ],
    [
      "backward status",
      operation({ version: 9, updatedAt: at(9), status: "swapping" }),
    ],
    [
      "another operation",
      operation({ id: "op-2", version: 9, updatedAt: at(9) }),
    ],
  ])("ignores %s", (_name, next) => {
    const current = operation({
      version: 3,
      updatedAt: at(3),
      status: "delivered",
    });
    expect(mergeIntentSnapshot(current, next)).toBe(current);
  });

  it.each(["wrapped", "refunded", "expired", "failed"] as const)(
    "keeps terminal %s final",
    (status) => {
      const current = operation({ version: 5, updatedAt: at(5), status });
      expect(
        mergeIntentSnapshot(
          current,
          operation({ version: 9, updatedAt: at(9), status: "failed" })
        )
      ).toBe(current);
    }
  );
});

describe("executable operation checks", () => {
  const record = () =>
    createIntentRecord({
      localId: "local-1",
      account: recipient,
      env: "mock",
      route: usdt,
      amountIn: "2000000000000000000",
      sourceAddress: source,
    });

  it("accepts the confirmed request, case-insensitively for addresses", () => {
    expect(
      getOperationMismatch(
        record(),
        operation({
          sourceAddress: source
            .toUpperCase()
            .replace("0X", "0x") as `0x${string}`,
        }),
        usdt
      )
    ).toBeNull();
  });

  it.each([
    ["recipient", { recipient: "mv1other" }],
    ["route", { routeId: eth.id }],
    ["amount", { amountIn: "1" }],
    [
      "source",
      { sourceAddress: "0x3333333333333333333333333333333333333333" as const },
    ],
    ["chain", { funding: { ...operation().funding, chainId: 1 } }],
    ["funding amount", { funding: { ...operation().funding, amount: "1" } }],
    [
      "token",
      { funding: { ...operation().funding, token: "native" as const } },
    ],
  ])("rejects a different %s", (field, overrides) => {
    expect(getOperationMismatch(record(), operation(overrides), usdt)).toBe(
      field
    );
  });
});

describe("quote rules", () => {
  const preview = {
    routeId: usdt.id,
    amountIn: "2000000000000000000",
    amountOut: "1994000",
    minAmountOut: "1974060",
    expiresAt: "2026-11-13T10:01:00.000Z",
    recipient,
  };

  it("keys quotes by account, source wallet, route and amount", () => {
    const base = {
      account: recipient,
      sourceAddress: source,
      routeId: usdt.id,
      amountIn: "1",
    };
    const key = getIntentQuoteKey(base);
    expect(
      getIntentQuoteKey({ ...base, sourceAddress: source.toUpperCase() })
    ).toBe(key);
    for (const change of [
      { account: "mv1other" },
      { sourceAddress: "0x3333333333333333333333333333333333333333" },
      { routeId: eth.id },
      { amountIn: "2" },
    ])
      expect(getIntentQuoteKey({ ...base, ...change })).not.toBe(key);
  });

  it("requires reconfirmation only for worse or different terms", () => {
    expect(hasMaterialQuoteChange(preview, operation())).toBe(false);
    expect(
      hasMaterialQuoteChange(preview, operation({ amountOut: "1995000" }))
    ).toBe(false);
    expect(
      hasMaterialQuoteChange(preview, operation({ amountOut: "1993999" }))
    ).toBe(true);
    expect(
      hasMaterialQuoteChange(preview, operation({ minAmountOut: "1" }))
    ).toBe(true);
    expect(
      hasMaterialQuoteChange(preview, operation({ recipient: "mv1other" }))
    ).toBe(true);
  });

  it("counts down to expiry", () => {
    const now = Date.parse("2026-11-13T10:00:30.500Z");
    expect(secondsUntil(preview.expiresAt, now)).toBe(30);
    expect(isIntentQuoteExpired(preview.expiresAt, now)).toBe(false);
    expect(isIntentQuoteExpired(preview.expiresAt, now + 30_000)).toBe(true);
  });

  it("treats only definitive rejections as needing a new idempotency key", () => {
    expect(
      isDefinitiveIntentRejection(new IntentsApiError("destination_busy", ""))
    ).toBe(true);
    expect(
      isDefinitiveIntentRejection(new IntentsApiError("network", ""))
    ).toBe(false);
    expect(
      isDefinitiveIntentRejection(new IntentsApiError("internal", ""))
    ).toBe(false);
  });
});
