import type { FC } from 'react';

// component
import { Tab, TabType } from '~/lib/atoms/Tab';

type TabSwitcherProps = {
  tabs: TabType[];
  activeTabId?: string;
  grow?: boolean;
};

export const TabSwitcher: FC<TabSwitcherProps> = ({
  tabs,
  activeTabId,
  grow,
}) => {
  return (
    <div className="flex items-center gap-x-3">
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          {...tab}
          active={tab.id === activeTabId}
          grow={grow}
        />
      ))}
    </div>
  );
};
