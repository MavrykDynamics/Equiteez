import { queryOptions } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import { z } from "zod";
import { rwaApi } from "~/lib/apis/rwa/client";
import { RelayApiError, toRelayApiError } from "~/lib/relay/relay.errors";
import {
  relayAcceptedSchema,
  relayConfigSchema,
  relayCreditsSchema,
  relayListSchema,
  relayOperationSchema,
  relayStatusSchema,
  relaySubmitSchema,
  relayTopUpAcceptedSchema,
  relayTopUpSchema,
} from "./relay.schema";
import type {
  RelayConfig,
  RelayConfigResult,
  RelayListOptions,
  RelaySubmitRequest,
  RelayTopUpRequest,
} from "./relay.types";

const timeout = 15_000;
const disabledConfig: RelayConfig = {
  enabled: false,
  fee: { enabled: false },
  contracts: [],
  gaslessThresholdMumav: "0",
};
const walletPath = (wallet: string) =>
  `/wallets/${encodeURIComponent(z.string().min(1).parse(wallet))}/relay`;
async function request<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toRelayApiError(error);
  }
}
export async function fetchRelayConfig(
  signal?: AbortSignal
): Promise<RelayConfigResult> {
  try {
    const { data } = await rwaApi.get("/relay/config", { signal, timeout });
    const parsed = relayConfigSchema.safeParse(data);
    return parsed.success
      ? { state: "ready", config: parsed.data }
      : { state: "disabled", config: disabledConfig, reason: "malformed" };
  } catch (error) {
    const failure = toRelayApiError(error);
    return {
      state: "disabled",
      config: disabledConfig,
      reason: failure.status === 404 ? "not-found" : "unavailable",
    };
  }
}
// Caller supplies the API/network scope defined in docs/gasless-trading.md.
// There is no global module cache that could leak across environments.
export function relayConfigQueryOptions(scope: string) {
  return queryOptions({
    queryKey: ["relay", scope, "config"],
    queryFn: ({ signal }) => fetchRelayConfig(signal),
    staleTime: 60_000,
    retry: false,
  });
}
export function submitRelayOperation(
  wallet: string,
  input: RelaySubmitRequest,
  signal?: AbortSignal
) {
  return request(async () => {
    const payload = relaySubmitSchema.parse(input);
    // Suppress the shared client's 401 POST replay. The lifecycle owner handles
    // authentication recovery and exact-payload retries after durable capture.
    const config = { signal, timeout, _retry: true };
    const { data } = await rwaApi.post(
      `${walletPath(wallet)}/operations`,
      payload,
      config
    );
    return relayAcceptedSchema.parse(data);
  });
}
async function readRelayOperation(
  wallet: string,
  operationId: string,
  fresh: boolean,
  signal?: AbortSignal
) {
  return request(async () => {
    const id = z.string().uuid().parse(operationId);
    const { data, headers } = await rwaApi.get(
      `${walletPath(wallet)}/operations/${id}`,
      { signal, timeout, params: fresh ? { fresh: 1 } : undefined }
    );
    const operation = relayOperationSchema.parse(data);
    if (operation.operationId !== id)
      throw new RelayApiError(undefined, "OPERATION_ID_MISMATCH", "give-up");
    return {
      operation,
      cacheBypass:
        typeof headers["x-cache-bypass"] === "string"
          ? headers["x-cache-bypass"]
          : undefined,
    };
  });
}
export const fetchRelayOperation = (
  wallet: string,
  operationId: string,
  signal?: AbortSignal
) => readRelayOperation(wallet, operationId, false, signal);
export const checkRelayOperationNow = (
  wallet: string,
  operationId: string,
  signal?: AbortSignal
) => readRelayOperation(wallet, operationId, true, signal);
const listOptionsSchema = z.object({
  status: z.array(z.union([relayStatusSchema, z.literal("open")])).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});
export function fetchRelayOperations(
  wallet: string,
  options: RelayListOptions = {},
  signal?: AbortSignal
) {
  return request(async () => {
    const parsed = listOptionsSchema.parse(options);
    const { data } = await rwaApi.get(`${walletPath(wallet)}/operations`, {
      signal,
      timeout,
      params: { ...parsed, status: parsed.status?.join(",") },
    });
    return relayListSchema.parse(data);
  });
}
export function fetchRelayCredits(
  wallet: string,
  config: RelayConfig,
  signal?: AbortSignal
) {
  return request(async () => {
    if (!config.fee.enabled) return { enabled: false } as const;
    const { data } = await rwaApi.get(`${walletPath(wallet)}/fee/credits`, {
      signal,
      timeout,
    });
    const credits = relayCreditsSchema.parse(data);
    if (credits.enabled && credits.signerAddress !== wallet)
      throw new RelayApiError(undefined, "SIGNER_MISMATCH", "give-up");
    return credits;
  });
}
export function submitRelayTopUp(
  wallet: string,
  input: RelayTopUpRequest,
  config: RelayConfig,
  signal?: AbortSignal
) {
  return request(async () => {
    if (!config.enabled || !config.fee.enabled)
      throw new RelayApiError(undefined, "FEE_DISABLED", "give-up");
    const payload = relayTopUpSchema.parse(input);
    const amount = new BigNumber(payload.amountUnits);
    if (
      amount.lt(config.fee.topUpMinUnits) ||
      amount.gt(config.fee.topUpMaxUnits)
    )
      throw new RelayApiError(undefined, "AMOUNT_OUT_OF_BOUNDS", "give-up");
    const options = { signal, timeout, _retry: true };
    const { data } = await rwaApi.post(
      `${walletPath(wallet)}/fee/top-up`,
      payload,
      options
    );
    const accepted = relayTopUpAcceptedSchema.parse(data);
    if (
      accepted.signerAddress !== wallet ||
      accepted.amountUnits !== payload.amountUnits
    )
      throw new RelayApiError(
        undefined,
        "TOP_UP_ACCEPTANCE_MISMATCH",
        "give-up"
      );
    return accepted;
  });
}
