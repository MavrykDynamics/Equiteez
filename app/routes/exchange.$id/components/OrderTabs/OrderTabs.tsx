import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/lib/atoms/Tab';

// components
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';

// Tab screens
import { OpenOrders } from './OpenOrders';
import { OpenHistory } from './OpenHistory';
import { TransactionsTab } from './TransactionsTab';

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
    <section className="flex flex-col w-full gap-4">
      <div className="max-w-fit">
        <TabSwitcher
          variant="secondary"
          tabs={tabs}
          activeTabId={activetabId}
        />
      </div>
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
  openOrders: <OpenOrders />,
  orderHistory: <OpenHistory />,
  transactions: <TransactionsTab />,
};
