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

import styles from "./RCustomDropdown.module.css";

type RDropdownContextValue = {
  close: () => void;
  disabled: boolean;
  menuId: string;
  opened: boolean;
  toggle: () => void;
};

const rDropdownContext = createContext<RDropdownContextValue | null>(null);

export type RCustomDropdownProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  disabled?: boolean;
};

export function RCustomDropdown({
  children,
  className,
  disabled = false,
  ...props
}: RCustomDropdownProps) {
  const [opened, setOpened] = useState(false);
  const menuId = useId();

  const close = useCallback(() => setOpened(false), []);
  const toggle = useCallback(() => {
    if (!disabled) {
      setOpened((isOpened) => !isOpened);
    }
  }, [disabled]);

  const contextValue = useMemo(
    () => ({ close, disabled, menuId, opened, toggle }),
    [close, disabled, menuId, opened, toggle]
  );
  const ref = useOutsideClick(close, !opened);

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
  const { disabled, menuId, opened, toggle } = useRDropdownContext();
  const content = children ?? placeholder;
  const isTextContent =
    typeof content === "string" || typeof content === "number";

  return (
    <button
      {...props}
      aria-controls={menuId}
      aria-expanded={opened}
      aria-haspopup="listbox"
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
};

export function RDropdownBodyContent({
  align = "left",
  children,
  className,
  ...props
}: RDropdownBodyContentProps) {
  const { disabled, menuId, opened } = useRDropdownContext();

  if (!opened || disabled) {
    return null;
  }

  return (
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
