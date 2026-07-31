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
  | "check"
  | "grid"
  | "list"
  | "loading"
  | "lock"
  | "lock-open"
  | "radio"
  | "refund"
  | "search"
  | "trash"
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
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  check: <path d="m7 12 3 3 7-7" />,
  grid: (
    <>
      <rect x="5" y="5" width="5" height="5" rx="0.5" />
      <rect x="14" y="5" width="5" height="5" rx="0.5" />
      <rect x="5" y="14" width="5" height="5" rx="0.5" />
      <rect x="14" y="14" width="5" height="5" rx="0.5" />
    </>
  ),
  list: (
    <>
      <path d="M10 7h9" />
      <path d="M10 12h9" />
      <path d="M10 17h9" />
      <circle cx="6" cy="7" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="6" cy="17" r="0.75" fill="currentColor" stroke="none" />
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
  refund: (
    <path
      d="M4.5 14.5 0.5 10.5l4-4M0.5 10.5h13c2.761 0 5-2.239 5-5s-2.239-5-5-5h-5"
      transform="translate(2.5 4.5)"
    />
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4 4" />
    </>
  ),
  trash: (
      <path
        d="M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20"
        stroke="#808080"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
  ),
  "trending-down": (
    <>
      <path d="M12 12L15.33333 8H8.66667L12 12Z" fill="#EF4444" />
    </>
  ),
  "trending-up": (
    <>
      <path d="M12 8L8.66667 12H15.33333L12 8Z" fill="#22A55B" />
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
