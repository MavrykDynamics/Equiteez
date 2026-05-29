import {
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";

import styles from "./RButton.module.css";

export type RButtonSize = "large" | "medium" | "small";
export type RButtonVariant = "primary" | "secondary";
export type RButtonTone = "white" | "black";

export type RButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  size?: RButtonSize;
  tone?: RButtonTone;
  variant?: RButtonVariant;
};

const rButtonToneClassNames: Record<
  RButtonVariant,
  Record<RButtonTone, string>
> = {
  primary: {
    white: styles.primaryWhite,
    black: styles.primaryBlack,
  },
  secondary: {
    white: styles.secondaryWhite,
    black: styles.secondaryBlack,
  },
};

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof value.then === "function"
  );
}

export function RButton({
  children,
  className,
  disabled = false,
  iconLeft,
  iconRight,
  isLoading = false,
  onClick,
  size = "large",
  tone = "white",
  type = "button",
  variant = "primary",
  ...rest
}: RButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const isBusy = isLoading || isPending;
  const iconSize = size === "small" ? "small" : "medium";

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    if (!onClick) {
      return;
    }

    let shouldResetPending = false;

    try {
      const result = onClick(event);

      if (isPromiseLike(result)) {
        shouldResetPending = true;
        setIsPending(true);
        await result;
      }
    } finally {
      if (shouldResetPending) {
        setIsPending(false);
      }
    }
  };

  return (
    <button
      aria-busy={isBusy || undefined}
      className={clsx(
        styles.button,
        styles[size],
        rButtonToneClassNames[variant][tone],
        iconLeft && styles.hasLeftIcon,
        iconRight && styles.hasRightIcon,
        className
      )}
      disabled={disabled || isBusy}
      onClick={handleClick}
      type={type}
      {...rest}
    >
      <span className={clsx(styles.content, isBusy && styles.contentHidden)}>
        {iconLeft}
        {children}
        {iconRight}
      </span>
      {isBusy ? (
        <RIcon
          aria-hidden
          className={styles.loader}
          name="loading"
          size={iconSize}
        />
      ) : null}
    </button>
  );
}
