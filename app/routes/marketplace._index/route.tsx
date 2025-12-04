import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Spacer } from "~/lib/atoms/Spacer";
import PageLayout from "~/layouts/PageLayout/Pagelayout";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";
import { Filters } from "./components/Filters/Filters";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";
import { atomsToTokens } from "~/lib/utils/formaters";
import { ApiErrorBox } from "~/lib/organisms/ApiErrorBox/ApiErrorBox";
import { FiltersProvider } from "./components/Filters/FiltersProvider";

import { usePagination } from "~/hooks/usePagination";
import { Spinner } from "~/lib/atoms/Spinner";
import { ApiPagination } from "~/lib/organisms/Pagination/ApiPagination";

export const meta: MetaFunction = () => {
  return [
    { title: "MarketPlace" },
    { name: "description", content: "Assets Marketplace" },
  ];
};

const PAGE_LIMIT = 12;

export default function Properties() {
  const { marketsArr, validBaseTokens, marketApiError, isLoading } =
    useMarketsContext();
  const { orderbookStorages } = useDexContext();

  const {
    data: filteredEstates,
    page,
    setPage,
    totalPages,
  } = usePagination(marketsArr, PAGE_LIMIT);
  return (
    <PageLayout>
      <FiltersProvider>
        <Spacer height={32} />
        <Filters />

        {marketApiError ? (
          <div className="mt-5">
            <ApiErrorBox message="The market data is unavailable at the moment" />
          </div>
        ) : isLoading ? (
          <div className={"w-full flex items-center justify-center h-full"}>
            <Spinner size={36} />
          </div>
        ) : (
          <div>
            <div className="mt-5 text-body text-content">
              {filteredEstates.length} items
            </div>
            <div className="mt-11 grid grid-cols-3 gap-x-6 gap-y-8">
              {filteredEstates.map((es) => {
                const isSecondaryMarket =
                  es.assetDetails.type === SECONDARY_MARKET;

                const pricePerToken = atomsToTokens(
                  orderbookStorages[es.slug]?.lowestSellPrice || 0,
                  es.decimals
                );

                return (
                  <Link
                    to={`/marketplace/${es.assetDetails.blockchain[0].identifier}`}
                    key={es.token_address}
                  >
                    <ThumbCardSecondary
                      imgSrc={es.assetDetails.previewImage}
                      title={es.name}
                      description={es.assetDetails.propertyDetails.propertyType}
                      isSecondaryMarket={isSecondaryMarket}
                      APY={es.assetDetails.APY}
                      pricePerToken={pricePerToken}
                      isFutureAsset={!validBaseTokens[es.token_address]}
                      progressBarPercentage={50}
                    />
                  </Link>
                );
              })}
            </div>

            {filteredEstates.length && (
              <div className="lg:ml-auto">
                <ApiPagination
                  setPage={setPage}
                  page={page}
                  totalPages={totalPages}
                  paginatedDataLength={filteredEstates.length}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        )}
        <Spacer height={110} />
      </FiltersProvider>
    </PageLayout>
  );
}
