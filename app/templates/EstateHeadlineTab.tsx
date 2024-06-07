import clsx from 'clsx';
import { FC } from 'react';

type EstateHeadlineTabProps = {
  isSecondaryEstate: boolean;
};

export const EstateHeadlineTab: FC<EstateHeadlineTabProps> = ({
  isSecondaryEstate,
}) => {
  return (
    <div
      className={clsx(
        'py-1 px-2 rounded text-body-xs font-medium',
        isSecondaryEstate
          ? 'bg-blue-opacity text-blue-dark'
          : 'bg-tabs text-green-dark'
      )}
    >
      {isSecondaryEstate ? 'Secondary Market' : 'Primary Issuance'}
    </div>
  );
};
