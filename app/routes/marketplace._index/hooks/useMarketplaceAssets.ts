import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { ApiError } from "~/errors/error";
import { fetchAssets } from "~/lib/apis/mbrwa/assets";
import { MARKETS_PAGINATION_LIMIT } from "~/providers/MarketsProvider/market.const";
import {
  EMPTY_MARKET_ASSETS_COLLECTION,
  createMarketAssetsCollection,
} from "~/providers/MarketsProvider/utils";
import { useFiltersContext } from "~/routes/marketplace._index/components/Filters/FiltersProvider";

export const useMarketplaceAssets = () => {
  const {
    appliedFiltersState: { searchValue, developer, tag, type },
  } = useFiltersContext();
  const [page, setPage] = useState(0);

  const developersKey = developer.join("|");
  const tagsKey = tag.join("|");
  const typesKey = type.join("|");

  const assetsQuery = useQuery({
    queryKey: [
      "fetchAssets",
      "marketplace",
      searchValue,
      developersKey,
      tagsKey,
      typesKey,
    ],
    queryFn: () =>
      fetchAssets({
        search: searchValue,
        developers: developer,
        tags: tag,
        types: type,
      }),
    retry: false,
    placeholderData: keepPreviousData,
  });

  const collection = useMemo(
    () =>
      assetsQuery.data
        ? createMarketAssetsCollection(assetsQuery.data.assets)
        : EMPTY_MARKET_ASSETS_COLLECTION,
    [assetsQuery.data]
  );

  const totalCount =
    assetsQuery.data?.total_count ?? collection.marketsArr.length;
  const totalPages = Math.ceil(totalCount / MARKETS_PAGINATION_LIMIT);

  const assets = useMemo(() => {
    const start = page * MARKETS_PAGINATION_LIMIT;
    const end = start + MARKETS_PAGINATION_LIMIT;

    return collection.marketsArr.slice(start, end);
  }, [collection.marketsArr, page]);

  useEffect(() => {
    setPage(0);
  }, [searchValue, developersKey, tagsKey, typesKey]);

  useEffect(() => {
    if (totalPages === 0) {
      if (page !== 0) {
        setPage(0);
      }
      return;
    }

    if (page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const marketApiError = useMemo(
    () => (assetsQuery.error ? new ApiError(assetsQuery.error) : null),
    [assetsQuery.error]
  );

  return {
    assets,
    page,
    setPage,
    totalPages,
    marketApiError,
    isLoading: assetsQuery.isPending,
    isFetching: assetsQuery.isFetching,
  };
};
