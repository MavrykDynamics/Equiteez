import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/lib/atoms/Tab';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';
import { ChartTab } from './ChartTab';

export const ExchangeTabs = () => {
  const [activetabId, setAvtiveTabId] = useState('chart');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'assetDetails',
        label: 'Asset Details',
        handleClick: handleTabClick,
      },
      {
        id: 'chart',
        label: 'Chart',
        handleClick: handleTabClick,
      },
      {
        id: 'financials',
        label: 'Financials',
        handleClick: handleTabClick,
      },
      {
        id: 'otcOffers',
        label: 'OTC Offers',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <section className="flex flex-col w-full">
      <TabSwitcher tabs={tabs} activeTabId={activetabId} />
      <div className="mt-6">
        <ExchangeTab tabId={activetabId} />
      </div>
    </section>
  );
};

type ExchangeTabKey = keyof typeof exchangeTabsComponents;

type ExchangeTabProps = {
  tabId: string;
};

const ExchangeTab: FC<ExchangeTabProps> = ({ tabId }) => {
  const Component = exchangeTabsComponents[tabId as ExchangeTabKey];

  return Component;
};

const exchangeTabsComponents = {
  assetDetails: <ChartTab />,
  chart: <ChartTab />,
  financials: <ChartTab />,
  otcOffers: <ChartTab />,
};
