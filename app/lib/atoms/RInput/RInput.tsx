import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

import { RIcon, type RIconName, type RIconSize } from "~/lib/atoms/RIcon";

import styles from "./RInput.module.css";

export type RInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  icon?: RIconName;
  iconSize?: RIconSize;
  inputClassName?: string;
};

export function RInput({
  className,
  icon,
  iconSize = "medium",
  inputClassName,
  type = "text",
  ...props
}: RInputProps) {
  return (
    <div className={clsx(styles.field, className)}>
      {icon ? <RIcon name={icon} size={iconSize} /> : null}
      <input
        {...props}
        className={clsx(styles.input, inputClassName)}
        type={type}
      />
    </div>
  );
}
