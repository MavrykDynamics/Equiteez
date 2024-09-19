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
import ArrowDown from 'app/icons/chevron-down.svg?react';

import styles from './dropdown.module.css';
import clsx from 'clsx';
import { useAppContext } from '~/providers/AppProvider/AppProvider';
import { useOutsideClick } from '~/lib/ui/use-click-outside';

type FaceContentDimensions = {
  width: number;
  height: number;
};

type DropdownContextType = {
  opened: boolean;
  withOverlay: boolean;
  toggleOpened: () => void;
  disabled: boolean;
  setFaceContentDimensions: React.Dispatch<
    React.SetStateAction<FaceContentDimensions>
  >;
  faceContentDimensions: FaceContentDimensions;
};

const dropdownContext = createContext<DropdownContextType>(undefined!);

type CustomDropdownProps = {
  disabled?: boolean;
  withOverlay?: boolean;
} & PropsWithChildren;

export const CustomDropdown: FC<CustomDropdownProps> = ({
  children,
  disabled = false,
  withOverlay = false,
}) => {
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

  // useEffect(() => {
  //   if (withOverlay && opened) {
  //     onAfterOpen();
  //   }

  //   return () => {
  //     onAfterClose();
  //   };
  // }, [opened, withOverlay]);

  const memoizedExpanderValue = useMemo(
    () => ({
      toggleOpened,
      opened,
      disabled,
      withOverlay,
      setFaceContentDimensions,
      faceContentDimensions,
    }),
    [toggleOpened, opened, disabled, withOverlay, faceContentDimensions]
  );

  const ref = useOutsideClick(closeDropdown, !opened);

  return (
    <dropdownContext.Provider value={memoizedExpanderValue}>
      <div ref={ref} className="relative">
        {opened && withOverlay && (
          <div
            style={{ zIndex: 15 }}
            role="presentation"
            className="fixed inset-0 bg-[#00000099]"
            onClick={toggleOpened}
          />
        )}
        {children}
      </div>
    </dropdownContext.Provider>
  );
};

export const DropdownFaceContent: FC<
  PropsWithChildren & {
    iconClassName?: string;
    className?: string;
    gap?: number;
  }
> = ({
  children,
  iconClassName = 'w-4 h-4 text-content stroke-current',
  gap = 3,
  className,
}) => {
  const { IS_WEB } = useAppContext();
  const { opened, setFaceContentDimensions, disabled, withOverlay } =
    useDropdownContext();

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (IS_WEB && ref.current) {
      setFaceContentDimensions({
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      });
    }
  }, [IS_WEB, setFaceContentDimensions, ref.current]);

  return (
    <button
      // role="presentation"
      ref={ref}
      className={clsx(
        className,
        `w-full text-left  outline-none flex items-center gap-x-${gap}`,
        withOverlay && opened && 'bg-white relative z-10'
      )}
    >
      {children}
      <ArrowDown
        className={clsx(
          iconClassName,
          disabled && 'pointer-events-none opacity-50',
          'transition duration-300',
          opened && !disabled && 'rotate-180'
        )}
      />
    </button>
  );
};

type DropdownBodyContentProps = {
  topMargin?: number;
  position?: 'left' | 'right' | 'center';
  customWidth?: number;
  customHeight?: number;
  maxHeight?: number;
} & PropsWithChildren;

export const DropdownBodyContent: FC<DropdownBodyContentProps> = ({
  children,
  customWidth,
  customHeight = 'auto',
  position = 'left',
  topMargin = 0,
  maxHeight = 700,
}) => {
  const {
    opened,
    disabled,
    faceContentDimensions: { width, height },
  } = useDropdownContext();

  return disabled ? null : (
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
      <div
        style={{ maxHeight, height: customHeight }}
        className="border border-divider overflow-hidden rounded-xl bg-background overflow-y-scroll min-w-full relative z-10"
      >
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
