import { FC, useCallback, useMemo, useState } from "react";

// components
import { Button } from "~/lib/atoms/Button";
import { Divider } from "~/lib/atoms/Divider";
import { Table } from "~/lib/atoms/Table/Table";
import { PopupWithIcon } from "~/templates/PopupWIthIcon/PopupWithIcon";

//consts & types
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
import { BUY, CONFIRM, OTC, SELL } from "../consts";
import { ProgresBar } from "../components/ProgressBar/ProgressBar";
import { PopupContent } from "../popups";
import { stablecoinContract } from "~/consts/contracts";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import Money from "~/lib/atoms/Money";
import {
  calculateLiquidityPercentages,
  calculateTotalLiquidityInUSD,
  getTokenAmountFromLiquidity,
} from "~/providers/Dexprovider/utils";
import { useAssetMetadata } from "~/lib/metadata";
import { toTokenSlug } from "~/lib/assets";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { atomsToTokens } from "~/lib/utils/formaters";

// types
export type OrderType = typeof BUY | typeof SELL | typeof OTC | typeof CONFIRM;

type SecondaryPriceBlockProps = {
  activeEstate: SecondaryEstate;
};

export const SecondaryPriceBlock: FC<SecondaryPriceBlockProps> = ({
  activeEstate: estate,
}) => {
  const { validBaseTokens } = useMarketsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(BUY);
  const { dodoMav, dodoStorages, dodoTokenPair } = useDexContext();

  const { slug } = estate;
  const baseTokenMetadata = useAssetMetadata(slug);
  // TODO remove ?? slug after API assets
  const quoteTokenMetadata = useAssetMetadata(
    dodoTokenPair[slug] ?? toTokenSlug(stablecoinContract)
  );

  const currentPrice = useMemo(
    () => atomsToTokens(dodoMav[slug], baseTokenMetadata.decimals) ?? "0",
    [baseTokenMetadata.decimals, dodoMav, slug]
  );

  const totalLiquidityInfo = useMemo(() => {
    const { totalLiquidityInUSD } = calculateTotalLiquidityInUSD(
      dodoStorages[slug],
      currentPrice
    );

    const { basePercentage, quotePercentage } = calculateLiquidityPercentages(
      dodoStorages[slug]
    );

    getTokenAmountFromLiquidity(dodoStorages[slug], currentPrice);

    return { totalLiquidityInUSD, basePercentage, quotePercentage };
  }, [currentPrice, dodoStorages, slug]);

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
    setOrderType(BUY);
  }, []);

  const handleOpen = useCallback((orderType: OrderType) => {
    setOrderType(orderType);
    setIsOpen(true);
  }, []);

  return (
    <section className="self-start">
      <Table className="bg-white">
        <div className="text-content text-card-headline flex justify-between mb-6">
          <p>Current Price</p>
          <div>
            $<Money fiat>{currentPrice}</Money>
          </div>
        </div>
        <div className="text-content body flex justify-between mb-4">
          <div className="flex items-center gap-1">
            Total Return
            {/* <InfoTooltip className="w-6 h-6" content={"Total Liquidity"} /> */}
          </div>
          <p className="text-buttons">
            {estate.assetDetails.priceDetails.annualReturn}%
          </p>
        </div>
        <div className="text-content body flex justify-between mb-4">
          <div className="flex items-center gap-1">
            Expected Income
            {/* <InfoTooltip className="w-6 h-6" content={"Total Liquidity"} /> */}
          </div>
          <p className="text-buttons">
            {estate.assetDetails.financials.expectedIncome.income}%
          </p>
        </div>
        <div className="text-content body flex justify-between">
          <p className="flex items-center gap-1">Investors</p>
          <p className="text-buttons">
            {estate.assetDetails.offering.minInvestmentAmount.toFixed(0)}
          </p>
        </div>
        <Divider className="my-4" />
        <div className="text-content text-buttons flex justify-between mb-3">
          <p>Total Liquidity</p>
          <div className="flex items-center">
            $<Money fiat>{totalLiquidityInfo.totalLiquidityInUSD}</Money>
          </div>
        </div>

        <ProgresBar
          baseTokenPercentage={totalLiquidityInfo.basePercentage}
          quoteTokenPercentage={totalLiquidityInfo.quotePercentage}
          baseTokenSymbol={baseTokenMetadata.symbol}
          quoteTokenSymbol={quoteTokenMetadata.symbol}
        />
        <div className="mt-4">
          {!validBaseTokens[estate.token_address] ? (
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          ) : (
            <div className="grid gap-3 grid-cols-2 ">
              <Button onClick={handleOpen.bind(null, BUY)}>Buy</Button>
              <Button variant="outline" onClick={handleOpen.bind(null, SELL)}>
                Sell
              </Button>
            </div>
          )}
        </div>
      </Table>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={"right"}
        className={"bg-white"}
      >
        <PopupContent
          estate={estate}
          orderType={orderType}
          setOrderType={setOrderType}
        />
      </PopupWithIcon>
    </section>
  );
};
