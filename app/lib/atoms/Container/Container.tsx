import clsx from "clsx";
import { FC } from "react";
import styles from "./Container.module.css";

type ContainerProps = {
  maxWidth?: number;
  px?: number;
  className?: string;
} & PropsWithChildren;

export const Container: FC<ContainerProps> = ({
  maxWidth = 1440,
  children,
  className,
}) => {
  return (
    <div
      style={{ maxWidth }}
      className={clsx("mx-auto w-full", styles.container, className)}
    >
      {children}
    </div>
  );
};
