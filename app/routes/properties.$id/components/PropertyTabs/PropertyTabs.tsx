import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/atoms/Tab';
import { TabSwitcher } from '~/organisms/TabSwitcher';
import { PropertyDetailsTab } from './ProperyDetailsTab';

export const PropertyTabs = () => {
  const [activetabId, setAvtiveTabId] = useState('propertyDetails');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'propertyDetails',
        label: 'Property Details',
        handleClick: handleTabClick,
      },
      {
        id: 'financials',
        label: 'Financials',
        handleClick: handleTabClick,
      },
      {
        id: 'blockchain',
        label: 'Blockchain',
        handleClick: handleTabClick,
      },
      {
        id: 'offering',
        label: 'Offering',
        handleClick: handleTabClick,
      },
      {
        id: 'valuation',
        label: 'Valuation',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <section className="flex flex-col">
      <TabSwitcher tabs={tabs} activeTabId={activetabId} />
      <div className="mt-11">
        <PropertyTab tabId={activetabId} />
      </div>
    </section>
  );
};

type PropertytabKey = keyof typeof propertyTabsComponents;

type PropertyTabProps = {
  tabId: string;
};

const PropertyTab: FC<PropertyTabProps> = ({ tabId }) => {
  const Component = propertyTabsComponents[tabId as PropertytabKey];

  return Component;
};

const propertyTabsComponents = {
  propertyDetails: <PropertyDetailsTab />,
  financials: null,
  blockchain: null,
  offering: null,
  valuation: null,
};
