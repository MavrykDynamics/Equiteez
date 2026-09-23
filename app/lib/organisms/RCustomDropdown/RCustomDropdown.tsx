import {
  createContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useOutsideClick } from "~/lib/ui/use-click-outside";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import styles from "./RCustomDropdown.module.css";

type RDropdownContextValue = {
  close: () => void;
  disabled: boolean;
  menuId: string;
  opened: boolean;
  presentation: "dropdown" | "sheet";
  toggle: () => void;
};

const rDropdownContext = createContext<RDropdownContextValue | null>(null);

export type RCustomDropdownProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  disabled?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  presentation?: "dropdown" | "sheet";
};

export function RCustomDropdown({
  children,
  className,
  disabled = false,
  isOpen,
  onOpenChange,
  presentation = "dropdown",
  ...props
}: RCustomDropdownProps) {
  const [internalOpened, setInternalOpened] = useState(false);
  const opened = isOpen ?? internalOpened;
  const menuId = useId();

  const setOpened = useCallback(
    (nextOpened: boolean) => {
      if (isOpen === undefined) setInternalOpened(nextOpened);
      onOpenChange?.(nextOpened);
    },
    [isOpen, onOpenChange]
  );
  const close = useCallback(() => setOpened(false), [setOpened]);
  const toggle = useCallback(() => {
    if (!disabled) {
      setOpened(!opened);
    }
  }, [disabled, opened, setOpened]);

  const contextValue = useMemo(
    () => ({ close, disabled, menuId, opened, presentation, toggle }),
    [close, disabled, menuId, opened, presentation, toggle]
  );
  const ref = useOutsideClick(close, !opened || presentation === "sheet");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    if (opened) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close, opened]);

  return (
    <rDropdownContext.Provider value={contextValue}>
      <div {...props} className={clsx(styles.root, className)} ref={ref}>
        {children}
      </div>
    </rDropdownContext.Provider>
  );
}

export type RDropdownFaceContentProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled" | "type"
> & {
  children?: ReactNode;
  placeholder?: string;
};

export function RDropdownFaceContent({
  children,
  className,
  placeholder,
  ...props
}: RDropdownFaceContentProps) {
  const { disabled, menuId, opened, presentation, toggle } =
    useRDropdownContext();
  const content = children ?? placeholder;
  const isTextContent =
    typeof content === "string" || typeof content === "number";

  return (
    <button
      {...props}
      aria-controls={presentation === "sheet" ? `${menuId}-sheet` : menuId}
      aria-expanded={opened}
      aria-haspopup={presentation === "sheet" ? "dialog" : "listbox"}
      className={clsx(styles.trigger, opened && styles.triggerOpen, className)}
      disabled={disabled}
      onClick={toggle}
      type="button"
    >
      {isTextContent ? (
        <RText
          color={children ? "neutral-black" : "neutral-500"}
          size="body-sm"
        >
          {content}
        </RText>
      ) : (
        content
      )}
      <RIcon
        name={opened ? "arrow-short-up" : "arrow-short-down"}
        size="medium"
      />
    </button>
  );
}

export type RDropdownBodyContentProps = HTMLAttributes<HTMLDivElement> & {
  align?: "left" | "right";
  children: ReactNode;
  sheetClassName?: string;
};

export function RDropdownBodyContent({
  align = "left",
  children,
  className,
  sheetClassName,
  ...props
}: RDropdownBodyContentProps) {
  const { close, disabled, menuId, opened, presentation } =
    useRDropdownContext();

  if (disabled || (!opened && presentation === "dropdown")) {
    return null;
  }

  const content = (
    <div
      {...props}
      className={clsx(
        styles.menu,
        styles[`menu${align === "left" ? "Left" : "Right"}`],
        className
      )}
      id={menuId}
      role="listbox"
    >
      {children}
    </div>
  );

  return presentation === "sheet" ? (
    <CustomPopup
      className={sheetClassName}
      contentLabel={props["aria-label"] ?? "Select an option"}
      contentPosition="bottom"
      id={`${menuId}-sheet`}
      isOpen={opened}
      onRequestClose={close}
    >
      {content}
    </CustomPopup>
  ) : (
    content
  );
}

export type RDropdownBodyContentItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  children: ReactNode;
  isSelected?: boolean;
};

export function RDropdownBodyContentItem({
  children,
  className,
  isSelected = false,
  onClick,
  ...props
}: RDropdownBodyContentItemProps) {
  const { close } = useRDropdownContext();

  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"] = (
    event
  ) => {
    onClick?.(event);
    close();
  };

  return (
    <button
      {...props}
      aria-selected={isSelected}
      className={clsx(
        styles.option,
        isSelected && styles.optionSelected,
        className
      )}
      onClick={handleClick}
      role="option"
      type="button"
    >
      <RText size="body-sm">{children}</RText>
    </button>
  );
}

function useRDropdownContext() {
  const context = useContext(rDropdownContext);

  if (!context) {
    throw new Error(
      "RCustomDropdown components must be used within RCustomDropdown."
    );
  }

  return context;
}
