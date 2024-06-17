import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/lib/atoms/Tab';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';
import { HistoryTab } from './HistoryTab';

export const OrderTabs = () => {
  const [activetabId, setAvtiveTabId] = useState('openOrders');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'openOrders',
        label: 'Open Orders',
        handleClick: handleTabClick,
      },
      {
        id: 'orderHistory',
        label: 'Order History ',
        handleClick: handleTabClick,
      },
      {
        id: 'transactions',
        label: 'Transactions',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <section className="flex flex-col w-full gap-8">
      <TabSwitcher tabs={tabs} activeTabId={activetabId} />
      <div className="">
        <OrderTab tabId={activetabId} />
      </div>
    </section>
  );
};

type OrderTabKey = keyof typeof OrderTabsComponents;

type OrderTabProps = {
  tabId: string;
};

const OrderTab: FC<OrderTabProps> = ({ tabId }) => {
  const Component = OrderTabsComponents[tabId as OrderTabKey];

  return Component;
};

const OrderTabsComponents = {
  openOrders: <HistoryTab />,
  orderHistory: <HistoryTab />,
  transactions: <HistoryTab />,
};
