import clsx from "clsx";

import styles from "./styles.module.css";
import type { RHeadingProps, RHeadingSize, RHeadingTag } from "./types";

export type { RHeadingProps } from "./types";

const tagBySize: Record<RHeadingSize, RHeadingTag> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  h7: "h6",
};

export function RHeading({
  as,
  children,
  className,
  size = "h2",
  weight = "regular",
  color = "neutral-black",
  ...props
}: RHeadingProps) {
  const Tag = as ?? tagBySize[size];

  return (
    <Tag
      {...props}
      className={clsx(
        styles.heading,
        styles[size],
        styles[weight],
        styles[color],
        className
      )}
    >
      {children}
    </Tag>
  );
}
