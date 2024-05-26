import { CSSProperties, FC } from 'react';

import styles from './nativeTable.module.css';
import clsx from 'clsx';

export const NativeTable: FC<PropsWithChildren> = ({ children }) => {
  return <section className="w-full text-left">{children}</section>;
};

type NativeTableHeaderProps = {
  items: (string | React.ReactElement)[];
  slotWidth?: number;
};

export const NativeTableHeader: FC<NativeTableHeaderProps> = ({
  items,
  slotWidth = 187,
}) => {
  return (
    <div
      style={{ '--slot-width': `${slotWidth}px` } as CSSProperties}
      className={clsx('border-b border-divider', styles.nativeTableHeader)}
    >
      {items.map((item, idx) => (
        <span key={idx} className="text-content text-caption-regular pl-2">
          {item}
        </span>
      ))}
    </div>
  );
};

type NativeTableBodyProps = {
  colWidth?: number;
} & PropsWithChildren;

export const NativeTableRow: FC<NativeTableBodyProps> = ({
  colWidth = 187,
  children,
}) => {
  return (
    <div
      style={{ '--col-width': `${colWidth}px` } as CSSProperties}
      className={clsx(styles.nativeTableRow)}
    >
      {children}
    </div>
  );
};

export const NativeTableColumn: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="py-3 text-content text-body-xs w-auto pl-2">{children}</div>
  );
};
