import clsx from "clsx";
import { FC, PropsWithChildren } from "react";

type EstateHeadlineTabProps = {
  isSecondaryEstate: boolean;
};

export const HeadlineTabBadge: FC<
  PropsWithChildren & { className?: string }
> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "py-1 px-2 rounded text-body-xs font-medium capitalize",
        className
      )}
    >
      {children}
    </div>
  );
};

export const EstateHeadlineTab: FC<EstateHeadlineTabProps> = ({
  isSecondaryEstate,
}) => {
  return (
    <HeadlineTabBadge
      className={clsx(
        isSecondaryEstate
          ? "bg-blue-opacity text-blue-950"
          : "bg-[#AACFB5] text-green-950"
      )}
    >
      {isSecondaryEstate ? "Secondary Market" : "Primary Issuance"}
    </HeadlineTabBadge>
  );
};
