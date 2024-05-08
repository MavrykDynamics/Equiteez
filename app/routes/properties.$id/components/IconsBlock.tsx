import { FC } from 'react';
import BedIcon from 'app/assets/propertyId/icons/bed.svg?react';
import ShowerIcon from 'app/assets/propertyId/icons/shower.svg?react';
import SquareIcon from 'app/assets/propertyId/icons/square.svg?react';
import HouseIcon from 'app/assets/propertyId/icons/house.svg?react';

export const IconsBlock = () => {
  return (
    <section className="flex items-center gap-x-3">
      <SingleIconBlock Icon={BedIcon} label="2 bed" />
      <SingleIconBlock Icon={ShowerIcon} label="1 bath" />
      <SingleIconBlock Icon={SquareIcon} label="704 sqft" />
      <SingleIconBlock Icon={HouseIcon} label="2023" />
    </section>
  );
};

type SingleIconBlockProps = {
  Icon: IconSVG;
  label: string;
};

const SingleIconBlock: FC<SingleIconBlockProps> = ({ Icon, label }) => {
  return (
    <div className="px-6 py-[15px] shadow-card rounded-xl flex flex-col items-center gap-y-[2px] max-w-[82px] overflow-hidden text-nowrap">
      <Icon className="w-8 h-8" />
      <p className="text-content text-caption">{label}</p>
    </div>
  );
};
