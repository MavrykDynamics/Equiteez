import styles from './styles.module.css';
import { OrderbookBar } from "~/routes/trade.$address/components/ChartBlock/OrderbookBar";

export function ChartBlock() {
  return <div className={styles.wrapper}>
    <OrderbookBar buyPercentage={64} sellPercentage={36} />
  </div>
}