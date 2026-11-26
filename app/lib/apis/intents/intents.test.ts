import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it } from "vitest";

import {
  fixtureCapability,
  fixtureOperationId,
  fixtureSolanaRefund,
  fixtureSource,
  memoryStorage,
  operation,
  preview,
  request,
} from "~/lib/intents/intents.fixtures";
import { toIntentPreviewRequest } from "~/lib/intents/intentQuote";
import { createIntentsHttpApi, parseRetryAfter } from "./intents.http";
import {
  createIntentsMockApi,
  mockIntentMetadata,
  mockSettlementToken,
  type IntentsMockScenario,
} from "./intents.mock";
import { IntentsApiError } from "./intents.types";

const credentials = {
  capability: fixtureCapability,
  idempotencyKey: "key-0001",
};

describe("HTTP client", () => {
  type Reply =
    | { status: number; data: unknown; headers?: Record<string, string> }
    | "offline";
  function client(reply: Reply) {
    const requests: InternalAxiosRequestConfig[] = [];
    const instance = axios.create({
      adapter: async (config) => {
        requests.push(config);
        if (reply === "offline")
          throw new AxiosError("Network Error", "ERR_NETWORK", config);
        const response = {
          data: reply.data,
          status: reply.status,
          statusText: "",
          headers: reply.headers ?? {},
          config,
        };
        if (reply.status >= 400)
          throw new AxiosError(
            "Request failed",
            "ERR_BAD_RESPONSE",
            config,
            undefined,
            response
          );
        return response;
      },
    });
    return {
      api: createIntentsHttpApi("https://intents.test/", "env", instance),
      requests,
    };
  }
  const headerNames = (config: InternalAxiosRequestConfig) =>
    Object.keys(config.headers.toJSON()).map((name) => name.toLowerCase());

  const liveMetadata = {
    schemaVersion: 2,
    admissionPaused: false,
    catalog: { fetchedAt: "2026-11-25T10:00:00.000Z", stale: false },
    defaultSettlementToken: {
      settlementTokenId: "usdt0-arbitrum",
      settlementTokenVersion: 1,
    },
    settlementTokens: [mockSettlementToken],
    sourceAssets: mockIntentMetadata.sourceAssets,
  };

  it("reads metadata v2 without credentials and drops invalid entries", async () => {
    const { api, requests } = client({
      status: 200,
      data: {
        ...liveMetadata,
        settlementTokens: [
          mockSettlementToken,
          { ...mockSettlementToken, settlementTokenId: "" },
        ],
        sourceAssets: [
          ...liveMetadata.sourceAssets,
          { ...liveMetadata.sourceAssets[0], decimals: "9" },
        ],
      },
    });
    const metadata = await api.getMetadata();
    expect(requests[0].url).toBe("https://intents.test/v1/metadata");
    expect(requests[0].method).toBe("get");
    expect(requests[0].withCredentials).toBe(false);
    // Only CORS-allowed headers; the Equiteez RWA token is never sent.
    expect(headerNames(requests[0])).not.toContain("authorization");
    expect(metadata.settlementTokens).toHaveLength(1);
    expect(metadata.sourceAssets).toHaveLength(
      liveMetadata.sourceAssets.length
    );
    expect(metadata.defaultSettlementToken).toEqual(
      liveMetadata.defaultSettlementToken
    );
  });

  it("accepts the empty Basenet metadata and rejects other schema versions", async () => {
    await expect(
      client({
        status: 200,
        data: {
          schemaVersion: 2,
          admissionPaused: false,
          catalog: { fetchedAt: null, stale: true },
          defaultSettlementToken: null,
          settlementTokens: [],
          sourceAssets: [],
        },
      }).api.getMetadata()
    ).resolves.toMatchObject({
      defaultSettlementToken: null,
      sourceAssets: [],
    });
    await expect(
      client({
        status: 200,
        data: { schemaVersion: 1, admissionPaused: false, routes: [] },
      }).api.getMetadata()
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("requests a preview with exactly the seven fields and no capability", async () => {
    const { api, requests } = client({ status: 200, data: preview() });
    const body = toIntentPreviewRequest(request());
    await expect(api.previewQuote(body)).resolves.toMatchObject({
      destinationMinAmountOut: "24600000",
    });
    const [sent] = requests;
    expect(sent.url).toBe("https://intents.test/v1/quotes/preview");
    expect(sent.method).toBe("post");
    expect(JSON.parse(sent.data as string)).toEqual(body);
    expect(headerNames(sent).sort()).toEqual(["accept", "content-type"].sort());
  });

  it("rejects a preview for different inputs", async () => {
    const body = toIntentPreviewRequest(request());
    await expect(
      client({
        status: 200,
        data: preview({ amountIn: "1" }),
      }).api.previewQuote(body)
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("creates an operation with the capability, idempotency key and exact body", async () => {
    const { api, requests } = client({
      status: 202,
      data: operation({ phase: "PREPARING_QUOTE", fundingInstructions: null }),
      headers: { "idempotency-replayed": "true" },
    });
    const body = request();
    const result = await api.createOperation(credentials, body);
    expect(result.replayed).toBe(true);
    expect(result.operation.id).toBe(fixtureOperationId);
    const [sent] = requests;
    expect(sent.url).toBe("https://intents.test/v1/operations");
    expect(sent.headers.Authorization).toBe(`Bearer ${fixtureCapability}`);
    expect(sent.headers["Idempotency-Key"]).toBe("key-0001");
    expect(sent.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(sent.data as string)).toEqual(body);
    expect(headerNames(sent).sort()).toEqual(
      ["accept", "authorization", "content-type", "idempotency-key"].sort()
    );
  });

  it("reads an operation with the bearer capability and rejects non-UUID ids locally", async () => {
    const { api, requests } = client({ status: 200, data: operation() });
    await api.getOperation(fixtureCapability, fixtureOperationId);
    expect(requests[0].url).toBe(
      `https://intents.test/v1/operations/${fixtureOperationId}`
    );
    expect(requests[0].headers.Authorization).toBe(
      `Bearer ${fixtureCapability}`
    );
    await expect(
      api.getOperation(fixtureCapability, "../metadata")
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(requests).toHaveLength(1);
  });

  it("accepts non-EVM deposit addresses, memos and refund recipients", async () => {
    const { api } = client({
      status: 200,
      data: operation({
        refundAddress: fixtureSolanaRefund,
        fundingInstructions: {
          ...operation().fundingInstructions!,
          sourceNetwork: "sol",
          depositAddress: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
          depositMemo: "12345",
        },
        refund: {
          status: "REPORTED",
          amount: "1",
          asset: "nep141:sol.omft.near",
          recipient: fixtureSolanaRefund,
        },
      }),
    });
    const result = await api.getOperation(
      fixtureCapability,
      fixtureOperationId
    );
    expect(result.fundingInstructions).toMatchObject({
      sourceNetwork: "sol",
      depositMemo: "12345",
    });
    expect(result.refund?.recipient).toBe(fixtureSolanaRefund);
  });

  it("maps documented error bodies with request IDs and Retry-After", async () => {
    const { api } = client({
      status: 429,
      data: {
        error: { code: "PREVIEW_BUSY", message: "busy", requestId: "req-1" },
      },
      headers: { "retry-after": "60" },
    });
    await expect(api.getMetadata()).rejects.toMatchObject({
      code: "PREVIEW_BUSY",
      status: 429,
      requestId: "req-1",
      retryAfterMs: 60_000,
    });
  });

  it("falls back to the HTTP status for unknown codes and bodies", async () => {
    await expect(
      client({
        status: 503,
        data: { error: { code: "NEW_CODE", message: "x", requestId: "r" } },
      }).api.getMetadata()
    ).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", requestId: "r" });
    await expect(
      client({
        status: 409,
        data: { error: { code: "NEW_CONFLICT", message: "x" } },
      }).api.getMetadata()
    ).rejects.toMatchObject({ code: "UNKNOWN", status: 409 });
    await expect(
      client({ status: 404, data: "<html>" }).api.getOperation(
        fixtureCapability,
        fixtureOperationId
      )
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
  });

  it("reports network failures and contract mismatches distinctly", async () => {
    await expect(client("offline").api.getMetadata()).rejects.toMatchObject({
      code: "NETWORK",
    });
    await expect(
      client({
        status: 200,
        data: { ...operation(), revision: "2" },
      }).api.getOperation(fixtureCapability, fixtureOperationId)
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("keeps operations with unknown enum values instead of failing", async () => {
    const { api } = client({
      status: 200,
      data: { ...operation(), phase: "SETTLED_SOMEHOW", attention: "NEW" },
    });
    const result = await api.getOperation(
      fixtureCapability,
      fixtureOperationId
    );
    expect(result.phase).toBe("UNKNOWN");
    expect(result.attention).toBe("UNKNOWN");
  });

  it("never wraps the axios error, whose config holds the capability", async () => {
    const failure = await client("offline")
      .api.getOperation(fixtureCapability, fixtureOperationId)
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(IntentsApiError);
    expect(JSON.stringify(failure)).not.toContain(fixtureCapability);
    expect(String((failure as Error).stack)).not.toContain(fixtureCapability);
  });

  it("parses Retry-After seconds and HTTP dates", () => {
    expect(parseRetryAfter("3")).toBe(3_000);
    expect(
      parseRetryAfter(
        "Fri, 13 Nov 2026 10:00:10 GMT",
        Date.parse("2026-11-13T10:00:00Z")
      )
    ).toBe(10_000);
    expect(parseRetryAfter(undefined)).toBeUndefined();
  });
});

describe("mock API", () => {
  let clock = 0;
  let scenario: IntentsMockScenario | null = null;
  let storage = memoryStorage();
  const create = () =>
    createIntentsMockApi({
      storage: () => storage,
      now: () => clock,
      latencyMs: 0,
      getScenario: () => scenario,
    });
  const previewOf = (overrides: Parameters<typeof request>[0] = {}) =>
    toIntentPreviewRequest(request(overrides));
  /** A request whose accepted minimum is the mock preview's. */
  const accepted = async (
    api: ReturnType<typeof create>,
    overrides: Parameters<typeof request>[0] = {}
  ) => {
    const quote = await api.previewQuote(previewOf(overrides));
    return request({
      acceptedMinAmountOut: quote.bridgeableMinAmountOut,
      ...overrides,
    });
  };
  let keys = 0;
  const ready = async (
    api: ReturnType<typeof create>,
    overrides: Parameters<typeof request>[0] = {}
  ) => {
    const { operation: created } = await api.createOperation(
      { ...credentials, idempotencyKey: `ready-key-${++keys}` },
      await accepted(api, overrides)
    );
    clock += 1_500;
    return api.getOperation(fixtureCapability, created.id);
  };
  beforeEach(() => {
    clock = Date.parse("2026-11-13T10:00:00Z");
    scenario = null;
    storage = memoryStorage();
  });

  it("serves metadata v2 and its scenarios", async () => {
    await expect(create().getMetadata()).resolves.toEqual(mockIntentMetadata);
    scenario = "stale";
    await expect(create().getMetadata()).resolves.toMatchObject({
      catalog: { stale: true },
      sourceAssets: [],
    });
    scenario = "noToken";
    await expect(create().getMetadata()).resolves.toMatchObject({
      defaultSettlementToken: null,
    });
  });

  it("prices previews and validates the refund address per network", async () => {
    const api = create();
    const quote = await api.previewQuote(previewOf());
    expect(quote).toMatchObject({
      kind: "indicative",
      executable: false,
      withdrawFee: "4000",
    });
    // 25 USDC × 0.997 − 0.004 USDT0, minus 1% slippage.
    expect(quote.destinationAmountOut).toBe("24921000");
    expect(quote.destinationMinAmountOut).toBe("24671790");
    await expect(
      api.previewQuote(
        previewOf({
          sourceAssetId: "nep141:sol.omft.near",
          refundAddress: fixtureSource,
        })
      )
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR", status: 400 });
    await expect(
      api.previewQuote(
        previewOf({
          sourceAssetId: "nep141:sol.omft.near",
          refundAddress: fixtureSolanaRefund,
          amountIn: "1000000000",
        })
      )
    ).resolves.toMatchObject({ providerTimeEstimateSeconds: 35 });
    await expect(
      api.previewQuote(previewOf({ amountIn: "100" }))
    ).rejects.toMatchObject({ code: "AMOUNT_TOO_LOW" });
    await expect(
      api.previewQuote({ ...previewOf(), extra: 1 } as never)
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    scenario = "previewBusy";
    await expect(api.previewQuote(previewOf())).rejects.toMatchObject({
      code: "PREVIEW_BUSY",
      retryAfterMs: 60_000,
    });
  });

  it("refuses an unknown asset or settlement token", async () => {
    const api = create();
    await expect(
      api.previewQuote(previewOf({ sourceAssetId: "nep141:nope.near" }))
    ).rejects.toMatchObject({ code: "SOURCE_ASSET_UNAVAILABLE" });
    await expect(
      api.previewQuote(previewOf({ settlementTokenVersion: 2 }))
    ).rejects.toMatchObject({ code: "SETTLEMENT_TOKEN_UNAVAILABLE" });
  });

  it("replays the same scope and rejects a changed request for it", async () => {
    const api = create();
    const body = await accepted(api);
    const first = await api.createOperation(credentials, body);
    expect(first.replayed).toBe(false);
    expect(first.operation).toMatchObject({
      phase: "PREPARING_QUOTE",
      fundingStatus: "NOT_READY",
      fundingInstructions: null,
      revision: 1,
    });
    const again = await api.createOperation(credentials, body);
    expect(again).toMatchObject({ replayed: true });
    expect(again.operation.id).toBe(first.operation.id);
    await expect(
      api.createOperation(credentials, { ...body, amountIn: "26000000" })
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_CONFLICT", status: 409 });
    const other = await api.createOperation(
      { ...credentials, capability: "B".repeat(42) + "A" },
      body
    );
    expect(other.operation.id).not.toBe(first.operation.id);
  });

  it("hides foreign operations behind 404", async () => {
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      await accepted(api)
    );
    await expect(
      api.getOperation("B".repeat(42) + "A", created.id)
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
  });

  it("publishes exact instructions on the source network", async () => {
    const api = create();
    const published = await ready(api);
    expect(published).toMatchObject({
      phase: "AWAITING_DEPOSIT",
      fundingStatus: "AVAILABLE",
      revision: 2,
    });
    expect(published.fundingInstructions).toMatchObject({
      amount: request().amountIn,
      sourceNetwork: "base",
      originAsset: request().sourceAssetId,
      depositMemo: null,
    });
    expect(published.fundingInstructions!.depositAddress).toMatch(
      /^0x[0-9a-f]{40}$/
    );
  });

  it("gives Bitcoin a longer funding window and non-EVM deposit addresses", async () => {
    const api = create();
    const published = await ready(api, {
      sourceAssetId: "nep141:btc.omft.near",
      refundAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      amountIn: "100000",
    });
    const instructions = published.fundingInstructions!;
    expect(instructions.sourceNetwork).toBe("btc");
    expect(instructions.depositAddress).toMatch(/^bc1q/);
    expect(
      Date.parse(instructions.deadline) -
        Date.parse(instructions.fundingExpiresAt)
    ).toBe(60 * 60_000);
  });

  it("carries a memo in the memo scenario and pauses in the paused one", async () => {
    scenario = "memo";
    expect((await ready(create())).fundingInstructions?.depositMemo).toBe(
      "1029384756"
    );
    scenario = "paused";
    await expect(ready(create())).resolves.toMatchObject({
      fundingStatus: "PAUSED",
      attention: "SETTLEMENT_TOKEN_PAUSED",
      fundingInstructions: null,
    });
  });

  it("rejects the quote below the accepted minimum or in the reject scenario", async () => {
    const api = create();
    await expect(
      ready(api, { acceptedMinAmountOut: "99000000" })
    ).resolves.toMatchObject({ closure: "QUOTE_REJECTED" });
    scenario = "reject";
    await expect(ready(api)).resolves.toMatchObject({
      closure: "QUOTE_REJECTED",
    });
    scenario = "unavailable";
    await expect(
      api.createOperation(
        { ...credentials, idempotencyKey: "key-0002" },
        request()
      )
    ).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", status: 503 });
  });

  it("lower-cases an EVM refund address", async () => {
    const api = create();
    const body = await accepted(api, {
      refundAddress: "0x52908400098527886E0F7030069857D2E4169EE7",
    });
    const { operation: created } = await api.createOperation(credentials, body);
    expect(created.refundAddress).toBe(
      "0x52908400098527886e0f7030069857d2e4169ee7"
    );
  });

  it("expires unfunded instructions without replacing the address", async () => {
    scenario = "expire";
    const api = create();
    const published = await ready(api);
    clock += 20_000;
    await expect(
      api.getOperation(fixtureCapability, published.id)
    ).resolves.toMatchObject({
      fundingStatus: "EXPIRED",
      fundingInstructions: null,
    });
  });

  it("runs the lifecycle to a confirmed settlement on the expected token", async () => {
    const api = create();
    const published = await ready(api);
    api.simulateDeposit(fixtureCapability, published.id);
    const seen = [];
    for (const step of [0, 3_000, 5_000, 4_000, 4_000, 6_000, 10_000]) {
      clock += step;
      seen.push(await api.getOperation(fixtureCapability, published.id));
    }
    expect(seen.map((item) => item.phase)).toEqual([
      "AWAITING_DEPOSIT",
      "SWAP_IN_PROGRESS",
      "VERIFYING_DELIVERY",
      "DELIVERY_VERIFIED",
      "FORWARDING",
      "WRAPPED",
      "WRAPPED",
    ]);
    expect(seen[0].fundingStatus).toBe("OBSERVED");
    expect(seen[5].settlement.status).toBe("PENDING");
    const done = seen[6];
    expect(done.settlement).toMatchObject({
      status: "CONFIRMED",
      tokenAddress: "KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE",
      tokenId: "0",
      confirmedAmount: published.fundingInstructions!.bridgeableAmountOut,
    });
    expect(done.settlement.mints[0]).toMatchObject({
      wrapTransactionHash: done.forwarding.bridgeEvents[0].transactionHash,
      wrapLogIndex: 0,
    });
    // Revisions only grow.
    expect(seen.map((item) => item.revision)).toEqual(
      [...seen.map((item) => item.revision)].sort((a, b) => a - b)
    );
  });

  it.each([
    ["refund", "REFUNDED"],
    ["incomplete", "INCOMPLETE_DEPOSIT"],
  ] as const)(
    "halts the %s scenario at the provider report",
    async (name, status) => {
      scenario = name;
      const api = create();
      const published = await ready(api);
      api.simulateDeposit(fixtureCapability, published.id);
      clock += 60_000;
      const result = await api.getOperation(fixtureCapability, published.id);
      expect(result.providerStatus).toBe(status);
      expect(result.phase).not.toBe("WRAPPED");
      if (name === "refund")
        expect(result.refund).toMatchObject({
          status: "REPORTED",
          recipient: fixtureSource,
        });
    }
  );

  it("keeps settlement NOT_TRACKED in the untracked scenario", async () => {
    scenario = "untracked";
    const api = create();
    const published = await ready(api);
    api.simulateDeposit(fixtureCapability, published.id);
    clock += 120_000;
    const result = await api.getOperation(fixtureCapability, published.id);
    expect(result.phase).toBe("WRAPPED");
    expect(result.settlement.status).toBe("NOT_TRACKED");
    expect(result.forwarding.bridgeEvents).toHaveLength(1);
  });

  it("ignores a simulated deposit before instructions are published", async () => {
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      await accepted(api)
    );
    api.simulateDeposit(fixtureCapability, created.id);
    clock += 1_500;
    await expect(
      api.getOperation(fixtureCapability, created.id)
    ).resolves.toMatchObject({ fundingStatus: "AVAILABLE" });
  });
});
