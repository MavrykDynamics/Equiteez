import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  generatePath,
  Navigate,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import ArrowLeftIcon from "app/icons/arrow-left.svg?react";
import LikeIcon from "app/icons/like.svg?react";
import ShareIcon from "app/icons/share.svg?react";

import PageLayout from "app/layouts/PageLayout/Pagelayout";
import { useMarketByParamIdentifier } from "./hooks/use-market-by-identifier";
import { LinkWithIcon } from "~/lib/atoms/LinkWithIcon";
import { FC, useMemo, useState } from "react";
import { Gallery } from "./components/Gallery/Gallery";
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
import { WhyInvest } from "~/routes/marketplace.$id/components/WhyInvest/WhyInvest";
import classNames from "clsx";
import { Text } from "~/lib/atoms/Typography/Text";
import { Icon } from "~/lib/atoms/Icon";
import { ROUTES } from "~/consts/routes";
import { AssetFlag } from "~/lib/atoms/AssetFlag/AssetFlag";
import { ImageSlider } from "~/routes/marketplace.$id/components/ImageSlider/ImageSlider";
import { Container } from "~/lib/atoms/Container/Container";

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
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  const { isLoading, isActiveMarketLoading } = useMarketsContext();

  const tabId = useLoaderData<typeof loader>() as string | undefined;

  const isSecondaryMarket = useMemo(
    () => detectIfAssetIsSecondaryMarket(estateData),
    [estateData]
  );
  const navigate = useNavigate();

  const handlePriceToggle = () => {
    setIsPriceOpen((prev) => !prev);
  };

  if (isLoading || isActiveMarketLoading) return <FullScreenSpinner />;

  if (estateData === null) return <Navigate to={"/marketplace"} />;

  return (
    <PageLayout includeContainer={false} className={styles.mainWrapper}>
      <Container>
        <div className={styles.backLinkWrapper}>
          <LinkWithIcon
            iconPosition="start"
            CustomIcon={ArrowLeftIcon}
            to="/marketplace"
            variant="content"
            className="underline"
          >
            <span className={styles.backLinkText}>Back to Properties</span>
          </LinkWithIcon>
          <div className={styles.tabletOptions}>
            <Options />
          </div>
        </div>
        <div className={classNames("mb-6", styles.desktopTitleBlock)}>
          <div className="flex items-center gap-x-3">
            <h3 className="text-content text-section-headline">
              {estateData.name}
            </h3>

            <HeadLineTabs
              isSecondaryEstate={isSecondaryMarket}
              houseType={estateData.assetDetails.propertyDetails.propertyType}
            />
            <Options />
          </div>
          <p className="text-body text-content">
            {estateData.assetDetails.propertyDetails.shortAddress ??
              estateData.assetDetails.propertyDetails.fullAddress}
          </p>
        </div>
      </Container>
      <div className={styles.imageSlider}>
        <div className={styles.mobileHeadLineTabsWrapper}>
          <HeadLineTabs isSecondaryEstate={isSecondaryMarket} houseType="" />
          <AssetFlag
            flagValue={estateData.assetDetails?.propertyDetails?.tags[0]}
          />
        </div>
        <ImageSlider
          images={[
            estateData.assetDetails.previewImage,
            ...estateData.assetDetails.assetImages,
          ]}
          onClick={() =>
            navigate(
              generatePath(ROUTES.singleAssetGallery, {
                id: estateData.assetDetails.blockchain[0].identifier,
              })
            )
          }
          alt="Property"
        />
      </div>
      <Container>
        <Gallery
          mainImgsrc={estateData.assetDetails.previewImage}
          thumbs={estateData.assetDetails.assetImages}
          propertyId={estateData.assetDetails.blockchain[0].identifier}
        />
        <section className={styles.detailsSection}>
          <div className={styles.detailsContent}>
            <div className={styles.tabletTitleBlock}>
              <div className="flex items-center gap-x-3">
                <Text
                  size="largeBody"
                  weight="semibold"
                  className={styles.tabletTitleBlockTitle}
                >
                  {estateData.name}
                </Text>
              </div>
              <Text size="smallBody">
                {estateData.assetDetails.propertyDetails.shortAddress ??
                  estateData.assetDetails.propertyDetails.fullAddress}
              </Text>
              <Divider className="my-6 lg:my-8" />
            </div>
            <WhyInvest />
            <Divider className="my-6 lg:my-8" />
            <PropertyTabs tabId={tabId} isSecondaryEstate={isSecondaryMarket} />
          </div>
          <div className={styles.asidePrice}>
            <button
              className={styles.openPriceButton}
              aria-label="Open price section"
              data-open={isPriceOpen}
              onClick={handlePriceToggle}
            >
              <Icon icon="chevron-down" className={styles.arrowIcon} />
            </button>
            <PriceSection
              shouldExpand={isPriceOpen}
              isSecondaryEstate={isSecondaryMarket}
              activeEstate={estateData}
            />
          </div>
        </section>
        <Spacer className="xl:h-[100px] h-[64px] md:h-[64px]" />
        <SimilarProperties />
        <Spacer className="xl:h-[100px] h-[64px] md:h-[64px]" />
        <FAQSection data={homeFAQ} />
        <Spacer className="xl:h-[200px] h-[104px] md:h-[100px]" />
      </Container>
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
      {houseType && (
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
      )}

      <EstateHeadlineTab isSecondaryEstate={isSecondaryEstate} />
    </section>
  );
};

const Options: FC = () => {
  return (
    <section className={styles.optionsWrapper}>
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
