import { BigNumber } from "bignumber.js";

import { blake2b256, bytesToHex } from "~/lib/mavryk/keys";

/**
 * Plain data of an intent: BigNumbers become decimal strings; functions,
 * toolkits and undefined values are dropped.
 */
export function normalizeIntent(value: unknown): unknown {
  if (BigNumber.isBigNumber(value)) return value.toFixed();
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "function" || value === undefined) return undefined;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(normalizeIntent);

  const prototype = Object.getPrototypeOf(value);

  // Class instances (toolkits, contracts) are not part of an intent
  if (prototype !== Object.prototype && prototype !== null) return undefined;

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => [key, normalizeIntent(entry)] as const)
      .filter(([, entry]) => entry !== undefined)
  );
}

/** JSON with sorted keys, so equal intents serialize identically. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`);

  return `{${entries.join(",")}}`;
}

/**
 * Fingerprint of a reviewed business intent (action, contract, amounts as
 * decimal strings, …). The same intent always yields the same fingerprint, so
 * an unresolved attempt blocks its exact duplicate.
 */
export function fingerprintIntent(intent: Record<string, unknown>): string {
  return bytesToHex(
    blake2b256(new TextEncoder().encode(stableStringify(intent)))
  );
}
