/**
 * Self-service KYC registration, run on the server (Cloudflare Pages
 * Function). Same contract calls as Mavryk Wallet's "Get Pro": the registrar
 * key adds the caller's address as a KYC member, the user signs nothing.
 *
 * The registrar key is a runtime secret and never leaves the server. The
 * address comes only from RWA (/auth/me) for the caller's access token, so a
 * request cannot register someone else's address.
 */
import { MavrykToolkit } from "@mavrykdynamics/taquito";
import { InMemorySigner } from "@mavrykdynamics/taquito-signer";
import {
  validateAddress,
  ValidationResult,
} from "@mavrykdynamics/taquito-utils";
import { z } from "zod";

import { basenetNetRpcnode, RPC_NODE_CHAIN_IDS } from "~/consts/rpcNodes";

const RWA_TIMEOUT_MS = 5_000;
const MEMBERSHIP_TIER = "Starter";
const KYC_FIELD_PLACEHOLDER = "NIL";
const MEMBER_KYC_ACTION = "addMemberKyc";
const IMPLICIT_ADDRESS = /^mv[123]/;

export type KycConfig = {
  enabled: boolean;
  rwaApiUrl: string | undefined;
  kycContract: string | undefined;
  registrarKey: string | undefined;
  rpcUrl: string;
};

export type KycResult =
  | { status: "submitted"; opHash: string }
  | { status: "already-member" };

export type KycErrorCode =
  | "disabled"
  | "not-configured"
  | "unauthorized"
  | "rwa-unavailable"
  | "rpc-unavailable";

export class KycError extends Error {
  constructor(
    readonly code: KycErrorCode,
    message: string = code
  ) {
    super(message);
    this.name = "KycError";
  }
}

const STATUS_BY_CODE: Record<KycErrorCode, number> = {
  disabled: 404,
  "not-configured": 503,
  unauthorized: 401,
  "rwa-unavailable": 503,
  "rpc-unavailable": 503,
};

const AuthMeSchema = z.object({
  user_id: z.string().min(1),
  wallet_address: z.string().min(1),
});

export function getKycConfig(env: Partial<Env> | undefined): KycConfig {
  return {
    enabled: process.env.KYC_SELF_SERVICE_ENABLED === "true",
    rwaApiUrl: process.env.RWA_API,
    kycContract: process.env.KYC_CONTRACT?.trim() || undefined,
    registrarKey: env?.KYC_REGISTRAR_PRIVATE_KEY?.trim() || undefined,
    rpcUrl: basenetNetRpcnode,
  };
}

const isImplicitAddress = (address: string) =>
  IMPLICIT_ADDRESS.test(address) &&
  validateAddress(address) === ValidationResult.VALID;

/** The wallet RWA authenticates for `accessToken`, or a KycError. */
export async function fetchAuthenticatedWallet(
  accessToken: string,
  rwaApiUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<string> {
  let response: Response;

  try {
    response = await fetchImpl(new URL("auth/me", withSlash(rwaApiUrl)), {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(RWA_TIMEOUT_MS),
    });
  } catch {
    throw new KycError("rwa-unavailable");
  }

  if (response.status === 401 || response.status === 403) {
    throw new KycError("unauthorized");
  }
  if (!response.ok) throw new KycError("rwa-unavailable");

  const body = AuthMeSchema.safeParse(await response.json().catch(() => null));

  if (!body.success || !isImplicitAddress(body.data.wallet_address)) {
    throw new KycError("rwa-unavailable", "Unexpected /auth/me response");
  }

  return body.data.wallet_address;
}

const withSlash = (url: string) => (url.endsWith("/") ? url : `${url}/`);

type BigMap = { get: (key: string) => Promise<unknown> };
type KycStorage = { memberRegistrarLedger: BigMap; memberKycLedger: BigMap };

export type KycRegistry = {
  isMember: (address: string) => Promise<boolean>;
  register: (address: string) => Promise<string>;
};

const isCounterError = (error: unknown) =>
  error instanceof Error && /counter/i.test(error.message);

/** Reads and writes the KYC contract with the registrar key. */
export function createKycRegistry({
  rpcUrl,
  kycContract,
  registrarKey,
}: {
  rpcUrl: string;
  kycContract: string;
  registrarKey: string;
}): KycRegistry {
  const toolkit = new MavrykToolkit(rpcUrl);
  toolkit.setSignerProvider(new InMemorySigner(registrarKey));

  // Never sign for another network than the RPC node is meant for
  const checkChain = async () => {
    const expected =
      RPC_NODE_CHAIN_IDS[rpcUrl as keyof typeof RPC_NODE_CHAIN_IDS];
    const chainId = await toolkit.rpc.getChainId();

    if (!expected || chainId !== expected) {
      throw new KycError("rpc-unavailable", `Unexpected chain ${chainId}`);
    }
  };

  const send = async (address: string) => {
    const contract = await toolkit.contract.at(kycContract);
    const operation = await toolkit.contract
      .batch()
      .withContractCall(
        contract.methods.setMember([
          {
            updateType: "update",
            memberAddress: address,
            membershipTier: MEMBERSHIP_TIER,
          },
        ])
      )
      .withContractCall(
        contract.methods.setMemberKyc(MEMBER_KYC_ACTION, [
          {
            memberAddress: address,
            country: KYC_FIELD_PLACEHOLDER,
            region: KYC_FIELD_PLACEHOLDER,
            investorType: KYC_FIELD_PLACEHOLDER,
          },
        ])
      )
      .send();

    return operation.hash;
  };

  return {
    isMember: async (address) => {
      const contract = await toolkit.contract.at(kycContract);
      const storage = await contract.storage<KycStorage>();
      const [member, memberKyc] = await Promise.all([
        storage.memberRegistrarLedger.get(address),
        storage.memberKycLedger.get(address),
      ]);

      return Boolean(member && memberKyc);
    },
    register: async (address) => {
      await checkChain();

      try {
        return await send(address);
      } catch (error) {
        // Two registrations at once race for the registrar's counter
        if (isCounterError(error)) return send(address);
        throw error;
      }
    },
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });

const getBearerToken = (request: Request) => {
  const header = request.headers.get("Authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);

  return match?.[1] ?? null;
};

type HandleKycDeps = {
  fetchWallet?: (accessToken: string, rwaApiUrl: string) => Promise<string>;
  createRegistry?: typeof createKycRegistry;
};

/** POST /api/kyc */
export async function handleKycRequest(
  request: Request,
  config: KycConfig,
  {
    fetchWallet = fetchAuthenticatedWallet,
    createRegistry = createKycRegistry,
  }: HandleKycDeps = {}
): Promise<Response> {
  let address: string | null = null;

  try {
    if (!config.enabled) throw new KycError("disabled");
    if (!config.rwaApiUrl || !config.kycContract || !config.registrarKey) {
      throw new KycError("not-configured");
    }

    const accessToken = getBearerToken(request);
    if (!accessToken) throw new KycError("unauthorized");

    // The only source of the address: never the request body
    address = await fetchWallet(accessToken, config.rwaApiUrl);

    let registry: KycRegistry;

    try {
      registry = createRegistry({
        rpcUrl: config.rpcUrl,
        kycContract: config.kycContract,
        registrarKey: config.registrarKey,
      });
    } catch {
      // A malformed key: keep the signer's error (and the key) out of logs
      throw new KycError("not-configured", "Invalid registrar key");
    }

    let result: KycResult;

    try {
      result = (await registry.isMember(address))
        ? { status: "already-member" }
        : { status: "submitted", opHash: await registry.register(address) };
    } catch (error) {
      if (error instanceof KycError) throw error;
      throw new KycError(
        "rpc-unavailable",
        error instanceof Error ? error.message : String(error)
      );
    }

    if (result.status === "submitted") {
      console.info(`KYC registration sent for ${address}: ${result.opHash}`);
    }

    return json(result);
  } catch (error) {
    const kycError =
      error instanceof KycError
        ? error
        : new KycError("rpc-unavailable", String(error));

    // Never log the token or the key: only the address and the reason
    if (kycError.code !== "unauthorized" && kycError.code !== "disabled") {
      console.error(
        `KYC registration failed${address ? ` for ${address}` : ""}: ${kycError.message}`
      );
    }

    return json({ error: kycError.code }, STATUS_BY_CODE[kycError.code]);
  }
}
