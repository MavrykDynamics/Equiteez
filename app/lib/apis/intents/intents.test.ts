import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it } from "vitest";

import {
  fixtureCapability,
  fixtureFundingHash,
  fixtureOperationId,
  fixtureRoute,
  memoryStorage,
  operation,
  request,
} from "~/lib/intents/intents.fixtures";
import { createIntentsHttpApi, parseRetryAfter } from "./intents.http";
import {
  createIntentsMockApi,
  mockIntentMetadata,
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

  it("lists routes without credentials or custom headers and drops invalid entries", async () => {
    const { api, requests } = client({
      status: 200,
      data: { routes: [fixtureRoute, { ...fixtureRoute, id: "" }] },
    });
    await expect(api.getRoutes()).resolves.toEqual([fixtureRoute]);
    expect(requests[0].url).toBe("https://intents.test/v1/routes");
    expect(requests[0].method).toBe("get");
    expect(requests[0].withCredentials).toBe(false);
    // Only CORS-allowed headers; the Equiteez RWA token is never sent.
    expect(headerNames(requests[0])).not.toContain("authorization");
    expect(headerNames(requests[0])).not.toContain("x-intents-client");
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
      api.getOperation(fixtureCapability, "../routes")
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(requests).toHaveLength(1);
  });

  const liveMetadataRoute = {
    routeId: "basenet-rehearsal-k8s",
    routeVersion: 1,
    mode: "rehearsal",
    previewSupported: false,
    sourceAsset: {
      assetId: "basenet-rehearsal:0x5c05e82be66b19476bacb558e62e7d449b98635f",
      chainId: "421614",
      kind: "erc20",
      contractAddress: "0x5c05e82be66b19476bacb558e62e7d449b98635f",
      symbol: "Mock USDT",
      decimals: 18,
    },
    settlementAsset: {
      assetId: "basenet-rehearsal:0x5c05e82be66b19476bacb558e62e7d449b98635f",
      chainId: "421614",
      kind: "erc20",
      contractAddress: "0x5c05e82be66b19476bacb558e62e7d449b98635f",
      symbol: "Mock USDT",
      decimals: 18,
    },
    destinationAsset: {
      chainId: "NetXmtMsNf69w1w",
      kind: "fa2",
      contractAddress: "KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE",
      tokenId: "0",
      decimals: 6,
    },
    limits: {
      minAmountIn: "1000000000000000000",
      maxAmountIn: "1000000000000000000",
      minAmountOut: "1000000000000000000",
      maxSlippageBps: 0,
    },
    depositRegistrationSupported: true,
  };

  it("reads metadata without credentials and drops invalid entries", async () => {
    const { api, requests } = client({
      status: 200,
      data: {
        schemaVersion: 1,
        admissionPaused: false,
        routes: [
          liveMetadataRoute,
          { ...liveMetadataRoute, routeId: "" },
          { ...liveMetadataRoute, depositRegistrationSupported: "yes" },
        ],
      },
    });
    const metadata = await api.getMetadata();
    expect(requests[0].url).toBe("https://intents.test/v1/metadata");
    expect(headerNames(requests[0])).not.toContain("authorization");
    expect(metadata?.admissionPaused).toBe(false);
    expect(metadata?.routes).toHaveLength(2);
    expect(metadata?.routes[0]).toMatchObject({
      routeId: "basenet-rehearsal-k8s",
      depositRegistrationSupported: true,
      sourceAsset: { kind: "erc20", decimals: 18 },
    });
    // Only literal `true` enables registration.
    expect(metadata?.routes[1].depositRegistrationSupported).toBe(false);
  });

  it("treats a missing metadata endpoint as no metadata", async () => {
    await expect(
      client({ status: 404, data: "" }).api.getMetadata()
    ).resolves.toBeNull();
    await expect(
      client({ status: 503, data: "" }).api.getMetadata()
    ).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
  });

  it("registers the funding hash with the capability and no idempotency key", async () => {
    const { api, requests } = client({
      status: 200,
      data: {
        operationId: fixtureOperationId,
        transactionHash: fixtureFundingHash,
        replayed: true,
      },
    });
    await expect(
      api.registerDeposit(
        fixtureCapability,
        fixtureOperationId,
        fixtureFundingHash.toUpperCase().replace("0X", "0x") as `0x${string}`
      )
    ).resolves.toEqual({ replayed: true });
    const [sent] = requests;
    expect(sent.method).toBe("post");
    expect(sent.url).toBe(
      `https://intents.test/v1/operations/${fixtureOperationId}/deposit`
    );
    expect(JSON.parse(sent.data as string)).toEqual({
      transactionHash: fixtureFundingHash,
    });
    expect(headerNames(sent).sort()).toEqual(
      ["accept", "authorization", "content-type"].sort()
    );
  });

  it("maps registration errors and rejects a different bound hash", async () => {
    await expect(
      client({
        status: 409,
        data: {
          error: {
            code: "REHEARSAL_RECEIPT_PENDING",
            message: "pending",
            requestId: "req-2",
          },
        },
      }).api.registerDeposit(
        fixtureCapability,
        fixtureOperationId,
        fixtureFundingHash
      )
    ).rejects.toMatchObject({
      code: "REHEARSAL_RECEIPT_PENDING",
      status: 409,
      requestId: "req-2",
    });
    await expect(
      client({
        status: 200,
        data: {
          operationId: fixtureOperationId,
          transactionHash: `0x${"b".repeat(64)}`,
          replayed: false,
        },
      }).api.registerDeposit(
        fixtureCapability,
        fixtureOperationId,
        fixtureFundingHash
      )
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("maps documented error bodies with request IDs and Retry-After", async () => {
    const { api } = client({
      status: 429,
      data: {
        error: { code: "RATE_LIMITED", message: "slow", requestId: "req-1" },
      },
      headers: { "retry-after": "7" },
    });
    await expect(api.getRoutes()).rejects.toMatchObject({
      code: "RATE_LIMITED",
      status: 429,
      requestId: "req-1",
      retryAfterMs: 7_000,
    });
  });

  it("falls back to the HTTP status for unknown codes and bodies", async () => {
    await expect(
      client({
        status: 503,
        data: { error: { code: "NEW_CODE", message: "x", requestId: "r" } },
      }).api.getRoutes()
    ).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", requestId: "r" });
    await expect(
      client({ status: 404, data: "<html>" }).api.getOperation(
        fixtureCapability,
        fixtureOperationId
      )
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
  });

  it("reports network failures and contract mismatches distinctly", async () => {
    await expect(client("offline").api.getRoutes()).rejects.toMatchObject({
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
  const create = () =>
    createIntentsMockApi({
      storage: () => storage,
      now: () => clock,
      latencyMs: 0,
      depositAddress: "0x000000000000000000000000000000000000dEaD",
      getScenario: () => scenario,
    });
  let storage = memoryStorage();
  // The mock USDT route is a fixed 1-token, zero-slippage rehearsal.
  const ONE = "1000000000000000000";
  const rehearsal = (overrides: Parameters<typeof request>[0] = {}) =>
    request({
      amountIn: ONE,
      slippageBps: 0,
      acceptedMinAmountOut: ONE,
      ...overrides,
    });
  const fund = async (api: ReturnType<typeof create>, id: string) => {
    await expect(
      api.registerDeposit(fixtureCapability, id, fixtureFundingHash)
    ).rejects.toMatchObject({ code: "REHEARSAL_RECEIPT_PENDING" });
    await api.registerDeposit(fixtureCapability, id, fixtureFundingHash);
  };
  beforeEach(() => {
    clock = Date.parse("2026-11-13T10:00:00Z");
    scenario = null;
    storage = memoryStorage();
  });

  it("replays the same scope and rejects a changed request for it", async () => {
    const api = create();
    const first = await api.createOperation(credentials, rehearsal());
    expect(first.replayed).toBe(false);
    expect(first.operation).toMatchObject({
      phase: "PREPARING_QUOTE",
      fundingStatus: "NOT_READY",
      fundingInstructions: null,
      revision: 1,
    });
    const again = await api.createOperation(credentials, rehearsal());
    expect(again).toMatchObject({ replayed: true });
    expect(again.operation.id).toBe(first.operation.id);
    await expect(
      api.createOperation(
        credentials,
        rehearsal({ amountIn: "3000000000000000000" })
      )
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_CONFLICT", status: 409 });
    // Same key under another capability is a separate scope.
    const other = await api.createOperation(
      { ...credentials, capability: "B".repeat(42) + "A" },
      rehearsal()
    );
    expect(other.operation.id).not.toBe(first.operation.id);
  });

  it("hides foreign operations behind 404", async () => {
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      rehearsal()
    );
    await expect(
      api.getOperation("B".repeat(42) + "A", created.id)
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
  });

  it("publishes exact instructions after quote preparation", async () => {
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      rehearsal()
    );
    clock += 1_500;
    const ready = await api.getOperation(fixtureCapability, created.id);
    expect(ready).toMatchObject({
      phase: "AWAITING_DEPOSIT",
      fundingStatus: "AVAILABLE",
      revision: 2,
    });
    expect(ready.fundingInstructions).toMatchObject({
      amount: rehearsal().amountIn,
      sourceChainId: fixtureRoute.sourceChainId,
      originAsset: fixtureRoute.originAsset,
      depositMemo: null,
    });
    // Rounded down to six-decimal FA2 precision, still 18-decimal units.
    expect(ready.fundingInstructions!.bridgeableMinAmountOut).toMatch(
      /000000000000$/
    );
  });

  it("serves metadata for the rehearsal and provider routes only", async () => {
    await expect(create().getMetadata()).resolves.toBe(mockIntentMetadata);
    expect(
      mockIntentMetadata.routes.map((item) => [item.routeId, item.mode])
    ).toEqual([
      ["mock-arb-sepolia-usdt", "rehearsal"],
      ["mock-sepolia-eth", "real"],
    ]);
  });

  it("rejects quotes in the reject scenario and validates admission", async () => {
    scenario = "reject";
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      rehearsal()
    );
    clock += 1_500;
    await expect(
      api.getOperation(fixtureCapability, created.id)
    ).resolves.toMatchObject({
      closure: "QUOTE_REJECTED",
      fundingInstructions: null,
    });
    scenario = null;
    const fresh = { ...credentials, idempotencyKey: "key-0002" };
    await expect(
      api.createOperation(fresh, rehearsal({ amountIn: "1" }))
    ).rejects.toMatchObject({ code: "AMOUNT_OUT_OF_RANGE" });
    await expect(
      api.createOperation(fresh, rehearsal({ slippageBps: 1 }))
    ).rejects.toMatchObject({ code: "SLIPPAGE_OUT_OF_RANGE" });
    await expect(
      api.createOperation(fresh, rehearsal({ acceptedMinAmountOut: "1" }))
    ).rejects.toMatchObject({ code: "MIN_OUTPUT_TOO_LOW" });
    await expect(
      api.createOperation(
        fresh,
        rehearsal({
          refundAddress: "0x4444444444444444444444444444444444444444",
        })
      )
    ).rejects.toMatchObject({ code: "REHEARSAL_SCOPE_MISMATCH", status: 409 });
    scenario = "unavailable";
    await expect(api.createOperation(fresh, rehearsal())).rejects.toMatchObject(
      {
        code: "DEPENDENCY_UNAVAILABLE",
        status: 503,
      }
    );
  });

  it("quotes the rehearsal 1:1 so the exact accepted minimum passes", async () => {
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      rehearsal()
    );
    clock += 1_500;
    const ready = await api.getOperation(fixtureCapability, created.id);
    expect(ready.fundingInstructions).toMatchObject({
      amount: ONE,
      amountOut: ONE,
      bridgeableMinAmountOut: ONE,
    });
  });

  it("registers a hash after a pending receipt, replays it, and refuses another", async () => {
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      rehearsal()
    );
    await expect(
      api.registerDeposit(fixtureCapability, created.id, fixtureFundingHash)
    ).rejects.toMatchObject({ code: "REHEARSAL_QUOTE_NOT_PUBLISHED" });
    clock += 1_500;
    await expect(
      api.registerDeposit(fixtureCapability, created.id, fixtureFundingHash)
    ).rejects.toMatchObject({
      code: "REHEARSAL_RECEIPT_PENDING",
      status: 409,
      retryAfterMs: 3_000,
    });
    await expect(
      api.registerDeposit(fixtureCapability, created.id, fixtureFundingHash)
    ).resolves.toEqual({ replayed: false });
    await expect(
      api.registerDeposit(fixtureCapability, created.id, fixtureFundingHash)
    ).resolves.toEqual({ replayed: true });
    await expect(
      api.registerDeposit(fixtureCapability, created.id, `0x${"b".repeat(64)}`)
    ).rejects.toMatchObject({ code: "REHEARSAL_DELIVERY_CONFLICT" });
    await expect(
      api.registerDeposit("B".repeat(42) + "A", created.id, fixtureFundingHash)
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("fails registration in the registrationConflict scenario", async () => {
    scenario = "registrationConflict";
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      rehearsal()
    );
    clock += 1_500;
    await api.getOperation(fixtureCapability, created.id);
    await expect(
      api.registerDeposit(fixtureCapability, created.id, fixtureFundingHash)
    ).rejects.toMatchObject({ code: "REHEARSAL_DELIVERY_CONFLICT" });
    clock += 60_000;
    const result = await api.getOperation(fixtureCapability, created.id);
    expect(result.fundingStatus).not.toBe("OBSERVED");
  });

  it("expires unfunded instructions without replacing the address", async () => {
    scenario = "expire";
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      rehearsal()
    );
    clock += 1_500 + 20_000;
    await expect(
      api.getOperation(fixtureCapability, created.id)
    ).resolves.toMatchObject({
      fundingStatus: "EXPIRED",
      fundingInstructions: null,
    });
  });

  it("runs the lifecycle to a confirmed settlement on the expected token", async () => {
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      rehearsal()
    );
    clock += 1_500;
    await api.getOperation(fixtureCapability, created.id);
    await fund(api, created.id);
    const seen = [];
    for (const step of [0, 3_000, 5_000, 4_000, 4_000, 6_000, 10_000]) {
      clock += step;
      seen.push(await api.getOperation(fixtureCapability, created.id));
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
      confirmedAmount: "1000000",
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
      const { operation: created } = await api.createOperation(
        credentials,
        rehearsal()
      );
      clock += 1_500;
      await api.getOperation(fixtureCapability, created.id);
      await fund(api, created.id);
      clock += 60_000;
      const result = await api.getOperation(fixtureCapability, created.id);
      expect(result.providerStatus).toBe(status);
      expect(result.phase).not.toBe("WRAPPED");
      if (name === "refund")
        expect(result.refund).toMatchObject({ status: "REPORTED" });
    }
  );

  it("keeps settlement NOT_TRACKED in the untracked scenario", async () => {
    scenario = "untracked";
    const api = create();
    const { operation: created } = await api.createOperation(
      credentials,
      rehearsal()
    );
    clock += 1_500;
    await api.getOperation(fixtureCapability, created.id);
    await fund(api, created.id);
    clock += 120_000;
    const result = await api.getOperation(fixtureCapability, created.id);
    expect(result.phase).toBe("WRAPPED");
    expect(result.settlement.status).toBe("NOT_TRACKED");
    expect(result.forwarding.bridgeEvents).toHaveLength(1);
  });
});
