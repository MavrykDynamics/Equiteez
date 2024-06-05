import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/atoms/Tab';
import { TabSwitcher } from '~/organisms/TabSwitcher';
import { Buy } from './Buy';
import { Sell } from './Sell';

type BuySellTabsProps = {
  symbol: string;
};

export const BuySellTabs: FC<BuySellTabsProps> = ({ symbol }) => {
  const [activetabId, setAvtiveTabId] = useState('buy');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'buy',
        label: 'Buy',
        handleClick: handleTabClick,
      },
      {
        id: 'sell',
        label: 'Sell',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <section className="flex flex-col w-full">
      <TabSwitcher tabs={tabs} activeTabId={activetabId} grow={true} />
      <div className="mt-4">
        {activetabId === 'buy' && <Buy symbol={symbol} />}
        {activetabId === 'sell' && <Sell symbol={symbol} />}
      </div>
    </section>
  );
};
