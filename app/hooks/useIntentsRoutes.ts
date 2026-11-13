import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConfig } from "wagmi";

import {
  INTENTS_DEPOSIT_ENABLED,
  INTENTS_DESTINATION_NETWORK,
  INTENTS_SOURCE_CHAINS,
} from "~/consts/intents";
import { getIntentsApi, type IntentRoute } from "~/lib/apis/intents";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import {
  getIntentRouteAvailability,
  type IntentRouteAvailability,
} from "~/lib/intents/intentRoute";

export type IntentRouteOption = {
  route: IntentRoute;
  availability: IntentRouteAvailability;
};

/** Backend-approved route catalog, gated by the feature flag. */
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
  const supportedChainIds = useMemo(
    () =>
      INTENTS_SOURCE_CHAINS.map((chain) => chain.id).filter((id) =>
        chains.some((chain) => chain.id === id)
      ),
    [chains]
  );
  const options = useMemo<IntentRouteOption[]>(
    () =>
      (query.data ?? []).map((route) => ({
        route,
        availability: getIntentRouteAvailability(
          route,
          supportedChainIds,
          INTENTS_DESTINATION_NETWORK,
          tokensMetadata[
            `${route.destination.tokenAddress}_${route.destination.tokenId}`
          ]
        ),
      })),
    [query.data, supportedChainIds, tokensMetadata]
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
