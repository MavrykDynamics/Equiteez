import { useId, type ReactNode, type SVGProps } from "react";
import clsx from "clsx";

import styles from "./RIcon.module.css";

export type RIconName =
  | "arrow-short-down"
  | "arrow-short-up"
  | "arrow-short-left"
  | "arrow-short-right"
  | "arrow-long-down"
  | "arrow-long-up"
  | "arrow-long-left"
  | "arrow-long-right"
  | "arrow-long-up-right"
  | "arrow-round"
  | "burger-menu"
  | "loading"
  | "lock"
  | "lock-open"
  | "radio"
  | "trending-down"
  | "trending-up"
  | "web";

export type RIconSize = "small" | "medium";

export type RIconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: RIconName;
  size?: RIconSize;
  title?: string;
};

const rIconPaths: Record<RIconName, ReactNode> = {
  "arrow-short-down": <path d="m8 10 4 4 4-4" />,
  "arrow-short-up": <path d="m8 14 4-4 4 4" />,
  "arrow-short-left": <path d="m14 8-4 4 4 4" />,
  "arrow-short-right": <path d="m10 8 4 4-4 4" />,
  "arrow-long-down": (
    <>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </>
  ),
  "arrow-long-up": (
    <>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </>
  ),
  "arrow-long-left": (
    <>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
  "arrow-long-right": (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  "arrow-long-up-right": (
    <>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </>
  ),
  "arrow-round": (
    <>
      <path d="M17 2v5h-5" />
      <path d="M7 22v-5h5" />
      <path d="M20 11a8 8 0 0 0-13.66-5.66L4 7.68" />
      <path d="M4 13a8 8 0 0 0 13.66 5.66L20 16.32" />
    </>
  ),
  "burger-menu": (
    <>
      <path d="M5 8h14" />
      <path d="M5 16h14" />
    </>
  ),
  loading: <path d="M12 3a9 9 0 1 0 9 9" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  "lock-open": (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 7.6-1.75" />
    </>
  ),
  radio: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  "trending-down": (
    <>
      <path d="m4 8 6 6 4-4 6 6" />
      <path d="M20 10v6h-6" />
    </>
  ),
  "trending-up": (
    <>
      <path d="m4 16 6-6 4 4 6-6" />
      <path d="M14 8h6v6" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4a12 12 0 0 1 0 16" />
      <path d="M12 4a12 12 0 0 0 0 16" />
    </>
  ),
};

export function RIcon({
  name,
  size = "medium",
  title,
  className,
  ...props
}: RIconProps) {
  const titleId = useId();

  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
      className={clsx(
        styles.icon,
        styles[size],
        name === "loading" && styles.spin,
        className
      )}
      fill="none"
      focusable="false"
      role={title ? "img" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {rIconPaths[name]}
    </svg>
  );
}
