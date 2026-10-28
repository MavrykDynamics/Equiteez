import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { BigNumber } from "bignumber.js";
import type { BatchOperationKindType } from "./types";

export type DirectOrderFee = {
  networkFee: BigNumber;
  storageCost: BigNumber;
  totalDebit: BigNumber;
  balance: BigNumber;
};
function nativeNat(value: BigNumber.Value, label: string) {
  if (typeof value === "number" && !Number.isSafeInteger(value)) {
    throw new Error(`${label} is unavailable`);
  }
  const amount = new BigNumber(value);
  if (!amount.isFinite() || !amount.isInteger() || amount.isNegative()) {
    throw new Error(`${label} is unavailable`);
  }
  return amount;
}
export function directFeeTotals(
  estimates: { suggestedFeeMumav: number; burnFeeMumav: number }[],
  batch: BatchOperationKindType
) {
  if (
    !estimates.length ||
    estimates.length < batch.length ||
    estimates.length > batch.length + 1
  )
    throw new Error("Network fee estimate is unavailable");
  // Taquito batch includes an extra reveal estimate when needed. totalCost uses
  // minimalFee, so sum suggestedFee + storage burn explicitly instead.
  const networkFee = estimates.reduce(
    (sum, item) => sum.plus(nativeNat(item.suggestedFeeMumav, "Network fee")),
    new BigNumber(0)
  );
  const storageCost = estimates.reduce(
    (sum, item) => sum.plus(nativeNat(item.burnFeeMumav, "Storage cost")),
    new BigNumber(0)
  );
  const transferred = batch.reduce(
    (sum, item) =>
      sum.plus(
        nativeNat(
          new BigNumber(item.amount ?? 0).times(item.mumav ? 1 : 1_000_000),
          "Native transfer"
        )
      ),
    new BigNumber(0)
  );
  return {
    networkFee,
    storageCost,
    totalDebit: networkFee.plus(storageCost).plus(transferred),
  };
}
export async function estimateDirectOrderFee(
  tezos: MavrykToolkit,
  batch: BatchOperationKindType,
  wallet: string
): Promise<DirectOrderFee> {
  const [estimates, rawBalance] = await Promise.all([
    tezos.estimate.batch(batch),
    tezos.rpc.getBalance(wallet),
  ]);
  return {
    ...directFeeTotals(estimates, batch),
    balance: nativeNat(rawBalance, "MVRK balance"),
  };
}
export function assertDirectAffordability(fee: DirectOrderFee) {
  if (fee.balance.lt(fee.totalDebit))
    throw new Error("Insufficient MVRK for network fees and storage costs.");
}
export async function verifyDirectOrderFee(
  tezos: MavrykToolkit,
  batch: BatchOperationKindType,
  wallet: string,
  chain: string,
  beforeSubmit?: () => void | Promise<void>
) {
  const fee = await estimateDirectOrderFee(tezos, batch, wallet);
  assertDirectAffordability(fee);
  const [currentWallet, currentChain] = await Promise.all([
    tezos.wallet.pkh(),
    tezos.rpc.getChainId(),
  ]);
  if (wallet !== currentWallet || chain !== currentChain)
    throw new Error("Wallet or network changed. Review the action again.");
  await beforeSubmit?.();
}
