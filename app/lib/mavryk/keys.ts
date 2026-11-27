/**
 * Mavryk key, address and signature encoding for ed25519 wallets whose public
 * key comes from outside a Mavryk wallet, e.g. a Dynamic embedded wallet,
 * which exposes the key as a Solana address.
 *
 * Pure functions, no network. See docs/dynamic-wallet.md §3.4 and §3.6.
 *
 *   pk32      = base58_decode(solanaAddress)            exactly 32 bytes
 *   publicKey = Base58Check(EDPK_PREFIX || pk32)         edpk...
 *   address   = Base58Check(MV1_PREFIX || BLAKE2b-160(pk32))   mv1...
 *
 * The Solana address is not a Mavryk address: never show or send it as one.
 */
import { blake2b } from "@noble/hashes/blake2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { ed25519 } from "@noble/curves/ed25519.js";
import {
  b58cencode,
  getPkhfromPk,
  Prefix,
  prefix,
} from "@mavrykdynamics/taquito-utils";
import bs58 from "bs58";

export const ED25519_PUBLIC_KEY_LENGTH = 32;
export const ED25519_SIGNATURE_LENGTH = 64;
export const DIGEST_LENGTH = 32;

/** Watermark for manager operations (reveal, transaction). */
export const OPERATION_WATERMARK = 0x03;

export class InvalidKeyMaterialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidKeyMaterialError";
  }
}

export type MavrykKeys = {
  /** Raw ed25519 public key */
  pk32: Uint8Array;
  /** edpk... */
  publicKey: string;
  /** mv1... */
  address: string;
};

function assertLength(bytes: Uint8Array, expected: number, label: string) {
  if (bytes.length !== expected) {
    throw new InvalidKeyMaterialError(
      `${label} must be ${expected} bytes, got ${bytes.length}`
    );
  }
}

/** Decodes even-length hex without a 0x prefix; throws on anything else. */
export function decodeHex(hex: string, label = "Hex"): Uint8Array {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) {
    throw new InvalidKeyMaterialError(`${label} is not valid hex`);
  }

  return hexToBytes(hex);
}

export { bytesToHex };

/** The raw ed25519 public key behind a Solana-style base58 address. */
export function solAddressToPk32(solAddress: string): Uint8Array {
  let pk32: Uint8Array;

  try {
    pk32 = bs58.decode(solAddress);
  } catch {
    throw new InvalidKeyMaterialError("Wallet address is not valid base58");
  }

  assertLength(pk32, ED25519_PUBLIC_KEY_LENGTH, "Wallet public key");
  return pk32;
}

export function pk32ToEdpk(pk32: Uint8Array): string {
  assertLength(pk32, ED25519_PUBLIC_KEY_LENGTH, "Public key");
  return b58cencode(pk32, prefix[Prefix.EDPK]);
}

/** mv1 address of an edpk key: Base58Check(MV1 || BLAKE2b-160(pk32)). */
export function edpkToMv1(edpk: string): string {
  return getPkhfromPk(edpk);
}

export function deriveMavrykKeys(solAddress: string): MavrykKeys {
  const pk32 = solAddressToPk32(solAddress);
  const publicKey = pk32ToEdpk(pk32);

  return { pk32, publicKey, address: edpkToMv1(publicKey) };
}

/** edsig... – the generic ed25519 signature encoding RWA and wallets expect. */
export function sig64ToEdsig(sig64: Uint8Array): string {
  assertLength(sig64, ED25519_SIGNATURE_LENGTH, "Signature");
  return b58cencode(sig64, prefix[Prefix.EDSIG]);
}

/** sig... – the curve-agnostic encoding taquito's Signer returns as `sig`. */
export function sig64ToSig(sig64: Uint8Array): string {
  assertLength(sig64, ED25519_SIGNATURE_LENGTH, "Signature");
  return b58cencode(sig64, prefix[Prefix.SIG]);
}

/** Decodes a base58 (no checksum) signature, as Dynamic returns it. */
export function base58SignatureToSig64(signature: string): Uint8Array {
  let sig64: Uint8Array;

  try {
    sig64 = bs58.decode(signature);
  } catch {
    throw new InvalidKeyMaterialError("Signature is not valid base58");
  }

  assertLength(sig64, ED25519_SIGNATURE_LENGTH, "Signature");
  return sig64;
}

export function blake2b256(bytes: Uint8Array): Uint8Array {
  return blake2b(bytes, { dkLen: DIGEST_LENGTH });
}

/**
 * Digest signed for complete PACK bytes (RWA login challenge, permits):
 * BLAKE2b-256(packed). The packed bytes already start with 05 – no extra
 * watermark is added.
 */
export function packedDigest(packedHex: string): Uint8Array {
  return blake2b256(decodeHex(packedHex, "Packed payload"));
}

/** Digest signed for a forged manager operation: BLAKE2b-256(03 || forged). */
export function operationDigest(forgedHex: string): Uint8Array {
  const forged = decodeHex(forgedHex, "Forged operation");
  const watermarked = new Uint8Array(forged.length + 1);

  watermarked[0] = OPERATION_WATERMARK;
  watermarked.set(forged, 1);

  return blake2b256(watermarked);
}

/**
 * Verifies a raw ed25519 signature over a 32-byte digest. Never throws:
 * malformed input is simply not a valid signature.
 */
export function verifyDigestSignature(
  sig64: Uint8Array,
  digest: Uint8Array,
  pk32: Uint8Array
): boolean {
  if (
    sig64.length !== ED25519_SIGNATURE_LENGTH ||
    digest.length !== DIGEST_LENGTH ||
    pk32.length !== ED25519_PUBLIC_KEY_LENGTH
  ) {
    return false;
  }

  try {
    return ed25519.verify(sig64, digest, pk32);
  } catch {
    return false;
  }
}
