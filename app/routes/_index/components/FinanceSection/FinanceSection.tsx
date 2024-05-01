import { useCallback, useMemo, useState } from 'react';

// assets
import StatsImageSrc from 'app/assets/home/stats.webp';

import styles from './financeSection.module.css';
import type { TabType } from 'app/atoms/Tab';
import { TabSwitcher } from 'app/organisms/TabSwitcher';
import { TabsStepper } from './TabsStepper';
import { HeadlineBlock } from './HeadlineBlock';

export const FinanceSection = () => {
  const [activetabId, setAvtiveTabId] = useState('buying');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'buying',
        label: 'Buying',
        Component: () => <TabsStepper tabId="buying" />,
        handleClick: handleTabClick,
      },
      {
        id: 'selling',
        label: 'Selling',
        Component: () => <TabsStepper tabId="selling" />,
        handleClick: handleTabClick,
      },
      {
        id: 'borrowing',
        label: 'Borrowing',
        Component: () => <TabsStepper tabId="borrowing" />,
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <section className="px-11">
      <HeadlineBlock />
      <div className={styles.financeBlockWrapper}>
        <div className={styles.financeBlockImageWrapper}>
          <img src={StatsImageSrc} alt="finance stats" />
        </div>
        <div>
          <TabSwitcher tabs={tabs} activeTabId={activetabId} />
          <div className="mt-[42px]">
            <TabsStepper tabId={activetabId} />
          </div>
        </div>
      </div>
    </section>
  );
};
