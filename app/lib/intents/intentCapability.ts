/**
 * Operation capability and idempotency key (backend.md §2).
 *
 * The capability is 32 cryptographically random bytes, canonical base64url
 * without padding (43 characters). It is not a login token, wallet signature
 * or 1Click key; only its SHA-256 is stored server-side and it cannot be
 * recovered. A fresh one is generated for every new transfer intent.
 */
const CAPABILITY = /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/;
const IDEMPOTENCY_KEY = /^[!-~]{8,128}$/;

const randomBytes = (length: number) => {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues)
    throw new Error("Secure random numbers are unavailable in this browser.");
  return cryptoApi.getRandomValues(new Uint8Array(length));
};

export function newOperationCapability() {
  const bytes = randomBytes(32);
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

/** 43 base64url characters whose last one carries no stray bits. */
export const isOperationCapability = (value: string) => CAPABILITY.test(value);

/** 8–128 visible ASCII characters without whitespace. */
export const isIdempotencyKey = (value: string) => IDEMPOTENCY_KEY.test(value);

export function newIdempotencyKey() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}
