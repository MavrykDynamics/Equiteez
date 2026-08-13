import styles from "./styles.module.css";
import { useState } from "react";
import { RText } from "~/lib/atoms/RTypography/RText";
import Money from "~/lib/atoms/Money";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { ROUTES } from "~/consts";
import { WelcomeBlock } from "~/routes/portfolio/components/WelcomeBlock/WelcomeBlock";
import { RInput } from "~/lib/atoms/RInput/RInput";
import {
  RTabSwitcher,
  type RTabSwitcherItem,
} from "~/lib/organisms/RTabSwitcher";
import { RDepositsTab } from "~/routes/portfolio.activity/components/RDepositsTab";
import { ROpenOrdersTab } from "~/routes/portfolio.activity/components/ROpenOrdersTab";
import { RTransactionHistoryTab } from "~/routes/portfolio.activity/components/RTransactionHistoryTab";

type ActivityTabId = "open-orders" | "transaction-history" | "deposits";

const activityTabs: RTabSwitcherItem[] = [
  {
    count: 15,
    id: "open-orders",
    label: "Open Orders",
  },
  {
    id: "transaction-history",
    label: "Transaction History",
  },
  {
    id: "deposits",
    label: "Deposits",
  },
];

export default function PortfolioActivity() {
  const onChainActivity = 86;
  const openOrders = 15;
  const transfers = 11;
  const [activeTabId, setActiveTabId] = useState<ActivityTabId>("open-orders");

  const renderActiveTab = () => {
    switch (activeTabId) {
      case "transaction-history":
        return <RTransactionHistoryTab />;
      case "deposits":
        return <RDepositsTab />;
      default:
        return <ROpenOrdersTab />;
    }
  };

  return (
    <div className={styles.wrapper}>
      <WelcomeBlock activeTab={ROUTES.portfolioActivity} userName="Josh" />

      <div className={styles.content}>
        <div className={styles.statsWrapper}>
          <div className={styles.statsItem}>
            <RText color="neutral-700" size="body-s" weight="medium">
              On-chain Activity
            </RText>
            <RHeading color="neutral-black" size="h4" weight="medium">
              <Money tooltip={false}>{onChainActivity}</Money>
            </RHeading>
            <RText color="neutral-700" size="body-s">
              Events recorded across portfolio
            </RText>
          </div>

          <div className={styles.statsItem}>
            <RText color="neutral-700" size="body-s" weight="medium">
              Open Orders
            </RText>
            <RHeading color="neutral-black" size="h4" weight="medium">
              <Money tooltip={false}>{openOrders}</Money>
            </RHeading>
            <RText color="neutral-700" size="body-s">
              Resting on the book
            </RText>
          </div>

          <div className={styles.statsItem}>
            <RText color="neutral-700" size="body-s" weight="medium">
              Transfers
            </RText>
            <RHeading color="neutral-black" size="h4" weight="medium">
              <Money tooltip={false}>{transfers}</Money>
            </RHeading>
            <RText color="neutral-700" size="body-s">
              Deposits & withdrawals
            </RText>
          </div>
        </div>

        <section className={styles.history}>
          <div className={styles.historyHeader}>
            <RText color="neutral-black" size="body-m" weight="medium">
              History
            </RText>

            <div className={styles.historyControls}>
              <RTabSwitcher
                activeTabId={activeTabId}
                ariaLabel="Activity history tabs"
                className={styles.tabSwitcher}
                onChange={(tabId) => setActiveTabId(tabId as ActivityTabId)}
                tabs={activityTabs}
              />
              <RInput
                aria-label="Search asset"
                className={styles.search}
                icon="search"
                iconSize="small"
                placeholder="Search Asset"
              />
            </div>
          </div>

          <div className={styles.tabContent}>{renderActiveTab()}</div>
        </section>
      </div>
    </div>
  );
}
