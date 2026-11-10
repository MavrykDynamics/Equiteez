import { describe, expect, it, vi } from "vitest";
import { BigNumber } from "bignumber.js";
import type { MavrykToolkit } from "@mavrykdynamics/taquito";

import { confirmWalletOperation, sendAndConfirmBatch } from "./execution";
import { classifyContractActionError } from "./hooks/contractActionError";

const applied = { metadata: { operation_result: { status: "applied" } } };

const sentOperation = (results: unknown[] | undefined = [applied]) => ({
  opHash: "ooHash",
  confirmation: vi.fn(async () => ({ block: { header: { level: 42 } } })),
  operationResults: vi.fn(async () => results as never),
});

describe("confirmWalletOperation", () => {
  it("reports the hash on submit and the level once every result applied", async () => {
    const onTransactionSubmitted = vi.fn();
    const onTransactionConfirmed = vi.fn();

    await expect(
      confirmWalletOperation(sentOperation([applied, applied]), {
        onTransactionSubmitted,
        onTransactionConfirmed,
      })
    ).resolves.toEqual({ opHash: "ooHash", level: 42 });
    expect(onTransactionSubmitted).toHaveBeenCalledWith({ opHash: "ooHash" });
    expect(onTransactionConfirmed).toHaveBeenCalledWith({
      level: 42,
      opHash: "ooHash",
    });
  });

  it("fails an included operation whose internal operation failed", async () => {
    const onTransactionConfirmed = vi.fn();
    const operation = sentOperation([
      applied,
      {
        metadata: {
          operation_result: { status: "applied" },
          internal_operation_results: [
            {
              result: {
                status: "failed",
                errors: [{ id: "proto.michelson_v1.script_rejected" }],
              },
            },
          ],
        },
      },
    ]);

    await expect(
      confirmWalletOperation(operation, { onTransactionConfirmed })
    ).rejects.toMatchObject({
      name: "OperationFailedOnChainError",
      opHash: "ooHash",
      message: expect.stringContaining("script_rejected"),
    });
    expect(onTransactionConfirmed).not.toHaveBeenCalled();
  });

  it("keeps the outcome unknown when the inclusion level is missing", async () => {
    const onTransactionConfirmed = vi.fn();
    const operation = sentOperation();
    operation.confirmation.mockResolvedValue(undefined as never);

    await expect(
      confirmWalletOperation(operation, { onTransactionConfirmed })
    ).rejects.toMatchObject({ name: "OperationOutcomeUnknownError" });
    expect(onTransactionConfirmed).not.toHaveBeenCalled();
  });

  it("keeps the outcome unknown when results cannot be read", async () => {
    const operation = sentOperation();
    operation.operationResults.mockResolvedValue(undefined as never);

    await expect(confirmWalletOperation(operation)).rejects.toMatchObject({
      name: "OperationOutcomeUnknownError",
    });
  });
});

describe("sendAndConfirmBatch", () => {
  const toolkit = ({
    balanceMumav,
    estimateError,
  }: {
    balanceMumav: number;
    estimateError?: Error;
  }) => {
    const send = vi.fn(async () => sentOperation());

    return {
      send,
      tezos: {
        wallet: {
          pkh: vi.fn(async () => "mv1source"),
          batch: vi.fn(() => ({ send })),
        },
        estimate: {
          batch: vi.fn(async () => {
            if (estimateError) throw estimateError;
            // reveal + call: fees and burn are summed
            return [
              { suggestedFeeMumav: 400, burnFeeMumav: 0 },
              { suggestedFeeMumav: 1100, burnFeeMumav: 64250 },
            ];
          }),
        },
        mv: { getBalance: vi.fn(async () => new BigNumber(balanceMumav)) },
      } as unknown as MavrykToolkit,
    };
  };
  const batch = [{ kind: "transaction", to: "KT1", amount: 0 }] as never;

  it("checks the MVRK budget, including reveal and burn, before sending", async () => {
    const short = toolkit({ balanceMumav: 65_749 });

    await expect(
      sendAndConfirmBatch(short.tezos, batch, {
        execution: { checkNativeBudget: true },
      })
    ).rejects.toMatchObject({
      name: "InsufficientMvrkError",
      requiredMumav: new BigNumber(65_750),
    });
    expect(short.send).not.toHaveBeenCalled();

    const enough = toolkit({ balanceMumav: 65_750 });
    await sendAndConfirmBatch(enough.tezos, batch, {
      execution: { checkNativeBudget: true },
    });
    expect(enough.send).toHaveBeenCalledOnce();
  });

  it("treats a failed estimate as an error, not as zero cost", async () => {
    const failing = toolkit({
      balanceMumav: 10 ** 9,
      estimateError: new Error("estimate failed"),
    });

    await expect(
      sendAndConfirmBatch(failing.tezos, batch, {
        execution: { checkNativeBudget: true },
      })
    ).rejects.toThrow("estimate failed");
    expect(failing.send).not.toHaveBeenCalled();
  });

  it("leaves fee review to extension wallets", async () => {
    const extension = toolkit({ balanceMumav: 0 });

    await sendAndConfirmBatch(extension.tezos, batch);
    expect(extension.tezos.estimate.batch).not.toHaveBeenCalled();
    expect(extension.send).toHaveBeenCalledOnce();
  });
});

describe("classifyContractActionError", () => {
  const named = (name: string) =>
    Object.assign(new Error(name), { name }) as Error;

  it.each([
    [named("ActionInProgressError"), false, "in-progress"],
    [named("UnresolvedAttemptError"), false, "still-processing"],
    [named("BroadcastOutcomeUnknownError"), false, "still-processing"],
    [named("OperationOutcomeUnknownError"), true, "still-processing"],
    [named("OperationFailedOnChainError"), true, "error"],
    [named("InsufficientMvrkError"), false, "error"],
    [new Error("confirmation timed out"), true, "still-processing"],
    [named("AbortedBeaconError"), false, "abort"],
    [new Error("simulation failed"), false, "error"],
  ])("%s (submitted=%s) → %s", (error, hasSubmitted, expected) => {
    expect(classifyContractActionError(error, { hasSubmitted })).toBe(expected);
  });
});
