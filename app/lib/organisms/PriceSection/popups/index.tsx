import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

//screens
import { BuySellScreen } from "../screens/BuySellScreen";

// components
import { TabType } from "~/lib/atoms/Tab";

//consts & types
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderbookExecutionConfig } from "~/lib/orderbook/orderbookConfig.types";
import { matchesOrderbookDepth } from "~/lib/orderbook/orderbookConfig";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
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
import type { ContractActionSuccessMetadata } from "~/contracts/actions.type";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { isDefined } from "~/lib/utils";
import { pickStatusFromMultiple } from "~/lib/ui/use-status-flag";

import { MAX_ORDERBOOK_DEPTH_LIMIT, useOrderbookDepth } from "~/lib/apis/rwa";
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
} from "~/lib/orderbook";
import { MILLION, ZERO } from "~/lib/utils/numbers";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import clsx from "clsx";
import {
  useOrderbookTokenMetadata,
  type OrderbookTokenMetadata,
} from "../hooks/useOrderbookTokenMetadata";
import { PopupWithIcon } from "~/templates/PopupWIthIcon/PopupWithIcon";
import { OrderBookTable } from "~/lib/organisms/OrderBookPopup/OrderBookTable";
import { RIcon } from "~/lib/atoms/RIcon/RIcon";
import {
  getOrderExpiryTimestamp,
  type OrderExpiryPeriodId,
} from "../components/OrderExpiryBlock/OrderExpiryBlock";
import { TradeConfirmationPopup } from "../components/TradeConfirmationPopup";
import * as gtag from "app/utils/gtags.client";

const POPUP_RECOMMENDATIONS_LIMIT = 2;
type MarketOrderMode = "market" | "limit";

type BuySellContentProps = {
  asset: AssetType;
  orderbookConfig: OrderbookExecutionConfig;
  configError?: string;
  onRetryConfig: () => void;
  isOrderBookOpen: boolean;
  orderBookContainer?: HTMLElement | null;
  onSuccessfulTransaction?: (metadata: ContractActionSuccessMetadata) => void;
  onOrderBookVisibilityChange?: (isVisible: boolean) => void;
  orderType: OrderType;
  setIsOrderBookOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOrderType: React.Dispatch<React.SetStateAction<OrderType>>;
};

export const BuySellContent: FC<BuySellContentProps> = (props) => {
  const metadata = useOrderbookTokenMetadata(
    props.asset,
    props.orderbookConfig
  );
  if (!metadata.isMetadataLoaded) {
    return (
      <div role="status">
        Trading unavailable: token metadata does not match the selected
        orderbook.
      </div>
    );
  }
  return <BuySellForm {...props} metadata={metadata} />;
};

const BuySellForm: FC<
  BuySellContentProps & { metadata: OrderbookTokenMetadata }
> = ({
  metadata,
  asset,
  orderbookConfig,
  configError,
  onRetryConfig,
  isOrderBookOpen,
  orderBookContainer,
  onSuccessfulTransaction,
  onOrderBookVisibilityChange,
  orderType,
  setIsOrderBookOpen,
  setOrderType,
}) => {
  const { assets, prices } = useAssetsContext();
  const { dapp } = useWalletContext();
  const { hasOrders } = useUserContext();

  const mavrykToolkit = useMemo(() => dapp?.tezos(), [dapp]);

  const {
    error: depthError,
    loading: isOrderbookDepthLoading,
    orderbookDepth: fetchedDepth,
  } = useOrderbookDepth({
    enabled: true,
    limit: MAX_ORDERBOOK_DEPTH_LIMIT,
    tokenAddress: asset.address,
  });
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

  const {
    baseTokenSlug: slug,
    isMetadataLoaded,
    baseTokenDecimals,
    baseTokenMetadata: selectedAssetMetadata,
    quoteTokenDecimals,
    quoteTokenMetadata: quoteAssetmetadata,
  } = metadata;
  const orderbookDepth = matchesOrderbookDepth(
    fetchedDepth,
    orderbookConfig,
    quoteTokenDecimals
  )
    ? fetchedDepth
    : null;
  const rawTickSize = orderbookConfig.tickSize;
  const { currencyKey, quoteTokenAddress, quoteTokenId, rwaTokenId } =
    orderbookConfig;
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
  const isOrderDataLoading = isMarketTypeMarket && isOrderbookDepthLoading;

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
    asset.address,
    marketType,
    slug,
    tokenPrice,
    limitPrice,
    isMarketTypeMarket,
  ]);

  useEffect(() => {
    setAvtiveTabId(orderType);
  }, [orderType]);

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
      !isMarketTypeMarket && orderExpiryPeriodId
        ? getOrderExpiryTimestamp(orderExpiryPeriodId)
        : null,
    [isMarketTypeMarket, orderExpiryPeriodId]
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
      rwaTokenAddress: asset.address,
      minRwaTokenAmount: orderbookConfig?.minSellOrderAmount,
      minQuoteValue: orderbookConfig?.minSellOrderValue,
    };
  }, [
    asset.address,
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
      rwaTokenAddress: asset.address,
      isMarketOrder: true,
    };
  }, [
    bestLimitBidAtoms,
    commonOrderProps,
    asset.address,
    marketSellAmountAtoms,
    orderbookConfig?.minSellOrderAmount,
    orderbookConfig?.minSellOrderValue,
    rwaTokenId,
  ]);

  const marketConfigValidationMessage = useMemo(() => {
    if (configError) return configError;
    if (fetchedDepth && !orderbookDepth)
      return "Orderbook depth does not match the selected token pair.";
    if (isMarketTypeMarket && depthError)
      return "Orderbook depth is unavailable.";
    if (!isMetadataLoaded)
      return "Token metadata does not match the selected orderbook.";
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
    configError,
    fetchedDepth,
    orderbookDepth,
    isMarketTypeMarket,
    depthError,
    isMetadataLoaded,
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

  const popupRecommendedMarkets = useMemo(
    () =>
      assets
        .filter((item) => item.address !== asset.address)
        .slice(0, POPUP_RECOMMENDATIONS_LIMIT),
    [assets, asset.address]
  );

  const memoizedPopupProps: ContractActionPopupProps | undefined = useMemo(
    () =>
      popupRecommendedMarkets.length
        ? {
            key: "inProgressRwaAd",
            props: { rwas: popupRecommendedMarkets, prices },
          }
        : undefined,
    [popupRecommendedMarkets, prices]
  );

  const memoizedToastProps: ContractActionToastProps = useMemo(() => {
    const action = orderType === BUY ? "bought" : "sold";
    return {
      success: {
        title: `${asset.metadata.symbol} ${orderType === BUY ? "Buy" : "Sell"}`,
        message: `Successfully ${action} ${asset.metadata.symbol}`,
      },
    };
  }, [orderType, asset.metadata.symbol]);

  const handleSuccessfulTransaction = useCallback(
    (metadata: ContractActionSuccessMetadata) => {
      setAvtiveTabId(orderType);
      setAmountB(undefined);
      setTotal(undefined);
      setLimitPrice(undefined);
      setOrderExpiryPeriodId(null);
      setNetworkFee(ZERO);
      setIsOrderBookOpen(false);
      onSuccessfulTransaction?.(metadata);
    },
    [onSuccessfulTransaction, orderType, setIsOrderBookOpen]
  );

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

  const handleCloseTradeConfirmation = useCallback(() => {
    setIsTradeConfirmationOpen(false);
  }, []);

  const handleConfirmedBuySellAction = useCallback(() => {
    if (isOrderDataLoading || orderValidationMessage || hasLimitPriceTickError)
      return;
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
  }, [
    buySellActionCb,
    isMarketTypeMarket,
    orderType,
    isOrderDataLoading,
    orderValidationMessage,
    hasLimitPriceTickError,
  ]);

  const handleBuySellAction = useCallback(() => {
    if (hasOrders === true) {
      handleConfirmedBuySellAction();
      return;
    }

    setIsTradeConfirmationOpen(true);
  }, [handleConfirmedBuySellAction, hasOrders]);

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

  const orderBookCloseButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOrderBookOpen || !orderBookContainer) return;

    const previousFocus = document.activeElement;
    orderBookCloseButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOrderBook();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        (orderBookContainer.contains(document.activeElement) ||
          document.activeElement === document.body)
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [closeOrderBook, isOrderBookOpen, orderBookContainer]);

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

  useEffect(() => {
    onOrderBookVisibilityChange?.(isOrderBookOpen);
  }, [isOrderBookOpen, onOrderBookVisibilityChange]);

  const orderBookTable = (
    <OrderBookTable
      baseTokenDecimals={baseTokenDecimals}
      baseTokenSymbol={selectedAssetMetadata.symbol}
      enabled={true}
      onPriceClick={isMarketTypeMarket ? undefined : handleOrderBookPriceSelect}
      quoteTokenDecimals={quoteTokenDecimals}
      quoteTokenSymbol={quoteAssetmetadata.symbol}
      referencePrice={tokenPrice.toNumber()}
      rwaAddress={asset.address}
    />
  );

  return (
    <>
      {orderBookContainer ? (
        isOrderBookOpen &&
        createPortal(
          <section
            aria-label="Order Book and Last Trades"
            className={styles.inlineOrderBookPanel}
          >
            <button
              ref={orderBookCloseButtonRef}
              type="button"
              aria-label="Hide Order Book"
              className={styles.orderBookCloseButton}
              onClick={closeOrderBook}
            >
              <RIcon name="close" size="small" />
            </button>
            {orderBookTable}
          </section>,
          orderBookContainer
        )
      ) : (
        <PopupWithIcon
          isOpen={isOrderBookOpen}
          onRequestClose={closeOrderBook}
          contentClassName={styles.orderBookPopupContent}
          contentPosition="right"
          className={clsx("bg-white", styles.orderBookPopup)}
        >
          {orderBookTable}
        </PopupWithIcon>
      )}
      <TradeConfirmationPopup
        isOpen={!hasOrders && isTradeConfirmationOpen}
        onCancel={handleCloseTradeConfirmation}
        onContinue={handleConfirmedBuySellAction}
      />

      <div className={styles.buySellRoot}>
        {configError && (
          <button type="button" onClick={onRetryConfig}>
            Retry configuration
          </button>
        )}
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

        {(activetabId === BUY || activetabId === SELL) &&
          (marketType === "market" ? (
            <BuySellScreen
              metadata={metadata}
              tokenAddress={asset.address}
              actionCb={handleBuySellAction}
              actionType={activetabId}
              amount={amountB}
              setAmount={setAmountB}
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
              metadata={metadata}
              tokenAddress={asset.address}
              actionCb={handleBuySellAction}
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
      </div>
    </>
  );
};
