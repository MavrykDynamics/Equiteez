import { FC } from 'react';
import BedIcon from 'app/assets/propertyId/icons/bed.svg?react';
import ShowerIcon from 'app/assets/propertyId/icons/shower.svg?react';
import SquareIcon from 'app/assets/propertyId/icons/square.svg?react';
import HouseIcon from 'app/assets/propertyId/icons/house.svg?react';
import clsx from 'clsx';

export const IconsBlock: FC<{ small?: boolean }> = ({ small }) => {
  return (
    <section className="flex items-center gap-x-3">
      <SingleIconBlock Icon={BedIcon} label="2 bed" small={small} />
      <SingleIconBlock Icon={ShowerIcon} label="1 bath" small={small} />
      <SingleIconBlock Icon={SquareIcon} label="704 sqft" small={small} />
      <SingleIconBlock Icon={HouseIcon} label="2023" small={small} />
    </section>
  );
};

type SingleIconBlockProps = {
  Icon: IconSVG;
  label: string;
  small?: boolean;
};

const SingleIconBlock: FC<SingleIconBlockProps> = ({ Icon, label, small }) => {
  return (
    <div
      className={clsx(
        'shadow-card rounded-xl flex flex-col items-center justify-center gap-y-[2px]  overflow-hidden text-nowrap bg-white',
        'border border-gray-100',
        small ? 'w-[64px] h-[64px]' : 'w-[82px] h-[82px]'
      )}
    >
      <Icon className={clsx(small ? 'w-7 h-7' : 'w-8 h-8')} />
      <p className="text-dark-green-500 text-caption px-6">{label}</p>
    </div>
  );
};
