import clsx from "clsx";
import { FC } from "react";

import InfoIcon from "app/icons/info.svg?react";
import { Tooltip, TooltipProps } from "~/lib/molecules/Tooltip";

type InfoTooltipProps = Pick<TooltipProps, "content" | "maxWidth" | "theme"> & {
  className?: string;
};

export const InfoTooltip: FC<InfoTooltipProps> = ({
  content,
  className = "w-4 h-4",
  maxWidth,
  theme,
}) => {
  return (
    <Tooltip content={content} maxWidth={maxWidth} theme={theme}>
      <InfoIcon className={clsx("text-[#021A12]", className)} />
    </Tooltip>
  );
};
