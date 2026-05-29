import {
  type AnchorHTMLAttributes,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Link, type LinkProps } from "@remix-run/react";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";

import styles from "./RButton.module.css";

export type RButtonSize = "large" | "medium" | "small";
export type RButtonVariant = "primary" | "secondary";
export type RButtonTone = "white" | "black";

type RButtonBaseProps = {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
  size?: RButtonSize;
  tone?: RButtonTone;
  variant?: RButtonVariant;
};

export type RButtonButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "className" | "disabled" | "onClick"
> &
  RButtonBaseProps & {
    as?: "button";
    onClick?: (event: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  };

export type RButtonLinkProps = Omit<
  LinkProps,
  "children" | "className" | "to"
> &
  RButtonBaseProps & {
    as: "link";
    to: LinkProps["to"];
  };

export type RButtonAnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "className" | "href"
> &
  RButtonBaseProps & {
    as: "a";
    href: string;
  };

export type RButtonProps =
  | RButtonButtonProps
  | RButtonLinkProps
  | RButtonAnchorProps;

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

const rButtonOwnProps = [
  "as",
  "children",
  "className",
  "disabled",
  "iconLeft",
  "iconRight",
  "isLoading",
  "onClick",
  "size",
  "tone",
  "type",
  "variant",
] as const;

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof value.then === "function"
  );
}

function omitRButtonOwnProps<T extends object>(props: T) {
  const rest = { ...props } as Record<string, unknown>;

  rButtonOwnProps.forEach((propName) => {
    delete rest[propName];
  });

  return rest;
}

function RButtonContent({
  children,
  iconLeft,
  iconRight,
  isBusy,
  size,
}: Pick<
  RButtonBaseProps,
  "children" | "iconLeft" | "iconRight" | "size"
> & {
  isBusy: boolean;
}) {
  const iconSize = size === "small" ? "small" : "medium";

  return (
    <>
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
    </>
  );
}

function getRButtonClassName({
  className,
  disabled,
  iconLeft,
  iconRight,
  size,
  tone,
  variant,
}: Required<Pick<RButtonBaseProps, "disabled" | "size" | "tone" | "variant">> &
  Pick<RButtonBaseProps, "className" | "iconLeft" | "iconRight">) {
  return clsx(
    styles.button,
    styles[size],
    rButtonToneClassNames[variant][tone],
    disabled && styles.disabled,
    iconLeft && styles.hasLeftIcon,
    iconRight && styles.hasRightIcon,
    className
  );
}

export function RButton(props: RButtonProps) {
  const {
    children,
    className,
    disabled = false,
    iconLeft,
    iconRight,
    isLoading = false,
    size = "large",
    tone = "white",
    variant = "primary",
  } = props;
  const [isPending, setIsPending] = useState(false);
  const isBusy = isLoading || isPending;
  const isDisabled = disabled || isBusy;
  const buttonClassName = getRButtonClassName({
    className,
    disabled: isDisabled,
    iconLeft,
    iconRight,
    size,
    tone,
    variant,
  });
  const content = (
    <RButtonContent
      iconLeft={iconLeft}
      iconRight={iconRight}
      isBusy={isBusy}
      size={size}
    >
      {children}
    </RButtonContent>
  );

  if (props.as === "link") {
    const { onClick } = props;
    const linkProps = omitRButtonOwnProps(props) as Omit<
      LinkProps,
      "children" | "className" | "onClick"
    >;

    const handleClick: LinkProps["onClick"] = (event) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    };

    return (
      <Link
        {...linkProps}
        aria-busy={isBusy || undefined}
        aria-disabled={isDisabled || undefined}
        className={buttonClassName}
        onClick={handleClick}
        tabIndex={isDisabled ? -1 : props.tabIndex}
      >
        {content}
      </Link>
    );
  }

  if (props.as === "a") {
    const { onClick } = props;
    const anchorProps = omitRButtonOwnProps(props) as Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      "children" | "className" | "href" | "onClick"
    >;

    const handleClick: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"] = (
      event
    ) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    };

    return (
      <a
        {...anchorProps}
        aria-busy={isBusy || undefined}
        aria-disabled={isDisabled || undefined}
        className={buttonClassName}
        href={props.href}
        onClick={handleClick}
        tabIndex={isDisabled ? -1 : props.tabIndex}
      >
        {content}
      </a>
    );
  }

  const { onClick, type = "button" } = props;
  const buttonProps = omitRButtonOwnProps(props) as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className" | "disabled" | "onClick" | "type"
  >;

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
      {...buttonProps}
      aria-busy={isBusy || undefined}
      className={buttonClassName}
      disabled={isDisabled}
      onClick={handleClick}
      type={type}
    >
      {content}
    </button>
  );
}
