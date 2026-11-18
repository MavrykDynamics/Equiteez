import { describe, expect, it, vi } from "vitest";
import { ed25519 } from "@noble/curves/ed25519.js";
import { MavrykToolkit, OpKind } from "@mavrykdynamics/taquito";
import { LocalForger } from "@mavrykdynamics/taquito-local-forging";
import { InMemorySigner } from "@mavrykdynamics/taquito-signer";
import { b58cencode, Prefix, prefix } from "@mavrykdynamics/taquito-utils";
import bs58 from "bs58";

import { deriveMavrykKeys, operationDigest } from "~/lib/mavryk/keys";
import { MavrykChainId } from "~/lib/mavryk/types";

import {
  DynamicMavrykSigner,
  UnexpectedOperationContentsError,
  UnsupportedSigningDomainError,
} from "./DynamicMavrykSigner";
import {
  expectOperation,
  OperationMismatchError,
} from "~/services/direct/expectedOperation";

import {
  createDynamicToolkit,
  WrongNetworkError,
} from "./dynamicToolkit.client";
import type {
  DynamicClient,
  DynamicWalletIdentity,
} from "./dynamicClient.client";

// Public test keys: never hold funds
const SEED = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
const OTHER_SEED = new Uint8Array(32).fill(9);
const keysOf = (seed: Uint8Array) =>
  deriveMavrykKeys(bs58.encode(ed25519.getPublicKey(seed)));
const KEYS = keysOf(SEED);
const OTHER = keysOf(OTHER_SEED);
const BRANCH = b58cencode(new Uint8Array(32), prefix[Prefix.B]);

const forger = new LocalForger();

const manager = (source: string, counter: string) => ({
  source,
  fee: "1000",
  counter,
  gas_limit: "2000",
  storage_limit: "300",
});

const forgeContents = (contents: object[]) =>
  forger.forge({ branch: BRANCH, contents } as Parameters<
    LocalForger["forge"]
  >[0]);

const revealAndTransfer = (source = KEYS.address, publicKey = KEYS.publicKey) =>
  forgeContents([
    {
      kind: OpKind.REVEAL,
      ...manager(source, "1"),
      public_key: publicKey,
    },
    {
      kind: OpKind.TRANSACTION,
      ...manager(source, "2"),
      amount: "1000",
      destination: OTHER.address,
    },
  ]);

const createSigner = (
  overrides: Partial<ConstructorParameters<typeof DynamicMavrykSigner>[0]> = {}
) => {
  const signDigest = vi.fn(async (digest: Uint8Array) =>
    ed25519.sign(digest, SEED)
  );

  return {
    signDigest,
    signer: new DynamicMavrykSigner({ keys: KEYS, signDigest, ...overrides }),
  };
};

const referenceSigner = () =>
  new InMemorySigner(b58cencode(SEED, prefix[Prefix.EDSK2]));

describe("DynamicMavrykSigner", () => {
  it("exposes the wallet's Mavryk identity and no secret key", async () => {
    const { signer } = createSigner();

    expect(await signer.publicKey()).toBe(KEYS.publicKey);
    expect(await signer.publicKeyHash()).toBe(KEYS.address);
    expect(await signer.secretKey()).toBeUndefined();
  });

  it("signs a reveal + transfer exactly like InMemorySigner", async () => {
    const forged = await revealAndTransfer();
    const { signer, signDigest } = createSigner();

    const signed = await signer.sign(forged, new Uint8Array([3]));
    const reference = await referenceSigner().sign(forged, new Uint8Array([3]));

    expect(signed).toEqual(reference);
    // The wallet gets the 03-watermarked digest, hashed once
    expect(signDigest).toHaveBeenCalledWith(operationDigest(forged));
  });

  it.each([
    ["no watermark", undefined],
    ["the PACK watermark 05", new Uint8Array([5])],
    ["a block watermark", new Uint8Array([0x11])],
    ["a multi-byte watermark", new Uint8Array([3, 0])],
  ])("refuses %s", async (_, magicByte) => {
    const { signer, signDigest } = createSigner();

    await expect(
      signer.sign(await revealAndTransfer(), magicByte)
    ).rejects.toBeInstanceOf(UnsupportedSigningDomainError);
    expect(signDigest).not.toHaveBeenCalled();
  });

  it("refuses bytes that are not valid hex or not an operation", async () => {
    const { signer, signDigest } = createSigner();

    await expect(signer.sign("abc", new Uint8Array([3]))).rejects.toThrow();
    await expect(signer.sign("00", new Uint8Array([3]))).rejects.toBeInstanceOf(
      UnexpectedOperationContentsError
    );
    expect(signDigest).not.toHaveBeenCalled();
  });

  it("refuses an operation from another source", async () => {
    const { signer, signDigest } = createSigner();

    await expect(
      signer.sign(
        await revealAndTransfer(OTHER.address, OTHER.publicKey),
        new Uint8Array([3])
      )
    ).rejects.toBeInstanceOf(UnexpectedOperationContentsError);
    expect(signDigest).not.toHaveBeenCalled();
  });

  it("refuses a reveal of another key", async () => {
    const { signer } = createSigner();

    await expect(
      signer.sign(
        await revealAndTransfer(KEYS.address, OTHER.publicKey),
        new Uint8Array([3])
      )
    ).rejects.toBeInstanceOf(UnexpectedOperationContentsError);
  });

  it("refuses kinds the app never sends, such as a delegation", async () => {
    const { signer } = createSigner();
    const delegation = await forgeContents([
      {
        kind: OpKind.DELEGATION,
        ...manager(KEYS.address, "1"),
        delegate: OTHER.address,
      },
    ]);

    await expect(
      signer.sign(delegation, new Uint8Array([3]))
    ).rejects.toBeInstanceOf(UnexpectedOperationContentsError);
  });

  it("lets the caller veto the decoded operation before signing", async () => {
    const beforeSign = vi.fn(() => {
      throw new Error("does not match the reviewed order");
    });
    const { signer, signDigest } = createSigner({ beforeSign });

    await expect(
      signer.sign(await revealAndTransfer(), new Uint8Array([3]))
    ).rejects.toThrow("does not match the reviewed order");
    expect(beforeSign).toHaveBeenCalledWith(
      expect.objectContaining({ branch: BRANCH })
    );
    expect(signDigest).not.toHaveBeenCalled();
  });
});

describe("createDynamicToolkit", () => {
  const identity: DynamicWalletIdentity = {
    ...KEYS,
    walletId: "w1",
    solAddress: bs58.encode(KEYS.pk32),
  };
  const client = {} as DynamicClient;

  const toolkitOnChain = (chainId: string) => (rpcUrl: string) => {
    const toolkit = new MavrykToolkit(rpcUrl);
    vi.spyOn(toolkit.rpc, "getChainId").mockResolvedValue(chainId);
    return toolkit;
  };

  it("builds a toolkit whose wallet is the Dynamic wallet", async () => {
    const toolkit = await createDynamicToolkit({
      client,
      identity,
      rpcUrl: "https://rpc.test",
      expectedChainId: MavrykChainId.Basenet,
      createToolkit: toolkitOnChain(MavrykChainId.Basenet),
    });

    expect(await toolkit.signer.publicKeyHash()).toBe(KEYS.address);
    // The default wallet provider forwards to this signer, not Beacon
    expect(await toolkit.wallet.pkh()).toBe(KEYS.address);
  });

  it("signs only the operation the app registered as reviewed", async () => {
    const toolkit = await createDynamicToolkit({
      client,
      identity,
      rpcUrl: "https://rpc.test",
      expectedChainId: MavrykChainId.Basenet,
      createToolkit: toolkitOnChain(MavrykChainId.Basenet),
    });
    const forged = await revealAndTransfer();

    // Nothing reviewed for this toolkit: refused before the wallet is asked
    await expect(
      toolkit.signer.sign(forged, new Uint8Array([3]))
    ).rejects.toBeInstanceOf(OperationMismatchError);

    // Reviewed something else: refused too
    const release = expectOperation(toolkit, [
      { to: OTHER.address, amount: "0.002" },
    ]);
    await expect(
      toolkit.signer.sign(forged, new Uint8Array([3]))
    ).rejects.toBeInstanceOf(OperationMismatchError);
    release();
  });

  it("refuses a node on another network before attaching a signer", async () => {
    const setSignerProvider = vi.fn();

    await expect(
      createDynamicToolkit({
        client,
        identity,
        rpcUrl: "https://rpc.test",
        expectedChainId: MavrykChainId.Basenet,
        createToolkit: (rpcUrl) => {
          const toolkit = toolkitOnChain(MavrykChainId.Mainnet)(rpcUrl);
          toolkit.setSignerProvider = setSignerProvider;
          return toolkit;
        },
      })
    ).rejects.toBeInstanceOf(WrongNetworkError);
    expect(setSignerProvider).not.toHaveBeenCalled();
  });
});
