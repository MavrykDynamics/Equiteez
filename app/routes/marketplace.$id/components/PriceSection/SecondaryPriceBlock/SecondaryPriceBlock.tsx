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
import { getCurrentPriceFromOrderbookDepth } from "~/providers/Dexprovider/utils";
import Money from "~/lib/atoms/Money";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import {
  MAX_ORDERBOOK_DEPTH_LIMIT,
  useOrderbookDepth,
} from "~/lib/apis/rwa";
import { getTotalOrderBookDepthLiquidity } from "../orderBook.consts";
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
  const { quoteTokenDecimals } = useOrderbookTokenMetadata(estate);

  const { orderbookDepth, loading: isLiquidityLoading } = useOrderbookDepth({
    limit: MAX_ORDERBOOK_DEPTH_LIMIT,
    tokenAddress: estate.token_address,
  });

  // Current price from the live orderbook depth: best ask, falling back to best
  // bid, so one-sided books still get a usable quote.
  const currentPrice = useMemo(
    () =>
      getCurrentPriceFromOrderbookDepth({
        orderbookDepth,
        quoteTokenDecimals,
      }),
    [orderbookDepth, quoteTokenDecimals]
  );

  // Total liquidity = quote value of every fetched resting bid + ask level.
  const totalLiquidityInUSD = useMemo(
    () => getTotalOrderBookDepthLiquidity(orderbookDepth),
    [orderbookDepth]
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
