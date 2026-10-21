import clsx from "clsx";
import { FC } from "react";

import InfoIcon from "app/icons/info.svg?react";
import { Tooltip, TooltipProps } from "~/lib/molecules/Tooltip";
import { RTooltip } from "~/lib/atoms/RTooltip";

type InfoTooltipProps = Pick<
  TooltipProps,
  "content" | "maxWidth" | "theme" | "allowHTML"
> & {
  className?: string;
};

export const InfoTooltip: FC<InfoTooltipProps> = ({
  content,
  allowHTML,
  className = "w-4 h-4",
  maxWidth,
  theme,
}) => {
  return (
    <RTooltip
      content={content}
      allowHTML={allowHTML}
      maxWidth={maxWidth}
      theme={theme}
    >
      <InfoIcon className={clsx("text-[#021A12]", className)} />
    </RTooltip>
  );
};
