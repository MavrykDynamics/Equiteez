import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import type { Placement } from "tippy.js";
import useTippy, { type UseTippyOptions } from "~/lib/ui/useTippy";
import classNames from "clsx";
import styles from "./RTooltip.module.css";

export type RTooltipProps = PropsWithChildren<{
  content: string;
  placement?: Placement;
  className?: string;
  allowHTML?: boolean;
  maxWidth?: UseTippyOptions["maxWidth"];
  theme?: string;
}>;

/**
 * Redesign tooltip matching the Equiteez 2.0 Figma component.
 * Wrap an interactive or inline element; the tooltip opens on hover and focus.
 */
export function RTooltip({
  children,
  className,
  content,
  placement = "top",
  allowHTML = false,
  maxWidth,
  theme = "r-tooltip",
}: RTooltipProps) {
  const tippyProps = useMemo(
    () => ({
      allowHTML,
      animation: "shift-away-subtle",
      arrow: true,
      content,
      hideOnClick: false,
      placement,
      role: "tooltip" as const,
      theme,
      maxWidth,
      trigger: "mouseenter focus",
    }),
    [allowHTML, content, maxWidth, placement, theme]
  );
  const tooltipRef = useTippy<HTMLSpanElement>({
    ...tippyProps,
    appendTo: (reference) => reference.parentElement ?? document.body,
  });

  return (
    <span className={classNames(styles.wrapper, className)}>
      <span ref={tooltipRef}>{children}</span>
    </span>
  );
}
