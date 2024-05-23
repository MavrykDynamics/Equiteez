import { FC, useMemo } from 'react';

import useTippy from '~/lib/ui/useTippy';
/**
 * use this component only inside other "div" tags to avoit console errors
 */
export type TooltipProps = {
  content: string;
} & PropsWithChildren;

export const Tooltip: FC<TooltipProps> = ({ content, children }) => {
  const tippyProps = useMemo(
    () => ({
      trigger: 'mouseenter',
      hideOnClick: false,
      content,
      animation: 'shift-away-subtle',
    }),
    [content]
  );

  const divRef = useTippy<HTMLDivElement>(tippyProps);

  return <div ref={divRef}>{children}</div>;
};
