/**
 * The operation the app built and the user reviewed, checked against the
 * bytes an embedded wallet is about to sign (docs/dynamic-wallet.md §3.6,
 * §8.7 step 3, DYN-FE-09). An embedded signer shows no operation details, so
 * the app refuses to sign anything that differs from what it prepared.
 */
import { BigNumber } from "bignumber.js";

import { stableStringify } from "./fingerprint";

const MUMAV_PER_MVRK = 1_000_000;

export type ExpectedTransfer = {
  to: string;
  amount?: number | string;
  /** True when `amount` is already in mumav */
  mumav?: boolean;
  parameter?: { entrypoint: string; value: unknown };
};

type DecodedContent = {
  kind: string;
  destination?: string;
  amount?: string;
  parameters?: { entrypoint: string; value: unknown };
};

/** The bytes to sign differ from the reviewed operation. */
export class OperationMismatchError extends Error {
  constructor(reason: string) {
    super(
      `Refusing to sign: the transaction differs from what you reviewed (${reason}). Nothing was sent.`
    );
    this.name = "OperationMismatchError";
  }
}

type MichelsonNode = {
  prim?: string;
  args?: unknown[];
  [key: string]: unknown;
};

const isPair = (node: unknown): node is MichelsonNode =>
  typeof node === "object" &&
  node !== null &&
  !Array.isArray(node) &&
  (node as MichelsonNode).prim === "Pair" &&
  Array.isArray((node as MichelsonNode).args);

/**
 * One form for equal Michelson values: right-nested pairs are flattened
 * (Pair a (Pair b c) ≡ Pair a b c), since encoders and decoders may pick
 * either form.
 */
export function normalizeMichelson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeMichelson);
  if (typeof value !== "object" || value === null) return value;

  const node = value as MichelsonNode;
  const normalized: MichelsonNode = { ...node };

  if (Array.isArray(node.args)) {
    let args = node.args.map(normalizeMichelson);

    if (node.prim === "Pair") {
      while (args.length > 0 && isPair(args[args.length - 1])) {
        const last = args[args.length - 1] as MichelsonNode;
        args = [...args.slice(0, -1), ...(last.args ?? [])];
      }
    }

    normalized.args = args;
  }

  return normalized;
}

const toMumav = (transfer: ExpectedTransfer) => {
  const amount = new BigNumber(transfer.amount ?? 0);

  return (transfer.mumav ? amount : amount.times(MUMAV_PER_MVRK)).toFixed();
};

/**
 * Throws OperationMismatchError unless `contents` are the expected
 * transfers, in order, optionally preceded by the one reveal taquito adds for
 * an unrevealed account.
 */
export function assertMatchesExpectedOperation(
  contents: readonly DecodedContent[],
  expected: readonly ExpectedTransfer[]
) {
  const reveals = contents.findIndex((content) => content.kind !== "reveal");
  const revealCount = reveals === -1 ? contents.length : reveals;

  if (revealCount > 1) throw new OperationMismatchError("several reveals");

  const transactions = contents.slice(revealCount);

  if (transactions.some((content) => content.kind !== "transaction")) {
    throw new OperationMismatchError("unexpected operation kind");
  }
  if (transactions.length !== expected.length) {
    throw new OperationMismatchError(
      `${transactions.length} transactions instead of ${expected.length}`
    );
  }

  transactions.forEach((content, index) => {
    const transfer = expected[index];

    if (content.destination !== transfer.to) {
      throw new OperationMismatchError("different contract");
    }
    if (new BigNumber(content.amount ?? 0).toFixed() !== toMumav(transfer)) {
      throw new OperationMismatchError("different amount");
    }

    const entrypoint = content.parameters?.entrypoint ?? "default";

    if (entrypoint !== (transfer.parameter?.entrypoint ?? "default")) {
      throw new OperationMismatchError("different entrypoint");
    }
    if (
      stableStringify(normalizeMichelson(content.parameters?.value ?? null)) !==
      stableStringify(normalizeMichelson(transfer.parameter?.value ?? null))
    ) {
      throw new OperationMismatchError("different parameters");
    }
  });
}

// The operation each toolkit is about to send. Manager operations of one
// account are serialized, so a toolkit sends one operation at a time.
const expectedByToolkit = new WeakMap<object, readonly ExpectedTransfer[]>();

/** Registers the reviewed operation for `toolkit`; returns its release. */
export function expectOperation(
  toolkit: object,
  transfers: readonly ExpectedTransfer[]
): () => void {
  expectedByToolkit.set(toolkit, transfers);

  return () => {
    if (expectedByToolkit.get(toolkit) === transfers) {
      expectedByToolkit.delete(toolkit);
    }
  };
}

export function getExpectedOperation(toolkit: object) {
  return expectedByToolkit.get(toolkit) ?? null;
}
