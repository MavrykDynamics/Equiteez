import type { Chunk, Payout, RefundRun } from "./model";

export class RefundFailure extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}
export interface RefundPorts {
  assertScope(): Promise<void>;
  sign(chunk: Chunk): Promise<Record<string, unknown>>;
  submit(request: Record<string, unknown>): Promise<{ operationId: string }>;
  send(chunk: Chunk): Promise<string>;
  relay(id: string): Promise<{
    status: string;
    opHash?: string | null;
    error?: { code: string; message: string } | null;
  }>;
  chain(
    hash: string,
    chunk: Chunk
  ): Promise<{
    state: "pending" | "applied" | "failed";
    level?: number;
    payouts?: Payout[];
  }>;
  indexed(level: number): Promise<boolean>;
  persist(run: RefundRun): void;
  pause(): Promise<void>;
}

// One caller owns a run (the UI uses a cross-tab Web Lock). Every side effect
// has a durable marker first. A timeout never resets a chunk to ready.
export async function executeRun(
  run: RefundRun,
  ports: RefundPorts,
  allowNewSubmissions = true
): Promise<void> {
  for (const chunk of run.chunks) {
    if (chunk.state === "confirmed") continue;
    if (chunk.state === "failed")
      throw new RefundFailure(
        chunk.error ?? "FAILED",
        "This part failed. Refresh the remaining balances before trying again."
      );
    await ports.assertScope();
    if (
      !allowNewSubmissions &&
      (chunk.state === "ready" || chunk.state === "signed")
    ) {
      throw new Error(
        "New refunds are paused. Confirmed progress is saved; existing submissions can still be checked."
      );
    }
    if (chunk.state === "unknown" && !chunk.hash)
      throw new RefundFailure(
        "UNKNOWN_RESULT",
        "The wallet result is unknown. Enter its transaction hash to check it before continuing."
      );
    if (chunk.state === "ready") {
      chunk.state = "signing";
      ports.persist(run);
      try {
        if (run.mode === "credits") {
          chunk.request = await ports.sign(chunk);
          chunk.state = "signed";
        } else {
          chunk.hash = await ports.send(chunk);
          chunk.state = "submitted";
        }
        ports.persist(run);
      } catch (error) {
        chunk.state =
          run.mode === "credits" || error instanceof RefundFailure
            ? "failed"
            : "unknown";
        chunk.error =
          error instanceof RefundFailure ? error.code : "UNKNOWN_RESULT";
        ports.persist(run);
        throw error;
      }
    }
    if (chunk.state === "signed" || chunk.state === "submitting") {
      if (!chunk.request)
        throw new Error(
          "Saved permit is missing. Do not sign a replacement until the previous result is resolved."
        );
      await ports.assertScope();
      chunk.state = "submitting";
      ports.persist(run);
      try {
        const response = await ports.submit(chunk.request);
        chunk.operationId = response.operationId;
        chunk.state = "submitted";
        ports.persist(run);
      } catch (error) {
        // Only a definitive rejection is safe to replace. Lost responses retain
        // the exact request and its idempotency key for reconciliation.
        if (error instanceof RefundFailure) {
          chunk.state = "failed";
          chunk.error = error.code;
          ports.persist(run);
        }
        throw error;
      }
    }
    for (let attempts = 0; ; attempts++) {
      await ports.assertScope();
      if (attempts >= 200)
        throw new Error(
          "Still processing. You can close this panel and check the saved progress later."
        );
      if (run.mode === "credits" && chunk.operationId && !chunk.hash) {
        const op = await ports.relay(chunk.operationId);
        if (op.status === "failed" || op.status === "rejected") {
          const code = op.error?.code ?? "FAILED";
          // Legacy backend transport failures cannot prove non-execution.
          const ambiguous = [
            "RELAY_SUBMIT_FAILED",
            "RELAY_SUBMIT_LOST",
            "OPERATION_LOST",
          ].includes(code);
          chunk.state = ambiguous ? "unknown" : "failed";
          chunk.error = code;
          ports.persist(run);
          throw new RefundFailure(
            ambiguous ? "UNKNOWN_RESULT" : code,
            op.error?.message ?? "Refund failed"
          );
        }
        if (op.status === "confirmed" && op.opHash) {
          chunk.hash = op.opHash;
          ports.persist(run);
        }
      }
      if (chunk.hash) {
        const result = await ports.chain(chunk.hash, chunk);
        if (result.state === "failed") {
          chunk.state = "failed";
          chunk.error = "CHAIN_REJECTED";
          ports.persist(run);
          throw new RefundFailure(
            "CHAIN_REJECTED",
            "The transaction failed on chain."
          );
        }
        if (result.state === "pending" && chunk.state === "applied") {
          chunk.state = "submitted";
          delete chunk.level;
          delete chunk.payouts;
          ports.persist(run);
        }
        if (result.state === "applied" && result.level) {
          chunk.level = result.level;
          chunk.payouts = result.payouts;
          chunk.state = "applied";
          ports.persist(run);
        }
      }
      if (
        chunk.state === "applied" &&
        chunk.level &&
        (await ports.indexed(chunk.level))
      ) {
        chunk.state = "confirmed";
        ports.persist(run);
        break;
      }
      await ports.pause();
    }
  }
}
