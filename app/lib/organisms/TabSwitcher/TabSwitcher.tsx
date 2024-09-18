import type { FC } from 'react';
import clsx from 'clsx';

// components
import { Tab, TabType, TabVariant } from '~/lib/atoms/Tab';

type TabSwitcherProps = {
  tabs: TabType[];
  activeTabId?: string;
  grow?: boolean;
  variant?: TabVariant;
  className?: string;
};

const variants = {
  primary: 'gap-x-3',
  secondary: 'gap-x-2',
  tertiary: 'gap-x-4',
};

export const TabSwitcher: FC<TabSwitcherProps> = ({
  tabs,
  activeTabId,
  grow,
  className,
  variant = 'primary',
}) => {
  return (
    <div className={clsx('flex items-center', variants[variant], className)}>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          {...tab}
          active={tab.id === activeTabId}
          grow={grow}
          variant={variant}
        />
      ))}
    </div>
  );
};
