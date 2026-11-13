import { describe, expect, it } from "vitest";
import { BigNumber } from "bignumber.js";
import { OpKind } from "@mavrykdynamics/taquito";

import { buildWithdrawalBatch, nativeMaxAmount } from "./withdrawal";

describe("buildWithdrawalBatch", () => {
  it("sends MVRK in integer mumav", () => {
    expect(
      buildWithdrawalBatch({
        kind: "native",
        to: "mv1recipient",
        amount: new BigNumber("1.2345678"),
      })
    ).toEqual([
      {
        kind: OpKind.TRANSACTION,
        to: "mv1recipient",
        amount: 1_234_567,
        mumav: true,
      },
    ]);
  });

  it("sends a token as its contract call", () => {
    const params = {
      to: "KT1token",
      amount: 0,
      parameter: { entrypoint: "transfer", value: [] },
    };

    expect(buildWithdrawalBatch({ kind: "token", params })).toEqual([
      { kind: OpKind.TRANSACTION, ...params },
    ]);
  });
});

describe("nativeMaxAmount", () => {
  it("leaves the fee and burn with a margin on send-all", () => {
    // 1_000 fee + 500 burn → 1_800 mumav reserved
    expect(
      nativeMaxAmount({ balanceMvrk: "2", feeMumav: 1_000, burnMumav: 500 })
    ).toEqual({ amount: "1.998200", reserveMumav: new BigNumber(1_800) });
  });

  it("reports when the balance cannot even pay the fee", () => {
    expect(
      nativeMaxAmount({ balanceMvrk: "0.001", feeMumav: 1_000, burnMumav: 0 })
        .amount
    ).toBeNull();
  });
});
