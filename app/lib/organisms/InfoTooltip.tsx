import { FC } from 'react';
import { Tooltip, TooltipProps } from '~/lib/molecules/Tooltip';
import InfoIcon from 'app/icons/info.svg?react';

type InfoTooltipProps = Pick<TooltipProps, 'content'> & {
  className?: string;
};

export const InfoTooltip: FC<InfoTooltipProps> = ({
  content,
  className = 'w-4 h-4',
}) => {
  return (
    <Tooltip content={content}>
      <InfoIcon className={className} />
    </Tooltip>
  );
};
