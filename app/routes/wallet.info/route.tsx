import React, { useMemo, useState } from "react";
import styles from "./styles.module.css";
import { PersonalInfo } from "~/routes/wallet.info/components/PersonalInfo";
import { AccountBlock } from "~/routes/wallet.info/components/AccountBlock";
import { WalletInformation } from "~/routes/wallet.info/components/WalletInformation";
import { TabSwitcherV2 } from "~/lib/organisms/TabSwitcherV2/TabSwitcherV2";
import { TabType } from "~/lib/atoms/Tab";
import {
  TABLET_MAX_WIDTH,
  useWindowDimensions,
} from "~/hooks/useWindowDimensions";

export default function WalletInfo() {
  const [activeTab, setActiveTab] = useState<"accountInfo" | "walletInfo">(
    "accountInfo"
  );

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: "accountInfo",
        label: "Profile Info",
        handleClick: () => setActiveTab("accountInfo"),
      },
      {
        id: "walletInfo",
        label: "Wallet Info",
        handleClick: () => setActiveTab("walletInfo"),
      },
    ],
    []
  );

  const { width } = useWindowDimensions();
  const isTablet = width < TABLET_MAX_WIDTH;

  return (
    <>
      {isTablet ? (
        <div className={styles.mobileWrapper}>
          <TabSwitcherV2
            className={styles.tabSwitcher}
            tabClassName={styles.tabSwitcherItem}
            tabs={tabs}
            activeClassName={styles.tabSwitcherItemActive}
            activeTabId={activeTab}
          />
          {activeTab === "accountInfo" && (
            <>
              <AccountBlock />
              <PersonalInfo />
            </>
          )}
          {activeTab === "walletInfo" && <WalletInformation />}
        </div>
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.infoWrapper}>
            <AccountBlock />
            <PersonalInfo />
          </div>
          <WalletInformation />
        </div>
      )}
    </>
  );
}
