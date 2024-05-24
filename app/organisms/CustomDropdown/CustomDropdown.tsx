import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ArrowDown from 'app/icons/arrow-down.svg?react';

import styles from './dropdown.module.css';
import clsx from 'clsx';
import { useAppContext } from '~/providers/AppProvider/AppProvider';
import { useOutsideClick } from '~/hooks/use-click-outside';

type FaceContentDimensions = {
  width: number;
  height: number;
};

type DropdownContextType = {
  opened: boolean;
  toggleOpened: () => void;
  setFaceContentDimensions: React.Dispatch<
    React.SetStateAction<FaceContentDimensions>
  >;
  faceContentDimensions: FaceContentDimensions;
};

const dropdownContext = createContext<DropdownContextType>(undefined!);

export const CustomDropdown: FC<PropsWithChildren> = ({ children }) => {
  const [opened, setOpened] = useState(false);
  const [faceContentDimensions, setFaceContentDimensions] = useState({
    width: 0,
    height: 0,
  });

  const toggleOpened = useCallback(() => {
    setOpened(!opened);
  }, [opened]);

  const closeDropdown = useCallback(() => {
    setOpened(false);
  }, []);

  const memoizedExpanderValue = useMemo(
    () => ({
      toggleOpened,
      opened,
      setFaceContentDimensions,
      faceContentDimensions,
    }),
    [toggleOpened, opened, faceContentDimensions]
  );

  const ref = useOutsideClick(closeDropdown, !opened);

  return (
    <dropdownContext.Provider value={memoizedExpanderValue}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </dropdownContext.Provider>
  );
};

export const DropdownFaceContent: FC<
  PropsWithChildren & { iconClassName?: string }
> = ({ children, iconClassName = 'w-4 h-4 text-content stroke-current' }) => {
  const { IS_WEB } = useAppContext();
  const { opened, setFaceContentDimensions } = useDropdownContext();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (IS_WEB && ref.current) {
      setFaceContentDimensions({
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      });
    }
  }, [IS_WEB, setFaceContentDimensions]);

  return (
    <div ref={ref} className="flex items-center gap-x-3" role="presentation">
      {children}
      <ArrowDown
        className={clsx(
          iconClassName,
          'transition duration-300',
          opened && 'rotate-180'
        )}
      />
    </div>
  );
};

type DropdownBodyContentProps = {
  topMargin?: number;
  position?: 'left' | 'right' | 'center';
  customWidth?: number;
} & PropsWithChildren;

export const DropdownBodyContent: FC<DropdownBodyContentProps> = ({
  children,
  customWidth,
  position = 'left',
  topMargin = 0,
}) => {
  const {
    opened,
    faceContentDimensions: { width, height },
  } = useDropdownContext();

  return (
    <div
      style={{
        top: height + topMargin,
        width: customWidth ? customWidth : width,
      }}
      className={clsx(
        position === 'left' && 'left-0',
        position === 'center' && '-translate-x-1/2 left-1/2',
        position === 'right' && 'right-0',
        'transition duration-300 ease-in-out',

        styles.dropdownData,
        opened && styles.opened
      )}
    >
      <div className="border border-divider overflow-hidden rounded-xl bg-background">
        {children}
      </div>
    </div>
  );
};

export const ClickableDropdownArea: FC<PropsWithChildren> = ({ children }) => {
  const { toggleOpened } = useDropdownContext();

  return (
    <div role="presentation" className="cursor-pointer" onClick={toggleOpened}>
      {children}
    </div>
  );
};

const useDropdownContext = () => {
  const context = useContext(dropdownContext);

  if (!context) {
    throw new Error(
      'useDropdownContext must be used within Customdropdown provider!'
    );
  }

  return context;
};
