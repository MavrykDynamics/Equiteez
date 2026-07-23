import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

//screens
import { BuySellScreen } from "../screens/BuySellScreen";
import { BuySellConfirmationScreen } from "../screens/BuySellConfirmationScreen";
// import { OTCBuySellScreen } from "../screens/OTCBuySellScreen";

// components
import { Divider } from "~/lib/atoms/Divider";
import { TabType } from "~/lib/atoms/Tab";

// icons
import ArrowLeftIcon from "app/icons/arrow-left.svg?react";

//consts & types
import {
  EstateType,
  SecondaryEstate,
} from "~/providers/MarketsProvider/market.types";
import { BUY, CONFIRM, OrderType, SELL } from "../consts";
import { TabSwitcherV2 } from "~/lib/organisms/TabSwitcherV2/TabSwitcherV2";

import {
  ContractActionPopupProps,
  ContractActionToastProps,
  useContractAction,
} from "~/contracts/hooks/useContractAction";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { isDefined } from "~/lib/utils";
import { ProgresBar } from "../PrimaryPriceBlock";
import usePrevious from "~/lib/ui/hooks/usePrevious";
import Money from "~/lib/atoms/Money";
import { pickStatusFromMultiple } from "~/lib/ui/use-status-flag";

import { useOpenOrders } from "~/lib/apis/mbrwa/openOrders/useOpenOrders";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { BuySellLimitScreen } from "../screens/BuySellLimitScreen";
import {
  orderbookBuy,
  orderbookBuyEstimation,
  orderbookSell,
  orderbookSellEstimation,
} from "~/contracts/orderbook.contract";

import styles from "./popups.module.css";
import {
  atomsToTokens,
  priceToAtoms,
  tokensToAtoms,
} from "~/lib/utils/formaters";
import {
  getBestLimitAsk,
  getBestLimitBid,
  getBestPricesFromOpenOrders,
  getMarketBuyTokenAmountAtoms,
  getQuoteValueAtomsForOrder,
  isPriceAlignedToTickSize,
  resolveMarketPrice,
} from "~/providers/Dexprovider/utils";
import { EstateHeadlineTab } from "~/templates/EstateHeadlineTab";
import { Text } from "~/lib/atoms/Typography/Text";
import { MILLION, ZERO } from "~/lib/utils/numbers";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import {
  ORDER_BOOK_TOGGLE_LABELS,
  OrderBookPopup,
  OrderBookToggleButton,
} from "~/lib/organisms/OrderBookPopup/OrderBookPopup";
import clsx from "clsx";
import { useOrderbookTokenMetadata } from "../hooks/useOrderbookTokenMetadata";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";

export const SLIPPAGE_OPTIONS = [5, 10];
const POPUP_RECOMMENDATIONS_LIMIT = 2;

const getMarketIdentifier = (market: EstateType) =>
  market.assetDetails.blockchain[0]?.identifier;

const isCurrentPopupMarket = (
  market: EstateType,
  currentMarket: SecondaryEstate
) =>
  market.slug === currentMarket.slug ||
  market.token_address === currentMarket.token_address ||
  getMarketIdentifier(market) === getMarketIdentifier(currentMarket);

type PopupContentProps = {
  estate: SecondaryEstate;
  isOrderBookOpen: boolean;
  onSuccessfulTransaction?: () => void;
  onOrderBookVisibilityChange?: (isVisible: boolean) => void;
  orderType: OrderType;
  setIsOrderBookOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOrderType: React.Dispatch<React.SetStateAction<OrderType>>;
};

export const PopupContent: FC<PopupContentProps> = ({
  estate,
  isOrderBookOpen,
  onSuccessfulTransaction,
  onOrderBookVisibilityChange,
  orderType,
  setIsOrderBookOpen,
  setOrderType,
}) => {
  const { slug } = estate;
  const { dapp } = useWalletContext();
  const { orderbookStorages } = useDexContext();
  const mavrykToolkit = useMemo(() => dapp?.tezos(), [dapp]);
  const isSecondaryEstate = estate.assetDetails.type === SECONDARY_MARKET;

  const {
    marketsArr,
    sortedMarketAddresses,
    pickers: { pickOrderbookConfig },
    activeMarket,
  } = useMarketsContext();

  // MArket Type
  const [marketType, setMarkettype] = useState("market");
  const isMarketTypeMarket = marketType === "market";

  const [activetabId, setAvtiveTabId] = useState<OrderType>(orderType);
  const prevTabId = usePrevious(
    activetabId,
    activetabId !== CONFIRM
  ) as OrderType;

  // network fee estimation state --------------------------------------------
  const [networkFee, setNetworkFee] = useState<BigNumber>(ZERO);

  // --------------------------------------------

  // --- input state
  const [amountB, setAmountB] = useState<BigNumber | undefined>();
  const [total, setTotal] = useState<BigNumber | undefined>();

  // for limit market and handling input values
  const [limitPrice, setLimitPrice] = useState<BigNumber | undefined>();

  // const finalLimitPrice = useMemo(() => {
  //   if (slippagePercentage !== 0 && !isMarketTypeMarket) {
  //     const multiplier = new BigNumber(1).minus(
  //       new BigNumber(slippagePercentage).div(100)
  //     );

  //     if (activetabId === BUY) {
  //       // uses amount
  //       return amountB?.times(multiplier);
  //     }
  //     if (activetabId === SELL) {
  //       // uses limit price
  //       return limitPrice?.times(multiplier);
  //     }
  //   }

  //   return limitPrice;
  // }, [
  //   activetabId,
  //   amountB,
  //   isMarketTypeMarket,
  //   limitPrice,
  //   slippagePercentage,
  // ]);

  const {
    baseTokenDecimals,
    baseTokenMetadata: selectedAssetMetadata,
    quoteTokenDecimals,
    quoteTokenMetadata: quoteAssetmetadata,
  } = useOrderbookTokenMetadata(estate);
  const rawTickSize = orderbookStorages[slug]?.tickSize ?? 0;
  const orderbookConfig = pickOrderbookConfig[estate.token_address];
  const orderbookAddress = orderbookConfig?.address ?? null;
  const { openOrders } = useOpenOrders({
    orderbookAddress,
    rwaAddress: estate.token_address,
  });
  const quoteCurrency = orderbookConfig?.currencies[0];
  const currencyKey = quoteCurrency?.currencyKey ?? "";
  const quoteTokenAddress = quoteCurrency?.token.address ?? "";
  const quoteTokenId = quoteCurrency?.token.token_id ?? "";
  const rwaTokenId = orderbookConfig?.rwaTokenId ?? "";
  const hasLimitPriceTickError = useMemo(
    () =>
      !isMarketTypeMarket &&
      !isPriceAlignedToTickSize({
        price: limitPrice,
        rawTickSize,
        quoteTokenDecimals,
      }),
    [isMarketTypeMarket, limitPrice, quoteTokenDecimals, rawTickSize]
  );

  const bestLimitAskAtoms = useMemo(
    () => getBestLimitAsk(openOrders.sellOrders),
    [openOrders.sellOrders]
  );
  const bestLimitBidAtoms = useMemo(
    () => getBestLimitBid(openOrders.buyOrders),
    [openOrders.buyOrders]
  );

  // Display price may fall back to the opposite side for a generic current
  // quote, but placement prices below are strict side-specific values.
  const displayTokenPrice = useMemo(() => {
    const { lowestSellPrice, highestBuyPrice } = getBestPricesFromOpenOrders(
      openOrders.buyOrders,
      openOrders.sellOrders
    );

    return resolveMarketPrice(
      orderType === BUY,
      lowestSellPrice,
      highestBuyPrice,
      quoteTokenDecimals
    );
  }, [
    orderType,
    openOrders.buyOrders,
    openOrders.sellOrders,
    quoteTokenDecimals,
  ]);
  const marketBuyTokenPrice = useMemo(
    () =>
      bestLimitAskAtoms
        ? atomsToTokens(bestLimitAskAtoms, quoteTokenDecimals)
        : ZERO,
    [bestLimitAskAtoms, quoteTokenDecimals]
  );
  const marketSellTokenPrice = useMemo(
    () =>
      bestLimitBidAtoms
        ? atomsToTokens(bestLimitBidAtoms, quoteTokenDecimals)
        : ZERO,
    [bestLimitBidAtoms, quoteTokenDecimals]
  );
  const tokenPrice = useMemo(() => {
    if (!isMarketTypeMarket) return displayTokenPrice;

    return orderType === BUY ? marketBuyTokenPrice : marketSellTokenPrice;
  }, [
    displayTokenPrice,
    isMarketTypeMarket,
    marketBuyTokenPrice,
    marketSellTokenPrice,
    orderType,
  ]);

  const handleTabClick = useCallback(
    (id: OrderType) => {
      setAvtiveTabId(id);
      if (id !== CONFIRM) setOrderType(id);
    },
    [setOrderType]
  );

  const tabs: TabType<OrderType>[] = useMemo(
    () => [
      {
        id: BUY,
        label: "Buy",
        handleClick: handleTabClick,
      },
      {
        id: SELL,
        label: "Sell",
        handleClick: handleTabClick,
      },
      // {
      //   id: OTC,
      //   label: "OTC",
      //   handleClick: handleTabClick,
      //   disabled: true,
      // },
    ],
    [handleTabClick]
  );

  const handlaMarketChange = useCallback(
    (type: string) => {
      setMarkettype(type);
    },
    [setMarkettype]
  );

  const marketTabs: TabType[] = useMemo(
    () => [
      {
        id: "market",
        label: "Market",
        handleClick: handlaMarketChange,
      },
      {
        id: "limit",
        label: "Limit",
        handleClick: handlaMarketChange,
      },
    ],
    [handlaMarketChange]
  );

  useEffect(() => {
    const priceToUse = isMarketTypeMarket ? tokenPrice : limitPrice;

    if (!isDefined(amountB)) {
      setTotal(undefined);
    } else if (isMarketTypeMarket && activetabId === BUY) {
      setTotal(amountB);
    } else if (priceToUse) {
      setTotal(amountB.times(priceToUse));
    }
  }, [
    amountB,
    activetabId,
    estate.token_address,
    marketType,
    slug,
    tokenPrice,
    limitPrice,
    isMarketTypeMarket,
  ]);

  // reset values when switching tabs
  useLayoutEffect(() => {
    if (activetabId === CONFIRM) return;

    setAmountB(undefined);
    setLimitPrice(undefined);
  }, [activetabId, marketType]);

  const limitAmountAtoms = useMemo(
    () =>
      amountB
        ? tokensToAtoms(amountB, baseTokenDecimals, BigNumber.ROUND_DOWN)
        : ZERO,
    [amountB, baseTokenDecimals]
  );
  const limitPriceAtoms = useMemo(
    () =>
      limitPrice
        ? priceToAtoms(limitPrice, quoteTokenDecimals, BigNumber.ROUND_DOWN)
        : ZERO,
    [limitPrice, quoteTokenDecimals]
  );
  const marketBuyAmountAtoms = useMemo(() => {
    if (!amountB || !bestLimitAskAtoms) return ZERO;

    try {
      return getMarketBuyTokenAmountAtoms({
        quoteBudget: amountB,
        quoteTokenDecimals,
        baseTokenDecimals,
        pricePerTokenAtoms: bestLimitAskAtoms,
      });
    } catch {
      return ZERO;
    }
  }, [amountB, baseTokenDecimals, bestLimitAskAtoms, quoteTokenDecimals]);
  const marketSellAmountAtoms = useMemo(
    () =>
      amountB
        ? tokensToAtoms(amountB, baseTokenDecimals, BigNumber.ROUND_DOWN)
        : ZERO,
    [amountB, baseTokenDecimals]
  );
  const marketBuyDisplayAmount = useMemo(
    () => atomsToTokens(marketBuyAmountAtoms, baseTokenDecimals),
    [baseTokenDecimals, marketBuyAmountAtoms]
  );

  const commonOrderProps = useMemo(
    () => ({
      orderbookContractAddress: orderbookConfig?.address ?? "",
      currency: currencyKey,
      orderExpiry: null,
      baseTokenDecimals,
      tickSizeAtoms: rawTickSize || undefined,
    }),
    [baseTokenDecimals, currencyKey, orderbookConfig?.address, rawTickSize]
  );

  // Orderbook limit buy | sell with custom user price
  const limitBuyProps = useMemo(
    () => ({
      ...commonOrderProps,
      quoteTokenAddress,
      quoteTokenId,
      rwaTokenAmount: limitAmountAtoms.toFixed(0),
      pricePerRwaToken: limitPriceAtoms.toFixed(0),
      minRwaTokenAmount: orderbookConfig?.minBuyOrderAmount,
      minQuoteValue: orderbookConfig?.minBuyOrderValue,
      isMarketOrder: false,
    }),
    [
      commonOrderProps,
      limitAmountAtoms,
      limitPriceAtoms,
      orderbookConfig?.minBuyOrderAmount,
      orderbookConfig?.minBuyOrderValue,
      quoteTokenAddress,
      quoteTokenId,
    ]
  );

  const limitSellProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { quoteTokenAddress, quoteTokenId, ...restBuyprops } = limitBuyProps;

    return {
      ...restBuyprops,
      rwaTokenId,
      rwaTokenAddress: estate.token_address,
      minRwaTokenAmount: orderbookConfig?.minSellOrderAmount,
      minQuoteValue: orderbookConfig?.minSellOrderValue,
    };
  }, [
    estate.token_address,
    limitBuyProps,
    orderbookConfig?.minSellOrderAmount,
    orderbookConfig?.minSellOrderValue,
    rwaTokenId,
  ]);

  // Orderbook market with dynamic price
  const marketBuyProps = useMemo(() => {
    return {
      ...commonOrderProps,
      quoteTokenAddress,
      quoteTokenId,
      rwaTokenAmount: marketBuyAmountAtoms.toFixed(0),
      pricePerRwaToken: bestLimitAskAtoms?.toFixed(0) ?? "0",
      minRwaTokenAmount: orderbookConfig?.minBuyOrderAmount,
      minQuoteValue: orderbookConfig?.minBuyOrderValue,
      isMarketOrder: true,
    };
  }, [
    bestLimitAskAtoms,
    commonOrderProps,
    marketBuyAmountAtoms,
    orderbookConfig?.minBuyOrderAmount,
    orderbookConfig?.minBuyOrderValue,
    quoteTokenAddress,
    quoteTokenId,
  ]);

  const marketSellProps = useMemo(() => {
    return {
      ...commonOrderProps,
      rwaTokenAmount: marketSellAmountAtoms.toFixed(0),
      pricePerRwaToken: bestLimitBidAtoms?.toFixed(0) ?? "0",
      minRwaTokenAmount: orderbookConfig?.minSellOrderAmount,
      minQuoteValue: orderbookConfig?.minSellOrderValue,
      rwaTokenId,
      rwaTokenAddress: estate.token_address,
      isMarketOrder: true,
    };
  }, [
    bestLimitBidAtoms,
    commonOrderProps,
    estate.token_address,
    marketSellAmountAtoms,
    orderbookConfig?.minSellOrderAmount,
    orderbookConfig?.minSellOrderValue,
    rwaTokenId,
  ]);

  const marketConfigValidationMessage = useMemo(() => {
    if (!orderbookConfig?.address) {
      return "Selected market is missing orderbook configuration.";
    }

    if (!quoteTokenAddress) {
      return "Selected market is missing quote-token address.";
    }

    if (quoteTokenId === "") {
      return "Selected market is missing quote-token ID.";
    }

    if (rwaTokenId === "") {
      return "Selected market is missing RWA token ID.";
    }

    if (!currencyKey) {
      return "Selected market is missing currency key.";
    }

    if (!Number.isInteger(baseTokenDecimals) || baseTokenDecimals < 0) {
      return "Selected market is missing base-token decimals.";
    }

    if (!Number.isInteger(quoteTokenDecimals) || quoteTokenDecimals < 0) {
      return "Selected market is missing quote-token decimals.";
    }

    if (new BigNumber(rawTickSize).lte(0)) {
      return "Selected market is missing tick-size configuration.";
    }

    return undefined;
  }, [
    baseTokenDecimals,
    currencyKey,
    orderbookConfig?.address,
    quoteTokenDecimals,
    quoteTokenAddress,
    quoteTokenId,
    rawTickSize,
    rwaTokenId,
  ]);

  const liquidityValidationMessage = useMemo(() => {
    if (!isMarketTypeMarket) return undefined;

    if (orderType === BUY && !bestLimitAskAtoms) {
      return "No sell liquidity is available for a market buy.";
    }

    if (orderType === SELL && !bestLimitBidAtoms) {
      return "No buy liquidity is available for a market sell.";
    }

    return undefined;
  }, [bestLimitAskAtoms, bestLimitBidAtoms, isMarketTypeMarket, orderType]);

  const minOrderValidationMessage = useMemo(() => {
    const amountAtoms = isMarketTypeMarket
      ? orderType === BUY
        ? marketBuyAmountAtoms
        : marketSellAmountAtoms
      : limitAmountAtoms;
    const priceAtoms = isMarketTypeMarket
      ? orderType === BUY
        ? (bestLimitAskAtoms ?? ZERO)
        : (bestLimitBidAtoms ?? ZERO)
      : limitPriceAtoms;
    const minAmount =
      orderType === BUY
        ? orderbookConfig?.minBuyOrderAmount
        : orderbookConfig?.minSellOrderAmount;
    const minQuoteValue =
      orderType === BUY
        ? orderbookConfig?.minBuyOrderValue
        : orderbookConfig?.minSellOrderValue;

    if (!amountAtoms.isFinite() || amountAtoms.lte(0)) return undefined;

    if (minAmount !== undefined && amountAtoms.lt(minAmount)) {
      return "Order amount is below the selected orderbook minimum.";
    }

    if (minQuoteValue !== undefined && priceAtoms.gt(0)) {
      const quoteValueAtoms = getQuoteValueAtomsForOrder({
        tokenAmountAtoms: amountAtoms,
        pricePerTokenAtoms: priceAtoms,
        baseTokenDecimals,
      });

      if (quoteValueAtoms.lt(minQuoteValue)) {
        return "Order value is below the selected orderbook minimum.";
      }
    }

    return undefined;
  }, [
    baseTokenDecimals,
    bestLimitAskAtoms,
    bestLimitBidAtoms,
    isMarketTypeMarket,
    limitAmountAtoms,
    limitPriceAtoms,
    marketBuyAmountAtoms,
    marketSellAmountAtoms,
    orderType,
    orderbookConfig?.minBuyOrderAmount,
    orderbookConfig?.minBuyOrderValue,
    orderbookConfig?.minSellOrderAmount,
    orderbookConfig?.minSellOrderValue,
  ]);

  const marketBuyBudgetValidationMessage = useMemo(() => {
    if (
      !isMarketTypeMarket ||
      orderType !== BUY ||
      !amountB ||
      !bestLimitAskAtoms
    ) {
      return undefined;
    }

    const quoteBudgetAtoms = priceToAtoms(
      amountB,
      quoteTokenDecimals,
      BigNumber.ROUND_DOWN
    );
    const requiredQuoteAtoms = getQuoteValueAtomsForOrder({
      tokenAmountAtoms: marketBuyAmountAtoms,
      pricePerTokenAtoms: bestLimitAskAtoms,
      baseTokenDecimals,
      roundingMode: BigNumber.ROUND_UP,
    });

    if (requiredQuoteAtoms.gt(quoteBudgetAtoms)) {
      return "Market buy amount exceeds the quote budget after atom rounding.";
    }

    return undefined;
  }, [
    amountB,
    baseTokenDecimals,
    bestLimitAskAtoms,
    isMarketTypeMarket,
    marketBuyAmountAtoms,
    orderType,
    quoteTokenDecimals,
  ]);

  const orderValidationMessage =
    marketConfigValidationMessage ||
    liquidityValidationMessage ||
    minOrderValidationMessage ||
    marketBuyBudgetValidationMessage;

  // Operation estimation effect -------------------------------------------
  useEffect(() => {
    if (
      !mavrykToolkit ||
      !total ||
      total.lte(0) ||
      hasLimitPriceTickError ||
      orderValidationMessage
    ) {
      setNetworkFee(ZERO);
      return;
    }

    let cancelled = false;

    const t = window.setTimeout(async () => {
      try {
        const estimateFnToUse =
          orderType === BUY ? orderbookBuyEstimation : orderbookSellEstimation;
        const paramsToUse = isMarketTypeMarket
          ? orderType === BUY
            ? marketBuyProps
            : marketSellProps
          : orderType === BUY
            ? limitBuyProps
            : limitSellProps;

        // @ts-expect-error // amount is defined
        const res = await estimateFnToUse({
          ...paramsToUse,
          tezos: mavrykToolkit,
        });

        if (cancelled) return;

        if (res.actionSuccess) {
          // Full on-chain cost of the transaction (network fee + storage burn),
          // not just the suggested fee.
          const { totalCost } = res.data;

          const networkFeeTez = new BigNumber(totalCost).dividedBy(MILLION);

          setNetworkFee(networkFeeTez);
        }
      } catch (e) {
        if (!cancelled) setNetworkFee(ZERO);
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [
    hasLimitPriceTickError,
    isMarketTypeMarket,
    limitBuyProps,
    limitSellProps,
    mavrykToolkit,
    marketBuyProps,
    marketSellProps,
    orderType,
    orderValidationMessage,
    total,
  ]);

  // actual contract calls and their handlers ---------------

  const popupRecommendedMarkets = useMemo(() => {
    const visibleMarketSlugs = new Set(sortedMarketAddresses);

    return marketsArr
      .filter(
        (market) =>
          visibleMarketSlugs.has(market.slug) &&
          !isCurrentPopupMarket(market, estate)
      )
      .slice(0, POPUP_RECOMMENDATIONS_LIMIT);
  }, [estate, marketsArr, sortedMarketAddresses]);

  const memoizedPopupProps: ContractActionPopupProps | undefined = useMemo(
    () =>
      popupRecommendedMarkets.length
        ? {
            key: "inProgressRwaAd",
            props: { rwas: popupRecommendedMarkets },
          }
        : undefined,
    [popupRecommendedMarkets]
  );

  const memoizedToastProps: ContractActionToastProps = useMemo(() => {
    const action = orderType === BUY ? "bought" : "sold";
    return {
      success: {
        title: `${activeMarket?.symbol} ${orderType === BUY ? "Buy" : "Sell"}`,
        message: `Successfully ${action} ${activeMarket?.symbol}`,
      },
    };
  }, [orderType, activeMarket?.symbol]);

  const contractActionOptions = useMemo(
    () => ({
      onSuccess: onSuccessfulTransaction,
    }),
    [onSuccessfulTransaction]
  );

  const { invokeAction: handleMarketBuy, status: buyStatus } =
    useContractAction(
      orderbookBuy,
      marketBuyProps,
      memoizedPopupProps,
      memoizedToastProps,
      contractActionOptions
    );

  const { invokeAction: handleMarketSell, status: sellStatus } =
    useContractAction(
      orderbookSell,
      marketSellProps,
      memoizedPopupProps,
      memoizedToastProps,
      contractActionOptions
    );

  const { invokeAction: handleLimitBuy, status: limitBuyStatus } =
    useContractAction(
      orderbookBuy,
      limitBuyProps,
      memoizedPopupProps,
      memoizedToastProps,
      contractActionOptions
    );

  const { invokeAction: handleLimitSell, status: limitSellStatus } =
    useContractAction(
      orderbookSell,
      limitSellProps,
      memoizedPopupProps,
      memoizedToastProps,
      contractActionOptions
    );

  // prop action to pass
  const buySellActionCb = useMemo(() => {
    if (isMarketTypeMarket) {
      return orderType === BUY ? handleMarketBuy : handleMarketSell;
    }

    return orderType === BUY ? handleLimitBuy : handleLimitSell;
  }, [
    handleLimitBuy,
    handleLimitSell,
    handleMarketBuy,
    handleMarketSell,
    isMarketTypeMarket,
    orderType,
  ]);

  // status of the operation
  const status = useMemo(
    () =>
      pickStatusFromMultiple(
        buyStatus,
        sellStatus,
        limitBuyStatus,
        limitSellStatus
      ),
    [buyStatus, limitBuyStatus, limitSellStatus, sellStatus]
  );

  const toggleOrderBook = useCallback(() => {
    setIsOrderBookOpen((prev) => !prev);
  }, [setIsOrderBookOpen]);

  const closeOrderBook = useCallback(() => {
    setIsOrderBookOpen(false);
  }, [setIsOrderBookOpen]);

  const handleOrderBookPriceSelect = useCallback(
    (price: number) => {
      if (marketType !== "limit" || !Number.isFinite(price) || price <= 0)
        return;

      setLimitPrice((currentPrice) => {
        const nextPrice = new BigNumber(price);

        return currentPrice?.eq(nextPrice) ? currentPrice : nextPrice;
      });
    },
    [marketType]
  );
  const popupMainRef = useRef<HTMLDivElement>(null);
  const [popupMainHeight, setPopupMainHeight] = useState<number>();

  const HeadlinePreviewSection = () => (
    <div className="flex items-center gap-3 font-medium">
      <div className="w-[76px] h-[57px] rounded-lg overflow-hidden">
        <img
          src={estate.assetDetails.previewImage}
          alt={estate.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-1 items-start">
        <h3 className="text-card-headline text-sand-900">{estate.name}</h3>

        <div className="flex items-center gap-[8px]">
          <EstateHeadlineTab
            isSecondaryEstate={estate.assetDetails.type === "Secondary Market"}
          />
          <Text size="smallBody" weight="semibold">
            APY {estate.assetDetails.APY}%
          </Text>
        </div>
      </div>
    </div>
  );

  const shouldRenderOrderBook = isSecondaryEstate && activetabId !== CONFIRM;
  const hasOpenOrderBook = shouldRenderOrderBook && isOrderBookOpen;
  const continueButtonClassName = isOrderBookOpen
    ? styles.hideContinueButtonMobile
    : undefined;

  useEffect(() => {
    onOrderBookVisibilityChange?.(hasOpenOrderBook);
  }, [hasOpenOrderBook, onOrderBookVisibilityChange]);

  useLayoutEffect(() => {
    const popupMainElement = popupMainRef.current;

    if (!popupMainElement || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const updatePopupMainHeight = () => {
      setPopupMainHeight(popupMainElement.getBoundingClientRect().height);
    };

    updatePopupMainHeight();

    const resizeObserver = new ResizeObserver(() => {
      updatePopupMainHeight();
    });

    resizeObserver.observe(popupMainElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [shouldRenderOrderBook]);

  return (
    <div
      className={clsx(styles.popupLayout, {
        [styles.popupLayoutWithOrderBook]: hasOpenOrderBook,
      })}
    >
      {shouldRenderOrderBook && (
        <OrderBookPopup
          baseTokenDecimals={baseTokenDecimals}
          baseTokenSymbol={selectedAssetMetadata.symbol}
          desktopHeight={popupMainHeight}
          enabled={isSecondaryEstate}
          isOpen={isOrderBookOpen}
          onClose={closeOrderBook}
          onPriceClick={
            isMarketTypeMarket ? undefined : handleOrderBookPriceSelect
          }
          orderbookAddress={orderbookAddress}
          quoteTokenDecimals={quoteTokenDecimals}
          quoteTokenSymbol={quoteAssetmetadata.symbol}
          rawTickSize={rawTickSize || undefined}
          referencePrice={tokenPrice.toNumber()}
          rwaAddress={estate.token_address}
        />
      )}

      <div
        ref={popupMainRef}
        className={clsx("flex-1 flex flex-col min-w-0", styles.popupMain)}
      >
        <div className="flex flex-col text-content flex-1 min-h-0 relative min-w-0 bg-white">
          <div className="flex items-center">
            {activetabId === CONFIRM ? (
              <div
                role="presentation"
                onClick={() => setAvtiveTabId(prevTabId)}
                className="flex items-center cursor-pointer"
              >
                <button>
                  <ArrowLeftIcon className="size-6 mr-2" />
                </button>
                <span className="text-card-headline text-sand-900">
                  Checkout
                </span>
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <HeadlinePreviewSection />
                {!isSecondaryEstate && (
                  <div className="mt-4 w-full">
                    <h4 className="text-content text-body mb-3 font-semibold">
                      Shares
                    </h4>
                    <ProgresBar
                      tokensCount={
                        estate.assetDetails.priceDetails.tokensAvailable
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <Divider className="my-6" />

          {activetabId !== CONFIRM && isSecondaryEstate && (
            <>
              <div className="mb-3">
                <OrderBookToggleButton
                  isOpen={isOrderBookOpen}
                  labels={ORDER_BOOK_TOGGLE_LABELS}
                  onClick={toggleOrderBook}
                />
              </div>
              <div className="mb-[8px]">
                <TabSwitcherV2
                  className={styles.tabsWrapper}
                  tabs={marketTabs}
                  tabClassName={styles.tab}
                  activeTabId={marketType}
                />
              </div>
              <div>
                <div className="mb-3 text-base">
                  <TabSwitcherV2
                    className={styles.tabsWrapper}
                    // @ts-expect-error // OrderType is string
                    tabs={tabs}
                    tabClassName={styles.tab}
                    activeTabId={activetabId}
                  />
                </div>
              </div>
            </>
          )}

          {activetabId === CONFIRM && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-8">
              <div className="flex items-center gap-3 font-medium">
                <div className="w-[124px] h-[93px] rounded-lg overflow-hidden">
                  <img
                    src={estate.assetDetails.previewImage}
                    alt={estate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 items-start flex-1">
                  <div className="flex justify-between items-start gap-6 text-card-headline text-sand-900 w-full">
                    <h3>{estate.name}</h3>
                    <h3 className="flex items-center gap-1 text-right">
                      {orderType === BUY ? (
                        <Money
                          smallFractionFont={false}
                          cryptoDecimals={selectedAssetMetadata.decimals}
                        >
                          {isMarketTypeMarket
                            ? marketBuyDisplayAmount
                            : (amountB ?? 0)}
                        </Money>
                      ) : (
                        amountB?.toNumber()
                      )}{" "}
                      {estate.symbol}
                    </h3>
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="px-2 py-[2px] rounded-[4px] text-body-xs text-sand-800 bg-[#F6AFAFBF] text-center">
                      {estate.assetDetails.propertyDetails.propertyType}
                    </span>
                    <div className="text-body text-sand-900">
                      $
                      <Money smallFractionFont={false}>
                        {!isMarketTypeMarket
                          ? (total ?? 0)
                          : orderType === BUY
                            ? (amountB ?? 0)
                            : (total ?? 0)}
                      </Money>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activetabId === BUY || activetabId === SELL) &&
            (marketType === "market" ? (
              <BuySellScreen
                estate={estate}
                toggleScreen={() => setAvtiveTabId(CONFIRM)}
                actionType={activetabId}
                continueButtonClassName={continueButtonClassName}
                amount={amountB}
                setAmount={setAmountB}
                total={total}
                tokenPrice={tokenPrice}
                networkFee={networkFee}
                validationMessage={orderValidationMessage}
              />
            ) : (
              <BuySellLimitScreen
                rawTickSize={rawTickSize}
                limitPrice={limitPrice}
                marketTokenPrice={tokenPrice}
                setLimitPrice={setLimitPrice}
                estate={estate}
                toggleScreen={() => setAvtiveTabId(CONFIRM)}
                actionType={activetabId}
                continueButtonClassName={continueButtonClassName}
                amount={amountB}
                setAmount={setAmountB}
                total={total}
                networkFee={networkFee}
                validationMessage={orderValidationMessage}
              />
            ))}

          {/* {activetabId === OTC && <OTCPopupContent estate={estate} />} */}
          {activetabId === CONFIRM && (
            <BuySellConfirmationScreen
              actionType={orderType === BUY ? BUY : SELL}
              actionCb={buySellActionCb}
              status={status}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// export const OTCPopupContent: FC<{ estate: SecondaryEstate }> = ({
//   estate,
// }) => {
//   const [activeScreenId, setActiveScreenId] = useState<OTCScreenState>(OTC);
//   const [activeTabId, setActiveTabId] = useState<OTCTabType>(OTC_BUY);

//   const toggleBuyScreen = useCallback((id: OTCScreenState) => {
//     setActiveScreenId(id);
//   }, []);

//   const toggleTabScreen = useCallback((id: OTCTabType) => {
//     setActiveTabId(id);
//   }, []);

//   // TODO take from buysell screen
//   const amount = 10;
//   const price = 45;

//   const tabs: TabType<OTCTabType>[] = useMemo(
//     () => [
//       {
//         id: OTC_BUY,
//         label: "OTC Buy",
//         handleClick: toggleTabScreen,
//       },
//       {
//         id: OTC_SELL,
//         label: "OTC Sell",
//         handleClick: toggleTabScreen,
//       },
//     ],
//     [toggleTabScreen]
//   );
//   return (
//     <div className="flex flex-col justify-between text-content h-full">
//       <>
//         <div className="flex-1 flex flex-col">
//           <div className="flex items-center">
//             {activeScreenId === CONFIRM && (
//               <button onClick={() => toggleBuyScreen("otc")}>
//                 <ArrowLeftIcon className="size-6 mr-2" />
//               </button>
//             )}
//           </div>

//           {activeScreenId !== CONFIRM && (
//             <TabSwitcher
//               variant="secondary"
//               tabs={tabs}
//               activeTabId={activeTabId}
//               grow={true}
//             />
//           )}

//           {/* {activeScreenId === OTC && (
//             <OTCBuySellScreen
//               symbol={estate.symbol}
//               estate={estate}
//               toggleScreen={toggleBuyScreen}
//               activeTabId={activeTabId}
//             />
//           )} */}
//           {activeScreenId === CONFIRM && (
//             <BuySellConfirmationScreen
//               estate={estate}
//               tokenPrice={price}
//               total={price * amount}
//               amount={amount}
//               actionType={activeTabId}
//             />
//           )}
//         </div>
//       </>
//     </div>
//   );
// };
