import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ArrowDown from "app/icons/chevron-down.svg?react";

import styles from "./dropdown.module.css";
import clsx from "clsx";
import { useAppContext } from "~/providers/AppProvider/AppProvider";
import { useOutsideClick } from "~/lib/ui/use-click-outside";

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
      <div ref={ref} className={`relative ${opened ? "" : "overflow-hidden"}`}>
        {opened && withOverlay && (
          <div
            style={{ zIndex: 30 }}
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
    openedClassName?: string;
    gap?: number;
  }
> = ({
  children,
  iconClassName = "w-4 h-4 text-content stroke-current",
  gap = 3,
  openedClassName,
  className,
}) => {
  const { IS_WEB } = useAppContext();
  const { opened, setFaceContentDimensions, disabled, withOverlay } =
    useDropdownContext();

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (IS_WEB && ref.current) {
      setTimeout(() => {
        setFaceContentDimensions({
          width: ref.current!.clientWidth,
          height: ref.current!.clientHeight,
        });
      }, 50);
    }
  }, [IS_WEB, setFaceContentDimensions]);

  return (
    <button
      // role="presentation"
      ref={ref}
      className={clsx(
        className,
        `w-full text-left  outline-none flex items-center gap-x-${gap}`,
        withOverlay && opened && "relative z-10 bg-white",
        opened && openedClassName
      )}
    >
      {children}
      <ArrowDown
        className={clsx(
          iconClassName,
          disabled && "pointer-events-none opacity-50",
          "transition duration-300  relative z-10",
          opened && !disabled && "rotate-180"
        )}
      />
    </button>
  );
};

type DropdownBodyContentProps = {
  topMargin?: number;
  position?: "left" | "right" | "center";
  customWidth?: number | string;
  customHeight?: number;
  customOverflow?: string;
  maxHeight?: number;
} & PropsWithChildren;

type DropdownBodyContentItemProps = {
  onClick?: () => void | Promise<void>;
  className?: string;
} & PropsWithChildren;

export const DropdownBodyContent: FC<DropdownBodyContentProps> = ({
  children,
  customWidth,
  customHeight = "auto",
  customOverflow = "hidden",
  position = "left",
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
        overflow: customOverflow,
      }}
      className={clsx(
        position === "left" && "left-0",
        position === "center" && "-translate-x-1/2 left-1/2",
        position === "right" && "right-0",
        "transition duration-300 ease-in-out rounded-lg",

        styles.dropdownData,
        opened && styles.opened
      )}
    >
      <div
        style={{ maxHeight, height: customHeight, overflow: customOverflow }}
        className={clsx(styles.dropdownDataContent, "bg-background")}
      >
        {children}
      </div>
    </div>
  );
};

export const DropdownBodyContentItem: FC<DropdownBodyContentItemProps> = ({
  onClick,
  children,
  className,
}) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      aria-label="dropdown select item"
      onClick={onClick}
      className={clsx(styles.dropdownDataContentItem, className)}
    >
      <p className={styles.dropdownDataContentItemText}>{children}</p>
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
      "useDropdownContext must be used within Customdropdown provider!"
    );
  }

  return context;
};
