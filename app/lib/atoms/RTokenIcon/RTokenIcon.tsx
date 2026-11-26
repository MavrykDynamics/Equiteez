import clsx from "clsx";

import styles from "./RTokenIcon.module.css";

/** small 16px, medium 24px, large 32px, xlarge 40px. */
export type RTokenIconSize = "small" | "medium" | "large" | "xlarge";

export type RTokenIconProps = {
  /** Logo URL; without one the first letter of `label` is shown. */
  src?: string;
  /** Token or network name; used for the fallback letter and colour. */
  label: string;
  size?: RTokenIconSize;
  className?: string;
};

const FALLBACK_TONES = 6;

const getTone = (label: string) =>
  [...label].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
  FALLBACK_TONES;

/** Round token/network logo with a lettered fallback; always decorative. */
export function RTokenIcon({
  src,
  label,
  size = "medium",
  className,
}: RTokenIconProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(styles.icon, styles[size], className)}
      data-tone={src ? undefined : getTone(label)}
    >
      {src ? (
        <img alt="" className={styles.image} src={src} />
      ) : (
        (label.trim()[0] ?? "?").toUpperCase()
      )}
    </span>
  );
}
