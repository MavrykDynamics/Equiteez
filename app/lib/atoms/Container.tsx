import clsx from "clsx";
import { FC } from "react";

type ContainerProps = {
  maxWidth?: number;
  px?: number;
  className?: string;
} & PropsWithChildren;

export const Container: FC<ContainerProps> = ({
  maxWidth = 1440,
  px = 0,
  children,
  className,
}) => {
  return (
    <div
      style={{ maxWidth, paddingInline: px }}
      className={clsx("mx-auto w-full", className)}
    >
      {children}
    </div>
  );
};
