import clsx from "clsx";

import styles from "./ROrderStatusBadge.module.css";

type OrderStatusBadgeVariant = "canceled" | "filled" | "open" | "expired";

type OrderStatusBadgeDetails = {
  label: string;
  variant: OrderStatusBadgeVariant;
};

const statusDetailsByValue: Record<string, OrderStatusBadgeDetails> = {
  fulfilled: {
    label: "FILLED",
    variant: "filled",
  },
  canceled: {
    label: "CANCELED",
    variant: "canceled",
  },
  expired: {
    label: "EXPIRED",
    variant: "expired",
  },
  pending: {
    label: "OPEN",
    variant: "open",
  },
};

function getOrderStatusBadgeDetails(status: string): OrderStatusBadgeDetails {
  return (
    statusDetailsByValue[status.trim().toLowerCase()] ?? {
      label: status.toUpperCase(),
      variant: "canceled",
    }
  );
}

type ROrderStatusBadgeProps = {
  status: string;
};

export function ROrderStatusBadge({ status }: ROrderStatusBadgeProps) {
  const { label, variant } = getOrderStatusBadgeDetails(status);

  return <span className={clsx(styles.badge, styles[variant])}>{label}</span>;
}
