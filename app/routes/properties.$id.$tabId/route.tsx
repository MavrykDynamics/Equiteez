import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/atoms/Tab';
import { TabSwitcher } from '~/organisms/TabSwitcher';
import { PropertyFinanceTab } from './components/PropertyFinance';
import { PropertyDetailsTab } from './components/ProperyDetailsTab';
import { PropertyBlockchainTab } from './components/PropertyBlockchainTab';
import { MetaFunction } from '@remix-run/node';
import {
  PRIMARY_TABS,
  PROPERTY_BLOCKCHAIN_TAB,
  PROPERTY_DETAILS_TAB,
  PROPERTY_FINANCIALS_TAB,
  PROPERTY_OFFERING_TAB,
} from './consts';
import { useMatches } from '@remix-run/react';
import { useAppContext } from '~/providers/AppProvider/AppProvider';

export const meta: MetaFunction = () => {
  return [
    { title: 'Property' },
    { name: 'description', content: 'Property data' },
  ];
};

export default function PropertyTabs() {
  const matches = useMatches();
  const { IS_WEB } = useAppContext();
  const tabId = matches[matches.length - 1].params?.tabId;
  const [activetabId, setAvtiveTabId] = useState(
    () => PRIMARY_TABS.find((tab) => tab === tabId) ?? PROPERTY_DETAILS_TAB
  );

  const handleTabClick = useCallback(
    (id: string) => {
      if (IS_WEB) {
        const href = window.location.href.split('/');
        href.pop();
        const fileteredHref = href.join('/');

        window.history.pushState({}, '', fileteredHref.concat(`/${id}`));
      }

      setAvtiveTabId(id);
    },
    [IS_WEB]
  );

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: PROPERTY_DETAILS_TAB,
        label: 'Property Details',
        handleClick: handleTabClick,
      },
      {
        id: PROPERTY_FINANCIALS_TAB,
        label: 'Financials',
        handleClick: handleTabClick,
      },
      {
        id: PROPERTY_BLOCKCHAIN_TAB,
        label: 'Blockchain',
        handleClick: handleTabClick,
      },
      {
        id: PROPERTY_OFFERING_TAB,
        label: 'Offering',
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
}

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
  financials: <PropertyFinanceTab />,
  blockchain: <PropertyBlockchainTab />,
  offering: <PropertyBlockchainTab />,
};
