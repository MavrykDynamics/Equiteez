import { describe, expect, it, vi } from "vitest";

import {
  fetchAuthenticatedWallet,
  handleKycRequest,
  KycError,
  type KycConfig,
  type KycRegistry,
} from "./kyc.server";

const WALLET = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const OTHER_WALLET = "mv1DXLvsp4T7X6gXLHn7szGN7WLooy14fQ3G";
const RWA_API = "https://rwa.example/api/v1";

const config: KycConfig = {
  enabled: true,
  rwaApiUrl: RWA_API,
  kycContract: "KT1KycContract",
  registrarKey: "edskTestOnly",
  rpcUrl: "https://basenet.rpc.mavryk.network",
};

const kycRequest = (headers: Record<string, string> = {}, body?: unknown) =>
  new Request("https://app.example/api/kyc", {
    method: "POST",
    headers: { Authorization: "Bearer access-token", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const registryWith = (overrides: Partial<KycRegistry> = {}) => {
  const registry: KycRegistry = {
    isMember: vi.fn().mockResolvedValue(false),
    register: vi.fn().mockResolvedValue("opHash123"),
    ...overrides,
  };

  return { registry, createRegistry: vi.fn(() => registry) };
};

const run = async (
  request: Request,
  {
    fetchWallet = vi.fn().mockResolvedValue(WALLET),
    registry = registryWith(),
    kycConfig = config,
  }: {
    fetchWallet?: (token: string, url: string) => Promise<string>;
    registry?: ReturnType<typeof registryWith>;
    kycConfig?: KycConfig;
  } = {}
) => {
  const response = await handleKycRequest(request, kycConfig, {
    fetchWallet,
    createRegistry: registry.createRegistry,
  });

  return { response, body: await response.json(), registry, fetchWallet };
};

describe("handleKycRequest", () => {
  it("registers the wallet RWA authenticates and returns the operation", async () => {
    const { response, body, registry, fetchWallet } = await run(kycRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(body).toEqual({ status: "submitted", opHash: "opHash123" });
    expect(fetchWallet).toHaveBeenCalledWith("access-token", RWA_API);
    expect(registry.registry.register).toHaveBeenCalledWith(WALLET);
  });

  it("ignores an address in the request body", async () => {
    const { registry } = await run(
      kycRequest({}, { address: OTHER_WALLET, memberAddress: OTHER_WALLET })
    );

    expect(registry.registry.register).toHaveBeenCalledWith(WALLET);
    expect(registry.registry.register).not.toHaveBeenCalledWith(OTHER_WALLET);
  });

  it("does not register an existing member again", async () => {
    const registry = registryWith({
      isMember: vi.fn().mockResolvedValue(true),
    });
    const { body } = await run(kycRequest(), { registry });

    expect(body).toEqual({ status: "already-member" });
    expect(registry.registry.register).not.toHaveBeenCalled();
  });

  it("rejects a request without a token before asking RWA", async () => {
    const fetchWallet = vi.fn();
    const { response, body, registry } = await run(
      new Request("https://app.example/api/kyc", { method: "POST" }),
      { fetchWallet }
    );

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "unauthorized" });
    expect(fetchWallet).not.toHaveBeenCalled();
    expect(registry.createRegistry).not.toHaveBeenCalled();
  });

  it.each([
    ["an invalid or revoked token", "unauthorized", 401],
    ["RWA being unavailable", "rwa-unavailable", 503],
  ] as const)("signs nothing on %s", async (_case, code, status) => {
    const { response, body, registry } = await run(kycRequest(), {
      fetchWallet: vi.fn().mockRejectedValue(new KycError(code)),
    });

    expect(response.status).toBe(status);
    expect(body).toEqual({ error: code });
    expect(registry.createRegistry).not.toHaveBeenCalled();
  });

  it("reports an RPC failure without leaking details", async () => {
    const registry = registryWith({
      register: vi.fn().mockRejectedValue(new Error("node down")),
    });
    const { response, body } = await run(kycRequest(), { registry });

    expect(response.status).toBe(503);
    expect(body).toEqual({ error: "rpc-unavailable" });
  });

  it("treats a malformed registrar key as not configured", async () => {
    const { response, body } = await run(kycRequest(), {
      registry: {
        ...registryWith(),
        createRegistry: vi.fn(() => {
          throw new Error("Invalid private key edskSECRET");
        }),
      },
    });

    expect(response.status).toBe(503);
    expect(body).toEqual({ error: "not-configured" });
  });

  it("is off unless enabled", async () => {
    const { response, body, fetchWallet } = await run(kycRequest(), {
      kycConfig: { ...config, enabled: false },
    });

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "disabled" });
    expect(fetchWallet).not.toHaveBeenCalled();
  });

  it("needs the registrar key and the contract", async () => {
    const { response, body, fetchWallet } = await run(kycRequest(), {
      kycConfig: { ...config, registrarKey: undefined },
    });

    expect(response.status).toBe(503);
    expect(body).toEqual({ error: "not-configured" });
    expect(fetchWallet).not.toHaveBeenCalled();
  });
});

describe("fetchAuthenticatedWallet", () => {
  const respond = (status: number, body?: unknown) =>
    vi.fn().mockResolvedValue(
      new Response(body === undefined ? null : JSON.stringify(body), {
        status,
      })
    );

  it("asks /auth/me with the caller's token", async () => {
    const fetchImpl = respond(200, { user_id: "u1", wallet_address: WALLET });

    await expect(
      fetchAuthenticatedWallet("access-token", RWA_API, fetchImpl)
    ).resolves.toBe(WALLET);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe("https://rwa.example/api/v1/auth/me");
    expect(init.headers).toEqual({ Authorization: "Bearer access-token" });
  });

  it.each([401, 403])("treats %s as an invalid token", async (status) => {
    await expect(
      fetchAuthenticatedWallet("t", RWA_API, respond(status))
    ).rejects.toMatchObject({ code: "unauthorized" });
  });

  it("fails closed on errors and malformed answers", async () => {
    await expect(
      fetchAuthenticatedWallet("t", RWA_API, respond(500))
    ).rejects.toMatchObject({ code: "rwa-unavailable" });
    await expect(
      fetchAuthenticatedWallet(
        "t",
        RWA_API,
        vi.fn().mockRejectedValue(new Error("timeout"))
      )
    ).rejects.toMatchObject({ code: "rwa-unavailable" });
    await expect(
      fetchAuthenticatedWallet(
        "t",
        RWA_API,
        respond(200, { user_id: "u1", wallet_address: "KT1notAWallet" })
      )
    ).rejects.toMatchObject({ code: "rwa-unavailable" });
  });
});
