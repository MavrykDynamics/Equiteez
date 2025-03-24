import { FC, useMemo } from "react";
import WarningIcon from "app/icons/info-alert.svg?react";
import ErrorIcon from "app/icons/error.svg?react";
import clsx from "clsx";

type AlertProps = {
  type: "warning" | "error";
  header: string;
  size?: "regular" | "small";
} & PropsWithChildren;

const alertSize = {
  regular: {
    headerSize: "text-card-headline",
    bodySize: "text-body",
  },
  small: {
    headerSize: "text-buttons",
    bodySize: "text-sm",
  },
};

const alertTypeBasedStyles = {
  warning: {
    Icon: WarningIcon,
    headerColor: "text-sand-900",
    bodyColor: "text-sand-700",
    bgColor: "bg-[#FFF0DA]",
  },
  error: {
    Icon: ErrorIcon,
    headerColor: "text-sand-900",
    bodyColor: "text-sand-700",
    bgColor: "bg-[#DB050540]",
  },
};

export const Alert: FC<AlertProps> = ({
  type = "warning",
  size = "regular",
  header,
  children,
}) => {
  const { Icon, headerColor, bodyColor, bgColor } = useMemo(
    () => alertTypeBasedStyles[type],
    [type]
  );

  const { headerSize, bodySize } = useMemo(() => alertSize[size], [size]);

  return (
    <section
      className={clsx(
        "p-6 rounded-2xl overflow-hidden flex items-start gap-[10px] justify-between w-full",
        bgColor
      )}
    >
      <Icon className="size-6 min-w-6" />
      <div className="flex flex-col gap-[10px]">
        <h4 className={clsx(headerSize, headerColor)}>{header}</h4>
        <p className={clsx(bodySize, bodyColor)}>{children}</p>
      </div>
    </section>
  );
};
