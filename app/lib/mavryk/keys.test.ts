import { describe, expect, it, vi } from "vitest";
import { ed25519 } from "@noble/curves/ed25519.js";
import { InMemorySigner } from "@mavrykdynamics/taquito-signer";
import {
  b58cencode,
  Prefix,
  prefix,
  verifySignature,
} from "@mavrykdynamics/taquito-utils";
import bs58 from "bs58";

import {
  base58SignatureToSig64,
  bytesToHex,
  decodeHex,
  deriveMavrykKeys,
  InvalidKeyMaterialError,
  operationDigest,
  packedDigest,
  pk32ToEdpk,
  sig64ToEdsig,
  sig64ToSig,
  solAddressToPk32,
  verifyDigestSignature,
} from "./keys";

vi.mock("~/providers/WalletProvider/WalletCore.client", () => ({
  dappClient: vi.fn(),
}));

// Public test key: never holds funds. Seed bytes 0x01..0x20.
const SEED = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
const PK32 = ed25519.getPublicKey(SEED);
// What Dynamic exposes for this key: the Solana-style base58 address
const SOL_ADDRESS = bs58.encode(PK32);
// An independent signer built from the same key
const referenceSigner = () =>
  new InMemorySigner(b58cencode(SEED, prefix[Prefix.EDSK2]));

// Arbitrary forged-operation bytes; the signer does not parse them
const FORGED_HEX =
  "a99b946c97ada0f42c1bdeae0383db7893351232a832d00d0cd716eb6f66e5616c00" +
  "e7670f32038107a59a2b9cfefae36ea21f5aa63c8f01d5c10b904e00";

describe("Mavryk keys from a Dynamic ed25519 wallet", () => {
  it("derives the same edpk and mv1 as taquito's InMemorySigner", async () => {
    const signer = referenceSigner();
    const keys = deriveMavrykKeys(SOL_ADDRESS);

    expect(keys.pk32).toEqual(PK32);
    expect(keys.publicKey).toBe(await signer.publicKey());
    expect(keys.address).toBe(await signer.publicKeyHash());
    expect(keys.address.startsWith("mv1")).toBe(true);
    expect(keys.publicKey.startsWith("edpk")).toBe(true);
  });

  it("rejects addresses that are not a 32-byte base58 key", () => {
    expect(() => solAddressToPk32(bs58.encode(PK32.slice(0, 31)))).toThrow(
      InvalidKeyMaterialError
    );
    expect(() =>
      solAddressToPk32(bs58.encode(new Uint8Array([...PK32, 0])))
    ).toThrow(InvalidKeyMaterialError);
    // 0, O, I and l are not in the base58 alphabet
    expect(() => solAddressToPk32("0OIl")).toThrow(InvalidKeyMaterialError);
    // A Mavryk address is base58check with a prefix, not a raw key
    expect(() =>
      solAddressToPk32(deriveMavrykKeys(SOL_ADDRESS).address)
    ).toThrow(InvalidKeyMaterialError);
  });

  it("rejects a public key of the wrong length", () => {
    expect(() => pk32ToEdpk(PK32.slice(1))).toThrow(InvalidKeyMaterialError);
  });
});

describe("Operation signing (03 watermark)", () => {
  it("produces the same sig and edsig as InMemorySigner for the same bytes", async () => {
    const reference = await referenceSigner().sign(
      FORGED_HEX,
      new Uint8Array([3])
    );
    const sig64 = ed25519.sign(operationDigest(FORGED_HEX), SEED);

    expect(sig64ToEdsig(sig64)).toBe(reference.prefixSig);
    expect(sig64ToSig(sig64)).toBe(reference.sig);
    // Injected bytes carry no watermark, only forged bytes + raw signature
    expect(FORGED_HEX + bytesToHex(sig64)).toBe(reference.sbytes);
  });

  it("verifies against the digest and key it was made for, and nothing else", () => {
    const digest = operationDigest(FORGED_HEX);
    const sig64 = ed25519.sign(digest, SEED);
    const otherKey = ed25519.getPublicKey(new Uint8Array(32).fill(7));
    const tamperedDigest = Uint8Array.from(digest);
    tamperedDigest[0] ^= 1;

    expect(verifyDigestSignature(sig64, digest, PK32)).toBe(true);
    expect(verifyDigestSignature(sig64, tamperedDigest, PK32)).toBe(false);
    expect(verifyDigestSignature(sig64, digest, otherKey)).toBe(false);
    expect(verifyDigestSignature(sig64.slice(1), digest, PK32)).toBe(false);
    // Signing the 64 hex characters instead of the 32 digest bytes is wrong
    expect(
      verifyDigestSignature(
        ed25519.sign(new TextEncoder().encode(bytesToHex(digest)), SEED),
        digest,
        PK32
      )
    ).toBe(false);
  });

  it("does not treat a packed (05) digest as an operation digest", () => {
    expect(bytesToHex(operationDigest(FORGED_HEX))).not.toBe(
      bytesToHex(packedDigest(FORGED_HEX))
    );
  });
});

describe("Packed-payload signing (RWA login)", () => {
  it("matches taquito's verifySignature, which hashes the packed bytes itself", async () => {
    const { buildAuthPayloadHex } = await import(
      "~/providers/AuthProvider/helpers/utils"
    );
    const packedHex = buildAuthPayloadHex("Sign in to Equiteez: nonce 42");
    const sig64 = ed25519.sign(packedDigest(packedHex), SEED);
    const { publicKey } = deriveMavrykKeys(SOL_ADDRESS);

    expect(verifySignature(packedHex, publicKey, sig64ToEdsig(sig64))).toBe(
      true
    );
  });

  it("uses the RWA double encoding, distinct from the other framings", async () => {
    const { buildAuthPayloadHex } = await import(
      "~/providers/AuthProvider/helpers/utils"
    );
    // For the message "AB" (docs/dynamic-wallet.md §12, §15.2)
    const rwaLogin = buildAuthPayloadHex("AB");
    const framings = ["054142", "0501000000024142", rwaLogin];

    expect(rwaLogin).toBe("05010000000434313432");
    expect(
      new Set(framings.map((hex) => bytesToHex(packedDigest(hex)))).size
    ).toBe(3);
  });
});

describe("Encoding helpers", () => {
  it("decodes Dynamic's base58 signature to 64 bytes", () => {
    const sig64 = ed25519.sign(operationDigest(FORGED_HEX), SEED);

    expect(base58SignatureToSig64(bs58.encode(sig64))).toEqual(sig64);
    expect(() => base58SignatureToSig64(bs58.encode(sig64.slice(2)))).toThrow(
      InvalidKeyMaterialError
    );
  });

  it("rejects malformed hex", () => {
    expect(() => decodeHex("abc")).toThrow(InvalidKeyMaterialError);
    expect(() => decodeHex("0x00")).toThrow(InvalidKeyMaterialError);
    expect(() => operationDigest("zz")).toThrow(InvalidKeyMaterialError);
  });
});
