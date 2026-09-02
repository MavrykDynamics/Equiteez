import { CSSProperties, FC, memo, useCallback } from "react";

import clsx from "clsx";

import type { OrderBookRow } from "./orderBook.types";
import styles from "./orderBookPopup.module.css";

type OrderRowProps = {
  amountLabel: string;
  onPriceClick?: (price: number, side: "ask" | "bid") => void;
  priceLabel: string;
  renderPriceAsButton?: boolean;
  row: OrderBookRow;
  showDepthBar?: boolean;
  side: "ask" | "bid";
  totalLabel: string;
};

const OrderRowComponent: FC<OrderRowProps> = ({
  amountLabel,
  onPriceClick,
  priceLabel,
  renderPriceAsButton = true,
  row,
  showDepthBar = true,
  side,
  totalLabel,
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
      {showDepthBar && <div className={styles.depthBar} />}
      {renderPriceAsButton ? (
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
      ) : (
        <span
          className={clsx(
            styles.rowValue,
            styles.priceCell,
            side === "ask" ? styles.askPrice : styles.bidPrice
          )}
        >
          {priceLabel}
        </span>
      )}

      <span className={clsx(styles.rowValue, styles.amountCell)}>
        {amountLabel}
      </span>

      <span className={clsx(styles.rowValue, styles.totalCell)}>
        {totalLabel}
      </span>
    </div>
  );
};

export const OrderRow = memo(
  OrderRowComponent,
  (previousProps, nextProps) =>
    previousProps.amountLabel === nextProps.amountLabel &&
    previousProps.row === nextProps.row &&
    previousProps.side === nextProps.side &&
    previousProps.onPriceClick === nextProps.onPriceClick &&
    previousProps.priceLabel === nextProps.priceLabel &&
    previousProps.renderPriceAsButton === nextProps.renderPriceAsButton &&
    previousProps.showDepthBar === nextProps.showDepthBar &&
    previousProps.totalLabel === nextProps.totalLabel
);

OrderRow.displayName = "OrderRow";
