import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/lib/atoms/Tab';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';

// Tab screens
import { ChartTab } from './ChartTab';
import { OTCTab } from './OTCTab';
import { FinancialTab } from './FinancialTab';
import { AssetDetailsTab } from './AssetDetailsTab';

// Types
import {
  EstateType,
  SecondaryEstate,
} from '~/providers/EstatesProvider/estates.types';

export const ExchangeTabs: FC<{ estate: EstateType }> = ({ estate }) => {
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
    <section className="flex flex-col w-full max-h-[636px]">
      <div className="max-w-fit">
        <TabSwitcher
          variant="secondary"
          tabs={tabs}
          activeTabId={activetabId}
        />
      </div>
      <div className="mt-4 flex-1 overflow-y-auto">
        <ExchangeTab tabId={activetabId} estate={estate} />
      </div>
    </section>
  );
};

type ExchangeTabKey = keyof typeof exchangeTabsComponents;

type ExchangeTabProps = {
  tabId: string;
  estate: EstateType;
};

const ExchangeTab: FC<ExchangeTabProps> = ({ tabId, estate }) => {
  const Component = exchangeTabsComponents[tabId as ExchangeTabKey];

  // TODO fix types for exchange page
  return <Component estate={estate as SecondaryEstate} />;
};

const exchangeTabsComponents = {
  assetDetails: AssetDetailsTab,
  chart: ChartTab,
  financials: FinancialTab,
  otcOffers: OTCTab,
};
