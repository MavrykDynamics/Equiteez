/**
 * Pure parts of a withdrawal: the transfer to send and the most MVRK that
 * can be sent while still paying for the operation (DYN-FE-13).
 */
import { OpKind, type TransferParams } from "@mavrykdynamics/taquito";
import { BigNumber } from "bignumber.js";

import type { BatchOperationKindType } from "~/contracts/types";

export const MUMAV_PER_MVRK = 1_000_000;
// Room left on "Max" for MVRK: estimated fee and burn plus this margin
export const NATIVE_MAX_FEE_MARGIN = 1.2;

/**
 * One transfer: a token contract call, or MVRK in integer mumav (no
 * floating-point amounts).
 */
export function buildWithdrawalBatch(
  transfer:
    | { kind: "token"; params: TransferParams }
    | { kind: "native"; to: string; amount: BigNumber.Value }
): BatchOperationKindType {
  if (transfer.kind === "token") {
    return [{ kind: OpKind.TRANSACTION, ...transfer.params }];
  }

  return [
    {
      kind: OpKind.TRANSACTION,
      to: transfer.to,
      amount: new BigNumber(transfer.amount)
        .times(MUMAV_PER_MVRK)
        .integerValue(BigNumber.ROUND_DOWN)
        .toNumber(),
      mumav: true,
    },
  ];
}

/**
 * The most MVRK a send-all can move: the balance minus the estimated fee and
 * burn with a margin. null when the balance cannot even cover the fee.
 */
export function nativeMaxAmount({
  balanceMvrk,
  feeMumav,
  burnMumav,
}: {
  balanceMvrk: BigNumber.Value;
  feeMumav: BigNumber.Value;
  burnMumav: BigNumber.Value;
}): { amount: string | null; reserveMumav: BigNumber } {
  const reserveMumav = new BigNumber(feeMumav)
    .plus(burnMumav)
    .times(NATIVE_MAX_FEE_MARGIN)
    .integerValue(BigNumber.ROUND_UP);
  const maxMumav = new BigNumber(balanceMvrk)
    .times(MUMAV_PER_MVRK)
    .minus(reserveMumav);

  return {
    reserveMumav,
    amount: maxMumav.lte(0)
      ? null
      : maxMumav.div(MUMAV_PER_MVRK).toFixed(6, BigNumber.ROUND_DOWN),
  };
}
