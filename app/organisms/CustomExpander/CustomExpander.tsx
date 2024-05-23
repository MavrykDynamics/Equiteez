import React, { FC, useState } from 'react';
import ArrowDown from 'app/icons/arrow-down.svg?react';

import styles from './customExpander.module.css';
import clsx from 'clsx';

export type CustomExpanderProps = {
  expanderFaceContent: React.ReactElement;
  iconClassName?: string;
  isExpanded?: boolean;
} & PropsWithChildren;

export const CustomExpander: FC<CustomExpanderProps> = ({
  expanderFaceContent,
  children,
  iconClassName = 'w-4 h-4 text-content stroke-current',
  isExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(() => isExpanded);

  const toggleExpander = () => {
    setExpanded(!expanded);
  };

  return (
    <section className="flex flex-col cursor-pointer">
      <div
        className="flex items-center gap-x-1"
        role="presentation"
        onClick={toggleExpander}
      >
        {expanderFaceContent}
        <ArrowDown
          className={clsx(
            iconClassName,
            'transition duration-300',
            expanded && 'rotate-180'
          )}
        />
      </div>
      <div
        className={clsx(
          'transition duration-300 ease-in-out',
          styles.expanderData,
          expanded && styles.expanded
        )}
      >
        {children}
      </div>
    </section>
  );
};
