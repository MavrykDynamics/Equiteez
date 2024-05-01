import type { FC } from 'react';

// component
import { Tab, TabType } from 'app/atoms/Tab';

type TabSwitcherProps = {
  tabs: TabType[];
  activeTabId?: string;
};

export const TabSwitcher: FC<TabSwitcherProps> = ({ tabs, activeTabId }) => {
  return (
    <div className="flex items-center gap-x-3">
      {tabs.map((tab) => (
        <Tab key={tab.id} {...tab} active={tab.id === activeTabId} />
      ))}
    </div>
  );
};
