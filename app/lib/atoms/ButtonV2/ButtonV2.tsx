import React, { JSX } from "react";

import styles from "./styles.module.css";
import { Icon } from "~/lib/atoms/Icon";
import { Text } from "~/lib/atoms/Typography/Text";
import classNames from "clsx";

export type BtnVariant =
  | "goldPrimary"
  | "goldOutlined"
  | "yellowPrimary"
  | "yellowOutlined"
  | "success"
  | "error";

type Props = {
  className?: string;
  children: React.ReactNode;
  onClick?: (
    event: React.SyntheticEvent,
    ...args: unknown[]
  ) => Promise<unknown> | void;
  type?: "button" | "submit" | "reset";
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
  position?: "left" | "right";
};

export function ButtonV2({
  onClick,
  children,
  className,
  type = "button",
  variant = "goldPrimary",
  disabled = false,
  loading = false,
  icon,
  position = "left",
}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async (e: React.SyntheticEvent) => {
    if (typeof onClick === "function") {
      const callResult = onClick(e);

      if (callResult && typeof callResult.then === "function") {
        setIsLoading(true);
        await callResult;
        setIsLoading(false);
      }
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={classNames(
        styles.button,
        classNames(styles[variant], className)
      )}
    >
      {isLoading || loading ? (
        <Icon icon="loading" className={styles.buttonLoader} />
      ) : (
        <Text weight="extraBold" className={styles.buttonText}>
          {position === "left" && icon}
          {children}
          {position === "right" && icon}
        </Text>
      )}
    </button>
  );
}
