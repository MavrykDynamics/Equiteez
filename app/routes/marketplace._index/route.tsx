import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Spacer } from "~/lib/atoms/Spacer";
import PageLayout from "~/layouts/PageLayout/Pagelayout";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";
import { Filters } from "./components/Filters";
import { useState } from "react";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";
import { atomsToTokens } from "~/lib/utils/formaters";
import { ApiErrorBox } from "~/lib/organisms/ApiErrorBox/ApiErrorBox";
import InfiniteScroll from "react-infinite-scroll-component";
import { Spinner } from "~/lib/atoms/Spinner";

export const meta: MetaFunction = () => {
  return [
    { title: "MarketPlace" },
    { name: "description", content: "Assets Marketplace" },
  ];
};

export default function Properties() {
  const {
    marketsArr,
    validBaseTokens,
    marketApiError,
    loadMoreMarkets,
    isLoading,
    reachedTheEnd,
  } = useMarketsContext();
  const { dodoMav } = useDexContext();
  const [filteredEstates, setFilteredEstates] = useState(() => marketsArr);

  const onScroll =
    isLoading || reachedTheEnd ? undefined : buildOnScroll(loadMoreMarkets);

  return (
    <PageLayout>
      <div className="px-11">
        <Spacer height={32} />
        <Filters
          originalEstates={marketsArr}
          estates={filteredEstates}
          setEstates={setFilteredEstates}
        />

        {marketApiError ? (
          <div className="mt-5">
            <ApiErrorBox message="The market data is unavailable at the moment" />
          </div>
        ) : (
          <InfiniteScroll
            dataLength={marketsArr.length}
            hasMore={reachedTheEnd === false}
            next={loadMoreMarkets}
            loader={
              isLoading && (
                <div className="w-full flex justify-center h-12 mt-12 relative overflow-hidden">
                  <Spinner size={36} />
                </div>
              )
            }
            onScroll={onScroll}
            scrollableTarget={"historyContainer"}
            endMessage={
              marketsArr.length > 0 ? (
                <>
                  <div className=" text-center text-sand-600 text-card-headline mt-11">
                    End of The Assets
                  </div>
                </>
              ) : null
            }
          >
            <div className="mt-5 text-body text-content">
              {filteredEstates.length} items
            </div>
            <div className="mt-11 grid grid-cols-3 gap-x-6 gap-y-8">
              {filteredEstates.map((es) => {
                const isSecondaryMarket =
                  es.assetDetails.type === SECONDARY_MARKET;

                const pricePerToken = atomsToTokens(
                  dodoMav[es.slug],
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
                    />
                  </Link>
                );
              })}
            </div>
          </InfiniteScroll>
        )}
        <Spacer height={110} />
      </div>
    </PageLayout>
  );
}

/**
 * Build onscroll listener to trigger next loading, when fetching data resulted in error.
 * `InfiniteScroll.props.next` won't be triggered in this case.
 */
const buildOnScroll =
  (next: EmptyFn) =>
  ({ target }: { target: EventTarget | null }) => {
    const elem: HTMLElement =
      target instanceof Document
        ? (target.scrollingElement! as HTMLElement)
        : (target as HTMLElement);
    const atBottom =
      0 === elem.offsetHeight - elem.clientHeight - elem.scrollTop;
    if (atBottom) next();
  };
