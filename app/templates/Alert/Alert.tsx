import { FC, useMemo } from "react";
import InfoIcon from "app/icons/info-alert.svg?react";
import clsx from "clsx";

type AlertProps = {
  type: "info";
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
  info: {
    Icon: InfoIcon,
    headerColor: "text-blue-950",
    bodyColor: "text-blue-950",
  },
};

export const Alert: FC<AlertProps> = ({
  type = "info",
  size = "regular",
  header,
  children,
}) => {
  const { Icon, headerColor, bodyColor } = useMemo(
    () => alertTypeBasedStyles[type],
    [type]
  );

  const { headerSize, bodySize } = useMemo(() => alertSize[size], [size]);

  return (
    <section className="p-6 rounded-2xl bg-[#EFF0FF] overflow-hidden flex items-start gap-[10px] justify-between w-full">
      <Icon className="size-6 min-w-6" />
      <div className="flex flex-col gap-[10px]">
        <h4 className={clsx(headerSize, headerColor)}>{header}</h4>
        <p className={clsx(bodySize, bodyColor)}>{children}</p>
      </div>
    </section>
  );
};
