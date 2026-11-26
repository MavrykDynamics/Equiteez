import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { INTENTS_METADATA_STALE_MS } from "~/consts/intents";
import { getIntentsApi, isIntentsApiError } from "~/lib/apis/intents";
import {
  resolveIntentCatalog,
  type IntentCatalog,
} from "~/lib/intents/intentCatalog";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";

export const getIntentsMetadataQueryKey = (env: string) =>
  ["intents", "metadata", env] as const;

/**
 * `GET /v1/metadata` (backend.md §6.1) resolved into what the deposit form
 * offers: the default settlement token with its Mavryk destination and the
 * source assets on known networks. Cached about a minute; refreshed before
 * the user confirms.
 */
export function useIntentsCatalog() {
  const api = getIntentsApi();
  const { tokensMetadata } = useTokensContext();
  const query = useQuery({
    queryKey: getIntentsMetadataQueryKey(api.env),
    staleTime: INTENTS_METADATA_STALE_MS,
    retry: 1,
    queryFn: ({ signal }) => api.getMetadata({ signal }),
  });
  const catalog = useMemo<IntentCatalog | null>(
    () =>
      query.data
        ? resolveIntentCatalog(query.data, {
            getDestinationMetadata: (address, tokenId) =>
              tokensMetadata[`${address}_${tokenId}`],
          })
        : null,
    [query.data, tokensMetadata]
  );

  return {
    catalog,
    status: query.isError
      ? ("error" as const)
      : query.isPending
        ? ("loading" as const)
        : ("ready" as const),
    error: isIntentsApiError(query.error) ? query.error : null,
    refetch: query.refetch,
  };
}
