import { CSSProperties, FC, useMemo, useState } from "react";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

import CloseIcon from "app/icons/cross.svg?react";
import EyeClosedBoldIcon from "app/icons/eye-closed-bold.svg?react";
import EyeOpenBoldIcon from "app/icons/eye-open-bold.svg?react";

import { Spinner } from "~/lib/atoms/Spinner";

import styles from "./orderBookPopup.module.css";

const DEFAULT_PRICE_GROUPING = 0.01;
const DEFAULT_METRIC_FRACTION_DIGITS = 2;
const MAX_METRIC_FRACTION_DIGITS = 4;
const DEFAULT_ROWS_PER_SIDE = 10;
const SINGLE_SIDE_ROWS = 20;

const PANEL_TRANSITION = {
  duration: 0.2,
  ease: "easeInOut",
} as const;

export type OrderBookRow = {
  amount: number;
  depthPercentage: number;
  price: number;
  total: number;
};

export type OrderBookData = {
  asks: OrderBookRow[];
  bids: OrderBookRow[];
  headers: {
    amount: string;
    price: string;
    total: string;
  };
  sentiment: {
    buy: number;
    sell: number;
  };
  spread: {
    bestAsk: number;
    bestBid: number;
    price: number;
    value: number;
  };
  title: string;
  toggleLabels: {
    hide: string;
    show: string;
  };
};

type OrderBookPopupProps = {
  className?: string;
  data: OrderBookData;
  emptyMessage?: string;
  isLoading?: boolean;
  isOpen: boolean;
  isRefreshing?: boolean;
  onClose: () => void;
  onGroupingChange?: (value: number) => void;
  priceGroupingOptions?: number[];
  selectedPriceGrouping?: number;
};

type OrderBookToggleButtonProps = {
  className?: string;
  isOpen: boolean;
  labels: OrderBookData["toggleLabels"];
  onClick: () => void;
};

type OrderBookNumberFormatters = {
  amount: Intl.NumberFormat;
  price: Intl.NumberFormat;
  total: Intl.NumberFormat;
};

type OrderBookDisplayMode = "both" | "buy" | "sell";

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

const OrderBookState: FC<{
  isLoading?: boolean;
  message: string;
}> = ({ isLoading = false, message }) => (
  <div className={styles.state}>
    {isLoading && <Spinner size={28} />}
    <span className={styles.stateText}>{message}</span>
  </div>
);

const OrderBookRowsSection: FC<{
  emptyLabel: string;
  formatters: OrderBookNumberFormatters;
  rows: OrderBookRow[];
  side: "ask" | "bid";
  title: string;
}> = ({ emptyLabel, formatters, rows, side, title }) => (
  <section className={styles.section}>
    <div className={styles.sectionLabel}>{title}</div>

    <div className={styles.tableSection}>
      {rows.length === 0 ? (
        <div className={styles.sectionEmpty}>{emptyLabel}</div>
      ) : (
        rows.map((row) => (
          <div
            key={`${side}-${row.price}`}
            className={clsx(
              styles.tableRow,
              side === "ask" ? styles.askRow : styles.bidRow
            )}
            style={
              {
                "--order-book-depth-width": `${row.depthPercentage}%`,
              } as CSSProperties
            }
          >
            <div className={styles.depthBar} />
            <span
              className={clsx(
                styles.cell,
                styles.priceCell,
                side === "ask" ? styles.askPrice : styles.bidPrice
              )}
            >
              {formatters.price.format(row.price)}
            </span>
            <span className={clsx(styles.cell, styles.amountCell)}>
              {formatters.amount.format(row.amount)}
            </span>
            <span className={clsx(styles.cell, styles.totalCell)}>
              {formatters.total.format(row.total)}
            </span>
          </div>
        ))
      )}
    </div>
  </section>
);

const OrderBookTable: FC<{
  data: OrderBookData;
  displayMode: OrderBookDisplayMode;
  selectedPriceGrouping: number;
}> = ({ data, displayMode, selectedPriceGrouping }) => {
  const visibleAsks = useMemo(
    () => getVisibleRows(data.asks, "ask", displayMode),
    [data.asks, displayMode]
  );
  const visibleBids = useMemo(
    () => getVisibleRows(data.bids, "bid", displayMode),
    [data.bids, displayMode]
  );
  const spreadDisplayData = useMemo(
    () => getSpreadDisplayData(data.spread, displayMode),
    [data.spread, displayMode]
  );
  const visibleRows = useMemo(
    () => [...visibleAsks, ...visibleBids],
    [visibleAsks, visibleBids]
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
  const shouldShowSentimentBar = displayMode === "both";

  const formatters = useMemo<OrderBookNumberFormatters>(
    () => ({
      amount: createNumberFormatter(amountFractionDigits),
      price: createNumberFormatter(priceFractionDigits),
      total: createNumberFormatter(totalFractionDigits),
    }),
    [amountFractionDigits, priceFractionDigits, totalFractionDigits]
  );

  return (
    <>
      <div className={styles.tableHeader}>
        <span className={clsx(styles.cell, styles.priceCell)}>
          {data.headers.price}
        </span>
        <span className={clsx(styles.cell, styles.amountCell)}>
          {data.headers.amount}
        </span>
        <span className={clsx(styles.cell, styles.totalCell)}>
          {data.headers.total}
        </span>
      </div>

      {displayMode !== "buy" && (
        <OrderBookRowsSection
          emptyLabel="No asks"
          formatters={formatters}
          rows={visibleAsks}
          side="ask"
          title="Asks"
        />
      )}

      <div className={styles.spreadRow}>
        <span className={clsx(styles.cell, styles.priceCell, styles.spreadPrice)}>
          {spreadDisplayData.price > 0
            ? formatters.price.format(spreadDisplayData.price)
            : "--"}
        </span>
        <span className={clsx(styles.cell, styles.amountCell, styles.spreadLabel)}>
          {spreadDisplayData.label}
        </span>
        <span className={clsx(styles.cell, styles.totalCell, styles.spreadValue)}>
          {spreadDisplayData.value !== null
            ? formatters.price.format(spreadDisplayData.value)
            : "--"}
        </span>
      </div>

      {displayMode !== "sell" && (
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
            style={{ width: `${data.sentiment.buy}%` }}
          >
            <span className={clsx(styles.sentimentBadge, styles.buyBadge)}>
              B
            </span>
            <span className={styles.buyPercentage}>{data.sentiment.buy}%</span>
          </div>

          <div
            className={clsx(styles.sentimentSide, styles.sellSentiment)}
            style={{ width: `${data.sentiment.sell}%` }}
          >
            <span className={styles.sellPercentage}>{data.sentiment.sell}%</span>
            <span className={clsx(styles.sentimentBadge, styles.sellBadge)}>
              S
            </span>
          </div>
        </div>
      )}
    </>
  );
};

const OrderBookPanelContent: FC<{
  data: OrderBookData;
  emptyMessage?: string;
  isLoading?: boolean;
  isMobile: boolean;
  isRefreshing?: boolean;
  onClose: () => void;
  onGroupingChange?: (value: number) => void;
  priceGroupingOptions?: number[];
  selectedPriceGrouping?: number;
  selectedDisplayMode: OrderBookDisplayMode;
  onDisplayModeChange: (value: OrderBookDisplayMode) => void;
}> = ({
  data,
  emptyMessage = "No open orders available.",
  isLoading = false,
  isMobile,
  isRefreshing = false,
  onClose,
  onGroupingChange,
  priceGroupingOptions = [],
  selectedPriceGrouping = DEFAULT_PRICE_GROUPING,
  selectedDisplayMode,
  onDisplayModeChange,
}) => {
  const shouldShowGroupingControl =
    Boolean(onGroupingChange) && priceGroupingOptions.length > 1;

  return (
    <section
      className={clsx(
        styles.panel,
        isMobile ? styles.mobilePanel : styles.desktopPanel
      )}
    >
      {isMobile && (
        <button
          type="button"
          aria-label={data.toggleLabels.hide}
          className={styles.mobileCloseButton}
          onClick={onClose}
        >
          <CloseIcon className={styles.mobileCloseIcon} />
        </button>
      )}

      <div
        className={clsx(
          styles.panelInner,
          isMobile ? styles.mobilePanelInner : styles.desktopPanelInner
        )}
      >
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h3 className={clsx(styles.title, isMobile && styles.mobileTitle)}>
              {data.title}
            </h3>

            <div className={styles.headerActions}>
              {isRefreshing && hasOrderBookRows(data) && (
                <span className={styles.refreshingLabel}>Updating...</span>
              )}

              {shouldShowGroupingControl && onGroupingChange && (
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

        <div className={styles.content}>
          {isLoading ? (
            <OrderBookState isLoading message="Loading order book..." />
          ) : hasOrderBookRows(data) ? (
            <OrderBookTable
              data={data}
              displayMode={selectedDisplayMode}
              selectedPriceGrouping={selectedPriceGrouping}
            />
          ) : (
            <OrderBookState message={emptyMessage} />
          )}
        </div>
      </div>
    </section>
  );
};

export const OrderBookToggleButton: FC<OrderBookToggleButtonProps> = ({
  className,
  isOpen,
  labels,
  onClick,
}) => {
  const Icon = isOpen ? EyeClosedBoldIcon : EyeOpenBoldIcon;

  return (
    <button
      type="button"
      aria-pressed={isOpen}
      className={clsx(styles.toggleButton, className)}
      onClick={onClick}
    >
      <Icon className={styles.toggleIcon} />
      <span className={styles.toggleLabel}>
        {isOpen ? labels.hide : labels.show}
      </span>
    </button>
  );
};

export const OrderBookPopup: FC<OrderBookPopupProps> = ({
  className,
  data,
  emptyMessage,
  isLoading = false,
  isOpen,
  isRefreshing = false,
  onClose,
  onGroupingChange,
  priceGroupingOptions = [],
  selectedPriceGrouping = DEFAULT_PRICE_GROUPING,
}) => {
  const [selectedDisplayMode, setSelectedDisplayMode] =
    useState<OrderBookDisplayMode>("both");

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          <motion.aside
            key="desktop-order-book"
            className={clsx(styles.desktopWrapper, className)}
            initial={{ opacity: 0, width: 0, x: -32 }}
            animate={{ opacity: 1, width: 359, x: 0 }}
            exit={{ opacity: 0, width: 0, x: -32 }}
            transition={PANEL_TRANSITION}
          >
            <OrderBookPanelContent
              data={data}
              emptyMessage={emptyMessage}
              isLoading={isLoading}
              isMobile={false}
              isRefreshing={isRefreshing}
              onClose={onClose}
              onDisplayModeChange={setSelectedDisplayMode}
              onGroupingChange={onGroupingChange}
              priceGroupingOptions={priceGroupingOptions}
              selectedDisplayMode={selectedDisplayMode}
              selectedPriceGrouping={selectedPriceGrouping}
            />
          </motion.aside>

          <motion.div
            key="mobile-order-book"
            className={styles.mobileOverlay}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={PANEL_TRANSITION}
          >
            <OrderBookPanelContent
              data={data}
              emptyMessage={emptyMessage}
              isLoading={isLoading}
              isMobile
              isRefreshing={isRefreshing}
              onClose={onClose}
              onDisplayModeChange={setSelectedDisplayMode}
              onGroupingChange={onGroupingChange}
              priceGroupingOptions={priceGroupingOptions}
              selectedDisplayMode={selectedDisplayMode}
              selectedPriceGrouping={selectedPriceGrouping}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
