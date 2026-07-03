import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

import { RCard } from "~/lib/atoms/RCard";

import styles from "./RFeatureCard.module.css";

export type RFeatureCardPadding = "medium" | "large";

type RFeatureCardBaseProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  description: ReactNode;
  iconColor?: string;
  padding?: RFeatureCardPadding;
  title: ReactNode;
};

type RFeatureCardImageIconProps = {
  icon?: never;
  iconAlt?: string;
  iconSrc: string;
};

type RFeatureCardInlineIconProps = {
  icon: ReactNode;
  iconAlt?: never;
  iconSrc?: never;
};

type RFeatureCardIconStyle = CSSProperties & {
  "--r-feature-card-icon-color"?: string;
};

export type RFeatureCardProps = RFeatureCardBaseProps &
  (RFeatureCardImageIconProps | RFeatureCardInlineIconProps);

export function RFeatureCard({
  className,
  description,
  icon,
  iconAlt = "",
  iconColor,
  iconSrc,
  padding = "medium",
  title,
  ...props
}: RFeatureCardProps) {
  const iconStyle: RFeatureCardIconStyle | undefined = iconColor
    ? { "--r-feature-card-icon-color": iconColor }
    : undefined;

  if (!icon && !iconSrc) {
    throw new Error("RFeatureCard requires either `icon` or `iconSrc`.");
  }

  return (
    <RCard
      className={clsx(styles.card, styles[padding], className)}
      tone="light"
      {...props}
    >
      <span className={styles.iconBox} style={iconStyle}>
        {icon ? (
          <span className={styles.icon}>{icon}</span>
        ) : (
          <img
            alt={iconAlt}
            aria-hidden={iconAlt ? undefined : true}
            className={styles.iconImage}
            decoding="async"
            src={iconSrc}
          />
        )}
      </span>
      <div className={styles.copy}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </RCard>
  );
}
