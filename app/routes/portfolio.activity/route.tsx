import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchWalletActivitySummary } from "~/lib/apis/rwa";
import styles from "./styles.module.css";
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
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { DepositsTab } from "~/routes/portfolio.activity/components/DepositsTab";
import { OpenOrdersTab } from "~/routes/portfolio.activity/components/OpenOrdersTab/OpenOrdersTab";
import { TransactionHistoryTab } from "~/routes/portfolio.activity/components/TransactionHistoryTab/TransactionHistoryTab";

type ActivityTabId = "open-orders" | "transaction-history" | "deposits";

export default function PortfolioActivity() {
  const { isAuthenticated } = useAuthContext();
  const { userAddress } = useUserContext();
  const [activeTabId, setActiveTabId] = useState<ActivityTabId>("open-orders");
  const [searchValue, setSearchValue] = useState("");
  const activitySummaryQuery = useQuery({
    queryKey: ["rwa-wallet-activity-summary", userAddress],
    queryFn: () =>
      fetchWalletActivitySummary({
        walletAddress: userAddress || "",
      }),
    enabled: isAuthenticated && Boolean(userAddress),
  });

  const activityTabs = useMemo<RTabSwitcherItem[]>(
    () => [
      {
        count: activitySummaryQuery.data?.open_orders ?? undefined,
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
    ],
    [activitySummaryQuery.data?.open_orders]
  );

  const onChainActivity = activitySummaryQuery.data?.onchain_events ?? null;
  const openOrders = activitySummaryQuery.data?.open_orders ?? null;
  const transfers = activitySummaryQuery.data?.transfers ?? null;

  const renderActiveTab = () => {
    switch (activeTabId) {
      case "transaction-history":
        return <TransactionHistoryTab searchValue={searchValue} />;
      case "deposits":
        return <DepositsTab />;
      default:
        return <OpenOrdersTab searchValue={searchValue} />;
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
              {onChainActivity === null ? (
                "—"
              ) : (
                <Money tooltip={false}>{onChainActivity}</Money>
              )}
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
              {openOrders === null ? (
                "—"
              ) : (
                <Money tooltip={false}>{openOrders}</Money>
              )}
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
              {transfers === null ? (
                "—"
              ) : (
                <Money tooltip={false}>{transfers}</Money>
              )}
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
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search Asset"
                value={searchValue}
              />
            </div>
          </div>

          <div className={styles.tabContent}>{renderActiveTab()}</div>
        </section>
      </div>
    </div>
  );
}
