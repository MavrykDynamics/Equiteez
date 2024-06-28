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
      {
        id: 'assetDetails',
        label: 'Asset Details',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <section className="flex flex-col w-full">
      <div className="max-w-fit">
        <TabSwitcher
          variant="secondary"
          tabs={tabs}
          activeTabId={activetabId}
        />
      </div>
      <div className="mt-4">
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
