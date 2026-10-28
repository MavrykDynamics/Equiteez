import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { QueryClient } from "@tanstack/react-query";
import fixtures from "../../../../../docs/fixtures/relay-api.json";
import {
  checkRelayOperationNow,
  fetchRelayConfig,
  fetchRelayCredits,
  fetchRelayOperation,
  fetchRelayOperations,
  relayConfigQueryOptions,
  submitRelayOperation,
  submitRelayTopUp,
} from "./relay";
import {
  relayAcceptedSchema,
  relayConfigSchema,
  relayCreditsSchema,
  relayIntentSchema,
  relayListSchema,
  relayOperationSchema,
  relaySubmitSchema,
  relayTopUpAcceptedSchema,
} from "./relay.schema";
import {
  canResignRelay,
  getRelayErrorAction,
  getRelayRetryDelay,
  parseRetryAfter,
  RelayApiError,
  toRelayApiError,
} from "~/lib/relay/relay.errors";
import { getRelayEligibility } from "~/lib/relay/relay.eligibility";

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("~/lib/apis/rwa/client", () => ({ rwaApi: mocks }));
const fixture = (name: string) => {
  const found = fixtures.cases.find((item) => item.name === name);
  if (!found) throw new Error(`Missing fixture: ${name}`);
  return found.value;
};
const config = relayConfigSchema.parse(fixture("config-fee-on"));
const row = relayOperationSchema.parse(fixture("operation-pending"));
const request = relaySubmitSchema.parse({
  intent: fixture("intent-place_buy_order"),
  operation: {
    to: "fixture-orderbook",
    parameter: { entrypoint: "permitAndExecute", value: [{ prim: "Pair" }] },
  },
  idempotencyKey: "test-click-1",
});
function httpError(
  status: number,
  data: unknown,
  headers: Record<string, string> = {}
) {
  return new AxiosError("Request failed", undefined, undefined, undefined, {
    status,
    data,
    headers,
    statusText: "Error",
    config: { headers: new AxiosHeaders() },
  });
}
beforeEach(() => vi.resetAllMocks());

describe("documented response schemas", () => {
  const schemas = {
    RelayConfig: relayConfigSchema,
    RelayFeeCredits: relayCreditsSchema,
    RelayIntent: relayIntentSchema,
    RelayOperationAccepted: relayAcceptedSchema,
    RelayOperation: relayOperationSchema,
    RelayOperationList: relayListSchema,
    RelayFeeTopUpAccepted: relayTopUpAcceptedSchema,
  };
  for (const item of fixtures.cases) {
    const name = item.schema.split("/").at(-1) as keyof typeof schemas;
    const schema = schemas[name];
    if (schema)
      it(`parses ${item.name}`, () =>
        expect(schema.safeParse(item.value).success).toBe(true));
  }
  it("preserves huge units and tolerates additive fields", () => {
    expect(
      relayIntentSchema.parse({ ...request.intent, futureField: true })
    ).toEqual(request.intent);
    expect(request.intent).toHaveProperty(
      "rwaTokenAmount",
      "900719925474099312345"
    );
  });
  it("rejects unsafe/incorrect units, noncanonical token IDs and excess cancels", () => {
    expect(
      relayIntentSchema.safeParse({ ...request.intent, rwaTokenAmount: 2 })
        .success
    ).toBe(false);
    expect(
      relayIntentSchema.safeParse({
        kind: "update_operators",
        tokenAddress: "t",
        operator: "b",
        tokenId: "01",
      }).success
    ).toBe(false);
    expect(
      relayIntentSchema.safeParse({
        kind: "cancel_orders",
        orderbookAddress: "b",
        orders: Array(11).fill({ orderId: "1", orderType: "BUY" }),
      }).success
    ).toBe(false);
    expect(
      relayConfigSchema.safeParse({
        ...config,
        fee: { ...config.fee, tokenId: Number.MAX_SAFE_INTEGER + 1 },
      }).success
    ).toBe(false);
  });
  it("rejects unsupported ordinary intents, wrong destinations, multiple permits, nonzero amounts and spaced keys", () => {
    for (const patch of [
      { intent: { kind: "fee_top_up" } },
      { intent: { kind: "launchpad_purchase" } },
      { operation: { ...request.operation, to: "different" } },
      { operation: { ...request.operation, amount: "1" } },
      {
        operation: {
          ...request.operation,
          parameter: { ...request.operation.parameter, value: [{}, {}] },
        },
      },
      { idempotencyKey: "has space" },
    ])
      expect(
        relaySubmitSchema.safeParse({ ...request, ...patch }).success
      ).toBe(false);
  });
});

describe("transport", () => {
  it.each([404, 503])("disables config on HTTP %s", async (status) => {
    mocks.get.mockRejectedValueOnce(httpError(status, {}));
    expect(await fetchRelayConfig()).toMatchObject({
      state: "disabled",
      reason: status === 404 ? "not-found" : "unavailable",
      config: { enabled: false },
    });
  });
  it("disables offline/malformed config and requires complete fee-on configuration", async () => {
    mocks.get.mockRejectedValueOnce(new AxiosError("offline"));
    expect(await fetchRelayConfig()).toMatchObject({ reason: "unavailable" });
    mocks.get.mockResolvedValue({
      data: { ...config, fee: { enabled: true } },
    });
    expect(await fetchRelayConfig()).toMatchObject({ reason: "malformed" });
  });
  it("caches config for one minute within the supplied scope only", async () => {
    const client = new QueryClient();
    mocks.get.mockResolvedValue({ data: config });
    const first = relayConfigQueryOptions("api-a:network-a");
    expect(first.staleTime).toBe(60_000);
    expect(first.retry).toBe(false);
    await client.fetchQuery(first);
    await client.fetchQuery(first);
    expect(mocks.get).toHaveBeenCalledTimes(1);
    await client.fetchQuery(relayConfigQueryOptions("api-b:network-a"));
    expect(mocks.get).toHaveBeenCalledTimes(2);
    client.clear();
  });
  it("uses explicit Check now and preserves cache-bypass metadata", async () => {
    mocks.get.mockResolvedValue({
      data: row,
      headers: { "x-cache-bypass": "limited" },
    });
    await fetchRelayOperation("wallet/a", row.operationId);
    expect(mocks.get).toHaveBeenLastCalledWith(
      `/wallets/wallet%2Fa/relay/operations/${row.operationId}`,
      expect.objectContaining({ params: undefined })
    );
    expect(await checkRelayOperationNow("wallet/a", row.operationId)).toEqual({
      operation: row,
      cacheBypass: "limited",
    });
    expect(mocks.get).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ params: { fresh: 1 } })
    );
  });
  it("rejects another operation's row", async () => {
    mocks.get.mockResolvedValue({
      data: { ...row, operationId: "00000000-0000-4000-8000-000000000002" },
      headers: {},
    });
    await expect(
      fetchRelayOperation("w", row.operationId)
    ).rejects.toMatchObject({ code: "OPERATION_ID_MISMATCH" });
  });
  it("uses documented cursor/status filters without fresh or invented intent parameters", async () => {
    mocks.get
      .mockResolvedValueOnce({ data: fixture("list-first") })
      .mockResolvedValueOnce({ data: fixture("list-exhausted") });
    const page = await fetchRelayOperations("w", {
      status: ["open", "confirmed"],
      limit: 20,
    });
    expect(mocks.get).toHaveBeenLastCalledWith(
      "/wallets/w/relay/operations",
      expect.objectContaining({
        params: { status: "open,confirmed", limit: 20 },
      })
    );
    expect(
      await fetchRelayOperations("w", { cursor: page.nextCursor! })
    ).toEqual({ items: [], nextCursor: null });
    await expect(
      fetchRelayOperations("w", { limit: 101 })
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });
  it("submits only documented payloads and disables shared auth POST replay", async () => {
    mocks.post.mockResolvedValueOnce({ data: fixture("accepted") });
    await submitRelayOperation("w", request);
    expect(mocks.post).toHaveBeenCalledWith(
      "/wallets/w/relay/operations",
      request,
      expect.objectContaining({ _retry: true })
    );
    mocks.post.mockResolvedValueOnce({ data: fixture("top-up-accepted") });
    await submitRelayTopUp(
      "fixture-wallet",
      {
        publicKey: "test-key",
        signature: "test-signature",
        amountUnits: "1000000",
      },
      config
    );
    expect(mocks.post).toHaveBeenLastCalledWith(
      "/wallets/fixture-wallet/relay/fee/top-up",
      {
        publicKey: "test-key",
        signature: "test-signature",
        amountUnits: "1000000",
      },
      expect.objectContaining({ _retry: true })
    );
  });
  it("skips credit reads/top-ups with fee off and checks top-up bounds exactly", async () => {
    const off = relayConfigSchema.parse(fixture("config-fee-off"));
    expect(await fetchRelayCredits("w", off)).toEqual({ enabled: false });
    const topUp = {
      publicKey: "test-key",
      signature: "test-signature",
      amountUnits: "1000000",
    };
    await expect(submitRelayTopUp("w", topUp, off)).rejects.toMatchObject({
      code: "FEE_DISABLED",
    });
    await expect(
      submitRelayTopUp(
        "w",
        { ...topUp, amountUnits: "900719925474099312345" },
        config
      )
    ).rejects.toMatchObject({ code: "AMOUNT_OUT_OF_BOUNDS" });
    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("does not automatically retry unknown POST outcomes", async () => {
    mocks.post.mockRejectedValue(new AxiosError("timeout"));
    await expect(submitRelayOperation("w", request)).rejects.toMatchObject({
      code: "NETWORK_UNKNOWN",
      remedy: "retry",
    });
    expect(mocks.post).toHaveBeenCalledTimes(1);
  });
  it("rejects credits for another signer", async () => {
    mocks.get.mockResolvedValue({ data: fixture("credits-mixed") });
    await expect(
      fetchRelayCredits("other-wallet", config)
    ).rejects.toMatchObject({ code: "SIGNER_MISMATCH" });
  });
});

describe("error and eligibility policies", () => {
  it("retains relay details/status/headers and limits identical-payload retries", () => {
    const error = toRelayApiError(
      httpError(409, fixture("error-in-flight"), {
        "retry-after": "8",
        "x-cache-bypass": "stale-fallback",
      })
    );
    expect(error).toMatchObject({
      status: 409,
      code: "PERMIT_IN_FLIGHT",
      remedy: "retry",
      detail: { operationId: row.operationId },
      cacheBypass: "stale-fallback",
    });
    expect([0, 1, 2, 3].map((n) => getRelayRetryDelay(error, n))).toEqual([
      8000,
      8000,
      8000,
      null,
    ]);
    const network = toRelayApiError(new AxiosError("offline"));
    expect([0, 1, 2, 3].map((n) => getRelayRetryDelay(network, n))).toEqual([
      1000,
      2000,
      4000,
      null,
    ]);
    expect(
      parseRetryAfter(
        "Thu, 22 Oct 2026 10:00:10 GMT",
        Date.parse("2026-10-22T10:00:00Z")
      )
    ).toBe(10000);
    expect(error).not.toHaveProperty("config");
  });
  it("handles middleware envelopes and bounded conclusive re-signs", () => {
    expect(
      getRelayErrorAction(
        toRelayApiError(httpError(401, fixture("middleware-error")))
      )
    ).toBe("sign-in");
    expect(
      getRelayErrorAction(
        toRelayApiError(
          httpError(403, { error: "Forbidden", code: "forbidden" })
        )
      )
    ).toBe("refused");
    expect(
      toRelayApiError(httpError(429, { error: "Rate limited", code: "quota" }))
        .remedy
    ).toBe("retry");
    const resign = new RelayApiError(400, "PERMIT_STALE_COUNTER", "re-sign");
    expect([0, 1, 2].map((n) => canResignRelay(resign, n, true))).toEqual([
      true,
      true,
      false,
    ]);
    expect(canResignRelay(resign, 0, false)).toBe(false);
    expect(getRelayRetryDelay(resign, 0)).toBeNull();
    expect(
      getRelayRetryDelay(new RelayApiError(400, "INVALID_PERMIT", "give-up"), 0)
    ).toBeNull();
  });
  it("requires action-specific book/token capabilities and matching authentication", () => {
    const eligibleConfig: typeof config = {
      ...config,
      contracts: [
        {
          address: "book",
          kind: "orderbook" as const,
          permitActions: [
            "permitCancelOrders",
            "permitProcessRefund",
            "permitPlaceBuyOrder",
            "permitPlaceSellOrder",
          ],
        },
      ],
    };
    const input = {
      config: { state: "ready" as const, config: eligibleConfig },
      wallet: "w",
      authenticatedWallet: "w",
      isAuthLoading: false,
      action: "cancel_orders" as const,
      orderbookAddress: "book",
    };
    expect(getRelayEligibility(input)).toEqual({ eligible: true });
    expect(getRelayEligibility({ ...input, action: "process_refund" })).toEqual(
      { eligible: true }
    );
    expect(
      getRelayEligibility({ ...input, action: "place_buy_order" })
    ).toMatchObject({ eligible: false });
    eligibleConfig.contracts.push({
      address: "quote",
      kind: "quote_token",
      permitActions: ["permitUpdateOperators"],
    });
    expect(
      getRelayEligibility({
        ...input,
        action: "place_buy_order",
        tokenAddress: "quote",
      })
    ).toEqual({ eligible: true });
    expect(
      getRelayEligibility({
        ...input,
        action: "place_sell_order",
        tokenAddress: "quote",
      })
    ).toMatchObject({ eligible: false });
    expect(
      getRelayEligibility({ ...input, authenticatedWallet: "other" })
    ).toMatchObject({ reason: "sign-in" });
    expect(
      getRelayEligibility({ ...input, config: { state: "loading" } })
    ).toMatchObject({ reason: "config-loading" });
  });
});
