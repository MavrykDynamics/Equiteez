import { CSSProperties, FC, useMemo } from 'react';

import styles from './nativeTable.module.css';
import clsx from 'clsx';

export const NativeTable: FC<PropsWithChildren> = ({ children }) => {
  return <section className="w-full text-left">{children}</section>;
};

type NativeTableHeaderProps = {
  items: (string | React.ReactElement)[];
  slotWidth?: number;
  customGrid?: string; //  Pick<CSSProperties, 'gridTemplateColumns'>;
  alternativeDesign?: boolean;
};

('gridTemplateColumns: ');

export const NativeTableHeader: FC<NativeTableHeaderProps> = ({
  items,
  customGrid,
  alternativeDesign,
  slotWidth = 187,
}) => {
  const memoizedStyles: CSSProperties = useMemo(
    () => ({
      '--slot-width': `${slotWidth}px`,
      ...(customGrid ? { gridTemplateColumns: customGrid } : {}),
    }),
    [slotWidth, customGrid]
  );

  return (
    <div
      style={memoizedStyles}
      className={clsx(
        'border-b border-divider grid',
        alternativeDesign ? 'pb-3' : 'pb-2',
        !customGrid && styles.nativeTableHeader
      )}
    >
      {items.map((item, idx) => (
        <span
          key={idx}
          className={clsx(
            'text-content text-caption-regular',
            alternativeDesign ? 'pr-2' : 'pl-2'
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

type NativeTableBodyProps = {
  colWidth?: number;
  customGrid?: string; //  Pick<CSSProperties, 'gridTemplateColumns'>;
} & PropsWithChildren;

export const NativeTableRow: FC<NativeTableBodyProps> = ({
  colWidth = 187,
  customGrid,
  children,
}) => {
  const memoizedStyles: CSSProperties = useMemo(
    () => ({
      '--col-width': `${colWidth}px`,
      ...(customGrid ? { gridTemplateColumns: customGrid } : {}),
    }),
    [colWidth, customGrid]
  );

  return (
    <div style={memoizedStyles} className={clsx('grid', styles.nativeTableRow)}>
      {children}
    </div>
  );
};

export const NativeTableColumn: FC<
  PropsWithChildren & { className?: string }
> = ({ className, children }) => {
  return (
    <div
      className={clsx(
        className,
        'py-3 text-content text-body-xs w-auto pr-2 flex items-center'
      )}
    >
      {children}
    </div>
  );
};

export const NativeTableColumnSmall: FC<
  PropsWithChildren & { className?: string }
> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        'py-3 text-content text-caption-regular w-auto pr-2 flex items-center',
        className
      )}
    >
      {children}
    </div>
  );
};
