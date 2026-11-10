import { blake2b256, bytesToHex } from "~/lib/mavryk/keys";

/** JSON with sorted keys, so equal intents serialize identically. */
function stableStringify(value: unknown): string {
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
