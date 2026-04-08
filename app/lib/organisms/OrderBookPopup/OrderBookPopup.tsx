import { CSSProperties, FC } from "react";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

import CloseIcon from "app/icons/cross.svg?react";
import EyeClosedBoldIcon from "app/icons/eye-closed-bold.svg?react";
import EyeOpenBoldIcon from "app/icons/eye-open-bold.svg?react";
import RedArrowDownIcon from "app/icons/red-arrow-down.svg?react";

import { Spinner } from "~/lib/atoms/Spinner";

import styles from "./orderBookPopup.module.css";

const ORDER_BOOK_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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
    price: number;
    referencePrice: number;
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
  onClose: () => void;
};

type OrderBookToggleButtonProps = {
  className?: string;
  isOpen: boolean;
  labels: OrderBookData["toggleLabels"];
  onClick: () => void;
};

const formatOrderBookNumber = (value: number) =>
  ORDER_BOOK_NUMBER_FORMATTER.format(value);

const hasOrderBookRows = (data: OrderBookData) =>
  data.asks.length > 0 || data.bids.length > 0;

const OrderBookState: FC<{
  isLoading?: boolean;
  message: string;
}> = ({ isLoading = false, message }) => (
  <div className={styles.state}>
    {isLoading && <Spinner size={28} />}
    <span className={styles.stateText}>{message}</span>
  </div>
);

const OrderBookTable: FC<{ data: OrderBookData }> = ({ data }) => (
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

    <div className={styles.tableSection}>
      {data.asks.map((row, index) => (
        <div
          key={`ask-${row.price}-${row.total}-${index}`}
          className={clsx(styles.tableRow, styles.askRow)}
          style={
            {
              "--order-book-depth-width": `${row.depthPercentage}%`,
            } as CSSProperties
          }
        >
          <div className={styles.depthBar} />
          <span
            className={clsx(styles.cell, styles.priceCell, styles.askPrice)}
          >
            {formatOrderBookNumber(row.price)}
          </span>
          <span className={clsx(styles.cell, styles.amountCell)}>
            {formatOrderBookNumber(row.amount)}
          </span>
          <span className={clsx(styles.cell, styles.totalCell)}>
            {formatOrderBookNumber(row.total)}
          </span>
        </div>
      ))}
    </div>

    <div className={styles.spreadRow}>
      <div className={styles.spreadPriceBlock}>
        <span className={styles.spreadPrice}>
          {formatOrderBookNumber(data.spread.price)}
        </span>
        <RedArrowDownIcon className={styles.spreadIcon} />
      </div>
      <span className={styles.spreadReference}>
        ${formatOrderBookNumber(data.spread.referencePrice)}
      </span>
    </div>

    <div className={styles.tableSection}>
      {data.bids.map((row, index) => (
        <div
          key={`bid-${row.price}-${row.total}-${index}`}
          className={clsx(styles.tableRow, styles.bidRow)}
          style={
            {
              "--order-book-depth-width": `${row.depthPercentage}%`,
            } as CSSProperties
          }
        >
          <div className={styles.depthBar} />
          <span
            className={clsx(styles.cell, styles.priceCell, styles.bidPrice)}
          >
            {formatOrderBookNumber(row.price)}
          </span>
          <span className={clsx(styles.cell, styles.amountCell)}>
            {formatOrderBookNumber(row.amount)}
          </span>
          <span className={clsx(styles.cell, styles.totalCell)}>
            {formatOrderBookNumber(row.total)}
          </span>
        </div>
      ))}
    </div>

    <div className={styles.sentimentBar}>
      <div
        className={clsx(styles.sentimentSide, styles.buySentiment)}
        style={{ width: `${data.sentiment.buy}%` }}
      >
        <span className={clsx(styles.sentimentBadge, styles.buyBadge)}>B</span>
        <span className={styles.buyPercentage}>{data.sentiment.buy}%</span>
      </div>

      <div
        className={clsx(styles.sentimentSide, styles.sellSentiment)}
        style={{ width: `${data.sentiment.sell}%` }}
      >
        <span className={styles.sellPercentage}>{data.sentiment.sell}%</span>
        <span className={clsx(styles.sentimentBadge, styles.sellBadge)}>S</span>
      </div>
    </div>
  </>
);

const OrderBookPanelContent: FC<{
  data: OrderBookData;
  emptyMessage?: string;
  isLoading?: boolean;
  isMobile: boolean;
  onClose: () => void;
}> = ({
  data,
  emptyMessage = "No open orders available.",
  isLoading = false,
  isMobile,
  onClose,
}) => (
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
      <h3 className={clsx(styles.title, isMobile && styles.mobileTitle)}>
        {data.title}
      </h3>
      {isLoading ? (
        <OrderBookState isLoading message="Loading order book..." />
      ) : hasOrderBookRows(data) ? (
        <OrderBookTable data={data} />
      ) : (
        <OrderBookState message={emptyMessage} />
      )}
    </div>
  </section>
);

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
  onClose,
}) => (
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
            onClose={onClose}
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
            onClose={onClose}
          />
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
