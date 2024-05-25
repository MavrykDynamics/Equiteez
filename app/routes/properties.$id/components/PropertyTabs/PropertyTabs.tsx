import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/atoms/Tab';
import { TabSwitcher } from '~/organisms/TabSwitcher';
import { PropertyFinanceTab } from './PropertyFinance';
import { PropertyDetailsTab } from './ProperyDetailsTab';
import { PropertyBlockchainTab } from './PropertyBlockchainTab';
import { MetaFunction } from '@remix-run/node';
import {
  ALL_TABS,
  PRIMARY_TABS,
  PROPERTY_BLOCKCHAIN_TAB,
  PROPERTY_DETAILS_TAB,
  PROPERTY_FINANCIALS_TAB,
  PROPERTY_OFFERING_TAB,
  PROPERTY_OTC_TAB,
  PROPERTY_TRDADING_HISTORY_TAB,
} from '../../consts';
import { useAppContext } from '~/providers/AppProvider/AppProvider';
import { PropertyOfferingTab } from './PropertyOfferingTab';

export const meta: MetaFunction = () => {
  return [
    { title: 'Property' },
    { name: 'description', content: 'Property data' },
  ];
};

type PropertyTabsProps = {
  tabId?: string;
  isSecondaryEstate: boolean;
};

export default function PropertyTabs({
  tabId,
  isSecondaryEstate,
}: PropertyTabsProps) {
  const { IS_WEB } = useAppContext();

  const [activetabId, setAvtiveTabId] = useState(
    () =>
      (isSecondaryEstate ? ALL_TABS : PRIMARY_TABS).find(
        (tab) => tab === tabId
      ) ?? PROPERTY_DETAILS_TAB
  );

  const handleTabClick = useCallback(
    (id: string) => {
      if (IS_WEB) {
        const href = window.location.href.split('?');
        href.pop();
        const fileteredHref = href.join('/');

        window.history.pushState({}, '', fileteredHref.concat(`?tabId=${id}`));
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
      ...(isSecondaryEstate
        ? [
            {
              id: PROPERTY_TRDADING_HISTORY_TAB,
              label: 'Trading History',
              handleClick: handleTabClick,
            },
            {
              id: PROPERTY_OTC_TAB,
              label: 'OTC',
              handleClick: handleTabClick,
            },
          ]
        : []),
    ],
    [handleTabClick, isSecondaryEstate]
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
  [PROPERTY_DETAILS_TAB]: <PropertyDetailsTab />,
  [PROPERTY_FINANCIALS_TAB]: <PropertyFinanceTab />,
  [PROPERTY_BLOCKCHAIN_TAB]: <PropertyBlockchainTab />,
  [PROPERTY_OFFERING_TAB]: <PropertyOfferingTab />,
  [PROPERTY_TRDADING_HISTORY_TAB]: <PropertyBlockchainTab />,
  [PROPERTY_OTC_TAB]: <PropertyBlockchainTab />,
};
