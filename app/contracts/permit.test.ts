import { afterEach, describe, expect, it, vi } from "vitest";
import { Schema } from "@mavrykdynamics/taquito-michelson-encoder";
import quoteScript from "../../docs/fixtures/permit-deployment/quote_token-script.json";
import orderbookScript from "../../docs/fixtures/permit-deployment/orderbook-script.json";
import rwaScript from "../../docs/fixtures/permit-deployment/rwa_token-script.json";
import orderbookVectors from "../../docs/fixtures/permit-deployment/orderbook-signature-vectors.json";
import vectorFile from "../../docs/fixtures/permit-deployment/signature-vectors.json";
import configFile from "../../docs/fixtures/permit-deployment/relay-config.json";
import sellLambda from "../../docs/fixtures/permit-deployment/lambdaPlaceSellOrder.json";
import lambdaFile from "../../docs/fixtures/permit-deployment/lambdaPermitAndExecute.json";
import { relayConfigSchema } from "~/lib/apis/rwa/relay/relay.schema";
import {
  assertPermitSigner,
  encodePermit,
  findAnnotation,
  hashBytes,
  scriptFingerprint,
  verifyPermitSignature,
} from "./permitCodec";
import { permitGeneration } from "./permitGeneration";
import {
  createReviewRuntime,
  preparePermit,
  signPreparedPermit,
  assertPermitCurrent,
  type PermitRuntime,
  type PermitScope,
} from "./permit";
import type { PermitRequest } from "./orderbookPermit";
import { generateKeyPairFromSeed, sign } from "@stablelib/ed25519";
import { hash } from "@stablelib/blake2b";
import {
  b58cencode,
  getPkhfromPk,
  hex2buf,
  prefix,
  Prefix,
} from "@mavrykdynamics/taquito-utils";

const entry = findAnnotation(
  quoteScript.code.find((n) => n.prim === "parameter"),
  "%permitAndExecute"
);
const actionType = findAnnotation(entry, "%action");
const vector = vectorFile.vectors[0];
const config = relayConfigSchema.parse(configFile);
const book = {
  address: config.contracts.find((c) => c.kind === "orderbook")!.address,
  baseTokenAddress: "KT1XbAtSp5i1GJZTHzjc5J8SYkcEE8kqtkSv",
  rwaTokenId: "0",
  quoteTokenAddress: vector.contract,
  quoteTokenId: "0",
  currencyKey: "USDT",
  tickSize: "100000",
  quantityTickSize: "10000",
  minBuyOrderAmount: "1",
  minBuyOrderValue: "1",
  minSellOrderAmount: "1",
  minSellOrderValue: "1",
};

export function permitFixture() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-22T13:45:01Z"));
  let scope: PermitScope = {
    wallet: vector.wallet,
    authenticatedWallet: vector.wallet,
    network: "basenet",
    rpcUrl: "https://basenet.rpc.mavryk.network",
    chainId: vector.chainId,
    apiUrl: "https://test-api.rwa.equiteez.com/api/v1/",
    revision: 1,
  };
  const counter = vi.fn().mockResolvedValue("0");
  const getActiveAccount = vi.fn(async () => ({
    address: scope.wallet,
    publicKey: vector.publicKey,
    network: { type: scope.network, rpcUrl: scope.rpcUrl },
  }));
  const requestSignPayload = vi
    .fn()
    .mockResolvedValue({ signature: vector.signature });
  const toTransferParams = vi.fn((items: unknown) => ({
    to: vector.contract,
    amount: 0,
    parameter: {
      entrypoint: "permitAndExecute",
      value: new Schema(entry).Encode(items),
    },
  }));
  const quote = {
    script: structuredClone(quoteScript),
    contractViews: { getPermitCounter: () => ({ executeView: counter }) },
    methodsObject: {
      permitAndExecute: (items: unknown) => ({
        toTransferParams: () => toTransferParams(items),
      }),
    },
  };
  const currencyGet = vi.fn().mockResolvedValue({
    tokenContractAddress: vector.contract,
    tokenId: "0",
    decimals: "6",
  });
  const bookContract = {
    script: orderbookScript,
    storage: vi.fn().mockResolvedValue({
      rwaTokenAddress: book.baseTokenAddress,
      rwaTokenDecimals: "6",
      currencyLedger: { get: currencyGet },
      config: {
        priceTickSize: book.tickSize,
        quantityTickSize: book.quantityTickSize,
        minBuyOrderAmount: "1",
        minBuyOrderValue: "1",
        minSellOrderAmount: "1",
        minSellOrderValue: "1",
      },
    }),
  };
  const runtime = {
    tezos: {
      wallet: { pkh: vi.fn(async () => scope.wallet) },
      rpc: {
        getRpcUrl: () => scope.rpcUrl,
        getChainId: vi.fn(async () => scope.chainId),
        getBlockHeader: vi
          .fn()
          .mockResolvedValue({ timestamp: "2026-10-22T13:45:00Z" }),
      },
      contract: {
        at: vi.fn(async (address: string) =>
          address === book.address ? bookContract : quote
        ),
      },
    },
    client: { getActiveAccount, requestSignPayload },
    getScope: () => scope,
    refreshConfig: vi.fn(async () => config),
  } as unknown as PermitRuntime;
  const request: PermitRequest = {
    kind: "update_operators",
    book,
    side: "buy",
  };
  return {
    runtime,
    request,
    counter,
    quote,
    currencyGet,
    requestSignPayload,
    getActiveAccount,
    toTransferParams,
    changeScope: (change: Partial<PermitScope>) => {
      scope = { ...scope, ...change };
    },
  };
}
afterEach(() => vi.useRealTimers());

describe("permit generation evidence", () => {
  it.each([
    ["orderbook", orderbookScript],
    ["quote_token", quoteScript],
    ["rwa_token", rwaScript],
  ] as const)("pins %s executable code", (kind, script) => {
    expect(scriptFingerprint(script.code)).toBe(permitGeneration[kind]);
  });
  it("ignores the RPC endpoint's top-level section order", () => {
    // `/contracts/{a}` (Taquito) lists views last; `/script` lists them first.
    const code = quoteScript.code;
    const viewsFirst = [
      ...code.filter((n) => n.prim === "view"),
      ...code.filter((n) => n.prim !== "view"),
    ];
    const viewsLast = [
      ...code.filter((n) => n.prim !== "view"),
      ...code.filter((n) => n.prim === "view"),
    ];
    expect(scriptFingerprint(viewsFirst)).toBe(permitGeneration.quote_token);
    expect(scriptFingerprint(viewsLast)).toBe(permitGeneration.quote_token);
    expect(scriptFingerprint([...viewsLast].slice(1))).not.toBe(
      permitGeneration.quote_token
    );
  });
  it("pins the separately stored orderbook execution lambda", () =>
    expect(hashBytes(lambdaFile.bytes)).toBe(permitGeneration.orderbookLambda));
  it("pins the sell lambda establishing RWA token ID zero", () =>
    expect(hashBytes(sellLambda.bytes)).toBe(
      permitGeneration.orderbookSellLambda
    ));
  it.each([...vectorFile.vectors, ...orderbookVectors.vectors])(
    "matches RPC-accepted $curve packing and signature",
    (v) => {
      const testedActionType =
        v.contract === vector.contract
          ? actionType
          : findAnnotation(
              findAnnotation(
                orderbookScript.code.find((n) => n.prim === "parameter"),
                "%permitAndExecute"
              ),
              "%action"
            );
      const encoded = encodePermit({
        actionType: testedActionType,
        action: v.action,
        chainId: v.chainId,
        contract: v.contract,
        counter: v.counter,
        deadline: v.deadline,
      });
      expect(encoded.actionBytes).toBe(v.actionBytes);
      expect(encoded.actionHash).toBe(v.actionHash);
      expect(encoded.payload).toBe(v.payload);
      expect(v.rpcVerification.status).toBe(200);
      expect(() =>
        verifyPermitSignature(
          encoded.payload,
          v.publicKey,
          v.signature,
          v.wallet
        )
      ).not.toThrow();
      for (const change of [
        { counter: "1" },
        { deadline: String(BigInt(v.deadline) + 1n) },
        {
          contract:
            v.contract === book.address ? vector.contract : book.address,
        },
        { chainId: "NetXdQprcVkpaWU" },
      ]) {
        const altered = encodePermit({
          actionType: testedActionType,
          action: v.action,
          chainId: v.chainId,
          contract: v.contract,
          counter: v.counter,
          deadline: v.deadline,
          ...change,
        });
        expect(() =>
          verifyPermitSignature(
            altered.payload,
            v.publicKey,
            v.signature,
            v.wallet
          )
        ).toThrow();
      }
      expect(() =>
        verifyPermitSignature(
          encoded.payload,
          v.publicKey,
          v.signature.slice(0, -1) + "0",
          v.wallet
        )
      ).toThrow();
      expect(() =>
        verifyPermitSignature(
          hashBytes(encoded.payload),
          v.publicKey,
          v.signature,
          v.wallet
        )
      ).toThrow();
    }
  );
  it("rejects mismatched public keys and unsupported curves", () => {
    expect(() =>
      assertPermitSigner(
        vector.publicKey,
        "mv1DXLvsp4T7X6gXLHn7szGN7WLooy14fQ3G"
      )
    ).toThrow();
    expect(() => assertPermitSigner("BLpkunsupported", vector.wallet)).toThrow(
      "curve"
    );
  });
});

describe("reviewed permit signing", () => {
  it("signs the raw payload once and returns exact transfer params without submission", async () => {
    const f = permitFixture();
    const prepared = await preparePermit(f.runtime, f.request, vector.deadline);
    expect(prepared.payload).toBe(vector.payload);
    expect(Object.isFrozen(prepared.built.action)).toBe(true);
    const signed = await signPreparedPermit(f.runtime, prepared);
    expect(f.requestSignPayload).toHaveBeenCalledWith({
      signingType: "micheline",
      payload: vector.payload,
      sourceAddress: vector.wallet,
    });
    expect(signed.operation).toEqual(vector.operation);
    expect(signed.ordinary?.permitCounter).toBe("0");
    expect(signed.topUp).toBeNull();
    await expect(signPreparedPermit(f.runtime, prepared)).rejects.toThrow(
      "again"
    );
  });
  it("rejects stale counters before signing an older review", async () => {
    const f = permitFixture();
    const p = await preparePermit(f.runtime, f.request, vector.deadline);
    f.counter.mockResolvedValue("1");
    const now = Date.now();
    const clock = vi.spyOn(Date, "now").mockReturnValue(now + 11_000);
    try {
      await expect(signPreparedPermit(f.runtime, p)).rejects.toThrow("counter");
    } finally {
      clock.mockRestore();
    }
    expect(f.requestSignPayload).not.toHaveBeenCalled();
  });
  it("signs a fresh review without re-reading it, then rechecks", async () => {
    const f = permitFixture();
    const p = await preparePermit(f.runtime, f.request, vector.deadline);
    // Consumed between review and prompt: caught right after signing.
    f.counter.mockResolvedValue("1");
    await expect(signPreparedPermit(f.runtime, p)).rejects.toThrow("counter");
    expect(f.requestSignPayload).toHaveBeenCalledOnce();
    expect(f.toTransferParams).not.toHaveBeenCalled();
  });
  it.each([
    "wallet",
    "authenticatedWallet",
    "chainId",
    "apiUrl",
    "rpcUrl",
    "network",
    "revision",
  ] as const)("rejects %s changes during the wallet response", async (key) => {
    const f = permitFixture();
    const p = await preparePermit(f.runtime, f.request, vector.deadline);
    f.requestSignPayload.mockImplementation(async () => {
      f.changeScope({ [key]: key === "revision" ? 2 : "changed" });
      return { signature: vector.signature };
    });
    await expect(signPreparedPermit(f.runtime, p)).rejects.toThrow();
    expect(f.toTransferParams).not.toHaveBeenCalled();
  });
  it("rejects a counter consumed during the prompt", async () => {
    const f = permitFixture();
    const p = await preparePermit(f.runtime, f.request, vector.deadline);
    f.requestSignPayload.mockImplementation(async () => {
      f.counter.mockResolvedValue("1");
      return { signature: vector.signature };
    });
    await expect(signPreparedPermit(f.runtime, p)).rejects.toThrow("counter");
  });
  it("rejects altered signatures locally", async () => {
    const f = permitFixture();
    const p = await preparePermit(f.runtime, f.request, vector.deadline);
    f.requestSignPayload.mockResolvedValue({ signature: "invalid" });
    await expect(signPreparedPermit(f.runtime, p)).rejects.toThrow();
    expect(f.toTransferParams).not.toHaveBeenCalled();
  });
  it("does not treat wallet rejection as completion", async () => {
    const f = permitFixture();
    const p = await preparePermit(f.runtime, f.request, vector.deadline);
    f.requestSignPayload.mockRejectedValue(new Error("Rejected"));
    await expect(signPreparedPermit(f.runtime, p)).rejects.toThrow("Rejected");
  });
  it("rejects changed config and expired review", async () => {
    const f = permitFixture();
    const p = await preparePermit(f.runtime, f.request, vector.deadline);
    vi.mocked(f.runtime.refreshConfig).mockResolvedValue({
      ...config,
      enabled: false,
    });
    await expect(assertPermitCurrent(f.runtime, p)).rejects.toThrow(
      "RELAY_DISABLED"
    );
    vi.mocked(f.runtime.refreshConfig).mockResolvedValue(config);
    vi.setSystemTime(new Date(Number(vector.deadline) * 1000));
    await expect(assertPermitCurrent(f.runtime, p)).rejects.toThrow("expired");
  });
  it("rejects unknown executable generations", async () => {
    const f = permitFixture();
    f.quote.script.code = [];
    await expect(
      preparePermit(f.runtime, f.request, vector.deadline)
    ).rejects.toThrow("generation");
  });
  it("rejects changed token/book relationships", async () => {
    const f = permitFixture();
    f.currencyGet.mockResolvedValue({
      tokenContractAddress: book.baseTokenAddress,
      tokenId: "0",
    });
    await expect(
      preparePermit(f.runtime, f.request, vector.deadline)
    ).rejects.toThrow("relationship");
  });
  it.each(["destination", "amount", "entrypoint", "batch", "payload"])(
    "rejects invalid %s transfer output",
    async (field) => {
      const f = permitFixture();
      const p = await preparePermit(f.runtime, f.request, vector.deadline);
      const transfer = structuredClone(vector.operation);
      if (field === "destination") transfer.to = book.address;
      if (field === "amount") transfer.amount = 1;
      if (field === "entrypoint") transfer.parameter.entrypoint = "transfer";
      if (field === "payload")
        transfer.parameter.value[0].args[0].string =
          vectorFile.vectors[1].publicKey;
      if (field === "batch")
        transfer.parameter.value.push(transfer.parameter.value[0]);
      f.toTransferParams.mockReturnValue(transfer);
      await expect(signPreparedPermit(f.runtime, p)).rejects.toThrow(
        "transfer"
      );
    }
  );
  it("signs a top-up and posts the exact signed deadline as RFC3339 seconds", async () => {
    const f = permitFixture();
    // A throwaway ed25519 key so the wallet signature verifies locally.
    const key = generateKeyPairFromSeed(new Uint8Array(32).fill(7));
    const publicKey = b58cencode(key.publicKey, prefix[Prefix.EDPK]);
    const wallet = getPkhfromPk(publicKey);
    f.changeScope({ wallet, authenticatedWallet: wallet });
    f.getActiveAccount.mockImplementation(async () => ({
      address: wallet,
      publicKey,
      network: {
        type: "basenet",
        rpcUrl: "https://basenet.rpc.mavryk.network",
      },
    }));
    f.requestSignPayload.mockImplementation(
      async ({ payload }: { payload: string }) => ({
        signature: b58cencode(
          sign(key.secretKey, hash(hex2buf(payload), 32)),
          prefix[Prefix.EDSIG]
        ),
      })
    );
    const p = await preparePermit(
      f.runtime,
      { kind: "fee_top_up", amountUnits: "5000000" },
      vector.deadline
    );
    expect(p.built.action).toMatchObject({
      permitTransfer: [{ from_: wallet }],
    });
    const signed = await signPreparedPermit(f.runtime, p);
    expect(f.requestSignPayload).toHaveBeenCalledOnce();
    expect(signed.ordinary).toBeNull();
    expect(signed.topUp).toEqual({
      publicKey,
      signature: expect.stringMatching(/^edsig/),
      amountUnits: "5000000",
      deadline: "2026-10-22T14:00:00Z",
    });
    expect(new Date(signed.topUp!.deadline).getTime() / 1000).toBe(
      Number(vector.deadline)
    );
  });
});

describe("review runtime", () => {
  it("reads the relay config once per review", async () => {
    const f = permitFixture();
    const review = createReviewRuntime(f.runtime);
    await review.refreshConfig();
    await preparePermit(review, f.request, vector.deadline);
    expect(f.runtime.refreshConfig).toHaveBeenCalledOnce();
    // A new review (and the post-signature recheck) reads it again.
    await createReviewRuntime(f.runtime).refreshConfig();
    expect(f.runtime.refreshConfig).toHaveBeenCalledTimes(2);
  });
  it("loads each contract once, but storage and counters stay live", async () => {
    const f = permitFixture();
    const review = createReviewRuntime(f.runtime);
    const at = vi.mocked(f.runtime.tezos.contract.at);
    await review.tezos.contract.at(book.address);
    await review.tezos.contract.at(book.address);
    await review.tezos.contract.at(vector.contract);
    expect(at).toHaveBeenCalledTimes(2);
    await preparePermit(review, f.request, vector.deadline);
    expect(at).toHaveBeenCalledTimes(2);
    expect(f.counter).toHaveBeenCalledOnce();
  });
  it("retries a failed contract read and forwards the rest of the toolkit", async () => {
    const f = permitFixture();
    const at = vi.mocked(f.runtime.tezos.contract.at);
    at.mockRejectedValueOnce(new Error("502"));
    const review = createReviewRuntime(f.runtime);
    await expect(review.tezos.contract.at(book.address)).rejects.toThrow("502");
    await expect(review.tezos.contract.at(book.address)).resolves.toBeDefined();
    expect(review.tezos.rpc.getRpcUrl()).toBe(f.runtime.tezos.rpc.getRpcUrl());
  });
});
