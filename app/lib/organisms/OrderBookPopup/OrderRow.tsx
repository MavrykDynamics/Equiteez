import { CSSProperties, FC, memo } from "react";

import clsx from "clsx";

import type { OrderBookRow } from "./orderBook.types";
import styles from "./orderBookPopup.module.css";

type OrderRowProps = {
  amountLabel: string;
  priceLabel: string;
  row: OrderBookRow;
  side: "ask" | "bid";
  totalLabel: string;
};

const OrderRowComponent: FC<OrderRowProps> = ({
  amountLabel,
  priceLabel,
  row,
  side,
  totalLabel,
}) => (
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
    <span
      className={clsx(
        styles.cell,
        styles.priceCell,
        side === "ask" ? styles.askPrice : styles.bidPrice
      )}
    >
      {priceLabel}
    </span>
    <span className={clsx(styles.cell, styles.amountCell)}>{amountLabel}</span>
    <span className={clsx(styles.cell, styles.totalCell)}>{totalLabel}</span>
  </div>
);

export const OrderRow = memo(
  OrderRowComponent,
  (previousProps, nextProps) =>
    previousProps.row === nextProps.row &&
    previousProps.side === nextProps.side &&
    previousProps.amountLabel === nextProps.amountLabel &&
    previousProps.priceLabel === nextProps.priceLabel &&
    previousProps.totalLabel === nextProps.totalLabel
);

OrderRow.displayName = "OrderRow";
