/**
 * MVRK the source must hold for a direct operation: fees for every manager
 * content (including an automatic reveal), storage/allocation burn and any
 * native amount sent (docs/dynamic-wallet.md §8.7 step 2).
 *
 * Integer mumav throughout. A failed estimate or balance read is an error,
 * never "zero cost" or "zero balance".
 */
import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { BigNumber } from "bignumber.js";

const MUMAV_PER_MVRK = 1_000_000;

export class InsufficientMvrkError extends Error {
  constructor(
    public readonly requiredMumav: BigNumber,
    public readonly availableMumav: BigNumber
  ) {
    super(
      `Not enough MVRK to pay the network fee: ${formatMvrk(
        requiredMumav
      )} MVRK needed, ${formatMvrk(availableMumav)} MVRK available.`
    );
    this.name = "InsufficientMvrkError";
  }
}

export const formatMvrk = (mumav: BigNumber) =>
  mumav.div(MUMAV_PER_MVRK).toFixed(6, BigNumber.ROUND_UP);

type EstimateLike = { suggestedFeeMumav: number; burnFeeMumav: number };

type NativeTransfer = {
  amount?: number | string;
  /** True when `amount` is already in mumav */
  mumav?: boolean;
};

export type NativeCost = {
  feeMumav: BigNumber;
  burnMumav: BigNumber;
  amountMumav: BigNumber;
  totalMumav: BigNumber;
};

export function summarizeNativeCost(
  estimates: readonly EstimateLike[],
  operations: readonly NativeTransfer[] = []
): NativeCost {
  const feeMumav = estimates.reduce(
    (sum, estimate) => sum.plus(estimate.suggestedFeeMumav),
    new BigNumber(0)
  );
  const burnMumav = estimates.reduce(
    (sum, estimate) => sum.plus(estimate.burnFeeMumav),
    new BigNumber(0)
  );
  const amountMumav = operations.reduce((sum, operation) => {
    const amount = new BigNumber(operation.amount ?? 0);

    return sum.plus(operation.mumav ? amount : amount.times(MUMAV_PER_MVRK));
  }, new BigNumber(0));

  return {
    feeMumav,
    burnMumav,
    amountMumav,
    totalMumav: feeMumav.plus(burnMumav).plus(amountMumav),
  };
}

/** Throws InsufficientMvrkError when the source cannot cover `cost`. */
export async function assertNativeBalance(
  tezos: Pick<MavrykToolkit, "mv" | "wallet">,
  cost: NativeCost
) {
  const source = await tezos.wallet.pkh();
  const balanceMumav = new BigNumber(
    (await tezos.mv.getBalance(source)).toString()
  );

  if (balanceMumav.lt(cost.totalMumav)) {
    throw new InsufficientMvrkError(cost.totalMumav, balanceMumav);
  }
}

// How far the cost at signing may exceed the cost the user reviewed: 20%, or
// at least 0.01 MVRK, since Basenet fees are small enough for a percentage
// alone to trip on noise
export const FEE_INCREASE_TOLERANCE_RATIO = 0.2;
export const MIN_FEE_INCREASE_TOLERANCE_MUMAV = 10_000;

/** The network cost grew past what the user reviewed: nothing was sent. */
export class NetworkFeeChangedError extends Error {
  constructor(
    public readonly approvedMumav: BigNumber,
    public readonly actualMumav: BigNumber
  ) {
    super(
      `The network fee changed from ${formatMvrk(
        approvedMumav
      )} to ${formatMvrk(actualMumav)} MVRK. Check it and try again.`
    );
    this.name = "NetworkFeeChangedError";
  }
}

export function isWithinApprovedCost(
  actualMumav: BigNumber.Value,
  approvedMumav: BigNumber.Value
): boolean {
  const approved = new BigNumber(approvedMumav);
  const allowance = BigNumber.max(
    approved.times(FEE_INCREASE_TOLERANCE_RATIO),
    MIN_FEE_INCREASE_TOLERANCE_MUMAV
  );

  return new BigNumber(actualMumav).lte(approved.plus(allowance));
}

/**
 * Throws NetworkFeeChangedError when fees + burn grew past the reviewed
 * network cost. A native amount is the user's own input, not a fee, and is
 * left out on both sides.
 */
export function assertWithinApprovedCost(
  cost: NativeCost,
  approvedMumav: BigNumber.Value | undefined
) {
  if (approvedMumav === undefined) return;

  const networkCostMumav = cost.feeMumav.plus(cost.burnMumav);

  if (!isWithinApprovedCost(networkCostMumav, approvedMumav)) {
    throw new NetworkFeeChangedError(
      new BigNumber(approvedMumav),
      networkCostMumav
    );
  }
}

/**
 * Estimates the batch (with reveal if needed), checks it against the cost
 * the user reviewed, then checks the MVRK balance.
 */
export async function assertNativeBudget(
  tezos: Pick<MavrykToolkit, "mv" | "wallet" | "estimate">,
  batch: Parameters<MavrykToolkit["estimate"]["batch"]>[0],
  approvedMumav?: BigNumber.Value
): Promise<NativeCost> {
  const estimates = await tezos.estimate.batch(batch);
  const cost = summarizeNativeCost(estimates, batch as NativeTransfer[]);

  assertWithinApprovedCost(cost, approvedMumav);
  await assertNativeBalance(tezos, cost);
  return cost;
}
