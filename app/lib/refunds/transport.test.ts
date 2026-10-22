import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RefundRun, Chunk } from "./model";
import { RefundFailure } from "./runner";
import { b58decode } from "@mavrykdynamics/taquito-utils";
import { Schema } from "@mavrykdynamics/taquito-michelson-encoder";
import type {
  MichelsonData,
  MichelsonType,
} from "@mavrykdynamics/taquito-michel-codec";

const mocks = vi.hoisted(() => ({
  operations: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
}));
vi.mock("~/lib/apis/tzkt", () => ({
  fetchGetOperationsByHash: mocks.operations,
  isKnownChainId: (chain: string) => chain === "NetXJMfAoC7pZSW",
}));
vi.mock("~/lib/apis/rwa/client", () => ({
  rwaApi: { get: mocks.get, post: mocks.post },
}));
vi.mock("@mavrykdynamics/beacon-dapp", () => ({
  SigningType: { MICHELINE: "micheline" },
}));
import { assertScope, createPorts, packedPermit } from "./transport";

const chain = "NetXJMfAoC7pZSW";
const book = "KT18rhCbsJfURefvjwR6UHnBN3DgobiLw46h";
const publicKey = "edpktefadnaQrLUwKJEK2G9Ynwcv9KMGTAvfVpCDfAwJdm3D7vohgu";
const otherPublicKey = "edpktf7DydMTKVxjkGzpoCefNuUuSdTa7YVquqoVs2uTjNJ5iCqxLn";
const wallet = "mv1WqHUN6rHg43afBQRbWWRHkJ8tqmiq7oMu";
const hash = "ongRVQmTqGxYEP9R76AQ5boPLjG22MFFPL1Ky8aHVGNgGCq57Zg";
const orders: Chunk["orders"] = [
  { orderId: "9007199254740993", orderType: "BUY" },
  { orderId: "12", orderType: "SELL" },
];
const chunk = (): Chunk => ({ book, orders, state: "submitted", hash });
const run = (mode: RefundRun["mode"] = "credits"): RefundRun => ({
  version: 1,
  wallet,
  chain,
  asset: book,
  mode,
  items: [],
  chunks: [chunk()],
  feePerChunk: "0",
  feeDecimals: 0,
  feeToken: "",
});

function blockReceipt(
  internals: unknown[] = [],
  entrypoint = "permitAndExecute",
) {
  return {
    operations: [
      [
        {
          hash,
          contents: [
            {
              kind: "transaction",
              counter: "5",
              destination: book,
              parameters: { entrypoint },
              metadata: {
                operation_result: { status: "applied" },
                internal_operation_results: internals,
              },
            },
          ],
        },
      ],
    ],
  };
}

function setup() {
  const account = { address: wallet, publicKey, network: { type: "basenet" } };
  const send = vi.fn().mockResolvedValue({ opHash: hash });
  const sign = vi.fn();
  const toolkit = {
    rpc: {
      getChainId: vi.fn().mockResolvedValue(chain),
      getRpcUrl: () => "https://basenet.rpc.mavryk.network",
      getBlockHeader: vi.fn().mockResolvedValue({ level: 102 }),
      getBlockHash: vi.fn().mockResolvedValue("canonical-block"),
      getBlock: vi.fn().mockResolvedValue(blockReceipt()),
    },
    setSignerProvider: vi.fn(),
    wallet: {
      at: vi.fn().mockResolvedValue({
        methodsObject: {
          processRefund: () => ({
            toTransferParams: () => ({ to: book }),
            send,
          }),
        },
      }),
    },
    estimate: { transfer: vi.fn().mockResolvedValue({}) },
  };
  const dapp = {
    getDAppClient: () => ({
      getActiveAccount: vi.fn().mockResolvedValue(account),
      requestSignPayload: sign,
    }),
    tezos: () => toolkit,
  } as unknown as Parameters<typeof createPorts>[0];
  return { account, send, sign, toolkit, dapp };
}

function receipt(key = publicKey, entries = orders) {
  return {
    type: "transaction",
    hash,
    level: 100,
    counter: 5,
    block: "canonical-block",
    status: "applied",
    sender: { address: "relay-signer" },
    target: { address: book },
    parameter: {
      entrypoint: "permitAndExecute",
      value: [{ userPublicKey: key, action: { permitProcessRefund: entries } }],
    },
  };
}

beforeEach(() => vi.clearAllMocks());

describe("refund receipt reconciliation", () => {
  it("finds the exact user's request after a different user in a shared relay hash", async () => {
    const { dapp, toolkit } = setup();
    mocks.operations.mockResolvedValue([
      receipt(otherPublicKey),
      receipt(publicKey, [{ orderId: "1", orderType: "BUY" }]),
      receipt(),
    ]);
    expect(
      await createPorts(dapp, run(), vi.fn(), () => true).chain(hash, chunk()),
    ).toEqual({ state: "applied", level: 100, payouts: [] });
    expect(toolkit.rpc.getBlockHash).toHaveBeenCalledWith({ block: "100" });
  });

  it("checks all orders, their order and the signer before accepting a recovery hash", async () => {
    const { dapp } = setup();
    const ports = createPorts(dapp, run(), vi.fn(), () => true);
    for (const row of [
      receipt(otherPublicKey),
      receipt(publicKey, [...orders].reverse()),
      receipt(publicKey, orders.slice(0, 1)),
      receipt("malformed-public-key"),
    ]) {
      mocks.operations.mockResolvedValue([row]);
      await expect(ports.chain(hash, chunk())).rejects.toThrow(
        "does not match",
      );
    }
    await expect(ports.chain("invalid", chunk())).rejects.toThrow(
      "Invalid transaction hash",
    );
  });

  it("never confirms or rejects an orphaned or insufficiently confirmed receipt", async () => {
    const { dapp, toolkit } = setup();
    const ports = createPorts(dapp, run(), vi.fn(), () => true);
    mocks.operations.mockResolvedValue([receipt()]);
    toolkit.rpc.getBlockHeader.mockResolvedValue({ level: 101 });
    expect(await ports.chain(hash, chunk())).toEqual({ state: "pending" });
    toolkit.rpc.getBlockHeader.mockResolvedValue({ level: 102 });
    toolkit.rpc.getBlockHash.mockResolvedValue("replacement-block");
    expect(await ports.chain(hash, chunk())).toEqual({ state: "pending" });
    mocks.operations.mockResolvedValue([{ ...receipt(), status: "failed" }]);
    expect(await ports.chain(hash, chunk())).toEqual({ state: "pending" });
    toolkit.rpc.getBlockHash.mockResolvedValue("canonical-block");
    expect(await ports.chain(hash, chunk())).toEqual({ state: "failed" });
  });

  it("requires a direct operation from the selected wallet, and treats a missing receipt as pending", async () => {
    const { dapp, toolkit } = setup();
    const ports = createPorts(dapp, run("mvrk"), vi.fn(), () => true);
    mocks.operations.mockResolvedValue([]);
    expect(await ports.chain(hash, chunk())).toEqual({ state: "pending" });
    const row = {
      ...receipt(),
      sender: { address: wallet },
      parameter: { entrypoint: "processRefund", value: orders },
    };
    mocks.operations.mockResolvedValue([row]);
    toolkit.rpc.getBlock.mockResolvedValue(blockReceipt([], "processRefund"));
    expect(await ports.chain(hash, chunk())).toEqual({
      state: "applied",
      level: 100,
      payouts: [],
    });
    mocks.operations.mockResolvedValue([
      { ...row, sender: { address: "another-wallet" } },
    ]);
    await expect(ports.chain(hash, chunk())).rejects.toThrow("does not match");
  });

  it("reads exact payouts only from this manager receipt, preserving FA2 identities and optimized addresses", async () => {
    const { dapp, toolkit } = setup();
    const transfer = (id: string, amount: string, recipient = wallet) => ({
      kind: "transaction",
      source: book,
      destination: book,
      result: { status: "applied" },
      parameters: {
        entrypoint: "transfer",
        value: [
          {
            prim: "Pair",
            args: [
              { bytes: b58decode(book) },
              [
                {
                  prim: "Pair",
                  args: [
                    { bytes: b58decode(recipient) },
                    { prim: "Pair", args: [{ int: id }, { int: amount }] },
                  ],
                },
              ],
            ],
          },
        ],
      },
    });
    const block = blockReceipt([
      transfer("0", "9007199254740993"),
      transfer("0", "7"),
      transfer("1", "42"),
      transfer("1000000000000000000000001", "1000000000000000000000002"),
      transfer("0", "999", book),
    ]);
    block.operations[0][0].contents.unshift({
      ...blockReceipt([transfer("0", "123456789")]).operations[0][0]
        .contents[0],
      counter: "4",
    });
    toolkit.rpc.getBlock.mockResolvedValue(block);
    mocks.operations.mockResolvedValue([receipt()]);
    const ports = createPorts(dapp, run(), vi.fn(), () => true);
    expect(await ports.chain(hash, chunk())).toEqual({
      state: "applied",
      level: 100,
      payouts: [
        { token: book, id: "0", units: "9007199254741000" },
        { token: book, id: "1", units: "42" },
        {
          token: book,
          id: "1000000000000000000000001",
          units: "1000000000000000000000002",
        },
      ],
    });
    // The immutable finalized receipt is reused while the indexer catches up;
    // canonical block identity is still checked on every poll.
    await ports.chain(hash, chunk());
    expect(toolkit.rpc.getBlock).toHaveBeenCalledTimes(1);
    expect(toolkit.rpc.getBlockHash).toHaveBeenCalledTimes(2);
  });
});

describe("permit packing", () => {
  // Independent literals from PACK of the explicit contract Pair values, not
  // Schema.Encode. Legacy shape is verified against permitHelpers before 7e7ec69;
  // the current shape matches _packPermitPayload(counter, hash, deadline).
  it("packs a lossless counter in the legacy contract layout", () => {
    expect(packedPermit(chain, book, "9007199254740993", "04".repeat(32))).toBe(
      "05070707070a00000004081b203f0a000000160103030303030303030303030303030303030303030007070081808080808080200a000000200404040404040404040404040404040404040404040404040404040404040404",
    );
  });
  it("includes the deadline in the current nested pair layout", () => {
    expect(
      packedPermit(
        chain,
        book,
        "9007199254740993",
        "04".repeat(32),
        "2030-01-01T00:00:00.000Z",
      ),
    ).toBe(
      "05070707070a00000004081b203f0a0000001601030303030303030303030303030303030303030300070700818080808080802007070a0000002004040404040404040404040404040404040404040404040404040404040404040080e2de8d0e",
    );
  });
  it("rejects an oversized intent and an unsupported relay counter before asking for a signature", async () => {
    const { dapp, toolkit, sign } = setup();
    const ports = createPorts(dapp, run(), vi.fn(), () => true);
    await expect(
      ports.sign({
        ...chunk(),
        orders: [{ orderId: "1".repeat(33 * 1024), orderType: "BUY" }],
      }),
    ).rejects.toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
    mocks.get.mockResolvedValue({
      data: {
        enabled: true,
        contracts: [{ address: book, permitActions: ["permitProcessRefund"] }],
        fee: { enabled: false },
      },
    });
    Object.assign(toolkit, {
      contract: {
        at: vi.fn().mockResolvedValue({
          storage: async () => ({
            permitsCounterLedger: {
              get: async () => ({ toFixed: () => "9223372036854775808" }),
            },
          }),
        }),
      },
    });
    Object.assign(toolkit.rpc, {
      getEntrypoints: vi.fn().mockResolvedValue({
        entrypoints: {
          permitAndExecute: {
            prim: "list",
            args: [
              {
                prim: "pair",
                args: [
                  { prim: "key", annots: ["%userPublicKey"] },
                  { prim: "signature", annots: ["%userSignature"] },
                  {
                    prim: "or",
                    annots: ["%action"],
                    args: [
                      {
                        prim: "list",
                        annots: ["%permitProcessRefund"],
                        args: [
                          {
                            prim: "pair",
                            args: [{ prim: "nat" }, { prim: "string" }],
                          },
                        ],
                      },
                      { prim: "unit" },
                    ],
                  },
                ],
              },
            ],
          },
        },
      }),
    });
    await expect(ports.sign(chunk())).rejects.toMatchObject({
      code: "UNSUPPORTED_COUNTER",
    });
    expect(sign).not.toHaveBeenCalled();
  });
});

// Public, offline-only regression fixtures generated from deterministic test
// seeds with webmavryk-signer. No wallet/private key is read or stored here.
// The RPC schema fixtures exercise nested OR and both binary/comb records;
// they do not attest a particular deployed contract version.
const signingFixture = {
  publicKey: "edpkvZgnrTj3ypZ6fUymKGEwC8GWGYzCAoa18xKEzEoPDrcXXNgQxP",
  wallet: "mv1J8kd68ZE86DSthJYYFH1uPRzroqgAVTL8",
  legacy: {
    packed:
      "05070707070a00000004081b203f0a000000160103030303030303030303030303030303030303030007070081808080808080200a000000209620ab7bb8726226ddab79b856990a1fab2750c79a9aeacb85c62f047e841d65",
    signature:
      "edsigtsRij2z7tNCEtuiWJvNhrQYizs1SLStjVgSqt9ZxHmEeetSomUrA21GWPS1PwuVxE7nkgZoeuHL8QKgxE5HsaSc5449aVr",
    foreignSignature:
      "edsigu4dK22YwH4HXMoUHvVakLo779spAS7DkSPtXqr1YNyKNEkgdaMjrJkxmjLkpE2RWNV2u3wjQdRe8bf15CWjgij9J9aXjBm",
  },
  current: {
    packed:
      "05070707070a00000004081b203f0a0000001601030303030303030303030303030303030303030300070700818080808080802007070a000000209620ab7bb8726226ddab79b856990a1fab2750c79a9aeacb85c62f047e841d6500b4e4de8d0e",
    signature:
      "edsigtfaUVciUyPi8UArxxRNqCy3QkB724JB99PoN6MMzir8vFbtpkj8uAf4Fs9UG5zLyip5LRrMYjAKqEw3AbA2jEdFoVRGdMN",
    foreignSignature:
      "edsigtzBrCfVT6GJysFRksdfUzpfzyjy4GcsxkAcu2iSQEmyZvzzuQWASqNBpSJ7GB9iQ9kqQPi2n3EDcpxnAnV6cJmmQoWeK8Y",
  },
};

function signingSetup(version: "current" | "legacy") {
  const env = setup();
  env.account.address = signingFixture.wallet;
  env.account.publicKey = signingFixture.publicKey;
  const refund: MichelsonType = {
    prim: "list",
    annots: ["%permitProcessRefund"],
    args: [
      {
        prim: "pair",
        args: [
          { prim: "nat", annots: ["%orderId"] },
          { prim: "string", annots: ["%orderType"] },
        ],
      },
    ],
  };
  const action: MichelsonType = {
    prim: "or",
    annots: ["%action"],
    args: [
      { prim: "unit", annots: ["%permitCancelOrders"] },
      {
        prim: "or",
        args: [{ prim: "unit", annots: ["%permitPlaceBuyOrder"] }, refund],
      },
    ],
  };
  const key: MichelsonType = { prim: "key", annots: ["%userPublicKey"] };
  const signature: MichelsonType = {
    prim: "signature",
    annots: ["%userSignature"],
  };
  const record: MichelsonType =
    version === "current"
      ? {
          prim: "pair",
          args: [
            key,
            signature,
            action,
            { prim: "timestamp", annots: ["%deadline"] },
          ],
        }
      : {
          prim: "pair",
          args: [key, { prim: "pair", args: [signature, action] }],
        };
  const entry: MichelsonType = { prim: "list", args: [record] };
  const encode = vi.fn((permits: unknown) => ({
    toTransferParams: () => ({
      to: book,
      parameter: {
        entrypoint: "permitAndExecute",
        value: new Schema(entry).Encode(permits),
      },
    }),
  }));
  const contract = {
    storage: async () => ({
      permitsCounterLedger: {
        get: async () => ({ toFixed: () => "9007199254740993" }),
      },
      userPermitsExpiryLedger: { get: async () => undefined },
      config: { permitDefaultExpiryDuration: { toFixed: () => "600" } },
    }),
    methodsObject: { permitAndExecute: encode },
  };
  Object.assign(env.toolkit, {
    contract: { at: vi.fn().mockResolvedValue(contract) },
  });
  Object.assign(env.toolkit.rpc, {
    getEntrypoints: vi
      .fn()
      .mockResolvedValue({ entrypoints: { permitAndExecute: entry } }),
    getBlockHeader: vi
      .fn()
      .mockResolvedValue({ level: 102, timestamp: "2030-01-01T00:00:00.000Z" }),
  });
  // Enabled fees do not imply refunds are chargeable. The resolved schedule
  // omits refunds, while another action and the default price are non-zero.
  mocks.get.mockResolvedValue({
    data: {
      enabled: true,
      contracts: [{ address: book, permitActions: ["permitProcessRefund"] }],
      fee: {
        enabled: true,
        feeSchedule: { permitPlaceBuyOrder: "500" },
        defaultFeeUnits: "500",
        tokenContract: book,
        decimals: 6,
      },
    },
  });
  env.sign.mockResolvedValue({ signature: signingFixture[version].signature });
  const draft = {
    ...run(),
    wallet: signingFixture.wallet,
    feeToken: book,
    feeDecimals: 6,
  };
  return {
    ...env,
    draft,
    entry,
    encode,
    ports: createPorts(env.dapp, draft, vi.fn(), () => true),
  };
}

describe.each(["current", "legacy"] as const)(
  "complete %s refund permit signing",
  (version) => {
    it("verifies the real signature and encodes the ordered refund intent, counter and deadline", async () => {
      const env = signingSetup(version);
      const request = await env.ports.sign(chunk());
      expect(env.sign).toHaveBeenCalledWith({
        payload: signingFixture[version].packed,
        sourceAddress: signingFixture.wallet,
        signingType: "micheline",
      });
      expect(request.intent).toEqual({
        kind: "process_refund",
        orderbookAddress: book,
        orders,
      });
      expect(request.permitCounter).toBe("9007199254740993");
      expect(request.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
      const operation = request.operation as {
        to: string;
        amount: string;
        parameter: { entrypoint: string; value: MichelsonData };
      };
      expect(operation).toMatchObject({
        to: book,
        amount: "0",
        parameter: { entrypoint: "permitAndExecute" },
      });
      const decoded = new Schema(env.entry).Execute(
        operation.parameter.value,
      ) as {
        userPublicKey: string;
        userSignature: string;
        action: {
          permitProcessRefund: {
            orderId: { toFixed(): string };
            orderType: string;
          }[];
        };
        deadline?: string;
      }[];
      expect(decoded).toHaveLength(1);
      expect(decoded[0].userPublicKey).toBe(signingFixture.publicKey);
      expect(decoded[0].userSignature).toBe(signingFixture[version].signature);
      expect(
        decoded[0].action.permitProcessRefund.map((o) => ({
          orderId: o.orderId.toFixed(),
          orderType: o.orderType,
        })),
      ).toEqual(orders);
      if (version === "current")
        expect(new Date(decoded[0].deadline!).toISOString()).toBe(
          "2030-01-01T00:03:00.000Z",
        );
      else expect(decoded[0]).not.toHaveProperty("deadline");
      expect(mocks.get).toHaveBeenCalledTimes(1); // free refund needs no Credits balance check
      expect(mocks.get).toHaveBeenCalledWith("/relay/config", {
        timeout: 10_000,
      });
      expect(mocks.post).not.toHaveBeenCalled(); // signing does not submit
    });

    it("rejects a foreign signature before encoding or submitting the operation", async () => {
      const env = signingSetup(version);
      env.sign.mockResolvedValue({
        signature: signingFixture[version].foreignSignature,
      });
      await expect(env.ports.sign(chunk())).rejects.toMatchObject({
        code: "BAD_SIGNATURE",
      });
      expect(env.encode).not.toHaveBeenCalled();
      expect(mocks.post).not.toHaveBeenCalled();
    });

    it("rejects a valid signature reused for a differently ordered refund list", async () => {
      const env = signingSetup(version);
      await expect(
        env.ports.sign({ ...chunk(), orders: [...orders].reverse() }),
      ).rejects.toMatchObject({ code: "BAD_SIGNATURE" });
      expect(env.encode).not.toHaveBeenCalled();
      expect(mocks.post).not.toHaveBeenCalled();
    });
  },
);

describe("direct send scope and ambiguity", () => {
  it("rejects the same address on another Beacon network", async () => {
    const { dapp, account } = setup();
    account.network.type = "mainnet";
    await expect(assertScope(dapp, wallet, chain)).rejects.toMatchObject({
      code: "SCOPE_CHANGED",
    });
  });

  it("classifies contract lookup and simulation failures as definitive before a wallet request", async () => {
    const { dapp, toolkit, send } = setup();
    const ports = createPorts(dapp, run("mvrk"), vi.fn(), () => true);
    toolkit.wallet.at.mockRejectedValueOnce(new Error("lookup unavailable"));
    await expect(ports.send(chunk())).rejects.toBeInstanceOf(RefundFailure);
    toolkit.estimate.transfer.mockRejectedValueOnce({
      errors: [{ id: "proto.test.gas_exhausted.operation" }],
    });
    await expect(ports.send(chunk())).rejects.toMatchObject({
      code: "OPERATION_RESOURCE_LIMIT",
    });
    toolkit.estimate.transfer.mockRejectedValueOnce(
      new Error(JSON.stringify([{ id: "proto.test.gas_exhausted.operation" }])),
    );
    await expect(ports.send(chunk())).rejects.toMatchObject({
      code: "SIMULATION_FAILED",
    });
    expect(send).not.toHaveBeenCalled();
  });

  it("rechecks the wallet after the estimate and before requesting a transaction", async () => {
    const { dapp, account, toolkit, send } = setup();
    toolkit.estimate.transfer.mockImplementationOnce(async () => {
      account.network.type = "mainnet";
      return {};
    });
    await expect(
      createPorts(dapp, run("mvrk"), vi.fn(), () => true).send(chunk()),
    ).rejects.toMatchObject({ code: "SCOPE_CHANGED" });
    expect(send).not.toHaveBeenCalled();
  });

  it("leaves a lost wallet response ambiguous while recognizing an explicit rejection", async () => {
    const { dapp, send } = setup();
    const ports = createPorts(dapp, run("mvrk"), vi.fn(), () => true);
    const timeout = new Error("response lost");
    send.mockRejectedValueOnce(timeout);
    await expect(ports.send(chunk())).rejects.toBe(timeout);
    send.mockRejectedValueOnce({ errorType: "ABORTED_ERROR" });
    await expect(ports.send(chunk())).rejects.toMatchObject({
      code: "USER_REJECTED",
    });
  });
});
