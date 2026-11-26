import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import { INTENTS_PREVIEW_DEBOUNCE_MS } from "~/consts/intents";
import {
  getIntentsApi,
  IntentsApiError,
  isIntentsApiError,
  type IntentPreview,
  type IntentPreviewRequest,
} from "~/lib/apis/intents";
import { getIntentRequestKey } from "~/lib/intents/intentQuote";

const previewKey = (env: string, request: IntentPreviewRequest) =>
  ["intents", "preview", env, getIntentRequestKey(request)] as const;

/** The longest a cached preview is reused (its `expiresAt` is ≤ 30s). */
const PREVIEW_STALE_MS = 25_000;

const toApiError = (error: unknown) =>
  isIntentsApiError(error)
    ? error
    : new IntentsApiError(
        "UNKNOWN",
        error instanceof Error ? error.message : "Unexpected error."
      );

/**
 * Indicative price for the current form (`POST /v1/quotes/preview`,
 * backend.md §6.2). Typing is debounced, one preview is in flight per input,
 * and a late response for old inputs is never shown: the result is keyed by
 * the exact seven fields. Failures are not retried automatically (previews
 * are limited to ~10 a minute); the user retries.
 */
export function useIntentsPreview(request: IntentPreviewRequest | null) {
  const api = getIntentsApi();
  const queryClient = useQueryClient();
  const key = request ? getIntentRequestKey(request) : null;
  const [debouncedKey] = useDebounce(key, INTENTS_PREVIEW_DEBOUNCE_MS);
  const isSettled = key !== null && debouncedKey === key;
  const query = useQuery({
    queryKey: request
      ? previewKey(api.env, request)
      : ["intents", "preview", api.env, "none"],
    enabled: Boolean(request && isSettled),
    staleTime: PREVIEW_STALE_MS,
    gcTime: 60_000,
    retry: false,
    queryFn: ({ signal }) => api.previewQuote(request!, { signal }),
  });

  /** A preview fetched now, for the review step ("refresh before confirming"). */
  const fetchFresh = useCallback(
    async (input: IntentPreviewRequest): Promise<IntentPreview> => {
      try {
        return await queryClient.fetchQuery({
          queryKey: previewKey(api.env, input),
          staleTime: 0,
          retry: false,
          queryFn: ({ signal }) => api.previewQuote(input, { signal }),
        });
      } catch (error) {
        throw toApiError(error);
      }
    },
    [api, queryClient]
  );

  const error = useMemo(
    () => (query.error ? toApiError(query.error) : null),
    [query.error]
  );

  return {
    preview: request && isSettled ? query.data : undefined,
    status: !request
      ? ("idle" as const)
      : !isSettled || query.isFetching
        ? ("loading" as const)
        : query.isError
          ? ("error" as const)
          : query.data
            ? ("ready" as const)
            : ("loading" as const),
    error: request && isSettled ? error : null,
    refetch: query.refetch,
    fetchFresh,
  };
}
