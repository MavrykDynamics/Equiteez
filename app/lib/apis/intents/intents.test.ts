import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createIntentsHttpApi } from "./intents.http";
import { createIntentsMockApi, type IntentsMockScenario } from "./intents.mock";
import { IntentsApiError } from "./intents.types";

const recipient = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const source = "0x1111111111111111111111111111111111111111" as const;
const deposit = "0x2222222222222222222222222222222222222222" as const;
const hash = `0x${"a".repeat(64)}` as const;

const operation = {
  id: "op-1",
  version: 0,
  updatedAt: "2026-11-13T10:00:00.000Z",
  routeId: "arb-sepolia-usdt",
  recipient,
  sourceAddress: source,
  amountIn: "1000000000000000000",
  amountOut: "997000",
  minAmountOut: "987030",
  quoteExpiresAt: "2026-11-13T10:10:00.000Z",
  funding: {
    chainId: 421614,
    depositAddress: deposit,
    token: "0x5C05e82bE66B19476bAcb558E62e7d449b98635F",
    amount: "1000000000000000000",
  },
  status: "awaiting_deposit",
};

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("HTTP client", () => {
  type Reply = { status: number; data: unknown } | "offline";
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
          headers: {},
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
      api: createIntentsHttpApi(
        "https://intents.test/",
        "env",
        undefined,
        instance
      ),
      requests,
    };
  }

  it("sends the idempotency key and never the Equiteez RWA token", async () => {
    const { api, requests } = client({ status: 200, data: operation });
    const result = await api.createOperation({
      routeId: "arb-sepolia-usdt",
      amountIn: "1",
      recipient,
      sourceAddress: source,
      idempotencyKey: "local-1",
    });
    expect(result.id).toBe("op-1");
    expect(requests[0].url).toBe("https://intents.test/v1/operations");
    expect(requests[0].headers["Idempotency-Key"]).toBe("local-1");
    expect(requests[0].headers.Authorization).toBeUndefined();
    expect(requests[0].withCredentials).toBe(false);
    expect(JSON.parse(requests[0].data)).not.toHaveProperty("idempotencyKey");
  });

  it.each([
    [
      {
        status: 409,
        data: { error: { code: "destination_busy", message: "Busy" } },
      },
      "destination_busy",
    ],
    [{ status: 403, data: "<html>" }, "unauthorized"],
    [{ status: 429, data: {} }, "rate_limited"],
    [{ status: 503, data: {} }, "internal"],
    ["offline", "network"],
    [
      { status: 200, data: { ...operation, status: "minted" } },
      "invalid_response",
    ],
  ] as const)("maps %j to %s", async (reply, code) => {
    const { api } = client(reply as Reply);
    await expect(api.getOperation("op-1")).rejects.toMatchObject({ code });
  });

  it("lowercases hashes and rejects malformed routes", async () => {
    const upper = `0x${"A".repeat(64)}`;
    const { api } = client({
      status: 200,
      data: { ...operation, sourceTxHash: upper },
    });
    expect((await api.getOperation("op-1")).sourceTxHash).toBe(
      upper.toLowerCase()
    );
    const bad = client({ status: 200, data: { routes: [{ id: "x" }] } });
    await expect(bad.api.getRoutes()).rejects.toBeInstanceOf(IntentsApiError);
  });

  it("reports an unconfigured service as unavailable", async () => {
    const api = createIntentsHttpApi("", "unconfigured");
    await expect(api.getRoutes()).rejects.toMatchObject({ code: "network" });
  });
});

describe("mock backend", () => {
  let now = Date.parse("2026-11-13T10:00:00.000Z");
  let scenario: IntentsMockScenario | null = null;
  let storage = memoryStorage();
  const api = () =>
    createIntentsMockApi({
      storage: () => storage,
      now: () => now,
      latencyMs: 0,
      depositAddress: deposit,
      getScenario: () => scenario,
    });
  const request = {
    routeId: "arb-sepolia-usdt",
    amountIn: "2000000000000000000",
    recipient,
    sourceAddress: source,
    idempotencyKey: "local-1",
  };

  beforeEach(() => {
    now = Date.parse("2026-11-13T10:00:00.000Z");
    scenario = null;
    storage = memoryStorage();
  });

  it("returns the same operation for the same idempotency key, across reloads", async () => {
    const first = await api().createOperation(request);
    const second = await api().createOperation(request);
    expect(second).toEqual(first);
    expect(first.funding).toMatchObject({
      depositAddress: deposit,
      amount: request.amountIn,
      chainId: 421614,
    });
    expect(first.amountOut).toBe("1994000");
  });

  it("advances monotonically only after a deposit hint", async () => {
    const mock = api();
    const { id } = await mock.createOperation(request);
    now += 60_000;
    expect((await mock.getOperation(id)).status).toBe("awaiting_deposit");
    await mock.submitDeposit(id, hash);
    await mock.submitDeposit(id, hash); // retry-safe
    const seen: string[] = [];
    let version = -1;
    for (let step = 0; step < 10; step++) {
      now += 4_000;
      const snapshot = await mock.getOperation(id);
      expect(snapshot.version).toBeGreaterThanOrEqual(version);
      version = snapshot.version;
      seen.push(snapshot.status);
    }
    expect(seen.at(-1)).toBe("wrapped");
    const wrapped = await mock.getOperation(id);
    expect(wrapped.sourceTxHash).toBe(hash);
    expect(wrapped.deliveryTxHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(wrapped.forwardTxHash).not.toBe(wrapped.sourceTxHash);
    expect(wrapped.forwardLogIndex).toBe(0);
  });

  it("expires an unfunded quote", async () => {
    scenario = "expire";
    const mock = api();
    const { id } = await mock.createOperation(request);
    now += 16_000;
    expect((await mock.getOperation(id)).status).toBe("expired");
  });

  it.each([
    ["sponsorship", "sponsorship_unavailable"],
    ["busy", "destination_busy"],
    ["below", "below_minimum"],
  ] as const)("rejects creation for %s", async (name, code) => {
    scenario = name;
    await expect(api().createOperation(request)).rejects.toMatchObject({
      code,
    });
  });

  it("blocks a second funded operation to the same recipient", async () => {
    const mock = api();
    const { id } = await mock.createOperation(request);
    await mock.submitDeposit(id, hash);
    await expect(
      mock.createOperation({ ...request, idempotencyKey: "local-2" })
    ).rejects.toMatchObject({ code: "destination_busy" });
  });

  it.each([
    ["refund", "refunded"],
    ["fail", "failed"],
  ] as const)("ends the %s scenario as %s", async (name, status) => {
    scenario = name;
    const mock = api();
    const { id } = await mock.createOperation(request);
    await mock.submitDeposit(id, hash);
    now += 60_000;
    const result = await mock.getOperation(id);
    expect(result.status).toBe(status);
    expect(result.forwardTxHash).toBeUndefined();
  });

  it("rejects amounts below the route minimum", async () => {
    await expect(
      api().getQuote({ ...request, amountIn: "1" })
    ).rejects.toMatchObject({ code: "below_minimum" });
  });

  it("keeps working when storage is blocked", async () => {
    storage = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("blocked");
      }),
    };
    const mock = api();
    const { id } = await mock.createOperation(request);
    expect((await mock.getOperation(id)).id).toBe(id);
  });
});
