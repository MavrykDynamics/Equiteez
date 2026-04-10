import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import clsx from "clsx";

import {
  createDefaultOrderBookData,
  createOrderBookData,
  DEFAULT_ORDER_BOOK_GROUPING_PRECISION,
  getOrderBookPrecisionOptions,
} from "~/routes/marketplace.$id/components/PriceSection/orderBook.consts";
import { useOpenOrders } from "~/lib/apis/mbrwa/openOrders/useOpenOrders";
import { useSimulatedOpenOrders } from "~/lib/apis/mbrwa/openOrders/useSimulatedOpenOrders";
import { Spinner } from "~/lib/atoms/Spinner";

import { OrderRow } from "./OrderRow";
import type {
  OrderBookData,
  OrderBookDisplayMode,
  OrderBookRow,
} from "./orderBook.types";
import styles from "./orderBookPopup.module.css";

const DEFAULT_METRIC_FRACTION_DIGITS = 2;
const MAX_METRIC_FRACTION_DIGITS = 4;
const DEFAULT_ROWS_PER_SIDE = 10;
const SINGLE_SIDE_ROWS = 20;

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
  isMobile?: boolean;
  quoteTokenDecimals: number;
  quoteTokenSymbol?: string;
  referencePrice?: number;
  rwaAddress?: string | null;
  useSimulatedOrders?: boolean;
};

type OrderBookTableHeaderProps = {
  isMobile?: boolean;
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
  rows: OrderBookRow[];
  side: "ask" | "bid";
  title: string;
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
      Math.max(currentMax, getFractionDigits(value, MAX_METRIC_FRACTION_DIGITS)),
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
      value: null,
    };
  }

  if (displayMode === "sell") {
    return {
      label: "Best Ask",
      price: spread.bestAsk,
      value: null,
    };
  }

  return {
    label: getSpreadLabel(spread),
    price: spread.price,
    value:
      spread.bestAsk > 0 && spread.bestBid > 0 ? spread.value : null,
  };
};

const areRowsEqual = (left: OrderBookRow, right: OrderBookRow) =>
  left.amount === right.amount &&
  left.depthPercentage === right.depthPercentage &&
  left.price === right.price &&
  left.total === right.total;

const reconcileRows = (previousRows: OrderBookRow[], nextRows: OrderBookRow[]) => {
  if (previousRows.length === 0) return nextRows;

  const previousRowsByPrice = new Map(
    previousRows.map((row) => [row.price, row] as const)
  );
  const reconciledRows = nextRows.map((row) => {
    const previousRow = previousRowsByPrice.get(row.price);

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
  rows,
  side,
  title,
}) => (
  <section className={styles.section}>
    <div className={styles.sectionLabel}>{title}</div>

    <div className={styles.tableSection}>
      {rows.length === 0 ? (
        <div className={styles.sectionEmpty}>{emptyLabel}</div>
      ) : (
        rows.map((row) => (
          <OrderRow
            key={`${side}-${row.price}`}
            amountLabel={formatters.amount.format(row.amount)}
            priceLabel={formatters.price.format(row.price)}
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

const OrderBookTableHeaderComponent: FC<OrderBookTableHeaderProps> = ({
  isMobile = false,
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
      <div className={styles.headerTop}>
        <h3 className={clsx(styles.title, isMobile && styles.mobileTitle)}>
          {title}
        </h3>

        <div className={styles.headerActions}>
          {shouldShowGroupingControl && (
            <label className={styles.groupingControl}>
              <span className={styles.groupingControlLabel}>Group</span>
              <select
                className={styles.groupingSelect}
                onChange={(event) =>
                  onGroupingChange(Number(event.currentTarget.value))
                }
                value={String(selectedPriceGrouping)}
              >
                {priceGroupingOptions.map((option) => (
                  <option key={option} value={String(option)}>
                    {formatGroupingValue(option)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      <div className={styles.displayModeSwitcher} role="tablist">
        {ORDER_BOOK_DISPLAY_MODE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={selectedDisplayMode === option.id}
            className={clsx(
              styles.displayModeButton,
              selectedDisplayMode === option.id &&
                styles.displayModeButtonActive
            )}
            onClick={() => onDisplayModeChange(option.id)}
          >
            {option.label}
          </button>
        ))}
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
  isMobile = false,
  quoteTokenDecimals,
  quoteTokenSymbol = "USDT",
  referencePrice = 1,
  rwaAddress,
  useSimulatedOrders = true,
}) => {
  const liveOpenOrdersState = useOpenOrders({
    rwaAddress,
    enabled: enabled && !useSimulatedOrders,
  });
  const simulatedOpenOrdersState = useSimulatedOpenOrders({
    baseTokenDecimals,
    quoteTokenDecimals,
    referencePrice,
    rwaAddress,
    enabled: enabled && useSimulatedOrders,
  });
  const { openOrders, loading } = useSimulatedOrders
    ? simulatedOpenOrdersState
    : liveOpenOrdersState;

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
  const [selectedDisplayMode, setSelectedDisplayMode] =
    useState<OrderBookDisplayMode>("both");

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
    setRenderData((currentData) => reconcileOrderBookData(currentData, nextData));
  }, [nextData]);

  const visibleAsks = useStableVisibleRows(
    renderData.asks,
    "ask",
    selectedDisplayMode
  );
  const visibleBids = useStableVisibleRows(
    renderData.bids,
    "bid",
    selectedDisplayMode
  );
  const visibleRows = useMemo(
    () => [...visibleAsks, ...visibleBids],
    [visibleAsks, visibleBids]
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
  const shouldShowSentimentBar = selectedDisplayMode === "both";
  const handleDisplayModeChange = useCallback(
    (value: OrderBookDisplayMode) => {
      setSelectedDisplayMode(value);
    },
    []
  );
  const handleGroupingChange = useCallback((value: number) => {
    setSelectedPriceGrouping(value);
  }, []);

  return (
    <>
      <OrderBookTableHeader
        isMobile={isMobile}
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
              <span className={clsx(styles.cell, styles.priceCell)}>
                {renderData.headers.price}
              </span>
              <span className={clsx(styles.cell, styles.amountCell)}>
                {renderData.headers.amount}
              </span>
              <span className={clsx(styles.cell, styles.totalCell)}>
                {renderData.headers.total}
              </span>
            </div>

            {selectedDisplayMode !== "buy" && (
              <OrderBookRowsSection
                emptyLabel="No asks"
                formatters={formatters}
                rows={visibleAsks}
                side="ask"
                title="Asks"
              />
            )}

            <div className={styles.spreadRow}>
              <span
                className={clsx(styles.cell, styles.priceCell, styles.spreadPrice)}
              >
                {spreadDisplayData.price > 0
                  ? formatters.price.format(spreadDisplayData.price)
                  : "--"}
              </span>
              <span
                className={clsx(
                  styles.cell,
                  styles.amountCell,
                  styles.spreadLabel
                )}
              >
                {spreadDisplayData.label}
              </span>
              <span
                className={clsx(
                  styles.cell,
                  styles.totalCell,
                  styles.spreadValue
                )}
              >
                {spreadDisplayData.value !== null
                  ? formatters.price.format(spreadDisplayData.value)
                  : "--"}
              </span>
            </div>

            {selectedDisplayMode !== "sell" && (
              <OrderBookRowsSection
                emptyLabel="No bids"
                formatters={formatters}
                rows={visibleBids}
                side="bid"
                title="Bids"
              />
            )}

            {shouldShowSentimentBar && (
              <div className={styles.sentimentBar}>
                <div
                  className={clsx(styles.sentimentSide, styles.buySentiment)}
                  style={{ width: `${renderData.sentiment.buy}%` }}
                >
                  <span className={clsx(styles.sentimentBadge, styles.buyBadge)}>
                    B
                  </span>
                  <span className={styles.buyPercentage}>
                    {renderData.sentiment.buy}%
                  </span>
                </div>

                <div
                  className={clsx(styles.sentimentSide, styles.sellSentiment)}
                  style={{ width: `${renderData.sentiment.sell}%` }}
                >
                  <span className={styles.sellPercentage}>
                    {renderData.sentiment.sell}%
                  </span>
                  <span className={clsx(styles.sentimentBadge, styles.sellBadge)}>
                    S
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <OrderBookState message={emptyMessage} />
        )}
      </div>
    </>
  );
};
