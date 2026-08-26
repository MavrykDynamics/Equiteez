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
  | "close"
  | "copy"
  | "heart"
  | "grid"
  | "image"
  | "list"
  | "loading"
  | "lock"
  | "lock-open"
  | "radio"
  | "refund"
  | "search"
  | "sort"
  | "star"
  | "trash"
  | "trending-down"
  | "trending-up"
  | "upload"
  | "web";

export type RIconSize = "small" | "medium";
export type RIconSortDirection = "ascending" | "descending";

export type RIconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: RIconName;
  size?: RIconSize;
  sortDirection?: RIconSortDirection;
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
  close: (
    <path
      d="M12.5 12.5 6.5 6.5M6.5 6.5.5.5M6.5 6.5 12.5.5M6.5 6.5.5 12.5"
      transform="translate(5.5 5.5)"
    />
  ),
  copy: (
    <path
      d="M4.5 4.5V2.633c0-.746 0-1.12.145-1.405A2 2 0 0 1 5.228.645C5.513.5 5.887.5 6.633.5h3.734c.746 0 1.12 0 1.405.145a2 2 0 0 1 .583.583c.145.285.145.658.145 1.405v3.734c0 .746 0 1.12-.145 1.405a2 2 0 0 1-.583.583C11.487 8.5 11.114 8.5 10.369 8.5H8.5m0 0V6.631c0-.745 0-1.118-.145-1.403a2 2 0 0 0-.583-.583C7.487 4.5 7.114 4.5 6.367 4.5H2.633c-.746 0-1.12 0-1.405.145a2 2 0 0 0-.583.583C.5 5.513.5 5.887.5 6.633v3.734c0 .746 0 1.12.145 1.405a2 2 0 0 0 .583.583c.285.145.658.145 1.403.145h3.738c.745 0 1.118 0 1.403-.145a2 2 0 0 0 .583-.583C8.5 11.487 8.5 11.114 8.5 10.369V8.5Z"
      transform="translate(5.5 5.5)"
    />
  ),
  heart: (
    <path
      d="M6.5 2.60283C5.16667-.526792.5-.193458.5 3.80656c0 4 6 7.33344 6 7.33344s6-3.33342 6-7.33344c0-4-4.66667-4.33335-6-1.20373Z"
      transform="translate(5.5 6.18)"
    />
  ),
  grid: (
    <>
      <path d="M4.152 15.234C4 15.602 4 16.068 4 17s0 1.398.152 1.766a3 3 0 0 0 1.082 1.082C5.602 20 6.068 20 7 20s1.398 0 1.766-.152a3 3 0 0 0 1.082-1.082C10 18.398 10 17.932 10 17s0-1.398-.152-1.766a3 3 0 0 0-1.082-1.082C8.398 14 7.932 14 7 14s-1.398 0-1.766.152a3 3 0 0 0-1.082 1.082Z" />
      <path d="M14.152 5.234C14 5.602 14 6.068 14 7s0 1.398.152 1.766a3 3 0 0 0 1.082 1.082C15.602 10 16.068 10 17 10s1.398 0 1.766-.152a3 3 0 0 0 1.082-1.082C20 8.398 20 7.932 20 7s0-1.398-.152-1.766a3 3 0 0 0-1.082-1.082C18.398 4 17.932 4 17 4s-1.398 0-1.766.152a3 3 0 0 0-1.082 1.082Z" />
      <path d="M4.152 5.234C4 5.602 4 6.068 4 7s0 1.398.152 1.766a3 3 0 0 0 1.082 1.082C5.602 10 6.068 10 7 10s1.398 0 1.766-.152a3 3 0 0 0 1.082-1.082C10 8.398 10 7.932 10 7s0-1.398-.152-1.766a3 3 0 0 0-1.082-1.082C8.398 4 7.932 4 7 4s-1.398 0-1.766.152a3 3 0 0 0-1.082 1.082Z" />
      <path d="M14.152 15.234C14 15.602 14 16.068 14 17s0 1.398.152 1.766a3 3 0 0 0 1.082 1.082C15.602 20 16.068 20 17 20s1.398 0 1.766-.152a3 3 0 0 0 1.082-1.082C20 18.398 20 17.932 20 17s0-1.398-.152-1.766a3 3 0 0 0-1.082-1.082C18.398 14 17.932 14 17 14s-1.398 0-1.766.152a3 3 0 0 0-1.082 1.082Z" />
    </>
  ),
  image: (
    <>
      <path d="M3 17V7.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C4.52 4 5.08 4 6.2 4h11.6c1.12 0 1.68 0 2.108.218.376.192.682.498.874.874.218.428.218.988.218 2.108V16.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 20 18.92 20 17.8 20H6.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 18.48 3 17.92 3 17Z" />
      <path d="m3 17 4.768-5.563c.423-.493.635-.74.887-.83a1 1 0 0 1 .68.005c.25.093.459.343.876.843l2.672 3.205c.386.463.58.696.815.79a1 1 0 0 0 .652.028c.244-.072.459-.287.888-.717l.497-.497c.438-.438.657-.657.905-.729a1 1 0 0 1 .659.037c.238.098.431.339.818.822L21 18" />
      <circle cx="15" cy="9" r="1" />
    </>
  ),
  list: (
    <>
      <path d="M5 17h14" />
      <path d="M5 12h14" />
      <path d="M5 7h14" />
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
  sort: (
    <>
      <path
        d="M3.33337 10.6666L5.33337 12.6666L7.33337 10.6666M5.33337 12.6666V3.33325"
        data-sort-direction="descending"
      />
      <path
        d="M12.6667 5.33325L10.6667 3.33325L8.66671 5.33325M10.6667 3.33325V12.6666"
        data-sort-direction="ascending"
      />
    </>
  ),
  star: (
    <path
      d="M1.55664 6.89118C1.34781 6.69806 1.46125 6.34893 1.74371 6.31544L5.74609 5.84071C5.86122 5.82706 5.96121 5.75477 6.00977 5.6495L7.69792 1.98964C7.81705 1.73135 8.18425 1.7313 8.30339 1.98959L9.99154 5.64942C10.0401 5.75469 10.1394 5.82718 10.2546 5.84083L14.2572 6.31544C14.5396 6.34893 14.6527 6.69816 14.4439 6.89128L11.4852 9.62794C11.4001 9.70665 11.3622 9.8238 11.3848 9.93751L12.17 13.8906C12.2254 14.1696 11.9285 14.3858 11.6803 14.2469L8.16343 12.2777C8.06227 12.2211 7.93938 12.2214 7.83822 12.278L4.32096 14.2464C4.07275 14.3853 3.77529 14.1696 3.83073 13.8906L4.6161 9.93776C4.63869 9.82405 4.60089 9.70662 4.51578 9.62792L1.55664 6.89118Z"
      transform="scale(1.5)"
    />
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
  upload: (
    <>
      <path
        d="M7.83333 2.5 5.83333.5 3.83333 2.5M5.83333.5v6.66667M2.50015 5.16667c-.62125 0-.93188 0-1.17691.10149a2 2 0 0 0-.721746.72175C.500001 6.23494.500001 6.54541.500001 7.16667v3.2c0 .7467 0 1.1198.145324 1.405a2 2 0 0 0 .582545.5831c.28493.1452.65813.1452 1.4034.1452h6.40445c.74528 0 1.118 0 1.40288-.1452a2 2 0 0 0 .5829-.5831c.1452-.2849.1452-.6577.1452-1.403v-3.202c0-.62126 0-.93173-.1016-1.17676a2 2 0 0 0-.7215-.7215c-.245-.1015-.5556-.1015-1.1768-.1015"
        transform="translate(6.16665 5.5)"
      />
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
  sortDirection,
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
      data-sort-direction={name === "sort" ? sortDirection : undefined}
      data-sort-icon={name === "sort" || undefined}
      role={title ? "img" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={name === "sort" ? 1 : 1.5}
      viewBox={name === "sort" ? "0 0 16 16" : "0 0 24 24"}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {rIconPaths[name]}
    </svg>
  );
}
