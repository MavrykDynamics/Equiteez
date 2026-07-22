import type { HTMLAttributes, ReactNode } from "react";

export type RTypographyColor =
  | "neutral-black"
  | "neutral-900"
  | "neutral-800"
  | "neutral-700"
  | "neutral-600"
  | "neutral-500"
  | "neutral-400"
  | "neutral-300"
  | "neutral-200"
  | "neutral-100"
  | "neutral-50"
  | "neutral-white"
  | "accent-green-950"
  | "accent-green-900"
  | "accent-green-800"
  | "accent-green-700"
  | "accent-green-600"
  | "accent-green-500"
  | "accent-green-400"
  | "accent-green-300"
  | "accent-green-200"
  | "accent-green-100"
  | "accent-green-50"
  | "blue-900"
  | "blue-800"
  | "blue-700"
  | "blue-600"
  | "blue-500"
  | "blue-400"
  | "blue-300"
  | "blue-200"
  | "blue-100"
  | "green-900"
  | "green-800"
  | "green-700"
  | "green-600"
  | "green-500"
  | "green-400"
  | "green-300"
  | "green-200"
  | "green-100"
  | "yellow-900"
  | "yellow-800"
  | "yellow-700"
  | "yellow-600"
  | "yellow-500"
  | "yellow-400"
  | "yellow-300"
  | "yellow-200"
  | "yellow-100"
  | "red-900"
  | "red-800"
  | "red-700"
  | "red-600"
  | "red-500"
  | "red-400"
  | "red-300"
  | "red-200"
  | "red-100"
  | "primary";

export type RTypographyWeight = "regular" | "medium";

export type RTextSize = "body-l" | "body-m" | "body-sm" | "body-s" | "body-xs";

export type RHeadingSize = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "h7";

export type RTextProps = Omit<HTMLAttributes<HTMLSpanElement>, "color"> & {
  children: ReactNode;
  size?: RTextSize;
  weight?: RTypographyWeight;
  color?: RTypographyColor;
};

export type RHeadingProps = Omit<
  HTMLAttributes<HTMLHeadingElement>,
  "color"
> & {
  children: ReactNode;
  size?: RHeadingSize;
  weight?: RTypographyWeight;
  color?: RTypographyColor;
};
