import clsx from "clsx";
import { FC } from "react";

export const CardWithShadow: FC<PropsWithChildren & { className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx("rounded-3xl shadow-card p-8", className)}>
      {children}
    </div>
  );
};
