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

/** Estimates the batch (with reveal if needed) and checks the MVRK balance. */
export async function assertNativeBudget(
  tezos: Pick<MavrykToolkit, "mv" | "wallet" | "estimate">,
  batch: Parameters<MavrykToolkit["estimate"]["batch"]>[0]
): Promise<NativeCost> {
  const estimates = await tezos.estimate.batch(batch);
  const cost = summarizeNativeCost(estimates, batch as NativeTransfer[]);

  await assertNativeBalance(tezos, cost);
  return cost;
}
