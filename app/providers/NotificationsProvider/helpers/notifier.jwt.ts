export type NotifierJwtPayload = Record<string, unknown> & {
  exp?: unknown;
  token_type?: unknown;
  wallet_address?: unknown;
};

const JWT_PARTS_COUNT = 3;
const BASE64URL_PAD_LENGTH = 4;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const decodeBase64Url = (value: string): string | null => {
  if (typeof atob !== "function") {
    return null;
  }

  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = base64.length % BASE64URL_PAD_LENGTH;

  if (remainder === 1) {
    return null;
  }

  const padded =
    remainder === 0
      ? base64
      : base64.padEnd(
          base64.length + BASE64URL_PAD_LENGTH - remainder,
          "="
        );

  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
};

export const getNotifierJwtPayload = (
  token: string | null | undefined
): NotifierJwtPayload | null => {
  if (!token?.trim()) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== JWT_PARTS_COUNT || !parts[1]) {
    return null;
  }

  const decodedPayload = decodeBase64Url(parts[1]);

  if (!decodedPayload) {
    return null;
  }

  try {
    const payload = JSON.parse(decodedPayload);

    return isRecord(payload) ? payload : null;
  } catch {
    return null;
  }
};

export const getNotifierJwtExpiration = (
  token: string | null | undefined
): number | null => {
  const exp = getNotifierJwtPayload(token)?.exp;

  return typeof exp === "number" && Number.isFinite(exp) ? exp : null;
};

export const getNotifierJwtWalletAddress = (
  token: string | null | undefined
): string | null => {
  const walletAddress = getNotifierJwtPayload(token)?.wallet_address;

  return typeof walletAddress === "string" && walletAddress.trim()
    ? walletAddress
    : null;
};

export const isNotifierAccessTokenExpired = (
  token: string | null | undefined,
  nowMs = Date.now()
): boolean => {
  const exp = getNotifierJwtExpiration(token);

  if (exp === null) {
    return true;
  }

  return nowMs >= exp * 1000;
};

