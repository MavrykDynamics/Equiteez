import { FC, useMemo } from 'react';

import useTippy from '~/lib/ui/useTippy';

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

  return (
    <div ref={divRef} aria-label="tooltip">
      {children}
    </div>
  );
};
