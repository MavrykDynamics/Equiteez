import clsx from "clsx";
import { FC } from "react";

import InfoIcon from "app/icons/info.svg?react";
import { TooltipProps } from "~/lib/molecules/Tooltip";
import { RTooltip } from "~/lib/atoms/RTooltip";

import styles from "./InfoTooltip.module.css";

type InfoTooltipProps = Pick<
  TooltipProps,
  "content" | "maxWidth" | "theme" | "allowHTML"
> & {
  className?: string;
  /** Renders the icon as a focusable button so keyboard users can open it. */
  label?: string;
};

export const InfoTooltip: FC<InfoTooltipProps> = ({
  content,
  allowHTML,
  className = "w-4 h-4",
  label,
  maxWidth,
  theme,
}) => {
  const icon = (
    <InfoIcon
      aria-hidden={label ? true : undefined}
      className={clsx("text-[#021A12]", className)}
    />
  );

  return (
    <RTooltip
      className={styles.wrapper}
      content={content}
      allowHTML={allowHTML}
      maxWidth={maxWidth}
      theme={theme}
    >
      {label ? (
        <button aria-label={label} className={styles.button} type="button">
          {icon}
        </button>
      ) : (
        icon
      )}
    </RTooltip>
  );
};
