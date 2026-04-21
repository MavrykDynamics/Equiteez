import { CSSProperties, FC, memo, useCallback } from "react";

import clsx from "clsx";

import type { OrderBookRow } from "./orderBook.types";
import styles from "./orderBookPopup.module.css";

type OrderRowProps = {
  onPriceClick?: (price: number, side: "ask" | "bid") => void;
  priceLabel: string;
  row: OrderBookRow;
  side: "ask" | "bid";
};

const OrderRowComponent: FC<OrderRowProps> = ({
  onPriceClick,
  priceLabel,
  row,
  side,
}) => {
  const handlePriceClick = useCallback(() => {
    onPriceClick?.(row.price, side);
  }, [onPriceClick, row.price, side]);

  return (
    <div
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
      <button
        type="button"
        aria-label={`Select price ${priceLabel}`}
        className={clsx(
          styles.rowValue,
          styles.priceCell,
          styles.priceButton,
          side === "ask" ? styles.askPrice : styles.bidPrice
        )}
        disabled={!onPriceClick}
        onClick={handlePriceClick}
      >
        {priceLabel}
      </button>
    </div>
  );
};

export const OrderRow = memo(
  OrderRowComponent,
  (previousProps, nextProps) =>
    previousProps.row === nextProps.row &&
    previousProps.side === nextProps.side &&
    previousProps.onPriceClick === nextProps.onPriceClick &&
    previousProps.priceLabel === nextProps.priceLabel
);

OrderRow.displayName = "OrderRow";
