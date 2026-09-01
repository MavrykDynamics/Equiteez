import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

//screens
import { BuySellScreen } from "../screens/BuySellScreen";
// import { OTCBuySellScreen } from "../screens/OTCBuySellScreen";

// components
import { Divider } from "~/lib/atoms/Divider";
import { TabType } from "~/lib/atoms/Tab";

//consts & types
import {
  EstateType,
  SecondaryEstate,
} from "~/providers/MarketsProvider/market.types";
import { BUY, OrderType, SELL } from "../consts";
import { TabSwitcherV2 } from "~/lib/organisms/TabSwitcherV2/TabSwitcherV2";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";

import {
  ContractActionPopupProps,
  ContractActionToastProps,
  useContractAction,
} from "~/contracts/hooks/useContractAction";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { isDefined } from "~/lib/utils";
import { ProgresBar } from "../PrimaryPriceBlock";
import { pickStatusFromMultiple } from "~/lib/ui/use-status-flag";

import { MAX_ORDERBOOK_DEPTH_LIMIT, useOrderbookDepth } from "~/lib/apis/rwa";
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
  getBestLimitAskFromOrderbookDepth,
  getBestLimitBidFromOrderbookDepth,
  getBestPricesFromOrderbookDepth,
  getMarketBuyTokenAmountAtoms,
  getQuoteValueAtomsForOrder,
  isPriceAlignedToTickSize,
  resolveMarketPrice,
} from "~/providers/Dexprovider/utils";
import { EstateHeadlineTab } from "~/templates/EstateHeadlineTab";
import { Text } from "~/lib/atoms/Typography/Text";
import { MILLION, ZERO } from "~/lib/utils/numbers";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import clsx from "clsx";
import { useOrderbookTokenMetadata } from "../hooks/useOrderbookTokenMetadata";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { PopupWithIcon } from "~/templates/PopupWIthIcon/PopupWithIcon";
import { OrderBookTable } from "~/lib/organisms/OrderBookPopup/OrderBookTable";
import {
  getOrderExpiryTimestamp,
  type OrderExpiryPeriodId,
} from "../components/OrderExpiryBlock/OrderExpiryBlock";
import { TradeConfirmationPopup } from "../components/TradeConfirmationPopup";
import * as gtag from "app/utils/gtags.client";

export const SLIPPAGE_OPTIONS = [5, 10];
const POPUP_RECOMMENDATIONS_LIMIT = 2;
type MarketOrderMode = "market" | "limit";

const getMarketIdentifier = (market: EstateType) =>
  market.assetDetails.blockchain[0]?.identifier;

const isCurrentPopupMarket = (
  market: EstateType,
  currentMarket: SecondaryEstate
) =>
  market.slug === currentMarket.slug ||
  market.token_address === currentMarket.token_address ||
  getMarketIdentifier(market) === getMarketIdentifier(currentMarket);

type BuySellContentProps = {
  estate: SecondaryEstate;
  isOrderBookOpen: boolean;
  onSuccessfulTransaction?: () => void;
  onOrderBookVisibilityChange?: (isVisible: boolean) => void;
  orderType: OrderType;
  setIsOrderBookOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOrderType: React.Dispatch<React.SetStateAction<OrderType>>;
};

export const BuySellContent: FC<BuySellContentProps> = ({
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
  const { isLoading: isDexLoading, orderbookStorages } = useDexContext();
  const mavrykToolkit = useMemo(() => dapp?.tezos(), [dapp]);
  const isSecondaryEstate = estate.assetDetails.type === SECONDARY_MARKET;

  const { loading: isOrderbookDepthLoading, orderbookDepth } =
    useOrderbookDepth({
      enabled: isSecondaryEstate,
      limit: MAX_ORDERBOOK_DEPTH_LIMIT,
      tokenAddress: estate.token_address,
    });
  const {
    marketsArr,
    sortedMarketAddresses,
    pickers: { pickOrderbookConfig },
    activeMarket,
  } = useMarketsContext();

  // MArket Type
  const [marketType, setMarkettype] = useState<MarketOrderMode>("market");
  const isMarketTypeMarket = marketType === "market";

  const [orderExpiryPeriodId, setOrderExpiryPeriodId] =
    useState<OrderExpiryPeriodId | null>(null);
  const [isTradeConfirmationOpen, setIsTradeConfirmationOpen] = useState(false);

  const [activetabId, setAvtiveTabId] = useState<OrderType>(orderType);

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
    () => getBestLimitAskFromOrderbookDepth(orderbookDepth, quoteTokenDecimals),
    [orderbookDepth, quoteTokenDecimals]
  );
  const bestLimitBidAtoms = useMemo(
    () => getBestLimitBidFromOrderbookDepth(orderbookDepth, quoteTokenDecimals),
    [orderbookDepth, quoteTokenDecimals]
  );

  // Display price may fall back to the opposite side for a generic current
  // quote, but placement prices below are strict side-specific values.
  const displayTokenPrice = useMemo(() => {
    const { lowestSellPrice, highestBuyPrice } =
      getBestPricesFromOrderbookDepth(orderbookDepth, quoteTokenDecimals);

    return resolveMarketPrice(
      orderType === BUY,
      lowestSellPrice,
      highestBuyPrice,
      quoteTokenDecimals
    );
  }, [orderType, orderbookDepth, quoteTokenDecimals]);
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
      setOrderType(id);
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

  const handleMarketChange = useCallback(
    (type: MarketOrderMode) => {
      setMarkettype(type);
    },
    [setMarkettype]
  );

  const marketTabs: TabType<MarketOrderMode>[] = useMemo(
    () => [
      {
        id: "market",
        label: "Market",
        handleClick: handleMarketChange,
      },
      {
        id: "limit",
        label: "Limit",
        handleClick: handleMarketChange,
      },
    ],
    [handleMarketChange]
  );
  const selectedMarketTab = useMemo(
    () => marketTabs.find((tab) => tab.id === marketType),
    [marketTabs, marketType]
  );
  const isOrderDataLoading =
    isSecondaryEstate &&
    (isDexLoading || (isMarketTypeMarket && isOrderbookDepthLoading));

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
  const orderExpiry = useMemo(
    () =>
      orderExpiryPeriodId ? getOrderExpiryTimestamp(orderExpiryPeriodId) : null,
    [orderExpiryPeriodId]
  );
  const commonOrderProps = useMemo(
    () => ({
      orderbookContractAddress: orderbookConfig?.address ?? "",
      currency: currencyKey,
      orderExpiry,
      baseTokenDecimals,
      tickSizeAtoms: rawTickSize || undefined,
    }),
    [
      baseTokenDecimals,
      currencyKey,
      orderExpiry,
      orderbookConfig?.address,
      rawTickSize,
    ]
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

  const orderValidationMessage = isOrderDataLoading
    ? undefined
    : marketConfigValidationMessage ||
      liquidityValidationMessage ||
      minOrderValidationMessage ||
      marketBuyBudgetValidationMessage;

  // Operation estimation effect -------------------------------------------
  useEffect(() => {
    if (
      !mavrykToolkit ||
      !total ||
      total.lte(0) ||
      isOrderDataLoading ||
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
    isOrderDataLoading,
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

  const handleSuccessfulTransaction = useCallback(() => {
    setAvtiveTabId(orderType);
    setAmountB(undefined);
    setTotal(undefined);
    setLimitPrice(undefined);
    setOrderExpiryPeriodId(null);
    setNetworkFee(ZERO);
    setIsOrderBookOpen(false);
    onSuccessfulTransaction?.();
  }, [onSuccessfulTransaction, orderType, setIsOrderBookOpen]);

  const contractActionOptions = useMemo(
    () => ({
      onSuccess: handleSuccessfulTransaction,
    }),
    [handleSuccessfulTransaction]
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

  const handleOpenTradeConfirmation = useCallback(() => {
    setIsTradeConfirmationOpen(true);
  }, []);

  const handleCloseTradeConfirmation = useCallback(() => {
    setIsTradeConfirmationOpen(false);
  }, []);

  const handleConfirmedBuySellAction = useCallback(() => {
    buySellActionCb();

    const isBuyAction = orderType === BUY;
    const actionName = isMarketTypeMarket
      ? isBuyAction
        ? "buy_base_token"
        : "sell_base_token"
      : isBuyAction
        ? "limit_buy_base_token"
        : "limit_sell_base_token";
    const eventLabel = isMarketTypeMarket
      ? isBuyAction
        ? "Buy base token"
        : "Sell base token"
      : isBuyAction
        ? "Limit Buy base token"
        : "Limit Sell base token";

    gtag.event({
      action: actionName,
      category: eventLabel,
      label: eventLabel,
    });
  }, [buySellActionCb, isMarketTypeMarket, orderType]);

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

  const shouldRenderOrderBook = isSecondaryEstate;
  const shouldRenderEntryControls = shouldRenderOrderBook;
  const shouldRenderHeader = !isSecondaryEstate;

  useEffect(() => {
    onOrderBookVisibilityChange?.(shouldRenderOrderBook && isOrderBookOpen);
  }, [isOrderBookOpen, onOrderBookVisibilityChange, shouldRenderOrderBook]);

  return (
    <>
      {shouldRenderOrderBook && (
        <PopupWithIcon
          isOpen={isOrderBookOpen}
          onRequestClose={closeOrderBook}
          contentClassName={styles.orderBookPopupContent}
          contentPosition="right"
          className={clsx("bg-white", styles.orderBookPopup)}
        >
          <OrderBookTable
            baseTokenDecimals={baseTokenDecimals}
            baseTokenSymbol={selectedAssetMetadata.symbol}
            enabled={isSecondaryEstate}
            onPriceClick={
              isMarketTypeMarket ? undefined : handleOrderBookPriceSelect
            }
            quoteTokenDecimals={quoteTokenDecimals}
            quoteTokenSymbol={quoteAssetmetadata.symbol}
            referencePrice={tokenPrice.toNumber()}
            rwaAddress={estate.token_address}
          />
        </PopupWithIcon>
      )}
      <TradeConfirmationPopup
        isOpen={isTradeConfirmationOpen}
        onCancel={handleCloseTradeConfirmation}
        onContinue={handleConfirmedBuySellAction}
      />

      <div className={styles.buySellRoot}>
        {shouldRenderHeader && (
          <div className="flex items-center">
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
          </div>
        )}
        {shouldRenderHeader && <Divider className="my-6" />}

        {shouldRenderEntryControls && (
          <div className={styles.tradeControls}>
            <RCustomDropdown className={styles.marketDropdown}>
              <RDropdownFaceContent
                aria-label="Order mode"
                className={styles.marketDropdownTrigger}
              >
                {selectedMarketTab?.label ?? "Market"}
              </RDropdownFaceContent>
              <RDropdownBodyContent
                align="left"
                className={styles.marketDropdownMenu}
              >
                {marketTabs.map((tab) => (
                  <RDropdownBodyContentItem
                    isSelected={tab.id === marketType}
                    key={tab.id}
                    onClick={() => handleMarketChange(tab.id)}
                  >
                    {tab.label}
                  </RDropdownBodyContentItem>
                ))}
              </RDropdownBodyContent>
            </RCustomDropdown>

            <TabSwitcherV2
              activeClassName={styles.sideTabActive}
              activeTabId={activetabId}
              className={styles.sideTabs}
              // @ts-expect-error // OrderType is string
              tabs={tabs}
              tabClassName={styles.sideTab}
            />
          </div>
        )}

        {(activetabId === BUY || activetabId === SELL) &&
          (marketType === "market" ? (
            <BuySellScreen
              estate={estate}
              actionCb={handleOpenTradeConfirmation}
              actionType={activetabId}
              amount={amountB}
              setAmount={setAmountB}
              orderExpiryPeriodId={orderExpiryPeriodId}
              setOrderExpiryPeriodId={setOrderExpiryPeriodId}
              total={total}
              tokenPrice={tokenPrice}
              networkFee={networkFee}
              status={status}
              isOrderDataLoading={isOrderDataLoading}
              validationMessage={orderValidationMessage}
            />
          ) : (
            <BuySellLimitScreen
              rawTickSize={rawTickSize}
              limitPrice={limitPrice}
              marketTokenPrice={tokenPrice}
              setLimitPrice={setLimitPrice}
              estate={estate}
              actionCb={handleOpenTradeConfirmation}
              actionType={activetabId}
              amount={amountB}
              setAmount={setAmountB}
              orderExpiryPeriodId={orderExpiryPeriodId}
              setOrderExpiryPeriodId={setOrderExpiryPeriodId}
              total={total}
              networkFee={networkFee}
              status={status}
              isOrderDataLoading={isOrderDataLoading}
              validationMessage={orderValidationMessage}
            />
          ))}

        {/* {activetabId === OTC && <OTCPopupContent estate={estate} />} */}
      </div>
    </>
  );
};

export const PopupContent = BuySellContent;
