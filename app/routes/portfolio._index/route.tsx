import styles from "./styles.module.css";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { ROUTES } from "~/consts";

export default function PortfolioOverview() {
  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolio} userName="Josh" />
      <div className={styles.content}></div>
    </div>
  );
}
