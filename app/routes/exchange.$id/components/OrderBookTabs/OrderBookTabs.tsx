import { FC, useCallback, useMemo, useState } from 'react';
import { TabType } from '~/lib/atoms/Tab';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';
import { OrderBook } from './OrderBook';

export const OrderBookTabs = () => {
  const [activetabId, setAvtiveTabId] = useState('orderBook');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'orderBook',
        label: 'Order Book',
        handleClick: handleTabClick,
      },
      {
        id: 'recents',
        label: 'Recent Trades',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <section className="flex flex-col w-full">
      <TabSwitcher
        variant="secondary"
        tabs={tabs}
        activeTabId={activetabId}
        grow={true}
      />
      <div className="mt-4">
        <OrderBookTab tabId={activetabId} />
      </div>
    </section>
  );
};

type OrderBookTabKey = keyof typeof OrderBookTabsComponents;

type OrderBookTabProps = {
  tabId: string;
};

const OrderBookTab: FC<OrderBookTabProps> = ({ tabId }) => {
  const Component = OrderBookTabsComponents[tabId as OrderBookTabKey];

  return Component;
};

const OrderBookTabsComponents = {
  orderBook: <OrderBook />,
  recents: <OrderBook />,
};
