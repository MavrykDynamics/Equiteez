import { FRESHNESS_MARK_TTL_MS } from "~/lib/apis/rwa/freshness/constants";
import {
  getFreshQueryKeyStart,
  shouldConsumeFreshQuery,
} from "~/lib/apis/rwa/freshness/helpers";
import type {
  CompleteFreshQueryParams,
  FreshQueryKeyStartInput,
  FreshQueryMark,
  FreshQueryMarkInput,
  FreshQueryRequest,
  PeekedFreshQueryMark,
} from "~/lib/apis/rwa/freshness/types";

const freshQueryMarks = new Map<string, FreshQueryMark>();

const pruneExpiredFreshQueryMarks = (now = Date.now()) => {
  freshQueryMarks.forEach((mark, key) => {
    if (now - mark.createdAt > FRESHNESS_MARK_TTL_MS) {
      freshQueryMarks.delete(key);
    }
  });
};

export const peekFreshQuery = (
  queryKeyStart: FreshQueryKeyStartInput
): PeekedFreshQueryMark | null => {
  const normalizedQueryKeyStart = getFreshQueryKeyStart(queryKeyStart);

  if (!normalizedQueryKeyStart) {
    return null;
  }

  pruneExpiredFreshQueryMarks();

  const matchedMarks: Array<[string, FreshQueryMark]> = [];

  freshQueryMarks.forEach((mark, markQueryKeyStart) => {
    if (normalizedQueryKeyStart.startsWith(markQueryKeyStart)) {
      matchedMarks.push([markQueryKeyStart, mark]);
    }
  });

  if (!matchedMarks.length) {
    return null;
  }

  const levels = matchedMarks
    .map(([, mark]) => mark.level)
    .filter((level): level is number => typeof level === "number");

  return {
    keys: matchedMarks.map(([markQueryKeyStart]) => markQueryKeyStart),
    level: levels.length ? Math.max(...levels) : undefined,
  };
};

export const markFreshQuery = (
  queryKeyStart: FreshQueryKeyStartInput,
  mark: FreshQueryMarkInput = {}
) => {
  const normalizedQueryKeyStart = getFreshQueryKeyStart(queryKeyStart);

  if (!normalizedQueryKeyStart) {
    return;
  }

  const level =
    typeof mark.level === "number" && Number.isFinite(mark.level)
      ? mark.level
      : undefined;

  freshQueryMarks.set(normalizedQueryKeyStart, {
    createdAt: Date.now(),
    level,
  });
};

export const consumeFreshQuery = (mark: PeekedFreshQueryMark | null) => {
  if (!mark) {
    return;
  }

  mark.keys.forEach((key) => freshQueryMarks.delete(key));
};

export const clearFreshQueries = () => {
  freshQueryMarks.clear();
};

export const hasPendingFreshQuery = (queryKeyStart: FreshQueryKeyStartInput) =>
  Boolean(peekFreshQuery(queryKeyStart));

export const getFreshQueryRequest = (
  queryKeyStart: FreshQueryKeyStartInput,
  { enabled = true }: { enabled?: boolean } = {}
): FreshQueryRequest => {
  const mark = peekFreshQuery(queryKeyStart);

  return {
    mark,
    shouldRequestFresh: Boolean(mark) && enabled,
  };
};

export const completeFreshQuery = (
  request: FreshQueryRequest,
  { asOfLevel, cacheBypass, hasAsOf }: CompleteFreshQueryParams
) => {
  const canValidateFreshness =
    request.shouldRequestFresh ||
    (request.mark?.level !== undefined && hasAsOf);

  if (!canValidateFreshness) {
    return;
  }

  if (
    shouldConsumeFreshQuery(request.mark, {
      asOfLevel: hasAsOf ? asOfLevel : undefined,
      cacheBypass,
      hasAsOf,
    })
  ) {
    consumeFreshQuery(request.mark);
    return;
  }

  pruneExpiredFreshQueryMarks();
};
