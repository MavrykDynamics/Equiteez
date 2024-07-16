import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import ArrowDown from 'app/icons/chevron-down.svg?react';

import styles from './customExpander.module.css';
import clsx from 'clsx';

type ExpanderContextType = {
  expanded: boolean;
  toggleExpander: () => void;
};

const expanderContext = createContext<ExpanderContextType>(undefined!);

export type CustomExpanderProps = {
  isExpanded?: boolean;
} & PropsWithChildren;

export const CustomExpander: FC<CustomExpanderProps> = ({
  children,
  isExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(() => isExpanded);

  const toggleExpander = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const memoizedExpanderValue = useMemo(
    () => ({ toggleExpander, expanded }),
    [expanded, toggleExpander]
  );

  return (
    <expanderContext.Provider value={memoizedExpanderValue}>
      <div className="flex flex-col cursor-pointer">{children}</div>
    </expanderContext.Provider>
  );
};

export const ExpanderFaceContent: FC<
  PropsWithChildren & { iconClassName?: string }
> = ({ children, iconClassName = 'w-4 h-4 text-content stroke-current' }) => {
  const { expanded } = useExpanderContext();
  return (
    <div className="flex items-center gap-x-1" role="presentation">
      {children}
      <ArrowDown
        className={clsx(
          iconClassName,
          'transition duration-300',
          expanded && 'rotate-180'
        )}
      />
    </div>
  );
};

export const ExpanderBodyContent: FC<PropsWithChildren> = ({ children }) => {
  const { expanded } = useExpanderContext();

  return (
    <div
      className={clsx(
        'transition duration-300 ease-in-out',
        styles.expanderData,
        expanded && styles.expanded
      )}
    >
      {children}
    </div>
  );
};

export const ClickableExpanderArea: FC<PropsWithChildren> = ({ children }) => {
  const { toggleExpander } = useExpanderContext();

  return (
    <div role="presentation" onClick={toggleExpander}>
      {children}
    </div>
  );
};

const useExpanderContext = () => {
  const context = useContext(expanderContext);

  if (!context) {
    throw new Error(
      'useExpanderContent must be used within CustomExpander provider!'
    );
  }

  return context;
};
