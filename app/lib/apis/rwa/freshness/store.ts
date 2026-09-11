import {
  FRESHNESS_MARK_TTL_MS,
  FRESHNESS_SOURCES,
  type FreshnessSource,
} from "~/lib/apis/rwa/freshness/constants";
import {
  getFreshQueryKeyStart,
  shouldConsumeFreshQuerySource,
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
    FRESHNESS_SOURCES.forEach((source) => {
      const sourceMark = mark[source];

      if (sourceMark && now - sourceMark.createdAt > FRESHNESS_MARK_TTL_MS) {
        delete mark[source];
      }
    });

    if (!FRESHNESS_SOURCES.some((source) => mark[source])) {
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

  const keysBySource: PeekedFreshQueryMark["keysBySource"] = {};
  const levels: PeekedFreshQueryMark["levels"] = {};

  matchedMarks.forEach(([markQueryKeyStart, mark]) => {
    FRESHNESS_SOURCES.forEach((source) => {
      const sourceMark = mark[source];

      if (!sourceMark) {
        return;
      }

      keysBySource[source] = [
        ...(keysBySource[source] ?? []),
        markQueryKeyStart,
      ];

      if (typeof sourceMark.level === "number") {
        levels[source] =
          levels[source] === undefined
            ? sourceMark.level
            : Math.max(levels[source], sourceMark.level);
      }
    });
  });

  const sources = FRESHNESS_SOURCES.filter(
    (source) => keysBySource[source]?.length
  );

  return {
    keysBySource,
    levels,
    sources,
  };
};

export const markFreshQuery = (
  queryKeyStart: FreshQueryKeyStartInput,
  mark: FreshQueryMarkInput
) => {
  const normalizedQueryKeyStart = getFreshQueryKeyStart(queryKeyStart);

  if (!normalizedQueryKeyStart) {
    return;
  }

  const level =
    typeof mark.level === "number" && Number.isFinite(mark.level)
      ? mark.level
      : undefined;

  const existingMark = freshQueryMarks.get(normalizedQueryKeyStart) ?? {};

  freshQueryMarks.set(normalizedQueryKeyStart, {
    ...existingMark,
    [mark.source]: {
      createdAt: Date.now(),
      level,
    },
  });
};

export const consumeFreshQuery = (
  mark: PeekedFreshQueryMark | null,
  sources: FreshnessSource[]
) => {
  if (!mark) {
    return;
  }

  sources.forEach((source) => {
    mark.keysBySource[source]?.forEach((key) => {
      const storedMark = freshQueryMarks.get(key);

      if (!storedMark) {
        return;
      }

      delete storedMark[source];

      if (!FRESHNESS_SOURCES.some((storedSource) => storedMark[storedSource])) {
        freshQueryMarks.delete(key);
      }
    });
  });
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
  { asOfLevels, cacheBypass }: CompleteFreshQueryParams
) => {
  const canValidateFreshness =
    request.shouldRequestFresh || Boolean(request.mark);

  if (!canValidateFreshness) {
    return;
  }

  const consumedSources = (request.mark?.sources ?? []).filter((source) =>
    shouldConsumeFreshQuerySource(request.mark, source, {
      asOfLevel: asOfLevels[source],
      cacheBypass,
    })
  );

  if (consumedSources.length) {
    consumeFreshQuery(request.mark, consumedSources);
    return;
  }

  pruneExpiredFreshQueryMarks();
};
