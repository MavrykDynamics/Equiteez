import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import type { Placement } from "tippy.js";

import useTippy from "~/lib/ui/useTippy";

import "./RTooltip.module.css";

export type RTooltipProps = PropsWithChildren<{
  content: string;
  placement?: Placement;
  className?: string;
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
}: RTooltipProps) {
  const tippyProps = useMemo(
    () => ({
      allowHTML: false,
      animation: "shift-away-subtle",
      arrow: true,
      content,
      hideOnClick: false,
      placement,
      role: "tooltip" as const,
      theme: "r-tooltip",
      trigger: "mouseenter focus",
    }),
    [content, placement]
  );
  const tooltipRef = useTippy<HTMLSpanElement>(tippyProps);

  return (
    <span ref={tooltipRef} className={className}>
      {children}
    </span>
  );
}
