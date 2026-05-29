import { Link } from "@remix-run/react";
import clsx from "clsx";

import EquiteezMark from "app/assets/redesign/logo/equiteez-mark.svg?react";
import MavrykWordmark from "app/assets/redesign/logo/mavryk-wordmark.svg?react";

import styles from "./RLogo.module.css";

export type RLogoSize = "medium" | "small";
export type RLogoTone = "black" | "white";

export type RLogoProps = {
  className?: string;
  isLink?: boolean;
  size?: RLogoSize;
  tone?: RLogoTone;
};

export function RLogo({
  className,
  isLink = true,
  size = "medium",
  tone = "white",
}: RLogoProps) {
  const content = (
    <>
      <span className={styles.primaryLine}>
        <EquiteezMark className={styles.mark} aria-hidden />
        <span className={styles.wordmark}>EQUITEEZ</span>
      </span>
      <span className={styles.byline}>
        <span>by</span>
        <MavrykWordmark className={styles.mavrykWordmark} aria-hidden />
      </span>
    </>
  );

  const logoClassName = clsx(
    styles.logo,
    styles[size],
    styles[tone],
    className
  );

  if (!isLink) {
    return <div className={logoClassName}>{content}</div>;
  }

  return (
    <Link aria-label="Equiteez home" className={logoClassName} to="/">
      {content}
    </Link>
  );
}
