import { FC, useCallback, useMemo } from "react";
import { generatePath, useNavigate } from "@remix-run/react";

// components
import { Button } from "~/lib/atoms/Button";
import { Divider } from "~/lib/atoms/Divider";
import { Table } from "~/lib/atoms/Table/Table";
import { InfoTooltip } from "~/lib/organisms/InfoTooltip";
import styles from "./../priceSection.module.css";
import { useOrderbookTokenMetadata } from "../hooks/useOrderbookTokenMetadata";
//consts & types
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
import { BUY, SELL } from "../consts";
import { getCurrentPriceFromOpenOrders } from "~/providers/Dexprovider/utils";
import Money from "~/lib/atoms/Money";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { useOpenOrders } from "~/lib/apis/mbrwa/openOrders/useOpenOrders";
import { getTotalOrderBookLiquidity } from "../orderBook.consts";
import { Spinner } from "~/lib/atoms/Spinner";
import { Text } from "~/lib/atoms/Typography/Text";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "clsx";
import { ROUTES } from "~/consts/routes";

// types
type TradeSide = typeof BUY | typeof SELL;

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
  const navigate = useNavigate();
  const { validBaseTokens } = useMarketsContext();
  const { baseTokenDecimals, quoteTokenDecimals } =
    useOrderbookTokenMetadata(estate);

  const { openOrders, loading: isLiquidityLoading } = useOpenOrders({
    rwaAddress: estate.token_address,
  });

  // Current Price from the LIVE order book (best ask, falling back to best
  // bid), not the 30s-stale REST snapshot — so it can't show $0 while the book
  // clearly has orders.
  const currentPrice = useMemo(
    () =>
      getCurrentPriceFromOpenOrders({
        buyOrders: openOrders.buyOrders,
        sellOrders: openOrders.sellOrders,
        quoteTokenDecimals,
      }),
    [openOrders.buyOrders, openOrders.sellOrders, quoteTokenDecimals]
  );

  // Total liquidity = USD value of every resting bid + ask in the book.
  const totalLiquidityInUSD = useMemo(
    () =>
      getTotalOrderBookLiquidity({
        buyOrders: openOrders.buyOrders,
        sellOrders: openOrders.sellOrders,
        baseTokenDecimals,
        quoteTokenDecimals,
      }),
    [
      openOrders.buyOrders,
      openOrders.sellOrders,
      baseTokenDecimals,
      quoteTokenDecimals,
    ]
  );

  const handleTradeOpen = useCallback(
    (side: TradeSide) => {
      navigate(
        `${generatePath(ROUTES.trade, {
          address: estate.token_address,
        })}?side=${side}`
      );
    },
    [estate.token_address, navigate]
  );

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
          {isLiquidityLoading ? (
            <Spinner size={6} />
          ) : (
            <>
              {" "}
              $<Money fiat>{totalLiquidityInUSD}</Money>
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
                <Button onClick={handleTradeOpen.bind(null, BUY)}>Buy</Button>
                <Button
                  variant="red"
                  className="text-white"
                  onClick={handleTradeOpen.bind(null, SELL)}
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
                    onClick={handleTradeOpen.bind(null, BUY)}
                  >
                    Buy
                  </Button>
                  <Button
                    variant="red"
                    className="text-white w-[105px]"
                    onClick={handleTradeOpen.bind(null, SELL)}
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
                variants={expandVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                <div className={classNames(styles.mobileContent, "pt-[16px]")}>
                  {expandedContent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
