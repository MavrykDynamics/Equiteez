import type { MetaFunction } from "@remix-run/node";
import { generatePath, Link } from "@remix-run/react";
import { Spacer } from "~/lib/atoms/Spacer";
import PageLayout from "~/layouts/PageLayout/Pagelayout";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";
import { Filters } from "./components/Filters/Filters";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";
import { atomsToTokens } from "~/lib/utils/formaters";
import { ApiErrorBox } from "~/lib/organisms/ApiErrorBox/ApiErrorBox";
import styles from "./marketplace.module.css";
import { usePagination } from "~/hooks/usePagination";
import { Spinner } from "~/lib/atoms/Spinner";
import { ApiPagination } from "~/lib/organisms/Pagination/ApiPagination";
import { Text } from "~/lib/atoms/Typography/Text";
import EmptyStateIcon from "app/icons/marketplace/emptySearch.svg?react";
import {
  TABLET_MAX_WIDTH,
  useWindowDimensions,
} from "~/hooks/useWindowDimensions";
import { MobileFilters } from "~/routes/marketplace._index/components/MobileFilters";
import { ROUTES } from "~/consts/routes";

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

  const { width } = useWindowDimensions();
  const shouldShowMobileFilters = width <= TABLET_MAX_WIDTH;

  const { data, page, setPage, totalPages } = usePagination(
    marketsArr,
    PAGE_LIMIT
  );

  return (
    <PageLayout>
      <Spacer className="h-[16px] md:h-[32px]" />
      <div className={styles.filtersWrapper}>
        {shouldShowMobileFilters ? <MobileFilters /> : <Filters />}
      </div>

      <div className={styles.contentWrapper}>
        {marketApiError ? (
          <div className={styles.errorWrapper}>
            <ApiErrorBox message="The market data is unavailable at the moment" />
          </div>
        ) : isLoading ? (
          <div className={styles.spinnerWrapper}>
            <Spinner size={36} />
          </div>
        ) : data.length ? (
          <div className={styles.cardsWrapper}>
            {data.map((es) => {
              const isSecondaryMarket =
                es.assetDetails.type === SECONDARY_MARKET;

              const pricePerToken = atomsToTokens(
                orderbookStorages[es.slug]?.lowestSellPrice || 0,
                es.decimals
              );

              return (
                <Link
                  to={generatePath(ROUTES.singleAsset, {
                    id: es.assetDetails.blockchain[0].identifier,
                  })}
                  key={es.token_address}
                >
                  <ThumbCardSecondary
                    flag={es.assetDetails?.propertyDetails?.tags?.[0]}
                    imgSrc={es.assetDetails.previewImage}
                    title={es.name}
                    description={es.assetDetails.propertyDetails.propertyType}
                    isSecondaryMarket={isSecondaryMarket}
                    APY={es.assetDetails.APY}
                    pricePerToken={pricePerToken}
                    progressBarPercentage={isSecondaryMarket ? undefined : 22}
                    isFutureAsset={!validBaseTokens[es.token_address]}
                    height="276px"
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyStateWrapper}>
            <EmptyStateIcon />
            <Text weight="bold">
              Oops, no properties match your filters. Try adjusting them or
              broadening your search.
            </Text>
          </div>
        )}
        {data.length && (
          <div className="lg:ml-auto">
            <ApiPagination
              setPage={setPage}
              page={page}
              totalPages={totalPages}
              paginatedDataLength={data.length}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
      <Spacer className="xl:h-[200px] h-[64px] md:h-[64px]" />
    </PageLayout>
  );
}
