import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import BigNumberJs from "bignumber.js";
import clsx from "clsx";
import BuyOnlyIcon from "app/icons/buy-only-icon.svg?react";
import BuySellIcon from "app/icons/buy-sell-icon.svg?react";
import SellOnlyIcon from "app/icons/sell-only-icon.svg?react";

import {
  createDefaultOrderBookData,
  createOrderBookData,
  DEFAULT_ORDER_BOOK_GROUPING_PRECISION,
  getOrderBookPrecisionOptions,
} from "~/routes/marketplace.$id/components/PriceSection/orderBook.consts";
import type { OpenOrder } from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import { useOpenOrders } from "~/lib/apis/mbrwa/openOrders/useOpenOrders";
import { Spinner } from "~/lib/atoms/Spinner";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import { atomsToTokens } from "~/lib/utils/formaters";

import { OrderRow } from "./OrderRow";
import type {
  OrderBookData,
  OrderBookDisplayMode,
  OrderBookRow,
} from "./orderBook.types";
import styles from "./orderBookPopup.module.css";

const DEFAULT_METRIC_FRACTION_DIGITS = 2;
const MAX_METRIC_FRACTION_DIGITS = 4;
const ORDER_BOOK_FETCH_LIMIT = 32;
const DEFAULT_ROWS_PER_SIDE = 16;
const ORDER_BOOK_SUMMARY_SAMPLE_SIZE = 10;
const SINGLE_SIDE_ROWS = 32;

const ORDER_BOOK_DISPLAY_MODE_OPTIONS: Array<{
  id: OrderBookDisplayMode;
  label: string;
}> = [
  {
    id: "both",
    label: "Buy + Sell",
  },
  {
    id: "buy",
    label: "Buy only",
  },
  {
    id: "sell",
    label: "Sell only",
  },
];

type OrderBookTableProps = {
  baseTokenDecimals: number;
  baseTokenSymbol: string;
  emptyMessage?: string;
  enabled?: boolean;
  onPriceClick?: (price: number, side: "ask" | "bid") => void;
  quoteTokenDecimals: number;
  quoteTokenSymbol?: string;
  referencePrice?: number;
  rwaAddress?: string | null;
};

type OrderBookTableHeaderProps = {
  onDisplayModeChange: (value: OrderBookDisplayMode) => void;
  onGroupingChange: (value: number) => void;
  priceGroupingOptions: number[];
  selectedDisplayMode: OrderBookDisplayMode;
  selectedPriceGrouping: number;
  title: string;
};

type OrderBookNumberFormatters = {
  amount: Intl.NumberFormat;
  price: Intl.NumberFormat;
  total: Intl.NumberFormat;
};

type OrderBookRowsSectionProps = {
  emptyLabel: string;
  formatters: OrderBookNumberFormatters;
  onPriceClick?: (price: number, side: "ask" | "bid") => void;
  rows: OrderBookRow[];
  side: "ask" | "bid";
};

type SpreadDirection = "up" | "down";

type OrderBookFooterSummary = {
  buyDisplayPercentage: number;
  buyPercentage: number;
  buyTotal: number;
  difference: number;
  dominantSide: "buy" | "neutral" | "sell";
  sellDisplayPercentage: number;
  sellPercentage: number;
  sellTotal: number;
};

const hasOrderBookRows = (data: OrderBookData) =>
  data.asks.length > 0 || data.bids.length > 0;

const getFractionDigits = (
  value: number,
  maxDigits = MAX_METRIC_FRACTION_DIGITS
) => {
  const fractionPart = value.toFixed(maxDigits).split(".")[1];

  if (!fractionPart) return 0;

  return fractionPart.replace(/0+$/, "").length;
};

const getColumnFractionDigits = (values: number[]) => {
  if (values.length === 0) return DEFAULT_METRIC_FRACTION_DIGITS;

  return values.reduce(
    (currentMax, value) =>
      Math.max(
        currentMax,
        getFractionDigits(value, MAX_METRIC_FRACTION_DIGITS)
      ),
    0
  );
};

const createNumberFormatter = (fractionDigits: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

const formatGroupingValue = (value: number) =>
  value.toFixed(getFractionDigits(value));

const areNumberArraysEqual = (left: number[], right: number[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const getVisibleRows = (
  rows: OrderBookRow[],
  side: "ask" | "bid",
  displayMode: OrderBookDisplayMode
) => {
  if (displayMode === "buy") {
    return side === "bid" ? rows.slice(0, SINGLE_SIDE_ROWS) : [];
  }

  if (displayMode === "sell") {
    return side === "ask" ? rows.slice(-SINGLE_SIDE_ROWS) : [];
  }

  return side === "ask"
    ? rows.slice(-DEFAULT_ROWS_PER_SIDE)
    : rows.slice(0, DEFAULT_ROWS_PER_SIDE);
};

const withVisibleDepthPercentages = (rows: OrderBookRow[]) => {
  const maxTotal = rows.reduce(
    (currentMax, row) => Math.max(currentMax, row.total),
    0
  );

  if (maxTotal === 0) return rows;

  let hasChanged = false;
  const nextRows = rows.map((row) => {
    const nextDepthPercentage = getSummaryPercentage(row.total, maxTotal);

    if (row.depthPercentage === nextDepthPercentage) {
      return row;
    }

    hasChanged = true;

    return {
      ...row,
      depthPercentage: nextDepthPercentage,
    };
  });

  return hasChanged ? nextRows : rows;
};

const useStableVisibleRows = (
  rows: OrderBookRow[],
  side: "ask" | "bid",
  displayMode: OrderBookDisplayMode
) => {
  const visibleRowsRef = useRef<OrderBookRow[]>(
    getVisibleRows(rows, side, displayMode)
  );

  return useMemo(() => {
    const nextVisibleRows = getVisibleRows(rows, side, displayMode);
    const currentVisibleRows = visibleRowsRef.current;
    const hasChanged =
      currentVisibleRows.length !== nextVisibleRows.length ||
      currentVisibleRows.some((row, index) => row !== nextVisibleRows[index]);

    if (!hasChanged) {
      return currentVisibleRows;
    }

    visibleRowsRef.current = nextVisibleRows;

    return nextVisibleRows;
  }, [displayMode, rows, side]);
};

const getSpreadLabel = (spread: OrderBookData["spread"]) => {
  if (spread.bestAsk > 0 && spread.bestBid > 0) return "Spread";
  if (spread.bestAsk > 0) return "Best Ask";
  if (spread.bestBid > 0) return "Best Bid";

  return "Spread";
};

const getSpreadDisplayData = (
  spread: OrderBookData["spread"],
  displayMode: OrderBookDisplayMode
) => {
  if (displayMode === "buy") {
    return {
      label: "Best Bid",
      price: spread.bestBid,
      side: "bid" as const,
      value: null,
    };
  }

  if (displayMode === "sell") {
    return {
      label: "Best Ask",
      price: spread.bestAsk,
      side: "ask" as const,
      value: null,
    };
  }

  return {
    label: getSpreadLabel(spread),
    price: spread.price,
    side: spread.bestAsk > 0 ? ("ask" as const) : ("bid" as const),
    value: spread.bestAsk > 0 && spread.bestBid > 0 ? spread.value : null,
  };
};

const getSpreadDirection = (
  displayMode: OrderBookDisplayMode
): SpreadDirection => (displayMode === "sell" ? "up" : "down");

const formatQuoteTokenValue = ({
  formatter,
  quoteTokenSymbol,
  value,
}: {
  formatter: Intl.NumberFormat;
  quoteTokenSymbol: string;
  value: number;
}) => {
  const formattedValue = formatter.format(value);

  if (quoteTokenSymbol === "USD" || quoteTokenSymbol === "USDT") {
    return `$${formattedValue}`;
  }

  return `${formattedValue} ${quoteTokenSymbol}`;
};

const areRowsEqual = (left: OrderBookRow, right: OrderBookRow) =>
  left.amount === right.amount &&
  left.depthPercentage === right.depthPercentage &&
  left.id === right.id &&
  left.price === right.price &&
  left.total === right.total;

const reconcileRows = (
  previousRows: OrderBookRow[],
  nextRows: OrderBookRow[]
) => {
  if (previousRows.length === 0) return nextRows;

  const previousRowsById = new Map(
    previousRows.map((row) => [row.id, row] as const)
  );
  const reconciledRows = nextRows.map((row) => {
    const previousRow = previousRowsById.get(row.id);

    return previousRow && areRowsEqual(previousRow, row) ? previousRow : row;
  });
  const hasArrayChanged =
    reconciledRows.length !== previousRows.length ||
    reconciledRows.some((row, index) => row !== previousRows[index]);

  return hasArrayChanged ? reconciledRows : previousRows;
};

const reconcileOrderBookData = (
  previousData: OrderBookData,
  nextData: OrderBookData
) => {
  const asks = reconcileRows(previousData.asks, nextData.asks);
  const bids = reconcileRows(previousData.bids, nextData.bids);
  const headers =
    previousData.headers.amount === nextData.headers.amount &&
    previousData.headers.price === nextData.headers.price &&
    previousData.headers.total === nextData.headers.total
      ? previousData.headers
      : nextData.headers;
  const spread =
    previousData.spread.bestAsk === nextData.spread.bestAsk &&
    previousData.spread.bestBid === nextData.spread.bestBid &&
    previousData.spread.price === nextData.spread.price &&
    previousData.spread.value === nextData.spread.value
      ? previousData.spread
      : nextData.spread;
  const sentiment =
    previousData.sentiment.buy === nextData.sentiment.buy &&
    previousData.sentiment.sell === nextData.sentiment.sell
      ? previousData.sentiment
      : nextData.sentiment;
  const toggleLabels =
    previousData.toggleLabels.hide === nextData.toggleLabels.hide &&
    previousData.toggleLabels.show === nextData.toggleLabels.show
      ? previousData.toggleLabels
      : nextData.toggleLabels;

  if (
    asks === previousData.asks &&
    bids === previousData.bids &&
    headers === previousData.headers &&
    previousData.title === nextData.title &&
    spread === previousData.spread &&
    sentiment === previousData.sentiment &&
    toggleLabels === previousData.toggleLabels
  ) {
    return previousData;
  }

  return {
    ...nextData,
    asks,
    bids,
    headers,
    spread,
    sentiment,
    toggleLabels,
  };
};

const OrderBookState: FC<{
  isLoading?: boolean;
  message: string;
}> = ({ isLoading = false, message }) => (
  <div className={styles.state}>
    {isLoading && <Spinner size={28} />}
    <span className={styles.stateText}>{message}</span>
  </div>
);

const OrderBookRowsSectionComponent: FC<OrderBookRowsSectionProps> = ({
  emptyLabel,
  formatters,
  onPriceClick,
  rows,
  side,
}) => (
  <section className={styles.section}>
    <div className={styles.tableSection}>
      {rows.length === 0 ? (
        <div className={styles.sectionEmpty}>{emptyLabel}</div>
      ) : (
        rows.map((row) => (
          <OrderRow
            key={row.id}
            onPriceClick={onPriceClick}
            priceLabel={formatters.price.format(row.price)}
            row={row}
            side={side}
          />
        ))
      )}
    </div>
  </section>
);

const OrderBookRowsSection = memo(OrderBookRowsSectionComponent);

OrderBookRowsSection.displayName = "OrderBookRowsSection";

const getOpenOrderTotal = ({
  baseTokenDecimals,
  order,
  quoteTokenDecimals,
}: {
  baseTokenDecimals: number;
  order: OpenOrder;
  quoteTokenDecimals: number;
}) =>
  atomsToTokens(order.unfulfilled_amount, baseTokenDecimals).times(
    atomsToTokens(order.price_per_rwa_token, quoteTokenDecimals)
  );

const sortOrdersForSummary = (orders: OpenOrder[], side: "buy" | "sell") =>
  [...orders].sort((left, right) => {
    const priceDifference = new BigNumberJs(left.price_per_rwa_token).minus(
      right.price_per_rwa_token
    );

    if (!priceDifference.isZero()) {
      if (priceDifference.isPositive()) {
        return side === "buy" ? -1 : 1;
      }

      return side === "buy" ? 1 : -1;
    }

    return (
      Date.parse(right.created_at || "") - Date.parse(left.created_at || "")
    );
  });

const getOrdersTotal = ({
  baseTokenDecimals,
  orders,
  quoteTokenDecimals,
  side,
}: {
  baseTokenDecimals: number;
  orders: OpenOrder[];
  quoteTokenDecimals: number;
  side: "buy" | "sell";
}) =>
  sortOrdersForSummary(orders, side)
    .slice(0, ORDER_BOOK_SUMMARY_SAMPLE_SIZE)
    .reduce(
      (total, order) =>
        total.plus(
          getOpenOrderTotal({
            baseTokenDecimals,
            order,
            quoteTokenDecimals,
          })
        ),
      new BigNumberJs(0)
    );

const getSummaryPercentage = (value: number, total: number) => {
  if (total === 0) return 0;

  return Number(new BigNumberJs(value).div(total).times(100).toFixed(2));
};

const getOrderBookFooterSummary = ({
  baseTokenDecimals,
  buyOrders,
  quoteTokenDecimals,
  sellOrders,
}: {
  baseTokenDecimals: number;
  buyOrders: OpenOrder[];
  quoteTokenDecimals: number;
  sellOrders: OpenOrder[];
}): OrderBookFooterSummary => {
  const buyTotal = getOrdersTotal({
    baseTokenDecimals,
    orders: buyOrders,
    quoteTokenDecimals,
    side: "buy",
  }).toNumber();
  const sellTotal = getOrdersTotal({
    baseTokenDecimals,
    orders: sellOrders,
    quoteTokenDecimals,
    side: "sell",
  }).toNumber();
  const combinedTotal = new BigNumberJs(buyTotal).plus(sellTotal).toNumber();
  const difference = new BigNumberJs(buyTotal)
    .minus(sellTotal)
    .abs()
    .toNumber();
  const buyPercentage = getSummaryPercentage(buyTotal, combinedTotal);
  const sellPercentage = getSummaryPercentage(sellTotal, combinedTotal);
  const buyDisplayPercentage =
    combinedTotal > 0 ? Math.round(buyPercentage) : 0;

  return {
    buyDisplayPercentage,
    buyPercentage,
    buyTotal,
    difference,
    dominantSide:
      buyTotal === sellTotal
        ? "neutral"
        : buyTotal > sellTotal
          ? "buy"
          : "sell",
    sellDisplayPercentage: combinedTotal > 0 ? 100 - buyDisplayPercentage : 0,
    sellPercentage,
    sellTotal,
  };
};

const OrderBookFooterSummaryComponent: FC<{
  buyDisplayPercentage: number;
  buyPercentage: number;
  buyTotalLabel: string;
  differenceLabel: string;
  sellDisplayPercentage: number;
  sellPercentage: number;
  sellTotalLabel: string;
}> = ({
  buyDisplayPercentage,
  buyPercentage,
  buyTotalLabel,
  differenceLabel,
  sellDisplayPercentage,
  sellPercentage,
  sellTotalLabel,
}) => (
  <div
    className={styles.sentimentBar}
    aria-label={`Buy ${buyTotalLabel}. Sell ${sellTotalLabel}. 10-order delta ${differenceLabel}.`}
    title={`Buy ${buyTotalLabel} | Sell ${sellTotalLabel} | 10-order delta ${differenceLabel}`}
  >
    <div
      className={clsx(styles.sentimentSide, styles.buySentiment)}
      style={{ width: `${buyPercentage}%` }}
    >
      <span className={clsx(styles.sentimentBadge, styles.buyBadge)}>B</span>
      <span className={styles.buyPercentage}>{buyDisplayPercentage}%</span>
    </div>

    <div
      className={clsx(styles.sentimentSide, styles.sellSentiment)}
      style={{ width: `${sellPercentage}%` }}
    >
      <span className={styles.sellPercentage}>{sellDisplayPercentage}%</span>
      <span className={clsx(styles.sentimentBadge, styles.sellBadge)}>S</span>
    </div>
  </div>
);

const OrderBookFooterSummaryBar = memo(OrderBookFooterSummaryComponent);

OrderBookFooterSummaryBar.displayName = "OrderBookFooterSummaryBar";

const OrderBookDisplayModeIcon: FC<{
  mode: OrderBookDisplayMode;
}> = ({ mode }) => {
  const Icon =
    mode === "both" ? BuySellIcon : mode === "buy" ? BuyOnlyIcon : SellOnlyIcon;

  return <Icon className={styles.displayModeIcon} aria-hidden="true" />;
};

const SpreadDirectionIcon: FC<{
  direction: SpreadDirection;
  side: "ask" | "bid";
}> = ({ direction, side }) => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden="true"
    className={clsx(
      styles.spreadDirectionIcon,
      direction === "up" && styles.spreadDirectionIconUp,
      side === "ask" ? styles.askPrice : styles.bidPrice
    )}
  >
    <path
      d="M8 1.5v13M8 14.5l4-4M8 14.5l-4-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);

const OrderBookTableHeaderComponent: FC<OrderBookTableHeaderProps> = ({
  onDisplayModeChange,
  onGroupingChange,
  priceGroupingOptions,
  selectedDisplayMode,
  selectedPriceGrouping,
  title,
}) => {
  const shouldShowGroupingControl = priceGroupingOptions.length > 1;

  return (
    <div className={styles.header}>
      <div className={styles.headerTabs}>
        <span className={styles.headerTabActive}>{title}</span>
        <span className={styles.headerTab}>Last Trades</span>
      </div>

      <div className={styles.headerActions}>
        <div className={styles.displayModeSwitcher} role="tablist">
          {ORDER_BOOK_DISPLAY_MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-label={option.label}
              aria-pressed={selectedDisplayMode === option.id}
              className={clsx(
                styles.displayModeButton,
                selectedDisplayMode === option.id &&
                  styles.displayModeButtonActive
              )}
              onClick={() => onDisplayModeChange(option.id)}
            >
              <OrderBookDisplayModeIcon mode={option.id} />
            </button>
          ))}
        </div>

        {shouldShowGroupingControl && (
          <CustomDropdown>
            <ClickableDropdownArea>
              <DropdownFaceContent
                gap={8}
                className={styles.groupingControl}
                iconClassName={styles.groupingSelectIcon}
                openedClassName={styles.groupingControlActive}
              >
                <span className={styles.groupingValue}>
                  {formatGroupingValue(selectedPriceGrouping)}
                </span>
              </DropdownFaceContent>

              <DropdownBodyContent position="right" topMargin={8}>
                <div className={styles.groupingMenu}>
                  {priceGroupingOptions.map((option) => {
                    const isSelected = option === selectedPriceGrouping;

                    return (
                      <button
                        key={option}
                        type="button"
                        className={clsx(
                          styles.groupingMenuItem,
                          isSelected && styles.groupingMenuItemActive
                        )}
                        onClick={() => onGroupingChange(option)}
                      >
                        {formatGroupingValue(option)}
                      </button>
                    );
                  })}
                </div>
              </DropdownBodyContent>
            </ClickableDropdownArea>
          </CustomDropdown>
        )}
      </div>
    </div>
  );
};

const OrderBookTableHeader = memo(OrderBookTableHeaderComponent);

OrderBookTableHeader.displayName = "OrderBookTableHeader";

export const OrderBookTable: FC<OrderBookTableProps> = ({
  baseTokenDecimals,
  baseTokenSymbol,
  emptyMessage = "No open orders available.",
  enabled = true,
  onPriceClick,
  quoteTokenDecimals,
  quoteTokenSymbol = "USDT",
  referencePrice = 0,
  rwaAddress,
}) => {
  const [selectedDisplayMode, setSelectedDisplayMode] =
    useState<OrderBookDisplayMode>("both");
  const { openOrders, loading } = useOpenOrders({
    enabled,
    limit: ORDER_BOOK_FETCH_LIMIT,
    rwaAddress,
  });

  const defaultData = useMemo(
    () =>
      createDefaultOrderBookData({
        baseTokenSymbol,
        quoteTokenSymbol,
      }),
    [baseTokenSymbol, quoteTokenSymbol]
  );
  const nextPriceGroupingOptions = useMemo(() => {
    const options = getOrderBookPrecisionOptions({
      buyOrders: openOrders.buyOrders,
      sellOrders: openOrders.sellOrders,
      quoteTokenDecimals,
    });

    return options.length > 0
      ? options
      : [DEFAULT_ORDER_BOOK_GROUPING_PRECISION];
  }, [openOrders.buyOrders, openOrders.sellOrders, quoteTokenDecimals]);
  const [priceGroupingOptions, setPriceGroupingOptions] = useState<number[]>(
    nextPriceGroupingOptions
  );
  const [selectedPriceGrouping, setSelectedPriceGrouping] = useState(
    nextPriceGroupingOptions[0] ?? DEFAULT_ORDER_BOOK_GROUPING_PRECISION
  );

  useEffect(() => {
    setPriceGroupingOptions((currentOptions) =>
      areNumberArraysEqual(currentOptions, nextPriceGroupingOptions)
        ? currentOptions
        : nextPriceGroupingOptions
    );
  }, [nextPriceGroupingOptions]);

  useEffect(() => {
    setSelectedPriceGrouping((currentPrecision) =>
      priceGroupingOptions.includes(currentPrecision)
        ? currentPrecision
        : (priceGroupingOptions[0] ?? DEFAULT_ORDER_BOOK_GROUPING_PRECISION)
    );
  }, [priceGroupingOptions]);

  const nextData = useMemo(() => {
    if (
      openOrders.buyOrders.length === 0 &&
      openOrders.sellOrders.length === 0
    ) {
      return defaultData;
    }

    return createOrderBookData({
      buyOrders: openOrders.buyOrders,
      sellOrders: openOrders.sellOrders,
      baseTokenDecimals,
      baseTokenSymbol,
      priceGroupingPrecision: selectedPriceGrouping,
      quoteTokenDecimals,
      quoteTokenSymbol,
    });
  }, [
    baseTokenDecimals,
    baseTokenSymbol,
    defaultData,
    openOrders.buyOrders,
    openOrders.sellOrders,
    quoteTokenDecimals,
    quoteTokenSymbol,
    selectedPriceGrouping,
  ]);
  const [renderData, setRenderData] = useState<OrderBookData>(nextData);

  useEffect(() => {
    setRenderData((currentData) =>
      reconcileOrderBookData(currentData, nextData)
    );
  }, [nextData]);

  const visibleAskRows = useStableVisibleRows(
    renderData.asks,
    "ask",
    selectedDisplayMode
  );
  const visibleBidRows = useStableVisibleRows(
    renderData.bids,
    "bid",
    selectedDisplayMode
  );
  const visibleAsks = useMemo(
    () => withVisibleDepthPercentages(visibleAskRows),
    [visibleAskRows]
  );
  const visibleBids = useMemo(
    () => withVisibleDepthPercentages(visibleBidRows),
    [visibleBidRows]
  );
  const visibleRows = useMemo(
    () => [...visibleAsks, ...visibleBids],
    [visibleAsks, visibleBids]
  );
  const footerSummary = useMemo(
    () =>
      getOrderBookFooterSummary({
        baseTokenDecimals,
        buyOrders: openOrders.buyOrders,
        quoteTokenDecimals,
        sellOrders: openOrders.sellOrders,
      }),
    [
      baseTokenDecimals,
      openOrders.buyOrders,
      openOrders.sellOrders,
      quoteTokenDecimals,
    ]
  );
  const spreadDisplayData = useMemo(
    () => getSpreadDisplayData(renderData.spread, selectedDisplayMode),
    [renderData.spread, selectedDisplayMode]
  );
  const amountFractionDigits = useMemo(
    () => getColumnFractionDigits(visibleRows.map((row) => row.amount)),
    [visibleRows]
  );
  const priceFractionDigits = useMemo(
    () => getFractionDigits(selectedPriceGrouping),
    [selectedPriceGrouping]
  );
  const totalFractionDigits = useMemo(
    () => getColumnFractionDigits(visibleRows.map((row) => row.total)),
    [visibleRows]
  );
  const formatters = useMemo<OrderBookNumberFormatters>(
    () => ({
      amount: createNumberFormatter(amountFractionDigits),
      price: createNumberFormatter(priceFractionDigits),
      total: createNumberFormatter(totalFractionDigits),
    }),
    [amountFractionDigits, priceFractionDigits, totalFractionDigits]
  );
  const shouldShowReferencePrice = referencePrice > 0;
  const spreadDirection = useMemo(
    () => getSpreadDirection(selectedDisplayMode),
    [selectedDisplayMode]
  );
  const footerSummaryFractionDigits = useMemo(
    () =>
      getColumnFractionDigits([
        footerSummary.buyTotal,
        footerSummary.difference,
        footerSummary.sellTotal,
      ]),
    [footerSummary.buyTotal, footerSummary.difference, footerSummary.sellTotal]
  );
  const footerSummaryFormatter = useMemo(
    () => createNumberFormatter(footerSummaryFractionDigits),
    [footerSummaryFractionDigits]
  );
  const referencePriceLabel = useMemo(
    () =>
      shouldShowReferencePrice
        ? formatQuoteTokenValue({
            formatter: formatters.price,
            quoteTokenSymbol,
            value: referencePrice,
          })
        : null,
    [
      formatters.price,
      quoteTokenSymbol,
      referencePrice,
      shouldShowReferencePrice,
    ]
  );
  const buyTotalLabel = useMemo(
    () =>
      formatQuoteTokenValue({
        formatter: footerSummaryFormatter,
        quoteTokenSymbol,
        value: footerSummary.buyTotal,
      }),
    [footerSummary.buyTotal, footerSummaryFormatter, quoteTokenSymbol]
  );
  const sellTotalLabel = useMemo(
    () =>
      formatQuoteTokenValue({
        formatter: footerSummaryFormatter,
        quoteTokenSymbol,
        value: footerSummary.sellTotal,
      }),
    [footerSummaryFormatter, footerSummary.sellTotal, quoteTokenSymbol]
  );
  const differenceLabel = useMemo(() => {
    const formattedDifference = formatQuoteTokenValue({
      formatter: footerSummaryFormatter,
      quoteTokenSymbol,
      value: footerSummary.difference,
    });

    if (footerSummary.dominantSide === "neutral") {
      return formattedDifference;
    }

    return `${footerSummary.dominantSide === "buy" ? "+" : "-"}${formattedDifference}`;
  }, [
    footerSummary.difference,
    footerSummary.dominantSide,
    footerSummaryFormatter,
    quoteTokenSymbol,
  ]);
  const handleDisplayModeChange = useCallback((value: OrderBookDisplayMode) => {
    setSelectedDisplayMode(value);
  }, []);
  const handleGroupingChange = useCallback((value: number) => {
    setSelectedPriceGrouping(value);
  }, []);

  return (
    <div className={styles.table}>
      <OrderBookTableHeader
        onDisplayModeChange={handleDisplayModeChange}
        onGroupingChange={handleGroupingChange}
        priceGroupingOptions={priceGroupingOptions}
        selectedDisplayMode={selectedDisplayMode}
        selectedPriceGrouping={selectedPriceGrouping}
        title={renderData.title}
      />

      <div className={styles.content}>
        {loading ? (
          <OrderBookState isLoading message="Loading order book..." />
        ) : hasOrderBookRows(renderData) ? (
          <>
            <div className={styles.tableHeader}>
              <span
                className={clsx(styles.tableHeaderCell, styles.priceHeaderCell)}
              >
                {renderData.headers.price}
              </span>
              <span
                className={clsx(
                  styles.tableHeaderCell,
                  styles.amountHeaderCell,
                  styles.amountColumnHeader
                )}
              >
                {renderData.headers.amount}
              </span>
              <span
                className={clsx(styles.tableHeaderCell, styles.totalHeaderCell)}
              >
                {renderData.headers.total}
              </span>
            </div>

            {selectedDisplayMode !== "buy" && (
              <OrderBookRowsSection
                emptyLabel="No asks"
                formatters={formatters}
                onPriceClick={onPriceClick}
                rows={visibleAsks}
                side="ask"
              />
            )}

            <div className={styles.spreadRow}>
              <span
                className={clsx(
                  styles.spreadPrice,
                  spreadDisplayData.side === "ask"
                    ? styles.askPrice
                    : styles.bidPrice
                )}
              >
                {spreadDisplayData.price > 0
                  ? formatters.price.format(spreadDisplayData.price)
                  : "--"}
              </span>

              <span className={styles.spreadMeta}>
                {shouldShowReferencePrice ? (
                  <SpreadDirectionIcon
                    direction={spreadDirection}
                    side={spreadDisplayData.side}
                  />
                ) : (
                  <span className={styles.spreadLabel}>
                    {spreadDisplayData.label}
                  </span>
                )}
              </span>

              <span
                className={clsx(
                  shouldShowReferencePrice
                    ? styles.spreadReference
                    : styles.spreadValue
                )}
              >
                {shouldShowReferencePrice
                  ? referencePriceLabel
                  : spreadDisplayData.value !== null
                    ? formatters.price.format(spreadDisplayData.value)
                    : "--"}
              </span>
            </div>

            {selectedDisplayMode !== "sell" && (
              <OrderBookRowsSection
                emptyLabel="No bids"
                formatters={formatters}
                onPriceClick={onPriceClick}
                rows={visibleBids}
                side="bid"
              />
            )}

            <OrderBookFooterSummaryBar
              buyDisplayPercentage={footerSummary.buyDisplayPercentage}
              buyPercentage={footerSummary.buyPercentage}
              buyTotalLabel={buyTotalLabel}
              differenceLabel={differenceLabel}
              sellDisplayPercentage={footerSummary.sellDisplayPercentage}
              sellPercentage={footerSummary.sellPercentage}
              sellTotalLabel={sellTotalLabel}
            />
          </>
        ) : (
          <OrderBookState message={emptyMessage} />
        )}
      </div>
    </div>
  );
};
