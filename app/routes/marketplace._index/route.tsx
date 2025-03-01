import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Spacer } from "~/lib/atoms/Spacer";
import PageLayout from "~/layouts/PageLayout/Pagelayout";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { ThumbCardSecondary } from "~/templates/ThumbCard/ThumbCard";
import { Filters } from "./components/Filters";
import { useState } from "react";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import {
  SECONDARY_MARKET,
  STATIC_ASSETS_LIST,
} from "~/providers/MarketsProvider/market.const";

export const meta: MetaFunction = () => {
  return [
    { title: "MarketPlace" },
    { name: "description", content: "Assets Marketplace" },
  ];
};

export default function Properties() {
  const { marketsArr } = useMarketsContext();
  const { dodoMav } = useDexContext();
  const [filteredEstates, setFilteredEstates] = useState(() => marketsArr);

  return (
    <PageLayout>
      <div className="px-11">
        <Spacer height={32} />
        <Filters
          originalEstates={marketsArr}
          estates={filteredEstates}
          setEstates={setFilteredEstates}
        />
        <div className="mt-5 text-body text-content">
          {filteredEstates.length} items
        </div>
        <div className="mt-11 grid grid-cols-3 gap-x-6 gap-y-8">
          {filteredEstates.map((es) => {
            const isSecondaryMarket = es.assetDetails.type === SECONDARY_MARKET;

            const pricePerToken = dodoMav[es.slug];

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
                  isFutureAsset={!STATIC_ASSETS_LIST[es.token_address]}
                />
              </Link>
            );
          })}
        </div>

        <div className=" text-center text-sand-600 text-card-headline mt-11">
          End of The Assets
        </div>
        <Spacer height={110} />
      </div>
    </PageLayout>
  );
}
