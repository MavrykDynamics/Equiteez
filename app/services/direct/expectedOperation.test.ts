import { describe, expect, it } from "vitest";
import { ed25519 } from "@noble/curves/ed25519.js";
import { OpKind } from "@mavrykdynamics/taquito";
import { LocalForger } from "@mavrykdynamics/taquito-local-forging";
import { b58cencode, Prefix, prefix } from "@mavrykdynamics/taquito-utils";
import bs58 from "bs58";

import { deriveMavrykKeys } from "~/lib/mavryk/keys";

import {
  assertMatchesExpectedOperation,
  expectOperation,
  getExpectedOperation,
  normalizeMichelson,
  OperationMismatchError,
  type ExpectedTransfer,
} from "./expectedOperation";
import {
  FEE_INCREASE_TOLERANCE_RATIO,
  isWithinApprovedCost,
  MIN_FEE_INCREASE_TOLERANCE_MUMAV,
} from "./nativeBudget";

// Public test key, valid addresses for the forger
const keys = deriveMavrykKeys(
  bs58.encode(ed25519.getPublicKey(new Uint8Array(32).fill(3)))
);
const SOURCE = keys.address;
const TOKEN = "KT1VAymHKvx9oreDRqN22rf2huuYiV5ofe34";
const ORDERBOOK = "KT1SYFeAjDsu7KXfN3VUgyuzfdMth16r8BQ2";
const BRANCH = b58cencode("22".repeat(32), prefix[Prefix.B]);
const forger = new LocalForger();

// add_operator → placeBuyOrder → remove_operator, as the app builds it
const grant = (kind: "add_operator" | "remove_operator") => ({
  entrypoint: "update_operators",
  value: [
    {
      prim: kind === "add_operator" ? "Left" : "Right",
      args: [
        {
          prim: "Pair",
          args: [
            { string: SOURCE },
            { prim: "Pair", args: [{ string: ORDERBOOK }, { int: "0" }] },
          ],
        },
      ],
    },
  ],
});
const order = {
  entrypoint: "placeBuyOrder",
  value: [
    {
      prim: "Pair",
      args: [
        { int: "1000000" },
        {
          prim: "Pair",
          args: [
            { int: "30000000" },
            { prim: "Pair", args: [{ string: "USDT" }, { prim: "None" }] },
          ],
        },
      ],
    },
  ],
};
const EXPECTED: ExpectedTransfer[] = [
  { to: TOKEN, amount: 0, parameter: grant("add_operator") },
  { to: ORDERBOOK, amount: 0, parameter: order },
  { to: TOKEN, amount: 0, parameter: grant("remove_operator") },
];

let counter = 10;
const manager = () => ({
  source: SOURCE,
  fee: "1000",
  counter: String(++counter),
  gas_limit: "10000",
  storage_limit: "300",
});
const transaction = (
  destination: string,
  parameters: ExpectedTransfer["parameter"],
  amount = "0"
) => ({
  kind: OpKind.TRANSACTION,
  ...manager(),
  amount,
  destination,
  parameters,
});
const reveal = () => ({
  kind: OpKind.REVEAL,
  ...manager(),
  public_key: keys.publicKey,
});

/** Forge, then decode: the contents a signer actually sees. */
async function signedContents(contents: object[]) {
  const forged = await forger.forge({ branch: BRANCH, contents } as Parameters<
    LocalForger["forge"]
  >[0]);
  return (await forger.parse(forged)).contents;
}

const reviewed = () => [
  transaction(TOKEN, grant("add_operator")),
  transaction(ORDERBOOK, order),
  transaction(TOKEN, grant("remove_operator")),
];

describe("assertMatchesExpectedOperation", () => {
  it("accepts the reviewed batch after forging and decoding", async () => {
    const contents = await signedContents(reviewed());

    expect(() =>
      assertMatchesExpectedOperation(contents, EXPECTED)
    ).not.toThrow();
  });

  it("accepts the reveal taquito adds for a new account, first only", async () => {
    const withReveal = await signedContents([reveal(), ...reviewed()]);
    expect(() =>
      assertMatchesExpectedOperation(withReveal, EXPECTED)
    ).not.toThrow();

    const [a, b, c] = reviewed();
    const revealInside = await signedContents([a, reveal(), b, c]);
    expect(() =>
      assertMatchesExpectedOperation(revealInside, EXPECTED)
    ).toThrow(OperationMismatchError);
  });

  it.each<[string, () => object[]]>([
    [
      "another contract",
      () => {
        const [a, , c] = reviewed();
        return [a, transaction(TOKEN, order), c];
      },
    ],
    [
      "a native amount",
      () => {
        const [a, , c] = reviewed();
        return [a, transaction(ORDERBOOK, order, "1"), c];
      },
    ],
    [
      "another entrypoint",
      () => {
        const [a, , c] = reviewed();
        return [
          a,
          transaction(ORDERBOOK, { ...order, entrypoint: "placeSellOrder" }),
          c,
        ];
      },
    ],
    [
      "another price",
      () => {
        const [a, , c] = reviewed();
        const changed = JSON.parse(JSON.stringify(order));
        changed.value[0].args[1].args[0].int = "31000000";
        return [a, transaction(ORDERBOOK, changed), c];
      },
    ],
    ["a missing step", () => reviewed().slice(0, 2)],
    [
      "an extra transfer",
      () => [...reviewed(), transaction(SOURCE, undefined, "5000000")],
    ],
  ])("refuses %s", async (_, build) => {
    const contents = await signedContents(build());

    expect(() => assertMatchesExpectedOperation(contents, EXPECTED)).toThrow(
      OperationMismatchError
    );
  });

  it("treats nested and flat pairs as the same value", () => {
    const nested = {
      prim: "Pair",
      args: [
        { int: "1" },
        { prim: "Pair", args: [{ int: "2" }, { int: "3" }] },
      ],
    };
    const flat = {
      prim: "Pair",
      args: [{ int: "1" }, { int: "2" }, { int: "3" }],
    };

    expect(normalizeMichelson(nested)).toEqual(normalizeMichelson(flat));
  });
});

describe("expectOperation registry", () => {
  it("holds the reviewed operation per toolkit until released", () => {
    const toolkit = {};
    const release = expectOperation(toolkit, EXPECTED);

    expect(getExpectedOperation(toolkit)).toBe(EXPECTED);
    expect(getExpectedOperation({})).toBeNull();

    release();
    expect(getExpectedOperation(toolkit)).toBeNull();
  });
});

describe("approved network cost", () => {
  it(`allows ${FEE_INCREASE_TOLERANCE_RATIO * 100}% or at least ${MIN_FEE_INCREASE_TOLERANCE_MUMAV} mumav more`, () => {
    // Small fee: the 0.01 MVRK floor applies
    expect(isWithinApprovedCost(11_000, 1_000)).toBe(true);
    expect(isWithinApprovedCost(11_001, 1_000)).toBe(false);
    // Large fee: 20% applies
    expect(isWithinApprovedCost(120_000, 100_000)).toBe(true);
    expect(isWithinApprovedCost(120_001, 100_000)).toBe(false);
    // Cheaper is always fine
    expect(isWithinApprovedCost(500, 1_000)).toBe(true);
  });
});
