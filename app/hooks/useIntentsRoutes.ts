import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConfig } from "wagmi";

import {
  INTENTS_BRIDGE_PAIRS,
  INTENTS_DEPOSIT_ENABLED,
  INTENTS_SOURCE_ASSETS,
  INTENTS_SOURCE_CHAINS,
} from "~/consts/intents";
import { getIntentsApi } from "~/lib/apis/intents";
import {
  resolveIntentRoute,
  type IntentRouteOption,
} from "~/lib/intents/intentRoute";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";

export type { IntentRouteOption } from "~/lib/intents/intentRoute";

/**
 * Backend-approved route catalog (`GET /v1/routes`), gated by the feature
 * flag and resolved against the approved Equiteez product configuration.
 * An empty list is not an error: it disables new transfers (backend.md §4.2).
 */
export function useIntentsRoutes(enabled = INTENTS_DEPOSIT_ENABLED) {
  const api = getIntentsApi();
  const { chains } = useConfig();
  const { tokensMetadata } = useTokensContext();
  const query = useQuery({
    queryKey: ["intents", "routes", api.env],
    enabled,
    staleTime: 60_000,
    retry: 1,
    queryFn: ({ signal }) => api.getRoutes({ signal }),
  });
  const supportedChains = useMemo(
    () =>
      INTENTS_SOURCE_CHAINS.filter((chain) =>
        chains.some((item) => item.id === chain.id)
      ),
    [chains]
  );
  const options = useMemo<IntentRouteOption[]>(
    () =>
      (query.data ?? []).map((route) =>
        resolveIntentRoute(route, {
          sourceAssets: INTENTS_SOURCE_ASSETS,
          bridgePairs: INTENTS_BRIDGE_PAIRS,
          chains: supportedChains,
          getDestinationMetadata: (address, tokenId) =>
            tokensMetadata[`${address}_${tokenId}`],
        })
      ),
    [query.data, supportedChains, tokensMetadata]
  );

  return {
    options,
    status: !enabled
      ? ("disabled" as const)
      : query.isError
        ? ("error" as const)
        : query.isPending
          ? ("loading" as const)
          : ("ready" as const),
    refetch: query.refetch,
  };
}
