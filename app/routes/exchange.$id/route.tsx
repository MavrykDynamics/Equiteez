import type { MetaFunction } from "@remix-run/node";
import ArrowDown from "app/icons/arrow-down.svg?react";
import ArrowUp from "app/icons/arrow-up.svg?react";

import PageLayout from "app/layouts/PageLayout/Pagelayout";

import { Divider } from "~/lib/atoms/Divider";
import { Spacer } from "~/lib/atoms/Spacer";

import { ExchangeTabs } from "./components/ExchangeTabs/ExchangeTabs";
import { OrderTabs } from "./components/OrderTabs/OrderTabs";
import { BuySellTabs } from "./components/BuySellTabs/BuySellTabs";

import { OrderBookTabs } from "./components/OrderBookTabs/OrderBookTabs";

import { Container } from "~/lib/atoms/Container";
import { FullScreenSpinner } from "~/lib/atoms/Spinner/Spinner";
import { usePropertyByAddress } from "../properties.$id/hooks/use-property-by-id";

// icons
import ArrowLinkIcon from "app/icons/arrow-link.svg?react";
import { AssetDropdown } from "./components/AssetDropdown";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { useMemo } from "react";
import Money from "~/lib/atoms/Money";
import { Navigate } from "@remix-run/react";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";

export const meta: MetaFunction = () => {
  return [
    { title: "Exchange" },
    { name: "description", content: "Exchange data" },
  ];
};
export default function ExchangeDetails() {
  const { isLoading } = useEstatesContext();
  const { dodoMav } = useDexContext();
  const estateData = usePropertyByAddress();

  const tokenPrice = useMemo(
    () => (estateData?.slug ? dodoMav[estateData.slug] : "0"),
    [estateData?.slug, dodoMav]
  );

  if (isLoading) return <FullScreenSpinner />;

  if (estateData === null) return <Navigate to={"/properties"} />;

  return (
    <PageLayout includeContainer={false} includeFooter={false}>
      <Container>
        <div className="flex w-full py-3 px-6">
          {/* Top Bar */}
          <div className="flex flex-grow justify-between">
            {/* Market Searcher/Chooser */}
            <div className="flex items-center relative gap-x-3">
              <AssetDropdown estate={estateData} />
              <button className="text-content">
                <ArrowLinkIcon className="stroke-current w-6 h-6" />
              </button>
            </div>

            {/* Highlights */}
            <div className="flex gap-x-11 items-center">
              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small">Asset Type</span>
                <span className="text-body-xs leading-5 font-semibold">
                  {estateData.symbol}
                </span>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small">Price</span>
                <div className="text-body-xs leading-5 font-semibold flex items-center">
                  $<Money fiat>{tokenPrice}</Money>
                </div>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small">24h Change</span>
                <span className="text-body-xs leading-5 font-semibold">
                  +5.04%
                </span>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small flex items-center gap-1">
                  <ArrowUp className="size-3" />
                  24h High
                </span>
                <span className="text-body-xs leading-5 font-semibold">
                  $8.20
                </span>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small flex items-center gap-1">
                  <ArrowDown className="size-3" />
                  24h Low
                </span>
                <span className="text-body-xs leading-5 font-semibold">
                  $7.89
                </span>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small">Yield</span>
                <span className="text-body-xs leading-5 font-semibold">
                  4.83%
                </span>
              </span>
            </div>

            <div className="w-[222px]"></div>
          </div>
        </div>
        <div className="flex flex-col">
          <Divider className="" />
        </div>

        <div className="flex w-full">
          {/* Left Panel ---------------------------- */}
          <div className="flex flex-col w-[324px] p-4">
            {/* Order Book View */}
            <div className="flex flex-col w-full">
              <OrderBookTabs />
            </div>
          </div>

          <div className={"h-100 w-[1px] min-w-[1px] bg-divider"} />

          {/* Mid Panel ---------------------------- */}
          <div className="flex flex-grow">
            <ExchangeTabs estate={estateData} />
          </div>

          <div className={"h-100 w-[1px] min-w-[1px] bg-divider"} />

          {/* Right Panel ---------------------------- */}
          <div className="flex flex-col w-[324px]">
            <div className="flex flex-col w-full p-4">
              <BuySellTabs
                symbol={estateData.symbol}
                tokenAddress={estateData.token_address}
                slug={estateData.slug}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <Divider />
        </div>

        {/* Order/History/Transactions */}
        <div className="flex flex-col w-full py-6 px-4">
          <OrderTabs />
        </div>
      </Container>
      <Spacer height={18} />
    </PageLayout>
  );
}
