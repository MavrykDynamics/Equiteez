import clsx from "clsx";
import { FC } from "react";

type TextVariant = "body" | "bold" | "body-xs" | "caption-regular";

type TableItemProps = {
  isLast?: boolean;
  textVariant?: TextVariant;
  customBorder?: string;
  customPadding?: number;
  lastSemiBold?: boolean;
  className?: string;
} & PropsWithChildren;

const textVariants = {
  body: "text-body",
  "body-xs": "text-body-xs",
  bold: "text-buttons",
  "caption-regular": "text-caption-regular",
};

export const TableItem: FC<TableItemProps> = ({
  children,
  isLast,
  customBorder,
  className,
  customPadding = 16,
  textVariant = "body",
  lastSemiBold = true,
}) => {
  return (
    <div
      style={{
        paddingTop: customPadding,
        paddingBottom: isLast ? 0 : customPadding,
      }}
      className={clsx(
        "flex items-center justify-between w-full text-content capitalize",
        lastSemiBold && "[&>*:nth-child(2)]:font-semibold",
        textVariants[textVariant],
        !isLast &&
          clsx(customBorder ? customBorder : "border-b border-divider"),
        className
      )}
    >
      {children}
    </div>
  );
};

export const TableItemSmall: FC<
  Omit<TableItemProps, "customPadding" & "textVariant">
> = ({ children, ...rest }) => (
  <TableItem {...rest} customPadding={12} textVariant="caption-regular">
    {children}
  </TableItem>
);
