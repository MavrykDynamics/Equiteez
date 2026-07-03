import classNames from "clsx";
import React from "react";

import styles from "./styles.module.css";

export type TextColor =
  | "white"
  | "black"
  | "sand"
  | "lightSand"
  | "extraLightSand"
  | "green"
  | "orange"
  | "darkGreen"
  | "lightGreen"
  | "red";

export type TextSize =
  | "largeBody"
  | "body"
  | "smallBody"
  | "tinyBody"
  | "extraTinyBody";

export type TextWeight =
  | "regular"
  | "bold"
  | "semibold"
  | "medium"
  | "extraBold";

type Props = {
  children: React.ReactNode;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  customColor?: string;
  className?: string;
};

export function Text({
  children,
  size = "body",
  weight = "regular",
  color = "sand",
  className,
  customColor,
  ...props
}: Props) {
  return (
    <span
      {...props}
      className={classNames(
        styles[size],
        styles[color],
        styles[weight],
        className
      )}
      style={customColor ? { color: `var(${customColor})` } : undefined}
    >
      {children}
    </span>
  );
}
