import { FC, useCallback, useEffect, useMemo, useState } from "react";

// components
import { Button } from "~/lib/atoms/Button";
import { Divider } from "~/lib/atoms/Divider";
import { Table } from "~/lib/atoms/Table/Table";
import { PopupWithIcon } from "~/templates/PopupWIthIcon/PopupWithIcon";
import { InfoTooltip } from "~/lib/organisms/InfoTooltip";
import styles from "./../priceSection.module.css";
//consts & types
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
import { BUY, CONFIRM, OTC, SELL } from "../consts";
import { PopupContent } from "../popups";
import { stablecoinContract } from "~/consts/contracts";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import Money from "~/lib/atoms/Money";
import {
  calculateLiquidityPercentages,
  calculateTotalLiquidity,
} from "~/providers/Dexprovider/utils";
import { useAssetMetadata } from "~/lib/metadata";
import { toTokenSlug } from "~/lib/assets";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { atomsToTokens } from "~/lib/utils/formaters";
import BigNumber from "bignumber.js";
import { ZERO } from "~/lib/utils/numbers";
import { useApiQuery } from "~/hooks/useApiQuery";
import { fetchOrderbookPrices } from "~/lib/apis/mbrwa/orderbooks";
import { getRwaTokenPriceBasedOnOrders } from "~/providers/Dexprovider/utils/aggregateData";
import { unknownToError } from "~/errors/error";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { Spinner } from "~/lib/atoms/Spinner";
import { Text } from "~/lib/atoms/Typography/Text";
import { AnimatePresence, motion } from "framer-motion";

// types
export type OrderType = typeof BUY | typeof SELL | typeof OTC | typeof CONFIRM;

type SecondaryPriceBlockProps = {
  activeEstate: SecondaryEstate;
  shouldExpand: boolean;
};

const expandVariants = {
  expanded: { height: "auto", opacity: 1 },
  collapsed: { height: 0, opacity: 0 },
};

export const SecondaryPriceBlock: FC<SecondaryPriceBlockProps> = ({
  activeEstate: estate,
  shouldExpand,
}) => {
  const { warning } = useToasterContext();
  const { validBaseTokens } = useMarketsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(BUY);
  const { orderbookStorages, orderbookTokenPair } = useDexContext();

  const { slug } = estate;
  const baseTokenMetadata = useAssetMetadata(slug);
  const quoteTokenMetadata = useAssetMetadata(
    orderbookTokenPair[slug] ?? toTokenSlug(stablecoinContract)
  );

  // stores buy and sell prices based on orders
  const [totalLiquidity, setTotalLiquidity] = useState<{
    buyPrice: BigNumber;
    sellPrice: BigNumber;
  }>({
    buyPrice: ZERO,
    sellPrice: ZERO,
  });

  const {
    data: orderbookPricesData,
    error,
    loading: isAggregatedOrdersLoading,
  } = useApiQuery({
    fetchFn: async () =>
      fetchOrderbookPrices(orderbookStorages[slug]?.orderbookAddress),
    deps: [orderbookStorages[slug]?.orderbookAddress],
  });

  useEffect(() => {
    if (error) {
      console.log(error, "Error fetchOrderbookPrices");
      const err = unknownToError(error);
      warning("Unable to fetch orderbook prices", err.message);
    }
    if (!orderbookPricesData) return;

    const { buyPrice, sellPrice } = getRwaTokenPriceBasedOnOrders(
      orderbookPricesData,
      quoteTokenMetadata?.decimals
    );

    setTotalLiquidity({ buyPrice, sellPrice });
  }, [JSON.stringify(orderbookPricesData), error]);

  const currentPrice = useMemo(
    () =>
      atomsToTokens(
        orderbookStorages[slug]?.lowestSellPrice,
        baseTokenMetadata.decimals
      ) ?? "0",
    [baseTokenMetadata.decimals, orderbookStorages, slug]
  );

  const totalLiquidityInfo = useMemo(() => {
    const totalLiquidityInUSD = calculateTotalLiquidity(
      totalLiquidity.buyPrice,
      totalLiquidity.sellPrice
    );

    const { buyPercentage, sellPercentage } = calculateLiquidityPercentages(
      totalLiquidity.buyPrice,
      totalLiquidity.sellPrice
    );

    return { totalLiquidityInUSD, buyPercentage, sellPercentage };
  }, [totalLiquidity.buyPrice, totalLiquidity.sellPrice]);

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
    setOrderType(BUY);
  }, []);

  const handleOpen = useCallback((orderType: OrderType) => {
    setOrderType(orderType);
    setIsOpen(true);
  }, []);

  const expandedContent = (
    <>
      <div className="text-content body flex justify-between mb-[8px]">
        <Text size="smallBody" className="flex items-center gap-1">
          Annual Return
          <InfoTooltip className="w-4 h-4" content={"Annual Return"} />
        </Text>
        <Text weight="semibold">
          {estate.assetDetails.priceDetails.annualReturn}%
        </Text>
      </div>
      <div className="text-content body flex justify-between mb-[8px]">
        <Text size="smallBody" className="flex items-center gap-1">
          Rental Yield
          <InfoTooltip className="w-4 h-4" content={"Rental Yield"} />
        </Text>
        <Text weight="semibold">
          {estate.assetDetails.priceDetails.rentalYield}%
        </Text>
      </div>
      <div className="text-content body flex justify-between">
        <Text size="smallBody">Investors</Text>
        <Text weight="semibold">
          {estate.assetDetails.offering.minInvestmentAmount.toFixed(0)}
        </Text>
      </div>
      <Divider className="my-[8px]" />
      <div className="text-content text-buttons flex justify-between mb-3">
        <Text weight="semibold">Total Liquidity</Text>
        <Text weight="semibold" className="flex items-center">
          {isAggregatedOrdersLoading ? (
            <Spinner size={6} />
          ) : (
            <>
              {" "}
              $<Money fiat>{totalLiquidityInfo.totalLiquidityInUSD}</Money>
            </>
          )}
        </Text>
      </div>
    </>
  );

  return (
    <section className="self-start">
      <div className={styles.desktopContent}>
        <Table className="bg-white">
          <div className="text-content text-card-headline flex justify-between mb-[16px]">
            <Text weight="semibold">Current Price</Text>
            <Text size="largeBody" weight="semibold">
              $<Money fiat>{currentPrice}</Money>
            </Text>
          </div>

          <div>{expandedContent}</div>
          <div>
            {!validBaseTokens[estate.token_address] ? (
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            ) : (
              <div className="grid gap-3 grid-cols-2 ">
                <Button onClick={handleOpen.bind(null, BUY)}>Buy</Button>
                <Button
                  variant="red"
                  className="text-white"
                  onClick={handleOpen.bind(null, SELL)}
                >
                  Sell
                </Button>
              </div>
            )}
          </div>
        </Table>
      </div>

      <div className={styles.mobileContent}>
        <div className={styles.mobileWrapper}>
          <div className={styles.mobilePriceBlock}>
            <div className="flex flex-col">
              <Text size="smallBody" color="lightSand">
                Current Price
              </Text>
              <Text size="largeBody" weight="semibold">
                $<Money fiat>{currentPrice}</Money>
              </Text>
            </div>

            <div className="flex items-center gap-[4px]">
              {!validBaseTokens[estate.token_address] ? (
                <Button className="w-full max-w-[200px]" disabled>
                  Coming Soon
                </Button>
              ) : (
                <>
                  <Button
                    className="w-[105px]"
                    onClick={handleOpen.bind(null, BUY)}
                  >
                    Buy
                  </Button>
                  <Button
                    variant="red"
                    className="text-white w-[105px]"
                    onClick={handleOpen.bind(null, SELL)}
                  >
                    Sell
                  </Button>
                </>
              )}
            </div>
          </div>
          <AnimatePresence>
            {shouldExpand && (
              <motion.div
                className="pt-[16px]"
                variants={expandVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                <div className={styles.mobileContent}>{expandedContent}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
