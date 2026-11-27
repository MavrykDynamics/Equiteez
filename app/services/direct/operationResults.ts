/**
 * Reads the outcome of an included operation from its RPC results.
 *
 * Taquito's WalletOperation.status() only looks at the first content, so in
 * an add_operator → order → remove_operator batch a failed order would pass.
 * An operation succeeded only if every manager result and every internal
 * operation result is "applied" (docs/dynamic-wallet.md §8.7 step 7).
 */

type ResultStatus = "applied" | "failed" | "backtracked" | "skipped" | string;

type ContentWithResult = {
  kind?: string;
  metadata?: {
    operation_result?: { status?: ResultStatus; errors?: unknown[] };
    internal_operation_results?: {
      result?: { status?: ResultStatus; errors?: unknown[] };
    }[];
  };
};

export type OperationOutcome =
  | { status: "applied" }
  | { status: "failed"; reason: string }
  | { status: "not-found" };

/** The operation was included but did not take effect (fees may be spent). */
export class OperationFailedOnChainError extends Error {
  constructor(
    public readonly opHash: string,
    reason: string
  ) {
    super(`The transaction failed on chain (${reason}). It had no effect.`);
    this.name = "OperationFailedOnChainError";
  }
}

/** Sent, but its result could not be read yet: it may still go through. */
export class OperationOutcomeUnknownError extends Error {
  constructor(
    public readonly opHash: string,
    cause?: unknown
  ) {
    super(
      "Your transaction was sent, but its result is not available yet. Check its status before trying again."
    );
    this.name = "OperationOutcomeUnknownError";
    this.cause = cause;
  }
}

function errorId(errors: unknown[] | undefined) {
  const id = (errors?.[errors.length - 1] as { id?: unknown } | undefined)?.id;
  return typeof id === "string" ? id : undefined;
}

export function inspectOperationResults(
  contents: readonly unknown[] | undefined
): OperationOutcome {
  const results = ((contents ?? []) as readonly ContentWithResult[]).flatMap(
    (content) => {
      const metadata = content.metadata;

      return [
        metadata?.operation_result,
        ...(metadata?.internal_operation_results ?? []).map(
          (internal) => internal.result
        ),
      ];
    }
  );

  if (results.length === 0) return { status: "not-found" };

  const notApplied = results.find((result) => result?.status !== "applied");

  if (!notApplied) return { status: "applied" };

  return {
    status: "failed",
    reason:
      errorId(notApplied?.errors) ?? notApplied?.status ?? "missing result",
  };
}
