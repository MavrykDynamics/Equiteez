import {
  OrderStatus,
  OrderStatusNames,
} from "~/lib/apis/mbrwa/user/userOrders/order.const";
import styles from "~/routes/wallet.transactions/styles.module.css";

export function TransactionOrderStatusFlag({
  status,
}: {
  status: OrderStatus;
}) {
  const classesByStatus = {
    [OrderStatus.ACTIVE]: null,
    [OrderStatus.EXPIRED]: styles.transactionCanceled,
    [OrderStatus.CANCELED]: styles.transactionCanceled,
    [OrderStatus.FULFILLED]: styles.transactionFilled,
    [OrderStatus.REFUNDED]: styles.transactionRefunded,
  };

  const activeClassName = classesByStatus[status];

  if (activeClassName)
    return <div className={activeClassName}>{OrderStatusNames[status]}</div>;

  return null;
}
