import { FC, useCallback, useMemo, useState } from "react";

// components
import { Button } from "~/lib/atoms/Button";
import { Divider } from "~/lib/atoms/Divider";
import { Table } from "~/lib/atoms/Table/Table";
import { PopupWithIcon } from "~/templates/PopupWIthIcon/PopupWithIcon";
import { InfoTooltip } from "~/lib/organisms/InfoTooltip";
import styles from "./../priceSection.module.css";
import popupStyles from "../popups/popups.module.css";
import { useOrderbookTokenMetadata } from "../hooks/useOrderbookTokenMetadata";
//consts & types
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
import { BUY, CONFIRM, OTC, SELL } from "../consts";
import { PopupContent } from "../popups";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import Money from "~/lib/atoms/Money";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { atomsToTokens } from "~/lib/utils/formaters";
import { useOpenOrders } from "~/lib/apis/mbrwa/openOrders/useOpenOrders";
import { getTotalOrderBookLiquidity } from "../orderBook.consts";
import { Spinner } from "~/lib/atoms/Spinner";
import { Text } from "~/lib/atoms/Typography/Text";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "clsx";

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

const MOBILE_ORDER_BOOK_BREAKPOINT = "(max-width: 820px)";

const getDefaultOrderBookOpenState = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return !window.matchMedia(MOBILE_ORDER_BOOK_BREAKPOINT).matches;
};

export const SecondaryPriceBlock: FC<SecondaryPriceBlockProps> = ({
  activeEstate: estate,
  shouldExpand,
}) => {
  const { validBaseTokens } = useMarketsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isOrderBookOpen, setIsOrderBookOpen] = useState(false);
  const [hasVisibleOrderBook, setHasVisibleOrderBook] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(BUY);
  const { orderbookStorages } = useDexContext();

  const { slug } = estate;
  const { baseTokenDecimals, quoteTokenDecimals } =
    useOrderbookTokenMetadata(estate);

  const { openOrders, loading: isLiquidityLoading } = useOpenOrders({
    rwaAddress: estate.token_address,
  });

  const currentPrice = useMemo(
    () =>
      atomsToTokens(
        orderbookStorages[slug]?.lowestSellPrice ?? 0,
        quoteTokenDecimals
      ) ?? "0",
    [quoteTokenDecimals, orderbookStorages, slug]
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

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
    setIsOrderBookOpen(false);
    setHasVisibleOrderBook(false);
    setOrderType(BUY);
  }, []);

  const handleOpen = useCallback((orderType: OrderType) => {
    const shouldOpenOrderBook = getDefaultOrderBookOpenState();

    setOrderType(orderType);
    setIsOrderBookOpen(shouldOpenOrderBook);
    setHasVisibleOrderBook(shouldOpenOrderBook);
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

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentClassName={classNames(
          popupStyles.popupContent,
          hasVisibleOrderBook && popupStyles.popupContentWithOrderBook
        )}
        contentPosition={"right"}
        className={classNames(
          "bg-white",
          hasVisibleOrderBook && popupStyles.popupWide
        )}
      >
        <PopupContent
          estate={estate}
          isOrderBookOpen={isOrderBookOpen}
          onSuccessfulTransaction={handleRequestClose}
          onOrderBookVisibilityChange={setHasVisibleOrderBook}
          orderType={orderType}
          setIsOrderBookOpen={setIsOrderBookOpen}
          setOrderType={setOrderType}
        />
      </PopupWithIcon>
    </section>
  );
};
