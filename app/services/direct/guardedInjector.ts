/**
 * Injector that records the operation hash before the operation reaches the
 * network (docs/dynamic-wallet.md §9.2, DYN-FE-10).
 *
 * Taquito calls it after signing and a successful preapply, so anything that
 * fails before inject() was never broadcast. Once inject() starts, a lost
 * response leaves the attempt "unknown" with its hash: only a receipt can
 * resolve it, and nothing is re-signed.
 */
import type { Injector, MavrykToolkit } from "@mavrykdynamics/taquito";
import { LocalForger } from "@mavrykdynamics/taquito-local-forging";
import {
  b58cencode,
  encodeOpHash,
  Prefix,
  prefix,
} from "@mavrykdynamics/taquito-utils";

import type { DirectAttempt } from "./attempt.types";
import type { AttemptStore } from "./attemptStore";

const SIGNATURE_HEX_LENGTH = 128;
const BRANCH_HEX_LENGTH = 64;

/** Refuses to broadcast an operation that is not part of a tracked attempt. */
export class UntrackedBroadcastError extends Error {
  constructor() {
    super("Refusing to send an untracked operation.");
    this.name = "UntrackedBroadcastError";
  }
}

/** The node may or may not have the operation: wait for its receipt. */
export class BroadcastOutcomeUnknownError extends Error {
  constructor(
    public readonly opHash: string,
    cause?: unknown
  ) {
    super(
      "The network did not confirm receiving your transaction. It may still go through; check its status before trying again."
    );
    this.name = "BroadcastOutcomeUnknownError";
    this.cause = cause;
  }
}

/** Holds the attempt the toolkit is currently submitting. */
export type ActiveAttemptSlot = { current: DirectAttempt | null };

/**
 * The node answered with an error, so it did not take the operation. Gateway
 * failures and timeouts may have been forwarded, so they stay unknown.
 */
export function isDefiniteNodeRejection(error: unknown): boolean {
  const { status, body } = (error ?? {}) as {
    status?: unknown;
    body?: unknown;
  };

  if (typeof status !== "number") return false;
  if (status >= 400 && status < 500) return status !== 408;
  if (status !== 500 || typeof body !== "string") return false;

  try {
    const errors: unknown = JSON.parse(body);

    return (
      Array.isArray(errors) &&
      errors.some(
        (entry) => typeof (entry as { id?: unknown } | null)?.id === "string"
      )
    );
  } catch {
    return false;
  }
}

type GuardedInjectorOptions = {
  injectOperation: (signedBytes: string) => Promise<string>;
  store: AttemptStore;
  slot: ActiveAttemptSlot;
  /** Throws if the wallet/session changed since the attempt started */
  assertCurrent?: () => void;
  forger?: Pick<LocalForger, "parse">;
};

export class GuardedInjector implements Injector {
  private readonly forger: Pick<LocalForger, "parse">;

  constructor(private readonly options: GuardedInjectorOptions) {
    this.forger = options.forger ?? new LocalForger();
  }

  async inject(signedBytes: string): Promise<string> {
    const { store, slot, assertCurrent, injectOperation } = this.options;
    const attempt = slot.current;

    if (!attempt) throw new UntrackedBroadcastError();
    assertCurrent?.();

    const opHash = encodeOpHash(signedBytes);
    const { branch, counterRange } = await this.describe(signedBytes);

    // Persisted before the network call; a failure here stops the broadcast
    store.update(attempt.attemptId, {
      phase: "broadcasting",
      ref: { mode: "mvrk", opHash },
      branch,
      counterRange,
    });
    store.setRetryBytes(attempt.attemptId, signedBytes);

    let returnedHash: string;

    try {
      returnedHash = await injectOperation(signedBytes);
    } catch (error) {
      if (isDefiniteNodeRejection(error)) {
        store.update(attempt.attemptId, {
          phase: "rejected",
          rejectReason: "node",
          error: describeError(error),
        });
        throw error;
      }

      store.update(attempt.attemptId, {
        phase: "unknown",
        error: describeError(error),
      });
      throw new BroadcastOutcomeUnknownError(opHash, error);
    }

    if (returnedHash !== opHash) {
      store.update(attempt.attemptId, {
        phase: "unknown",
        error: "Node returned a different operation hash",
      });
      throw new BroadcastOutcomeUnknownError(opHash);
    }

    store.update(attempt.attemptId, { phase: "injected" });
    return opHash;
  }

  /** Branch and counters for reconciliation; best effort, never blocks. */
  private async describe(signedBytes: string) {
    const branch = b58cencode(
      signedBytes.slice(0, BRANCH_HEX_LENGTH),
      prefix[Prefix.B]
    );

    try {
      const { contents } = await this.forger.parse(
        signedBytes.slice(0, -SIGNATURE_HEX_LENGTH)
      );
      const counters = contents
        .map((content) => ("counter" in content ? content.counter : null))
        .filter((counter): counter is string => typeof counter === "string");

      return {
        branch,
        counterRange:
          counters.length > 0
            ? ([counters[0], counters[counters.length - 1]] as [string, string])
            : undefined,
      };
    } catch {
      return { branch, counterRange: undefined };
    }
  }
}

export function describeError(error: unknown): string {
  if (error instanceof Error)
    return `${error.name}: ${error.message}`.slice(0, 300);
  return String(error).slice(0, 300);
}

export function attachGuardedInjector(
  toolkit: MavrykToolkit,
  options: Omit<GuardedInjectorOptions, "injectOperation">
) {
  toolkit.setInjectorProvider(
    new GuardedInjector({
      ...options,
      injectOperation: (signedBytes) =>
        toolkit.rpc.injectOperation(signedBytes),
    })
  );
}
