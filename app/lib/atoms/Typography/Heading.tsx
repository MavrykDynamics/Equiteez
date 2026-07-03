import classNames from "clsx";
import React from "react";
import styles from "./styles.module.css";
import { TextColor } from "~/lib/atoms/Typography/Text";

type Props = {
  children: React.ReactNode;
  level: "1" | "2" | "3" | "4" | "5" | "hero";
  tagName?: string;
  color?: TextColor;
  className?: string;
};

export function Heading({
  children,
  level = "1",
  color = "sand",
  className,
  tagName,
}: Props) {
  const TagName = (
    tagName || level === "hero" ? "h1" : `h${level}`
  ) as keyof JSX.IntrinsicElements;

  return (
    <TagName
      className={classNames(
        styles[level === "hero" ? level : `h${level}`],
        styles[color],
        className
      )}
    >
      {children}
    </TagName>
  );
}
