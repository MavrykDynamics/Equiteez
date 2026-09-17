import { FC, type PropsWithChildren, useMemo } from 'react';

import useTippy, { type UseTippyOptions } from '~/lib/ui/useTippy';
/**
 * use this component only inside other "div" tags to avoit console errors
 */
export type TooltipProps = {
  content: string;
  maxWidth?: UseTippyOptions['maxWidth'];
  theme?: string;
} & PropsWithChildren;

export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  maxWidth,
  theme,
}) => {
  const tippyProps = useMemo(
    () => ({
      trigger: 'mouseenter',
      hideOnClick: false,
      content,
      animation: 'shift-away-subtle',
      maxWidth,
      theme: theme ? `equiteez ${theme}` : 'equiteez',
    }),
    [content, maxWidth, theme]
  );

  const divRef = useTippy<HTMLDivElement>(tippyProps);

  return <div ref={divRef}>{children}</div>;
};
