type WalletOpenOrdersFreshnessKey = {
  tokenAddress?: string | null;
  walletAddress: string;
};

type FreshnessMarkInput = {
  level?: number | null;
};

type FreshnessMark = {
  createdAt: number;
  level?: number;
};

export type PeekedFreshnessMark = {
  keys: string[];
  level?: number;
};

export type CacheBypassState =
  | "fresh"
  | "limited"
  | "stale-fallback"
  | "unknown"
  | null;

type ShouldConsumeFreshnessMarkParams = {
  asOfLevel?: number;
  cacheBypass: CacheBypassState;
  mark: PeekedFreshnessMark | null;
};

const FRESHNESS_MARK_TTL_MS = 15_000;
const OPEN_ORDERS_KIND = "wallet-open-orders";
const TOKEN_WILDCARD = "*";

const freshnessMarks = new Map<string, FreshnessMark>();

const normalizeAddress = (value: string) => value.trim().toLowerCase();

const normalizeTokenAddress = (tokenAddress?: string | null) => {
  const normalized = tokenAddress?.trim().toLowerCase();

  return normalized || TOKEN_WILDCARD;
};

const getFreshnessKey = ({
  tokenAddress,
  walletAddress,
}: WalletOpenOrdersFreshnessKey) =>
  `${OPEN_ORDERS_KIND}:${normalizeAddress(walletAddress)}:${normalizeTokenAddress(
    tokenAddress
  )}`;

const getWalletFreshnessPrefix = (walletAddress: string) =>
  `${OPEN_ORDERS_KIND}:${normalizeAddress(walletAddress)}:`;

const pruneExpiredFreshnessMarks = (now = Date.now()) => {
  freshnessMarks.forEach((mark, key) => {
    if (now - mark.createdAt > FRESHNESS_MARK_TTL_MS) {
      freshnessMarks.delete(key);
    }
  });
};

export const markEventKnown = (
  key: WalletOpenOrdersFreshnessKey,
  mark: FreshnessMarkInput = {}
) => {
  if (!key.walletAddress) {
    return;
  }

  const level =
    typeof mark.level === "number" && Number.isFinite(mark.level)
      ? mark.level
      : undefined;

  freshnessMarks.set(getFreshnessKey(key), {
    createdAt: Date.now(),
    level,
  });
};

export const peekEventKnown = (
  key: WalletOpenOrdersFreshnessKey
): PeekedFreshnessMark | null => {
  if (!key.walletAddress) {
    return null;
  }

  pruneExpiredFreshnessMarks();

  const walletPrefix = getWalletFreshnessPrefix(key.walletAddress);
  const normalizedTokenAddress = normalizeTokenAddress(key.tokenAddress);
  const matchedMarks: Array<[string, FreshnessMark]> = [];

  if (normalizedTokenAddress === TOKEN_WILDCARD) {
    freshnessMarks.forEach((mark, markKey) => {
      if (markKey.startsWith(walletPrefix)) {
        matchedMarks.push([markKey, mark]);
      }
    });
  } else {
    const exactKey = getFreshnessKey(key);
    const wildcardKey = getFreshnessKey({
      tokenAddress: TOKEN_WILDCARD,
      walletAddress: key.walletAddress,
    });

    const exactMark = freshnessMarks.get(exactKey);
    const wildcardMark = freshnessMarks.get(wildcardKey);

    if (exactMark) {
      matchedMarks.push([exactKey, exactMark]);
    }

    if (wildcardMark) {
      matchedMarks.push([wildcardKey, wildcardMark]);
    }
  }

  if (!matchedMarks.length) {
    return null;
  }

  const levels = matchedMarks
    .map(([, mark]) => mark.level)
    .filter((level): level is number => typeof level === "number");

  return {
    keys: matchedMarks.map(([markKey]) => markKey),
    level: levels.length ? Math.max(...levels) : undefined,
  };
};

export const consumeEventKnown = (mark: PeekedFreshnessMark | null) => {
  if (!mark) {
    return;
  }

  mark.keys.forEach((key) => freshnessMarks.delete(key));
};

export const shouldConsumeEventKnown = ({
  asOfLevel,
  cacheBypass,
  mark,
}: ShouldConsumeFreshnessMarkParams) => {
  if (!mark) {
    return false;
  }

  if (cacheBypass === "stale-fallback" || cacheBypass === "unknown") {
    return false;
  }

  if (
    mark.level !== undefined &&
    asOfLevel !== undefined &&
    asOfLevel < mark.level
  ) {
    return false;
  }

  return true;
};
