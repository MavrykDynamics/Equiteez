import { BaseError, UserRejectedRequestError } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntentsApiError, type IntentsApi } from "~/lib/apis/intents";
import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";
import { classifyIntentFundingError } from "./intentFunding";
import { sendIntentHint } from "./intentHints";
import { createIntentRecord } from "./intentOperation";
import {
  fixtureRecipient,
  fixtureSource,
  memoryStorage,
  operation,
} from "./intents.fixtures";

const hash = `0x${"a".repeat(64)}` as const;
let session: IntentOperations;

beforeEach(() => {
  session = new IntentOperations(fixtureRecipient, "mock", () =>
    memoryStorage()
  );
  const record = createIntentRecord({
    localId: "local-1",
    account: fixtureRecipient,
    env: "mock",
    route: mockIntentRoutes[0],
    amountIn: "1",
    sourceAddress: fixtureSource,
  });
  session.upsert({
    ...record,
    operationId: "op-1",
    fundingState: "broadcast",
    sourceHashes: [hash],
    hintState: "pending",
  });
});

const api = (submitDeposit: IntentsApi["submitDeposit"]) =>
  ({ env: "mock", submitDeposit }) as IntentsApi;
const sleep = vi.fn(async () => undefined);

describe("deposit hint", () => {
  it("retries with backoff and records success with the backend snapshot", async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new IntentsApiError("network", "offline"))
      .mockResolvedValueOnce(
        operation({
          version: 1,
          updatedAt: "2026-11-13T10:01:00.000Z",
          status: "deposit_detected",
          sourceTxHash: hash,
        })
      );
    await sendIntentHint(api(submit), session, "local-1", {
      delays: [5, 10],
      sleep,
    });
    expect(submit).toHaveBeenCalledTimes(2);
    expect(submit).toHaveBeenCalledWith("op-1", hash);
    expect(sleep).toHaveBeenCalledWith(5);
    expect(session.get("local-1")).toMatchObject({
      hintState: "sent",
      backend: { status: "deposit_detected" },
    });
  });

  it("gives up as failed without blocking or resending funds", async () => {
    const submit = vi
      .fn()
      .mockRejectedValue(new IntentsApiError("internal", ""));
    await sendIntentHint(api(submit), session, "local-1", {
      delays: [1, 1],
      sleep,
    });
    expect(submit).toHaveBeenCalledTimes(3);
    expect(session.get("local-1")).toMatchObject({
      hintState: "failed",
      fundingState: "broadcast",
    });
  });

  it("runs one loop per operation and skips already-sent hints", async () => {
    const submit = vi.fn(async () => operation());
    await Promise.all([
      sendIntentHint(api(submit), session, "local-1", { delays: [], sleep }),
      sendIntentHint(api(submit), session, "local-1", { delays: [], sleep }),
    ]);
    await sendIntentHint(api(submit), session, "local-1", {
      delays: [],
      sleep,
    });
    expect(submit).toHaveBeenCalledOnce();
  });
});

describe("funding error classification", () => {
  it.each([
    [new UserRejectedRequestError(new Error("x")), "rejected"],
    [
      new BaseError("wrapped", {
        cause: new UserRejectedRequestError(new Error("x")),
      }),
      "rejected",
    ],
    [
      Object.assign(new Error("x"), { name: "ConnectorNotConnectedError" }),
      "not_sent",
    ],
    [new Error("RPC timeout"), "unknown"],
    ["weird", "unknown"],
  ])("%s → %s", (error, expected) => {
    expect(classifyIntentFundingError(error)).toBe(expected);
  });
});
