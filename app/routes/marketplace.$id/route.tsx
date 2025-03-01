import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Navigate, useLoaderData } from "@remix-run/react";
import ArrowLeftIcon from "app/icons/arrow-left.svg?react";
import LikeIcon from "app/icons/like.svg?react";
import ShareIcon from "app/icons/share.svg?react";

import PageLayout from "app/layouts/PageLayout/Pagelayout";
import { useMarketByParamIdentifier } from "./hooks/use-market-by-identifier";
import { LinkWithIcon } from "~/lib/atoms/LinkWithIcon";
import { FC, useMemo } from "react";
import { Gallery } from "./components/Gallery/Gallery";

import { IconsBlock } from "~/templates/IconsBlock";
import { Divider } from "~/lib/atoms/Divider";
import { Spacer } from "~/lib/atoms/Spacer";
import { SimilarProperties } from "./components/SimilarProperties/SimilarProperties";
import { FAQSection } from "~/templates/FAQSection";

// styles
import styles from "./propertyId.module.css";

// mocked faq data
import { homeFAQ } from "../_index/index.const";
import { PriceSection } from "./components/PriceSection/PriceSection";
import PropertyTabs from "./components/PropertyTabs/PropertyTabs";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { EstateHeadlineTab } from "~/templates/EstateHeadlineTab";
import { FullScreenSpinner } from "~/lib/atoms/Spinner/Spinner";
import clsx from "clsx";
import { detectIfAssetIsSecondaryMarket } from "~/providers/MarketsProvider/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Property" },
    { name: "description", content: "Property data" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("tabId");
  return id;
};

export default function PropertyDetails() {
  // setting active estate in provider
  const estateData = useMarketByParamIdentifier();

  const { isLoading, isActiveMarketLoading } = useMarketsContext();

  const tabId = useLoaderData<typeof loader>() as string | undefined;

  const isSecondaryMarket = useMemo(
    () => detectIfAssetIsSecondaryMarket(estateData),
    [estateData]
  );

  if (isLoading || isActiveMarketLoading) return <FullScreenSpinner />;

  if (estateData === null) return <Navigate to={"/marketplace"} />;

  return (
    <PageLayout>
      <div className="my-6 flex items-start px-11">
        <LinkWithIcon
          iconPosition="start"
          CustomIcon={ArrowLeftIcon}
          to="/marketplace"
          variant="content"
          className="underline"
        >
          Back to Properties
        </LinkWithIcon>
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-x-3 px-11">
          <h3 className="text-content text-section-headline">
            {estateData.name}
          </h3>

          <HeadLineTabs
            isSecondaryEstate={isSecondaryMarket}
            houseType={estateData.assetDetails.propertyDetails.propertyType}
          />
          <Options />
        </div>
        <p className="text-body text-content px-11">
          {estateData.assetDetails.propertyDetails.shortAddress ??
            estateData.assetDetails.propertyDetails.fullAddress}
        </p>
      </div>
      <Gallery
        mainImgsrc={estateData.assetDetails.previewImage}
        thumbs={estateData.assetDetails.assetImages}
        propertyId={estateData.assetDetails.blockchain[0].identifier}
      />
      <section className={styles.detailsSection}>
        <div className="flex flex-col">
          {estateData.assetDetails.basicInfo && (
            <IconsBlock basicInfo={estateData.assetDetails.basicInfo} />
          )}

          <Divider className="my-6" />
          <PropertyTabs tabId={tabId} isSecondaryEstate={isSecondaryMarket} />
        </div>
        <div className="sticky top-10 h-fit">
          <PriceSection
            isSecondaryEstate={isSecondaryMarket}
            activeEstate={estateData}
          />
        </div>
      </section>
      <Spacer />
      <SimilarProperties />
      <Spacer />
      <FAQSection data={homeFAQ} />
      <Spacer className="h-[200px]" />
    </PageLayout>
  );
}

// components
const HeadLineTabs: FC<{ isSecondaryEstate: boolean; houseType: string }> = ({
  isSecondaryEstate,
  houseType,
}) => {
  return (
    <section className="flex items-center gap-x-2 text-body-xs font-medium">
      <div
        className={clsx(
          "py-1 px-2 rounded font-medium capitalize",
          isSecondaryEstate
            ? "bg-[#F6AFAFBF] text-red-950"
            : "text-yellow-950 bg-[#FFD38FBF]"
        )}
      >
        {houseType}
      </div>

      <EstateHeadlineTab isSecondaryEstate={isSecondaryEstate} />
    </section>
  );
};

const Options: FC = () => {
  return (
    <section className="flex items-center gap-x-4 ml-auto">
      <button className="text-content text-body flex items-center gap-x-1 font-semibold hover:text-sand-700">
        <LikeIcon className="stroke-current" />
        <p className="underline">Save</p>
      </button>
      <button className="text-content text-body flex items-center gap-x-1 font-semibold  hover:text-sand-700">
        <ShareIcon className="stroke-current" />
        <p className="underline">Share</p>
      </button>
    </section>
  );
};
