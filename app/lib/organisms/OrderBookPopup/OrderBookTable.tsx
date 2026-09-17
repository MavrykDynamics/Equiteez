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

import { OrderTypes } from "~/lib/apis/mbrwa/user/userOrders/order.const";
import type { OrderbookLastTradeEvent } from "~/lib/apis/mbrwa/orderbookLastTrades/orderbookLastTrades.schema";
import { useOrderbookLastTrades } from "~/lib/apis/mbrwa/orderbookLastTrades/useOrderbookLastTrades";
import {
  createDefaultOrderBookData,
  createOrderBookDataFromDepth,
  DEFAULT_ORDER_BOOK_GROUPING_PRECISION,
  getOrderbookDepthSummaryQuoteTotals,
  getOrderBookPrecisionOptionsFromDepth,
} from "~/routes/marketplace.$id/components/PriceSection/orderBook.consts";
import type { OrderbookDepthResponseType } from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.types";
import { useOrderbookDepth } from "~/lib/apis/rwa/orderbookDepth/useOrderbookDepth";
import { Spinner } from "~/lib/atoms/Spinner";
import { atomsToTokens } from "~/lib/utils/formaters";
import { formatTime } from "~/lib/utils/date";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";

import { OrderRow } from "./OrderRow";
import type {
  OrderBookData,
  OrderBookDisplayMode,
  OrderBookRow,
} from "./orderBook.types";
import styles from "./orderBookPopup.module.css";

const DEFAULT_METRIC_FRACTION_DIGITS = 2;
const MAX_METRIC_FRACTION_DIGITS = 4;
export const ORDER_BOOK_FETCH_LIMIT = 32;
const DEFAULT_ROWS_PER_SIDE = 16;
const ORDER_BOOK_SUMMARY_SAMPLE_SIZE = 10;
const SINGLE_SIDE_ROWS = 32;

type OrderBookTableView = "order-book" | "last-trades";

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
  onTableViewChange: (value: OrderBookTableView) => void;
  priceGroupingOptions: number[];
  selectedDisplayMode: OrderBookDisplayMode;
  selectedPriceGrouping: number;
  selectedTableView: OrderBookTableView;
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

type LastTradeRow = {
  amount: number;
  id: string;
  price: number;
  side: "ask" | "bid";
  tableRow: OrderBookRow;
  timeLabel: string;
};

type LastTradesRowsSectionProps = {
  formatters: Pick<OrderBookNumberFormatters, "amount" | "price">;
  rows: LastTradeRow[];
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

const hasOrderbookDepthRows = (
  orderbookDepth: OrderbookDepthResponseType | null
): orderbookDepth is OrderbookDepthResponseType =>
  Boolean(
    orderbookDepth &&
      (orderbookDepth.asks.length > 0 || orderbookDepth.bids.length > 0)
  );

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

const getLastTradeSide = (orderType: OrderTypes): "ask" | "bid" =>
  orderType === OrderTypes.LIMIT_SELL || orderType === OrderTypes.MARKET_SELL
    ? "ask"
    : "bid";

const getTradeEventFillDelta = (event: OrderbookLastTradeEvent) =>
  new BigNumberJs(event.fulfilled_after)
    .minus(event.fulfilled_before)
    .absoluteValue();

const getTradeEventPriceData = (
  event: OrderbookLastTradeEvent,
  fillDelta: BigNumberJs,
  baseTokenDecimals: number,
  quoteTokenDecimals: number
) => {
  const quoteDelta = new BigNumberJs(event.currency_delta).absoluteValue();

  if (quoteDelta.isZero() || fillDelta.isZero()) {
    return {
      isExact: false,
      value: atomsToTokens(
        event.order.price_per_rwa_token,
        quoteTokenDecimals
      ).toNumber(),
    };
  }

  const amount = atomsToTokens(fillDelta, baseTokenDecimals);
  const quoteAmount = atomsToTokens(quoteDelta, quoteTokenDecimals);

  return {
    isExact: true,
    value: amount.isZero() ? 0 : quoteAmount.div(amount).toNumber(),
  };
};

const getTimeValue = (inputDate: string) => {
  const value = new Date(inputDate).getTime();

  return Number.isNaN(value) ? 0 : value;
};

const shouldUseEventSide = (
  event: OrderbookLastTradeEvent,
  currentSideSource: OrderbookLastTradeEvent | null
) => {
  if (!currentSideSource) return true;

  if (event.order.is_market_order !== currentSideSource.order.is_market_order) {
    return event.order.is_market_order;
  }

  return (
    getTimeValue(event.order.created_at) >
    getTimeValue(currentSideSource.order.created_at)
  );
};

const toLastTradeRows = (
  tradeEvents: OrderbookLastTradeEvent[],
  baseTokenDecimals: number,
  quoteTokenDecimals: number
): LastTradeRow[] => {
  const tradesByCounter = tradeEvents.reduce<
    Map<
      string,
      {
        amount: number;
        hasExactPrice: boolean;
        id: string;
        price: number;
        sideSource: OrderbookLastTradeEvent | null;
        timestamp: string;
      }
    >
  >((acc, event) => {
    const fillDelta = getTradeEventFillDelta(event);

    if (!fillDelta.isPositive()) return acc;

    const tradeKey = `${event.operation_hash}-${event.counter}`;
    const currentTrade = acc.get(tradeKey);
    const amount = atomsToTokens(fillDelta, baseTokenDecimals).toNumber();
    const priceData = getTradeEventPriceData(
      event,
      fillDelta,
      baseTokenDecimals,
      quoteTokenDecimals
    );
    const sideSource = shouldUseEventSide(
      event,
      currentTrade?.sideSource ?? null
    )
      ? event
      : (currentTrade?.sideSource ?? event);
    const shouldUsePrice =
      priceData.value > 0 &&
      (priceData.isExact || !currentTrade?.hasExactPrice);

    acc.set(tradeKey, {
      amount: Math.max(currentTrade?.amount ?? 0, amount),
      hasExactPrice:
        Boolean(currentTrade?.hasExactPrice) ||
        (shouldUsePrice && priceData.isExact),
      id: `trade-${tradeKey}`,
      price: shouldUsePrice ? priceData.value : (currentTrade?.price ?? 0),
      sideSource,
      timestamp: currentTrade?.timestamp ?? event.timestamp,
    });

    return acc;
  }, new Map());

  return Array.from(tradesByCounter.values())
    .slice(0, ORDER_BOOK_FETCH_LIMIT)
    .map((trade) => {
      const side = getLastTradeSide(
        trade.sideSource?.order_type ?? OrderTypes.LIMIT_BUY
      );

      return {
        amount: trade.amount,
        id: trade.id,
        price: trade.price,
        side,
        tableRow: {
          amount: trade.amount,
          depthPercentage: 0,
          id: trade.id,
          isMarketOrder: false,
          price: trade.price,
          total: 0,
        },
        timeLabel: formatTime(trade.timestamp),
      };
    });
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
            amountLabel={formatters.amount.format(row.amount)}
            key={row.id}
            onPriceClick={row.isMarketOrder ? undefined : onPriceClick}
            priceLabel={
              row.isMarketOrder ? "Market" : formatters.price.format(row.price)
            }
            row={row}
            side={side}
            totalLabel={formatters.total.format(row.total)}
          />
        ))
      )}
    </div>
  </section>
);

const OrderBookRowsSection = memo(OrderBookRowsSectionComponent);

OrderBookRowsSection.displayName = "OrderBookRowsSection";

const LastTradesRowsSectionComponent: FC<LastTradesRowsSectionProps> = ({
  formatters,
  rows,
}) => (
  <section className={styles.section}>
    <div className={styles.tableSection}>
      {rows.map((row) => (
        <OrderRow
          amountLabel={formatters.amount.format(row.amount)}
          key={row.id}
          priceLabel={formatters.price.format(row.price)}
          renderPriceAsButton={false}
          row={row.tableRow}
          showDepthBar={false}
          side={row.side}
          totalLabel={row.timeLabel}
        />
      ))}
    </div>
  </section>
);

const LastTradesRowsSection = memo(LastTradesRowsSectionComponent);

LastTradesRowsSection.displayName = "LastTradesRowsSection";

const getSummaryPercentage = (value: number, total: number) => {
  if (total === 0) return 0;

  return Number(new BigNumberJs(value).div(total).times(100).toFixed(2));
};

export const getOrderBookFooterSummary = ({
  orderbookDepth,
}: {
  orderbookDepth: OrderbookDepthResponseType | null;
}): OrderBookFooterSummary => {
  const { buyTotal: buyTotalValue, sellTotal: sellTotalValue } =
    getOrderbookDepthSummaryQuoteTotals({
      orderbookDepth,
      sampleSize: ORDER_BOOK_SUMMARY_SAMPLE_SIZE,
    });
  const buyTotal = buyTotalValue.toNumber();
  const sellTotal = sellTotalValue.toNumber();
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
  onTableViewChange,
  priceGroupingOptions,
  selectedDisplayMode,
  selectedPriceGrouping,
  selectedTableView,
  title,
}) => {
  const shouldShowGroupingControl = priceGroupingOptions.length > 1;
  const isOrderBookSelected = selectedTableView === "order-book";
  const isLastTradesSelected = selectedTableView === "last-trades";

  return (
    <div className={styles.header}>
      <div
        className={styles.headerTabs}
        role="tablist"
        aria-label="Orderbook table view"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isOrderBookSelected}
          className={clsx(
            styles.headerTabButton,
            isOrderBookSelected ? styles.headerTabActive : styles.headerTab
          )}
          onClick={() => onTableViewChange("order-book")}
        >
          {title}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isLastTradesSelected}
          className={clsx(
            styles.headerTabButton,
            isLastTradesSelected ? styles.headerTabActive : styles.headerTab
          )}
          onClick={() => onTableViewChange("last-trades")}
        >
          Last Trades
        </button>
      </div>

      {isOrderBookSelected && (
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
      )}
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
  const [selectedTableView, setSelectedTableView] =
    useState<OrderBookTableView>("order-book");
  const [selectedDisplayMode, setSelectedDisplayMode] =
    useState<OrderBookDisplayMode>("both");
  const isOrderBookSelected = selectedTableView === "order-book";
  const isLastTradesSelected = selectedTableView === "last-trades";
  const { orderbookDepth, loading } = useOrderbookDepth({
    enabled: enabled && isOrderBookSelected,
    limit: ORDER_BOOK_FETCH_LIMIT,
    tokenAddress: rwaAddress,
  });
  const { lastTradeEvents, loading: isLastTradesLoading } =
    useOrderbookLastTrades({
      enabled: enabled && isLastTradesSelected,
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
    const options = getOrderBookPrecisionOptionsFromDepth({
      orderbookDepth,
      quoteTokenDecimals,
    });

    return options.length > 0
      ? options
      : [DEFAULT_ORDER_BOOK_GROUPING_PRECISION];
  }, [orderbookDepth, quoteTokenDecimals]);
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
    if (!hasOrderbookDepthRows(orderbookDepth)) {
      return defaultData;
    }

    return createOrderBookDataFromDepth({
      baseTokenSymbol,
      orderbookDepth,
      priceGroupingPrecision: selectedPriceGrouping,
      quoteTokenSymbol,
    });
  }, [
    baseTokenSymbol,
    defaultData,
    orderbookDepth,
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
  const lastTradeRows = useMemo(
    () =>
      toLastTradeRows(
        lastTradeEvents.tradeEvents,
        baseTokenDecimals,
        quoteTokenDecimals
      ),
    [baseTokenDecimals, lastTradeEvents.tradeEvents, quoteTokenDecimals]
  );
  const footerSummary = useMemo(
    () =>
      getOrderBookFooterSummary({
        orderbookDepth,
      }),
    [orderbookDepth]
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
  const lastTradeAmountFractionDigits = useMemo(
    () => getColumnFractionDigits(lastTradeRows.map((row) => row.amount)),
    [lastTradeRows]
  );
  const lastTradePriceFractionDigits = useMemo(
    () => getColumnFractionDigits(lastTradeRows.map((row) => row.price)),
    [lastTradeRows]
  );
  const lastTradeFormatters = useMemo(
    () => ({
      amount: createNumberFormatter(lastTradeAmountFractionDigits),
      price: createNumberFormatter(lastTradePriceFractionDigits),
    }),
    [lastTradeAmountFractionDigits, lastTradePriceFractionDigits]
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
  const handleTableViewChange = useCallback((value: OrderBookTableView) => {
    setSelectedTableView(value);
  }, []);
  const hasRows = hasOrderBookRows(renderData);
  const hasLastTrades = lastTradeRows.length > 0;

  return (
    <div className={styles.table}>
      <OrderBookTableHeader
        onDisplayModeChange={handleDisplayModeChange}
        onGroupingChange={handleGroupingChange}
        onTableViewChange={handleTableViewChange}
        priceGroupingOptions={priceGroupingOptions}
        selectedDisplayMode={selectedDisplayMode}
        selectedPriceGrouping={selectedPriceGrouping}
        selectedTableView={selectedTableView}
        title={renderData.title}
      />

      <div className={styles.content}>
        {isOrderBookSelected ? (
          loading ? (
            <div className={styles.tableViewport}>
              <OrderBookState isLoading message="Loading order book..." />
            </div>
          ) : hasRows ? (
            <>
              <div className={styles.tableHeader}>
                <span
                  className={clsx(
                    styles.tableHeaderCell,
                    styles.priceHeaderCell
                  )}
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
                  className={clsx(
                    styles.tableHeaderCell,
                    styles.totalHeaderCell
                  )}
                >
                  {renderData.headers.total}
                </span>
              </div>

              <div className={styles.tableViewport}>
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
              </div>

              <div className={styles.tableFooter}>
                <OrderBookFooterSummaryBar
                  buyDisplayPercentage={footerSummary.buyDisplayPercentage}
                  buyPercentage={footerSummary.buyPercentage}
                  buyTotalLabel={buyTotalLabel}
                  differenceLabel={differenceLabel}
                  sellDisplayPercentage={footerSummary.sellDisplayPercentage}
                  sellPercentage={footerSummary.sellPercentage}
                  sellTotalLabel={sellTotalLabel}
                />
              </div>
            </>
          ) : (
            <div className={styles.tableViewport}>
              <OrderBookState message={emptyMessage} />
            </div>
          )
        ) : isLastTradesLoading ? (
          <div className={styles.tableViewport}>
            <OrderBookState isLoading message="Loading last trades..." />
          </div>
        ) : hasLastTrades ? (
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
                Time
              </span>
            </div>

            <div className={styles.tableViewport}>
              <LastTradesRowsSection
                formatters={lastTradeFormatters}
                rows={lastTradeRows}
              />
            </div>
          </>
        ) : (
          <div className={styles.tableViewport}>
            <OrderBookState message="No recent trades available." />
          </div>
        )}
      </div>
    </div>
  );
};
