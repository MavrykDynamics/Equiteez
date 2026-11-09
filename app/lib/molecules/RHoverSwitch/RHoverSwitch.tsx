import {
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";

import styles from "./RHoverSwitch.module.css";

export type RHoverSwitchOption<T extends string> = {
  id: T;
  label: string;
};

export type RHoverSwitchProps<T extends string> = {
  "aria-label": string;
  align?: "left" | "right";
  className?: string;
  onChange: (id: T) => void;
  // Two options: clicking the trigger flips to the other one
  options: readonly [RHoverSwitchOption<T>, RHoverSwitchOption<T>];
  value: T;
};

// Delay before closing, so the pointer can cross the gap between the
// trigger and the menu without closing it
const CLOSE_DELAY_MS = 100;
// Matches the menuExit animation in RHoverSwitch.module.css
const MENU_EXIT_DURATION_MS = 120;

/**
 * Two-option switch: a mouse hover opens the menu with both options, and a
 * click on the trigger flips straight to the other option. Touch and keyboard
 * users flip with the trigger.
 */
export function RHoverSwitch<T extends string>({
  "aria-label": ariaLabel,
  align = "right",
  className,
  onChange,
  options,
  value,
}: RHoverSwitchProps<T>) {
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  // The menu stays mounted for the exit animation after it closes
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const unmountTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const selectedOption =
    options.find((option) => option.id === value) ?? options[0];
  const otherOption =
    options.find((option) => option.id !== value) ?? options[1];

  const close = useCallback(() => {
    clearTimeout(closeTimeoutRef.current);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    clearTimeout(unmountTimeoutRef.current);

    if (isOpen) {
      setIsMenuMounted(true);
    } else {
      unmountTimeoutRef.current = setTimeout(
        () => setIsMenuMounted(false),
        MENU_EXIT_DURATION_MS
      );
    }
  }, [isOpen]);

  useEffect(
    () => () => {
      clearTimeout(closeTimeoutRef.current);
      clearTimeout(unmountTimeoutRef.current);
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close, isOpen]);

  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;

    clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
  };

  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;

    clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(
      () => setIsOpen(false),
      CLOSE_DELAY_MS
    );
  };

  // The menu stays closed until the pointer leaves and comes back
  const select = (id: T) => {
    onChange(id);
    close();
  };

  return (
    <div
      className={clsx(styles.root, className)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button
        aria-controls={isMenuMounted ? menuId : undefined}
        aria-expanded={isOpen}
        aria-label={`${ariaLabel}: ${selectedOption.label}, switch to ${otherOption.label}`}
        className={styles.trigger}
        onClick={() => select(otherOption.id)}
        type="button"
      >
        <span>{selectedOption.label}</span>
        <RIcon
          className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
          name="arrow-short-down"
          size="medium"
        />
      </button>

      {isMenuMounted && (
        <div
          aria-label={ariaLabel}
          className={clsx(
            styles.menu,
            align === "left" ? styles.menuLeft : styles.menuRight,
            isOpen ? styles.menuEnter : styles.menuExit
          )}
          id={menuId}
          role="listbox"
        >
          {options.map((option) => (
            <button
              aria-selected={option.id === value}
              className={clsx(
                styles.option,
                option.id === value && styles.optionSelected
              )}
              key={option.id}
              onClick={() => select(option.id)}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
