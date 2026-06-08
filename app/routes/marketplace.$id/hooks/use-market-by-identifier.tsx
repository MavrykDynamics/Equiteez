import { useMatches } from "@remix-run/react";

import { useEffect, useMemo } from "react";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { pickMarketByIdentifier } from "~/providers/MarketsProvider/utils";

export const useMarketByParamIdentifier = (paramId = "id") => {
  const { markets, updateActiveMarketState } = useMarketsContext();
  const matches = useMatches();

  const identifier = matches[0].params[paramId];

  const estateData = useMemo(
    () => pickMarketByIdentifier(identifier, markets),
    [markets, identifier]
  );

  useEffect(() => {
    if (estateData?.slug) {
      updateActiveMarketState(estateData?.slug);
    }
  }, [estateData?.slug, updateActiveMarketState]);

  return estateData;
};
