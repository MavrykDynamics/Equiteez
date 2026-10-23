import { isAxiosError } from "axios";

import { rwaApi } from "~/lib/apis/rwa/client";
import { RefundsPageSchema } from "~/lib/apis/rwa/refunds/refunds.schema";
import type {
  AssetRefundsScan,
  RefundItemType,
  RefundsPageResponseType,
} from "~/lib/apis/rwa/refunds/refunds.types";
import {
  buildAssetRefundsScan,
  RefundsScanError,
} from "~/lib/apis/rwa/refunds/refunds.helpers";

export const REFUNDS_PAGE_LIMIT = 100;

const MAX_PAGES = 1_000;
const MAX_RATE_LIMIT_RETRIES = 5;
const MAX_ROLLBACK_RESTARTS = 2;
const DEFAULT_RETRY_AFTER_MS = 1_000;

type FetchWalletRefundsPageParams = {
  walletAddress: string;
  tokenAddress: string;
  cursor?: string | null;
  limit?: number;
  signal?: AbortSignal;
};

type CollectAssetRefundsParams = Omit<
  FetchWalletRefundsPageParams,
  "cursor" | "limit"
>;

export const fetchWalletRefundsPage = async ({
  walletAddress,
  tokenAddress,
  cursor,
  limit = REFUNDS_PAGE_LIMIT,
  signal,
}: FetchWalletRefundsPageParams): Promise<RefundsPageResponseType> => {
  const query = new URLSearchParams({
    token_address: tokenAddress,
    limit: String(limit),
  });

  if (cursor) {
    query.set("cursor", cursor);
  }

  const { data } = await rwaApi.get(
    `/wallets/${walletAddress}/refunds?${query.toString()}`,
    { signal }
  );

  return RefundsPageSchema.parse(data);
};

const getRetryAfterMs = (error: unknown) => {
  if (!isAxiosError(error)) return DEFAULT_RETRY_AFTER_MS;

  const retryAfter = Number(error.response?.headers?.["retry-after"]);

  return Number.isFinite(retryAfter) && retryAfter > 0
    ? retryAfter * 1_000
    : DEFAULT_RETRY_AFTER_MS;
};

const waitFor = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeoutId);
        reject(signal.reason);
      },
      { once: true }
    );
  });

const fetchPageWithRateLimitRetry = async (
  params: FetchWalletRefundsPageParams
) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchWalletRefundsPage(params);
    } catch (error) {
      const isRateLimited =
        isAxiosError(error) && error.response?.status === 429;

      if (!isRateLimited || attempt >= MAX_RATE_LIMIT_RETRIES) throw error;

      await waitFor(getRetryAfterMs(error), params.signal);
    }
  }
};

const isRollbackError = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 409;

/**
 * Traverses every refund page for one owner/asset. Any failed page makes the
 * whole scan fail: a partial list must never look like a complete one.
 */
const traverseAssetRefunds = async (params: CollectAssetRefundsParams) => {
  const items: RefundItemType[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  let minLevel = Number.POSITIVE_INFINITY;
  let previousLevel = 0;
  let isRealtime = true;

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
    const page = await fetchPageWithRateLimitRetry({ ...params, cursor });
    const { level, realtime } = page.as_of.orderbook;

    if (level < previousLevel) {
      throw new RefundsScanError("Refund data changed during scan");
    }

    previousLevel = level;
    minLevel = Math.min(minLevel, level);
    isRealtime = isRealtime && realtime;
    items.push(...page.items);

    if (!page.has_more) {
      return { items, isRealtime, level: minLevel };
    }

    if (!page.next_cursor || seenCursors.has(page.next_cursor)) {
      throw new RefundsScanError("Refund list pagination is inconsistent");
    }

    seenCursors.add(page.next_cursor);
    cursor = page.next_cursor;
  }

  throw new RefundsScanError("Refund list is too long to scan");
};

export const collectAssetRefunds = async (
  params: CollectAssetRefundsParams
): Promise<AssetRefundsScan> => {
  for (let restart = 0; ; restart++) {
    try {
      const result = await traverseAssetRefunds(params);

      return buildAssetRefundsScan(result);
    } catch (error) {
      if (!isRollbackError(error) || restart >= MAX_ROLLBACK_RESTARTS) {
        throw error;
      }
    }
  }
};
